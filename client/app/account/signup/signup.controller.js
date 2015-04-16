'use strict';

angular.module('meetMeInTheMiddleApp')
  .controller('SignupCtrl', function ($scope, $rootScope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Account created, redirect to home previous state (midup state)
          if( $rootScope.returnToState === "/mymidups/:Id" ) {
            $location.path("/mymidups/" + $rootScope.returnToStateParams);
          } else {
            //redirect to mymidups
            $location.path('/mymidups');
          }
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
