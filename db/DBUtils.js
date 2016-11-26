'use strict'
const Cloudant = require('cloudant')
const Log = require('log')
const request = require('request')
const CSVUtils = require('../csv/CSVUtils.js')

module.exports = class DBUtils {
    constructor() {
           this.url
           this.db
           this.dbname = 'nodejs_crud'
           this.log = new Log("info")
           this.csvUtils = new CSVUtils()
    }
    // Method to connect and init DB
    initDB(credentials){
      let cloudant_url, cloudant
      let obj = this
      //To Store URL of Cloudant instance
    	cloudant_url = credentials.url
    	this.url = cloudant_url + "/nodejs_crud/_design/nodejs_crud_design/_view/nodejs_crud_view";
    	this.log.info("cloudant_url : ", cloudant_url)
    	//Connect using cloudant npm and URL obtained from previous step
    	cloudant = Cloudant({url: cloudant_url})

    	//Create database
    	cloudant.db.create(this.dbname, (err, data) => {
      		if(err) //If database already exists
    	    	obj.log.error("Database exists. Error : ", err) // NOTE: A Database can be created through the GUI interface as well
      		else
    	    	obj.log.info(`Created database ${obj.dbname}.`)

      		//Use the database for further operations like create view, update doc., read doc., delete doc. etc, by assigning dbname to db.
      		obj.db = cloudant.db.use(obj.dbname)

        	//Create a design document. It stores the structure of the database and contains the design and map of views too
        	//A design doc. referred by _id = "_design/<any name your choose>"
        	//A view is used to limit the amount of data returned
        	//A design document is similar to inserting any other document, except _id starts with _design/.
        	//Name of the view and database are the same. It can be changed if desired.
        	//This view returns (i.e. emits) the id, revision number and new_city_name variable of all documents in the DB
      		obj.db.insert(
    	 		{
    		  	_id: "_design/nodejs_crud_design",
    		    views: {
    	  				  "nodejs_crud_view":
    	  				   {
    	      					"map": "function (doc) {\n  emit(doc._id, [doc._rev, doc.new_name]);\n}"
    	    			   }
          	   		   }
         },
    		 	(err, data) => {
    	    	if(err)
    	    			obj.log.error("View already exists. Error: ", err) //NOTE: A View can be created through the GUI interface as well
    	    	else
    	    		obj.log.info("nodejs_crud_view view has been created")
    	 		}) // end obj.db.insert()
    	}) // end cloudant.db.create()
    }
    //    ***************************************************** SEARCH DATABASE ************************************************************
    ////// To search for a document directly, without using request module....
    ////// It's crucial to know the ID of the document to be searched for.
    ////// TIP: While inserting a new document, a JSON object can be created with '_id' variable set to the same value as 'new_name' as in this case
    ////// This JSON document can be inserted whose _id can then be referenced for future search.
    ////// Eg: _id = "mydoc".
    //
    //	   db.get("mydoc", function(err, data){
    //			if(!err)
    //				log.info("Found document : " + JSON.stringify(data));
    //  		else
    //      		log.info("Document not found in database");
    //	   });

    //   ****************************************************** END OF SEARCH **************************************************************
   // method to add name to the DB
   addName(query, cb){
     //Search through the DB completely to check for duplicate name, before adding a new name
   	let name_present = 0; //flag variable for checking if name is already present before inserting
   	let name_string; //variable to store update for front end.
    let obj = this // in order to use it inside function callback (is there a better way of doing this?)

   	// In this case, check if the ID is already present, else, insert a new document
   	request({
   			 url: this.url,
   			 json: true
       }, (error, response, body) => {
   		if (!error && response.statusCode === 200)
   		{
   			//Check if current input is present in the table, else add. If present then return with error message
   			obj.log.info(`length of table: ${body.rows.length}`)

        for (let row of body.rows){
          obj.log.info(`in Db :  ${row.value[1]}`)
   				if(query.new_name === row.value[1])
   				{
   					name_present = 1
            break
   				}
        }

   			if(name_present === 0) //if name is not already in the list
   			{
   				obj.db.insert(query, (err, data) => {
   					if (!err)
   					{
   						obj.log.info("Added new name")
   						cb("{\"added\":\"Yes\"}")
   					}
   					else
   					{
   						obj.log.error(`Error inserting into DB  ${err}`)
   						cb("{\"added\":\"DB insert error\"}")

   					}
   				})
   		  }
   			else
   			{
   				obj.log.debug("Name is already present")
   				cb("{\"added\":\"No\"}")
   			}
   		}
   		else
   		{
   			obj.log.error(`No data from URL. Response : ${response.statusCode}`)
   			cb("{\"added\":\"DB read error\"}")
   		}
   	})
   }
   // method to remove name from the DB
   removeName(query, cb){
     //Search through the DB completely to retrieve document ID and revision number
    let obj = this
   	request({
   			 url: this.url, //url returns doc id, revision number and name for each document
   			 json: true
       }, (error, response, body) => {
   			if (!error && response.statusCode === 200)
   			{
   				let id_to_remove, rev_to_remove //for removing, ID and revision number are essential.

          for (let doc of body.rows){
            if(doc.value[1] === query.name_to_remove)
   					{
   						id_to_remove = doc.key
   						rev_to_remove = doc.value[0]
   						break;
   					}
          }
   				if(body.rows.length !== 0)
   				{
   				    obj.db.destroy(id_to_remove, rev_to_remove, (err) => {
   					      if(!err)
   						    {
   							      obj.log.info("Removed name")
   							      cb("{\"removed\":\"removed\"}")
   						    }
   						    else
   						    {
   							      obj.log.error("Couldn't remove name")
   							      obj.log.error(err)
   							      cb("{\"removed\":\"could not remove\"}")
   						    }
   					})

   				}
   				else
   				{
   					obj.log.debug("DB is empty")
   					cb("{\"removed\":\"empty database\"}")
   				}
   			}
   			else
   			{
   				obj.log.error("No data from URL")
   				obj.log.error(`Response is : ${response.statusCode}`)
   				cb("{\"removed\":\"DB read error\"}")
   			}
   	}) // end request()
   }
   // method to update name in the DB
   updateName(query, cb){
     //Search through the DB completely to retrieve document ID and revision number
    let obj = this
   	let name_present = 0
   	request({
   			 url: this.url, //url returns doc id, revision number and name for each document
   			 json: true
       }, (error, response, body) => {
   			if (!error && response.statusCode === 200)
   			{
   				let id_to_update, rev_to_update
   				for(let row of body.rows)
   				{
   					if(row.value[1] === query.name_list)
   					{
   						id_to_update = row.key
   						rev_to_update = row.value[0]
   					}
   					if(row.value[1] === query.updated_new_name)
   					{
   						name_present = 1
   						break
   					}
   				}
   				//create a document object before updating, containing ID of the doc. that needs to be updated, revision number and new name
   			  let string_to_update = "{\"new_name\":\"" + query.updated_new_name + "\",\"_id\":\"" +id_to_update+"\",\"_rev\":\"" + rev_to_update + "\"}"
   			  let update_obj = JSON.parse(string_to_update)
   				//if update name is not equal to existing name and database isn't empty then update document, else print error message
   				if(body.rows.length !== 0)
   				{
   					if(name_present === 0)
   					{
   						obj.db.insert(update_obj, (err, data) => {
   								if(!err)
   								{
   									obj.log.info("Updated doc.")
   									cb("{\"updated\":\"updated\"}")
   								}
   								else
   								{
   									obj.log.error(`Couldn't update name ${err}`)
   									cb("{\"updated\":\"could not update\"}")
   								}
   						})
   					}
   					else
   					{
   						obj.log.error("Duplicate name")
   						cb("{\"updated\":\"No\"}")
   					}

   				}
   				else
   				{
   					obj.log.debug("DB is empty")
   					cb("{\"updated\":\"empty database\"}")
   				}
   			}
   			else
   			{
   				obj.log.error(`No response from URL. Status : ${response.statusCode}`)
   				cb("{\"updated\":\"DB read error\"}")
   			}
   	}) // end request()
   }
   // method to read the names in the DB
   readNames(query, createCSV, cb){
     let obj = this

   	request({
   			 url: this.url, //'request' makes a call to API URL which in turn returns a JSON to the variable 'body'
   			 json: true
       }, (error, response, body) => {
   		if (!error && response.statusCode === 200)
   		{
        if (createCSV) {
          obj.csvUtils.createCSVFile(body.rows)
        }

   			let list_of_names = '['
   			let name_array = []
   			for (let row of body.rows) {
   				name_array.push(row.value[1])
   			}
   			name_array.sort()

   			for(var i=0; i<name_array.length; i++)
   			{
   				let name_JSON = '{\"name\":\"' + name_array[i] + '\"}' //create an array of names only
   				if(i !== 0){
   					list_of_names = list_of_names.concat(",")
   				}
   				list_of_names = list_of_names.concat(name_JSON)
   			}
   			list_of_names = list_of_names.concat("]")
   			obj.log.info("Returning names")
   			cb(list_of_names) //return the list to front end for display
   		}
   		else
   		{
   			obj.log.error("No data from URL")
   			obj.log.error(`Response is : ${response.statusCode}`)
   			cb("{\"added\":\"DB read error\"}") //Send error message in case 'request' can't read database

   		}
   	}) // end request()
   }
    // utility to get the CSV File
    getCSVFile(cb){
      this.csvUtils.getCSVFile((fileName) => {
        cb(fileName)
      })
    }
}
