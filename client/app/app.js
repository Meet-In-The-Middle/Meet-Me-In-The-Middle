'use strict';

angular.module('meetMeInTheMiddleApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'uiGmapgoogle-maps',
  'angularFileUpload',
  'luegg.directives',
  'angularjs-dropdown-multiselect'
])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  }])

  .factory('authInterceptor', ['$rootScope', '$q', '$cookieStore', '$location', 
    function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  }])
  .run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (toState.authenticate && !loggedIn) {
          $rootScope.returnToState = toState.url;
          $rootScope.returnToStateParams = toParams.Id;
          $location.path('/login');
        }
      });
    });
  }]);
