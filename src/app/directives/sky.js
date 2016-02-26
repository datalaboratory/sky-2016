zodiac.directive('sky', function (cityList, brightStarsList, colors, $document) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/sky.html',
        replace: true,
        link: function link($scope, $element) {

            var landscapeHeight = 60;
            var width = $element.width(),
                height = $element.height() - landscapeHeight;

            var sunImgWidth = 150;
            var sunImg = d3.select($element[0]).select('.sky__sun')
                .attr('width', sunImgWidth)
                .attr('height', sunImgWidth);


            var canvas = d3.select($element[0]).select('canvas');
            var offScreenCanvas = document.createElement('canvas');

            var bufferCanvas = document.createElement('canvas');

            var normalProjectionScale = 700;
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

            function updateWidthHeight(height, translate, rotate, scale) {
                width = $element.width();
                normalProjectionTranslate = [width / 2, height];
                upProjectionTranslate = [width / 2, height / 2];

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
                equatorTextPosition = fixedProjection([0, currentLat])
            }
            $scope.state.scale = {
                horizon: 450,
                up: 700
            };

            /*$scope.$watch('state.scale', function(scale) {
                normalProjectionScale = scale.horizon;
                upProjectionScale = scale.up;
                updateWidthHeight(height - landscapeHeight);
                draw();
            }, true);*/


            function getImage(ctx) {
                return ctx.getImageData(0, 0, scaledWidth, scaledHeight)
            }

            function clearCtx(ctx) {
                ctx.clearRect(0, 0, scaledWidth, scaledHeight)
            }

            ctx.scale(ratio, ratio);
            tailCtx.scale(ratio, ratio);
            bufferCtx.scale(ratio, ratio);

            updateWidthHeight(height, normalProjectionTranslate, normalProjectionRotate, normalProjectionScale);

            $(window).on('resize', function () {
                if ($scope.state.viewDirection == 'horizon') {
                    height = $element.height() - landscapeHeight;
                    updateWidthHeight(height, normalProjectionTranslate, normalProjectionRotate, normalProjectionScale);
                    console.log(height, normalProjectionTranslate, normalProjectionRotate, normalProjectionScale, 'from resize')
                } else {
                    height = $element.height();
                    updateWidthHeight(height, upProjectionTranslate, upProjectionRotate, upProjectionScale);
                }
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
                .minorStep([15, 15])
                .minorExtent([[-180, -75.0001], [180, 75.0001]])
                .majorStep([45, 360])
                .majorExtent([[-180, -90], [180, 90]]);
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

            var atmosphereTransparency = (!$scope.state.atmosphere) * 1;
            var constellationOpacity = $scope.state.constellations * 1;
            var currentConstellationOpacity = $scope.state.currentConstellation * 1;
            var graticuleOpacity = $scope.state.graticule * 1;
            var eclipticOpacity = $scope.state.ecliptic * 1;
            var starNamesOpacity = $scope.state.starNames * 1;
            var sunTrajectoryOpacity = $scope.state.sunTrajectory * 1;

            var lineOpacityScale = d3.scale.linear()
                .domain([5, -5])
                .range([atmosphereTransparency, 1])
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
                if (atmosphereTransparency > 0) {
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

            var sunTailDayLength = 20;
            var startYearSunPosition = sunScale(0);
            var startTailSunPosition = sunScale(sunTailDayLength);
            var tailCoordinates = [startTailSunPosition, startYearSunPosition];

            function makeEclipticGradient(startTailCoordinates) {
                var endTailPx = projection(startYearSunPosition);
                var startTailPx = projection(startTailCoordinates);
                var color = d3.rgb('#fff');
                var linearGradient = ctx.createLinearGradient(startTailPx[0], startTailPx[1], endTailPx[0], endTailPx[1]);
                linearGradient.addColorStop(0.0, rgbaFromRgb(color, eclipticOpacity));
                linearGradient.addColorStop(0.2, rgbaFromRgb(color, eclipticOpacity));
                linearGradient.addColorStop(1, rgbaFromRgb(color, 0));
                ctx.strokeStyle = linearGradient;
            }

            var backgroundDegreesCorrector = d3.scale.linear()
                .domain([0, 1])
                .range([0, 90])
                .clamp(true);

            function generateCssGradient(colors) {
                if (!colors) return;
                var step = 100 / (colors.length - 1);
                return 'linear-gradient(top,' + colors.map(function(color, i) {
                        return color + ' ' + step * i + '%'
                    }).join(',') + ')'
            }
            function drawSkyBackground() {
                var left = (horizontSunCoord[0] < 0) * 1;

                left = (currentReverse) ? Math.abs(left - 1) : left;
                var degrees = horizontSunCoord[1] - backgroundDegreesCorrector(atmosphereTransparency);

                $scope.backgroundColors = colors.skyColorScale[left](degrees);

                bgScale.range($scope.backgroundColors);
                var gradient = generateCssGradient($scope.backgroundColors);
                d3.select($element[0]).style('background',
                    '-webkit-' + gradient);
                d3.select($element[0]).style('background',
                    '-moz-' + gradient);
            }

            function updateSunCoordinates() {
                sunCoordinates = sunScale(moment($scope.state.currentDate).dayOfYear() + $scope.state.currentDate.getHours() / 24);
                sunPx = projection(sunCoordinates);
                sunImg.style({
                    top: sunPx[1] - sunImgWidth / 2 + 'px',
                    left: sunPx[0] - sunImgWidth / 2 + 'px'
                });
                horizontSunCoord = fixedProjection.invert(sunPx);
                $scope.state.sunRiseDegrees = horizontSunCoord[1];
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
                        //ctx.setLineDash([5]);
                        ctx.lineWidth = 0.4;
                        drawSunPath();
                        //ctx.setLineDash([]);

                        var sunCenter = projection(sunCoordinates);
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(sunCenter[0] + r, sunCenter[1]);
                        ctx.arc(sunCenter[0], sunCenter[1], r, 0, 2 * Math.PI);
                        ctx.stroke();
                        makeSunBackgroundGradient(r, sunCenter);
                        ctx.fill();

                    });
                    Object.keys(cityList).forEach(function (city) {
                        ctx.fillStyle = rgbaFromRgb(d3.rgb("#fff"), 0.4);
                        if (city == $scope.showCitySunPath) {
                            ctx.fillStyle = rgbaFromRgb(colors.ecliptic, 0.4);
                        }
                        projection.rotate([currentLon, getCurrentLat(city), getReverse(city)]);
                        var sunCenter = projection(sunCoordinates);
                        _.assign(ctx, {
                            textAlign: "left",
                            font: "italic 16px OriginalGaramondBTWebItalic"
                        });
                        ctx.fillText(cityList[city].name, sunCenter[0] + r + 5, sunCenter[1])
                    })
                } else {
                    ctx.strokeStyle = rgbaFromRgb(colors.ecliptic, sunTrajectoryOpacity);
                    //ctx.setLineDash([5]);
                    ctx.lineWidth = 0.4;
                    drawSunPath();
                    //ctx.setLineDash([0]);
                }
                ctx.setLineDash([]);
                projection.rotate(center);
            }


            function distance(center, sunPosition) {
                var xDistance = center[0] - sunPosition[0];
                var yDistance = center[1] - sunPosition[1];

                return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
            }

            $scope.showCitySunPath = false;

            function draw() {
                var center = [currentLon, currentLat, currentReverse];
                var constellations = $scope.geoConstellations;
                if (!constellations) return;
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
                ctx.strokeStyle = rgbaFromRgb(d3.rgb("#fff"), graticuleOpacity * 0.8);
                ctx.lineWidth = .1;
                ctx.beginPath();
                path(graticule());
                ctx.stroke();

                ctx.lineWidth = 0.15;
                ctx.beginPath();
                var equator = [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]];
                path({type: "LineString", coordinates: equator});
                ctx.stroke();

                _.assign(ctx, {
                    textAlign: "center",
                    font: "italic 16px OriginalGaramondBTWebItalic",
                    fillStyle: rgbaFromRgb(d3.rgb("#fff"), graticuleOpacity * 0.4)
                });

                ctx.fillText('Небесный экватор', equatorTextPosition[0], equatorTextPosition[1]);
                //горизонт
                ctx.strokeStyle = "#f00";
                ctx.beginPath();
                fixedPath({type: "LineString", coordinates: equator});
                ctx.stroke();

                //эклиптика
                ctx.strokeStyle = rgbaFromRgb(d3.rgb('#fff'), eclipticOpacity);
                ctx.lineWidth = 0.5;
                var eclipticPart = eclipticCoordinates.filter(function (coord) {
                    return coord[0] > sunCoordinates[0] && coord[0] < startTailSunPosition[0]
                });
                if (eclipticPart.length < 2) {
                    var tail = [sunCoordinates, startYearSunPosition];
                } else {
                    eclipticPart = [startTailSunPosition].concat(eclipticPart).concat([sunCoordinates]);
                    tail = tailCoordinates;
                    ctx.beginPath();
                    path({type: "LineString", coordinates: eclipticPart});
                    ctx.stroke();
                }

                makeEclipticGradient(tail[0]);
                ctx.beginPath();
                path({type: "LineString", coordinates: tail});
                ctx.stroke();


                //линии созвездий и звезды
                var minConstellationNumber = 0;
                var minDistance = distance(projection(constellations[0].properties.center), sunPx);
                constellations.forEach(function(constellation, i) {
                    if (!constellation.properties.zodiac) return;
                    var currentDistance = distance(projection(constellation.properties.center), sunPx);
                    if (currentDistance < minDistance) {
                        minConstellationNumber = i;
                        minDistance = currentDistance
                    }
                });
                ctx.lineWidth = 0.7;
                constellations.forEach(function drawConstellation(constellation, i) {
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
                            if ($scope.state.tails) {
                                tailCtx.fillStyle = rgbaFromRgb(d3.rgb(geo.properties.color), 0.3);
                                tailPath.pointRadius([geo.properties.mag / 3]);
                                tailCtx.beginPath();
                                tailPath(geo);
                                tailCtx.fill();
                            }
                        } else if (geo.type == 'MultiLineString') {
                            if (i == minConstellationNumber) {
                                var opacity = lineOpacityScale(horizontSunCoord[1]) * Math.max(currentConstellationOpacity, constellationOpacity)
                                $scope.zodiacName.declension = geo.properties.nameDeclension;
                                $scope.zodiacName.name = geo.properties.name
                            } else {
                                opacity = lineOpacityScale(horizontSunCoord[1]) * constellationOpacity;
                            }
                            var color = colors.zodiacLine;
                            ctx.strokeStyle = rgbaFromRgb(color, opacity * 0.5);
                            ctx.beginPath();
                            path(geo);
                            ctx.stroke();

                            color = colors.zodiacText;
                            _.assign(ctx, {
                                textAlign: "center",
                                font: "italic 16px OriginalGaramondBTWebItalic",
                                fillStyle: rgbaFromRgb(color, opacity * 0.4)
                            });

                            var projectedCenter = projection(geo.properties.center);
                            var offset = 50;
                            ctx.fillText(geo.properties.name, projectedCenter[0], projectedCenter[1] - offset)
                        }
                    })
                });

                Object.keys(brightStarsList).forEach(function(star) {
                    var opacity = lineOpacityScale(horizontSunCoord[1]) * starNamesOpacity;
                    _.assign(ctx, {
                        textAlign: "left",
                        font: "italic 16px OriginalGaramondBTWebItalic",
                        textBaseline: 'middle',
                        fillStyle: rgbaFromRgb(d3.rgb("#fff"), opacity * 0.4)
                    });
                    var projectedCenter = projection(brightStarsList[star].coordinates);
                    ctx.fillText(brightStarsList[star].name, projectedCenter[0] + 3, projectedCenter[1]);
                });
                if ($scope.state.tails) {
                    ctx.scale(1 / ratio, 1 / ratio);
                    var starsLayer = getImage(ctx);
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(offScreenCanvas, 0, 0);

                    bufferCtx.putImageData(starsLayer, 0, 0);
                    ctx.drawImage(bufferCanvas, 0, 0);
                    ctx.scale(ratio, ratio);
                }
            }


            var lonHourScale = d3.scale.linear()
                .domain([0, 24 * 3600])
                .range([100, 460]);

            function getSecondsFromStartDay(date) {
                return (date.getHours() * 3600 +
                    date.getMinutes() * 60 +
                    date.getSeconds())
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

            var currentLon = lonHourScale(getSecondsFromStartDay($scope.state.currentDate)) + moment($scope.state.currentDate).dayOfYear()/365 * 360;
            var currentLat = getCurrentLat($scope.state.selectedCity);
            var currentReverse = getReverse($scope.state.selectedCity);
            var equatorTextPosition = fixedProjection([0, currentLat]);

            $scope.$watch('geoConstellations', function (geoConstellations) {
                if (!geoConstellations) return;
                console.log('draw!');
                draw();

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
                    if (!$scope.state.play) return;
                    var start = performance.now();
                    $scope.state.currentDate = moment($scope.state.currentDate).add($scope.state.velocity / (1000 / frameDuration), 's').toDate();
                    currentLon = lonHourScale(getSecondsFromStartDay($scope.state.currentDate)) + moment($scope.state.currentDate).dayOfYear()/365 * 360;
                    draw();
                    frameDuration = performance.now() - start;
                }

                setInterval(function () {
                    var fps = frames / 10 + ' fps';
                    console.log(fps);
                    frames = 0
                }, 10000)
            });
            $scope.$watch('state.selectedCity', function (city) {
                if (!$scope.geoConstellations) return;
                d3.transition('city')
                    .duration(1250)
                    .tween("rotate", function () {
                        var newLat = getCurrentLat(city);
                        var newReverse = getReverse(city);
                        var l = d3.interpolate(currentLat, newLat);
                        var r = d3.interpolate(currentReverse, newReverse);
                        console.log(fixedProjection([0, -newLat]));
                        return function (t) {
                            currentLat = l(t);
                            currentReverse = r(t);
                            equatorTextPosition = newReverse ? fixedProjection([0, -currentLat]) : fixedProjection([0, currentLat]);
                            clearCtx(tailCtx);
                            draw();
                        }
                    });
            }, true);
            $scope.$watch('state.tails', function () {
                if (!$scope.geoConstellations) return;
                clearCtx(tailCtx);
                draw();
            });

            function createAnimationWatch(variable, getter, setter, from, to) {
                $scope.$watch('state.' + variable, function (value) {
                    if (!$scope.geoConstellations) return;
                    d3.transition(variable)
                        .duration(1250)
                        .tween("rotate", function () {
                            var newValue = value ? from : to;
                            var r = d3.interpolate(getter(), newValue);
                            return function (t) {
                                setter(r(t));
                                draw();
                            }
                        })
                });
            }

            createAnimationWatch('constellations', function() {
                return constellationOpacity
            }, function(interpolatedValue) {
                constellationOpacity = interpolatedValue
            }, 1, 0);
            createAnimationWatch('currentConstellation', function() {
                return currentConstellationOpacity
            }, function(interpolatedValue) {
                currentConstellationOpacity = interpolatedValue
            }, 1, 0);
            createAnimationWatch('graticule', function() {
                return graticuleOpacity
            }, function(interpolatedValue) {
                graticuleOpacity = interpolatedValue
            }, 1, 0);
            createAnimationWatch('ecliptic', function() {
                return eclipticOpacity
            }, function(interpolatedValue) {
                eclipticOpacity = interpolatedValue
            }, 1, 0);
            createAnimationWatch('starNames', function() {
                return starNamesOpacity
            }, function(interpolatedValue) {
                starNamesOpacity = interpolatedValue
            }, 1, 0);
            createAnimationWatch('sunTrajectory', function() {
                return sunTrajectoryOpacity
            }, function(interpolatedValue) {
                sunTrajectoryOpacity = interpolatedValue
            }, 1, 0);
            createAnimationWatch('atmosphere', function() {
                return atmosphereTransparency
            }, function(interpolatedValue) {
                atmosphereTransparency = interpolatedValue;
                lineOpacityScale
                    .range([atmosphereTransparency, 1]);
            }, 0, 1);


            $scope.$watch('state.currentDate', function () {
                if ($scope.state.play) return;
                currentLon = lonHourScale(getSecondsFromStartDay($scope.state.currentDate)) + moment($scope.state.currentDate).dayOfYear()/365 * 360;
                draw();
            });
            $scope.$watch('showCitySunPath', function () {
                if (!$scope.geoConstellations) return;
                draw();
            });
            $scope.$watch('state.viewDirection', function (direction) {
                if (!$scope.geoConstellations) return;
                var newLat = getCurrentLat($scope.state.selectedCity);
                if (currentLat > 180) currentLat -= 360;
                if (newLat > 180) newLat -= 360;
                var newHeight = ($scope.state.viewDirection == 'horizon') ? ($element.height() - landscapeHeight) : window.innerHeight;
                normalProjectionTranslate = [width / 2, newHeight];
                if (direction == 'horizon') {
                    var newTranslate = normalProjectionTranslate;
                    var newScale = normalProjectionScale;
                    var newRotate = normalProjectionRotate;
                    var newEquatorTextCoordinates = currentReverse ? [0, -newLat] : [0, newLat];
                } else {
                    newTranslate = upProjectionTranslate;
                    newScale = upProjectionScale;
                    newRotate = upProjectionRotate;
                    newEquatorTextCoordinates = currentReverse ? [0, -newLat + 90] : [0, newLat + 90];
                }

                d3.transition('viewDirection')
                    .duration(1250)
                    .tween("rotate", function () {
                        var translate = d3.interpolate(projection.translate(), newTranslate);
                        var scale = d3.interpolate(projection.scale(), newScale);
                        var rotate = d3.interpolate(fixedProjection.rotate(), newRotate);
                        var lat = d3.interpolate(currentLat, newLat);
                        var interpolatedHeight = d3.interpolate(height, newHeight);
                        return function (t) {
                            height = interpolatedHeight(t);
                            updateWidthHeight(height, translate(t), rotate(t), scale(t));
                            currentLat = lat(t);
                            equatorTextPosition = fixedProjection(newEquatorTextCoordinates);
                            draw();
                        }
                    });
            });

        }
    }
});
