console.log('test');
var socket = io();

var testButton;

function setup(){
  createCanvas(500,500);
  testButton = createButton('start Game');
  testButton.mousePressed(startGame);
}


function draw (){
  ellipse(50,50,50,50);
}

function startGame(){
  socket.emit('startGame');
  console.log('sent');
}
