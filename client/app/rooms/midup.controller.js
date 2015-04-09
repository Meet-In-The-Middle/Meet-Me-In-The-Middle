'use strict';

angular.module('meetMeInTheMiddleApp')

.controller('midUpCtrl', ['$scope', '$http', '$location','Auth', 'MainFactory',
  function ($scope, $http, $location, Auth, MainFactory) {
    var user = Auth.getCurrentUser();
    var userId = user._id;
    console.log('user  ', user, 'userId ', userId);
    $scope.user = {};
    var url = $location.$$path.split('/');
    var roomId = url[url.length - 1];
    console.log('roomId is ', roomId);

    $scope.init = function() {
      addUserToRoom();
    };

    var long = 1.1453831999999693;

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







  }]);
