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

            var ctx = canvas.node().getContext("2d");
            var tailCtx = offScreenCanvas.getContext('2d');
            var bufferCtx = bufferCanvas.getContext('2d');

            function getRetinaRatio() {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio || 1;

                return devicePixelRatio / backingStoreRatio
            }

            var ratio = getRetinaRatio();
            var scaledWidth = width * ratio;
            var scaledHeight = height * ratio;

            var bgScale = d3.scale.linear()
                .domain([0, $element.height()]);

            function updateWidthHeight() {
                width = $element.width();
                height = $element.height() - landscapeHeight;
                normalProjectionTranslate = [width / 2, height];
                upProjectionTranslate = [width / 2, height / 2];

                var translate = ($scope.state.viewDirection == 'horizon') ? normalProjectionTranslate : upProjectionTranslate;
                var rotate = ($scope.state.viewDirection == 'horizon') ? normalProjectionRotate : upProjectionRotate;
                var scale = ($scope.state.viewDirection == 'horizon') ? normalProjectionScale : upProjectionScale;
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

                ctx.scale(ratio, ratio);
                tailCtx.scale(ratio, ratio);
                bufferCtx.scale(ratio, ratio);
                bgScale
                    .domain([0, $element.height()]);
            }


            function getImage(ctx) {
                return ctx.getImageData(0, 0, scaledWidth, scaledHeight)
            }

            function clearCtx(ctx) {
                ctx.clearRect(0, 0, scaledWidth, scaledHeight)
            }

            ctx.scale(ratio, ratio);
            tailCtx.scale(ratio, ratio);
            bufferCtx.scale(ratio, ratio);

            updateWidthHeight();

            $(window).on('resize', function () {
                updateWidthHeight();
                draw();
            });

            var path = d3.geo.path()
                .projection(projection)
                .context(ctx);
            var tailPath = d3.geo.path()
                .projection(projection)
                .context(tailCtx);
            var fixedPath = d3.geo.path()
                .projection(fixedProjection)
                .context(ctx);

            var graticule = d3.geo.graticule()
                .step([15, 15]);
            var eclipticCoordinates = [
                [90, -23.26],
                [75, -22.45],
                [60, -20.26],
                [45, -16.9],
                [30, -12],
                [15, -6.2],
                [0, 0],
                [-15, 6.2],
                [-30, 12],
                [-45, 16.9],
                [-60, 20.26],
                [-75, 22.45],
                [-90, 23.26],
                [-105, 22.45],
                [-120, 20.26],
                [-135, 16.9],
                [-150, 12],
                [-165, 6.2],
                [-180, 0],
                [-195, -6.2],
                [-210, -12],
                [-225, -16.9],
                [-240, -20.26],
                [-255, -22.45],
                [-270, -23.26],
                [-285, -22.45]
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
                return d3.range(0, 26).map(function (days, i) {
                    return start + i * 15.2;
                })
            }

            var sunCoordinates = sunScale($scope.state.currentDate);
            var sunPx = projection(sunCoordinates);
            var horizontSunCoord = fixedProjection.invert(sunPx);

            function rgbaFromRgb(rgb, opacity) {
                return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')'
            }

            function makeRadialGradient(geo, coordinates, sunDeg) {
                var x = coordinates[0];
                var y = coordinates[1];
                var r = geo.properties.mag;
                var currentOpacity = geo.properties.currentOpacity;
                var radialGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
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
                ctx.fillStyle = radialGradient
            }

            function makeSunGradient(geo) {
                var x = projection(geo.coordinates)[0];
                var y = projection(geo.coordinates)[1];
                var r = geo.properties.mag;
                var radialGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                var colorRGB = d3.rgb(geo.properties.color);

                radialGradient.addColorStop(0.4, rgbaFromRgb(colorRGB, 1));
                radialGradient.addColorStop(0.8, rgbaFromRgb(colorRGB, 0.2));
                radialGradient.addColorStop(1, rgbaFromRgb(colorRGB, 0));
                ctx.fillStyle = radialGradient;
            }

            function makeSunBackgroundGradient(r, sunCenter) {
                var top = sunCenter[1] - r;
                var bottom = sunCenter[1] + r;
                var linearGradient = ctx.createLinearGradient(0, bottom, 0, top);
                linearGradient.addColorStop(0.0, rgbaFromRgb(d3.rgb(bgScale(bottom)), 1));
                linearGradient.addColorStop(1, rgbaFromRgb(d3.rgb(bgScale(top)), 1));
                ctx.fillStyle = linearGradient;
            }

            var startYearCoordinates = sunScale(0);

            function makeEclipticGradient() {
                var startYearPx = projection(startYearCoordinates);
                var linearGradient = ctx.createLinearGradient(sunPx[0], sunPx[1], startYearPx[0], startYearPx[1]);
                linearGradient.addColorStop(0.0, rgbaFromRgb(d3.rgb("#fff"), 0));
                linearGradient.addColorStop(0.3, rgbaFromRgb(d3.rgb("#f00"), 1));
                linearGradient.addColorStop(0.8, rgbaFromRgb(d3.rgb("#fff"), 1));
                linearGradient.addColorStop(1, rgbaFromRgb(d3.rgb("#fff"), 0));
                ctx.strokeStyle = linearGradient;
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
                sunPx = projection(sunCoordinates);
                horizontSunCoord = fixedProjection.invert(sunPx);
            }

            function drawSunPath() {
                var lat = sunCoordinates[1];
                var sunPath = d3.range(-180, 185, 5).map(function (deg) {
                    return [deg, lat]
                });
                ctx.beginPath();
                path({type: "LineString", coordinates: sunPath});
                ctx.stroke();
            }

            function drawSunTrajectory(center) {
                var r = 15;
                if ($scope.showCitySunPath) {
                    Object.keys(cityList).forEach(function (city) {
                        ctx.strokeStyle = "#fff";
                        if (city == $scope.showCitySunPath) {
                            ctx.strokeStyle = colors.ecliptic;
                        }
                        projection.rotate([currentLon, getCurrentLat(city), getReverse(city)]);
                        ctx.setLineDash([5]);
                        drawSunPath();
                        ctx.setLineDash([]);

                        var sunCenter = projection(sunCoordinates);
                        ctx.beginPath();
                        ctx.moveTo(sunCenter[0] + r, sunCenter[1]);
                        ctx.arc(sunCenter[0], sunCenter[1], r, 0, 2 * Math.PI);
                        ctx.stroke();
                        makeSunBackgroundGradient(r, sunCenter);
                        ctx.fill();

                    });
                    Object.keys(cityList).forEach(function (city) {
                        ctx.fillStyle = "#fff";
                        if (city == $scope.showCitySunPath) {
                            ctx.fillStyle = colors.ecliptic;
                        }
                        projection.rotate([currentLon, getCurrentLat(city), getReverse(city)]);
                        var sunCenter = projection(sunCoordinates);
                        _.assign(ctx, {
                            textAlign: "left",
                            font: "italic lighter 14px Times New Roman"
                        });
                        ctx.fillText(cityList[city].name, sunCenter[0] + r + 5, sunCenter[1])
                    })
                } else {
                    ctx.strokeStyle = "#fff";
                    ctx.setLineDash([5]);
                    drawSunPath();
                    ctx.setLineDash([0]);
                }
                ctx.setLineDash([]);
                projection.rotate(center);
            }

            $scope.showCitySunPath = false;


            function draw() {
                var center = [currentLon, currentLat, currentReverse];
                var constellations = $scope.geoConstellations;
                projection.rotate(center);
                ctx.clearRect(0, 0, width, height);

                updateSunCoordinates();
                var sunGeo = {
                    type: "Point",
                    coordinates: sunCoordinates,
                    properties: {
                        mag: 35,
                        color: '#fff'
                    }
                };
                drawSkyBackground();
                drawSunTrajectory(center);
                //сетка + экватор
                ctx.strokeStyle = rgbaFromRgb(d3.rgb("#fff"), graticuleOpacity);
                ctx.lineWidth = .1;
                ctx.beginPath();
                path(graticule());
                ctx.stroke();

                ctx.lineWidth = .4;
                ctx.beginPath();
                var equator = [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]];
                path({type: "LineString", coordinates: equator});
                ctx.stroke();

                //горизонт
                ctx.strokeStyle = "#f00";
                ctx.beginPath();
                fixedPath({type: "LineString", coordinates: equator});
                ctx.stroke();

                //эклиптика
                ctx.strokeStyle = rgbaFromRgb(colors.ecliptic, eclipticOpacity);
                makeEclipticGradient();
                ctx.beginPath();

                var ec = [sunCoordinates].concat(eclipticCoordinates.filter(function (coord) {
                    return coord[0] > sunCoordinates[0]
                }));
                path({type: "LineString", coordinates: eclipticCoordinates});
                ctx.stroke();

                ctx.fillStyle = rgbaFromRgb(d3.rgb("#fff"), eclipticOpacity);


                //линии созвездий и звезды
                constellations.forEach(function drawConstellation(constellation) {
                    constellation.geometry.geometries.forEach(function drawStarsAndLines(geo) {
                        if (geo.type == 'Point') {
                            if ($scope.state.atmosphere && Math.random() < 0.005) return;
                            var coordinates = projection(geo.coordinates);
                            if (coordinates[0] < 0 || coordinates[0] > width || coordinates[1] < 0 || coordinates[1] > height) return;
                            makeRadialGradient(geo, coordinates, horizontSunCoord[1]);
                            path.pointRadius([geo.properties.mag]);
                            ctx.beginPath();
                            path(geo);
                            ctx.fill();
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
                            ctx.strokeStyle = rgbaFromRgb(color, opacity);
                            ctx.beginPath();
                            path(geo);
                            ctx.stroke();

                            color = colors.zodiacText;
                            _.assign(ctx, {
                                textAlign: "center",
                                font: "italic lighter 14px Times New Roman",
                                fillStyle: rgbaFromRgb(color, opacity)
                            });
                            var projectedCenter = projection(geo.properties.center);
                            ctx.fillText(geo.properties.name, projectedCenter[0], projectedCenter[1])
                        }
                    })
                });
                if ($scope.player.tails) {
                    ctx.scale(1 / ratio, 1 / ratio);
                    var starsLayer = getImage(ctx);
                    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
                    ctx.drawImage(offScreenCanvas, 0, 0);

                    bufferCtx.putImageData(starsLayer, 0, 0);
                    ctx.drawImage(bufferCanvas, 0, 0);
                    ctx.scale(ratio, ratio);
                }

                path.pointRadius([35]);
                makeSunGradient(sunGeo);
                ctx.beginPath();
                path(sunGeo);
                ctx.fill();
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
                    return (cityList[city].reverse) ? 270 - lat : 90 - lat;
                } else if (direction == 'up') {
                    return -lat;
                }


            }

            function getReverse(city) {
                return (cityList[city].reverse) ? 180 : 0;
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
            $scope.$watch('state.currentDate', function () {
                if ($scope.player.play) return;
                currentLon = lonHourScale(getSecondsFromStartDay($scope.state.currentDate));
                draw();
            });
            $scope.$watch('showCitySunPath', function () {
                if (!$scope.geoConstellations) return;
                draw();
            });
            $scope.$watch('state.viewDirection', function (direction) {
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
                }
                currentLat = getCurrentLat($scope.state.selectedCity) - angle;
                draw()
            }

            //$document.on('mousewheel', _.throttle(scroll, 30))
        }
    }
});
