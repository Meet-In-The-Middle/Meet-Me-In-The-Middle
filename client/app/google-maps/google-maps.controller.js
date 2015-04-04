'use strict';

angular.module('meetMeInTheMiddleApp')

.config(['uiGmapGoogleMapApiProvider', function(uiGmapGoogleMapApiProvider){
    uiGmapGoogleMapApiProvider.configure({
            //provide api key if available
            v: '3.17',
            libraries: 'weather,geometry,visualization,places'
    });
}])

 .controller('MapsCtrl', ['$scope', '$q', '$http', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 

    function ($scope, $q, $log, uiGmapGoogleMapApi, uiGmapIsReady) {

        var instanceMap;

        // directionsService = new maps.DirectionsService();
        // $scope.directionsDisplay = new maps.DirectionsRenderer();
        // $scope.infowindow = new maps.InfoWindow();
        // $scope.polyline = new maps.Polyline({
        //     path: [],
        //     strokeColor: '#FF0000',
        //     strokeWeight: 3
        //   });

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
          //BUG: Initially this event exists but when pin starts to change it will be overwritten
          //resulting in dragend not being called.
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
        $scope.markers = [];
        //$scope.polylines = [];

      uiGmapGoogleMapApi.then(function(maps) {
       // polymap = maps;
        $scope.resolved = true;
        $scope.googleVersion = maps.version;
        maps.visualRefresh = true;     

        $scope.directionsService = new maps.DirectionsService();
        $scope.directionsDisplay = new maps.DirectionsRenderer();
        $scope.infowindow = new maps.InfoWindow();
        $scope.polyline = new maps.Polyline({
            path: [],
            strokeColor: '#FF0000',
            strokeWeight: 3
          });

        $scope.testCalls = 0;

        $scope.midPoint = new google.maps.Marker({
          //map: instanceMap,
          title: "start"
        });
        
          uiGmapIsReady.promise(1).then(function(instances) {
            instanceMap = instances[0].map;   
            $scope.directionsDisplay.setMap(instanceMap);
            console.log(instanceMap);
          });
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
        

        //TODO: define userId
        // Connect to socket when the user places pin on the map
        var socket = io();
        // Send data whenever user changes pin.
        $scope.$watch("marker.coords.latitude || marker.coords.longitude", function(newVal, oldVal){
          if(newVal !== oldVal){
            socket.emit('move-pin', $scope.marker);
          }
        });


        // marker = {id:c, coors: { latitude: num, longitude: num}}
        // if current ANY user moves pin;
        //dataCollection = {socket.id1:{longitude:num, latitude: num, roomNumber: num}, ..., socket.idN:{longitude:num, latitude:num, roomNumber: num}}
        socket.on('move-pin', function(dataCollection){
            //Great we got at least two users, lets find that midpoint
            if(Object.keys(dataCollection).length >= 2){
              /*for(var sockID in dataCollection){
                if (socket.id === sockID){
                  var start = new google.maps.LatLng(dataCollection[sockID].coords.latitude, dataCollection[sockID].coords.longitude);
                }
                else{
                  var end = new google.maps.LatLng(dataCollection[sockID].coords.latitude, dataCollection[sockID].coords.longitude);
                }
              }
              calcRoute(start, end);
            }*/
            calcRoute(dataCollection);
          }
        });

        $scope.searchbox = { template:'searchbox.tpl.html', events:events};


      var calcRoute = function(userData){
        //User's locations
        var usrLoc;
        //Calculated midpoint
        var center;
        //Routes the users will take
        var paths = [];
        //Markers for other users
        var markers = [];
        //$scope.marker = [];
        
        //Initialize the bounds of the polygon
        var bounds = new google.maps.LatLngBounds();

        //Get all of the users locations
        for(var socketID  in userData) {
          //Add a vertex in the polygon
          var coord = new google.maps.LatLng(userData[socketID].coords.latitude, userData[socketID].coords.longitude);
          //If not current user
          if(socketID !== socket.id){
            //create a marker for other user(s) and put it in the marker array
            $scope.markers.push(new google.maps.Marker({
              id: userData[socketID],
              position: coord
            }));
          } else {
            usrLoc = coord;
          }
          //usrCoords.push(coord);
          //console.log(coord);
          bounds.extend(coord);
        }

        //Find its center
        center = bounds.getCenter();
        //console.log(center);

        //Setup the route from the user's current location to then central meetup point
        //usrCoords.forEach(function(start) {
          var request = {
            origin: usrLoc,
            destination: center,        
            travelMode: google.maps.TravelMode.DRIVING
          };

          //Get the route      
          $scope.directionsService.route(request, function(response, status) {
      
          if (status == google.maps.DirectionsStatus.OK) {
            /*var polyline = new polymap.Polyline({
              path: [],
              strokeColor: '#FF0000',
              strokeWeight: 3
            });*/
            $scope.polyline.setPath([]);
            var path = response.routes[0].overview_path;
            var legs = response.routes[0].legs;
            
            var legs = response.routes[0].legs;
            for (var i=0;i<legs.length;i++) {
              if (i == 0) { 
                var steps = legs[i].steps;
                for (var j=0;j<steps.length;j++) {
                var nextSegment = steps[j].path;
                  for (var k=0;k<nextSegment.length;k++) {
                    $scope.polyline.getPath().push(nextSegment[k]);
                    //$scope.bounds.extend(nextSegment[k]);
                  }
                }
              }
            }
            //Save the route
            //$scope.polylines.push($scope.polyline);
            $scope.polyline.setMap(instanceMap);
            //Add the other user(s) marker
            $scope.markers.forEach(function(marker){marker.setMap(instanceMap);});  


          } else {
              alert("directions response "+status);
          }
        //});
      });
      
      //Display all the routes
      //$scope.polylines.forEach(function(line){line.setMap(instanceMap);});
      

    }

    }])

    .controller('controlCtrl', function ($scope) {
        $scope.controlText = 'Find Me';
        $scope.danger = false;
        $scope.controlClick = function () {
            $scope.danger = !$scope.danger;
            alert('custom control clicked!');
        };
    });

    



    /*


uiGmapGoogleMapApi.then(function(maps) { 
      $scope.directionsService = new maps.DirectionsService();
      $scope.directionsDisplay = new maps.DirectionsRenderer();
      $scope.infowindow = new maps.InfoWindow();
      $scope.polyline = new maps.Polyline({
          path: [],
          strokeColor: '#FF0000',
          strokeWeight: 3
        });
      
        uiGmapIsReady.promise(1).then(function(instances) {

          var instanceMap = instances[0].map;

          console.log(instanceMap);
          $scope.directionsDisplay.setMap(instanceMap);

          $scope.codeAddress = function() {
            var start = document.getElementById('from').value;
            var end = document.getElementById('to').value;
            console.log(start);
            var request = {
              origin:start,
              destination:end,
              travelMode: google.maps.TravelMode.DRIVING
            };

            // $scope.directionsService.route(request, function(response, status) {
            //   if (status == google.maps.DirectionsStatus.OK) {
            //     console.log('!!!!!!');
            //     $scope.directionsDisplay.setDirections(response);
            //   }
            // });  

    $scope.directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      $scope.polyline.setPath([]);
      $scope.bounds = new google.maps.LatLngBounds();
      // startLocation = new Object();
      // endLocation = new Object();
      $scope.directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var summaryPanel = document.getElementById("directions_panel");
      summaryPanel.innerHTML = "";

      // For each route, display summary information.
      var path = response.routes[0].overview_path;
      var legs = response.routes[0].legs;
      for (var i=0;i<legs.length;i++) {
        if (i == 0) { 
          // startLocation.latlng = legs[i].start_location;
          // startLocation.address = legs[i].start_address;
          //marker = createMarker(legs[i].start_location,"midpoint","","green");
          $scope.marker = new google.maps.Marker({
            position: legs[i].start_location,
            map: instanceMap,
            title: "midpoint",
            zIndex: Math.round(legs[i].start_location.lat()*-100000)<<5
          });
          var html = "";
          var label = "midpoint";
          var contentString = '<b>'+label+'</b><br>'+html;
          $scope.marker.myname = "midpoint";

          google.maps.event.addListener($scope.marker, 'click', function() {
            $scope.infowindow.setContent(contentString+"<br>"+$scope.marker.getPosition().toUrlValue(6)); 
            $scope.infowindow.open(instanceMap,$scope.marker);
          });
        }
        //endLocation.latlng = legs[i].end_location;
        //endLocation.address = legs[i].end_address;
        var steps = legs[i].steps;
        for (var j=0;j<steps.length;j++) {
          var nextSegment = steps[j].path;
          for (var k=0;k<nextSegment.length;k++) {
            $scope.polyline.getPath().push(nextSegment[k]);
            $scope.bounds.extend(nextSegment[k]);
          }
        }
      }

      $scope.polyline.setMap(instances[0].map);
       
       var totalDist = 0;
        var totalTime = 0;

        var myroute = response.routes[0];
        for (i = 0; i < myroute.legs.length; i++) {
          totalDist += myroute.legs[i].distance.value;
          totalTime += myroute.legs[i].duration.value;      
        }
        //putMarkerOnRoute(50);

        //function putMarkerOnRoute(percentage) {
        var distance = (50/100) * totalDist;
        var time = ((50/100) * totalTime/60).toFixed(2);
        // if (!marker) {
        //   marker = createMarker(polyline.GetPointAtDistance(distance),"time: "+time,"marker");
        // } else {
          $scope.marker.setPosition($scope.polyline.GetPointAtDistance(distance));
          $scope.marker.setTitle("time:"+time);
        //}
  

        totalDist = totalDist / 1000.
        document.getElementById("total").innerHTML = "total distance is: "+ totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes";


        } else {
          alert("directions response "+status);
        }
      }); 
  
          }
        });
    });   


    */






















    /*


var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var polyline = null;
var infowindow = new google.maps.InfoWindow();

function createMarker(latlng, label, html) {
  var contentString = '<b>'+label+'</b><br>'+html;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: label,
    zIndex: Math.round(latlng.lat()*-100000)<<5
  });
  marker.myname = label;

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString+"<br>"+marker.getPosition().toUrlValue(6)); 
    infowindow.open(map,marker);
  });
  return marker;
}

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true});
  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var myOptions = {
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: chicago
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  polyline = new google.maps.Polyline({
    path: [],
    strokeColor: '#FF0000',
    strokeWeight: 3
  });
  directionsDisplay.setMap(map);
  calcRoute();
}

function calcRoute() {
  var start = document.getElementById("start").value;
  var end = document.getElementById("end").value;
  var travelMode = google.maps.DirectionsTravelMode.DRIVING

  var request = {
      origin: start,
      destination: end,
      travelMode: travelMode
  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      polyline.setPath([]);
      var bounds = new google.maps.LatLngBounds();
      startLocation = new Object();
      endLocation = new Object();
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var summaryPanel = document.getElementById("directions_panel");
      summaryPanel.innerHTML = "";

      // For each route, display summary information.
      var path = response.routes[0].overview_path;
      var legs = response.routes[0].legs;
      for (i=0;i<legs.length;i++) {
        if (i == 0) { 
          startLocation.latlng = legs[i].start_location;
          startLocation.address = legs[i].start_address;
          marker = createMarker(legs[i].start_location,"midpoint","","green");
        }
        endLocation.latlng = legs[i].end_location;
        endLocation.address = legs[i].end_address;
        var steps = legs[i].steps;
        for (j=0;j<steps.length;j++) {
          var nextSegment = steps[j].path;
          for (k=0;k<nextSegment.length;k++) {
            polyline.getPath().push(nextSegment[k]);
            bounds.extend(nextSegment[k]);
          }
        }
      }

      polyline.setMap(map);

      computeTotalDistance(response);
    } else {
      alert("directions response "+status);
    }
  });
}

var totalDist = 0;
var totalTime = 0;
function computeTotalDistance(result) {
  totalDist = 0;
  totalTime = 0;
  var myroute = result.routes[0];
  for (i = 0; i < myroute.legs.length; i++) {
    totalDist += myroute.legs[i].distance.value;
    totalTime += myroute.legs[i].duration.value;      
  }
  putMarkerOnRoute(50);

  totalDist = totalDist / 1000.
  document.getElementById("total").innerHTML = "total distance is: "+ totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes";
}

function putMarkerOnRoute(percentage) {
  var distance = (percentage/100) * totalDist;
  var time = ((percentage/100) * totalTime/60).toFixed(2);
  if (!marker) {
    marker = createMarker(polyline.GetPointAtDistance(distance),"time: "+time,"marker");
  } else {
    marker.setPosition(polyline.GetPointAtDistance(distance));
    marker.setTitle("time:"+time);
  }
}



    */

