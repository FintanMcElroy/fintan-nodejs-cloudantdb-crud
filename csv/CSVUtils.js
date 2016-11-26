'use strict'
const json2csv = require('json2csv')
const Log = require('log')
const fs = require('fs')
const pkgcloud = require('pkgcloud')
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv()
const Credentials = require('../creds/Credentials.js')

module.exports = class CSVUtils {
  constructor(){
    this.log = new Log("info")
    this.download_filename = "database_names.csv"
  }

  getCSVFile(cb){
    let fileName = __dirname + '\/' + this.download_filename
    cb(fileName)
  }

  createCSVFile(rows){
    let obj = this
    let json_string_for_csv_conversion = new Array()

    for (let row of rows) {
      let csv_data = new Array()
      csv_data["|__Names_in_Database__|"] = row.value[1]
      json_string_for_csv_conversion.push(csv_data)
    }

    let fields =['|__Names_in_Database__|']
    json2csv({data: json_string_for_csv_conversion, fields: fields }, (err, csv) => {
      if (err) {
        obj.log.error("Error in json2csv", err)
      }
      let targetFile = __dirname + "/" + obj.download_filename
      fs.writeFile(targetFile, csv, (err) => {
        if (err) {
          obj.log.error("Error in fs.writeFile", err)
          throw err
        }
        obj.log.info('file saved')
        obj.log.info("CSV = ", csv)

        fs.readdir(__dirname, (err, files) => {
          if (err) {
            obj.log.error("Error in fs.readdir", err)
            throw err
          }
          for (let index in files) {
            if(files[index] === obj.download_filename)
              obj.log.info(`${obj.download_filename} is present`)
          }
          this.storeFile(targetFile, obj.download_filename)
        })
      }) // end fs.writeFile
    }) // end json2csv
  }
  // Store a file in Object Storage
  storeFile(targetFilePath, targetFile) {
    let obj = this
    const creds = new Credentials(appEnv, this.log)
    creds.getCredentialsOS((credsOS) => {
      const config = {
        provider: 'openstack',
        useServiceCatalog: true,
        useInternal: false,
        keystoneAuthVersion: 'v3',
        authUrl: credsOS.auth_url,
        tenantId: credsOS.projectId,    //projectId from credentials
        domainId: credsOS.domainId,
        username: credsOS.username,
        password: credsOS.password,
        region: credsOS.region
      }

      const storageClient = pkgcloud.storage.createClient(config)

      storageClient.auth((err) => {
        if (err) {
            obj.log.error(err)
          }
          else {
            obj.log.info(storageClient._identity)
          }
        })

        storageClient.createContainer({name: 'cloudant-csv-container'}, (err, container) => {
            let csvFile, upload
            if (err) {
              obj.log.error(err)
            }
            else {
              csvFile = fs.createReadStream(targetFilePath)

              upload = storageClient.upload({
                container: container.name,
                remote: targetFile
              })

              upload.on('error', (err) => {
                obj.log.error(err)
              })

              upload.on('success', (file) => {
                obj.log.info(file.toJSON())
              })
              csvFile.pipe(upload)
            } // end else
          }) // end createContainer()
    }) // end getCredentialsOS()
  } // end storeFile()
}
