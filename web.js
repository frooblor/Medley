var express = require('express')
, form = require('connect-form') 
, Upload = require('./upload') 
, formidable = require('formidable')
, http = require('http')
, util = require('util')
, ejs = require('ejs') //embedded javascript template engine
, mongoose = require('mongoose')
, path = require('path') 
, fs = require('fs') 
, nodeStatic = require('node-static')
, imageMagick = require('imageMagick'); 

var schema = mongoose.Schema; 


var app = module.exports = express.createServer();




//var format = require('util').format; 



/************ DATABASE CONFIGURATION **********/
app.db = mongoose.connect('mongodb://heroku_app3111965:uuepfbn6jk4ooqe5l74bn1fbbl@ds031347.mongolab.com:31347/heroku_app3111965'); //connect to the mongolabs database - local server uses .env file

// Include models.js - this file includes the database schema and defines the models used
require('./models').configureSchema(schema, mongoose);

// Define your DB Model variables
var TextEntry = mongoose.model('TextEntry'); 
var MediaEntry = mongoose.model('MediaEntry');
var BlogPost = mongoose.model('BlogPost');
var Comment = mongoose.model('Comment');
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
    app.use(express.static(__dirname + '/static'));
    
	
	app.use(express.bodyParser()); 
	app.use(form()); 
	app.use(express.static(__dirname)); 
	
    /**** Turn on some debugging tools ****/
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});
/*********** END SERVER CONFIGURATION *****************/



// main page - display all blog posts
// More Mongoose query information here - http://mongoosejs.com/docs/finding-documents.html
/*app.get('/', function(request, response) {

	//response.render('index.html');
    // build the query
    var query = BlogPost.find({});
    query.sort('date',-1); //sort by date in descending order
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allPosts){
        
        // prepare template data
        templateData = {
            posts : allPosts
        };
        
        // render the card_form template with the data above
        response.render('blog_main.html', templateData);
        
    });
});  */
// end of main page*/

app.get('/', function(request, response) {
	
	response.render('index.html');

	/*response.send(
	'<form method="post" action="/upload" enctype="multipart/form-data">'+
	  '<p>Title: <input type="text" name="title" /></p>'+
	  '<p>File: <input type="file" name="upload" /></p>'+
	  '<p><input type="submit" value="Upload" /></p>'+
	'</form>'
);*/
  
});  


/*app.get('/',function(request, response){
	
	response.send(
	        '<form action="/upload" enctype="multipart/form-data" method="post">'+
	        '<input type="text" name="title"><br>'+
	        '<input type="file" name="upload" multiple="multiple"><br>'+
	        '<input type="submit" value="Upload">'+
	        '</form>'
	  );
	
    /*
    response.send(format('\nuploaded %s (%d Kb) to %s as %s'
       , request.files.image.name
       , request.files.image.size / 1024 | 0 
       , request.files.image.path
       , request.body.title));*/ 
    //display the blog post entry form
    /*
	}); */ 

app.post('/upload', Upload.wait, function(request, response){
	response.send(request.body, 200); 
		 
}); 

app.get('/timeline', function(request, response) {

    // build the query
    var query = MediaEntry.find({});
    query.sort('date',-1); //sort by date in descending order
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allEntries){
        
        // prepare template data
        templateData = {
            posts : allEntries
        };
        
        // render the card_form template with the data above
        response.render('timeline.html', templateData);
        
    });
    
});

app.get('/timeline2', function(request, response){


        // render the card_form template with the data above
        response.render('timeline2.html');
     
    
});

/*app.get('/upload', function(request, response){


        // render the card_form template with the data above
        response.render('index.html');
     
    
});*/


// CREATE A NEW BLOG POST

app.get('/new-entry',function(request, response){
    
    //display the blog post entry form
    response.render('blog_post_entry_form.html');
    
});


