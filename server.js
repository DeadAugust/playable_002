var atmans = [];

function Atman(id, x, y){
  this.id = id;
  this.x = x;
  this.y = y;
}


var express = require('express');
var app = express();

var server = app.listen(3000);

app.use(express.static('public'));

console.log('Socket server running');

var io = require('socket.io')(server);

//heartbeat needed?
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
