var express = require('express');
var bodyParser = require("body-parser");
var multer = require('multer')
var mkdirp = require('mkdirp');
var app = express();
var redis = require('redis');
var yaml = require('node-yaml-config');
var redisYaml = yaml.load('./redis.yml');
// var sqlite3Yaml = yaml.load('./SQLite3.yml');
var mongodbYaml = yaml.load('./mongodb.yml');
var redisClient = redis.createClient(redisYaml.port, redisYaml.host);
redisClient.auth(redisYaml.authKey);

//Load Database modules
// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database(sqlite3Yaml.path);
var mongo = require('mongodb')
const MongoClient = mongo.MongoClient;
var db;

MongoClient.connect(mongodbYaml.url, (err, database) => {
    // ... start the server
    if (err) return console.log(err);
    db = database;
    app.listen(8080, function() {
        console.log('Example app listening on port 8080!')
    })
})

redisClient.on('connect', function() {
    console.log('Redis connected');
});

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

var storagePostImage = multer.diskStorage({
    destination: function(req, file, cb) {
        var imgDestination = '/public/img/';
        mkdirp(__dirname + imgDestination, function(err) {
            cb(null, __dirname + imgDestination);
        });
    },
    filename: function(req, file, cb) {
        newFilePath = "/img/" + file.originalname;
        cb(null, file.originalname);
    }
});

var upload = multer({
    dest: '/uploads/',
    storage: storageImage,
});

var PostUpload = multer({
    dest: '/uploads/',
    storage: storagePostImage,
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
    // res.status(200);
    // res.set('Content-Type', 'application/json');
    // db.serialize(function() {
    //     db.all("SELECT * FROM movies", function(err, rows) {
    //         rows.forEach(function(element) {
    //             element.keywords = element.keywords.split(',');
    //         }, this);
    //         res.send(JSON.parse(JSON.stringify(rows)));
    //     });
    // })
    res.status(200);
    res.set('Content-Type', 'application/json');
    db.collection('movies').find().toArray(function(err, result) {
        result.forEach(function(element) {
            element.keywords = element.keywords.split(',');
            element.image = "http://" + req.headers.host + element.image;
            if (!element.compressed_image) {
                element.compressed_image = "";
            }
            if (!element.movie_thumbnail_small) {
                element.movie_thumbnail_small = "";
            }
            if (!element.movie_thumbnail_medium) {
                element.movie_thumbnail_medium = "";
            }
            if (!element.movie_thumbnail_large) {
                element.movie_thumbnail_large = "";
            }
            element.compressed_image = "http://" + req.headers.host + element.compressed_image;
            element.movie_thumbnail_small = "http://" + req.headers.host + element.movie_thumbnail_small;
            element.movie_thumbnail_medium = "http://" + req.headers.host + element.movie_thumbnail_medium;
            element.movie_thumbnail_large = "http://" + req.headers.host + element.movie_thumbnail_large;
        }, this);
        res.send(result);
    })
});

app.get("/movies/list", function(req, res) {
    // db.serialize(function() {
    //     db.all("SELECT * FROM movies", function(err, rows) {
    //         res.render('list', {
    //             title: "Movies App",
    //             layoutTitle: "My Movies",
    //             movies: rows
    //         });
    //     });
    // })
    db.collection('movies').find().toArray(function(err, result) {
        result.forEach(function(element) {
            element.keywords = element.keywords.split(',');
        }, this);
        res.render('list', {
            title: "Movie App",
            layoutTitle: "My Movies",
            movies: result
        })
    });
});

