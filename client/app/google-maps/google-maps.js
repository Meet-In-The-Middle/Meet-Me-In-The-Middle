'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('google-maps', {
        url: '/maps',
        templateUrl: 'app/google-maps/google-maps.html',
        authenticate: true
      });

  }]);


