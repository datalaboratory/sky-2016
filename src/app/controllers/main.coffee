zodiac.controller 'mainCtrl', ($scope, $rootScope, $http, constellationLoader) ->
  $http.get('../data/starData.json').then (response) ->
    $scope.geoConstellations = constellationLoader.load response.data
    $('.loading-cover').fadeOut()
    return

  $scope.state =
    selectedCity: 'Moscow'
    currentDate: moment().toDate()
    atmosphere: false
    constellations: true
    currentConstellation: false
    graticule: true
    ecliptic: false
    viewDirection: 'horizon'
    starNames: false
    sunRiseDegrees: 0
    sunTrajectory: false

  $scope.player =
    play: true
    velocity: 1
    tails: false

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

  return
