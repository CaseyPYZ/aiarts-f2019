let video;
let poseNet;
let poses;
let num;

let particles = [];
let destinations = [];

function setup() {
  createCanvas(800, 600);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function (results) {
    poses = results;
  });

  destinations.push( [{position:{x:width, y:height}}] );
  console.log("After setup  ", destinations);

  num = 0;
}


function modelReady() {
  console.log("Model Ready!");
}


function draw() {
  background(30);
  fill(180,0,180);

  //console.log(destinations);

  if (poses != undefined ) {

    //console.log("POSES  ",poses);

    for (let i = 0; i < poses.length; i++) {

      /* left ear IN - destinations */
      let left_ear = poses[i].pose.keypoints.filter((it)=>{return it.part === 'leftEar'});
      if (left_ear[0].score>0.8) {
        destinations[i] = left_ear;
        console.log("Num of poses: ", poses.length, "destArray: ",destinations);

      }

      /* right ear OUT - start */
      let right_ear = poses[i].pose.keypoints.filter((it)=>{return it.part === 'rightEar'});
      if(right_ear[0].score>0.8){
        particles.push( new Particle(right_ear, destinations[i], i) );

      }

    }
  }

  
  push();
  translate(width,0);
  scale(-1.0,1.0);
  image(video, 0, 0, width, height);
  pop();
  

  // update and display particles
  for (let i=0; i<particles.length; i++) {
    let p = particles[i];
    p.update();
    p.move();
    if(!p.arrive){
      p.display();
    }
  }

  // limit the number of particles
  if (particles.length > 80) {
    particles.splice(0, 1);
  }

  
  // for(let i=0; i<destinations.length; i++){
  //   if(destinations[i] != undefined){
  //     noStroke();
  //     fill(200,0,200);
  //     let d = destinations[i][0];
  //     console.log(d);
  //     ellipse(d.position.x, d.position.y, 20);
  //   }
  // }

}

class Particle {
  constructor(start, end, endi){
    this.start = start[0];
    this.end = end[0];

    this.x = width - this.start.position.x;
    this.y = this.start.position.y;
    this.xspd = 1;
    this.yspd = 1;
    this.size = random(12, 22);
    this.color = color(random(255),random(255),random(255));

    
    this.destid = endi;
    this.destx = width - this.end.position.x;
    this.desty = this.end.position.y;
    this.xarrive = false; 
    this.yarrive = false;
    this.arrive = false;

    this.easing = 0.02;
  }

  display() {
    fill(this.color);
    textSize();
    textStyle(BOLD);
    text("yo", this.x, this.y);
  }

  move() {

    let dx = this.destx - this.x;
    this.x += dx * this.easing;

    let dy = this.desty - this.y;
    this.y += dy * this.easing;

    if( (dx>-5 && dx<5) && (dy>-5 && dy<5) ){
      this.arrive = true;
    }

  }

  update(){
    this.destx = width - destinations[this.destid][0].position.x;
    this.desty = destinations[this.destid][0].position.y;
  }

}
