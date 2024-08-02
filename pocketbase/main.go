package main

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/gocarina/gocsv"
	"github.com/google/uuid"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/mails"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

const (
	GroupsCollection     = "groups"
	UsersCollection      = "users"
	UserGroupsCollection = "usergroups"
	UsernameKey          = "username"
	EmailKey             = "email"
	NameKey              = "name"
	PasswordKey          = "password"
	PasswordConfirmKey   = "passwordConfirm"
	RoleKey              = "role"
	StudentRole          = "Student"
	CSVKey               = "csv"
	UserIdKey            = "userId"
	GroupIdKey           = "groupId"
)

type Student struct {
	Username string `csv:"username"`
	Email    string `csv:"email"`
	Name     string `csv:"name"`
}

func GetStudents(app *pocketbase.PocketBase, e *core.RecordCreateEvent) ([]*Student, error) {
	// Fetching the CSV file from the request
	header, err := e.HttpContext.FormFile(CSVKey)
	if err != nil {
		app.Logger().Error(err.Error())
		return nil, errors.New("unable to retreive csv from request")
	}

	// Opening the CSV file
	file, err := header.Open()
	if err != nil {
		app.Logger().Error(err.Error())
		return nil, errors.New("unable to open csv file")
	}
	defer file.Close()

	// Copying bytes from the file to a buffer
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, file); err != nil {
		app.Logger().Error(err.Error())
		return nil, errors.New("unable to read bytes from the csv file")
	}

	// Unmarshalling CSV bytes to students slice
	students := []*Student{}
	if err := gocsv.UnmarshalBytes(buf.Bytes(), &students); err != nil {
		app.Logger().Error(err.Error())
		return nil, errors.New("unable to unmarshall bytes from the csv file")
	}

	return students, nil
}

func CreateStudentAccount(app *pocketbase.PocketBase, student *Student) error {

	// Loading users collection from name
	users, err := app.Dao().FindCollectionByNameOrId(UsersCollection)
	if err != nil {
		app.Logger().Error(err.Error())
		return apis.NewApiError(500, fmt.Sprintf("Unable to load %q collection", UsersCollection), nil)
	}

	// Creating new record form
	record := models.NewRecord(users)
	form := forms.NewRecordUpsert(app, record)

	// Setting default password as UUID
	password := uuid.New()
	form.LoadData(map[string]any{
		UsernameKey:        student.Username,
		EmailKey:           student.Email,
		NameKey:            student.Name,
		PasswordKey:        password,
		PasswordConfirmKey: password,
		RoleKey:            StudentRole,
	})

	// Creating student's account
	if err := form.Submit(); err != nil {
		app.Logger().Error(err.Error())
		return apis.NewBadRequestError(fmt.Sprintf("Unable to save student record for %q", student.Username), nil)
	}

	app.Logger().Debug(fmt.Sprintf("Created account for %q", student.Email))
	return nil
}

func SendPasswordResetEmail(app *pocketbase.PocketBase, student *Student) error {

	// Checking if SMTP is enabled
	if !app.Settings().Smtp.Enabled {
		return errors.New("SMTP is disabled in the settings")
	}

	// Loading auth record from database using student's email
	record, err := app.Dao().FindAuthRecordByEmail(UsersCollection, student.Email)
	if err != nil {
		return err
	}

	// Sending password reset email to student
	if err := mails.SendRecordPasswordReset(app, record); err != nil {
		return err
	}

	app.Logger().Debug(fmt.Sprintf("Sent password reset email to %q", student.Email))
	return nil
}

func OnGroupBeforeCreateRequest(app *pocketbase.PocketBase, e *core.RecordCreateEvent) error {

	// Loading students from request
	students, err := GetStudents(app, e)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	for _, student := range students {
		// Creating student account
		if err := CreateStudentAccount(app, student); err != nil {
			return err
		}
	}

	return nil
}

func CreateStudentGroupLink(app *pocketbase.PocketBase, e *core.RecordCreateEvent, student *Student) error {

	// Fetching records to link
	groupId := e.Record.Id
	studentAuthRecord, err := app.Dao().FindAuthRecordByEmail(UsersCollection, student.Email)
	if err != nil {
		return err
	}

	// Loading usergroups collection from name
	collection, err := app.Dao().FindCollectionByNameOrId(UserGroupsCollection)
	if err != nil {
		app.Logger().Error(err.Error())
		return apis.NewApiError(500, fmt.Sprintf("Unable to load %q collection", UserGroupsCollection), nil)
	}

	// Creating new record form
	record := models.NewRecord(collection)
	form := forms.NewRecordUpsert(app, record)

	form.LoadData(map[string]any{
		UserIdKey:  studentAuthRecord.Id,
		GroupIdKey: groupId,
	})

	// Creating student group link
	if err := form.Submit(); err != nil {
		app.Logger().Error(err.Error())
		return apis.NewBadRequestError(fmt.Sprintf("Unable to save link record for %q", student.Username), nil)
	}

	app.Logger().Debug(fmt.Sprintf("Created link between %q and %q", groupId, student.Username))
	return nil
}

func OnGroupAfterCreateRequest(app *pocketbase.PocketBase, e *core.RecordCreateEvent) error {
	// Loading students from request
	students, err := GetStudents(app, e)
	if err != nil {
		return apis.NewBadRequestError(err.Error(), nil)
	}

	for _, student := range students {
		// Creating student group link
		if err := CreateStudentGroupLink(app, e, student); err != nil {
			return err
		}

		// Sending email to the student to reset the password
		if err := SendPasswordResetEmail(app, student); err != nil {
			app.Logger().Warn(fmt.Sprintf("Skipping sending email to %q. Message: %q", student.Email, err.Error()))
		}
	}

	return nil
}

func main() {
	app := pocketbase.New()

	// ----- POCKETBASE RELATED EXTENSIONS ----- //

	// Since we started with pocketbase executable, it created JS migrations.
	// JSVM plugin is required to support JS migrations and hooks for backward compatibility.
	jsvm.MustRegister(app, jsvm.Config{})

	// Enabling auto creation of migration files when making collection changes in the Admin UI.
	// This feature is enabled by default on the pocketbase executable.
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate:  true,
		TemplateLang: migratecmd.TemplateLangJS,
	})

	// Serves static files from the provided public dir (if exists)
	// This is mentioned in the documentation - no idea whether we need it or not.
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
		return nil
	})

	// ----- VIZCOACH RELATED EXTENSIONS ----- //

	// Adding hook to peform actions before saving the group.
	// Creating student accounts from the csv file uploaded with the student group record.
	app.OnRecordBeforeCreateRequest(GroupsCollection).Add(func(e *core.RecordCreateEvent) error {
		return OnGroupBeforeCreateRequest(app, e)
	})

	// Adding hook to perform actions after saving the group.
	// Creating student accounts to group links.
	app.OnRecordAfterCreateRequest(GroupsCollection).Add(func(e *core.RecordCreateEvent) error {
		return OnGroupAfterCreateRequest(app, e)
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
