zodiac.controller 'mainCtrl', ($scope, $rootScope, $http, constellationLoader, cityList) ->
  $http.get('../data/starData.json').then (response) ->
    $scope.geoConstellations = constellationLoader.load response.data
    $('.loading-cover').fadeOut()
    return

  $scope.cityList = cityList

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

  $scope.zodiacName =
    name: ''
    declension: ''

  $scope.scenario =
    nOfPages: 10
    currentPage: 0

  $scope.state = {}

  startDate = moment().startOf 'day'

  $scope.states = [
    # 1
    {
      sunRiseDegrees: 0
      play: true
      tails: false

      currentDate: startDate.clone().toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 1
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 2
    {
      currentDate: startDate.clone().add(2, 'm').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 3
    {
      currentDate: startDate.clone().add(2, 'h').toDate()
      graticule: true
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 4
    {
      currentDate: startDate.clone().add(4, 'h').toDate()
      graticule: true
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 400
      viewDirection: 'up'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 5
    {
      currentDate: startDate.clone().add(6, 'h').toDate()
      graticule: true
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 6
    {
      currentDate: startDate.clone().add(8, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      constellations: false
      currentConstellation: true
      ecliptic: false
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 7
    {
      currentDate: startDate.clone().add(10, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      constellations: false
      currentConstellation: true
      ecliptic: false
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 8
    {
      currentDate: startDate.clone().add(12, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: true
    }
    # 9
    {
      currentDate: startDate.clone().endOf('year').startOf('day').add(14, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: true
    }
    # 10
    {
      currentDate: startDate.clone().endOf('year').startOf('day').add(16, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 400
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: true
    }
    # 11
    {
      currentDate: moment().toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: true
      velocity: 1
      viewDirection: 'horizon'

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

  $scope.$watch 'state.currentDate', ->
    return if $scope.scenario.currentPage > $scope.scenario.nOfPages - 2

    if $scope.state.currentDate > $scope.states[$scope.scenario.currentPage + 1]['currentDate']
      $scope.scenario.currentPage += 1
    return

  return
