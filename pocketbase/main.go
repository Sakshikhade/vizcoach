package main

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gocarina/gocsv"
	"github.com/google/uuid"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/mails"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/hook"
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
	CSVFileKey           = "csv+"
	UserIdKey            = "userId"
	GroupIdKey           = "groupId"
)

type Student struct {
	Username string `csv:"username"`
	Email    string `csv:"email"`
	Name     string `csv:"name"`
}

func CreateStudentAccount(app *pocketbase.PocketBase, student *Student) error {

	// Loading users collection from name
	users, err := app.FindCollectionByNameOrId(UsersCollection)
	if err != nil {
		app.Logger().Error(err.Error())
		return apis.NewApiError(500, fmt.Sprintf("Unable to load %q collection", UsersCollection), nil)
	}

	// If a user with the same email already exists, skip creation
	if existing, _ := app.FindAuthRecordByEmail(UsersCollection, student.Email); existing != nil {
		app.Logger().Debug(fmt.Sprintf("User with email %q already exists. Skipping create.", student.Email))
		return nil
	}

	// Creating new record form
	record := core.NewRecord(users)
	form := forms.NewRecordUpsert(app, record)

	// Setting default password as UUID string
	password := uuid.NewString()
	form.Load(map[string]any{
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
	if !app.Settings().SMTP.Enabled {
		return errors.New("SMTP is disabled in the settings")
	}

	// Loading auth record from database using student's email
	record, err := app.FindAuthRecordByEmail(UsersCollection, student.Email)
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

func OnGroupCreateRequest(app *pocketbase.PocketBase, e *core.RecordRequestEvent) error {
	err := e.Request.ParseMultipartForm(10 << 20) // Max 10 MB
	if err != nil {
		return e.BadRequestError("CSV should be less than 10 MB!", err)
	}
	header := e.Request.MultipartForm.File[CSVFileKey][0]

	// Opening the CSV file
	file, err := header.Open()
	if err != nil {
		app.Logger().Error(err.Error())
		return e.InternalServerError("Unable to open CSV file!", err)
	}
	defer file.Close()

	// Copying bytes from the file to a buffer
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, file); err != nil {
		app.Logger().Error(err.Error())
		return e.InternalServerError("Unable to read bytes from the CSV file!", err)
	}

	// Unmarshalling CSV bytes to students slice
	students := []*Student{}
	if err := gocsv.UnmarshalBytes(buf.Bytes(), &students); err != nil {
		app.Logger().Error(err.Error())
		return e.InternalServerError("Unable to unmarshall bytes from the CSV file", err)
	}

	for _, student := range students {
		// Creating student account
		if err := CreateStudentAccount(app, student); err != nil {
			return e.InternalServerError("Unable to create student's account!", err)
		}
	}

	return e.Next()
}

func CreateStudentGroupLink(app *pocketbase.PocketBase, e *core.RecordEvent, student *Student) error {

	// Fetching records to link
	groupId := e.Record.Id
	studentAuthRecord, err := app.FindAuthRecordByEmail(UsersCollection, student.Email)
	if err != nil {
		return err
	}

	// Loading usergroups collection from name
	collection, err := app.FindCollectionByNameOrId(UserGroupsCollection)
	if err != nil {
		app.Logger().Error(err.Error())
		return apis.NewApiError(500, fmt.Sprintf("Unable to load %q collection", UserGroupsCollection), nil)
	}

	// Creating new record form
	record := core.NewRecord(collection)
	form := forms.NewRecordUpsert(app, record)

	form.Load(map[string]any{
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

func OnGroupAfterCreateSuccess(app *pocketbase.PocketBase, e *core.RecordEvent) error {
	// Loading students from CSV
	csvFilePath := e.Record.BaseFilesPath() + "/" + e.Record.GetString("csv")

	// Opening file system
	fsys, err := app.NewFilesystem()
	if err != nil {
		app.Logger().Error(err.Error())
		return errors.New("Unable to open file system!")
	}
	defer fsys.Close()

	// Opening file
	file, err := fsys.GetReader(csvFilePath)
	if err != nil {
		app.Logger().Error(err.Error())
		return errors.New("Unable to read the file!")
	}
	defer file.Close()

	// Copying bytes from the file to a buffer
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, file); err != nil {
		app.Logger().Error(err.Error())
		return errors.New("unable to read bytes from the csv file")
	}

	// Unmarshalling CSV bytes to students slice
	students := []*Student{}
	if err := gocsv.UnmarshalBytes(buf.Bytes(), &students); err != nil {
		app.Logger().Error(err.Error())
		return errors.New("unable to unmarshall bytes from the csv file")
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

	return e.Next()
}

func sanitizeUsernameFromEmail(email string) string {
	localPart := email
	if at := strings.Index(email, "@"); at > 0 {
		localPart = email[:at]
	}

	var b strings.Builder
	for _, r := range localPart {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			b.WriteRune(r)
		} else {
			b.WriteRune('_')
		}
	}

	result := b.String()
	if result == "" {
		result = "user"
	}
	if len(result) > 24 {
		result = result[:24]
	}

	return fmt.Sprintf("%s_%d", result, time.Now().UnixNano()%10000)
}

func OnUserBeforeCreate(e *core.RecordEvent) error {
	record := e.Record

	username := record.GetString("username")
	if email := record.GetString("email"); email != "" && (username == "" || strings.HasPrefix(username, "oauth_")) {
		record.Set("username", sanitizeUsernameFromEmail(email))
	}

	if record.GetString("role") == "" {
		record.Set("role", StudentRole)
	}

	return e.Next()
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

	// GitHub selfupdate
	ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{})

	// static route to serves files from the provided public dir
	// (if publicDir exists and the route path is not already defined)
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			if !e.Router.HasRoute(http.MethodGet, "/{path...}") {
				e.Router.GET("/{path...}", apis.Static(os.DirFS(defaultPublicDir()), true))
			}

			return e.Next()
		},
		Priority: 999, // execute as latest as possible to allow users to provide their own route
	})

	// ----- VIZCOACH RELATED EXTENSIONS ----- //

	// Auto-fill username and role for OAuth sign-ups.
	app.OnRecordCreate(UsersCollection).BindFunc(OnUserBeforeCreate)

	// Adding hook to peform actions before saving the group.
	// Creating student accounts from the csv file uploaded with the student group record.
	app.OnRecordCreateRequest(GroupsCollection).BindFunc(func(e *core.RecordRequestEvent) error {
		return OnGroupCreateRequest(app, e)
	})

	// Adding hook to perform actions after saving the group.
	// Creating student accounts to group links.
	app.OnRecordAfterCreateSuccess(GroupsCollection).BindFunc(func(e *core.RecordEvent) error {
		return OnGroupAfterCreateSuccess(app, e)
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

// the default pb_public dir location is relative to the executable
func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// most likely ran with go run
		return "./pb_public"
	}

	return filepath.Join(os.Args[0], "../pb_public")
}
