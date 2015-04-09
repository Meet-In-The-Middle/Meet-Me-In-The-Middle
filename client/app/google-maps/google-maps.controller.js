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
  }; 

  $scope.options = {
    scrollwheel: false,
    scaleControl: true,
    mapTypeControl: false 
  };

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
      addMarker(place[0].geometry.location.lat(), place[0].geometry.location.lng(), socket.id);
      $scope.$apply();
    }
  }

  $scope.searchbox = { template:'searchbox.tpl.html', events:events, position:"LEFT_BOTTOM"};

  socket.on('move-pin-reply', function(dataCollection){
    console.log('pin move event!!!!!');
    console.log('data: ', dataCollection);
    //if(Object.keys(dataCollection).length >= 2){}
    for(var marker in dataCollection){
      if(marker !== socket.id){
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


  $scope.circle = {
       id: 1,
       center: {
           latitude: 44,
           longitude: -108
       },
       radius: 10000,
       stroke: {
           color: '#08B21F',
           weight: 2,
           opacity: 1
       },
       fill: {
           color: '#08B21F',
           opacity: 0.5
       },
       geodesic: true, // optional: defaults to false
       draggable: true, // optional: defaults to false
       clickable: true, // optional: defaults to true
       editable: true, // optional: defaults to false
       visible: true, // optional: defaults to true
       control: {},
       events: {
          dragend: function(circle){
            var center = circle.getCenter();
            var newCenter = {};
            newCenter.lat = center.k;
            newCenter.lng = center.D;
            circle.setCenter(newCenter);
            socket.emit('circle-move', $scope.circle.center);
          },
          radius_changed: function(circle){
            circleRadius = circle.getRadius();
            $scope.circle.radius = circleRadius;
            socket.emit('circle-radius-change', $scope.circle.radius);
          }
       }
   };
   var circleRadius = $scope.circle.radius;

   socket.on('circle-move-replay', function(center){
    $scope.circle.center = center;
    console.dir('circle moved emit received  ' + JSON.stringify(center));
    $scope.$apply();
   });

   socket.on('circle-radius-change-reply', function(radius){
    $scope.circle.radius = radius;
    console.dir('circle radius changed emit received  ' + radius);
    $scope.$apply();
   });






   
  ///////////////////////////////////////////////Functions///////////////////////////////////////////////

  $scope.placeSearch = function (place) {
    console.log('placesearch');
    var request = {
      location: {
         lat: $scope.circle.center.latitude,
         lng: $scope.circle.center.longitude
         // lat: $scope.markers[socket.id].coords.latitude,
         // lng: $scope.markers[socket.id].coords.longitude
      },
      radius: $scope.circle.radius,
      types: [place.types]
    };  
    socket.emit('place-search', request)
    return;
  };

  socket.on('place-search-reply', function(request){
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
  });


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
    // $scope.$apply();
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
    console.log('calc fired')
    bounds = new google.maps.LatLngBounds();
    for(var marker in $scope.markers){
      var coord = new google.maps.LatLng($scope.markers[marker].coords.latitude, $scope.markers[marker].coords.longitude);
      bounds.extend(coord);
    }
    center = bounds.getCenter(); 
    console.log("CENTER OBJECT IS:  " + typeof center + "  " + JSON.stringify(center));
    var circleCenter = {};
    circleCenter.latitude = center.k;
    circleCenter.longitude = center.D;
    $scope.circle.center = circleCenter;
  }

  var calcRoute = function(){
    var request = {
      origin: new google.maps.LatLng($scope.markers[socket.id].coords.latitude, $scope.markers[socket.id].coords.longitude),
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

  var userImage = {
    url: '../../assets/images/skoPic.PNG',
    scaledSize : new google.maps.Size(40, 40),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(20, 40),

  }
  var addMarker = function (latitude, longitude, id) {
    console.log('add id: ', id);

    if(id === socket.id){
      $scope.markers[id] = {
        id: id,
        icon: userImage,
        coords:{
          latitude: latitude,
          longitude: longitude
        },
        options:{
          draggable: true,
          animation: google.maps.Animation.BOUNCE
        },
        events: {
          dragend: function(marker, eventName, args){
            console.log('marker dragend event fired once data sent: \n' + JSON.stringify($scope.markers[socket.id], null, 2));
            socket.emit('move-pin', $scope.markers[socket.id]);
          },
          click: function(marker){
            if(marker.getAnimation() != null){
              marker.setAnimation(null);
            } else {
              marker.setAnimation(google.maps.Animation.BOUNCE);
            }
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

