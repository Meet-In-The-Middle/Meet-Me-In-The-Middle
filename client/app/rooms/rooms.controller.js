'use strict';

angular.module('meetMeInTheMiddleApp')
.controller('roomsCtrl', ['$scope', '$http', '$location', 'Auth', 'MainFactory', 'SocketFactory',
  function ($scope, $http, $location, Auth, MainFactory, SocketFactory) {

    //profile controller methods
    var user = Auth.getCurrentUser();
    console.log('user is ', user);
    var userId = user._id;
    $scope.user = {};
    var url = $location.$$path.split('/');
    var roomId = url[url.length - 1];

      /**
       * initial page on load to show rooms user belongs to
       * and to set $scope elements for editable text box to create new room (midup)
        */
    $scope.init = function () {
      $scope.user.name = user.name;
      //load rooms the user is in, ie query DB for users rooms (rooms)
      $scope.getRooms();
      editableTextBox();
    };

    $scope.getRooms = function() {
      MainFactory.getRoomsForUser(user._id, function(rooms) {
        console.log('rooms for this user are ', rooms);
        $scope.rooms = rooms;
      });
      //return an array of rooms
    }

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
        $scope.getRooms();
      });
      $scope.disableEditor();
    };

  }]);


