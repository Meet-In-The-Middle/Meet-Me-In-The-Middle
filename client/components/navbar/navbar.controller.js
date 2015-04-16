'use strict';

angular.module('meetMeInTheMiddleApp')
  .controller('NavbarCtrl', ['$scope', '$location', '$anchorScroll', 'Auth',
    function ($scope, $location, $anchorScroll, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.login = function() {
      $location.path('/login');
    };

    $scope.signup = function() {
      $location.path('/signup');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    //load page and scroll to anchor tag
    $scope.linkTo = function(id) {
      $location.url(id);
    };


  }]);
