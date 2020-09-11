'use strict';
/**
 *Login directive
 */
angular.module(appCon.appName).directive('login', function() {
	return {
        restrict: 'EA',
        scope: true,
        controller: 'loginController'
    };
});

angular.module(appCon.appName).controller('loginController', ['$injector', '$attrs', '$element', '$scope', '$modal', '$parse','$timeout','$interval',
                                                              function($injector, $attrs, $element, $scope, $modal, $parse,$timeout, $interval) {
	var $rootScope, $state, $cookieStore, $location, $http, $interval, authService, aclService; 
	
	$element.attr('id', 'loginFormId');
    	
	/* remember username */
	if(localStorage.getItem('user.userName')){
		$scope.data = {
			'j_username' : localStorage.getItem('user.userName'),
			'rememberUsername' : true
		};
	}
	if(angular.element('.popover').length !==0){
		angular.element('.popover').remove();
	}
    $http = $injector.get('$http');
    $rootScope = $injector.get('$rootScope');
    $state = $injector.get('$state');
    var $modalStack = $injector.get('$modalStack');
    $modalStack = $modalStack.dismissAll();
    
    $cookieStore = $injector.get('$cookieStore');
    $location = $injector.get('$location');
    $interval = $injector.get('$interval');
    
    authService = $injector.get('authService');
    aclService = $injector.get('aclService');
    
   /* $interval.cancel($rootScope.Timer);
	if(appCon.globalCon.sessionExpiration && appCon.globalCon.sessionExpiration.sessionTimeOutValue){
		$rootScope.initSessionTimeoutInterval=appCon.globalCon.sessionExpiration.sessionTimeOutValue;
	}*/
    $rootScope.afterLoginLoading = false;
	var submitData = $element.children('submit-data'),
        formTag = $attrs.formId ? $attrs.formId : ($element.find('form') ? $element.find('form').attr('name') : ''),
        serviceName, operationName, callback, callbackFunc;
	
	/* Submit login request */
    if (submitData.attr('service')) {
    	serviceName = submitData.attr('service');
        operationName = submitData.attr('operation');
    }    
    $scope[formTag+'Submitted'] = false;
    $scope.submit = function() {
    	$rootScope.loggedOutMsg = '';
    	$rootScope.isForbiddenLoggedOut= '';
    	
    	callback = submitData.attr('callback');
    	
    	$scope[formTag+'Submitted'] = true;
    	if ($scope[formTag].$valid && serviceName && operationName) {
        	$scope.loading=true;
        	$rootScope.afterLoginLoading = true;
        	// Check if encryption mode is enabled from configuration
        	// If yes need to encrypt password
        	if (appCon.globalCon.authentication.enablePasswordEncryption && appCon.globalCon.authentication.enablePasswordEncryption.toString() === 'true') {
        		var password = _.get($scope.data, 'j_password'), 
        			sKey = uid(), 
        			md5Password = MD5(password), 
        			newPassword = md5Password + sKey;
        		
                newPassword = MD5(newPassword);
                $scope.data.j_password = newPassword; 
                $scope.data.skey = sKey;
        	}
        	
        	/* API call */
            $injector.get(serviceName)[operationName]($scope.data).then(
            	
            	/* Request Success */
            	function(result) { 
            		var returnCallback = true;
            		if (result.data){
            			if(result.data.status === 'success') {
	            			$element.hide();
	            			
	            			//remember user name
	                    	if(angular.isDefined($scope.data.rememberUsername) && $scope.data.rememberUsername == true){
	                    		localStorage.setItem('user.userName', $scope.data.j_username);
	                    	}else{
	                    		localStorage.removeItem('user.userName');
	                    	}
	            			
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
										if(appCon.globalCon.dashboards && appCon.globalCon.dashboards[appCon.dashboard] && appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage){
											$location.path(appCon.globalCon.extAppName+appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage);	
										}else{
											$location.path(appCon.globalCon.extAppName+appCon.globalCon.defaultLandingPage);
										}
					        			
										$rootScope.afterLoginLoading = false;
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
						        			if($rootScope.sessionTimeoutValue == 0 && !lockTime){
						        				$interval.cancel($rootScope.Timer);
						        				$modalStack.dismissAll();
						        				$rootScope.logout('SESSION_EXPIRED');
				                                $rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
						        			}else if($rootScope.sessionTimeoutValue == appCon.globalCon.sessionExpiration.sessionBeforeAlertValue){
						        				$rootScope.sessionTimeoutDialog = $modal.open({
							 	                    template: appCon.prepareSessionExpireDialogContainer,
							 	                    backdrop: 'static',
							 	                    keyboard: false,
							 	                    controller: function($scope, $modalInstance, $rootScope, $state) {							 	                    	
							 	                    	//$scope.commonConfirmationDialogTitle = 'Session Expiration Alert';
							 	                    	$scope.lockTimeLoading = false;
							                            $scope.ok = function() {
							                            	lockTime = true;
							                            	$scope.lockTimeLoading = true;
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
	        	                //}
		                    }
							$scope.loading=false;
	                	} else if (result.data.status === 'error' ){
	                		$scope.loginError = result.data;
	                		$scope.loading=false;
	                		var shortMessage = result.data.errorData.ResponseError[0].shortMessage.toLowerCase();
	                		if(shortMessage.indexOf('password expired') >= 0 ){
	                			if(angular.isDefined($scope.data.rememberUsername) && $scope.data.rememberUsername == true){
		                    		localStorage.setItem('user.userName', $scope.data.j_username);
		                    	}else{
		                    		localStorage.removeItem('user.userName');
		                    	}
	                			$rootScope.afterLoginLoading = true;
	                		}else{
	                			$rootScope.afterLoginLoading = false;
	                		}
	                		$scope.data = {};
	                		if(localStorage.getItem('user.userName')){
	                			$scope.data = {
	                				'j_username' : localStorage.getItem('user.userName'),
	                				'rememberUsername' : true
	                			};
	                		}
	                		$timeout(function(){angular.element(document.querySelector('[data-ng-model="data.j_username"]')).focus()});
	                		$scope[formTag+'Submitted'] = false;
	                		$scope[formTag].$setPristine(true);
	                		if(callback){
		        				callbackFunc = $parse(callback)($scope);
		        				return callbackFunc(result, $scope.data);
		        			}
	                	}
            		}
            	},
                /* Request Failure */
                function(error){
            		$scope.loading=false;
                	$scope.data = {};
                	if(localStorage.getItem('user.userName')){
                		$scope.data = {
                			'j_username' : localStorage.getItem('user.userName'),
                			'rememberUsername' : true
                		};
                	}
                	$scope.loginError = error.data;
                	$element.show();
                	$timeout(function(){angular.element(document.querySelector('[data-ng-model="data.j_username"]')).focus()});
                	$scope[formTag+'Submitted'] = false;
                	$rootScope.afterLoginLoading = false;
                	$scope[formTag].$setPristine(true);
                	if(callback){
        				callbackFunc = $parse(callback)($scope);
	        			return callbackFunc(error, $scope.data);
        			}
                }
            );
        }
    };
}]);