'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('profile', {
        url: '/profile',
        templateUrl: 'app/account/profile/profile.html',
        controller: 'profileCtrl'
      })

  }]);
