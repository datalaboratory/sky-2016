zodiac.directive 'compass', (cityList) ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/compass.html'
  link: ($scope, $element, $attrs) ->
    $scope.cityList = cityList

    return
