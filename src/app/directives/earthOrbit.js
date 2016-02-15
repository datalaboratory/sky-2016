angular.module('zodiac').directive('earthOrbit', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/earthOrbit.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width();
            var height = $element.height();
            var degreesScale = d3.scale.linear()
                .domain([moment($scope.state.currentDate).startOf('year').toDate(),
                    moment($scope.state.currentDate).endOf('year').toDate()])
                .range([0, 2 * Math.PI]);
            var dayImageScale = d3.scale.linear()
                .domain([0, 24])
                .range([1, 120]);

            var svg = d3.select($element[0]);
            svg.select('.earth-orbit__orbit')
                .attr('cx', width / 2)
                .attr('cy', height / 2);
            svg.selectAll('.earth-orbit__back-sun, .earth-orbit__forward-sun')
                .attr('cx', 2 * width / 5)
                .attr('cy', height / 2);

            var backSun = svg.select('.earth-orbit__back-sun');
            var forwardSun = svg.select('.earth-orbit__forward-sun');

            var earthGroup = svg.select('.earth-orbit__earth-group')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


            var earthWidth = 50;
            var rx = 170;
            var ry = 50;
            var earth = svg.select('.earth-orbit__earth');
            earth
                .attr('width', earthWidth)
                .attr('height', earthWidth)
                .attr('x',  -earthWidth / 2)
                .attr('y',  -earthWidth / 2)
                .attr('transform', 'rotate(23.26,0,0)');

            function updateEarth() {
                var degrees = degreesScale($scope.state.currentDate);
                var opacity = (degrees < Math.PI);
                backSun.style('opacity', opacity * 1);
                forwardSun.style('opacity', (!opacity) * 1);
                var hours = $scope.state.currentDate.getHours() + $scope.state.currentDate.getMinutes() / 60;
                earthGroup
                    .attr('transform', 'translate(' + (width / 2 +rx * Math.cos(degrees)) + ',' +
                    (height / 2 + ry * Math.sin(degrees)) + ')');
                earth
                    .attr('xlink:href', function() {
                        return 'img/earth/' + Math.round(dayImageScale(hours)) + '.png'
                    })
            }
            $scope.$watch('state.currentDate', function() {
                updateEarth();
            })

        }
    }
});
