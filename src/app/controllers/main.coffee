zodiac.controller 'mainCtrl', ($scope, $rootScope, $http, constellationLoader) ->
  $http.get('../data/starData.json').then (response) ->
    $scope.geoConstellations = constellationLoader.load response.data
    $('.loading-cover').fadeOut()
    return

  $scope.monthNames = [
    {full: 'января', short: 'янв'}
    {full: 'февраля', short: 'фев'}
    {full: 'марта', short: 'мар'}
    {full: 'апреля', short: 'апр'}
    {full: 'мая', short: 'май'}
    {full: 'июня', short: 'июнь'}
    {full: 'июля', short: 'июль'}
    {full: 'августа', short: 'авг'}
    {full: 'сентября', short: 'сен'}
    {full: 'октября', short: 'окт'}
    {full: 'ноября', short: 'ноя'}
    {full: 'декабря', short: 'дек'}
  ]

  $scope.scenario =
    nOfPages: 9
    currentPage: 0

  $scope.state = {}

  $scope.states = [
    # 1
    {
      currentDate: moment().startOf('day').toDate()
      graticule: false
      viewDirection: 'horizon'
      sunRiseDegrees: 0
      play: true
      tails: false
      globe: false

      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 1

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 2
    {
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 600

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 3
    {
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 600

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 4
    {
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: true
      velocity: 3600

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 5
    {
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: false
      currentConstellation: true
      ecliptic: false
      sunTrajectory: true
      velocity: 3600

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 6
    {
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: true
      velocity: 3600

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 7
    {
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: true
      velocity: 3600

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 8
    {
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: true
      velocity: 7200

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: true
      sliders: true
    }
    # 9
    {
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: true
      velocity: 7200

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: true
      sliders: true
    }
    # 10
    {
      selectedCity: 'Murmansk'
      atmosphere: false
      starNames: true
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: true
      velocity: 7200

      globe: true
      checkboxes: true
      earthOrbit: true
      velocitySelector: true
      sliders: true
    }
  ]

  $scope.$watch 'scenario.currentPage', ->
    _.forIn $scope.states[$scope.scenario.currentPage], (value, key) ->
      $scope.state[key] = value if $scope.state[key] isnt value
      return

    if $scope.scenario.currentPage is $scope.scenario.nOfPages
      $('.copyright').css 'visibility', 'visible'
      $('.likely').css 'visibility', 'visible'
    return

  return
