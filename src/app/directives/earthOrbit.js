zodiac.directive('earthOrbit', function (cityList) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/earthOrbit.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width();
            var height = $element.height();
            var degreesScale = d3.scale.linear()
                .domain([
                    moment().set({'month': 2, 'date': 22}).toDate(),
                    moment().set({'month': 5, 'date': 22}).toDate(),
                    moment().set({'month': 8, 'date': 22}).toDate(),
                    moment().set({'month': 11, 'date': 22}).toDate()
                ])
                .range([-Math.PI / 2, 0, Math.PI / 2, Math.PI]);
            var dayImageScale = d3.scale.linear()
                .domain([0, 24])
                .range([1, 120]);
            var svg = d3.select($element[0]);
            svg.select('.earth-orbit__orbit')
                .attr('cx', width / 2)
                .attr('cy', height / 2);
            svg.selectAll('.earth-orbit__back-sun, .earth-orbit__forward-sun')
                .attr('y', height / 2 - 75);

            var backSun = svg.select('.earth-orbit__back-sun');
            var forwardSun = svg.select('.earth-orbit__forward-sun');

            var earthGroup = svg.select('.earth-orbit__earth-group')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


            var earthWidth = 50;
            var rx = 170;
            var ry = 50;
            var earth = svg.select('.earth-orbit__earth');
            var earthAxis = svg.select('.earth-orbit__axis');
            var earthShadow = svg.select('.earth-orbit__shadow');
            var earthGraticule = svg.select('.earth-orbit__graticule');
            var currentPoint = svg.select('.earth-orbit__city');

            var projection = d3.geo.orthographic()
                .translate([0, 0])
                .rotate([0, 0,-23.26])
                .scale(20.5)
                .clipAngle(90);
            var fixedProjection = d3.geo.orthographic()
                .translate([0, 0])
                .rotate([0, 0,-23.26])
                .scale(20.5)
                .clipAngle(90);
            var graticule = d3.geo.graticule();
            var path = d3.geo.path()
                .projection(projection);
            earthGraticule
                //.attr('d', path(graticule()))
                .attr('class', 'globe-graticule');
            earth
                .attr('width', earthWidth)
                .attr('height', earthWidth)
                .attr('x',  -earthWidth / 2)
                .attr('y',  -earthWidth / 2)
                .attr('transform', 'rotate(23.26,0,0)');
            earthAxis
                .attr('x1', 0)
                .attr('y1', -earthWidth / 2 - 5)
                .attr('x2', 0)
                .attr('y2', earthWidth / 2 + 5)
                .attr('transform', 'rotate(23.26,0,0)');

            var shadowWidth = 41;
            var shadowWidthLeft = d3.scale.linear()
                .domain([0,              Math.PI / 2,        Math.PI, 3 * Math.PI / 2, 2 * Math.PI])
                .range([0, shadowWidth / 2,    shadowWidth / 2,       shadowWidth / 2,0]);
            var shadowWidthRight = d3.scale.linear()
                .domain([0, Math.PI / 2,       Math.PI,       3 * Math.PI / 2, 2 * Math.PI])
                .range([shadowWidth / 2,  shadowWidth / 2, 0, shadowWidth / 2, shadowWidth / 2]);



            function updateEarth() {
                var degrees = degreesScale($scope.state.currentDate);
                if (degrees < 0) degrees += 2* Math.PI;

                var opacity = (degrees < Math.PI);
                backSun.style('opacity', opacity * 1);
                forwardSun.style('opacity', (!opacity) * 1);
                var hours = $scope.state.currentDate.getHours() +
                    $scope.state.currentDate.getMinutes() / 60 +
                    24 * moment($scope.state.currentDate).dayOfYear() / 365;
                earthGroup
                    .attr('transform', 'translate(' + (width / 2 - rx * Math.cos(degrees)) + ',' +
                    (height / 2 + ry * Math.sin(degrees)) + ')');
                var currentFrame = Math.round(dayImageScale(hours)) + 20;
                while (currentFrame > 120) {
                    currentFrame -= 120;
                }
                earth
                    .attr('xlink:href', function() {
                        return 'img/earth-frames/' + currentFrame + '.png'
                    });
                var angle = currentFrame * 3;

                if (angle < 90 - cityList[$scope.state.selectedCity].coordinates[0] || angle > 270 - cityList[$scope.state.selectedCity].coordinates[0]) {
                    currentPoint.attr('fill', '#fff')
                } else {
                    currentPoint.attr('fill', 'none')
                }
                projection
                    .rotate([angle, 0, -23.26]);
                //earthGraticule
                  //  .attr('d', path(graticule()));
                var cityCoordinates = projection(cityList[$scope.state.selectedCity].coordinates);
                var fixedCoordinates = fixedProjection.invert(cityCoordinates);
                currentPoint
                    .attr('cx', cityCoordinates[0])
                    .attr('cy', cityCoordinates[1]);
                var rightRadius = shadowWidthLeft(degrees);
                var leftRadius = shadowWidthRight(degrees);
                var leftSweep = (degrees < 3 * Math.PI /2) * 1;
                var rightSweep = (degrees < Math.PI || degrees > 3 * Math.PI / 2) * 1;
                var rightArc = 'A ' + shadowWidth / 2 + ' ' + rightRadius + ' 90 0 ' + leftSweep + ' 0,' + shadowWidth / 2;
                var leftArc = 'A ' + shadowWidth / 2 + ' ' + leftRadius + ' 270 0 ' + rightSweep + ' 0,' + (-shadowWidth / 2);
                earthShadow
                    .attr('d', 'M 0,' + (-shadowWidth / 2) + rightArc + leftArc + 'z');
            }
            $scope.$watch('state.currentDate', function() {
                updateEarth();
            });
        }
    }
});
