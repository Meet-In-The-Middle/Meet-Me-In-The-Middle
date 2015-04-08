'use strict';

angular.module('meetMeInTheMiddleApp')

.controller('midUpCtrl', ['$scope', '$scope', '$http', 'Auth', 'MainFactory',
  function ($scope, $http, Auth, MainFactory) {
    var user = Auth.getCurrentUser();
    var userId = user._id
    console.log('user is ', user);
    $scope.user = {};

    $scope.init = function() {

    };

    var addUserToRoom = function() {

    };







  }]);
