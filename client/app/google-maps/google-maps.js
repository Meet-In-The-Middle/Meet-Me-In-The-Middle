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

      // $uiGmapGoogleMapApiProvider.configure({
      //   //provide api key if available
      //   v: '3.17',
      //   libraries: 'weather,geometry,visualization'
      // });



  // angular.module('meetMeInTheMiddleApp', ['uiGmapgoogle-maps'])

// .config(function(uiGmapGoogleMapApiProvider){
//   uiGmapGoogleMapApiProvider.configure({
//       //provide api key if available
//       v: '3.17',
//       libraries: 'weather,geometry,visualization'
//   });
// })

// .controller('MapsCtrl', function($scope, uiGmapGoogleMapApi) {
//    $scope.resolved = false;
//     $scope.map = {center: {latitude: 51.219053, longitude: 4.404418 }, zoom: 14 };
//     $scope.options = {scrollwheel: false};
//     uiGmapGoogleMapApi.then(function(maps) {
//       alert('test');
//       $scope.resolved = true;
//     });
// });
