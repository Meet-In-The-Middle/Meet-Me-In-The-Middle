'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('test', {
        url: '/test',
        templateUrl: 'app/test/test.html',
        controller: 'testController'
    })
  });
