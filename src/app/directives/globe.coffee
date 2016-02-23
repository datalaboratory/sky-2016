zodiac.directive 'globe', (cityList) ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/globe.html'
  link: ($scope, $element, $attrs) ->
    $scope.cityList = cityList

    width = $element.width()
    svg = d3.select $element[0]

    globeProjection = d3.geo.orthographic()
    .translate [width / 2, width / 2]
    .scale 99
    .rotate [-70, -30]
    .precision .1
    .clipAngle 90

    globePath = d3.geo.path().projection globeProjection
    graticule = d3.geo.graticule().step [0, 30]

    g = svg.append 'g'

    g.append 'circle'
    .attr 'cx', width / 2
    .attr 'cy', width / 2
    .attr 'r', 99
    .attr 'class', 'globe__circle-back'
    .on 'mouseover', ->
      $scope.showCitySunPath = true
      $scope.$apply()
      return
    .on 'mouseleave', ->
      $scope.showCitySunPath = false
      $scope.$apply()
      return

    meridians = [
      {type: 'LineString', coordinates: [[37, -180], [37, -90], [37, 0], [37, 90], [37, 180]]}
      {type: 'LineString', coordinates: [[-37, -180], [-37, -90], [-37, 0], [-37, 90], [-37, 180]]}
    ]

    g.selectAll '.globe__meridian'
    .data meridians
    .enter()
    .append 'path'
    .attr 'class', 'globe__meridian'
    .attr 'd', globePath

    g.append 'path'
    .attr 'class', 'globe__msc-meridian'
    .attr 'd', globePath meridians[0]

    g.append 'path'
    .attr 'class', 'globe__circle-of-latitude'
    .attr 'd', globePath graticule()

    g.append 'path'
    .attr 'd', globePath {type: 'LineString', coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]}
    .attr 'class', 'globe__equator'

    cityGroup = g.selectAll 'g'
    .data _.keys(cityList)
    .enter()
    .append 'g'
    .attr 'class', 'globe__city'

    cityGroup.append 'circle'
    .attr 'cx', (d) -> globeProjection(cityList[d].coordinates)[0]
    .attr 'cy', (d) -> globeProjection(cityList[d].coordinates)[1]
    .attr 'r', 3
    .attr 'class', 'globe__city-circle'

    cityGroup.append 'text'
    .text (d) -> cityList[d].name
    .attr 'x', (d) -> globeProjection(cityList[d].coordinates)[0] + 5
    .attr 'y', (d) -> globeProjection(cityList[d].coordinates)[1]
    .attr 'class', 'globe__city-name garamond-italic'

    checkClass = ->
      cityGroup.classed 'active', (d) -> d is $scope.state.selectedCity
      cityGroup.selectAll('.globe__city-name').classed 'garamond-bold', (d) -> d is $scope.state.selectedCity
      return

    cityGroup.on 'click', (d) ->
      $scope.state.selectedCity = d
      $scope.$apply()
      checkClass()
      return

    cityGroup.on 'mouseover', (d) ->
      $scope.showCitySunPath = d
      $scope.$apply()
      return

    cityGroup.on 'mouseleave', ->
      $scope.showCitySunPath = false
      $scope.$apply()
      return

    checkClass()

    return
