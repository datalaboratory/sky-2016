zodiac.constant('colors', {
    skyColorScale: [
        d3.scale.linear()
            .domain([10, 3, -3, -10]) //высота Солнца над горизонтом в градусах при восходе
            .range([
                ["#2E87E8", "#2E87E8"],
                ["#6767c8", "#F39217"],
                ["#6767c8", "#6767c8"],
                ["#113", "#113"]
            ])
            .clamp(true),
        d3.scale.linear()
            .domain([-10, -3, 3, 10]) //при закате
            .range([
                ["#113", "#113"],
                ["#6890B1", "#6890B1"],
                ["#6890B1","#D49A83"],
                ["#2E87E8", "#2E87E8"]
            ])
            .clamp(true)
    ],
    zodiacLine: "#323192",
    zodiacText: "#fff",
    ecliptic: "#29E6E6",
    constellationLine: "#999"
});
