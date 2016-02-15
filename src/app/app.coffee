appDependencies = [
  'ngRoute'
]

app = angular.module 'zodiac', appDependencies
.config [
  '$routeProvider', '$locationProvider'
  ($routeProvider, $locationProvider) ->
    $routeProvider
    .when '/',
      templateUrl: 'templates/pages/zodiac.html'
      controller: 'ZodiacController'
    .otherwise redirectTo: '/'

    $locationProvider.html5Mode true
    return
]
