'use strict';

angular.module('meetMeInTheMiddleApp')

.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider){
    uiGmapGoogleMapApiProvider.configure({
            //provide api key if available
            v: '3.17',
            libraries: 'geometry,visualization,places'
    });
}])

.controller('MapsCtrl', ['$scope', '$q', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', function ($scope, $q, $log, uiGmapGoogleMapApi, uiGmapIsReady) {
  var socket = io();
  var geolocationAvailable;
  var center;
  var bounds;
  var instanceMap;
  var maps;
  var directionsService;
  var directionsDisplay;
  var polyline;
  var infowindow;
  var service;

  $scope.map = { 
      control: {}, 
      center: { latitude: 40.1451, longitude: -99.6680 }, 
      zoom: 4,
      // events: {
      //   tilesloaded: function (maps, eventName, args) {
      //   },
      //   dragend: function (maps, eventName, args) {
      //   },
      //   zoom_changed: function (maps, eventName, args) {
      //   }
      // } 
  }; 

  $scope.options = {scrollwheel: false, scaleControl: true};
  $scope.markers = {};

  uiGmapGoogleMapApi.then(function(maps) {
    console.log('maps: ', maps);
    maps = maps;
    // $scope.resolved = true;
    $scope.googleVersion = maps.version;
    //maps.visualRefresh = true;     
    geolocationAvailable = navigator.geolocation ? true : false;
    directionsService = new maps.DirectionsService();
    directionsDisplay = new maps.DirectionsRenderer();
    infowindow = new maps.InfoWindow();
    bounds = new maps.LatLngBounds();
    polyline = new maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeWeight: 3
    });   
    uiGmapIsReady.promise(1).then(function(instances) {
      instanceMap = instances[0].map;   
      service = new maps.places.PlacesService(instanceMap);
      directionsDisplay.setMap(instanceMap);
    });
  });

  var events = {
    places_changed: function (searchBox) {
      var place = searchBox.getPlaces();
      if (!place || place == 'undefined' || place.length == 0) {
        console.log('no place data');
        return;
      }
      changeMapView(place[0].geometry.location.lat(), place[0].geometry.location.lng(), 18);
      addMarker(place[0].geometry.location.lat(), place[0].geometry.location.lng(), socket.id);
      $scope.$apply();
    }
  }

  $scope.searchbox = { template:'searchbox.tpl.html', events:events};

  socket.on('move-pin-reply', function(dataCollection){
    console.log('pin move event!!!!!');
    console.log('data: ', dataCollection);
    //if(Object.keys(dataCollection).length >= 2){}
    for(var marker in dataCollection){
      if(marker !== socket.id){
        console.log('inner socket add!!!!!!');
        addMarker(dataCollection[marker].coords.latitude, dataCollection[marker].coords.longitude, marker);
        // var geoCode = new google.maps.LatLng(dataCollection[marker].coords.latitude, dataCollection[marker].coords.longitude);
        // bounds.extend(geoCode);   
        // extendBounds(dataCollection[marker].coords.latitude, dataCollection[marker].coords.longitude);
        $scope.$apply();   
        // console.log(center);  
      }
    }

    if(Object.keys($scope.markers).length === 3){
      calculateCenter();
      calcRoute();
    }

    /*
    if(Object.keys($scope.markers).length === 2){
      var start = socket.id; 
      var end;
      if(Object.keys($scope.markers)[0] === socket.id){
        end = Object.keys($scope.markers)[1];
      } else{ 
        end = Object.keys($scope.markers)[0];
      }
      calcRoute2Users(start, end);
    }*/
  });

   
  ///////////////////////////////////////////////Functions///////////////////////////////////////////////
  // $scope.placeSearch = function (place) {
  //   var request = {
  //     location: {
  //        lat: $scope.map.center.latitude,
  //        lng: $scope.map.center.longitude
  //     },
  //     radius: place.radius,
  //     types: [place.types]
  //   };
  //   //var map = $scope.map.control.getGMap();
  
  //   service.nearbySearch(request, callback);
  //   return;
  // };

  var callback = function (results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i],i);
      }
    }
  }



  $scope.findMe = function () {
    if(geolocationAvailable) {
      navigator.geolocation.getCurrentPosition(function (position) {
        changeMapView(position.coords.latitude, position.coords.longitude, 18);
        addMarker(position.coords.latitude, position.coords.longitude, socket.id);
        $scope.$apply();
      }, function () {});
    }
    else{
      alert('geolocation not ready!');
    }   
  };

  $scope.viewMap = function(){
    changeMapView(40.1451, -99.6680, 4);
  }

  var extendBounds = function(latitude, longitude){
    var coord = new google.maps.LatLng(latitude, longitude);
    bounds.extend(coord);
    center = bounds.getCenter(); 
  }

  var calculateCenter = function(){
    bounds = new google.maps.LatLngBounds();
    for(var marker in $scope.markers){
      var coord = new google.maps.LatLng($scope.markers[marker].coords.latitude, $scope.markers[marker].coords.longitude);
      bounds.extend(coord);
    }
    center = bounds.getCenter(); 
  }

  var calcRoute = function(){
    // $scope.markers.forEach(function(marker){marker.setMap(null);});  //Remove all other markers from the map
    //var bounds = new google.maps.LatLngBounds();      //Initialize the bounds of the polygon    
    //Get all of the users locations
    // for(var socketID  in userData) {
    //   //Add a vertex in the polygon
    //   if(userData[socketID].coords !== undefined) {
    //     var coord = new google.maps.LatLng(userData[socketID].coords.latitude, userData[socketID].coords.longitude);
    //     if(socketID !== socket.id){ //If not current user
    //     //Loop through the array and update the appropriate marker if it exists  
    //       if(!(_.contains(_.map($scope.marker, function(x){
    //         if(x.id === userData[socketID]){
    //           x.positon = coord;
    //           return true;
    //         }
    //       }), true))) {
    //       //create a marker for other user(s) and put it in the marker array
    //         $scope.markers.push(new google.maps.Marker({
    //           id: userData[socketID],
    //           position: coord
    //         }));
    //       }
    //     } else {
    //       usrLoc = coord;
    //     }
    //     bounds.extend(coord);
    //   }
    // }
    //console.log($scope.markers.length);
    //center = bounds.getCenter();      //Find its center

    //Setup the route from the user's current location to then central meetup point
    var request = {
      origin: new google.maps.LatLng($scope.markers[socket.id].coords.latitude, $scope.markers[socket.id].coords.longitude),
      destination: center,        
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        //Add the other user(s) marker
        // $scope.marker.setMap(null);
        //$scope.markers.forEach(function(marker){marker.setMap(instanceMap);});  
        directionsDisplay.setDirections(response);
        // $scope.marker.setMap(instanceMap);
      } else {
        alert("directions response "+status);
      }
    });

  }

  var calcRoute2Users = function(start, end){
    polyline.setPath([]);
    removeMarker('midpoint');

    var request = {
      origin: new google.maps.LatLng($scope.markers[start].coords.latitude, $scope.markers[start].coords.longitude),
      destination: new google.maps.LatLng($scope.markers[end].coords.latitude, $scope.markers[end].coords.longitude),
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status){
      if(status === google.maps.DirectionsStatus.OK){
        directionsDisplay.setDirections(response);
        var totalDist = 0;
        var totalTime = 0;
        var route = response.routes[0];
        var path = route.overview_path;
        var legs = route.legs;
        for(var i = 0; i < legs.length; i++){
          totalDist += legs[i].distance.value;
          totalTime += legs[i].duration.value;
          var steps = legs[i].steps;
          for(var j = 0; j < steps.length; j++){
            var nextSegment = steps[j].path;
            for(var k = 0; k < nextSegment.length; k++){
              polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }
        var distance = (50/100) * totalDist;
        var time = ((50/100) * totalTime/60).toFixed(2);
        var coordinates = polyline.GetPointAtDistance(distance);
        addMarker(coordinates.k, coordinates.D, 'midpoint');
        $scope.$apply();
      } else{
        alert("directions response " +status)
      }
    });
  }

  var addMarker = function (latitude, longitude, id) {
    console.log('add id: ', id);

    if(id === socket.id){
      $scope.markers[id] = {
        id: id,
        // icon: {},
        coords:{
          latitude: latitude,
          longitude: longitude
        },
        options:{draggable: true},
        events: {
          dragend: function(marker, eventName, args){
            console.log('marker dragend event fired once data sent: \n' + JSON.stringify($scope.markers[socket.id], null, 2));
            socket.emit('move-pin', $scope.markers[socket.id]);
          }
        }
      }
      console.log('marker added event: \n' + JSON.stringify($scope.markers[id], null, 2))
      socket.emit('move-pin', $scope.markers[id]);
    }else{
      $scope.markers[id] = {
        id: id,
        icon: 'http://www.googlemapsmarkers.com/v1/0099FF/',
        // icon: {
        //   strokeColor: 'blue'
        // },
        coords:{
          latitude: latitude,
          longitude: longitude
        },
        options:{},
        events: {}
      }
    }

    // var options = {};
    // var events = {};
    // var icon = {};
    // if(id === socket.id){ 
    //   options = {draggable: true};
    //   //events.dragend = function(marker, eventName, args){};
    //   events = {
    //     dragend: function(marker, eventName, args){
    //       console.log('marker dragend event fired once data sent: \n' + JSON.stringify($scope.markers[socket.id], null, 2));
    //       socket.emit('move-pin', $scope.markers[socket.id]);
    //     }
    //   };
    //   icon = {strokeColor: ''}
    // } 
    // // else{ options = {}; events = {}; }
    // $scope.markers[id] = {
    //   id: id,
    //   icon: 
    //   coords:{
    //     latitude: latitude,
    //     longitude: longitude
    //   },
    //   options:options,
    //   events: events
    // };
    // if(id === socket.id){
    //   console.log('marker added event: \n' + JSON.stringify($scope.markers[id], null, 2))
    //   socket.emit('move-pin', $scope.markers[id]);
    // }
    
  };

  var removeMarker = function (id) {
    delete $scope.markers[id];
    $scope.$apply();
  };

  var removeAllMarkers = function () {
    for(var marker in $scope.markers){
      delete $scope.markers[marker];
    }
  };

  var addAllMarkers = function (data) {
    // delete all markers from array
    // receive data object - preferably in the correct format
    for(marker in data){
      $scope.markers[marker] = data[marker];
    }
  };

  var changeMapView = function (latitude, longitude, zoom) {
    $scope.map = {
      control: {},
      center: {
        latitude: latitude,
        longitude: longitude
      },
      zoom: zoom,
      // events: {
      //   tilesloaded: function(map){
      //     console.log('!!!!!!!! ', map);
      //     map = map;
      //     directionsDisplay.setMap(map);
      //   }
      // }
    }
  };
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

}]);

  

  // var calcRoute = function(userData){
  //   var usrLoc;   //User's locations
  //   var center;   //Calculated midpoint
  //   var markers = [];
    
  //   $scope.markers.forEach(function(marker){marker.setMap(null);});  //Remove all other markers from the map
  //   var bounds = new google.maps.LatLngBounds();      //Initialize the bounds of the polygon
    
  //   //Get all of the users locations
  //   for(var socketID  in userData) {
  //     //Add a vertex in the polygon
  //     if(userData[socketID].coords !== undefined) {
  //       var coord = new google.maps.LatLng(userData[socketID].coords.latitude, userData[socketID].coords.longitude);
  //       if(socketID !== socket.id){ //If not current user
  //       //Loop through the array and update the appropriate marker if it exists  
  //         if(!(_.contains(_.map($scope.marker, function(x){
  //           if(x.id === userData[socketID]){
  //             x.positon = coord;
  //             return true;
  //           }
  //         }), true))) {
  //         //create a marker for other user(s) and put it in the marker array
  //           $scope.markers.push(new google.maps.Marker({
  //             id: userData[socketID],
  //             position: coord
  //           }));
  //         }
  //       } else {
  //         usrLoc = coord;
  //       }
  //       bounds.extend(coord);
  //     }
  //   }
  //   console.log($scope.markers.length);
  //   center = bounds.getCenter();      //Find its center

  //   //Setup the route from the user's current location to then central meetup point
  //   var request = {
  //     origin: usrLoc,
  //     destination: center,        
  //     travelMode: google.maps.TravelMode.DRIVING
  //   };

  //   //Get the route      
  //   $scope.directionsService.route(request, function(response, status) {
  //     if (status == google.maps.DirectionsStatus.OK) {
  //     //Add the other user(s) marker
  //     // $scope.marker.setMap(null);
  //     $scope.markers.forEach(function(marker){marker.setMap(instanceMap);});  
  //     $scope.directionsDisplay.setDirections(response);
  //     // $scope.marker.setMap(instanceMap);
  //     } else {
  //       alert("directions response "+status);
  //     }
  //   });
  // };

  //Display all the routes
  //$scope.polylines.forEach(function(line){line.setMap(instanceMap);});


// google.maps.event.addListener($scope.marker, 'click', function() {
//             $scope.infowindow.setContent(contentString+"<br>"+$scope.marker.getPosition().toUrlValue(6)); 
//             $scope.infowindow.open(instanceMap,$scope.marker);
//           });

