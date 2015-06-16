'use strict';

angular.module('meetMeInTheMiddleApp')
  .controller('LoginCtrl', ['$scope', '$rootScope', 'Auth', '$location', '$window', 
    function ($scope, $rootScope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to mymidups
          if( $rootScope.returnToState === "/mymidups/:Id" ) {
            $location.path("/mymidups/" + $rootScope.returnToStateParams);
          } else {
            $location.path('/mymidups');
          }
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);
