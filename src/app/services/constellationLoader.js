zodiac.factory('constellationLoader', function () {
    return {
        load: function (constellations) {
                var geoConstellations = [];
                var starsMag = [];
                var starCount = 0;
                var maxMag = 5;
                var zodiacNames = {
                    'Aquarius': 'Водолей',
                    'Aries': 'Овен',
                    'Cancer': 'Рак',
                    'Capricornus': 'Козерог',
                    'Gemini': 'Близнецы',
                    'Leo': 'Лев',
                    'Libra': 'Весы',
                    'Pisces': 'Рыбы',
                    'Sagittarius': 'Стрелец',
                    'Scorpius': 'Скорпион',
                    'Taurus': 'Телец',
                    'Virgo': 'Дева'
                };
                var noZodiacNames = {
                    'Andromeda': 'Андромеда',
                    'Crux': 'Южный Крест',
                    'Cassiopeia': 'Кассиопея',
                    'Orion': 'Орион',
                    'Ursa Major': 'Большая Медведица',
                    'Corona Borealis': 'Северная Корона',
                    'Pegasus': 'Пегас'
                };
                var zodiacNamesDeclension = {
                    'Aquarius': 'Водолея',
                    'Aries': 'Овна',
                    'Cancer': 'Рака',
                    'Capricornus': 'Козерога',
                    'Gemini': 'Близнецов',
                    'Leo': 'Льва',
                    'Libra': 'Весов',
                    'Pisces': 'Рыб',
                    'Sagittarius': 'Стрелеца',
                    'Scorpius': 'Скорпиона',
                    'Taurus': 'Тельца',
                    'Virgo': 'Девы'
                };
                constellations = constellations.map(function (constellation) {
                    constellation.stars = constellation.stars.filter(function (star) {
                        if (star.mag < maxMag) {
                            starsMag.push(star.mag);
                            starCount++
                        }
                        return star.mag < maxMag
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


                constellations.forEach(function (constellation) {
                    var geometries = [];

                    if (constellation.zodiac || noZodiacNames[constellation.name]) {
                        var lines = constellation.lines.map(function (line) {
                            var p1 = [-line.ra1, line.dec1];
                            var p2 = [-line.ra2, line.dec2];

                            return [p1, p2]
                        });
                        var name = constellation.zodiac ? zodiacNames[constellation.name] : noZodiacNames[constellation.name];
                        var nameDeclension = constellation.zodiac ? zodiacNamesDeclension[constellation.name] : '';
                        var geometry = {
                            type: "MultiLineString",
                            coordinates: lines,
                            properties: {
                                name: name,
                                nameDeclension: nameDeclension
                            }
                        };

                        geometry.properties.center = d3.geo.centroid({
                            type: 'GeometryCollection',
                            geometries: [geometry]
                        });
                        geometries.push(geometry);
                    }

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
                                color: d3.rgb(star.color),
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
                return geoConstellations

        }
    }
});
