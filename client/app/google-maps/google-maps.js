'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('google-maps', {
        url: '/maps',
        templateUrl: 'app/google-maps/google-maps.html',
        controller: 'MapsCtrl'      
      });
  });

