zodiac.directive('globeWithCities', function (cityList) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/globeWithCities.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width();
            var svg = d3.select($element[0]).select('svg');

            var globeProjection = d3.geo.orthographic()
                .translate([width / 2, width / 2])
                .scale(100)
                .rotate([-75, -30])
                .clipAngle(90);

            var globePath = d3.geo.path()
                .projection(globeProjection);

            var graticule = d3.geo.graticule()
                .step([15, 15]);
            var g = svg.append('g');

            g.append('circle')
                .attr('cx', width / 2)
                .attr('cy', width / 2)
                .attr('r', 100)
                .attr('class', 'globe-circle-back')
                .on('mouseover', function() {
                    $scope.showCitySunPath = true;
                    $scope.$apply();
                })
                .on('mouseleave', function() {
                    $scope.showCitySunPath = false;
                    $scope.$apply();
                });
            g.append('path')
                .attr('d', globePath(graticule()))
                .attr('class', 'globe-graticule');

            var cityGroup = g
                .selectAll('g')
                .data(Object.keys(cityList))
                .enter()
                .append('g');
            cityGroup.append('circle')
                .attr('cx', function (d) {
                    return globeProjection(cityList[d].coordinates)[0]
                })
                .attr('cy', function (d) {
                    return globeProjection(cityList[d].coordinates)[1]
                })
                .attr('r', 3)
                .attr('class', 'globe-city');
            cityGroup.append('text')
                .text(function(d) {
                    return cityList[d].name
                })
                .attr('x', function (d) {
                    return globeProjection(cityList[d].coordinates)[0] + 5
                })
                .attr('y', function (d) {
                    return globeProjection(cityList[d].coordinates)[1]
                })
                .attr('class', 'globe-names');

            function checkClass() {
                cityGroup
                    .classed('globe-city--active', function (d) {
                        return d == $scope.state.selectedCity
                    });
            }
            checkClass();

            cityGroup.on('click', function(d) {
                $scope.state.selectedCity = d;
                $scope.$apply();
                checkClass();
            });
            cityGroup.on('mouseover', function(d) {
                $scope.showCitySunPath = d;
                $scope.$apply();
            });
            cityGroup.on('mouseleave', function() {
                $scope.showCitySunPath = false;
                $scope.$apply();
            });

        }
    }
});
