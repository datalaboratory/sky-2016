dependencies = [
  'ngRoute'
  'once'
]

zodiac = angular.module 'zodiac', dependencies
  .config [
    '$routeProvider', '$locationProvider'
    ($routeProvider, $locationProvider) ->
      $routeProvider
      .when '/',
        templateUrl: 'templates/pages/main.html'
        controller: 'mainCtrl'
      .otherwise redirectTo: '/'

      $locationProvider.html5Mode true
      return
  ]
  .constant '_', window._
  .run ($rootScope) ->
    $rootScope._ = window._
    return
