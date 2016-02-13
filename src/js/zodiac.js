angular.module('zodiac').controller('ZodiacController', function ($scope, $rootScope, $http, constellationLoader) {
    $http.get('data/starData.json').then(function(data){
         $scope.geoConstellations = constellationLoader.load(data.data)
    });

    $scope.state = {
        selectedCity: 'Moscow',
        currentDate: new Date(2015, 5, 5),
        atmosphere: true
    }

});