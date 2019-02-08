"use strict";

var app = angular.module("helloWorld", ["firebase"]);

app.controller("ctrl", function ($scope, $firebaseArray) {
  var ref = new Firebase("https://say-hello-to-world-16547.firebaseio.com/eshayat");

  var random = function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  };
  var getColor = function getColor() {
    var colors = ['#f44336', '#ffc107', '#4caf50', '#03a9f4', '#9c27b0', '#ffffff', '#607d8b', '#e91e63', '#ff9800', '#009688'];
    return colors[random(0, colors.length)];
  };

  var filter = function filter(message) {
    var exp = new RegExp('nigga', 'i');
    if (exp.test(message)) {
      return "💖";
    } else {
      return message;
    }
  };

  $scope.getColor = getColor();

  $scope.messages = $firebaseArray(ref);
  $scope.addMessage = function (event) {
    event.preventDefault();
    $scope.messages.$add({
      message: filter($scope.message),
      color: $scope.getColor
    });
    $scope.message = "";
    $scope.getColor = getColor();
      alert('Thanks 👊👊👊');
  };
});
