$(document).ready(function () {
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});

/*global io*/
var socket = io();

socket.on('user count', function(data) {
  console.log(data);
});

socket.on('disconnect', () => {
  /*anything you want to do on disconnect*/
  
});