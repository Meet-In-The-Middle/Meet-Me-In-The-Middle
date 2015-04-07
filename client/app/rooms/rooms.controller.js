'use strict';

angular.module('meetMeInTheMiddleApp')

  .controller('roomsCtrl', ['$scope', '$http', 'Auth', 'UserImage',
    function ($scope, $http, Auth, UserImage) {
    //profile controller methods
    var user = Auth.getCurrentUser();
    console.log('user is ', user);
    $scope.user = {};

      /**
       * initial page on load to show rooms user belongs to
        */
    $scope.init = function () {
      $scope.user.name = user.name;
      //load rooms the user is in, ie query DB for users rooms (rooms)
      $scope.getRooms();

    };

    $scope.getRooms = function() {
      UserImage.getRoomsForUser(user._id, function(rooms) {
        console.log('rooms is ', rooms);
        $scope.rooms = rooms;
      });
      //return an array of rooms
    }



    $scope.editorEnabled = false;
    $scope.enableEditor = function() {
      $scope.editorEnabled = true;
      $scope.editableText = $scope.user.about;
    };
    $scope.disableEditor = function() {
      $scope.editorEnabled = false;
    };
    $scope.saveText = function() {
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
      UserImage.createRoom(newRoom, function() {
        $scope.getRooms();
      });
      $scope.disableEditor();
      //save new user room name to DB using socket.io(?) with user as first object in room array
    };

  }]);


