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
    nOfMinutesInDay = 1440
    nOfDaysInYear = if currentDate.isLeapYear() then 366 else 365
    nOfMinutesInYear = nOfDaysInYear * nOfMinutesInDay
    hourSliderStep = hourSliderWidth / nOfMinutesInDay
    monthSliderStep = monthSliderWidth / nOfMinutesInYear

    $scope.hourSliderOffset = parseInt $element.find('.sliders__hour-slider').css('padding-left')
    $scope.hourSliderPadding = parseInt $hourHandle.css('left')
    $scope.monthSliderOffset = parseInt $element.find('.sliders__month-slider').css('padding-left')

    $scope.currentHourX = currentDate.minute() * hourSliderStep
    $scope.currentMonthX = currentDate.diff(startOfYear, 'minutes') * monthSliderStep

    $scope.getHourX = (i) -> i * 60 * hourSliderStep
    $scope.getHourCaption = (i) -> ('0' + i).slice(-2) + unless i then ':00' else ''

    $scope.getMonthX = (i) -> startOfYear.clone().month(i).diff(startOfYear, 'minutes') * monthSliderStep
    $scope.getMonthCaption = (i) -> $scope.monthNames[i % 12]['short']

    $hourHandle.on 'mousedown', (event) ->
      $('body').css cursor: 'pointer'

      mousemove = (event) ->
        minutesFromStart = Math.ceil (event.clientX - $scope.hourSliderOffset) / hourSliderStep
        minutesFromStart = 0 if minutesFromStart < 0
        minutesFromStart = nOfMinutesInDay - 1 if minutesFromStart > nOfMinutesInDay - 1

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
        minutesFromStart = Math.ceil (event.clientX - $scope.monthSliderOffset) / monthSliderStep
        minutesFromStart = 0 if minutesFromStart < 0
        minutesFromStart = nOfMinutesInYear if minutesFromStart > nOfMinutesInYear

        $scope.state.currentDate = startOfYear.clone().minute(minutesFromStart).toDate()

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

      $scope.currentHourX = moment(newVal).diff(moment($scope.state.currentDate).clone().startOf('day'), 'minutes') * hourSliderStep
      $scope.currentMonthX = moment(newVal).diff(startOfYear, 'minutes') * monthSliderStep
      return

    return
