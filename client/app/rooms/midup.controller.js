'use strict';

angular.module('meetMeInTheMiddleApp')

.controller('midUpCtrl', ['$scope', '$http', '$location','Auth', 'MainFactory', 'SocketFactory',
  function ($scope, $http, $location, Auth, MainFactory, SocketFactory) {
    var user = Auth.getCurrentUser();
    var userId = user._id;
    var username = user.name;
    var socket = SocketFactory.socket;
    console.log('user  ', user);
    $scope.user = {};
    var url = $location.$$path.split('/');
    var roomId = url[url.length - 1];
    console.log('roomId is ', roomId);

    $scope.init = function() {
      addUserToRoom();
    };

    $scope.sendChat = function() {
      var message = $scope.userMessage;
      console.log('sendChat called ', $scope.userMessage);
      socket.emit(roomId, userId, username, message);
    };

/*
    var addUserToRoom = function() {
      var userRoomObj = {
        roomId: roomId,
        user: {
            _id: user._id,
            name: user.name,
            coords: {
              latitude: "",
              longitude: "",
            },
            owner: false
          },
        info: 'How awesome',
        active: true
      };
       MainFactory.addUserToRoom(userRoomObj, function(data) {
         console.log('data coming back from addUserToRoom in controller ', data);
        //do something with the data coming back
       });
    };
*/

    var addUserToRoom = function() {
      //User object to be sent to server and DB
      var userRoomObj = {
        roomId: roomId,
        user: {
          _id: user._id,
          name: user.name,
          coords: {
            latitude: "",
            longitude: ""
          },
          owner: false
        },
        info: 'How awesome',
        active: true
      };


      socket.emit('join-room', userRoomObj);

      //var message = 'Rioa and Jonah working hard';
      //var sumbitMessage = (function(roomId) {
      //  socket.emit('chat', roomId);
      //  socket.emit(roomId, 'Hey roomId works');
      //})(roomId);

      socket.on('serversend', function(username, message) {
        console.log(444444, username, message);
      });

    };






  }]);
