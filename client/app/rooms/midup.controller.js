'use strict';

angular.module('meetMeInTheMiddleApp')

  .controller('midUpCtrl', ['$scope', '$timeout', '$http', '$location','Auth', 'MainFactory', 'SocketFactory',
    function ($scope, $timeout, $http, $location, Auth, MainFactory, SocketFactory) {

      //Populate select box with the places nearby options
      $scope.places_Nearby = MainFactory.places_Nearby;
      //Holder for items selected
      $scope.possiblePlaces = [];
      $scope.selectedPlace = [];
      $scope.selectedPlaces = [];
      var user = Auth.getCurrentUser();
      var userId = user._id;
      var username = user.name;
      var socket = SocketFactory.socket;
      console.log('socket is ', socket);
      $scope.user = {};
      $scope.messages = [];
      var url = $location.$$path.split('/');
      var roomId = url[url.length - 1];
      $scope.roomNonExistest = false;

      /**
       *
       * @param string
       */
      $scope.addPlace = function(string){
        if($scope.selectedPlaces.indexOf(string) === -1){
          console.log('about to push');
          $scope.selectedPlaces.push(string);
        }
        console.log('running');
      };
      /**
       *
       */
      $scope.removePlace = function(){
        var tempArr = $scope.selectedPlaces;
        var i = tempArr.indexOf($scope.selectedPlace.length-1);
        $scope.selectedPlaces = tempArr.splice(i);
        //console.log('about to push');
        //$scope.selectedPlaces.push(string);
        // }
        console.log('running');
      };



      /**
       * init called when page loads
       */
      $scope.init = function() {
        //addUserToRoom();  //commented out while we test socket.io vs http request when joining midUp
        loadChatMessages();
      };
      /**
       *
       */
      var loadChatMessages = function() {
        socket.on('chat-messages', function(data) {
          $scope.messages = data;
          var chatBox = angular.element('.chat-box')
          chatBox.scrollTop = chatBox.scrollHeight;
        })
      };

      /**
       * send chat message by emitting to roomId (which means only that room will receive message)
       */
      $scope.sendChat = function() {
        var message = $scope.userMessage;
        var userId = Auth.getCurrentUser()._id;
        var username = Auth.getCurrentUser().name;
        socket.emit(roomId, userId, username, message);
        $scope.userMessage = "";
      };
      /**
       *
       */
      socket.on('server-chat-response', function(messageObj) {
        $scope.$apply(function() {
          $scope.messages = $scope.messages.concat(messageObj);
        });
      });
      /**
       *
       */
      socket.on('error-msg', function(errMsg) {
        console.log('errMsg is ', errMsg);
        if( errMsg === 'midup does not exist or has been deleted') {
          $scope.$apply(function() {
            $scope.roomNonExistest = true;
          });
          $timeout(function() {
            $location.path('/mymidups');
          }, 5000);
        }
      });

    }]);
