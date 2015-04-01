'use strict';
angular.module("meetMeInTheMiddleApp", ['uiGmapgoogle-maps'])
.config(function ($stateProvider) {
    $stateProvider
      .state('google-maps', {     
      });
    })

.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
//    key: 'your api key',
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
}])

.controller("ExampleController",['$scope', '$timeout', 'uiGmapLogger', '$http', 'rndAddToLatLon','uiGmapGoogleMapApi'
    , function ($scope, $timeout, $log, $http, rndAddToLatLon,GoogleMapApi) {
  $log.currentLevel = $log.LEVELS.debug;

  GoogleMapApi.then(function(maps) {
    $scope.googleVersion = maps.version;
    maps.visualRefresh = true;
    $log.info('$scope.map.rectangle.bounds set');
    $scope.map.rectangle.bounds = new maps.LatLngBounds(
      new maps.LatLng(55,-100),
      new maps.LatLng(49,-78)
    );

     });
}]);