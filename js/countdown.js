// COUNTDOWN
function makeTimer(){

	var endTime = new Date("02 April 2018 10:00:00 GMT+06:00");
	endTime = (Date.parse(endTime) / 1000);

	var now = new Date();
	now = (Date.parse(now) / 1000);

	var timeLeft = endTime - now;

	var days = Math.floor(timeLeft / 86400);
	var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
	var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600 )) / 60);
	var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));

	jQuery("#countdowndays p").html(days + " Days");
	jQuery("#countdownhours p").html(hours + " Hours");
	jQuery("#countdownmins p").html(minutes + " Minutes");
	jQuery("#countdownsecs p").html(seconds + " Seconds");

	//ADAPT FONT SIZE
	var fontwidth1 = jQuery('#countdowndays p').width();
  var divwidth = jQuery('.box').width();
  var size1 = parseFloat(jQuery('#countdowndays p').css('font-size'));
  var fontsize1 = (divwidth / fontwidth1) * size1;

  var fontwidth2 = jQuery('#countdownhours p').width();
  var divwidth = jQuery('.box').width();
  var size2 = parseFloat(jQuery('#countdownhours p').css('font-size'));
  var fontsize2 = (divwidth / fontwidth2) * size2;

  var fontwidth3 = jQuery('#countdownmins p').width();
  var divwidth = jQuery('.box').width();
  var size3 = parseFloat(jQuery('#countdownmins p').css('font-size'));
  var fontsize3 = (divwidth / fontwidth3) * size3;

  var fontwidth4 = jQuery('#countdownsecs p').width();
  var divwidth = jQuery('.box').width();
  var size4 = parseFloat(jQuery('#countdownsecs p').css('font-size'));
  var fontsize4 = (divwidth / fontwidth4) * size4;

  jQuery('#countdowndays p').css("font-size", fontsize1);
  jQuery('#countdownhours p').css("font-size", fontsize2);
  jQuery('#countdownmins p').css("font-size", fontsize3);
  jQuery('#countdownsecs p').css("font-size", fontsize4);
}
// update every second
setInterval(function() { makeTimer(); }, 1000);
