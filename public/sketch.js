//var socket;
var socket = io(); // I think this is what did it

var atman;
var atmans = [];

var bgColor;
//- - - - - player setup
var input, submit, redSlide, greenSlide, blueSlide, colorChoose, startButt;
var name = ' ';
var redCol = 0;
var greenCol = 0;
var blueCol = 0;
var shapeYes = true; //no shapes yet
var colorYes = false; //if selected color
var nameYes = false; //if input name
var joined = false; //if they've left character creation
var tutorial = false; //if they did the tutorial
var gameSetup = false; //game setup after player creation UGH "setup"

//- - - - -  trading
var tradeTarget = ' '; // player selected
var tradeId; //player's id
var tradeFud = ' '; // item selected
// var tradeCan = false; //if both above are true, can trade
var tradeButt; //trade button
var tradeMsg = false; //for msg overlay
var lastTrader; //person last traded with
var tatos, morks, upples; //fud buttons
//fud item containers
var tato = 0;
var mork = 0;
var upple= 0;
//trade quantity
var tato4u = 0;
var mork4u = 0;
var upple4u = 0;
//debounce
var oneTrade = true; //trade debounce;
var tradeTime = 1000;// for trade
var lastTrade = 0;
var debounce = 500;


//- - - - - - - - map
var slots = []; //nested array?

function setup(){
	//- - - - - overall
	var screenSize = windowHeight - 100;
	var canvas = createCanvas(int(screenSize * .666), screenSize);
 	canvas.parent('myCanvas');
	// bgColor = color(0, 150, 50); //should have same bg I guess
	background(0, 150, 50);
	textAlign(CENTER);

	// - - - - -  player start screen
	textSize(30);
	fill(0);
	text('Choose Your Color', width/2, height/12);
	redSlide = createSlider(0,255,40);
	redSlide.position(width/3, 3 * height/7 - height/20);
	greenSlide = createSlider(0,255,255);
	greenSlide.position(width/3, 3 * height/7);
	blueSlide = createSlider(0,255,188);
	blueSlide.position(width/3, 3 * height/7 + height/20);
	colorChoose = createButton('I want to be this color!');
	colorChoose.parent('myCanvas'); //need?
	colorChoose.position(width/3, 4 * height/7);
	colorChoose.mousePressed(colorPush);
	text('Enter Your Name', width/2, 8 * height/12);
	input = createInput('type name here');
	input.parent('myCanvas');
	input.position(width/4, 5 * height / 7);
	submit = createButton('submit name');
	submit.parent('myCanvas');
	submit.position(3* width/4, 5 * height / 7);
	submit.mousePressed(playerName);

	//map slots -- 20
	for (var y = 0; y < 5; y++){
		slots[y] = [];
		for (var x = 0; x < 4; x ++){
			slots[y][x] = {
				x: x * width/5,
				y: y * height/6
			}
		}
	}

	// - - - - - heartbeat
	socket.on('heartbeat',
		function(data){
			atmans = data;
		}
	);
}

