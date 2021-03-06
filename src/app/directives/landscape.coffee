zodiac.directive 'landscape', ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/landscape.html'
  link: ($scope, $element, $attrs) ->
    thresholdAngles = [-10, 10]
    opacityLimits = [1, 0]
    opacityScale = d3.scale.linear()
    .domain thresholdAngles
    .range opacityLimits

    $scope.getNightOpacity = ->
      unless $scope.state.atmosphere
        opacityLimits[0]
      else if $scope.state.sunRiseDegrees < thresholdAngles[0]
        opacityLimits[0]
      else if $scope.state.sunRiseDegrees > thresholdAngles[1]
        opacityLimits[1]
      else
        opacityScale $scope.state.sunRiseDegrees

    return
