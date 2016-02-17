zodiac.directive 'velocitySelector', ($document) ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/velocity-selector.html'
  link: ($scope, $element, $attrs) ->
    $scope.isTooltipShown = {}

    return
