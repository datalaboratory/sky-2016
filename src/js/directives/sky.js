angular.module('zodiac').directive('sky', function (cityList, colors, $interval) {
    return {
        restrict: 'E',
        templateUrl: 'directives/sky.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width(),
                height = $element.height() - 40;

            $scope.player = {
                play: true,
                velocity: 600
            };

            var canvas = d3.select($element[0]).select('canvas');

            var projection = d3.geo.stereographic()
                .translate([width / 2, height])
                .scale(380);

            var fixedProjection = d3.geo.stereographic()
                .scale(380)
                .translate([width / 2, height])
                .rotate([0, 0]);

            var c = canvas.node().getContext("2d");

            function getRetinaRatio() {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = c.webkitBackingStorePixelRatio ||
                    c.mozBackingStorePixelRatio ||
                    c.msBackingStorePixelRatio ||
                    c.oBackingStorePixelRatio ||
                    c.backingStorePixelRatio || 1;

                return devicePixelRatio / backingStoreRatio
            }

            var ratio = getRetinaRatio();
            var scaledWidth = width * ratio;
            var scaledHeight = height * ratio;

            canvas.node().width = scaledWidth;
            canvas.node().height = scaledHeight;
            canvas
                .style("width", width + 'px')
                .style("height", height + 'px');

            c.scale(ratio, ratio);

            var path = d3.geo.path()
                .projection(projection)
                .context(c);
            var fixedPath = d3.geo.path()
                .projection(fixedProjection)
                .context(c);

            var graticule = d3.geo.graticule()
                .step([15, 15]);

            var bgScale = d3.scale.linear()
                .domain([0, height]);
            var lineOpacityScale = d3.scale.linear()
                .domain([10, -5])
                .range([0, 1])
                .clamp(true);

            function makeRadialGradient(geo, sunDeg) {
                var x = projection(geo.coordinates)[0];
                var y = projection(geo.coordinates)[1];
                var r  = geo.properties.mag;
                var color = geo.properties.color;
                var currentOpacity = geo.properties.currentOpacity;
                var radialGradient = c.createRadialGradient(x, y, 0, x, y, r);
                var bgRGB = d3.rgb(bgScale(y));
                var colorRGB = d3.rgb(color);
                var rgb = colorRGB.r + ',' + colorRGB.g + ',' + colorRGB.b;
                var opacity = (currentOpacity)? currentOpacity(sunDeg) : 1;
                radialGradient.addColorStop(0.2, 'rgba(' + rgb + ',' + opacity + ')');

                rgb = bgRGB.r + ',' + bgRGB.g + ',' + bgRGB.b;
                radialGradient.addColorStop(0.5,'rgba(' + rgb + ',0)');
                radialGradient.addColorStop(0.5,'rgba(' + rgb + ',' + opacity + ')');
                radialGradient.addColorStop(1,'rgba(' + rgb + ',0)');
                c.fillStyle = radialGradient
            }

            function distance(p) {
                var center = [width / 2, height / 2];
                var xRotate = center[0] - p[0];
                var yRotate = center[1] - p[1];

                return Math.sqrt(Math.pow(xRotate, 2) + Math.pow(yRotate, 2))
            }
            function drawSunPath(sunLat) {
                var sunPath = d3.range(-180, 185, 5).map(function (deg) {
                    return [deg, sunLat]
                });
                c.beginPath();
                path({type: "LineString", coordinates: sunPath});
                c.stroke();
            }
            function draw(constellations, lon) {
                var center = [lon, 90 - cityList[$scope.state.selectedCity].coordinates[1]];
                var min = 0,
                    minDistance = distance(projection(constellations[0].properties.center));

                if (center) projection.rotate(center);

                c.clearRect(0, 0, width, height);

                //сетка
                c.strokeStyle = "#fff";
                c.lineWidth = .1;
                c.beginPath();
                path(graticule());
                c.stroke();

                //экватор
                c.lineWidth = .4;
                c.beginPath();
                var equator = [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]];
                path({type: "LineString", coordinates: equator});
                c.stroke();

                //горизонт
                c.strokeStyle = "#f00";
                c.beginPath();
                fixedPath({type: "LineString", coordinates: equator});
                c.stroke();

                //эклиптика
                c.strokeStyle = colors.zodiacLine;
                c.beginPath();
                path({type: "LineString", coordinates: [[-180, 0], [-90, 23.26], [0, 0], [90, -23.26], [180, 0]]});
                c.stroke();


                var sunScale = d3.scale.linear()
                    .domain([0, 365 / 4, 365 / 2, 3 * 365 / 4, 365])
                    .range([[-180, 0], [-90, 23.26], [0, 0], [90, -23.26], [180, 0]]);

                var sunCoordinates = sunScale(90);

                var sunPx = projection(sunCoordinates);
                var horizontSunCoord = fixedProjection.invert(sunPx);
                var left = (horizontSunCoord[0] < 0) * 1;

                $scope.backgroundColors = colors.skyColorScale[left](horizontSunCoord[1]);
                bgScale.range($scope.backgroundColors);
                d3.select($element[0]).style('background',
                    '-webkit-gradient(linear, left top, left bottom, from(' +
                    $scope.backgroundColors[0] + '), to(' +
                    $scope.backgroundColors[1] + '))');
                d3.select($element[0]).style('background',
                    'gradient(linear, left top, left bottom, from(' +
                    $scope.backgroundColors[0] + '), to(' +
                    $scope.backgroundColors[1] + '))');

                //траектории Солнца
                c.strokeStyle = "#fff";
                var sunLat = sunCoordinates[1];

                c.setLineDash([5]);
                Object.keys(cityList).forEach(function(city) {
                    projection.rotate([0, 90 - cityList[city].coordinates[1]]);
                    drawSunPath(sunLat);
                });
                c.setLineDash([]);
                projection.rotate(center);

                //линии созвездий и звезды
                constellations.forEach(function drawConstellation(constellation, i) {
                    constellation.geometry.geometries.forEach(function drawStarsAndLines(geo) {
                        if (geo.type == 'Point') {
                            makeRadialGradient(geo, horizontSunCoord[1]);
                            path.pointRadius([geo.properties.mag]);
                            c.beginPath();
                            path(geo);
                            c.fill();
                        } else if (geo.type == 'MultiLineString') {
                            var color = (constellation.properties.zodiac)? colors.zodiacLine : colors.constellationLine;
                            color = d3.rgb(color);
                            c.strokeStyle = 'rgba(' + color.r +',' + color.g + ',' + color.b + ','+ lineOpacityScale(horizontSunCoord[1]) + ')';
                            c.beginPath();
                            path(geo);
                            c.stroke();
                        }
                    })
                });

                //Солнце
                c.fillStyle = colors.zodiacLine;
                var sunGeo = {
                    type: "Point",
                    coordinates: sunCoordinates,
                    properties: {
                        mag: 70,
                        color: '#fff'
                    }
                };

                path.pointRadius([70]);
                makeRadialGradient(sunGeo);
                c.beginPath();
                path(sunGeo);
                c.fill();

            }

            var currentLon = 90;
            $scope.$watch('geoConstellations', function (geoConstellations) {
                if (!geoConstellations) return;
                console.log('draw!');
                draw(geoConstellations, currentLon);
                var raStart, decStart;
                function getStart() {
                    raStart  = projection.invert(d3.mouse(this))[0];
                    decStart = fixedProjection.invert(d3.mouse(this))[1]
                }
                function move() {
                    var raFinish = projection.invert(d3.mouse(this))[0];
                    var raRotate = raFinish - raStart;

                    var rotate = projection.rotate();
                    currentLon = rotate[0] + raRotate;

                    draw(geoConstellations, currentLon);
                }
                var drag = d3.behavior.drag()
                    .on("dragstart", getStart)
                    .on("drag", move);
                canvas.call(drag);
                var naturalVelocity = 360 / 86400 / 10; //градусов в 0,1 секунду
                var player = $interval(play, 100);
                function play() {
                    if (!$scope.player.play) return;
                    currentLon += naturalVelocity * $scope.player.velocity;
                    if (currentLon > 180) currentLon -= 360;
                    draw(geoConstellations, currentLon);
                }

            });
            $scope.$watch('state', function() {
                if (!$scope.geoConstellations) return;
                draw($scope.geoConstellations, currentLon);
            }, true)
        }
    }
});