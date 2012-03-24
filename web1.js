var express = require('express')
, ejs = require('ejs') //embedded javascript template engine
, mongoose = require('mongoose')
, format = require('util').format; 

var schema = mongoose.Schema; 
var app = module.exports = express(); 

//var format = require('util').format; 



/************ DATABASE CONFIGURATION **********/
app.db = mongoose.connect('mongodb://heroku_app3111965:uuepfbn6jk4ooqe5l74bn1fbbl@ds031347.mongolab.com:31347/heroku_app3111965'); //connect to the mongolabs database - local server uses .env file

// Include models.js - this file includes the database schema and defines the models used
require('./models').configureSchema(schema, mongoose);

/************* END DATABASE CONFIGURATION *********/


/*********** SERVER CONFIGURATION *****************/
app.configure(function() {
    /*********************************************************************************
        Configure the template engine
        We will use EJS (Embedded JavaScript) https://github.com/visionmedia/ejs
        
        Using templates keeps your logic and code separate from your HTML.
        We will render the html templates as needed by passing in the necessary data.
    *********************************************************************************/

    app.set('view engine','ejs');  // use the EJS node module
    app.set('views',__dirname+ '/views'); // use /views as template directory
    app.set('view options',{layout:false}); // use /views/layout.html to manage your main header/footer wrapping template
    app.register('html',require('ejs')); //use .html files in /views

    /******************************************************************
        The /static folder will hold all css, js and image assets.
        These files are static meaning they will not be used by
        NodeJS directly. 
        
        In your html template you will reference these assets
        as yourdomain.heroku.com/img/cats.gif or yourdomain.heroku.com/js/script.js
    ******************************************************************/
    /*app.use(express.static(__dirname + '/static'));*/
    
	
	app.use(express.bodyParser()); 
	
	/*app.use(express.static(__dirname)); */ 
	
    /**** Turn on some debugging tools ****/
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});
/*********** END SERVER CONFIGURATION *****************/

app.get('/', function(req, res){
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Title: <input type="text" name="title" /></p>'
    + '<p>Image: <input type="file" name="image" /></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>');
});

app.post('/', function(req, res, next){
  // the uploaded file can be found as `req.files.image` and the
  // title field as `req.body.title`
  res.send(format('\nuploaded %s (%d Kb) to %s as %s'
    , req.files.image.name
    , req.files.image.size / 1024 | 0 
    , req.files.image.path
    , req.body.title));
});


app.get('/timeline', function(request, response) {
        
        // render the card_form template with the data above
        response.render('timeline.html', templateData);
        
});
    

app.get('/timeline2', function(request, response){


        // render the card_form template with the data above
        response.render('timeline2.html');
     
    
});




// Make server turn on and listen at defined PORT (or port 3000 if is not defined)
var port = process.env.PORT || 3000;
app.listen(port, function() {
	  console.log('Listening on ' + port);
});




