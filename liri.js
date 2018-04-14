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

        // Loop through all the words in the node argument
        // And do a little for-loop magic to handle the inclusion of "+"s
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
            var myLog = "";
            myLog = "my-tweets";
            console.log("----------");
            for(var i = 0; i < 20; i++){
                console.log(params.screen_name + " tweeted: " + tweets[i].text + " on " + tweets[i].created_at);
                myLog += " - " + params.screen_name + " tweeted: " + tweets[i].text + " on " + tweets[i].created_at
            }
            console.log("----------");
            writeLog(myLog);
        }
    });
}

function fetchSong(tn) {
    spClient.search({ type: 'track', query: tn }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        var song = data.tracks.items[0];
        var myLog = "";
        myLog = "spotify-this-song";
        console.log("----------");
        console.log("Artist: " + song.artists[0].name);
        myLog += " - Artist: " + song.artists[0].name;
        console.log("Track: " + song.name);
        myLog += " - Track: " + song.name
        console.log("Preview: " + song.external_urls.spotify);
        myLog += " - Preview: " + song.external_urls.spotify
        console.log("Album: " + song.album.name)
        myLog += " - Album: " + song.album.name;
        console.log("----------");
        writeLog(myLog);
    });
}

function fetchMovie(mn) {
    var queryUrl = "http://www.omdbapi.com/?t=" + mn + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function(error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {
            var movieObj = JSON.parse(body);
            // console.log(JSON.parse(body));
            var myLog = "";
            myLog = "movie-this";
            console.log("----------");
            console.log("Title: " + movieObj.Title);
            myLog += " - Title: " + movieObj.Title;
            console.log("Release Year: " + movieObj.Year);
            myLog += " - Release Year: " + movieObj.Year;
            console.log("IMDB Rating: " + movieObj.Ratings[0].Value);
            myLog += " - IMDB Rating: " + movieObj.Ratings[0].Value;
            console.log("Rotten Tomatoes: " + movieObj.Ratings[1].Value);
            myLog += " - Rotten Tomatoes: " + movieObj.Ratings[1].Value;
            console.log("Country: " + movieObj.Country);
            myLog += " - Country: " + movieObj.Country;
            console.log("Language: " + movieObj.Language);
            myLog += " - Language: " + movieObj.Language;
            console.log("Plot: " + movieObj.Plot);
            myLog += " - Plot: " + movieObj.Plot;
            console.log("Actors: " + movieObj.Actors);
            myLog += " - Actors: " + movieObj.Actors;
            console.log("----------");
            writeLog(myLog);
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

function writeLog(str){
    fs.appendFile("log.txt", str, function(err) {
        // If an error was experienced we say it.
        if (err) {
            console.log(err);
        }
        
        // If no error is experienced, we'll log the phrase "Content Added" to our node console.
        else {
            console.log("Content Added!");
        }
    });
}