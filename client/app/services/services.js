'use strict';

angular.module('meetMeInTheMiddleApp')
  .factory('MainFactory', ['$http', function($http){

    var imageStore = {};
    /**
     *
     * @param userId
     * @param cb
     */
    var loadUserImage = function(userId, cb) {
      if (imageStore[userId]) {
        cb(imageStore[userId]);
      } else {
        $http.get('/userimage/' + userId)
          .success(function(url) {
            imageStore[userId] = url;
            cb(url);
          })
          .error(function() {
            console.log('Error getting user image URL');
          });
      }
    };
    /**
     *
     * @param roomObj
     * @param cb
     */
    var createRoom = function(roomObj, cb) {
      $http.post('api/rooms', roomObj)
        .success(function(data) {
          console.log('data coming back ', data);
          cb();
        })
        .error(function(error) {
          console.log('there was an error creating room ', error);
        });

    };
    /**
     *
     * @param userId
     * @param cb
     */
    var getRoomsForUser = function(userId, cb) {
      $http.get('api/rooms/' + userId)
        .success(function(rooms) {
          //load list of rooms
          cb(rooms);
        })
        .error(function(error) {
          console.log('error on getRoomsForUser ', error);
        })
    };


    return {
      loadUserImage: loadUserImage,
      createRoom: createRoom,
      getRoomsForUser: getRoomsForUser
    };
  }
  ])
  .factory('SocketFactory', [function() {
    var socket;
    return {
      socket: socket,
    }
  }]);




