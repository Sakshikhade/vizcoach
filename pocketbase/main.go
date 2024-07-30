package main

import (
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func OnGroupAfterCreateRequest(e *core.RecordCreateEvent) error {
	log.Println(e.Record)
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
	app.OnRecordAfterCreateRequest("groups").Add(OnGroupAfterCreateRequest)

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
