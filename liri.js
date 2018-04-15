// import { write } from "fs";

require("dotenv").config();
var fs = require("fs");
var request = require("request");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var moment = require('moment');

const myKeys = require('./keys');

let twitterKeys = myKeys.twitter;
let spotifyKeys = myKeys.spotify;

var twClient = new Twitter(twitterKeys);
var spClient = new Spotify(spotifyKeys);

var liriCommand = process.argv[2];

switch(liriCommand) {
    case "my-tweets":
        fetchTweets(process.argv[3]);
        break;
    case "spotify-this-song":
        var trackName = "";
        if (process.argv[3] !== undefined){
            for (var i = 3; i < process.argv.length; i++) {
                trackName += process.argv[i] + " ";
            }
        } else {
            trackName = "The Sign ace of base";
        }
        fetchSong(trackName);
        break;
    case "movie-this":
        var movieName = "";

        if (process.argv[3] !== undefined) {
            for (var i = 3; i < process.argv.length; i++) {

                if (i > 3 && i < process.argv.length) {
                    movieName = movieName + "+" + process.argv[i];
                } else {
                    movieName += process.argv[i];
                }
            }
        } else {
            movieName = "Mr. Nobody"
        }
        fetchMovie(movieName);
        break;
    case "do-what-it-says":
        fetchDir();
        break;
    default:
        // code block
}

function fetchTweets(un) {
    var params = {screen_name: un};
    twClient.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            var tweetObj = {}
            var myTweets = []

            tweetObj.user = un;

            for(var i = 0; i < 20; i++){
                myTweets.push({text: tweets[i].text, time: tweets[i].created_at});
            }
            tweetObj.tweets = myTweets;
            tweetObj.logTime = moment();

            console.log("|------------------------------------|")
            console.log(tweetObj.user + " has tweeted the following: ");

            for (var i = 0; i < tweetObj.tweets.length; i++) {
                console.log("On " + tweetObj.tweets[i].time + " " + tweetObj.user + " tweeted: " + tweetObj.tweets[i].text);
            }
            console.log("|------------------------------------|")
            
            writeLog(tweetObj);
        }
    });
}

function fetchSong(tn) {
    spClient.search({ type: 'track', query: tn }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        var song = data.tracks.items[0];

        var trackObj = {
            artist: song.artists[0].name,
            track: song.name,
            url: song.external_urls.spotify,
            album: song.album.name,
            logTime: moment()            
        }
        
        console.log("|------------------------------------|")
        for (var property in trackObj) {
            if (property !== "logTime") {
                console.log(property + " - " + trackObj[property]);
            }
        }
        console.log("|------------------------------------|")

        writeLog(trackObj);
    });
}

function fetchMovie(mn) {
    var queryUrl = "http://www.omdbapi.com/?t=" + mn + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function(error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {
            var movieObj = JSON.parse(body);

            var movObj = {
                title: movieObj.Title,
                year: movieObj.Year,
                imdb: movieObj.Ratings[0].Value,
                rotten: movieObj.Ratings[1].Value,
                country: movieObj.Country,
                language: movieObj.Language,
                plot: movieObj.Plot,
                actors: movieObj.Actors,
                logTime: moment()
            }

            console.log("|------------------------------------|")
            for (var property in movObj) {
                if (property !== "logTime") {
                    console.log(property + " - " + movObj[property]);
                }
            }
            console.log("|------------------------------------|")

            writeLog(movObj);
        }
    });
}

function fetchDir() {
    fs.readFile("random.txt", "utf8", function(error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }

        var dataArr = data.split(",");

        switch(dataArr[0]) {
            case "my-tweets":
                fetchTweets(dataArr[1]);
                break;
            case "spotify-this-song":
                fetchSong(dataArr[1]);
                break;
            case "movie-this":
                fetchMovie(dataArr[1]);
                break;
            default:
                // code block
        }
    });
}

function writeLog(obj){
    fs.readFile('log.json', function (err, data) {
        var json = JSON.parse(data);

        json[liriCommand].push(obj);
    
        fs.writeFile("log.json", JSON.stringify(json, null, 2), (err) => {
            if (err) throw err;
          });
    })
}