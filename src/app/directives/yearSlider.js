zodiac.directive('yearSlider', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/yearSlider.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width();
            var offset = 20;
            $scope.yearScale = d3.time.scale()
                .domain([moment($scope.state.currentDate).startOf('year').toDate(),
                    moment($scope.state.currentDate).endOf('year').subtract(1, 'h').toDate()])
                .range([offset, width - offset]);

            $scope.monthScale = d3.time.scale()
                .domain([moment($scope.state.currentDate).startOf('month').toDate(),
                    moment($scope.state.currentDate).endOf('month').toDate()])
                .range([offset, width - offset]);

            $scope.moveHandle = function($event, period) {
                var scale = (period == 'year') ? $scope.yearScale : $scope.monthScale;
                $event.preventDefault();
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
                function mousemove(e) {
                    var pxValue = e.pageX;
                    pxValue = Math.max(offset, pxValue);
                    pxValue = Math.min(width - offset, pxValue);
                    $scope.state.currentDate = scale.invert(pxValue);
                    $scope.$apply();
                }
                function mouseup(){
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup)
                }
            };

            var axisYear = d3.svg.axis()
                .scale($scope.yearScale)
                .orient('bottom');
            var axisMonth = d3.svg.axis()
                .scale($scope.monthScale)
                .orient('bottom');
            d3.select($element[0])
                .select('.year-axis')
                .attr("transform", "translate(0," + 30 + ")")
                .call(axisYear);
            d3.select($element[0])
                .select('.month-axis')
                .attr("transform", "translate(0," + 30 + ")")
                .call(axisMonth);
            $scope.$watch('state.currentDate', function () {
                if ($scope.monthScale.domain()[0].getMonth() != $scope.state.currentDate.getMonth()) {
                    $scope.monthScale.domain([moment($scope.state.currentDate).startOf('month').toDate(), moment($scope.state.currentDate).endOf('month').toDate()]);
                    d3.select($element[0])
                        .select('.month-axis')
                        .call(axisMonth);
                }
            })

        }
    }
});
