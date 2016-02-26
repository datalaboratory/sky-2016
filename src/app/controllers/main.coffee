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
    nOfPages: 9
    currentPage: 0

  $scope.state = {}

  startDate = moment().startOf 'day'

  $scope.states = [
    # 1
    {
      currentDate: startDate.clone().toDate()
      graticule: false
      sunRiseDegrees: 0
      play: true
      tails: false

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
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: false
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 600
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 3
    {
      currentDate: startDate.clone().add(3, 'h').toDate()
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 600
      viewDirection: 'up'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 4
    {
      currentDate: startDate.clone().add(9, 'h').toDate()
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      constellations: false
      currentConstellation: false
      ecliptic: false
      sunTrajectory: true
      velocity: 600
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 5
    {
      currentDate: startDate.clone().add(12, 'h').toDate()
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: false
      currentConstellation: true
      ecliptic: false
      sunTrajectory: true
      velocity: 600
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 6
    {
      currentDate: startDate.clone().add(18, 'h').toDate()
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: false
      sunTrajectory: true
      velocity: 600
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 7
    {
      currentDate: startDate.clone().add(22, 'h').toDate()
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: false
      sunTrajectory: true
      velocity: 600
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 8
    {
      currentDate: startDate.clone().add(26, 'h').toDate()
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: true
      velocity: 72000
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: true
      sliders: true
    }
    # 9
    {
      currentDate: startDate.clone().add(1, 'month').toDate()
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      constellations: true
      currentConstellation: true
      ecliptic: true
      sunTrajectory: true
      velocity: 7200
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: true
      sliders: true
    }
    # 10
    {
      currentDate: startDate.clone().add(1, 'month').add(1, 'd').toDate()
      selectedCity: 'Murmansk'
      atmosphere: false
      starNames: true
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
    i = 1
    while i <= $scope.scenario.nOfPages
      if $scope.state.currentDate > $scope.states[i]['currentDate'] and
      $scope.scenario.currentPage < i
        $scope.scenario.currentPage = i
      i++
    return

  return
