var face = [];
var position = {x:0, y:0};
var scale = 0;
var orientation = {x:0, y:0, z:0};
var mouthWidth = 0;
var mouthHeight = 0;
var eyebrowLeft = 0;
var eyebrowRight = 0;
var eyeLeft = 0;
var eyeRight = 0;
var jaw = 0;
var nostrils = 0;
var imgArray = new Array();
var on = false;

function setup() {
	var cnv = createCanvas(600, 450);
	var x = (windowWidth-width) / 2;
	cnv.position(x,0);
	background(0);
	setupOsc(8338, 3334);
	imgArray[0] = loadImage("assets/owl1.jpg");
	imgArray[1] = loadImage("assets/owl2.jpg");
	imgArray[2] = loadImage("assets/owl3.jpg");
	imgArray[3] = loadImage("assets/owl4.jpg");
	imgArray[4] = loadImage("assets/owl5.jpg");
	imgArray[5] = loadImage("assets/owl6.jpg");
	imgArray[6] = loadImage("assets/owl7.jpg");
	imgArray[7] = loadImage("assets/owl8.jpg");
}

function draw() {
  	background(0);

	// FACE_OUTLINE : 0 - 16
	// LEFT_EYEBROW : 17 - 21
	// RIGHT_EYEBROW : 22 - 26
	// NOSE_BRIDGE : 27 - 30
	// NOSE_BOTTOM : 31 - 35
	// LEFT_EYE : 36 - 41
	// RIGHT_EYE : 42 - 47
	// INNER_MOUTH : 48 - 59
	// OUTER_MOUTH : 60 - 65

	if (face.length > 0) {
		var faceParts = [[0,16], [17,21], [22,26], [27,30], [31,35], [36,41], [42,47], [48,59], [60,65]];
		noFill();
		stroke(255);
		for (var i = 0; i < faceParts.length; i++) {
			beginShape();
			for (var j = faceParts[i][0]; j <= faceParts[i][1]; j++) {
				vertex(face[j].x, face[j].y);
			}
			endShape();
		}	
	}

	var scalez = map(scale, 2, 8, 0.2, 1.8)

	rectMode(CENTER)
	ellipse(position.x + 50*scalez, position.y - 50*scalez, 10*mouthHeight*scalez*scalez, 10*mouthHeight*scalez*scalez)
	ellipse(position.x - 50*scalez, position.y - 50*scalez, 10*mouthHeight*scalez*scalez, 10*mouthHeight*scalez*scalez)
	triangle(position.x - 10*scalez, position.y - 10*scalez, position.x + 10*scalez, position.y -10*scalez, position.x, position.y + 15*scalez)
	
	rect(position.x, position.y + 80*scalez, 10*mouthHeight*scalez*scalez, 10*mouthHeight*scalez*scalez)

	var text1 =  mouthHeight;
	textAlign(CENTER);
	fill(color(255,255,255))
	//text(text1, 200, height-10);

	if (10*mouthHeight*scalez*scalez > 220){
		if (!on){
			i = Math.floor(random(0,8));
			img = imgArray[i];
			imageMode(CORNER);
			image(img, 0, 0, 600, 450);
			on = true;
		}
		imageMode(CORNER);
		image(img, 0, 0, 600, 450);
	}
	else if  (mouthHeight > 4){
		text("careful...", 30, height-10);
		on = false;
	} else {
		on = false;
	}
	
	
}

function receiveOsc(address, value) {
	if (address == '/raw') {
		face = [];
		for (var i=0; i<value.length; i+=2) {
			face.push({x:value[i], y:value[i+1]});
		}
	}
	else if (address == '/pose/position') {
		position = {x:value[0], y:value[1]};
		print(position);
	}
	else if (address == '/pose/scale') {
		scale = value[0];
	}
	else if (address == '/pose/orientation') {
		orientation = {x:value[0], y:value[1], z:value[2]};
	}
	else if (address == '/gesture/mouth/width') {
		mouthWidth = value[0];
	}
	else if (address == '/gesture/mouth/height') {
		mouthHeight = value[0];
	}
	else if (address == '/gesture/eyebrow/left') {
		eyebrowLeft = value[0];
	}
	else if (address == '/gesture/eyebrow/right') {
		eyebrowRight = value[0];
	}
	else if (address == '/gesture/eye/left') {
		eyeLeft = value[0];
	}
	else if (address == '/gesture/eye/right') {
		eyeRight = value[0];
	}
	else if (address == '/gesture/jaw') {
		jaw = value[0];
	}
	else if (address == '/gesture/nostrils') {
		nostrils = value[0];
	}
}

function setupOsc(oscPortIn, oscPortOut) {
	var socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {	
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}