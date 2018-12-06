var atmans = [];

function Atman(id, x, y, name, r, g, b){
  this.id = id;
  this.x = x;
  this.y = y;
  this.name = name;
  this.r = r;
  this.g = g;
  this.b = b;
  this.t;
  this.m;
  this.u;
}
 // uncomment for heroku
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

/*
//for local dev
var express = require('express');
var app = express();

var server = app.listen(3000);

app.use(express.static('public'));

console.log('Socket server running');

var io = require('socket.io')(server);
// var shared = io.of('/sharedScreen')
*/

//new -- use for both
var path = require('path');

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/sharedScreen', function(req,res){
  res.sendFile(path.join(__dirname + '/public/sharedIndex.html'));
});

setInterval(heartbeat, 33);
function heartbeat(){ //so this is the only thing sent from server???
  io.sockets.emit('heartbeat', atmans);
}

//- - - - - - - game states
var startGame = false; //whether or not game has started
// var time


//- - - - - - overall fud counts + points
var totalTatos, totalMorks, totalUpples, totalFud; //across whole game
var pointScale = 200; //points
var tatoPts, morkPts, upplePts;//end game value percentage for each fud type
var tatoRank, morkRank, uppleRank;//negative flip if middle rank

// - - - - - - - events
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

    socket.on('startGame',
      function(){
        startGame = true;
        console.log(startGame);
      })

    socket.on('update',
      function(data){
        if (atmans.length >= 2){ //so only starts if at least 2 players?
          var atman;
          totalTatos = 0;
          totalMorks = 0;
          totalUpples = 0;
          totalFud = 0;
          for (var i = 0; i < atmans.length; i++){
            if (socket.id == atmans[i].id){
              atman = atmans[i]; //why in front?
              atman.x = data.x;
              atman.y = data.y;
              atman.t = data.t;
              atman.m = data.m;
              atman.u = data.u;
            }
            totalTatos += atmans[i].t;
            totalMorks += atmans[i].m;
            totalUpples += atmans[i].u;
          }
          totalFud = totalTatos + totalMorks + totalUpples;
          // console.log(totalFud, totalTatos, totalMorks, totalUpples);
          rank();
          console.log(tatoRank, morkRank, uppleRank);

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

    socket.on('rankCheck?',
      function(data){
        var data = {
          tRank: tatoRank,
          mRank: morkRank,
          uRank: uppleRank
        }
        console.log('rankCheck ' + socket.id);
        io.to(socket.id).emit('rankCheck', data);
        // socket.broadcast.to(socket.id).emit('rankCheck', data); //broadcast bad?
      }
    );

    socket.on('gameOver',
      function(){
        socket.broadcast.emit('gameOverC'); //just testing client vs main
        fudMath();
      }
    );

    socket.on('disconnect',
      function(data){
        var atman;
        for (var i = 0; i < atmans.length; i++){
          if (socket.id == atmans[i].id){
            atmans.splice(i, 1);
          }
        }
        console.log("Client has disconnected");
      }
    );
  }
)

//- - - - - - - in-game fud ranking //if even at start, no bad?
function rank(){
  if (((totalTatos > totalMorks) || (totalTatos > totalUpples))
    && ((totalTatos < totalMorks) || (totalTatos < totalUpples))){
      tatoRank = -1;
      morkRank = 1;
      uppleRank = 1;
    }
  else if (((totalMorks > totalTatos) || (totalMorks > totalUpples))
    && ((totalMorks < totalTatos) || (totalMorks < totalUpples))){ //else if?
      tatoRank = 1;
      morkRank = -1;
      uppleRank = 1;
    }
  else if (((totalUpples > totalTatos) || (totalUpples > totalMorks))
    && ((totalUpples < totalTatos) || (totalUpples < totalMorks))){ //else if?
      tatoRank = 1;
      morkRank = 1;
      uppleRank = -1;
    }
  else{
    console.log('rank bumb'); //meaningless test
    }
  }



// - - - - - - fud math at end
function fudMath(){
  totalFud = totalTatos + totalMorks + totalUpples;
  tatoPts = totalTatos / totalFud * pointScale * tatoRank;
  morkPts = totalMorks / totalFud * pointScale * morkRank;
  upplePts = totalUpples / totalFud * pointScale * uppleRank;
}
