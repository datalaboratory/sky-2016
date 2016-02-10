angular.module('zodiac').factory('constellationLoader', function () {
    return {
        load: function (data) {
                var geoConstellations = [];
                var starsMag = [];
                data = data.map(function (constellation) {
                    constellation.stars = constellation.stars.filter(function (star) {
                        if (star.mag < 6) starsMag.push(star.mag);
                        return star.mag < 6
                    });
                    return constellation
                });
                var minMaxMag = d3.extent(starsMag);
                var opacityScale = d3.scale.linear()
                    .domain(minMaxMag)
                    .range([1, 0.4]);

                var magScale = d3.scale.linear()
                    .domain(minMaxMag)
                    .range([4.7, 1.7]);

                data.forEach(function (constellation) {
                    var geometries = [];

                    var lines = constellation.lines.map(function (line) {
                        var p1 = [-line.ra1, line.dec1];
                        var p2 = [-line.ra2, line.dec2];

                        return [p1, p2]
                    });

                    geometries.push({
                        type: "MultiLineString",
                        coordinates: lines
                    });

                    constellation.stars.map(function (star) {
                        var opacity = opacityScale(star.mag);
                        var D = 4;
                        var Y = (d3.scale.linear()
                            .domain([minMaxMag[0], 6, minMaxMag[1]])
                            .range([10 - D, 0, -15 + D]))(star.mag);
                        var currentOpacity = d3.scale.linear()
                            .domain([10, Y - D, Y + D, -15])
                            .range([0, 0, opacity, opacity])
                            .clamp(true);
                        geometries.push({
                            type: 'Point',
                            coordinates: [-star.ra, star.dec],
                            properties: {
                                color: star.color,
                                mag: magScale(star.mag),
                                currentOpacity: currentOpacity
                            }
                        })
                    });

                    geometries = {
                        type: 'GeometryCollection',
                        geometries: geometries
                    };
                    var geoConstellation = {
                        type: 'Feature',
                        geometry: geometries,
                        properties: {
                            name: constellation.name,
                            zodiac: constellation.zodiac,
                            center: d3.geo.centroid(geometries)
                        }
                    };
                    geoConstellations.push(geoConstellation)
                });
                console.log('constellations loaded');
                return geoConstellations
        }
    }
});