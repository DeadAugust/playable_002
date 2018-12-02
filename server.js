var atmans = [];

function Atman(id, x, y){
  this.id = id;
  this.x = x;
  this.y = y;
}
/*
// shiffman heroku set up
var express = require('express');
var app = express();

//var server = app.listen(3000);

//for heroku
var server = app.listen(process.env.PORT || 80, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

console.log('Socket server running');

var io = require('socket.io')(server);
*/
/*
// stack overflow set up
var express = require('express'),
  http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);

app.use(express.static('public'));

console.log('Socket server running');
*/

/*heroku tutorial
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'sketch.js');

const server = express()
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log('Listening on ${PORT}'));

const io = socketIO(server);
*/

//socket.io set up tutorial
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

http.listen(port, function(){
  console.log('listening on ' + port);
})

setInterval(heartbeat, 33);
function heartbeat(){ //so this is the only thing sent from server???
  io.sockets.emit('heartbeat', atmans);
}

io.sockets.on('connection',
  function(socket){
    console.log("new player: " + socket.id);
    socket.on('start',
      function(data){
        var atman = new Atman(socket.id, data.x, data.y);
        atmans.push(atman);
      }
    );

    socket.on('update', //x undefined error from being first to party?
      function(data){
        //console.log(atmans.length);
        if (atmans.length >= 2){ //so only starts if at least 2 players?
          var atman;
          for (var i = 0; i < atmans.length; i++){
            if (socket.id == atmans[i].id){
              atman = atmans[i];
            }
          }
          // atman.x = data.x;
          // atman.y = data.y
        }
      }
    );

    socket.on('msg',
      function(data){
        socket.broadcast.to(data.idTo).emit('msg', data);
        console.log(data);
      }
    );

    socket.on('disconnect',
      function(data){
        console.log("Client has disconnected");
      })
  })
