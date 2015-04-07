'use strict';

angular.module('meetMeInTheMiddleApp')

.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider){
    uiGmapGoogleMapApiProvider.configure({
            //provide api key if available
            v: '3.17',
            libraries: 'weather,geometry,visualization,places'
    });
}])

.factory('markerFactory', function(){
  var markerId = 0;

    function create(latitude, longitude) {
        var marker = {
            options: {
                animation: 1,
                labelAnchor: "28 -5",
                labelClass: 'markerlabel'    
            },
            latitude: latitude,
            longitude: longitude,
            id: ++markerId          
        };
        return marker;        
    }

        function invokeSuccessCallback(successCallback, marker) {
        if (typeof successCallback === 'function') {
            successCallback(marker);
        }
    }

    function createByCoords(latitude, longitude, successCallback) {
        var marker = create(latitude, longitude);
        invokeSuccessCallback(successCallback, marker);
    }

    function createByAddress(address, successCallback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address' : address}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var firstAddress = results[0];
                var latitude = firstAddress.geometry.location.lat();
                var longitude = firstAddress.geometry.location.lng();
                var marker = create(latitude, longitude);
                invokeSuccessCallback(successCallback, marker);
            } else {
                alert("Unknown address: " + address);
            }
        });
    }

    function createByCurrentLocation(successCallback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var marker = create(position.coords.latitude, position.coords.longitude);
                invokeSuccessCallback(successCallback, marker);
            });
        } else {
            alert('Unable to locate current position');
        }
    }

    return {
        createByCoords: createByCoords,
        createByAddress: createByAddress,
        createByCurrentLocation: createByCurrentLocation
    };
})

