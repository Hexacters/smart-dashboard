'use strict';

angular.module(appCon.appName).provider('modalState', ['$stateProvider', function($stateProvider) {
    this.$get = function() {
        return $stateProvider;
    };
    this.state = function(stateName, options, modalClass) {
        options.backdrop = 'static';
        if(modalClass){
        	options.windowClass = modalClass;
        }
        var modalInstance;
        options.controller = function($scope, $previousState, $state, $modalStack) {
            $scope.cancelDialog = function() {
                $scope.$dismiss();
                $previousState.go('modalInvoker');
            };
            $scope.closeAndRedirect = function(state, params) {
                $scope.$dismiss();
                $state.go(state, params);
            };
            $scope.closeAllDialog = function() {
            	$modalStack.dismissAll();
            };
            $scope.closeAllDialogAndRedirect = function(state, params) {
            	$modalStack.dismissAll();
                $state.go(state, params);
            };
        };

        $stateProvider.state(stateName, {
            url: options.url,
            onEnter: function($modal, $state, $previousState) {
                $previousState.memo('modalInvoker'); // remember the previous state with memoName 'modalInvoker'
                modalInstance = $modal.open(options);
                modalInstance.result['finally'](function() {
                    modalInstance = null;
                    /*if ($state.$current.name === stateName) {
                        $state.go('^');
                    }*/
                });
            }/*,
            onExit: function($previousState) {
                if (modalInstance) {
                    //$previousState.go('modalInvoker');
                    modalInstance.close();
                }
            }*/
        });
    };
}]);