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

  startDate = moment().startOf 'day'

  $scope.state = {}

  $scope.states = [
    # 1
    {
      sunRiseDegrees: -Infinity
      play: true
      tails: false

      currentDate: startDate.clone().toDate()
      limitDate: startDate.clone().add(1, 'm').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      zodiacConstellations: false
      otherConstellations: true
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
      currentDate: startDate.clone().add(1, 'm').toDate()
      limitDate: startDate.clone().add(2, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      zodiacConstellations: false
      otherConstellations: true
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 300
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
      limitDate: startDate.clone().add(4, 'h').toDate()
      graticule: true
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      zodiacConstellations: false
      otherConstellations: true
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 300
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
      limitDate: startDate.clone().add(6, 'h').toDate()
      graticule: true
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      zodiacConstellations: false
      otherConstellations: true
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 300
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
      limitDate: startDate.clone().add(8, 'h').toDate()
      graticule: true
      selectedCity: 'Moscow'
      atmosphere: true
      starNames: true
      zodiacConstellations: false
      otherConstellations: true
      currentConstellation: false
      ecliptic: false
      sunTrajectory: false
      velocity: 300
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
      limitDate: startDate.clone().add(9, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: true
      zodiacConstellations: false
      otherConstellations: true
      currentConstellation: true
      ecliptic: false
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 7
    {
      currentDate: startDate.clone().add(9, 'h').toDate()
      limitDate: startDate.clone().add(11, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: false
      velocitySelector: false
      sliders: false
    }
    # 8.1
    {
      currentDate: startDate.clone().add(11, 'h').toDate()
      limitDate: startDate.clone().add(11.5, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 8.2
    {
      currentDate: startDate.clone().month(2).add(11, 'h').toDate()
      limitDate: startDate.clone().month(2).add(11.5, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 8.3
    {
      currentDate: startDate.clone().month(3).add(11, 'h').toDate()
      limitDate: startDate.clone().month(3).add(11.5, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 8.4
    {
      currentDate: startDate.clone().month(1).add(11, 'h').toDate()
      limitDate: startDate.clone().month(1).add(11.5, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 9
    {
      currentDate: startDate.clone().add(11.5, 'h').toDate()
      limitDate: startDate.clone().add(13, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 10
    {
      currentDate: startDate.clone().add(13, 'h').toDate()
      limitDate: startDate.clone().add(18, 'h').toDate()
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
      currentConstellation: true
      ecliptic: true
      sunTrajectory: false
      velocity: 300
      viewDirection: 'horizon'

      globe: false
      checkboxes: false
      earthOrbit: true
      velocitySelector: false
      sliders: false
    }
    # 11
    {
      currentDate: moment().toDate()
      limitDate: undefined
      graticule: false
      selectedCity: 'Moscow'
      atmosphere: false
      starNames: false
      zodiacConstellations: true
      otherConstellations: false
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

  $scope.scenario =
    nOfPages: $scope.states.length - 1
    currentPage: 0

  $scope.$watch 'scenario.currentPage', ->
    if $scope.state.currentDate < $scope.states[$scope.scenario.currentPage]['currentDate']
      console.log 'Speedy Gonzales'
    else
      console.log 'Slowpoke'

    _.forIn $scope.states[$scope.scenario.currentPage], (value, key) ->
      $scope.state[key] = value if $scope.state[key] isnt value
      return

    if $scope.scenario.currentPage is $scope.scenario.nOfPages
      $('.copyright').css 'visibility', 'visible'
      $('.likely').css 'visibility', 'visible'
    return

  $scope.$watch 'state.currentDate', ->
    return if $scope.scenario.currentPage is $scope.scenario.nOfPages

    if $scope.state.currentDate > $scope.states[$scope.scenario.currentPage]['limitDate']
      $scope.scenario.currentPage += 1
    return

  return
