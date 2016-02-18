zodiac.directive 'globeWithCities', (cityList) ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/globe-with-cities.html'
  link: ($scope, $element, $attrs) ->
    $scope.cityList = cityList

    width = $element.width()
    svg = d3.select $element[0]

    globeProjection = d3.geo.orthographic()
      .translate [width / 2, width / 2]
      .scale 100
      .rotate [-70, -35]
      .clipAngle 98

    globePath = d3.geo.path().projection globeProjection
    graticule = d3.geo.graticule().step [15, 15]

    graticulePath = svg.append 'path'
      .attr 'd', globePath(graticule())
      .attr 'class', 'graticule'

    cityGroup = svg
      .selectAll 'g'
      .data _.keys(cityList)
      .enter()
      .append 'g'

    cityGroup.append 'circle'
      .attr 'cx', (d) -> globeProjection(cityList[d].coordinates)[0]
      .attr 'cy', (d) -> globeProjection(cityList[d].coordinates)[1]
      .attr 'r', 3
      .attr 'class', 'city-circle'

    cityGroup.append 'text'
      .text (d) -> cityList[d].name
      .attr 'x', (d) -> globeProjection(cityList[d].coordinates)[0] + 5
      .attr 'y', (d) -> globeProjection(cityList[d].coordinates)[1]
      .attr 'class', 'city-name'

    checkClass = ->
      cityGroup.classed 'active', (d) -> d is $scope.state.selectedCity
      return

    checkClass()

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

    return
