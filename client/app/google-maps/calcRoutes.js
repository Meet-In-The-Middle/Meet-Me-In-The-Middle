var calcRoute = function(userData, usrMarker, otherMarkers, directionsService){
        //User's locations
        var usrLoc;
        //Calculated midpoint
        var center;
        //Routes the users will take
        //var paths = [];
        //Markers for other users
        //var markers = [];
        //Remove all other markers from the map
        //$scope.markers.forEach(function(marker){marker.setMap(null);});  
        //otherMarkers.forEach(function(marker){marker.setMap(null);});

        //Initialize the bounds of the polygon
        var bounds = new google.maps.LatLngBounds();

        //Get all of the users locations
        for(var socketID  in userData) {
          //Add a vertex in the polygon
          if(userData[socketID].coords !== undefined) {
            var coord = new google.maps.LatLng(userData[socketID].coords.latitude, userData[socketID].coords.longitude);
            //If not current user
            if(socketID !== socket.id){
            //Loop through the array and update the appropriate marker if it exists  
              if(!(_.contains(_.map(otherMarker, function(x){
                if(x.id === userData[socketID]){
                  x.positon = coord;
                  return true;
                }
              }), true))) {
              //create a marker for other user(s) and put it in the marker array
                OtherMarkers.push(new google.maps.Marker({
                  id: userData[socketID],
                  position: coord
                }));
              }
            } else {
              usrLoc = coord;
              //$scope.marker.setMap(null);
            }
            //console.log(coord);
            bounds.extend(coord);
          }
        }
        //console.log($scope.markers.length);

        //Find its center
        center = bounds.getCenter();

        //Setup the route from the user's current location to then central meetup point
          var request = {
            origin: usrLoc,
            destination: center,        
            travelMode: google.maps.TravelMode.DRIVING
          };

          //Get the route      
          directionsService.route(request, function(response, status) {
      
          if (status == google.maps.DirectionsStatus.OK) {

            //Add the other user(s) marker
           // $scope.marker.setMap(null);
            var result = [];
            result.push(response,otherMarkers);
            //markers.forEach(function(marker){marker.setMap(instanceMap);});  
            //directionsDisplay.setDirections(response);
           // $scope.marker.setMap(instanceMap);
            return result;
          } else {
              alert("directions response "+status);
          }
        //});
      });
      