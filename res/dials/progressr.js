// Javascript Backend for Progressr
var canvasWidth = 0;
var dialTitle = [];
var size = 140;		// radius in pixels
var dialNumber = 0;
var dialsPerRow;
var spacing;		// spacing between dials for different screen sizes
var dialStats = []; // 2D array - [percentage, time, number of additions]
var activeDial = -1; // Dial that is currently being modified
var textHeight = [];
var dialLocation = [];

function setupAppSize(){
	var context =  document.getElementById('myCanvas').getContext('2d');
	context.canvas.width  = window.innerWidth;
	context.canvas.height = window.innerHeight - 65;
	canvasWidth = context.canvas.width;
	dialsPerRow = Math.floor(context.canvas.width / 360);
	spacing = context.canvas.width / dialsPerRow;
	updateTimeEstimated();
	$( "#percentComplete" ).val( "0%");
	$( "#timeSpent" ).val( "0 min");
}

function createDial(percentage, time, title){
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	var stats = [percentage, time, 1];
	dialTitle.push(title);
	dialStats.push(stats);
	dialLocation.push([0,0]);
	redrawDial(dialNumber);
	dialNumber++;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	for(var i = 0; i < dialNumber; i++)
		redrawDial(i);
	
	updateTimeEstimated();
}

function redrawDial(n){
	var canvas = document.getElementById('myCanvas');
	var percentage = dialStats[n][0];
	var context = canvas.getContext('2d');
	var startAngle = (0.5 - percentage/100) * Math.PI; // startAngle must be greater than endAngle
	var endAngle = (0.5 + percentage/100) * Math.PI;
	var w = parseInt(dialNumber/4) == parseInt(n/4) ? ((dialNumber - 1) % dialsPerRow) + 1 : (dialNumber > dialsPerRow ? dialsPerRow : dialNumber);
	var x = 2 * (n % dialsPerRow + 0.5) * (canvasWidth / w) / 2;		
	var y = (Math.floor(n / dialsPerRow ) + 1) * (spacing + 60) - 230;
	
	dialLocation[n] = [x, y];
	if(context.canvas.height < (y + 2 * size))
		context.canvas.height = y + 5+ 2 * size;

	context.beginPath();
	context.arc(x, y, size + size / 28, 0, 2 * Math.PI, false);
	context.fillStyle = '#fff';
	context.fill();	
	context.lineWidth = size / 14;
	context.strokeStyle = '#444';
	context.stroke();

	context.beginPath();
	context.arc(x, y, size, startAngle, endAngle, false);
	context.closePath();
	context.fillStyle = 'hsl(' + (percentage * 2.55 / 2) + ', 80%, 60%)';
	context.fill();

	
	context.font = "60px Arial";
	context.fillStyle = '#444';
	context.textAlign = "center";
	context.fillText(percentage + "%", x + 5, y + 25); 
	context.font = "40px Arial";
	wrapText(context, dialTitle[n], x + 5, y + 1.5 * size, 360, 40);
	updateTimeEstimated();
}

function updateTimeEstimated(){
	var totalTime = 0;
	if(dialStats.length > 0)
	{
		for(var i = 0; i < dialNumber; i++)
			totalTime += dialStats[i][1] / (dialStats[i][0] / 100);
		dialStats[0][2]++;
		if(totalTime > 0) {
			$( "#hourRemaining" ).val(Math.floor(totalTime / 60));
			$( "#minutesRemaining" ).val(Math.round(totalTime % 60));
		}
	}
	else
	{
		$( "#hourRemaining" ).val("--");
		$( "#minutesRemaining" ).val("--");
	}

}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > maxWidth && n > 0) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	context.fillText(line, x, y);
}

function contains(n, x, y){
    return (x >= dialLocation[n][0] - size &&
            x <= dialLocation[n][0] + size &&
            y >= dialLocation[n][1] - size && 
            y <= dialLocation[n][1] + size)
}

function refreshSwatch() {
	var val = $( "#percentage-slider" ).slider( "value" );
	$( "#percentComplete" ).val( val + "%");
	var val = $( "#time-slider" ).slider( "value" );
	$( "#timeSpent" ).val( 5* val + " min");
}

$(window).load(function(){
	setupAppSize();	
	$('#add-dial-btn').click(function(e){  			
		$('.overlay, .popup').fadeIn();
		$('.adding-popup, #create-dial').show();
		$('.modifying-popup, #update-dial').hide();
		$( "#percentage-slider" ).slider( "value", 0 );
		$( "#time-slider" ).slider( "value", 0 );
		var form = document.getElementById("dial-title");
		form.value = '';
	});
	$('.overlay, .control-btn').click(function(e){  			
		$('.overlay, .popup').fadeOut();
	});
	$('#create-dial').click(function(e){  			
		var percentage = $( "#percentage-slider" ).slider( "value" );
		var time = $( "#time-slider" ).slider( "value" ) * 5;
		var form = document.getElementById("dial-title");
		var title = form.value;
		form.value = '';
		createDial(percentage, time, title);
		
	});
	$('#update-dial').click(function(e){  
		var p = $( "#percentage-slider" ).slider( "value" );
		var t = $( "#time-slider" ).slider( "value" );
		var pDiff = (p - dialStats[activeDial][0]) / 100;
		dialStats[activeDial][0] = p;
		dialStats[activeDial][1] = t / pDiff;
		dialStats[activeDial][2]++;
		dialTitle[activeDial] = document.getElementById("dial-title").value;
		redrawDial(activeDial);
	});
	$( "#percentage-slider, #time-slider" ).slider({
		change: refreshSwatch,
		slide: refreshSwatch
	});
	$('#myCanvas').click(function (e) {
		var clickedX = e.pageX - this.offsetLeft;
		var clickedY = e.pageY - this.offsetTop;
		 
		for (var i = 0; i < dialNumber; i++) {
			if (contains(i, clickedX, clickedY)) {
				$( "#percentage-slider" ).slider( "value", dialStats[i][0] );
				$( "#time-slider" ).slider( "value", dialStats[i][1] / 5);
				$('.adding-popup, #create-dial').hide();
				$('.modifying-popup, #update-dial').show();
				$('.overlay, .popup').fadeIn();
				document.getElementById("dial-title").value = dialTitle[i];
				activeDial = i;
			}
		}
	});
});