function draw() {
	if (!joined){ //- - - - - - during setup
		if (shapeYes && colorYes && nameYes){
			if (!startButt){
				hideDom();
				startButt = createButton('START');
				startButt.parent('myCanvas');
				startButt.position(width/3, height/3);
			}
			background(155);
			fill(0);
			textSize(24);
			text('click START to join game', width/2, height/4);
			startButt.mousePressed(newPlayer);
		}
		else{
			fill(redSlide.value(), greenSlide.value(), blueSlide.value());
			ellipse(width/2, height/5, height/6, height/6);
			text(name, width/2, height/4 + 80);
			textSize(20);
			fill(redSlide.value(), 0, 0);
			text('red', width/4, 3 * height/7 - height/20);
			fill(0, greenSlide.value(), 0);
			text('green', width/4, 3 * height/7);
			fill(0, 0, blueSlide.value());
			text('blue', width/4, 3 * height/7 + height/20);
		}
	}
	else if (!gameSetup){
		if (!tutorial){
			startingFud = int(random(3));
			if (startingFud == 0){
				tato++;
			}
			else if (startingFud == 1){
				mork++;
			}
			else{
				upple++;
			}
		}
		tatos = createButton('tatos: ' + tato);
		tatos.mousePressed(tradeTato);
		morks = createButton('morks: ' + mork);
		morks.mousePressed(tradeMork);
		upples = createButton('upples:' + upple);
		upples.mousePressed(tradeUpple);
		gameSetup = true;
	}
	else{ //- - - - - after setup
		// startButt.hide();
		background(0, 150, 50); //where can I put this?
		if (tradeMsg){
			stroke(255);
			strokeWeight(2);
			textSize(24);
			fill(0);
			text("You traded with " + lastTrader, width/2, height/2);
		}
		console.log(tradeMsg);
		//update map
		for (var i = atmans.length - 1; i >= 0; i--){
			var id = atmans[i].id;
			if (id !== socket.id){
				noStroke();
				fill(atmans[i].r, atmans[i].g, atmans[i].b);
				ellipse(atmans[i].x, atmans[i].y, 30, 30);
				if(atmans[i].id == tradeId){
					stroke(255,255,0);
					strokeWeight(6);
					ellipse(atmans[i].x, atmans[i].y, 40, 40);
				}
				noStroke();
				fill(0);
				textSize(18);
				text(atmans[i].name, atmans[i].x, atmans[i].y + 40);
			}
		}
		atman.show();
		textSize(18);
		if (((atman.r + atman.g + atman.b) / 3) < 100){
			fill(255);
		}
		else {
			fill(0);
		}
		noStroke();
		text('me', atman.x, atman.y + 5);

		var data = {
			x: atman.x,
			y: atman.y,
		};
		socket.emit('update', data);

		if (tradeTarget !== ' ' && tradeFud !== ' '){
			if (oneTrade){
				tradeButt = createButton('Trade ' + tradeTarget + " a" + tradeFud);
				tradeButt.mousePressed(trade);
				oneTrade = false;
			}
		}

		socket.on('trade',
			function(data){
				tradeTime = millis();
				if(tradeTime - lastTrade >= debounce){
					tato += data.idTato;
					mork += data.idMork;
					upple += data.idUpple;
					console.log('trade from ' + data.nameFrom);
					stroke(0, 200);
					strokeWeight(2);
					fill(255, 200);
					textSize(22);
					if (data.idTato == 1){ //make individual functions, toggle, loop text
						text(data.nameFrom + " sent you a Tato", width/2, height/2);
					}
					else if (data.idMork == 1){
						text(data.nameFrom + " sent you some Mork", width/2, height/2);
					}
					else{
						text(data.nameFrom + " sent you an upple", width/2, height/2);
					}
					buttonRefresh();
					lastTrade = tradeTime;
					tradeMsg = true;
					lastTrader = data.nameFrom;
				}
			}
		);
	}
}

function mousePressed(){
	// console.log(slots);
	for (var i = atmans.length - 1; i >=0; i--){
		if((mouseX >= atmans[i].x - 20) && (mouseX <= atmans[i].x + 20)
			&& (mouseY >= atmans[i].y - 20) && (mouseY <= atmans[i].y + 20)){
					tradeMsg = false;
					if (atmans[i].id !== socket.id){
						tradeTarget = atmans[i].name;
						tradeId = atmans[i].id;
						// console.log(tradeId);
					}
		}
	}
}

function mouseDragged(){
//need to toggle so only during game, not setup?
	for (var i = atmans.length -1; i >= 0; i--){ //could be fun if they're repelling away from items
		if (socket.id !== atmans[i].id){
			if (dist(mouseX, mouseY, atmans[i].x, atmans[i].y) > 100){
				atman.x = mouseX;
				atman.y = mouseY;
				atman.show();
			}
		}
	}
}

