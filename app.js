var express = require('express');
var bodyParser = require("body-parser");
var multer = require('multer')
var mkdirp = require('mkdirp');
var app = express();
var redis = require('redis');
var yaml = require('node-yaml-config');
var redisYaml = yaml.load('./redis.yml');
var sqlite3Yaml = yaml.load('./SQLite3.yml');
var redisClient = redis.createClient(redisYaml.port, redisYaml.host);
redisClient.auth(redisYaml.authKey);

redisClient.on('connect', function() {
    console.log('Redis connected');
});

//Load Database modules
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(sqlite3Yaml.path);

// Universally unique identifier modules
var uuid = require('node-uuid');
var uniqueID = uuid.v4();

// NPM Module to integrate Handlerbars UI template engine with Express
var exphbs = require('express-handlebars');

//Declaring Express to use Handlerbars template engine with main.handlebars as
//the default layout
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Defining middleware to serve static files
app.use(express.static('public'));
app.use(express.static('generated'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var storageImage = multer.diskStorage({
    destination: function(req, file, cb) {
        var newDestination = '/generated/originals/';
        mkdirp(__dirname + newDestination, function(err) {
            cb(null, __dirname + newDestination);
        });
    },
    filename: function(req, file, cb) {
        var varFile = uniqueID + '_';
        newFilePath = "/originals/" + varFile + file.originalname;
        cb(null, varFile + file.originalname);
    }
});

var upload = multer({
    dest: '/uploads/',
    storage: storageImage,
});

app.set('json spaces', 2);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.patch('*', function(req, res) {
    if (req.path.includes('/notimplemented')) {
        res.set({
            'Content-Type': 'text/plain',
            'x-powered-by': 'Express',
            'Allow': 'GET,POST,PUT'
        })
        res.sendStatus(501);
    }
});

app.put('*', function(req, res) {
    if (req.path.includes('/notimplemented')) {
        res.sendStatus(200);
    }
});

app.get("/movies", function(req, res) {
    res.redirect('/movies/list');
});

app.get('/movies/json', function(req, res) {
    res.status(200);
    res.set('Content-Type', 'application/json');
    db.serialize(function() {
        db.all("SELECT * FROM movies", function(err, rows) {
            rows.forEach(function(element) {
                element.keywords = element.keywords.split(',');
            }, this);
            res.send(JSON.parse(JSON.stringify(rows)));
        });
    })
});

app.get("/movies/list", function(req, res) {
    var imageArray = [];
    db.serialize(function() {
        db.all("SELECT * FROM movies", function(err, rows) {
            res.render('list', {
                title: "Movies App",
                layoutTitle: "My Movies",
                movies: rows
            });
        });
    })
});

app.get('/movies/list/json', function(req, res) {
    db.serialize(function() {
        db.all("SELECT * FROM movies", function(err, rows) {
            rows.forEach(function(element) {
                element.keywords = element.keywords.split(',');
            }, this);
            res.send(JSON.parse(JSON.stringify(rows)));
        });
    })
});

app.get('/movies/details/:id', function(req, res) {
    if (req.params.id) {
        db.serialize(function() {
            db.get("SELECT * FROM movies where id = (?)", req.params.id, function(err, row) {
                if (err) {                
                    return console.error(err);
                }
                if (row) {
                    row.keywords = row.keywords.split(',');
                    row.title = 'Movies App';
                    row.layoutTitle = 'My Movies';
                    res.render('details', row);
                }
            });
        });
    }
    else{
        res.sendStatus(404);
    }
});

app.get("/movies/create", function(req, res) {
    res.render('create', {
        title: "Movies App",
        layoutTitle: "Create a movie"
    });
});

app.get('*', function(req, res) {

    var home = true;

    if (req.path.includes('/protected')) {
        res.sendStatus(401);
    } else if (req.path.includes('/404')) {
        res.sendStatus(404);
    } else if (req.path.includes('/error')) {
        res.sendStatus(500);
    } else if (req.path.includes('/notimplemented')) {
        res.sendStatus(200);
    } else if (req.path.includes('/login')) {
        res.sendFile(__dirname + '/public/login.html');
        home = false;
    }

    if (home) {
        var myHeader, headerArray, key;
        myHeader = JSON.parse(JSON.stringify(req.headers));
        headerArray = [];
        for (key in myHeader) {
            headerArray.push(key); // Push the key on the array
            headerArray.push(myHeader[key]); // Push the key's value on the array
        }

        var jsonObj = {
            "method": req.method,
            "path": req.path,
            "host": req.hostname,
            "port": req.get('host').split(':')[1],
            "header": headerArray
        }
        res.send(jsonObj);
    }
});

app.post('/movies/create', upload.single('image'), function(req, res, next) {
    var invalidJsonResponse = {
        title: "Movies App",
        layoutTitle: "Create a Movie",
        invalidName: false,
        invalidDescription: false,
        invalidKeywords: false,
        invalidImage: false,
        name: "",
        description: "",
        keywords: "",
        image: ""
    }
    if (req.body.name == "" || req.body.name == undefined) {
        invalidJsonResponse.invalidName = true;
    } else {
        invalidJsonResponse.name = req.body.name;
    }
    if (req.body.description == "" || req.body.description == undefined) {
        invalidJsonResponse.invalidDescription = true;
    } else {
        invalidJsonResponse.description = req.body.description;
    }
    if (req.body.keywords == "" || req.body.keywords == undefined) {
        invalidJsonResponse.invalidKeywords = true;
    } else {
        invalidJsonResponse.keywords = req.body.keywords;
    }
    if (!req.file) {
        invalidJsonResponse.invalidImage = true;
    }
    if (invalidJsonResponse.invalidName ||
        invalidJsonResponse.invalidDescription ||
        invalidJsonResponse.invalidKeywords ||
        invalidJsonResponse.invalidImage
        ) {
        res.render('create', invalidJsonResponse);
    return;
}
db.serialize(function() {
    var statement = db.prepare("INSERT INTO movies (id, name, description, keywords, image) values (?,?,?,?,?)");
    statement.run(uniqueID, req.body.name, req.body.description, req.body.keywords, newFilePath);
    console.log(newFilePath);
    statement.finalize();
    redisClient.set("marcos:FileUploaded", newFilePath);
    console.log("Current UUID = " + uniqueID);
    uniqueID = uuid.v4();
    console.log("New UUID = " + uniqueID);
});
res.redirect('/movies');
});

app.post('/login', function(req, res) {
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(req.body);
});

app.post('*', function(req, res) {
    if (req.path.includes('/protected')) {
        res.sendStatus(401);
    } else if (req.path.includes('/404')) {
        res.sendStatus(404);
    } else if (req.path.includes('/error')) {
        res.sendStatus(500);
    } else if (req.path.includes('/notimplemented')) {
        res.sendStatus(200);
    }
});

app.listen(8080, function() {
    console.log('Example app listening on port 8080!')
})
