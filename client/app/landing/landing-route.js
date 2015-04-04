'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.
      state('landing', {
        url: '/landing',
        templateUrl: 'app/landing/index.html',
        controller: 'landingController'
      });
  }]);