function Atman(id, x, y, name, r, g, b){
  this.id = id;
	this.x = x;
  this.y = y;
	this.name = name;
	this.r = r;
	this.g = g;
	this.b = b;
	// this.col = color(r, g, b);
	// this.select = false;

  this.show = function(){
		// if (this.select){
		// 	stroke(255,255,0);
		// 	strokeWeight(6);
		// }
		// else{
		// 	stroke(0);
		// 	strokeWeight(3);
		// }
		noStroke();
    fill(this.r, this.g, this.b);
    ellipse(this.x, this.y, 40, 40);
  }
}

function playerName(){
	if (name !== 'me' && name !== 'Me' && name !== 'type name here'){
		name = input.value();
		nameYes = true;
	}
	else{
		input.value('please type a different name');
	}

}

function colorPush(){
	redCol = redSlide.value();
	greenCol = greenSlide.value();
	blueCol = blueSlide.value();
	colorYes = true;
	fill(redCol, greenCol, blueCol);
	text('Nice Color!', 5* width/6, 4 * height/7);
}

function hideDom(){ //all but start
	input.hide();
	submit.hide();
	redSlide.hide();
	greenSlide.hide();
	blueSlide.hide();
	colorChoose.hide();
}

function newPlayer(){
	atman = new Atman (socket.id, random(50, width - 50), random(50, height-50),
	 name, redCol, greenCol, blueCol);
	 console.log(redCol);
	var data = {
		id: atman.id,
		x: atman.x,
		y: atman.y,
		name: atman.name,
		r: redCol,
		g: greenCol,
		b: blueCol
	};

	socket.emit('start', data);
	console.log(data);
	joined = true;
	startButt.hide();
}

function trade(){
	tato -= tato4u;
	mork -= mork4u;
	upple -= upple4u;
	var data = {
		idTo: tradeId,
		idFrom: socket.id,
		nameTo: tradeTarget,
		nameFrom: atman.name,
		idTato: tato4u,
		idMork: mork4u,
		idUpple: upple4u
	}
	socket.emit('trade', data);
	console.log(data.idTato, data.idMork, data.idUpple);
	stroke(0, 200);
	strokeWeight(2);
	fill(255, 200);
	textSize(22);
	if (data.idTato == 1){
		text("You sent " + data.nameTo + " a tato", width/2, height/2);
	}
	else if (data.idMork == 1){
		text("You sent " + data.nameTo + " some mork", width/2, height/2);
	}
	else{
		text("You sent " + data.nameTo + " an upple", width/2, height/2);
	}
	resetTrade();
	tradeMsg = true;
	lastTrader = data.nameTo;
}

// function showTrade(){
// 	if (tato4u)
// }
function buttonRefresh(){
	tatos.remove();
	morks.remove();
	upples.remove();
	tatos = createButton('tatos: ' + tato);
	tatos.mousePressed(tradeTato);
	morks = createButton('morks: ' + mork);
	morks.mousePressed(tradeMork);
	upples = createButton('upples:' + upple);
	upples.mousePressed(tradeUpple);
}
function resetTrade(){
	tradeFud = ' ';
	oneTrade = true;
	tradeButt.remove();
	tato4u = 0;
	mork4u = 0;
	upple4u = 0;
	buttonRefresh();
}

function tradeTato(){
	if(tato >= 1){
		tradeFud = ' tato';
		tato4u = 1;
		mork4u = 0;
		upple4u = 0;
	}
}

function tradeMork(){
	if(mork >= 1){
		tradeFud = ' mork';
		tato4u = 0;
		mork4u = 1;
		upple4u = 0;
	}
}

function tradeUpple(){
	if(upple >= 1){
		tradeFud = 'n upple';
		tato4u = 0;
		mork4u = 0;
		upple4u = 1;
	}
}
