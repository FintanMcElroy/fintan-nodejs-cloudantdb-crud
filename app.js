'use strict'
const express = require('express')
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv()
const app = express()
const Log = require('log')
const log = new Log("info")
const Credentials = require('./creds/Credentials.js')
const DBUtils = require('./db/DBUtils.js')
const SSOUtils = require('./sso/SSOUtils.js')

app.use(express.static(__dirname + '/public'))

const dbUtils = new DBUtils()
const creds = new Credentials(appEnv, log)
creds.getCredentialsDB((credsDB) => {
	dbUtils.initDB(credsDB)
}) // end getCredentials() callback

let passport
creds.getCredentialsSSO((credsSSO) => {
	const ssoUtils = new SSOUtils(credsSSO)
	ssoUtils.setupSSO(app, (pass) => {
		passport = pass
	})
})

app.get('/login', passport.authenticate('openidconnect', {}))

function ensureAuthenticated(req, res, next) {
	log.info(">>> In ensureAuthenticated, req.originalUrl = " + req.originalUrl)
  if(!req.isAuthenticated()) {
      req.session.originalUrl = req.originalUrl
			log.info(">>> About to call res.redirect(/login)")
      res.redirect('/login')
  } else {
    return next()
  }
}

app.get('/fill_remove_update_names_dropdown', (req, res) => {
	log.info("app.get(/fill_remove_update_names_dropdown) called ... ")
	log.info("To fill 'Update Names' and 'Remove Names' dropdown")
	dbUtils.readNames(req.query, false, (names_list) => {
		res.contentType('application/json')
		res.send(JSON.parse(names_list))
	})
})
// Download the CSV file of the names
app.get('/download_csv', (req, res) => {
	dbUtils.getCSVFile((fileName) => {
		res.download(fileName)
	})
})
//To update the 'Read Names' list
app.get('/view_names', (req, res) => {
	dbUtils.readNames(req.query, true, (names_list) => {
		res.contentType('application/json')
		res.send(JSON.parse(names_list))
	})
})
// To test SSO - note that trying to do it with /view_names that is called from Read Names button
// does not work - it does not display the login form but reports no errors
// This separate URL is provided in order to call it directly from the browser and in that case the Login form is properly displayed
app.get('/view_names_sso', ensureAuthenticated,  (req, res) => {
	dbUtils.readNames(req.query, true, (names_list) => {
		res.contentType('application/json')
		res.send(JSON.parse(names_list))
	})
})
//to add a name into the database
app.get('/add_name', (req, res) => {
	log.info("app.get(/add_name) called ... ")
	log.info("Name to be added : = " + req.query.new_name)
	req.query.new_name = req.query.new_name.toUpperCase().trim() //convert to uppercase and trim white space before inserting

  dbUtils.addName(req.query, (name_string) => {
		res.contentType('application/json')
		res.send(JSON.parse(name_string))
	})
})
// Called to update a name into the database
app.get('/update_name', (req, res) => {
	log.info("app.get(/update_name) called ... ")
	log.info("Received : " + JSON.stringify(req.query))
	req.query.updated_new_name = req.query.updated_new_name.toUpperCase().trim()

	dbUtils.updateName(req.query, (name_string) => {
		res.contentType('application/json')
		res.send(JSON.parse(name_string))
	})
})
// to delete a name from the database
app.get('/remove_name', (req, res) => {
	log.info("app.get(/remove_name) called ... ")
	log.info("Name to be removed : = " + req.query.name_to_remove)

	dbUtils.removeName(req.query, (name_string) => {
		res.contentType('application/json')
		res.send(JSON.parse(name_string))
	})
})
// App route for the authentication callback that the identity provider calls
app.get('/auth/sso/callback', (req,res,next) => {
          let redirect_url = req.session.originalUrl
          passport.authenticate('openidconnect',{
            successRedirect: redirect_url,
            failureRedirect: '/failure'
          })(req,res,next)
})
// App route for when authentication fails
app.get('/failure', (req, res) => {
            res.send('login failed')
})

app.listen(appEnv.port, '0.0.0.0', () => {
  log.info(`server starting on ${appEnv.url}`)
})
