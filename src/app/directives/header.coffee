zodiac.directive 'header', (cityList) ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/header.html'
  link: ($scope, $element, $attrs) ->
    $scope.cityList = cityList

    $scope.getFormattedDate = ->
      currentDate = moment $scope.state.currentDate
      day = currentDate.date()
      month = $scope.monthNames[currentDate.month()]['full']
      year = currentDate.year()

      day + ' ' + month + ' ' + year

    $scope.getHour = -> ('0' + moment($scope.state.currentDate).hour()).slice(-2)

    $scope.getMinute = -> ('0' + moment($scope.state.currentDate).minute()).slice(-2)

    return
