/*global io*/
let socket = io().connect('https://exciting-gray-event.glitch.me/', {'path': '/chat'});

$(document).ready(function () {
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
