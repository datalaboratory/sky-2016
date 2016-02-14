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
                $scope.player.tails = false;
            };
            $scope.showStarsTails = function() {
                if (!$scope.player.tails) {
                    $scope.player.tails = true;
                    $scope.player.velocity = 600;
                    $scope.player.play = true;
                } else {
                    $scope.player.tails = false;
                    $scope.player.play = false;

                }

            }

        }
    }
});