'use strict';

angular.module('meetMeInTheMiddleApp')
  .config(['$stateProvider', 
    function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  }]);