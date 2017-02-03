var express = require('express');
var app = express();
var mkdirp = require('mkdirp');
var redis = require('redis');
var yaml = require('node-yaml-config');
var redisYaml = yaml.load('./redis.yml');
var tinifyYaml = yaml.load('./tinify.yml');
var sqlite3Yaml = yaml.load('./SQLite3.yml');
var tinify = require('tinify');
var sharp = require('sharp');
var redisClient = redis.createClient(redisYaml.port, redisYaml.host);
var redisSubsClient = redis.createClient(redisYaml.port, redisYaml.host);
redisClient.auth(redisYaml.authKey);
redisSubsClient.auth(redisYaml.authKey);

//Load Database modules
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(sqlite3Yaml.path);

// Universally unique identifier modules
var uuid = require('node-uuid');
var uniqueID = uuid.v4();

tinify.key = tinifyYaml.key;

//Defining middleware to serve static files
app.use('/public', express.static(__dirname + "/public"));
app.use('/generated', express.static(__dirname + "/generated"));

redisSubsClient.on('connect', function() {
    console.log('Redis Subscriber connected');
});

redisClient.on('connect', function() {
    console.log('Redis Publisher connected');
});

redisSubsClient.config('set', 'notify-keyspace-events', 'KEA');
redisSubsClient.subscribe('__keyevent@0__:set', 'marcos:FileUploaded');

redisSubsClient.on('message', function(channel, key) {
    redisClient.get('marcos:FileUploaded', function(err, reply) {
        if (err) {
            console.error('Error getting key from redis: ' + err);
        } else if (reply) {
            try {
                redisClient.del('marcos:FileUploaded');
                var fullPath = reply;
                var fileName = reply.split('/');
                fileName = fileName[2];
                var compressed_image_path = __dirname + "/generated/compressed/" + fileName;
                var small_thumbnail_path = __dirname + "/generated/small/" + fileName;
                var medium_thumbnail_path = __dirname + "/generated/medium/" + fileName;
                var large_thumbnail_path = __dirname + "/generated/large/" + fileName;

                // mkdirp(__dirname + "/generated/compressed/", function(err) {
                //     if (err) {
                //         console.error(err);
                //     }
                //     // else {
                //     //     console.log(compressed_image_path);
                //     // }
                // });
                // mkdirp(__dirname + "/generated/small/", function(err) {
                //     if (err) {
                //         console.error(err);
                //     } 
                //     // else {
                //     //     console.log(small_thumbnail_path);
                //     // }
                // });
                // mkdirp(__dirname + "/generated/medium/", function(err) {
                //     if (err) {
                //         console.error(err);
                //     }
                //     // else {
                //     //     console.log(medium_thumbnail_path);
                //     // }
                // });
                // mkdirp(__dirname + "/generated/large/", function(err) {
                //     if (err) {
                //         console.error(err);
                //     }
                //     // else {
                //     //     console.log(large_thumbnail_path);
                //     // }
                // });

                tinify.fromFile(__dirname + '/generated/' + fullPath).toFile(compressed_image_path, function(err) {
                    if (err) {
                        console.error('Error creating compressed image: ' + err);
                    } else {
                        db.serialize(function() {
                            var statement = db.prepare("UPDATE movies set compressed_image = (?) where movie_poster = (?)");
                            statement.run("/compressed/" + fileName, fullPath);
                            statement.finalize();
                        });
                        console.log('Compressed Image Created!');
                    }
                });
                sharp(__dirname + '/generated/' + fullPath).resize(78, 120, {
                    centerSampling: true
                }).toFile(small_thumbnail_path, function(err, info) {
                    if (err) {
                        console.error('Error creating small thumbnail: ' + err);
                    } else {
                        db.serialize(function() {
                            var statement = db.prepare("UPDATE movies set movie_thumbnail_small = (?) where movie_poster = (?)");
                            statement.run("/small/" + fileName, fullPath);
                            statement.finalize();
                        });
                        console.log('Small Thumbnail Created!');
                    }
                });
                sharp(__dirname + '/generated/' + fullPath).resize(196, 300, {
                    centerSampling: true
                }).toFile(medium_thumbnail_path, function(err, info) {
                    if (err) {
                        console.error('Error creating medium thumbnail: ' + err);
                    } else {
                        db.serialize(function() {
                            var statement = db.prepare("UPDATE movies set movie_thumbnail_medium = (?) where movie_poster = (?)");
                            statement.run("/medium/" + fileName, fullPath);
                            statement.finalize();
                        });
                        console.log('Medium Thumbnail Created!');
                    }
                });
                sharp(__dirname + '/generated/' + fullPath).resize(300, 460, {
                    centerSampling: true
                }).toFile(large_thumbnail_path, function(err, info) {
                    if (err) {
                        console.error('Error creating large thumbnail: ' + err);
                    } else {
                        db.serialize(function() {
                            var statement = db.prepare("UPDATE movies set movie_thumbnail_large = (?) where movie_poster = (?)");
                            statement.run("/large/" + fileName, fullPath);
                            statement.finalize();
                        });
                        console.log('Large Thumbnail Created!');
                    }
                });
            } catch (err) {
                console.error('Error creating thumbnails: ' + err);
            }
        }
        uniqueID = uuid.v4();
    });
});