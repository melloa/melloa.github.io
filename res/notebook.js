var canvas, mouseState = 0, timer, context; // 0 - no movement, 1 - down, 2 - long press
var x = new Array(new Array());
var y = new Array(new Array());
var startDraggingXY = new Array(2);

$(window).load(function(){
  canvas = document.getElementById("canvasPaper");
  context  = canvas.getContext('2d');
  drawVerticalRule();
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mousemove", handleMouseMove);
});

function drawVerticalRule(){
  context.beginPath();
  context.moveTo(150, 800);
  context.lineTo(150, 0);
  context.strokeStyle = '#FF0256';
  context.stroke();
}
  

function handleMouseMove(e){
  if(mouseState > 0){
    addPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    redraw();
  }
}

function handleMouseDown(e) {
  mouseState = 1;
  target = e;                                    // store this as target element
  clearTimeout(timer);                            // clear any running timers
  timer = setTimeout(function () { mouseState = 2; createTextbox(e); }, 500); // create a new timer for this click               
  addPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  startDraggingXY[0] = e.pageX - this.offsetLeft;
  startDraggingXY[1] = e.pageY - this.offsetTop;
  console.log("P: " + startDraggingXY[0]);
  redraw();
};

function handleMouseUp(e) {
  switch(mouseState) { 
    case 2:                          // if a long press, cancel
      e.preventDefault();                             // and ignore this event
      createTextbox(e);
      break;
    case 1:                                    // if we came from down status:
      clearTimeout(timer);                        // clear timer to avoid false longpress
      break;
  } 
  mouseState = 0;
};

function addPoint(pointX, pointY){
  var len = x.length;
  x[len - 1].push(pointX);
  y[len - 1].push(pointY);
}

function createTextbox(e){
  console.log("inside!" + startDraggingXY[0] + "  " + e.pageX + "  " + this.offsetLeft);
  if(startDraggingXY[0] - (e.pageX - this.offsetLeft) < 1){
    alert('hi');
    var input = new CanvasInput({
      canvas: document.getElementById('canvasPaper'),
      backgroundColor: 'transparent',
      fontSize: 18,
      fontFamily: 'Arial',
      fontColor: '#212121',
      width: 300,
      borderWidth: 1,
      x: e.pageX - this.offsetLeft,
      y: e.pageY - this.offsetTop
    });
  }
}
function redraw(){
  var context = canvas.getContext('2d');
  context.clearRect(152, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  
  context.strokeStyle = "#444444";
  context.lineJoin = "round";
  context.lineWidth = 3;
      
  for(var i = 0; i < x.length; i++) {    
    for(var j = 1; j < x[i].length; j++){
      context.beginPath();
      context.moveTo(x[i][j-1], y[i][j-1]);
      context.lineTo(x[i][j], y[i][j]);
      context.closePath();
      context.stroke();
    }
  }
}