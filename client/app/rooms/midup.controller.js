'use strict';

angular.module('meetMeInTheMiddleApp')

.controller('midUpCtrl', ['$scope', '$http', '$location','Auth', 'MainFactory', 'SocketFactory',
  function ($scope, $http, $location, Auth, MainFactory, SocketFactory) {

    //Populate select box with the places nearby options
    $scope.places_Nearby = MainFactory.places_Nearby;
    //Holder for items selected
    $scope.possiblePlaces = [];
    $scope.selectedPlace = [];
    $scope.selectedPlaces = [];

    console.log('cont', $scope.places_Nearby);


    $scope.addPlace = function(string){
      if($scope.selectedPlaces.indexOf(string) === -1){
        console.log('about to push');
        $scope.selectedPlaces.push(string);
      }
      console.log('running');
    }
    $scope.removePlace = function(){
      var tempArr = $scope.selectedPlaces;
      var i = tempArr.indexOf($scope.selectedPlace.length-1);
      $scope.selectedPlaces = tempArr.splice(i);
      //console.log('about to push');
      //$scope.selectedPlaces.push(string);
    // }
      console.log('running');
    }


    //console.log('cont', $scope.places_Nearby);


    var user = Auth.getCurrentUser();
    var userId = user._id;
    var username = user.name;
    var socket = SocketFactory.socket;
    console.log('socket is ', socket);
    $scope.user = {};
    $scope.messages = [];
    var url = $location.$$path.split('/');
    var roomId = url[url.length - 1];
    //console.log('roomId is ', roomId);

    /**
     * init called when page loads
     */
    $scope.init = function() {
      addUserToRoom();
      loadChatMessages();
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

    var loadChatMessages = function() {
      socket.on('chat-messages', function(data) {
        $scope.messages = data;
        var chatBox = angular.element('.chat-box')
        chatBox.scrollTop = chatBox.scrollHeight;
      })
    };

    /**
     * send chat message by emitting to roomId (which means only that room will receive message)
     */
    $scope.sendChat = function() {
      var message = $scope.userMessage;
      var userId = Auth.getCurrentUser()._id;
      var username = Auth.getCurrentUser().name;
      socket.emit(roomId, userId, username, message);
      $scope.userMessage = "";
    };

    socket.on('server-chat-response', function(messageObj) {
      $scope.$apply(function() {
        $scope.messages = $scope.messages.concat(messageObj);
      });
    });






  }]);
