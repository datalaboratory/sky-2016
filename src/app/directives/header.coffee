zodiac.directive 'header', ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/header.html'
  link: ($scope, $element, $attrs) ->
    $scope.getFormattedDate = ->
      currentDate = moment $scope.state.currentDate
      currentDate.date() + ' ' +
      $scope.monthNames[currentDate.month()]['full'] + ' ' +
      currentDate.year()

    $scope.getHour = -> ('0' + moment($scope.state.currentDate).hour()).slice(-2)

    $scope.getMinute = -> ('0' + moment($scope.state.currentDate).minute()).slice(-2)

    return
