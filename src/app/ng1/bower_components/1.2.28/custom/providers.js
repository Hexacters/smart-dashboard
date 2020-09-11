angular.module(appCon.appName).provider('modalState', ['$stateProvider', function($stateProvider) {
    var provider = this;
    this.$get = function() {
        return stateProvider;
    }
    this.state = function(stateName, options) {
    	options.keyboard =false;
    	options.backdrop ='static';
		var modalInstance;
		options.controller = function($scope, $previousState, $state) {
		  $scope.cancelDialog = function() {
			$scope.$dismiss();
			$previousState.go("modalInvoker",{reload:true});
			//$state.go('^');
		  };
		};
        
        $stateProvider.state(stateName, {    
        	url: options.url,
            onEnter: function($modal, $state, $previousState) {
				$previousState.memo("modalInvoker"); // remember the previous state with memoName "modalInvoker"
                modalInstance = $modal.open(options);
                modalInstance.result['finally'](function() {
                    modalInstance = null;
                    if ($state.$current.name === stateName) {
                        $state.go('^');
                    }
                });
            },
            onExit: function($previousState) {
                if (modalInstance) {
					$previousState.go("modalInvoker"); 
                    modalInstance.close();
                }
            }
        });
    };
}]);

angular.module(appCon.appName).provider('modalStateSticky', ['$stateProvider', function($stateProvider) {
    var provider = this;
    this.$get = function() {
        return stateProvider;
    }
    this.state = function(stateName, options) {
    	options.keyboard =false;
    	options.backdrop ='static';
		var $modalInstance;
		options.controller = function($modalInstance, $scope, $previousState) {
			 var isopen = true;
			 $modalInstance.result['finally'](function() {
				isopen = false;
			 });
			 
			  $scope.cancel = function() {
				$modalInstance.dismiss('close');
				$previousState.go("modalInvoker"); // return to previous state
			  };
			  $scope.$on("$stateChangeStart", function(evt, toState) {
				if (!toState.$$state().includes['first.popup']) {
				  $modalInstance.dismiss('close');
				}
			  });		  
	    };

        $stateProvider.state(stateName, {   
        	url: options.url,
            onEnter: function($modal, $state, $previousState) {
				$previousState.memo("modalInvoker"); // remember the previous state with memoName "modalInvoker"
                $modal.open(options);
            }
       });
    };
	//console.log("modalState");
}]);