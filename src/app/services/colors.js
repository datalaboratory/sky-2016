zodiac.constant('colors', {
    skyColorScale: [
        d3.scale.linear()
            .domain([10, 3, -3, -10]) //высота Солнца над горизонтом в градусах при восходе
            .range([
                ["#37e", "#2af", "#ade"],
                ["#6767c8", "#6767c8", "#F39217"],
                ["#6767c8", "#6767c8", "#6767c8"],
                ["#000", "#113", "#225"]
            ])
            .clamp(true),
        d3.scale.linear()
            .domain([-10, -3, 3, 10]) //при закате
            .range([
                ["#000", "#113", "#225"],
                ["#6890B1", "#A47A79", "#D49A83"],
                ["#6890B1", "#A47A79", "#D49A83"],
                ["#37e", "#2af", "#ade"]
            ])
            .clamp(true)
    ],
    zodiacLine: d3.rgb("#f0f"),
    zodiacText: d3.rgb("#fff"),
    ecliptic: d3.rgb("#29E6E6"),
    constellationLine: "#999"
});
