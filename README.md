# fintan-node-js-cloudantdb-crud Overview

This application uses the [Cloudant NoSQL Database service](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db) to demonstrate the operations of Create, Read, Update and Delete into database using the Node.js runtime. Cloudant node module is used for these operations. They can alternatively be done with API calls which returns a JSON.

I forked this from IBM-Bluemix nodejs-cloudantdb-crud and re-orged the code to be more modular plus added SSO service


## Application Requirements

* Node.js runtime
* Cloudant NoSQL Database service
* SSO service

## Running the app on Bluemix

* Ensure the named services in manifest.yml exist in the target space

And voila! Your very own instance of Cloudant NoSQL DB with NodeJSCloudantSampleApp is now running on Bluemix.

## Running the app locally:

* If you have not already, download node.js and install it on your local machine.
* Download the project to your local machine from this link :
```
https://github.com/FintanMcElroy/fintan-nodejs-cloudantdb-crud
```
* On Bluemix Dashboard, create Cloudant No SQLDB service and SSO service if they are not alredy present.
*
* cd into the project folder and if required by any modules, run
```
		npm install
```
* repeat for other sub-folders that have package.json in them (e.g. creds)
```
* Start the application by typing
```
		node app.js
```		
* When the application executes, the first line will say:
```
		http://localhost:<port_number>
```		
Paste this URL in the browser to open the application.

### For more documents on Cloudant NoSQL DB

* https://cloudant.com

* https://docs.cloudant.com/document.html#undefined

* https://github.com/cloudant/nodejs-cloudant/blob/master/example/crud.js

* https://www.ng.bluemix.net/docs/#services/Cloudant/index.html#Cloudant


## Troubleshooting

To troubleshoot your Bluemix app the main useful source of information are the logs, to see them, run:

  ```
  $ cf logs <application-name> --recent
  ```

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).
  This sample uses [socket.io](http://socket.io/) which is MIT license
## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[service_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html
[cloud_foundry]: https://github.com/cloudfoundry/cli
[getting_started]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/
[sign_up]: https://apps.admin.ibmcloud.com/manage/trial/bluemix.html?cm_mmc=WatsonDeveloperCloud-_-LandingSiteGetStarted-_-x-_-CreateAnAccountOnBluemixCLI