.controller('MapsCtrl', ['markerFactory', '$scope', '$q', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', function (markerFactory, $scope, $q, $log, uiGmapGoogleMapApi, uiGmapIsReady) {
  //$scope.id = 0;
  var socket = io();
  $scope.map = { control: {}, center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4}; // add markers array to map object??
  $scope.options = {scrollwheel: false, scaleControl: true};
  $scope.markers = {};
  $scope.geolocationAvailable = navigator.geolocation ? true : false;
  $scope.findMe = function () {
    if($scope.geolocationAvailable) {
      navigator.geolocation.getCurrentPosition(function (position) {
        $scope.changeMapView(position.coords.latitude, position.coords.longitude, 18);
        $scope.addMarker(position.coords.latitude, position.coords.longitude, 0);
        $scope.$apply();
      }, function () {});
    }
    else{
      alert('geolocation not ready!');
    }   
  };

  var events = {
    places_changed: function (searchBox) {
      var place = searchBox.getPlaces();
      if (!place || place == 'undefined' || place.length == 0) {
        console.log('no place data');
        return;
      }
      $scope.changeMapView(place[0].geometry.location.lat(), place[0].geometry.location.lng(), 18);
      $scope.addMarker(place[0].geometry.location.lat(), place[0].geometry.location.lng(), 0);
    }
  }

  $scope.searchbox = { template:'searchbox.tpl.html', events:events};

  
  // $scope.$watch("marker.coords.latitude || marker.coords.longitude", function(newVal, oldVal){
  //   if(newVal !== oldVal){
  //     socket.emit('move-pin', $scope.marker);
  //   }
  // });


  // marker = {id:c, coors: { latitude: num, longitude: num}}
  // if current ANY user moves pin;
  //dataCollection = {socket.id1:{longitude:num, latitude: num, roomNumber: num}, ..., socket.idN:{longitude:num, latitude:num, roomNumber: num}}
  socket.on('move-pin', function(dataCollection){
      //Great we got at least two users, lets find that midpoint
      if(Object.keys(dataCollection).length >= 2){
        var userLoc = false;
        var usersReady = 0;
        //Loop through the 
        for(var sockID in dataCollection){            
            if(dataCollection[sockID].coords !== undefined){
              usersReady++;
              if (socket.id === sockID){
                userLoc = true;
              }
            }
        }

        if(userLoc && usersReady >= 2){
          calcRoute(dataCollection);
        }
        //console.log(userLoc);
        //console.log(usersReady);
      }
  });

  // uiGmapGoogleMapApi.then(function(maps) {
  //   $scope.resolved = true;
  //   $scope.googleVersion = maps.version;
  //   maps.visualRefresh = true;     
  //   $scope.directionsService = new maps.DirectionsService();
  //   $scope.directionsDisplay = new maps.DirectionsRenderer();
  //   $scope.infowindow = new maps.InfoWindow();
  //   $scope.polyline = new maps.Polyline({
  //       path: [],
  //       strokeColor: '#FF0000',
  //       strokeWeight: 3
  //     });

  //   $scope.midPoint = new google.maps.Marker({
  //     //map: instanceMap,
  //     title: "start"
  //   });
    
  //     uiGmapIsReady.promise(1).then(function(instances) {
  //       instanceMap = instances[0].map;   
  //       $scope.directionsDisplay.setMap(instanceMap);
  //     });
  // });



  ///////////////////////////////////////////////Functions///////////////////////////////////////////////
  $scope.addMarker = function (latitude, longitude, id) {
    if($scope.markers[id]){
      $scope.markers[id] = {
        id: id,
        coords:{
          latitude: latitude,
          longitude: longitude
        },
        options:{draggable:true},
      }
    }
    else{
      $scope.markers[id] = {
        id: id,
        coords:{
          latitude: latitude,
          longitude: longitude
        },
        options:{draggable:true},
      };
      //$scope.id++;
    }
  };

  $scope.removeMarker = function (markerLat, markerLong, id) {
    var options;
    if(id === 0){
      options = {draggable: true}
    } else{
      options = {};
    }
    if($scope.markers[id]){
      $scope.markers[id] = {
        id: id,
        coords:{
          latitude: markerLat,
          longitude: markerLong
        },
        options:options,
      }
    }
    else{
      $scope.markers[id] = {
        id: id,
        coords:{
          latitude: markerLat,
          longitude: markerLong
        },
        options:options,
      };
      //$scope.id++;
    }
  };

  $scope.changeMapView = function (latitude, longitude, zoom) {
    $scope.map = {
      center: {
        latitude: latitude,
        longitude: longitude
      },
      zoom: zoom
    }
  };




  ////////////////////////////////////////////////////////////////////////////////////////////////////////

}]);
 



  //           $scope.marker.id = 0;
  //           $scope.marker.coords = {
  //                   latitude: place[0].geometry.location.lat(),
  //                   longitude: place[0].geometry.location.lng()
  //               };
  //           $scope.marker.options = {
  //                 draggable: true,
  //                 labelContent: "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude,
  //                 labelAnchor: "100 0",
  //                 labelClass: "marker-labels"
  //             };
  //           $scope.marker.show = true;




 //               },
  //               show: true,
  //               options: { draggable: true },
  //               // events: {
  //               //   dragend: function (marker, eventName, args) {
  //               //     $scope.marker.options = {
  //               //         draggable: true,
  //               //         labelContent: "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude,
  //               //         labelAnchor: "100 0",
  //               //         labelClass: "marker-labels"
  //               //     };
  //               //   }
  //               // }
  //             });



  //       var instanceMap;

  //       $scope.map = { control: {}, center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4, refresh: {}};

  //       $scope.options = {scrollwheel: false, scaleControl: true};

  //       $scope.markers = [];

  //       $scope.windowOptions = {
  //           visible: false
  //       };

  //       $scope.onClick = function() {
  //           $scope.windowOptions.visible = !$scope.windowOptions.visible;
  //       };

        // $scope.marker = new google.maps.Marker({
        //   id: 0,
        //   coords: {
        //     latitude: 52.47491894326404,
        //     longitude: -1.8684210293371217
        //   },
        //   show: false,
        //   options: { draggable: true },
        //   events: {
        //     dragend: function (marker, eventName, args) {
        //       $scope.marker.options = {
        //           draggable: true,
        //           labelContent: "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude,
        //           labelAnchor: "100 0",
        //           labelClass: "marker-labels"
        //       };
        //     }
        //   }
        // });

  //       var events = {
  //         places_changed: function (searchBox) {
  //           var place = searchBox.getPlaces();
  //           if (!place || place == 'undefined' || place.length == 0) {
  //               console.log('no place data');
  //               return;
  //           }
  //           $scope.map = {
  //               "center": {
  //                   "latitude": place[0].geometry.location.lat(),
  //                   "longitude": place[0].geometry.location.lng()
  //               },
  //               "zoom": 18
  //           };

  //           // $scope.marker.placeID = place[0].id;
  //           // $scope.marker.name = place[0].name;
  //           // $scope.marker.address = place[0].formatted_address;
  //           $scope.marker.id = 0;
  //           $scope.marker.coords = {
  //                   latitude: place[0].geometry.location.lat(),
  //                   longitude: place[0].geometry.location.lng()
  //               };
  //           $scope.marker.options = {
  //                 draggable: true,
  //                 labelContent: "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude,
  //                 labelAnchor: "100 0",
  //                 labelClass: "marker-labels"
  //             };
  //           $scope.marker.show = true;
            


  //         }
  //       }

  //     uiGmapGoogleMapApi.then(function(maps) {
  //       $scope.resolved = true;
  //       $scope.googleVersion = maps.version;
  //       maps.visualRefresh = true;     
  //       $scope.directionsService = new maps.DirectionsService();
  //       $scope.directionsDisplay = new maps.DirectionsRenderer();
  //       $scope.infowindow = new maps.InfoWindow();
  //       $scope.polyline = new maps.Polyline({
  //           path: [],
  //           strokeColor: '#FF0000',
  //           strokeWeight: 3
  //         });

  //       $scope.testCalls = 0;

  //       $scope.midPoint = new google.maps.Marker({
  //         //map: instanceMap,
  //         title: "start"
  //       });
        
  //         uiGmapIsReady.promise(1).then(function(instances) {
  //           instanceMap = instances[0].map;   
  //           $scope.directionsDisplay.setMap(instanceMap);
  //         });
  //     });

  //       $scope.locator = function(){
  //         navigator.geolocation.getCurrentPosition(
  //         function(pos) {
  //           $scope.map = { control: {}, center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, zoom: 18};
  //           if($scope.marker){

  //           }else{
  //             $scope.marker = new google.maps.Marker({
  //               coords: {
  //                 latitude: pos.coords.latitude,
  //                 longitude: pos.coords.longitude
  //               },
  //               show: true,
  //               options: { draggable: true },
  //               // events: {
  //               //   dragend: function (marker, eventName, args) {
  //               //     $scope.marker.options = {
  //               //         draggable: true,
  //               //         labelContent: "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude,
  //               //         labelAnchor: "100 0",
  //               //         labelClass: "marker-labels"
  //               //     };
  //               //   }
  //               // }
  //             });
  //           }

  //           // $scope.marker = {
  //           //     id: 0,
  //           //     coords: {
  //           //         latitude: pos.coords.latitude,
  //           //         longitude: pos.coords.longitude
  //           //     }

  //           // };

  //           //$scope.$apply();
  //          }, 
  //         function(error) {
  //           alert('Unable to get location: ' + error.message);
  //         }
  //       );
  //     }  
        

  //       //TODO: define userId
  //       // Connect to socket when the user places pin on the map
  //       var socket = io();
  //       // Send data whenever user changes pin.
  //       $scope.$watch("marker.coords.latitude || marker.coords.longitude", function(newVal, oldVal){
  //         if(newVal !== oldVal){
  //           socket.emit('move-pin', $scope.marker);
  //         }
  //       });


  //       // marker = {id:c, coors: { latitude: num, longitude: num}}
  //       // if current ANY user moves pin;
  //       //dataCollection = {socket.id1:{longitude:num, latitude: num, roomNumber: num}, ..., socket.idN:{longitude:num, latitude:num, roomNumber: num}}
  //       socket.on('move-pin', function(dataCollection){
  //           //Great we got at least two users, lets find that midpoint
  //           if(Object.keys(dataCollection).length >= 2){
  //             var userLoc = false;
  //             var usersReady = 0;
  //             //Loop through the 
  //             for(var sockID in dataCollection){            
  //                 if(dataCollection[sockID].coords !== undefined){
  //                   usersReady++;
  //                   if (socket.id === sockID){
  //                     userLoc = true;
  //                   }
  //                 }
  //             }

  //             if(userLoc && usersReady >= 2){
  //               calcRoute(dataCollection);
  //             }
  //             //console.log(userLoc);
  //             //console.log(usersReady);
  //           }

  //       });

  //       $scope.searchbox = { template:'searchbox.tpl.html', events:events};


  //     var calcRoute = function(userData){
  //       //User's locations
  //       var usrLoc;
  //       //Calculated midpoint
  //       var center;
  //       //Routes the users will take
  //       //var paths = [];
  //       //Markers for other users
  //       var markers = [];
  //       //Remove all other markers from the map
  //       $scope.markers.forEach(function(marker){marker.setMap(null);});  
        
  //       //Initialize the bounds of the polygon
  //       var bounds = new google.maps.LatLngBounds();

  //       //Get all of the users locations
  //       for(var socketID  in userData) {
  //         //Add a vertex in the polygon
  //         if(userData[socketID].coords !== undefined) {
  //           var coord = new google.maps.LatLng(userData[socketID].coords.latitude, userData[socketID].coords.longitude);
  //           //If not current user
  //           if(socketID !== socket.id){
  //           //Loop through the array and update the appropriate marker if it exists  
  //             if(!(_.contains(_.map($scope.marker, function(x){
  //               if(x.id === userData[socketID]){
  //                 x.positon = coord;
  //                 return true;
  //               }
  //             }), true))) {
  //             //create a marker for other user(s) and put it in the marker array
  //               $scope.markers.push(new google.maps.Marker({
  //                 id: userData[socketID],
  //                 position: coord
  //               }));
  //             }
  //           } else {
  //             usrLoc = coord;
  //             //$scope.marker.setMap(null);
  //           }
  //           //console.log(coord);
  //           bounds.extend(coord);
  //         }
  //       }
  //       console.log($scope.markers.length);

  //       //Find its center
  //       center = bounds.getCenter();

  //       //Setup the route from the user's current location to then central meetup point
  //         var request = {
  //           origin: usrLoc,
  //           destination: center,        
  //           travelMode: google.maps.TravelMode.DRIVING
  //         };

  //         //Get the route      
  //         $scope.directionsService.route(request, function(response, status) {
      
  //         if (status == google.maps.DirectionsStatus.OK) {

  //           //Add the other user(s) marker
  //          // $scope.marker.setMap(null);
  //           $scope.markers.forEach(function(marker){marker.setMap(instanceMap);});  
  //           $scope.directionsDisplay.setDirections(response);
  //          // $scope.marker.setMap(instanceMap);

  //         } else {
  //             alert("directions response "+status);
  //         }
  //       //});
  //     });
      
  //     //Display all the routes
  //     //$scope.polylines.forEach(function(line){line.setMap(instanceMap);});
      

  //   }

  //   }]);
