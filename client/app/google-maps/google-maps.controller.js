'use strict';

angular.module('meetMeInTheMiddleApp')

.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider){
    uiGmapGoogleMapApiProvider.configure({
            //provide api key if available
            v: '3.17',
            libraries: 'geometry,visualization,places'
    });
}])

.controller('MapsCtrl', ['$scope', '$q', '$http', '$location', 'Auth','uiGmapGoogleMapApi', 'uiGmapIsReady', 'MainFactory', 'SocketFactory',
    function ($scope, $q, $log, $location, Auth, uiGmapGoogleMapApi, uiGmapIsReady, MainFactory, SocketFactory) {
  var socket = io();
  SocketFactory.socket = socket;
  var geolocationAvailable;
  var center;
  var circleRadius;
  var bounds;
  var instanceMap;
  var userInfo;
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

  var places_Nearby;

  $scope.map = { control: {}, center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4 };
  $scope.options = {
    scrollwheel: false,
    scaleControl: true,
    mapTypeControl: false
  };
  $scope.map = { control: {}, center: { latitude: 40.1451, longitude: -99.6680 }, zoom: 4 };
  $scope.options = {scrollwheel: false, scaleControl: true};
  $scope.markers = {};
  $scope.place = {};
  $scope.placesNearby = [];
  $scope.places = [
    { id: 1, name: 'Restaurants'},
    { id: 2, name: 'Mexican'},
    { id: 3, name: 'Italian'},
    { id: 4, name: 'Pizza'},
    { id: 5, name: 'Sandwiches'},
    { id: 6, name: 'Bar'},
    { id: 7, name: 'Buffet'},
    { id: 8, name: 'Fast Food'},
    { id: 9, name: 'Coffee'},
    { id: 10, name: 'Ice Cream'},
    { id: 11, name: 'Hotels'},
    { id: 12, name: 'Movie Theaters'},
    { id: 13, name: 'Shopping'},
    { id: 14, name: 'Parks'},
    { id: 15, name: 'Fun'},
    { id: 16, name: 'Entertainment'},
    { id: 17, name: 'Golf'}
  ];

$scope.circle = {
   id: 1,
   // center: {         // dont need a default center???
   //     latitude: 44,
   //     longitude: -108
   // },
   radius: 10000, // need a default radius???
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
   clickable: true, // optional: defaults to true
   visible: false, // optional: defaults to true
   control: {}
};

  uiGmapGoogleMapApi.then(function(maps) {
    maps = maps;
    $scope.googleVersion = maps.version;
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
      //userId = socket.id;
      // userId = user._id;
      console.log("!!!!!User ID: ", userId);
      console.log('user : ', user);
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

  $scope.searchbox = { template:'searchbox.tpl.html', events:events, position:"LEFT_BOTTOM"};

  socket.on('move-pin-reply', function(dataCollection){
    console.log('pin move event!!!!!!');
    console.log('dataCollection: ', dataCollection);
    for(var marker in dataCollection){
      console.log('marker', marker);
      if(marker !== userId){
        console.log('inner socket add!!!!!!');
        console.log('data received', dataCollection);
        addMarker(dataCollection[marker].coords.latitude, dataCollection[marker].coords.longitude, marker);
        $scope.$apply();
      }
      console.log('markers: ', $scope.markers);
    }

    socket.on('error', function(message) {
      console.log('error message is ', message);
    });

    if(Object.keys($scope.markers).length >= 2){
      // console.log('center before: ', center);
      // console.log('calc center');
      // calculateCenter();
      // console.log('center after: ', center);
      // console.log('calcRoute');
      // calcRoute();
      if($scope.circle.center === undefined){
        calculateCenter();
        calcCircleCenter();
      }
      if($scope.markers[userId]){
        calculateCenter();
        calcRoute();
      }
    }

    // if(Object.keys($scope.markers).length === 2){
    //   var end;
    //   if(Object.keys($scope.markers)[0] === userId){ end = Object.keys($scope.markers)[1]; }
    //   else{ end = Object.keys($scope.markers)[0]; }
    //   calcRoute2Users(userId, end);
    // }
  });


  socket.on('join-room-reply', function(userData) {
    console.log('userData is ', userData);
    for(var marker in userData) {
      if(userData[marker]._id === userId){
        userInfo = userData[marker];
      }
      console.log(123);
      // console.log('latitude is ', Number(userData[marker].coords.latitude));
      // console.log('longitude is ', Number(userData[marker].coords.longitude));
      if( userData[marker].coords.latitude !== "" && userData[marker].coords.longitude !== "" ) {
        addMarker(Number(userData[marker].coords.latitude), Number(userData[marker].coords.longitude), userData[marker]._id);
      }
    }
  });

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
    console.log("!!!!place: ", place);
    if(!isNaN(Number(place.radius))){
      console.log("RADIUS: ", place.radius);
      $scope.circle.radius = Number(place.radius);
      return;
    }
    else{
      alert('radius not a number');
    }
    if($scope.circle.center){
      var request = {
        location: {
          lat: $scope.circle.center.latitude, 
          lng: $scope.circle.center.longitude
        },
        radius: $scope.circle.radius
      };
      if(place.types){
        console.log('!!!!!!!!!types!!!!!!!!');
        request.types = [place.types];
      }
      else if(place.category){
        console.log('!!!!!!!!!category name!!!!!!!!');
        request.types = [place.category.name.toLowerCase()];
        //request.types.push(place.category.name.toLowerCase());//.toString()];
      }

      console.log('place search request: ', request);
      socket.emit('place-search', request);
      return;
    }
    else{
      alert('Error! No marker set on Map. Please add at least one marker to the map.');
      return;
    }
  };

  socket.on('place-search-reply', function(request){
   //var request = { location: { lat: latitude, lng: longitude }, radius: radius, types: place };
   console.log('socket request: ', request);
    service.nearbySearch(request, function (results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        //Reset the places object
        //placesNearby = {};
        //places_Nearby = [];
        console.log('place results: ', results);
        for (var i = 0; i < results.length; i++) {
          //console.log(results[i]);
          //Update places object

          // updatePlaces(results[i], i);

          // console.log(results[i]);
          // if(results[i].photos){
          //   console.log(results[i].photos[0].getUrl);
          //   //console.log(results[i].photos[0].getUrl());
          //   var test = results[i].photos[0].getUrl;
          //   console.log(test());
          // }
          //console.log(results[i]);

          // if(i === 0){ placeDetails(results[i].id); }
          
          addPlace(results[i]);

          // $scope.$apply();
        }
        //console.log(places_Nearby);
        $scope.placesNearby = places_Nearby;
      }
      else{
        alert("directions response " +status);
      }
    });
  });

  var addPlace = function (place) {
    //Format the icon to be displayed
    // var icon = {
    //   url: place.icon,
    //   origin: new google.maps.Point(0,0),
    //   anchor: new google.maps.Point(0, 0),
    //   scaledSize: new google.maps.Size(20, 20)
    // };

    //Define the marker
    $scope.markers[place.id] = {
      _id: place.id,
      coords: {
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      },
      //icon: icon,
      showWindow: false,
      name: place.name,
    };
    $scope.$apply();
  }

  var updatePlaces = function(place, id){
    //Information to be collected about a place
    //var placeInfo = ['name','opening_hours[open_now]','photos', 'price_level', 'rating'];
    var placeInfo = ['name','photos', 'price_level', 'rating'];
    var placeTags = ['','','Price Level: ','Rating: '];
    if(places_Nearby[id] === undefined) {
      places_Nearby[id] = [];
     for(var x = 0; x < placeInfo.length ; x++){
        if(place[placeInfo[x]] !== undefined) {
          if(placeTags[x] === 'Price Level: '){
            var y = place[placeInfo[x]];
            var cost = '';
            while(y > 0){
              cost = cost + '$';
              y--;
            }
            places_Nearby[id].push(placeTags[x] + cost);
          } else if(placeInfo[x] === 'photos') {
             //places_Nearby[id].push(place[placeInfo[x]]);
             places_Nearby[id].push(place[placeInfo[x]][0].getUrl({'maxWidth': 100, 'maxHeight': 100}));
             //console.log('PPPPPPPPPPPPPP', place[placeInfo[x]][0].getUrl({'maxWidth': 100, 'maxHeight': 100}));
          }else {
            places_Nearby[id].push(placeTags[x] + place[placeInfo[x]]);
          }
        } else {
          places_Nearby[id].push(placeTags[x] + 'None provided.')

        }
      }
      if(place.opening_hours.open_now){
        places_Nearby[id].push('Currently open.');
      } else {
        places_Nearby[id].push('Currently closed.');
      }
    }
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


  var placeDetails = function(placeId){
    var request = {
      placeId: placeId
    };
    console.log(request);
    service.getDetails(request, function(place, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        //createMarker(place);
        console.log(status);
        console.log('getDetails: ', place);
      }
      else{
        alert("service get details response "+status);
      }
      console.log('getDetailsafter: ', place);
    });
  }

  var extendBounds = function(latitude, longitude){
    var coord = new google.maps.LatLng(latitude, longitude);
    bounds.extend(coord);
    center = bounds.getCenter();
  }

  var calcCircleCenter = function(){
    var circleCenter = {};
    circleCenter.latitude = center.k;
    circleCenter.longitude = center.D;
    $scope.circle.center = circleCenter;
    $scope.circle.visible = true;
    $scope.$apply();
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
    console.log('Request: ', JSON.stringify(request));
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
  };

  var addMarker = function (latitude, longitude, id) {
    console.log('add id: ', id);
    console.log('---------- ',userInfo);
    if(id === userId && userInfo.owner === true){
      // console.log('I AM THE OWNER!!!');
      $scope.circle.draggable = true;
      $scope.circle.editable = true;
      $scope.circle.events = {
        dragend: function(circle){
          var center = circle.getCenter();
          var newCenter = {};
          newCenter.lat = center.k;
          newCenter.lng = center.D;
          circle.setCenter(newCenter);
          socket.emit('circle-move', $scope.circle.center);
        },
        radius_changed:  function(circle){
          circleRadius = circle.getRadius();
          $scope.circle.radius = circleRadius;
          socket.emit('circle-radius-change', $scope.circle.radius);
        }
      }
      $scope.$apply();
    }

    if(id === userId){
      $scope.markers[id] = {
        _id: userId,
        roomId: roomId,
        icon: userImage,
        name: user.name,
        coords:{
          latitude: latitude,
          longitude: longitude
        },
        info: '',
        options:{
          draggable: true
          // animation: google.maps.Animation.BOUNCE
        },
        events: {
          dragend: function(marker, eventName, args){
            console.log('marker dragend event fired once data sent: \n' + JSON.stringify($scope.markers[userId], null, 2));
            socket.emit('move-pin', $scope.markers[userId]);
          }
          // click: function(marker){
          //   if(marker.getAnimation() != null){
          //     marker.setAnimation(null);
          //   } else {
          //     marker.setAnimation(google.maps.Animation.BOUNCE);
          //   }
          // }
        }
      }
      console.log('marker added event: \n' + JSON.stringify($scope.markers[userId], null, 2))
      socket.emit('move-pin', $scope.markers[userId]);
    }else{
      $scope.markers[id] = {
        _id: id,
        roomId: roomId,
        icon: 'http://www.googlemapsmarkers.com/v1/0099FF/',
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
    directionsDisplay.setMap(null);
    directionsDisplay.setMap(instanceMap);
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
    for(var marker in data){
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
      zoom: zoom
    }
  };
}]);
