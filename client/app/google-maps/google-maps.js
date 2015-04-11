'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('google-maps', {
        url: '/maps',
        templateUrl: 'app/google-maps/google-maps.html',
/*
        Currently we have two controllers in this view so we inject them in html
        //controller: 'MapsCtrl'
*/
        authenticate: true
      });

  }]);


