var csv = require("fast-csv");
var mongoose = require('mongoose');
var _ = require("lodash");
mongoose.Promise = require('bluebird');
mongoose.connect('localhost:27017/essecpack');


var Schema = mongoose.Schema;

var professorSchema = new Schema({
    name: {type: String, required: true},
    courses:[{type: Schema.ObjectId, ref: 'Course'}] //validation error, can't be recognized as objectID
});

mongoose.model('Professor', professorSchema);
 
var Professor = mongoose.model('Professor'); 

var professors = {};
var courses = {
    "Acteurs publics":"58dbe5c32b0db120badbaa9f",
    "Advanced Business English - niveau A/B":"58dbe5c32b0db120badbaaa0",
    "Advanced Business English _ A/B":"58dbe5c32b0db120badbaaa1",
    "Advanced Excel for Managers":"58dbe5c32b0db120badbaaa2",
    "Advanced Options":"58dbe5c32b0db120badbaaa3",
}
 
//connect to our mongo database
 
var db = mongoose.connection;
 
//if we have any errors, show them in console
db.on('error', function (err) {
 
    console.log('connected ' + err.stack);
 
});
 
//when we disconnect from mongo, show this in console
db.on('disconnected', function(){
    console.log('disconnected');
});

//when we connect to mongo, show this in console
db.on('connected',function(){
 
    console.log('connected'); 
     //load some data to the database
    csv.fromPath("professors.csv", {headers: true})
 	.on("data", function(data){ 
 		
		professors[data.name]=professors[data.name]||[];
		professors[data.name].push(data.courses);
		
        //professors.save(); //TypeError: professors.save is not a function
		
    }) 
 	.on("end", function(){
        
        console.log(professors);
        professors = _.map(professors,function(value,key){
            return {name:key,courses:_.map(value,function(item){return courses[item];})};
        });
        console.log(professors);

        _.each(professors,function(prof){
            var professorModel= new Professor(prof);
            professorModel.save();
        });

    })

});
 
//make sure that we are closing the connection to mongo if something happens to node (like Ctrl + C)
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        process.exit(0);
    });
});