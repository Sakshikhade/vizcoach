package main

import (
	"bytes"
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
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

const (
	GroupsCollection   = "groups"
	UsersCollection    = "users"
	UsernameKey        = "username"
	EmailKey           = "email"
	NameKey            = "name"
	PasswordKey        = "password"
	PasswordConfirmKey = "passwordConfirm"
	RoleKey            = "role"
	StudentRole        = "Student"
	CSVKey             = "csv"
)

type Student struct {
	Username string `csv:"username"`
	Email    string `csv:"email"`
	Name     string `csv:"name"`
}

func OnGroupBeforeCreateRequest(app *pocketbase.PocketBase, e *core.RecordCreateEvent) error {

	// Fetching the CSV file from the request
	header, err := e.HttpContext.FormFile(CSVKey)
	if err != nil {
		app.Logger().Error(err.Error())
		return apis.NewBadRequestError("Unable to retreive csv from request!", nil)
	}

	// Opening the CSV file
	file, err := header.Open()
	if err != nil {
		app.Logger().Error(err.Error())
		return apis.NewBadRequestError("Unable to open csv file!", nil)
	}
	defer file.Close()

	// Copying bytes from the file to a buffer
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, file); err != nil {
		app.Logger().Error(err.Error())
		return apis.NewBadRequestError("Unable to read csv file!", nil)
	}

	// Unmarshalling CSV bytes to students slice
	students := []*Student{}
	if err := gocsv.UnmarshalBytes(buf.Bytes(), &students); err != nil {
		app.Logger().Error(err.Error())
		return apis.NewBadRequestError("Unable to parse the csv file!", nil)
	}

	// Loading users collection from name
	users, err := app.Dao().FindCollectionByNameOrId(UsersCollection)
	if err != nil {
		app.Logger().Error(err.Error())
		return apis.NewApiError(500, fmt.Sprintf("Unable to load %q collection!", UsersCollection), nil)
	}

	// Submitting user creation request for validation
	for _, student := range students {
		record := models.NewRecord(users)
		form := forms.NewRecordUpsert(app, record)

		password := uuid.New()
		form.LoadData(map[string]any{
			UsernameKey:        student.Username,
			EmailKey:           student.Email,
			NameKey:            student.Name,
			PasswordKey:        password,
			PasswordConfirmKey: password,
			RoleKey:            StudentRole,
		})

		if err := form.Submit(); err != nil {
			app.Logger().Error(err.Error())
			return apis.NewBadRequestError(fmt.Sprintf("Unable to save student record for %q!", student.Username), nil)
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

	// Adding hook to users when creating student groups.
	// We want to add users from the csv file uploaded with this record.
	app.OnRecordBeforeCreateRequest(GroupsCollection).Add(func(e *core.RecordCreateEvent) error {
		return OnGroupBeforeCreateRequest(app, e)
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
