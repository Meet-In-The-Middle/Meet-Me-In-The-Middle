'use strict';

angular.module('meetMeInTheMiddleApp')
  .factory('MainFactory', ['$http', function($http){

    var imageStore = {};
    /**
     *@desc   load user thumbnail on profile page
     * @param userId string
     * @param cb load the image once it comes back from server
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
     * @desc  create new midup (room)
     * @param roomObj Object
     * @param cb callback to load data once returned from server
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
     * @desc  get all midups (rooms) that a user is a part of
     * @param userId String
     * @param cb callback to load data when returned from server
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
  //allow access to socket.io socket from any contoller. Needed b/c we use two controllers on midups pages
  .factory('SocketFactory', [function() {
    var socket;
    return {
      socket: socket,
    }
  }]);




