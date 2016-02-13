angular.module('zodiac').directive('player', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/player.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.setVelocity = function (velocity) {
                if (velocity == $scope.player.velocity) {
                    $scope.player.play = !$scope.player.play
                } else {
                    $scope.player.play = true;
                    $scope.player.velocity = velocity;
                }
            }

        }
    }
});