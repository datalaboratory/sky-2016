angular.module('zodiac').directive('sky', function (cityList, colors) {
    return {
        restrict: 'E',
        templateUrl: 'directives/sky.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width(),
                height = $element.height() - 80;

            $scope.player = {
                play: true,
                velocity: 600
            };

            var canvas = d3.select($element[0]).select('canvas');

            var projection = d3.geo.stereographic()
                .translate([width / 2, height])
                .clipAngle(179)
                .scale(328);

            var fixedProjection = d3.geo.stereographic()
                .scale(328)
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

            var svgPath = d3.geo.path()
                .projection(projection);

            var fixedPath = d3.geo.path()
                .projection(fixedProjection)
                .context(c);

            var svgFixedPath = d3.geo.path()
                .projection(fixedProjection);

            var graticule = d3.geo.graticule()
                .step([15, 15]);

            var bgScale = d3.scale.linear()
                .domain([0, height]);
            var lineOpacityScale = d3.scale.linear()
                .domain([10, -5])
                .range([0, 1])
                .clamp(true);
            var sunScale = d3.time.scale()
                .domain([
                    new Date(2015, 2, 22),
                    new Date(2015, 5, 22),
                    new Date(2015, 8, 22),
                    new Date(2015, 11, 22),
                    new Date(2015, 2, 22)
                ])
                .range([[-180, 0], [-90, 23.26], [0, 0], [90, -23.26], [180, 0]]);
            var sunCoordinates = sunScale($scope.state.currentDate);
            var sunPx = projection(sunCoordinates);
            function rgbaFromRgb(rgb, opacity) {
                return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')'
            }
            function makeRadialGradient(geo, sunDeg) {
                var x = projection(geo.coordinates)[0];
                var y = projection(geo.coordinates)[1];
                var r  = geo.properties.mag;
                var currentOpacity = geo.properties.currentOpacity;
                var radialGradient = c.createRadialGradient(x, y, 0, x, y, r);
                var bgRGB = d3.rgb(bgScale(y));
                var colorRGB = d3.rgb(geo.properties.color);

                var opacity = (currentOpacity)? currentOpacity(sunDeg) : 1;
                radialGradient.addColorStop(0.2, rgbaFromRgb(colorRGB, opacity));
                radialGradient.addColorStop(0.5, rgbaFromRgb(bgRGB, 0));
                radialGradient.addColorStop(0.5, rgbaFromRgb(bgRGB, opacity));
                radialGradient.addColorStop(1,   rgbaFromRgb(bgRGB, 0));
                c.fillStyle = radialGradient
            }


            function drawSunPath(sunLat) {
                var sunPath = d3.range(-180, 185, 5).map(function (deg) {
                    return [deg, sunLat]
                });
                c.beginPath();
                path({type: "LineString", coordinates: sunPath});
                c.stroke();
            }
            function draw(constellations, center) {
                if (center) projection.rotate(center);

                c.clearRect(0, 0, width, height);

                //экватор
                c.lineWidth = .4;
                //c.beginPath();*/
                var equator = [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]];
                /*path({type: "LineString", coordinates: equator});
                c.stroke();*/

                //горизонт
                c.strokeStyle = "#f00";
                c.beginPath();
                fixedPath({type: "LineString", coordinates: equator});
                c.stroke();

                //эклиптика
                c.strokeStyle = colors.ecliptic;
                c.beginPath();
                path({type: "LineString", coordinates: [[-180, 0], [-90, 23.26], [0, 0], [90, -23.26], [180, 0]]});
                c.stroke();

                sunCoordinates = sunScale($scope.state.currentDate);

                sunPx = projection(sunCoordinates);
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


                //линии созвездий и звезды
                constellations.forEach(function drawConstellation(constellation) {
                    constellation.geometry.geometries.forEach(function drawStarsAndLines(geo) {
                        if (geo.type == 'Point') {
                            if (Math.random() < 0.005) return;
                            makeRadialGradient(geo, horizontSunCoord[1]);
                            path.pointRadius([geo.properties.mag]);
                            c.beginPath();
                            path(geo);
                            c.fill();
                        } else if (geo.type == 'MultiLineString') {
                            var color = d3.rgb(colors.zodiacLine);
                            var opacity = lineOpacityScale(horizontSunCoord[1]);
                            c.strokeStyle = rgbaFromRgb(color, opacity);
                            c.beginPath();
                            path(geo);
                            c.stroke();

                            color = d3.rgb(colors.zodiacText);
                            c.textAlign = "center";
                            c.font = "italic lighter 14px Times New Roman";
                            c.fillStyle = rgbaFromRgb(color, opacity);
                            var projectedCenter = projection(geo.properties.center);
                            c.fillText(geo.properties.name, projectedCenter[0], projectedCenter[1])
                        }
                    })
                });

            }

            var backgroundLayerSvg = d3.select($element[0]).select('.sky__background-layer-svg');
            var topLayerSvg = d3.select($element[0]).select('.sky__top-layer-svg');


            function initSvg() {
                var equator = [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]];

                backgroundLayerSvg.append('path')
                    .attr('d', function() {
                        return svgPath(graticule())
                    })
                    .attr('class', 'graticule');
                var sunPath = d3.range(-180, 185, 5).map(function (deg) {
                    return [deg, sunCoordinates[1]]
                });
                topLayerSvg.selectAll('path')
                    .data(Object.keys(cityList))
                    .enter()
                    .append('path')
                    .attr('d', function(d) {
                        projection.rotate([0, 90 - cityList[d].coordinates[1]]);
                        return svgPath({type: "LineString", coordinates: sunPath});
                    })
                    .attr('class', 'sun-path');

                topLayerSvg.append('circle')
                    .attr('cx', sunPx[0])
                    .attr('cy', sunPx[1])
                    .attr('r', 35)
                    .attr('fill', 'url(#sunGradient)')
            }

            function updateGraticule() {
                backgroundLayerSvg.select('.graticule')
                    .attr('d', function() {
                        return svgPath(graticule())
                    });
            }
            function updateSunPath() {
                var sunPath = d3.range(-180, 185, 5).map(function (deg) {
                    return [deg, sunCoordinates[1]]
                });
                topLayerSvg.selectAll('.sun-path')
                    .attr('d', function(d) {
                        projection.rotate([0, 90 - cityList[d].coordinates[1]]);
                        return svgPath({type: "LineString", coordinates: sunPath});
                    })
            }
            function updateSunPosition() {
                topLayerSvg.select('circle')
                    .attr('cx', sunPx[0])
                    .attr('cy', sunPx[1])
            }

            var currentLon = 90;
            var currentLat = 90 - cityList[$scope.state.selectedCity].coordinates[1];
            $scope.$watch('geoConstellations', function (geoConstellations) {
                if (!geoConstellations) return;
                console.log('draw!');
                initSvg();
                draw(geoConstellations, [currentLon, currentLat]);
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

                    draw(geoConstellations, [currentLon, currentLat]);
                }
                var drag = d3.behavior.drag()
                    .on("dragstart", getStart)
                    .on("drag", move);
                canvas.call(drag);
                var naturalVelocity = 360 / 86400 / 10; //градусов в 0,1 секунду
                playRaf();
                function playRaf () {
                    play();
                    window.requestAnimationFrame(playRaf);
                }
                function play() {
                    if (!$scope.player.play) return;
                    currentLon += naturalVelocity * $scope.player.velocity;
                    if (currentLon > 180) currentLon -= 360;
                    draw(geoConstellations, [currentLon, currentLat]);
                    updateGraticule();
                    updateSunPosition();
                }

            });
            $scope.$watch('state.selectedCity', function() {
                if (!$scope.geoConstellations) return;
                var newLat = 90 - cityList[$scope.state.selectedCity].coordinates[1];
                d3.transition()
                    .duration(1250)
                    .tween("rotate", function () {
                        var r = d3.interpolate(currentLat, newLat);
                        return function (t) {
                            currentLat = r(t);
                            draw($scope.geoConstellations, [currentLon, currentLat]);
                        }
                    });
            }, true);
            $scope.$watch('state.currentDate', function() {
                if (!$scope.geoConstellations) return;
                draw($scope.geoConstellations, [currentLon, currentLat]);
                updateSunPath();
            })
        }
    }
});