'use strict';

angular.module('meetMeInTheMiddleApp')

  .controller('profileCtrl', ['$scope', '$http', '$upload', 'Auth', 'UserImage',
    function ($scope, $http, $upload, Auth, UserImage) {
    //profile controller methods
    var user = Auth.getCurrentUser();
    $scope.user = {};
    $scope.init = function () {
      $scope.user.name = user.name;
      $scope.loadUserImage(user._id);
    };

    //watch for image file upload
    $scope.$watch('files', function () {
      $scope.upload($scope.files);
    });

    /**
     * called when user has clicked to upload a file and selected the file
      * @param files
     */
    $scope.upload = function (files) { // user controller
      var userId = user._id;
      if (files && files.length) {
        var file = files[0];
        $upload.upload({
          url: 'user/image',
          fields: {
            'userId': userId
          },
          file: file
        }).progress(function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' +
          evt.config.file.name);
        }).success(function (data, status, headers, config) {
          console.log('data is ', data);
          //update DOM with new image URL
          $scope.user.image = data.path;
          $scope.image = data;
          if ($scope.image.uploadError) {
            $scope.user.uploadError = $scope.image.uploadError;
            console.log('error on hand');
          } else {
            $scope.user.uploadError = '';
          }
        });
      }

    };
    /**
     * load user image using factory called UserImage
     * @param username
     */
    $scope.loadUserImage = function (userId) {
      UserImage.loadUserImage(userId, function(imageUrl) {
        var random = (new Date()).toString();
        //if user changes their profile image, we overwrite it in azure blob storage using
        //same image file name so we need to
        //append a random string as a param to force ng-src to reload the image
        $scope.user.image = imageUrl + '?cb=' + random;

      });
    };

    $scope.user.about = "Say something about yourself... like whether your prefer coffee or tea, sugar or agave syrup, paintball or making out";
    $scope.editorEnabled = false;
    $scope.enableEditor = function() {
      $scope.editorEnabled = true;
      $scope.editableText = $scope.user.about;
    };
    $scope.disableEditor = function() {
      $scope.editorEnabled = false;
    };
    $scope.saveText = function() {
      $scope.user.about = $scope.editableText;
      $scope.disableEditor();
    };


  }]);


//just adding a comment to be deleted later
