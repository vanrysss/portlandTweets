var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  Twit = require('twit'),
  io = require('socket.io').listen(server);
var _ = require('underscore');
var connections =0;
//heroku
//server.listen(process.env.PORT || 8000);
server.listen(8000);

//Twitter API setup
var portland = ['-122.7729357', '45.428982', '-122.4811972', '45.5799702'];
var Tw = new Twit({
  consumer_key: "",
  consumer_secret: "",
  access_token: "",
  access_token_secret: ""
});

var stream = Tw.stream('statuses/filter', {
  locations: portland,
  language: 'en'
});


// routing
// Tell node to load node-twitter-stream.html when the browser requests /
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Tell node to serve the CSS file when requested
app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + '/style.css');
});

io.sockets.on('connection', function(socket) {
  connections +=1;
  console.log('new connection ' + connections);

  socket.on('disconnect', function() {
    connections -= 1;
    console.log('user disconnected ' + connections);
  });
});
// When a Tweet is recieved:
stream.on('tweet', function(tweet) {
  if (tweet.geo) {
    if (parseFloat(tweet.geo.coordinates[0]) < portland[3] && parseFloat(tweet.geo.coordinates[0]) > portland[1]) {
      if (parseFloat(tweet.geo.coordinates[1]) < portland[2] && parseFloat(tweet.geo.coordinates[1]) > portland[0]) {
        var turl = tweet.text.match(/(http|https|ftp):\/\/[^\s]*/i);
        if (turl !== null) {
          turl = tweet.text.replace(turl[0], '<a href="' + turl[0] + '" target="new">' + turl[0] + '</a>');
        } else {
          turl = tweet.text;
        }
        console.log("emitting tweet: "+ tweet.text);
        var tweetID = tweet.id_str;
        var urlTweet ="http://www.twitter.com/"+tweet.user.screen_name +"/status/"+tweetID;
        io.emit('stream', turl,urlTweet);
      }
    }
  }
});
