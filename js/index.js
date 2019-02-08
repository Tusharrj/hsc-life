/*
* === Menu Toggle ===
*/

jQuery(".menu-toggle").on('click', function() {
  jQuery(this).toggleClass("on");
  jQuery('.menu-section').toggleClass("on");
  jQuery("nav ul").toggleClass('hidden');
});
