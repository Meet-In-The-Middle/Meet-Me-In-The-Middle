'use strict';

angular.module('meetMeInTheMiddleApp')

.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider){
  uiGmapGoogleMapApiProvider.configure({
      //provide api key if available
      v: '3.17',
      libraries: 'weather,geometry,visualization,places'
  });
}])

 .controller('MapsCtrl', ['$scope', '$q', '$http', 'uiGmapGoogleMapApi',  


  function ($scope, $q, $log, uiGmapGoogleMapApi) {

        $scope.map = { control: {}, center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4, refresh: {}};

        $scope.options = {scrollwheel: false, scaleControl: true};

        $scope.windowOptions = {
            visible: false
        };

        $scope.onClick = function() {
            $scope.windowOptions.visible = !$scope.windowOptions.visible;
        };

        $scope.marker = {
          id: 0,
          coords: {
            latitude: 52.47491894326404,
            longitude: -1.8684210293371217
          },
          show: false,
          options: { draggable: true },
          events: {
            dragend: function (marker, eventName, args) {
              $scope.marker.options = {
                  draggable: true,
                  labelContent: "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude,
                  labelAnchor: "100 0",
                  labelClass: "marker-labels"
              };
            }
          }
        };

        var events = {
          places_changed: function (searchBox) {
            var place = searchBox.getPlaces();
            console.log(place);
            if (!place || place == 'undefined' || place.length == 0) {
                console.log('no place data');
                return;
            }
            $scope.map = {
                "center": {
                    "latitude": place[0].geometry.location.lat(),
                    "longitude": place[0].geometry.location.lng()
                },
                "zoom": 18
            };

            $scope.marker = {
                placeID: place[0].id,
                name: place[0].name,
                address: place[0].formatted_address,
                id: 0,
                coords: {
                    latitude: place[0].geometry.location.lat(),
                    longitude: place[0].geometry.location.lng()
                },
                options: {
                  draggable: true,
                  labelContent: "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude,
                  labelAnchor: "100 0",
                  labelClass: "marker-labels"
              },
              show: true
            };
          }
        }

      uiGmapGoogleMapApi.then(function(maps) {
        $scope.resolved = true;
        $scope.googleVersion = maps.version;
        maps.visualRefresh = true;        
      });

       

        $scope.locator = function(){
          navigator.geolocation.getCurrentPosition(
          function(pos) {
            $scope.map = { control: {}, center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, zoom: 18};
            $scope.marker = {
                id: 0,
                coords: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }

            };
            $scope.$apply();
           }, 
          function(error) {
            alert('Unable to get location: ' + error.message);
          }
        );
        }  
        


        // Connect to socket when the user places pin on the map
        var socket = io();

        //TODO: define userId

        // Send data whenever user changes pin.
        $scope.$watch("marker.coords.latitude || marker.coords.longitude", function(newVal, oldVal){
            socket.emit('move', $scope.marker);
        });

        // marker = {id:c, coors: { latitude: num, longitude: num}}
        socket.on('move-pin', function(data){
          $scope.test = data;
        });


        $scope.searchbox = { template:'searchbox.tpl.html', events:events};




    }])

    .controller('controlCtrl', function ($scope) {
        $scope.controlText = 'Find Me';
        $scope.danger = false;
        $scope.controlClick = function () {
            $scope.danger = !$scope.danger;
            alert('custom control clicked!');
        };
    });







  //         $scope.routePoints.start = $scope.map.routes.start[0];
  // $scope.routePoints.end = $scope.map.routes.end[0];

  // var directionsDisplay = new google.maps.DirectionsRenderer();

  // $scope.calcRoute = function (routePoints) {
  //   directionsDisplay.setMap($scope.map.control.getGMap());
  //   var directionsService = new google.maps.DirectionsService();
  //   var start = routePoints.start.latlng;
  //   var end = routePoints.end.latlng;
  //   var request = {
  //     origin: start,
  //     destination: end,
  //     travelMode: google.maps.TravelMode.WALKING
  //   };
  //   directionsService.route(request, function(response, status) {
  //     if (status == google.maps.DirectionsStatus.OK) {
  //       directionsDisplay.setDirections(response);
  //     }
  //   });
  //   return;
  // };

    // $scope.refreshMap = function () {
    //   //optional param if you want to refresh you can pass null undefined or false or empty arg
    //   $scope.map = {center: {latitude: 51.219053, longitude: 4.404418 }, zoom: 20 };
    //   return;
    // };
    
    // $scope.getRoute = function(){
    //   var start = document.getElementById("from").value;
    //   var end = document.getElementById("to").value;
    //   var travelMode = google.maps.DirectionsTravelMode.DRIVING // box of options
    // }


