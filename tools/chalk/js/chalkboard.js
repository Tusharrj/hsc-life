jQuery(document).ready(chalkboard);
function chalkboard(){
	jQuery('#chalkboard').remove();
	jQuery('.chalk').remove();
	jQuery('body').prepend('<canvas id="chalkboard"></canvas>');
	jQuery('body').prepend('<div class="chalk"></div>');

	var canvas = document.getElementById("chalkboard");
	jQuery('#chalkboard').css('width',jQuery(window).width());
	jQuery('#chalkboard').css('height',jQuery(window).height());
	canvas.width = jQuery(window).width();
	canvas.height = jQuery(window).height();

	var ctx = canvas.getContext("2d");

	var width = canvas.width;
	var height = canvas.height;
	var mouseX = 0;
	var mouseY = 0;
	var mouseD = false;
	var xLast = 0;
	var yLast = 0;
	var brushDiameter = 5;

	jQuery('#chalkboard').css('cursor','none');
	document.onselectstart = function(){ return false; };
	ctx.fillStyle = 'rgba(255,255,255,0.5)';
	ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = brushDiameter;
	ctx.lineCap = 'round';

	document.addEventListener('touchmove', function(evt) {
        var touch = evt.touches[0];
        mouseX = touch.pageX;
        mouseY = touch.pageY;
        if (mouseY < height && mouseX < width) {
            evt.preventDefault();
            jQuery('.chalk').css('left', mouseX + 'px');
            jQuery('.chalk').css('top', mouseY + 'px');
            //jQuery('.chalk').css('display', 'none');
            if (mouseD) {
                draw(mouseX, mouseY);
            }
        }
    }, false);
    document.addEventListener('touchstart', function(evt) {
        //evt.preventDefault();
        var touch = evt.touches[0];
        mouseD = true;
        mouseX = touch.pageX;
        mouseY = touch.pageY;
        xLast = mouseX;
        yLast = mouseY;
        draw(mouseX + 1, mouseY + 1);
    }, false);
    document.addEventListener('touchend', function(evt) {
        mouseD = false;
    }, false);
    jQuery('#chalkboard').css('cursor','none');
	ctx.fillStyle = 'rgba(255,255,255,0.5)';
	ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = brushDiameter;
	ctx.lineCap = 'round';

	jQuery(document).mousemove(function(evt){
		mouseX = evt.pageX;
		mouseY = evt.pageY;
		if(mouseY<height && mouseX<width){
			jQuery('.chalk').css('left',(mouseX-0.5*brushDiameter)+'px');
			jQuery('.chalk').css('top',(mouseY-0.5*brushDiameter)+'px');
			if(mouseD){
				draw(mouseX,mouseY);
				}
		}else{
			jQuery('.chalk').css('top',height-10);
			}
		});
	jQuery(document).mousedown(function(evt){
		mouseD = true;
		xLast = mouseX;
		yLast = mouseY;
		draw(mouseX+1,mouseY+1);
		});
	jQuery(document).mouseup(function(evt){
		mouseD = false;
		});

	function draw(x,y){
		ctx.strokeStyle = 'rgba(255,255,255,'+(0.4+Math.random()*0.2)+')';
		ctx.beginPath();
  		ctx.moveTo(xLast, yLast);
  		ctx.lineTo(x, y);
  		ctx.stroke();

  		// Chalk Effect
		var length = Math.round(Math.sqrt(Math.pow(x-xLast,2)+Math.pow(y-yLast,2))/(5/brushDiameter));
		var xUnit = (x-xLast)/length;
		var yUnit = (y-yLast)/length;
		for(var i=0; i<length; i++ ){
			var xCurrent = xLast+(i*xUnit);
			var yCurrent = yLast+(i*yUnit);
			var xRandom = xCurrent+(Math.random()-0.5)*brushDiameter*1.2;
			var yRandom = yCurrent+(Math.random()-0.5)*brushDiameter*1.2;
    		ctx.clearRect( xRandom, yRandom, Math.random()*2+2, Math.random()+1);
			}


		xLast = x;
		yLast = y;
		}

	jQuery(window).resize(function(){
			chalkboard();
		});

	}