app.get('/movies/list/json', function(req, res) {
    // db.serialize(function() {
    //     db.all("SELECT * FROM movies", function(err, rows) {
    //         rows.forEach(function(element) {
    //             element.keywords = element.keywords.split(',');
    //         }, this);
    //         res.send(JSON.parse(JSON.stringify(rows)));
    //     });
    // })
    res.status(200);
    res.set('Content-Type', 'application/json');
    db.collection('movies').find().toArray(function(err, result) {
        result.forEach(function(element) {
            element.keywords = element.keywords.split(',');
            element.image = "http://" + req.headers.host + element.image;
            if (!element.compressed_image) {
                element.compressed_image = "";
            }
            if (!element.movie_thumbnail_small) {
                element.movie_thumbnail_small = "";
            }
            if (!element.movie_thumbnail_medium) {
                element.movie_thumbnail_medium = "";
            }
            if (!element.movie_thumbnail_large) {
                element.movie_thumbnail_large = "";
            }
            element.compressed_image = "http://" + req.headers.host + element.compressed_image;
            element.movie_thumbnail_small = "http://" + req.headers.host + element.movie_thumbnail_small;
            element.movie_thumbnail_medium = "http://" + req.headers.host + element.movie_thumbnail_medium;
            element.movie_thumbnail_large = "http://" + req.headers.host + element.movie_thumbnail_large;
        }, this);
        res.send(result);
    })
});

app.get("/movies/details", function(req, res) {
    res.sendStatus(404);
});

app.get('/movies/details/:id', function(req, res) {
    // if (req.params.id) {
    //     db.serialize(function() {
    //         db.get("SELECT * FROM movies where id = (?)", req.params.id, function(err, row) {
    //             if (err) {
    //                 return console.error(err);
    //             }
    //             if (row) {
    //                 row.keywords = row.keywords.split(',');
    //                 row.title = 'Movies App';
    //                 row.layoutTitle = 'My Movies';
    //                 res.render('details', row);
    //             }
    //         });
    //     });
    // } else {
    //     res.sendStatus(404);
    // }
    if (req.params.id === '') {
        res.sendStatus(404);
    } else {
        var ObjectID = new mongo.ObjectID(req.params.id);
        // db.test.find(ObjectId("4ecc05e55dd98a436ddcc47c"))
        db.collection('movies').findOne({ _id: ObjectID }, function(err, result) {
            // result.movie_thumbnail_large = result.movie_thumbnail_large;
            result.keywords = result.keywords.split(',');
            result.title = 'Movie App';
            result.layoutTitle = 'My Movies';
            res.render('details', result);
        });
    }
});

app.get("/movies/create", function(req, res) {
    res.render('create', {
        title: "Movies App",
        layoutTitle: "Create a movie"
    });
});

app.get("/image", function(req, res) {
    res.sendStatus(404);
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
    // db.serialize(function() {
    //     var statement = db.prepare("INSERT INTO movies (id, name, description, keywords, image) values (?,?,?,?,?)");
    //     statement.run(uniqueID, req.body.name, req.body.description, req.body.keywords, newFilePath);
    //     console.log(newFilePath);
    //     statement.finalize();
    //     redisClient.set("marcos:FileUploaded", newFilePath);
    //     console.log("Current UUID = " + uniqueID);
    //     uniqueID = uuid.v4();
    //     console.log("New UUID = " + uniqueID);
    // });

    var movie = {
        name: req.body.name,
        description: req.body.description,
        keywords: req.body.keywords,
        image: newFilePath,
        compressed_image: "",
        movie_thumbnail_small: "",
        movie_thumbnail_medium: "",
        movie_thumbnail_large: ""
    };
    db.collection('movies').insert(movie, (err, result) => {
        if (err) {
            return console.log(err);
        } else {
            redisClient.set("marcos:FileUploaded", newFilePath);
        }
        console.log('saved to database')
        res.redirect('/movies');
    })
});

app.post('/login', function(req, res) {
    res.set({
        'Content-Type': 'application/json'
    })
    res.send(req.body);
});

app.post('/image', PostUpload.single('image'), function(req, res, next) {
    res.set('Content-Type', 'application/json');
    if (!req.file) {
        res.sendStatus(404);
    }
    res.sendStatus(200);
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