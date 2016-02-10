angular.module('zodiac').directive('globeWithCities', function (cityList) {
    return {
        restrict: 'E',
        templateUrl: 'directives/globeWithCities.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.cityList = cityList;

            var width = $element.width();
            var svg = d3.select($element[0]).select('svg');

            var globeProjection = d3.geo.orthographic()
                .translate([width / 2, width / 2])
                .scale(100)
                .rotate([-75, -30])
                .clipAngle(98);
            $scope.globeProjection = globeProjection;

            var globePath = d3.geo.path()
                .projection(globeProjection);

            var graticule = d3.geo.graticule()
                .step([15, 15]);

            $scope.globeGraticule = globePath(graticule());


        }
    }
});