'use strict';

angular.module('meetMeInTheMiddleApp')

.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider){
    uiGmapGoogleMapApiProvider.configure({
            //provide api key if available
            v: '3.17',
            libraries: 'geometry,visualization,places'
    });
}])

.controller('MapsCtrl', ['$scope', '$q', '$http', '$location', 'Auth', 'uiGmapGoogleMapApi', 'uiGmapIsReady',
    function ($scope, $q, $log, $location, Auth, uiGmapGoogleMapApi, uiGmapIsReady) {
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
  var user = Auth.getCurrentUser();
  var userId = user._id;
  var url = $location.$$path.split('/');
  var roomId = url[url.length - 1];

  $scope.map = {
    control: {},
    center: { latitude: 40.1451, longitude: -99.6680 },
    zoom: 4,
  };

  $scope.options = {scrollwheel: false, scaleControl: true};
  $scope.markers = {};
  $scope.place = '';

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
      addMarker(place[0].geometry.location.lat(), place[0].geometry.location.lng(), userId);
      $scope.$apply();
    }
  }

  $scope.searchbox = { template:'searchbox.tpl.html', events:events};

  socket.on('move-pin-reply', function(dataCollection){
    console.log('pin move event!!!!!');
    console.log('data: ', dataCollection);
    //if(Object.keys(dataCollection).length >= 2){}
    for(var marker in dataCollection){
      if(marker !== userId){
        console.log('inner socket add!!!!!!');
        addMarker(dataCollection[marker].coords.latitude, dataCollection[marker].coords.longitude, marker);
        $scope.$apply();
      }
    }

    if(Object.keys($scope.markers).length === 2){
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
  $scope.placeSearch = function (place) {
    console.log('placesearch');
    var request = {
      location: {
         // lat: $scope.map.center.latitude,
         // lng: $scope.map.center.longitude
         lat: $scope.markers[socket.id].coords.latitude,
         lng: $scope.markers[socket.id].coords.longitude
      },
      radius: place.radius,
      types: [place.types]
    };
    service.nearbySearch(request, function (results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          console.log(results[i]);
          addPlace(results[i], i);
        }
      }
      else{
        alert("directions response " +status);
      }
    });
    return;
  };


  var addPlace = function (place,id) {
    $scope.markers[id] = {
      id: id,
      coords: {
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      },
      icon: place.icon,
      showWindow: false,
      name: place.name
      //templateUrl: 'assets/templates/place.html',
      // templateParameter: {
      //   message: place.name
      // }
    };
    $scope.$apply();
  }

  $scope.closeClick = function (marker) {
    marker.showWindow = false;
  };
  $scope.onMarkerClick = function (marker) {
    marker.showWindow = true;
  };

  $scope.findMe = function () {
    if(geolocationAvailable) {
      navigator.geolocation.getCurrentPosition(function (position) {
        changeMapView(position.coords.latitude, position.coords.longitude, 18);
        addMarker(position.coords.latitude, position.coords.longitude, userId);
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
    var request = {
      origin: new google.maps.LatLng($scope.markers[userId].coords.latitude, $scope.markers[userId].coords.longitude),
      destination: center,
      travelMode: google.maps.TravelMode.DRIVING
    };

    console.log(request);

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
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
        alert("directions response " +status);
      }
    });
  }

  var addMarker = function (latitude, longitude, id) {
    console.log('add id: ', id);

    if(id === userId){
      $scope.markers[id] = {
        _id: id,
        roomId: roomId,
        name: user.name,
        // icon: {},
        coords:{
          latitude: latitude,
          longitude: longitude
        },
        info: '',
        options:{draggable: true},
        events: {
          dragend: function(marker, eventName, args){
            console.log('marker dragend event fired once data sent: \n' + JSON.stringify($scope.markers[id], null, 2));
            socket.emit('move-pin', $scope.markers[id]);
          }
        }
      }
      console.log('marker added event: \n' + JSON.stringify($scope.markers[id], null, 2))
      socket.emit('move-pin', $scope.markers[id]);
    }else{
      $scope.markers[id] = {
        _id: id,
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
  };

  $scope.updateMap = function() {
    console.log('updateMap called');
    var userObj = {
      _id: user._id,
      roomId: roomId,
      name: user.name,
    };
    socket.emit('updateMap', userObj);
    socket.on('updateMapReply', function(data) {
      console.log('data from updateMapReply ', data);
    });

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

  var removeDirections = function () {
    directionsDisplay.setDirections(null);
  };

  var removePolylines = function () {
    polyline.setPath([]);
  };

  $scope.clearMap = function(){
    removeAllMarkers();
    removeDirections();
    removePolylines();
  }

  var addAllMarkers = function (data) {
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


// google.maps.event.addListener($scope.marker, 'click', function() {
//             $scope.infowindow.setContent(contentString+"<br>"+$scope.marker.getPosition().toUrlValue(6));
//             $scope.infowindow.open(instanceMap,$scope.marker);
//           });

