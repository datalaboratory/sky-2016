zodiac.directive('sky', function (cityList, colors, $document) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/sky.html',
        replace: true,
        link: function link($scope, $element) {

            var landscapeHeight = 80;
            var width = $element.width(),
                height = $element.height() - landscapeHeight;


            var canvas = d3.select($element[0]).select('canvas');
            var offScreenCanvas = document.createElement('canvas');

            var bufferCanvas = document.createElement('canvas');

            var normalProjectionScale = 450;
            var normalProjectionTranslate = [width / 2, height];
            var normalProjectionRotate = [0, 0];

            var upProjectionScale = 700;
            var upProjectionTranslate = [width / 2, height / 2];
            var upProjectionRotate = [0, -90];

            var projection = d3.geo.stereographic()
                .clipAngle(179);

            var fixedProjection = d3.geo.stereographic();

            var c = canvas.node().getContext("2d");
            var tailCtx = offScreenCanvas.getContext('2d');
            var bufferCtx = bufferCanvas.getContext('2d');

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

            var bgScale = d3.scale.linear()
                .domain([0, height]);

            function updateWidthHeight() {
                width = $element.width();
                height = $element.height() - landscapeHeight;
                normalProjectionTranslate = [width / 2, height];
                upProjectionTranslate = [width / 2, height / 2];

                var translate = ($scope.state.viewDirection == 'horizon') ? normalProjectionTranslate : upProjectionTranslate;
                var rotate = ($scope.state.viewDirection == 'horizon') ? normalProjectionRotate : upProjectionRotate;
                var scale = ($scope.state.viewDirection == 'horizon')? normalProjectionScale : upProjectionScale;
                projection
                    .translate(translate)
                    .scale(scale);
                fixedProjection
                    .translate(translate)
                    .scale(scale)
                    .rotate(rotate);
                scaledWidth = width * ratio;
                scaledHeight = height * ratio;

                canvas.node().width = scaledWidth;
                canvas.node().height = scaledHeight;
                canvas
                    .style("width", width + 'px')
                    .style("height", height + 'px');

                offScreenCanvas.width = scaledWidth;
                offScreenCanvas.height = scaledHeight;
                bufferCanvas.width = scaledWidth;
                bufferCanvas.height = scaledHeight;

                c.scale(ratio, ratio);
                tailCtx.scale(ratio, ratio);
                bufferCtx.scale(ratio, ratio);
                bgScale
                    .domain([0, height]);
            }


            function getImage(ctx) {
                return ctx.getImageData(0, 0, scaledWidth, scaledHeight)
            }

            function clearCtx(ctx) {
                ctx.clearRect(0, 0, scaledWidth, scaledHeight)
            }

            c.scale(ratio, ratio);
            tailCtx.scale(ratio, ratio);
            bufferCtx.scale(ratio, ratio);

            updateWidthHeight();

            $(window).on('resize', function () {
                updateWidthHeight();
                draw();
            });

            var path = d3.geo.path()
                .projection(projection)
                .context(c);
            var tailPath = d3.geo.path()
                .projection(projection)
                .context(tailCtx);
            var fixedPath = d3.geo.path()
                .projection(fixedProjection)
                .context(c);

            var graticule = d3.geo.graticule()
                .step([15, 15]);
            var eclipticCoordinates = [
                [-270, -23.26],
                [-255, -22.45],
                [-240, -20.26],
                [-225, -16.9],
                [-210, -12],
                [-195, -6.2],
                [-180, 0],
                [-165, 6.2],
                [-150, 12],
                [-135, 16.9],
                [-120, 20.26],
                [-105, 22.45],
                [-90, 23.26],
                [-75, 22.45],
                [-60, 20.26],
                [-45, 16.9],
                [-30, 12],
                [-15, 6.2],
                [0, 0],
                [15, -6.2],
                [30, -12],
                [45, -16.9],
                [60, -20.26],
                [75, -22.45],
                [90, -23.26],
                [105, -22.45]
            ];
            var minEclipticCoordinates = [[-180, 0], [-90, 23.26], [0, 0], [90, -23.26], [180, 0]];

            var atmosphereOpacity = 0;
            var constellationOpacity = 0;
            var graticuleOpacity = 1;
            var eclipticOpacity = 1;

            var lineOpacityScale = d3.scale.linear()
                .domain([10, -5])
                .range([atmosphereOpacity, 1])
                .clamp(true);

            var start = -10.2;//moment(new Date((new Date()).getFullYear(), 2, 21)).dayOfYear();


            var sunScale = d3.scale.linear()
                .domain(rangeDates())
                .range(eclipticCoordinates);
            function rangeDates() {
                return d3.range(0, 26, 1).map(function(days, i) {
                    return start + i * 15.2;
                })
            }

            function generateSunTail(date) {
                var points = d3.range(0, date, 5).map(function(day) {
                    return sunScale(day);
                });
                points.push(sunScale(date));
                return points
            }

            function drawSunTail(date) {
                var points = generateSunTail(date);
                c.beginPath();
                var start = projection(points[0]);
                c.moveTo(start[0], start[1]);
                points.forEach(function(p) {
                    var point = projection(p);
                    c.lineTo(point[0], point[1] + 1)
                });
                points.reverse();
                points.forEach(function(p) {
                    var point = projection(p);
                    c.lineTo(point[0], point[1] - 1)
                });
                c.fill();
            }

            var sunCoordinates = sunScale($scope.state.currentDate);
            var sunPx = projection(sunCoordinates);
            var horizontSunCoord = fixedProjection.invert(sunPx);
            var sunTail = [];

            function rgbaFromRgb(rgb, opacity) {
                return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')'
            }

            function makeRadialGradient(geo, coordinates, sunDeg) {
                var x = coordinates[0];
                var y = coordinates[1];
                var r = geo.properties.mag;
                var currentOpacity = geo.properties.currentOpacity;
                var radialGradient = c.createRadialGradient(x, y, 0, x, y, r);
                var bgRGB = d3.rgb(bgScale(y));
                var colorRGB = d3.rgb(geo.properties.color);

                var opacity = currentOpacity(sunDeg);
                if (atmosphereOpacity > 0) {
                    var range = currentOpacity.range();
                    opacity = lineOpacityScale(sunDeg) * range[range.length - 1];
                }
                radialGradient.addColorStop(0.2, rgbaFromRgb(colorRGB, opacity));
                radialGradient.addColorStop(0.5, rgbaFromRgb(bgRGB, 0));
                radialGradient.addColorStop(0.5, rgbaFromRgb(bgRGB, opacity));
                radialGradient.addColorStop(1, rgbaFromRgb(bgRGB, 0));
                c.fillStyle = radialGradient
            }

            function makeSunGradient(geo) {
                var x = projection(geo.coordinates)[0];
                var y = projection(geo.coordinates)[1];
                var r = geo.properties.mag;
                var radialGradient = c.createRadialGradient(x, y, 0, x, y, r);
                var colorRGB = d3.rgb(geo.properties.color);

                radialGradient.addColorStop(0.4, rgbaFromRgb(colorRGB, 1));
                radialGradient.addColorStop(0.8, rgbaFromRgb(colorRGB, 0.2));
                radialGradient.addColorStop(1, rgbaFromRgb(colorRGB, 0));
                c.fillStyle = radialGradient
            }

            var backgroundDegreesCorrector = d3.scale.linear()
                .domain([0, 1])
                .range([0, 90])
                .clamp(true);

            function drawSkyBackground() {
                var left = (horizontSunCoord[0] < 0) * 1;

                left = (currentReverse) ? Math.abs(left - 1) : left;
                var degrees = horizontSunCoord[1] - backgroundDegreesCorrector(atmosphereOpacity);

                $scope.backgroundColors = colors.skyColorScale[left](degrees);
                bgScale.range($scope.backgroundColors);
                d3.select($element[0]).style('background',
                    '-webkit-gradient(linear, left top, left bottom, from(' +
                    $scope.backgroundColors[0] + '), to(' +
                    $scope.backgroundColors[1] + '))');
                d3.select($element[0]).style('background',
                    'gradient(linear, left top, left bottom, from(' +
                    $scope.backgroundColors[0] + '), to(' +
                    $scope.backgroundColors[1] + '))');
            }

            function updateSunCoordinates() {
                sunCoordinates = sunScale(moment($scope.state.currentDate).dayOfYear() + $scope.state.currentDate.getHours() / 24);
                //sunTail = generateSunTail(moment($scope.state.currentDate).dayOfYear());
                sunPx = projection(sunCoordinates);
                horizontSunCoord =  fixedProjection.invert(sunPx);
            }

            function drawSunPath(sunLat) {
                var sunPath = d3.range(-180, 185, 5).map(function (deg) {
                    return [deg, sunLat]
                });
                c.beginPath();
                path({type: "LineString", coordinates: sunPath});
                c.stroke();
            }

            $scope.showCitySunPath = false;

            function draw() {
                var center = [currentLon, currentLat, currentReverse];
                var constellations = $scope.geoConstellations;
                projection.rotate(center);
                c.clearRect(0, 0, width, height);
                updateSunCoordinates();

                //сетка + экватор
                c.strokeStyle = rgbaFromRgb(d3.rgb("#fff"), graticuleOpacity);
                c.lineWidth = .1;
                c.beginPath();
                path(graticule());
                c.stroke();

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
                c.strokeStyle = rgbaFromRgb(colors.ecliptic, eclipticOpacity);
                c.beginPath();
                path({type: "LineString", coordinates: eclipticCoordinates});
                c.stroke();

                c.fillStyle = rgbaFromRgb(d3.rgb("#fff"), eclipticOpacity);
                /*c.beginPath();
                path({type: "LineString", coordinates: sunTail});
                c.stroke();*/
                drawSunTail(moment($scope.state.currentDate).dayOfYear());
                drawSkyBackground();

                //траектории Солнца
                c.strokeStyle = "#fff";
                var sunLat = sunCoordinates[1];

                c.setLineDash([5]);

                if ($scope.showCitySunPath) {
                    Object.keys(cityList).forEach(function (city) {
                        c.strokeStyle = "#fff";
                        if (city == $scope.showCitySunPath) c.strokeStyle = colors.ecliptic;
                        projection.rotate([0, getCurrentLat(city), getReverse(city)]);
                        drawSunPath(sunLat);
                    })
                } else {
                    drawSunPath(sunLat);
                }
                c.setLineDash([]);
                projection.rotate(center);

                //линии созвездий и звезды
                constellations.forEach(function drawConstellation(constellation) {
                    constellation.geometry.geometries.forEach(function drawStarsAndLines(geo) {
                        if (geo.type == 'Point') {
                            if ($scope.state.atmosphere && Math.random() < 0.005) return;
                            var coordinates = projection(geo.coordinates);
                            if (coordinates[0] < 0 || coordinates[0] > width || coordinates[1] < 0 ||coordinates[1] > height) return;
                            makeRadialGradient(geo, coordinates, horizontSunCoord[1]);
                            path.pointRadius([geo.properties.mag]);
                            c.beginPath();
                            path(geo);
                            c.fill();
                            if ($scope.player.tails) {
                                tailCtx.fillStyle = geo.properties.color;
                                tailPath.pointRadius([geo.properties.mag / 3]);
                                tailCtx.beginPath();
                                tailPath(geo);
                                tailCtx.fill();
                            }
                        } else if (geo.type == 'MultiLineString') {
                            var opacity = lineOpacityScale(horizontSunCoord[1]) * constellationOpacity;
                            var color = colors.zodiacLine;
                            c.strokeStyle = rgbaFromRgb(color, opacity);
                            c.beginPath();
                            path(geo);
                            c.stroke();

                            color = colors.zodiacText;
                            c.textAlign = "center";
                            c.font = "italic lighter 14px Times New Roman";
                            c.fillStyle = rgbaFromRgb(color, opacity);
                            var projectedCenter = projection(geo.properties.center);
                            c.fillText(geo.properties.name, projectedCenter[0], projectedCenter[1])
                        }
                    })
                });
                if ($scope.player.tails) {
                    c.scale(1 / ratio, 1 / ratio);
                    var starsLayer = getImage(c);
                    c.clearRect(0, 0, scaledWidth, scaledHeight);
                    c.drawImage(offScreenCanvas, 0, 0);

                    bufferCtx.putImageData(starsLayer, 0, 0);
                    c.drawImage(bufferCanvas, 0, 0);
                    c.scale(ratio, ratio);
                }

                var sunGeo = {
                    type: "Point",
                    coordinates: sunCoordinates,
                    properties: {
                        mag: 35,
                        color: '#fff'
                    }
                };

                path.pointRadius([35]);
                makeSunGradient(sunGeo);
                c.beginPath();
                path(sunGeo);
                c.fill();
            }


            var lonHourScale = d3.scale.linear()
                .domain([0, 24 * 3600])
                .range([-90, 270]);

            function getSecondsFromStartDay(date) {
                return date.getHours() * 3600 +
                    date.getMinutes() * 60 +
                    date.getSeconds()
            }
            function getCurrentLat(city) {
                var lat = cityList[city].coordinates[1];
                var direction = $scope.state.viewDirection;
                if (direction == 'horizon') {
                    return (cityList[city].reverse)? 270 - lat : 90 - lat;
                } else if (direction == 'up') {
                    return -lat;
                }


            }

            function getReverse(city) {
                return (cityList[city].reverse)? 180 : 0;
            }
            var currentLon = lonHourScale(getSecondsFromStartDay($scope.state.currentDate));
            var currentLat = getCurrentLat($scope.state.selectedCity);
            var currentReverse = getReverse($scope.state.selectedCity);

            $scope.$watch('geoConstellations', function (geoConstellations) {
                if (!geoConstellations) return;
                console.log('draw!');
                draw();

                var raStart, decStart;

                function getStart() {
                    raStart = projection.invert(d3.mouse(this))[0];
                    decStart = fixedProjection.invert(d3.mouse(this))[1];
                    console.log(projection.invert(d3.mouse(this)))
                }

                function move() {
                    var raFinish = projection.invert(d3.mouse(this))[0];
                    var raRotate = raFinish - raStart;

                    var rotate = projection.rotate();
                    currentLon = rotate[0] + raRotate;

                    draw();
                }

                var drag = d3.behavior.drag()
                    .on("dragstart", getStart)
                    .on("drag", move);
                canvas.call(drag);
                var naturalVelocity = 360 / 86400; //градусов в секунду
                playRaf();
                var frameDuration = 100;
                var frames = 0;

                function playRaf() {
                    frames++;
                    play();
                    window.requestAnimationFrame(function () {
                        playRaf();
                        $scope.$apply();
                    });
                }

                function play() {
                    if (!$scope.player.play) return;
                    $scope.state.currentDate = moment($scope.state.currentDate).add($scope.player.velocity / (1000 / frameDuration), 's').toDate();
                    currentLon = lonHourScale(getSecondsFromStartDay($scope.state.currentDate));
                    draw();
                }

                setInterval(function () {
                    var fps = frames / 10 + ' fps';
                    console.log(fps);
                    frames = 0
                }, 10000)
            });
            $scope.$watch('state.selectedCity', function (city) {
                if (!$scope.geoConstellations) return;
                var newLat = getCurrentLat(city);
                currentReverse = getReverse(city);
                d3.transition('city')
                    .duration(1250)
                    .tween("rotate", function () {
                        var r = d3.interpolate(currentLat, newLat);
                        return function (t) {
                            currentLat = r(t);
                            clearCtx(tailCtx);
                            draw();
                        }
                    });

            }, true);
            $scope.$watch('player.tails', function () {
                if (!$scope.geoConstellations) return;
                clearCtx(tailCtx);
                draw();
            });
            $scope.$watch('state.atmosphere', function (atmosphere) {
                if (!$scope.geoConstellations) return;
                d3.transition('atmosphere')
                    .duration(1250)
                    .tween("rotate", function () {
                        var newOpacity = (atmosphere) ? 0 : 1;
                        var r = d3.interpolate(atmosphereOpacity, newOpacity);
                        return function (t) {
                            atmosphereOpacity = r(t);
                            lineOpacityScale
                                .range([atmosphereOpacity, 1]);
                            draw();
                        }
                    })
            });
            $scope.$watch('state.constellations', function (constellations) {
                if (!$scope.geoConstellations) return;
                d3.transition('constellations')
                    .duration(1250)
                    .tween("rotate", function () {
                        var newOpacity = (constellations) ? 1 : 0;
                        var r = d3.interpolate(constellationOpacity, newOpacity);
                        return function (t) {
                            constellationOpacity = r(t);
                            draw();
                        }
                    })
            });
            $scope.$watch('state.graticule', function (graticule) {
                if (!$scope.geoConstellations) return;
                d3.transition('graticule')
                    .duration(1250)
                    .tween("rotate", function () {
                        var newOpacity = (graticule) ? 1 : 0;
                        var r = d3.interpolate(graticuleOpacity, newOpacity);
                        return function (t) {
                            graticuleOpacity = r(t);
                            draw();
                        }
                    })
            });
            $scope.$watch('state.ecliptic', function (graticule) {
                if (!$scope.geoConstellations) return;
                d3.transition('ecliptic')
                    .duration(1250)
                    .tween("rotate", function () {
                        var newOpacity = (graticule) ? 1 : 0;
                        var r = d3.interpolate(eclipticOpacity, newOpacity);
                        return function (t) {
                            eclipticOpacity = r(t);
                            draw();
                        }
                    })
            });
            $scope.$watch('state.currentDate', function() {
                if ($scope.player.play) return;
                currentLon = lonHourScale(getSecondsFromStartDay($scope.state.currentDate));
                draw();
            });
            $scope.$watch('showCitySunPath', function() {
                if (!$scope.geoConstellations) return;
                draw();
            });
            $scope.$watch('state.viewDirection', function(direction) {
                if (!$scope.geoConstellations) return;
                if (direction == 'horizon') {
                    var newTranslate = normalProjectionTranslate;
                    var newScale = normalProjectionScale;
                    var newRotate = normalProjectionRotate;
                } else {
                    newTranslate = upProjectionTranslate;
                    newScale = upProjectionScale;
                    newRotate = upProjectionRotate;
                }
                d3.transition('viewDirection')
                    .duration(1250)
                    .tween("rotate", function () {
                        var translate = d3.interpolate(projection.translate(), newTranslate);
                        var scale = d3.interpolate(projection.scale(), newScale);
                        var rotate = d3.interpolate(fixedProjection.rotate(), newRotate);
                        var newLat = getCurrentLat($scope.state.selectedCity);
                        if (currentLat > 180) currentLat -= 360;
                        if (newLat > 180) newLat -= 360;
                        var lat = d3.interpolate(currentLat, newLat);
                        console.log(currentLat, newLat);

                        return function (t) {
                            var tr = translate(t);
                            var s = scale(t);
                            projection
                                .translate(tr)
                                .scale(s);
                            fixedProjection
                                .translate(tr)
                                .scale(s)
                                .rotate(rotate(t));
                            currentLat = lat(t);
                            draw();
                        }
                    });
            });
            var angle = 0;
            var delta = 0.5;
            function scroll(e) {
                if (e.originalEvent.wheelDelta > 0 && angle < 90) {
                    angle += delta
                } else if (e.originalEvent.wheelDelta < 0 && angle > 0) {
                    angle -= delta;
                };
                currentLat = getCurrentLat($scope.state.selectedCity) - angle;
                draw()
            }

            $document.on('mousewheel', _.throttle(scroll, 30))
        }
    }
});
