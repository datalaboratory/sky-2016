zodiac.directive 'sliders', ($document) ->
  restrict: 'E'
  replace: true
  templateUrl: 'templates/directives/sliders.html'
  link: ($scope, $element, $attrs) ->
    hourSliderWidth = $element.find('.sliders__hour-slider').width()
    monthSliderWidth = $element.find('.sliders__month-slider').width()
    $hourHandle = $element.find '.sliders__hour-slider .sliders__comet'
    $monthHandle = $element.find '.sliders__month-slider .sliders__comet'
    currentDate = moment $scope.state.currentDate
    startOfYear = currentDate.clone().startOf 'year'
    nOfMinutes = 1440
    nOfDays = if currentDate.isLeapYear() then 366 else 365
    hourStep = hourSliderWidth / nOfMinutes
    monthStep = monthSliderWidth / nOfDays

    $scope.hourSliderOffset = parseInt $element.find('.sliders__hour-slider').css('padding-left')
    $scope.hourSliderPadding = parseInt $hourHandle.css('left')
    $scope.monthSliderOffset = parseInt $element.find('.sliders__month-slider').css('padding-left')
    $scope.currentHourX = currentDate.minute() * hourStep
    $scope.currentMonthX = currentDate.diff(startOfYear, 'days') * monthStep

    $scope.getHourX = (i) -> i * 60 * hourStep
    $scope.getMonthX = (i) -> startOfYear.clone().month(i).diff(startOfYear, 'days') * monthStep
    $scope.getHourCaption = (i) -> ('0' + i).slice(-2) + unless i then ':00' else ''
    $scope.getMonthCaption = (i) -> $scope.monthNames[i % 12]['short']

    $hourHandle.on 'mousedown', (event) ->
      $('body').css cursor: 'pointer'

      mousemove = (event) ->
        minutesFromStart = Math.ceil (event.clientX - $scope.hourSliderOffset) / hourStep
        minutesFromStart = 0 if minutesFromStart < 0
        minutesFromStart = nOfMinutes - 1 if minutesFromStart > nOfMinutes - 1

        $scope.state.currentDate = moment($scope.state.currentDate).clone().startOf('day').minute(minutesFromStart).toDate()

        $scope.$apply()
        return

      mouseup = ->
        $('body').css cursor: 'auto'
        $document.unbind 'mousemove', mousemove
        $document.unbind 'mouseup', mouseup
        return

      event.preventDefault()
      $document.on 'mousemove', mousemove
      $document.on 'mouseup', mouseup
      return

    $monthHandle.on 'mousedown', (event) ->
      $('body').css cursor: 'pointer'

      mousemove = (event) ->
        daysFromStart = Math.ceil (event.clientX - $scope.monthSliderOffset) / monthStep
        daysFromStart = 1 if daysFromStart < 1
        daysFromStart = nOfDays if daysFromStart > nOfDays

        $scope.state.currentDate = startOfYear.clone().dayOfYear(daysFromStart).toDate()

        $scope.$apply()
        return

      mouseup = ->
        $('body').css cursor: 'auto'
        $document.unbind 'mousemove', mousemove
        $document.unbind 'mouseup', mouseup
        return

      event.preventDefault()
      $document.on 'mousemove', mousemove
      $document.on 'mouseup', mouseup
      return

    $scope.$watch 'state.currentDate', (newVal, oldVal) ->
      if moment(newVal).year() isnt currentDate.year()
        $scope.state.currentDate = startOfYear.toDate()

      $scope.currentHourX = moment(newVal).diff(moment($scope.state.currentDate).clone().startOf('day'), 'minutes') * hourStep
      $scope.currentMonthX = moment(newVal).diff(startOfYear, 'days') * monthStep
      return

    return
