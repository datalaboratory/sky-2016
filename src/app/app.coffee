appDependencies = [
  'ngRoute'
]

zodiac = angular.module 'zodiac', appDependencies
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