// receive a form submission
app.post('/new-entry', function(request, response){
    
    console.log('Received new blog post submission')
    console.log(request.body);
    
    // Prepare the blog post entry form into a data object
    var blogPostData = {
        title : request.body.title,
        urlslug : request.body.urlslug,
        content : request.body.content,
        author : {
            name : request.body.name,
            email : request.body.email
        }
    };
    
    // create a new blog post
    var post = new BlogPost(blogPostData);
    
    // save the blog post
    post.save();
    
    // redirect to show the single post
    response.redirect('/entry/' + blogPostData.urlslug); // for example /entry/this-is-a-post
    
});


     /*   options = {
            tmpDir: __dirname + '/tmp',
            publicDir: __dirname + '/public',
            uploadDir: __dirname + '/public/files',
            uploadUrl: '/files/',
            maxPostSize: 500000000, // 500 MB
            minFileSize: 1,
            maxFileSize: 100000000, // 100 MB
            acceptFileTypes: /.+/i,
            // Files not matched by this regular expression force a download dialog,
            // to prevent executing any scripts in the context of the service domain:
            safeFileTypes: /\.(gif|jpe?g|png)$/i,
            imageTypes: /\.(gif|jpe?g|png)$/i,
            imageVersions: {
                'thumbnail': {
                    width: 80,
                    height: 80
                }
            },
            accessControl: {
                allowOrigin: '*',
                allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE'
            },
            /* Uncomment and edit this section to provide the service via HTTPS:
            ssl: {
                key: fs.readFileSync('/Applications/XAMPP/etc/ssl.key/server.key'),
                cert: fs.readFileSync('/Applications/XAMPP/etc/ssl.crt/server.crt')
            },
            */
      /*      nodeStatic: {
                cache: 3600 // seconds to cache served files
            }
        },
        utf8encode = function (str) {
            return unescape(encodeURIComponent(str));
        },
        fileServer = new nodeStatic.Server(options.publicDir, options.nodeStatic),
        nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
        nameCountFunc = function (s, index, ext) {
            return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
        },
        FileInfo = function (file) {
            this.name = file.name;
            this.size = file.size;
            this.type = file.type;
            this.delete_type = 'DELETE';
        },
        UploadHandler = function (req, res, callback) {
            this.req = req;
            this.res = res;
            this.callback = callback;
        },
        serve = function (req, res) {
            res.setHeader(
                'Access-Control-Allow-Origin',
                options.accessControl.allowOrigin
            );
            res.setHeader(
                'Access-Control-Allow-Methods',
                options.accessControl.allowMethods
            );
            var handleResult = function (result) {
                    var contentType = req.headers.accept.indexOf('application/json') !== -1 ?
                            'application/json' : 'text/plain';
                    res.writeHead(200, {'Content-Type': contentType});
                    res.end(JSON.stringify(result));
                },
                setNoCacheHeaders = function () {
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
                    res.setHeader('Content-Disposition', 'inline; filename="files.json"');
                },
                handler = new UploadHandler(req, res, handleResult);
            switch (req.method) {
            case 'OPTIONS':
                res.end();
                break;
            case 'HEAD':
            case 'GET':
                if (req.url === '/') {
                    setNoCacheHeaders();
                    if (req.method === 'GET') {
                        handler.get();
                    } else {
                        res.end();
                    }
                } else {
                    fileServer.serve(req, res);
                }
                break;
            case 'POST':
                setNoCacheHeaders();
                handler.post();
                break;
            case 'DELETE':
                handler.destroy();
                break;
            default:
                res.statusCode = 405;
                res.end();
            }
        };
    fileServer.respond = function (pathname, status, _headers, files, stat, req, res, finish) {
        if (!options.safeFileTypes.test(files[0])) {
            // Force a download dialog for unsafe file extensions:
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="' + utf8encode(path.basename(files[0])) + '"'
            );
        } else {
            // Prevent Internet Explorer from MIME-sniffing the content-type:
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
        nodeStatic.Server.prototype.respond
            .call(this, pathname, status, _headers, files, stat, req, res, finish);
    };
    FileInfo.prototype.validate = function () {
        if (options.minFileSize && options.minFileSize > this.size) {
            this.error = 'minFileSize';
        } else if (options.maxFileSize && options.maxFileSize < this.size) {
            this.error = 'maxFileSize';
        } else if (!options.acceptFileTypes.test(this.name)) {
            this.error = 'acceptFileTypes';
        }
        return !this.error;
    };
    FileInfo.prototype.safeName = function () {
        // Prevent directory traversal and creating hidden system files:
        this.name = path.basename(this.name).replace(/^\.+/, '');
        // Prevent overwriting existing files:
        while (path.existsSync(options.uploadDir + '/' + this.name)) {
            this.name = this.name.replace(nameCountRegexp, nameCountFunc);
        }
    };
    FileInfo.prototype.initUrls = function (req) {
        if (!this.error) {
            var that = this,
                baseUrl = (options.ssl ? 'https:' : 'http:') +
                    '//' + req.headers.host + options.uploadUrl;
            this.url = this.delete_url = baseUrl + encodeURIComponent(this.name);
            Object.keys(options.imageVersions).forEach(function (version) {
                if (path.existsSync(
                        options.uploadDir + '/' + version + '/' + that.name
                    )) {
                    that[version + '_url'] = baseUrl + version + '/' +
                        encodeURIComponent(that.name);
                }
            });
        }
    };
    UploadHandler.prototype.get = function () {
        var handler = this,
            files = [];
        fs.readdir(options.uploadDir, function (err, list) {
            list.forEach(function (name) {
                var stats = fs.statSync(options.uploadDir + '/' + name),
                    fileInfo;
                if (stats.isFile()) {
                    fileInfo = new FileInfo({
                        name: name,
                        size: stats.size
                    });
                    fileInfo.initUrls(handler.req);
                    files.push(fileInfo);
                }
            });
            handler.callback(files);
        });
    };
    UploadHandler.prototype.post = function () {
        var handler = this,
            form = new formidable.IncomingForm(),
            tmpFiles = [],
            files = [],
            map = {},
            counter = 1,
            finish = function () {
                counter -= 1;
                if (!counter) {
                    files.forEach(function (fileInfo) {
                        fileInfo.initUrls(handler.req);
                    });
                    handler.callback(files);
                }
            };
        form.uploadDir = options.tmpDir;
        form.on('fileBegin', function (name, file) {
            tmpFiles.push(file.path);
            var fileInfo = new FileInfo(file, handler.req, true);
            fileInfo.safeName();
            map[path.basename(file.path)] = fileInfo;
            files.push(fileInfo);
        }).on('file', function (name, file) {
            var fileInfo = map[path.basename(file.path)];
            fileInfo.size = file.size;
            if (!fileInfo.validate()) {
                fs.unlink(file.path);
                return;
            }
            fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);
            if (options.imageTypes.test(fileInfo.name)) {
                Object.keys(options.imageVersions).forEach(function (version) {
                    counter += 1;
                    var opts = options.imageVersions[version];
                    imageMagick.resize({
                        width: opts.width,
                        height: opts.height,
                        srcPath: options.uploadDir + '/' + fileInfo.name,
                        dstPath: options.uploadDir + '/' + version + '/' +
                            fileInfo.name
                    }, finish);
                });
            }
        }).on('aborted', function () {
            tmpFiles.forEach(function (file) {
                fs.unlink(file);
            });
        }).on('progress', function (bytesReceived, bytesExpected) {
            if (bytesReceived > options.maxPostSize) {
                handler.req.connection.destroy();
            }
        }).on('end', finish).parse(handler.req);
    };
    UploadHandler.prototype.destroy = function () {
        var handler = this,
            fileName;
        if (handler.req.url.slice(0, options.uploadUrl.length) === options.uploadUrl) {
            fileName = path.basename(decodeURIComponent(handler.req.url));
            fs.unlink(options.uploadDir + '/' + fileName, function (ex) {
                Object.keys(options.imageVersions).forEach(function (version) {
                    fs.unlink(options.uploadDir + '/' + version + '/' + fileName);
                });
                handler.callback(!ex);
            });
        } else {
            handler.callback(false);
        }
    };
    if (options.ssl) {
        require('https').createServer(options.ssl, serve).listen(port);
    } else {
        require('http').createServer(serve).listen(port);
    }
	*/ 



// Make server turn on and listen at defined PORT (or port 3000 if is not defined)
var port = process.env.PORT || 3000;
app.listen(port, function() {
	  console.log('Listening on ' + port);
	});






