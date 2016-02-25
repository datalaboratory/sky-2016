zodiac.directive('player', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/player.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.setVelocity = function (velocity) {
                if (velocity == $scope.state.velocity) {
                    $scope.state.play = !$scope.state.play
                } else {
                    $scope.state.play = true;
                    $scope.state.velocity = velocity;
                }
                $scope.state.tails = false;
            };
            $scope.showStarsTails = function() {
                if (!$scope.state.tails) {
                    $scope.state.tails = true;
                    $scope.state.velocity = 600;
                    $scope.state.play = true;
                } else {
                    $scope.state.tails = false;
                    $scope.state.play = false;

                }
            };

            $scope.changeViewDirection = function () {
                $scope.state.viewDirection = ($scope.state.viewDirection == 'horizon') ? 'up' : 'horizon';
            };

            $document.on('keydown', function(e) {
                if (e.keyCode == 32) {
                    $scope.state.play = !$scope.state.play;
                    $scope.state.tails = false;
                }
            })

        }
    }
});
