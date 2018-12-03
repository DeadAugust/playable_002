var atmans = [];

function Atman(id, x, y, name, r, g, b){
  this.id = id;
  this.x = x;
  this.y = y;
  this.name = name;
  // this.col = col;
  this.r = r;
  this.g = g;
  this.b = b;
}
 /* uncomment for heroku
// shiffman heroku set up &&
// socket.io set up tutorial
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static('public'));


http.listen(port, function(){
  console.log('listening on ' + port);
})
*/

//for local dev
var express = require('express');
var app = express();

var server = app.listen(3000);

app.use(express.static('public'));

console.log('Socket server running');

var io = require('socket.io')(server);

setInterval(heartbeat, 33);
function heartbeat(){ //so this is the only thing sent from server???
  io.sockets.emit('heartbeat', atmans);
}

io.sockets.on('connection',
  function(socket){
    console.log("new player: " + socket.id);
    socket.on('start',
      function(data){
        var atman = new Atman(socket.id, data.x, data.y, data.name, data.r, data.g, data.b);
        atmans.push(atman);
        console.log(atmans);
      }
    );

    socket.on('update', //x undefined error from being first to party?
      function(data){
        // console.log(atmans.length);
        if (atmans.length >= 2){ //so only starts if at least 2 players?
          var atman;
          for (var i = 0; i < atmans.length; i++){
            if (socket.id == atmans[i].id){
              atman = atmans[i];
              atman.x = data.x;
              atman.y = data.y
            }
          }
        }
      }
    );

    socket.on('trade',
      function(data){
        socket.broadcast.to(data.idTo).emit('trade', data);
        if (data.idTato == 1){
          console.log(data.nameFrom + " sent " + data.nameTo + " a Tato");
        }
        else if (data.idMork == 1){
          console.log(data.nameFrom + " sent " + data.nameTo + " a Mork");
        }
        else{
          console.log(data.nameFrom + " sent " + data.nameTo + " an Upple");
        }
      }
    );
    /* msg test
    socket.on('msg',
      function(data){
        socket.broadcast.to(data.idTo).emit('msg', data);
        console.log(data);
      }
    );
    */
    socket.on('disconnect',
      function(data){
        console.log("Client has disconnected");
      })
  })
