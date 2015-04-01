'use strict';

angular.module('meetMeInTheMiddleApp')

.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider){
  uiGmapGoogleMapApiProvider.configure({
      //provide api key if available
      v: '3.17',
      libraries: 'weather,geometry,visualization'
  });
}])

.controller('MapsCtrl', ['$scope', 'uiGmapGoogleMapApi', 

    function($scope, uiGmapGoogleMapApi) {
        $scope.resolved = false;
        $scope.map = {center: {latitude: 51.219053, longitude: 4.404418 }, zoom: 14 };
        $scope.options = {scrollwheel: false};
        uiGmapGoogleMapApi.then(function() {
            alert('test');
            $scope.resolved = true;
        });
}]);