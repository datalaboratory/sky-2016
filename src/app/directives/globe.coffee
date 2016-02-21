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
      .scale 100
      .rotate [-75, -30]
      .clipAngle 90

    globePath = d3.geo.path().projection globeProjection
    graticule = d3.geo.graticule().step [15, 15]

    g = svg.append 'g'

    g.append 'circle'
    .attr 'cx', width / 2
    .attr 'cy', width / 2
    .attr 'r', 100
    .attr 'class', 'globe__circle-back'
    .on 'mouseover', ->
      $scope.showCitySunPath = true
      $scope.$apply()
      return
    .on 'mouseleave', ->
      $scope.showCitySunPath = false
      $scope.$apply()
      return

    graticulePath = g.append 'path'
      .attr 'd', globePath(graticule())
      .attr 'class', 'globe__graticule'

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
      .attr 'class', (d) -> 'globe__city-name' + if d is $scope.state.selectedCity then ' garamond' else ' garamond-italic'

    checkClass = ->
      cityGroup.classed 'active', (d) -> d is $scope.state.selectedCity
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
