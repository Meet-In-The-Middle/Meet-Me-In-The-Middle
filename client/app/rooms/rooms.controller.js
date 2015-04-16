'use strict';

angular.module('meetMeInTheMiddleApp')
.controller('roomsCtrl', ['$scope', '$http', '$location', '$q', 'Auth', 'MainFactory', 'SocketFactory',
  function ($scope, $http, $location, $q,  Auth, MainFactory, SocketFactory) {

    //profile controller methods
    var user = Auth.getCurrentUser();
    console.log('user is ', user);
    var userId = user._id;
    console.log('userId is ', userId);
    $scope.user = {};
    $scope.inviteEmails = {};
    $scope.clickedFlag = false;
    var url = $location.$$path.split('/');
    var roomId = url[url.length - 1];
    var socket = io();
    /**
       * initial page on load to show rooms user belongs to
       * and to set $scope elements for editable text box to create new room (midup)
        */
    $scope.init = function () {
      $scope.user.name = user.name;
      editableTextBox();
      emailInviteInit();
    };

    //load rooms the user is in, ie query DB for users rooms (rooms)
    var asyncGetRooms = function(Id) {
      return $q(function(resolve, reject) {
        setTimeout(function() {
          console.log('got into setTimeout');
          if( Id ) {
            console.log('Id is ', Id);
            resolve(Id);
          }
        }, 500);
      });
    };

    var promise = asyncGetRooms(Auth.getCurrentUser());
    promise.then(function() {
      console.log('got into promise.then');
      getRooms();
    });
    var getRooms = function() {
      console.log('Auth.getCurrentUser()._id is ', Auth.getCurrentUser()._id);
      MainFactory.getRoomsForUser(Auth.getCurrentUser()._id, function(rooms) {
        console.log('rooms for this user are ', rooms);
        $scope.rooms = rooms;
      });
      //return an array of rooms
    };
    /**
     * Set $scope elements for create room button to show input to get new room name
     */
    var editableTextBox = function() {
      $scope.editorEnabled = false;
      $scope.enableEditor = function() {
        $scope.editorEnabled = true;
        $scope.editableText = $scope.user.about;
      };
      $scope.disableEditor = function() {
        $scope.editorEnabled = false;
      };
    };
    /**
     * User creates new room which will be sent to DB and then re-populate rooms list
     */
    $scope.createRoom = function() {
      var userRoomObj = {
        roomId: roomId,
        name: $scope.editableText,
        user: {
          _id: user._id,
          name: user.name,
          coords: {
            latitude: "",
            longitude: "",
          },
          owner: true
        },
        info: 'How awesome',
        active: true
      };


      MainFactory.createRoom(userRoomObj, function() {
        getRooms();
      });
      $scope.disableEditor();
    };

    /////////Handle email invitations//////////
    var emailInviteInit = function() {
      $scope.inviteEnabled = false;
    };

    $scope.enableInvite = function(roomId) {
      console.log('roomId ', roomId);
      $scope.inviteEnabled = function(room) {
        return room === roomId? true: false;
      };
      //$scope.inviteEmails = $scope.emails;
    };

    $scope.disableInvite = function() {
      $scope.inviteEnabled = false;
    };

    $scope.clicked = function() {
      console.log('clicked was called');
      $scope.clickedFlag = true;
    }

    $scope.keyUp = function() {
      $scope.clickedFlag = false;
    };
    console.log('socket is ', socket);
    $scope.sendEmailInvites = function(roomId, roomName) {
      console.log('sendEmailInvites called', $scope.inviteEmails);
      var pattern = /\s*[,;]\s*/;
      var emails = $scope.inviteEmails[roomId].split(pattern);
      //console.log('emails is ', emails);
      socket.emit('email-invites', emails, roomId, user.name, roomName);
      socket.on('email-invites-reply', function(message) {
        console.log('email-invite-reply ', message);
      });

    };

  }]);


