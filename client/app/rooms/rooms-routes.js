'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('rooms', {
        url: '/mymidups',
        templateUrl: 'app/rooms/rooms.html',
        controller: 'roomsCtrl'
      })

  }]);
