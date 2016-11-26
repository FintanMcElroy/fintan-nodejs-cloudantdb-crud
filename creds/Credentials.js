'use strict'

module.exports = class Credentials {
    constructor(appEnv, log) {
           this.appEnv = appEnv
           this.log = log
    }

   getCredentialsDB (cb){
     // Cloudant service credentials
     const dbServiceName = 'fintanNodeRED-cloudantNoSQLDB'
     let dbService = {}
     let log = this.log

     // Get the configuration internally defined in Bluemix
     const baseConfig = this.appEnv.getServices(dbServiceName)
     // Check in case we are running locally
     if (!baseConfig || Object.keys(baseConfig).length === 0) {
       // Get the local credentials
       this.getCredentialsLocal('./creds/db_credentials.json', (creds) => {
         dbService.credentials = creds
         log.info(`Host = ${dbService.credentials.host}`)
         log.info(`Port = ${dbService.credentials.port}`)
         log.info(`URL = ${dbService.credentials.url}`)
         log.info(`username = ${dbService.credentials.username}`)
         log.info(`password = ${dbService.credentials.password}`)
         cb(dbService.credentials)
       })
     }
     // VCAP_SERVICES stored in Bluemix
     else {
       dbService = baseConfig[dbServiceName]
       log.info(`Host = ${dbService.credentials.host}`)
       log.info(`Port = ${dbService.credentials.port}`)
       log.info(`URL = ${dbService.credentials.url}`)
       log.info(`username = ${dbService.credentials.username}`)
       log.info(`password = ${dbService.credentials.password}`)
       cb(dbService.credentials)
     }
   }

   getCredentialsOS (cb){
     // Object Storage service credentials
     const osServiceName = 'fintan-object-storage'
     let osService = {}
     let log = this.log

     // Get the configuration internally defined in Bluemix
     const baseOSConfig = this.appEnv.getServices(osServiceName)
     // Check in case we are running locally
     if (!baseOSConfig || Object.keys(baseOSConfig).length === 0) {
       // Get the local credentials
       this.getCredentialsLocal('./creds/os_credentials.json', (creds) => {
         osService.credentials = creds
         log.info(`auth_url = ${osService.credentials.auth_url}`)
         log.info(`tenantId = ${osService.credentials.projectId}`)
         log.info(`domainId = ${osService.credentials.domainId}`)
         log.info(`username = ${osService.credentials.username}`)
         log.info(`password = ${osService.credentials.password}`)
         log.info(`region = ${osService.credentials.region}`)
         cb(osService.credentials)
       })
     }
     // VCAP_SERVICES stored in Bluemix
     else {
       osService = baseOSConfig[osServiceName]
       log.info(`auth_url = ${osService.credentials.auth_url}`)
       log.info(`tenantId = ${osService.credentials.projectId}`)
       log.info(`domainId = ${osService.credentials.domainId}`)
       log.info(`username = ${osService.credentials.username}`)
       log.info(`password = ${osService.credentials.password}`)
       log.info(`region = ${osService.credentials.region}`)
       cb(osService.credentials)
     }
   }

   getCredentialsSSO(cb){
     // SSO service credentials
     const ssoServiceName = 'fintan-sso'
     let ssoService = {}

     // Get the configuration internally defined in Bluemix
     const ssoConfig = this.appEnv.getServices(ssoServiceName)

     // Check in case we are running locally
     if (!ssoConfig || Object.keys(ssoConfig).length === 0) {
       // Can't run locally as the SSO service callback points to the Bluemix route
       this.log.error("!!! Running locally - no SSO - do not try to access /view_names_sso !!!")
       ssoService.credentials = {}
       ssoService.credentials.clientId = "X"
       ssoService.credentials.secret = "X"
       ssoService.credentials.authorizationEndpointUrl = "X"
       ssoService.credentials.tokenEndpointUrl = "X"
       ssoService.credentials.issuerIdentifier = "X"
     }
     // VCAP_SERVICES stored in Bluemix
     else {
       ssoService = ssoConfig[ssoServiceName]
     }
     cb(ssoService.credentials)
   }

   getCredentialsLocal(file, cb){
     const jsonfile = require('jsonfile')
     jsonfile.readFile(file, function(err, obj) {
       if (err) {
         obj.log.error("Error reading credentials file ", err)
       }
       cb(obj.credentials)
     })
   }
}
