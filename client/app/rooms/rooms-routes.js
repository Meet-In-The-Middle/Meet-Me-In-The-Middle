'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('rooms', {
        url: '/mymidups',
        templateUrl: 'app/rooms/rooms.html',
        controller: 'roomsCtrl',
        authenticate: true

      })
      .state('room', {
        url:'/mymidups/:Id',
        templateUrl: 'app/google-maps/google-maps.html',
        //Using two controllers on this view so inject them in HTML
        /*contoller: 'midUpCtrl',*/
        authenticate: true
      })

  }]);
