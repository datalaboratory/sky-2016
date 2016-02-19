zodiac.directive('player', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/player.html',
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
            };

            $scope.changeViewDirection = function () {
                $scope.state.viewDirection = ($scope.state.viewDirection == 'horizon') ? 'up' : 'horizon';
            };

            $document.on('keydown', function(e) {
                if (e.keyCode == 32) {
                    $scope.player.play = !$scope.player.play;
                    $scope.player.tails = false;
                }
            })

        }
    }
});
