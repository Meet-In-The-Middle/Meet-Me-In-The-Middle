'use strict';

angular.module('meetMeInTheMiddleApp')

  .controller('roomsCtrl', ['$scope', '$http', 'Auth', 'MainFactory',
    function ($scope, $http, Auth, MainFactory) {
    //profile controller methods
    var user = Auth.getCurrentUser();
    console.log('user is ', user);
    $scope.user = {};

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
        console.log('rooms is ', rooms);
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
      var newRoom = {
        name: $scope.editableText,
        users: [
          {
            _id: user._id,
            name: user.name,
            latitude: 54.2058804,
            longitude: 1.1453831999999693,
            owner: true
          }],
        info: 'How awesome',
        active: true
      };
      MainFactory.createRoom(newRoom, function() {
        $scope.getRooms();
      });
      $scope.disableEditor();
    };

  }]);


