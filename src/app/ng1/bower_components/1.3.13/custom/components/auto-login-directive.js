'use strict';
/**
 *Auto Login directive
 */
angular.module(appCon.appName).directive('autoLogin', function() {
	return {
        restrict: 'EA',
        scope: true,
        controller: 'autoLoginController'
    };
});

angular.module(appCon.appName).controller('autoLoginController', ['$injector', '$attrs', '$element', '$scope', '$modal', '$interpolate', '$parse', 
                                                              function($injector, $attrs, $element, $scope, $modal, $interpolate, $parse) {
	var $rootScope, $state, $cookieStore, $location, $http, $interval, authService, aclService; 
    
	$http = $injector.get('$http');
    $rootScope = $injector.get('$rootScope');
    $state = $injector.get('$state');
    
    $cookieStore = $injector.get('$cookieStore');
    $location = $injector.get('$location');
    $interval = $injector.get('$interval');
    
    authService = $injector.get('authService');
    aclService = $injector.get('aclService');
    
    $rootScope.afterLoginLoading = false;
	var serviceName = $attrs.service, operationName = $attrs.operation, params = JSON.parse($interpolate($attrs.params)($scope)), callback = $attrs.callback, callbackFunc;
	
	$rootScope.isForbiddenLoggedOut= '';

	$injector.get(serviceName)[operationName](params).then(
    	
    	/* Request Success */
    	function(result) { 
    		var returnCallback = true;
    		if (result.data){
    			if(result.data.status === 'success') {
        			
        			//$cookieStore.put('userInfo', result.data.successData);
        			if(callback){
        				callbackFunc = $parse(callback)($scope);
        				returnCallback = callbackFunc(result, $scope.data);
        			}
        			if(returnCallback === true){
	        			authService.requestCurrentUser(true).then(function(){
	        				authService.setPermissions().then(function(){
	        					$rootScope.canPerform = aclService.canPerform; 
			        			$rootScope.canAccess = aclService.canAccess;
				        			
	                    		appCon.dashboard = _.get(result.data.successData, appCon.globalCon.dashboards.dashboardKey);
			                    
	                    		/* Set default dashboard landing page if undefined */
	                    		if((appCon.dashboard === undefined || appCon.dashboard === null ) && appCon.globalCon.defaultDashboard !== ''){
									appCon.dashboard = appCon.globalCon.extAppName+appCon.globalCon.defaultDashboard;
								}
								//appCon.cookie.setItem('dashboard', appCon.dashboard,false,appContextPath);
	                    		$cookieStore.put('dashboard',  appCon.dashboard);
								if(angular.isDefined($state.params.destination) && $state.params.destination !== ''){
									$state.go($state.params.destination);
								}
								else if(appCon.globalCon.dashboards && appCon.globalCon.dashboards[appCon.dashboard] && appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage){
									$location.path(appCon.globalCon.extAppName+appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage);	
								}else{
									$location.path(appCon.globalCon.extAppName+appCon.globalCon.defaultLandingPage);
								}
			        			
	        				});
	        			});
        			}
        			/********* Session Timeout ****************/	            			
        			if (appCon.globalCon.sessionExpiration && appCon.globalCon.authentication && appCon.globalCon.authentication.required) {	            				
    	                //if ($cookieStore.get('userProfile')) {
		                   if(!appCon.globalCon.mock || appCon.globalCon.mock === 'false'){
		                	    $interval.cancel($rootScope.Timer);
    	                		appCon.globalCon.sessionExpiration.sessionTimeOutValue = appCon.globalCon.sessionExpiration.sessionTimeoutInSec - 60;
    	                		appCon.globalCon.sessionExpiration.sessionBeforeAlertValue = appCon.globalCon.sessionExpiration.sessionTimeOutValue - (appCon.globalCon.sessionExpiration.sessionTimeOutValue - appCon.globalCon.sessionExpiration.alertBeforeSec);
    	                		var $modalStack = $injector.get('$modalStack');
    	                		var lockTime = false;
			                    $rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
			                    $rootScope.Timer = $interval(function(){
				        			$rootScope.sessionTimeoutValue = $rootScope.initSessionTimeoutInterval;
				        			if($rootScope.sessionTimeoutValue == 0){
				        				$interval.cancel($rootScope.Timer);
				        				$modalStack.dismissAll();
		                                //$rootScope.logout();
				        				$rootScope.logout('SESSION_EXPIRED');
		                                $rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
				        			}else if($rootScope.sessionTimeoutValue == appCon.globalCon.sessionExpiration.sessionBeforeAlertValue){
				        				$rootScope.sessionTimeoutDialog = $modal.open({
					 	                    template: appCon.prepareSessionExpireDialogContainer,
					 	                    backdrop: 'static',
					 	                    controller: function($scope, $modalInstance, $rootScope, $state) {							 	                    	
					 	                    	//$scope.commonConfirmationDialogTitle = 'Session Expiration Alert';
					 	                    	$scope.lockTimeLoading = false;
					                            $scope.ok = function() {
					                            	$scope.lockTimeLoading = true;
					                            	lockTime = true;
					                            	$modalInstance.close();
					                            	$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;	
					                            	$injector.get(appCon.globalCon.sessionExpiration.service)[appCon.globalCon.sessionExpiration.operation]().then(function(result) {
					                            		lockTime = false;
					                            		$scope.lockTimeLoading = false;
					                            		$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
						                                $modalInstance.close();
					                                });
					                            };
					                            $scope.cancel = function() {
					                            	$interval.cancel($rootScope.Timer);
							        				$modalStack.dismissAll();
					                                $rootScope.logout();
					                                $rootScope.initSessionTimeoutInterval=appCon.globalCon.sessionExpiration.sessionTimeOutValue;
					                            };
					 	                    }
					 	                });
				        			}
				        			if($rootScope.sessionTimeoutValue > 0){
				        				$rootScope.initSessionTimeoutInterval--;
				        			}
				        		},1000);
		                    }
    	               // }
                    }
            	} else if (result.data.status === 'error' ){
            		if(callback){
        				callbackFunc = $parse(callback)($scope);
        				returnCallback = callbackFunc(result, $scope.data);
        			}
        			if(returnCallback === true){
        				$rootScope.loggedOutMsg = 'INVALID_CREDENTIALS';
                		$location.path('/' + appCon.globalCon.authentication.page);	
        			}
            	}
    		}
    	},
        /* Request Failure */
        function(){
    		$rootScope.loggedOutMsg = 'INVALID_CREDENTIALS';
    		if(callback){
				callbackFunc = $parse(callback)($scope);
				returnCallback = callbackFunc(result, $scope.data);
			}if(returnCallback === true){
				$location.path('/' + appCon.globalCon.authentication.page);
			}
        }
    );
}]);

