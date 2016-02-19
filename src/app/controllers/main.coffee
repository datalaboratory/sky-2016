zodiac.controller 'mainCtrl', ($scope, $rootScope, $http, constellationLoader) ->
  $http.get('../data/starData.json').then (responce) ->
    $scope.geoConstellations = constellationLoader.load responce.data
    $('.loading-cover').fadeOut()
    return

  $scope.state =
    selectedCity: 'Moscow'
    currentDate: moment().toDate()
    atmosphere: true
    constellations: false
    graticule: true
    ecliptic: true
    viewDirection: 'horizon'

  $scope.player =
    play: true
    velocity: 600
    tails: false
  return
