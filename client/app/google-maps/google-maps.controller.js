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

        $scope.options = {scrollwheel: false};

        $scope.marker = {
            id: 0,
            coords: {
                latitude: 52.47491894326404,
                longitude: -1.8684210293371217
            },
            options: { draggable: true },
            //BUG: Initially this event exists but when pin starts to change it will be overwritten
            //resulting in dragend not being called.
            events: {
                dragend: function (marker, eventName, args) {
                    $scope.test1 = "asdfasdf"
                    $scope.marker.options = {
                        draggable: true,
                        labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
                        labelAnchor: "100 0",
                        labelClass: "marker-labels"
                    };
                }
            }
        };

        var events = {
            places_changed: function (searchBox) {
                console.log('asdf');
                var place = searchBox.getPlaces();
                if (!place || place == 'undefined' || place.length == 0) {
                    console.log('no place data :(');
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
                    id: 0,
                    coords: {
                        latitude: place[0].geometry.location.lat(),
                        longitude: place[0].geometry.location.lng()
                    }
                };
            }
        };

        //TODO: define userId

        var socket = io();
        // Send data whenever user changes pin.
        $scope.$watch("marker.coords.latitude || marker.coords.longitude", function(newVal, oldVal){
            socket.emit('move-pin', $scope.marker);
        });


        // marker = {id:c, coors: { latitude: num, longitude: num}}
        // if current ANY user moves pin;
        //dataCollection = {socket.id1:{longitude:num, latitude: num, roomNumber: num}, ..., socket.idN:{longitude:num, latitude:num, roomNumber: num}}
        socket.on('move-pin', function(dataCollection){
            console.dir(dataCollection);
            $scope.test = JSON.stringify(dataCollection, null, 2);
            // $scope.test = dataCollection[socket.id];
        });



        $scope.searchbox = { template:'searchbox.tpl.html', events:events};

        uiGmapGoogleMapApi.then(function(maps) {
            $scope.resolved = true;
            $scope.googleVersion = maps.version;
            maps.visualRefresh = true;
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

        }]);


// .controller('MapsCtrl', ['$scope', '$q', '$http', 'uiGmapGoogleMapApi', 

//   function($scope, $q, $http, uiGmapGoogleMapApi) {
//     $scope.resolved = false;
//     $scope.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 4 };
//     $scope.options = {scrollwheel: false};

//     var events = {
//       places_changed: function (searchBox) {}
//     }
//     $scope.searchbox = { template:'searchbox.tpl.html', events:events};
        
//     uiGmapGoogleMapApi.then(function(maps) {
//           $scope.resolved = true;
//           $scope.googleVersion = maps.version;
//           maps.visualRefresh = true;
//     });

//   }])


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


