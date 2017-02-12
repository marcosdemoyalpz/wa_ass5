//Load Database modules
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/mydb.db');

// Universally unique identifier modules
var uuid = require('node-uuid');
var uniqueID = uuid.v4();

db.serialize(function() {

    db.run("CREATE TABLE if not exists movies" +
        "(" +
        "id TEXT NOT NULL," +
        "name TEXT NOT NULL," +
        "description TEXT NULL," +
        "keywords TEXT NULL," +
        "image TEXT NOT NULL," +
        "compressed_image TEXT NULL," +
        "movie_thumbnail_small TEXT NULL," +
        "movie_thumbnail_medium TEXT NULL," +
        "movie_thumbnail_large TEXT NULL" +
        ")");
    db.run('INSERT into movies(id,name,description, keywords, image) VALUES' +
        '("' + uniqueID + '"' +
        ',"Inglorious Basterds"' +
        ',"In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner´s vengeful plans for the same."' +
        ',"Adventure,Drama,War"' +
        ',"' + '/originals/' + '3b2d46cd-8856-47a9-8421-c5c6488fc27f' + '.jpg"' +
        ')');
    uniqueID = uuid.v4();
    db.run('INSERT into movies(id,name,description, keywords, image) VALUES' +
        '("' + uniqueID + '"' +
        ',"Gran Torino"' +
        ',"Disgruntled Korean War veteran Walt Kowalski sets out to reform his neighbor, a Hmong teenager who tried to steal Kowalski´s prized possession: a 1972 Gran Torino."' +
        ',"Drama"' +
        ',"' + '/originals/' + '795b2fae-0843-44be-8b33-465ea1ca66e7' + '.jpg"' +
        ')');
    uniqueID = uuid.v4();
    db.run('INSERT into movies(id,name,description, keywords, image) VALUES' +
        '("' + uniqueID + '"' +
        ',"Pulp Fiction"' +
        ',"The lives of two mob hit men, a boxer, a gangster´s wife, and a pair of diner bandits intertwine in four tales of violence and redemption."' +
        ',"Crime,Drama"' +
        ',"' + '/originals/' + '3885a5da-f8fa-41b0-bc3b-9045c797b71b_pulp_fiction' + '.jpg"' +
        ')');

    db.each("SELECT * FROM movies", function(err, rows) {
        console.log(rows);
    });
});

db.close();

/*
//Perform INSERT operation.
db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");

//Perform DELETE operation
db.run("DELETE * from table_name where condition");

//Perform UPDATE operation
db.run("UPDATE table_name where condition"); *
*/