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

    /**
     * init called when page loads
     */
    $scope.init = function() {
      addUserToRoom();
    };
    /**
     * send user and room information to server to be stored in DB (i.e. add this user to room in DB)
     * with emit 'join-room' event
     * set up 'serversend' listener for chat messages
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


    };
    /**
     * send chat message by emitting to roomId (which means only that room will receive message)
     */
    $scope.sendChat = function() {
      var message = $scope.userMessage;
      var userId = Auth.getCurrentUser()._id;
      var username = Auth.getCurrentUser().name;
      console.log('sendChat called ', $scope.userMessage);
      socket.emit(roomId, userId, username, message);
      $scope.userMessage = "";
    };

    socket.on('serversend', function(username, message) {
      console.log(444444, username, message);
      var newMessage = '<div><span class="chatUserName">'+username+': </span><span class="message">' +message+ '</span>';
      angular.element('.chat-box').append(newMessage);
    });






  }]);
