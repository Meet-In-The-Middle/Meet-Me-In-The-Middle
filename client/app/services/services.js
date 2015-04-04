'use strict';

angular.module('meetMeInTheMiddleApp')
  .factory('UserImage', ['$http', function($http){

      var imageStore = {};
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
      return {
        loadUserImage: loadUserImage
      };
    }
    ]);




