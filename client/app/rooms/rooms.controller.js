'use strict';

angular.module('meetMeInTheMiddleApp')
  .controller('roomsCtrl', ['$scope', '$http', '$window', '$location', '$q', 'Auth', 'MainFactory', 'SocketFactory',
    function ($scope, $http, $window, $location, $q,  Auth, MainFactory, SocketFactory) {

      //profile controller methods
      var user = Auth.getCurrentUser();
      var userId = user._id;
      var url = $location.$$path.split('/');
      var roomId = url[url.length - 1];
      var socket = io();
      $scope.user = {};
      $scope.inviteEmails = {};
      $scope.clickedFlag = false;
      /**
       * @desc initial page on load to show rooms user belongs to
       * and to set $scope elements for editable text box to create new room (midup)
       */
      $scope.init = function () {
        $scope.user.name = user.name;
        editableTextBox();
        emailInviteInit();
      };

      //load rooms the user is in, ie query DB for users rooms (rooms)
      /**
       * @desc  Async call to get all rooms (midups) a user belongs to
       * @param Id String (roomId)
       * @returns {*}
       */
      var asyncGetRooms = function(Id) {
        return $q(function(resolve, reject) {
          setTimeout(function() {
            if( Id ) {
              resolve(Id);
            }
          }, 700);
        });
      };
      /**
       * @desc use promise to load list of rooms user belongs to asyncronously
       * @type {*}
       */
      var getRooms = function() {
        MainFactory.getRoomsForUser(Auth.getCurrentUser()._id, function(rooms) {
          $scope.rooms = rooms;
        });
      };
      var promise = asyncGetRooms(Auth.getCurrentUser());
      promise.then(function() {
        getRooms();
      });
      /**
       * Set $scope elements for create room button to show input to get new room name
       */
      var editableTextBox = function() {
        $scope.editorEnabled = false;
        $scope.enableEditor = function() {
          $scope.editorEnabled = true;
          $scope.editableText = $scope.user.about;
        };
        $scope.disableEditor = function() {
          $scope.editorEnabled = false;
        };
      };
      /**
       * @desc User creates new room which will be sent to DB and then re-populate rooms list
       */
      $scope.createRoom = function() {
        var userRoomObj = {
          roomId: roomId,
          name: $scope.editableText,
          user: {
            userId: user._id,
            name: user.name,
            coords: {
              latitude: "",
              longitude: ""
            },
            owner: true,
            imageUrl: ""
          },
          info: $scope.roomInfo || '',
          active: true
        };


        MainFactory.createRoom(userRoomObj, function() {
          console.log('userRoomObj is ', userRoomObj);
          //getRooms is called after createRoom http request comes back with success from server
          getRooms();
        });
        $scope.disableEditor();
        $scope.editableText = '';
        $scope.roomInfo = '';
        //$scope.remove = false;
      };

      /**
       * set inviteEnabled to false
       * */
      var emailInviteInit = function() {
        $scope.inviteEnabled = false;
      };
      /**
       * @desc logic for enabling only the email invite input for the desired room (that was clicked on)
       * */
      $scope.enableInvite = function(roomId) {
        console.log('roomId ', roomId);
        $scope.inviteEnabled = function(room) {
          return room === roomId? true: false;
        };
        //$scope.inviteEmails = $scope.emails;
      };
      /**
       * @desc disable email invite box
       * */
      $scope.disableInvite = function() {
        $scope.inviteEnabled = false;
      };
      /**
       * @desc logic for email invite input box
       * */
      $scope.clicked = function() {
        $scope.clickedFlag = true;
      }
      /** @desc logic for email invite input box
       * */
      $scope.keyUp = function() {
        $scope.clickedFlag = false;
      };
      /**
       * @desc Get and send emails to server that will be invited to room (midup)
       * */
      $scope.sendEmailInvites = function(roomId, roomName) {
        var pattern = /\s*[,;]\s*/;
        var emails = $scope.inviteEmails[roomId].split(pattern);
        //console.log('emails is ', emails);
        socket.emit('email-invites', emails, roomId, user.name, roomName);
        socket.on('email-invites-reply', function(message) {
        });
      };

      var midUpIndex;
      /**
       * @desc Delete midup (if user is owner)
       * @param roomId
       * @param index
       */
      $scope.deleteMidup = function(roomId, index) {
        midUpIndex = index;
        var result = $window.confirm('Are you certain you want to DELETE this MidUp? Changes cannot be recovered.\n\n' +
        'Click OK to Delete or Cancel');
        if( result === true ) {
          socket.emit('delete-midup', roomId, userId);
        }
      };
      /**
       * @desc Leave midup if not owner
       * @param roomId
       * @param index
       */
      $scope.leaveMidup = function(roomId, index) {
        midUpIndex = index;
        var result = $window.confirm('Are you certain you want to LEAVE this MidUp?\n\n' +
        'Click OK to Delete or Cancel');
        if( result === true ) {
          socket.emit('leave-midup', roomId, userId);
        }
      };
      /**
       * listener for data returned
       */
      socket.on('delete-midup-reply', function(data, err) {
        //error handling
        if( !!err ) {
          //error handling would go here
        } else if( !!data ) {
          (function removeRoomFromDOM() {
            var rooms = $scope.rooms;
            for( var i = 0; i < rooms.length; i++ ) {
              if( rooms[i].roomId === data ) {
                rooms.splice(i,1);
              } else {
                //rooms[i].remove = false;
              }
            }
          })();
          //kick off digest cycle to remove room from DOM
          $scope.$apply(function() { });
        }
      });
      /**
       * listener for data returned from server after user clicks on Leave Midup
       */
      socket.on('leave-midup-reply', function(data) {
        if( !!data ) {
          $scope.$apply(function() {
            $scope.rooms = data;
          });
        }
      });

    }]);


