angular.module('zodiac').directive('yearSlider', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'directives/yearSlider.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width();
            var offset = 20;
            $scope.yearScale = d3.time.scale()
                .domain([new Date(2015, 0, 1), new Date(2016, 0, 1)])
                .range([offset, width - offset]);

            $scope.moveHandle = function($event) {
                $event.preventDefault();
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
                function mousemove(e) {
                    var pxValue = e.pageX;
                    pxValue = Math.max(offset, pxValue);
                    pxValue = Math.min(width - offset, pxValue);
                    $scope.state.currentDate = $scope.yearScale.invert(pxValue);
                    $scope.$apply();
                }
                function mouseup(){
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup)
                }
            };

            var axisX = d3.svg.axis()
                .scale($scope.yearScale)
                .orient('bottom');
            var axisG = d3.select($element[0])
                .select('.year-axis')
                .attr("transform", "translate(0," + 30 + ")")
                .call(axisX);

        }
    }
});