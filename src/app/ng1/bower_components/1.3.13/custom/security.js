'use strict';

angular.module(appCon.appName).factory('authService', ['$injector', '$q', '$state', '$modal', '$timeout', 'aclService', '$rootScope', '$location', '$interval', function ($injector, $q, $state, $modal, $timeout, aclService, $rootScope, $location, $interval) {

	var $cookieStore;
    $cookieStore = $injector.get('$cookieStore');
    
	var _removeUserData = function () {
		sessionStorage.clear();
		window.localStorage.removeItem('userPermission_'+appContextPath);
		//appCon.cookie.removeItem('userProfile',appContextPath);
		$cookieStore.remove('userProfile');
		//appCon.cookie.removeItem('userInfo');
		//appCon.cookie.removeItem('dashboard',appContextPath);
		$cookieStore.remove('dashboard');
		//appCon.cookie.setItem('userProfile', false,false,appContextPath);
		$cookieStore.put('userProfile', false);
		
		var $injector = angular.injector(['ng']),
			$rootScope = $injector.get('$rootScope'),
			$interval = $injector.get('$interval');
		$interval.cancel($rootScope.Timer);
		if(appCon.globalCon.sessionExpiration && appCon.globalCon.sessionExpiration.sessionTimeOutValue){
			$rootScope.initSessionTimeoutInterval=appCon.globalCon.sessionExpiration.sessionTimeOutValue;
		}			
		$rootScope.userProfile = false;		
		service.removePermissions();
		$timeout(function(){
            service.setUser(null);
        },0);		
	};
	
	/** @property roles {Array} */
	var service = {

		// Current user cached info
		currentUser: {},
		
		// Check if current user is logged in
		isAuthenticated : function () {
			return !!(service.currentUser && service.currentUser.loggedIn);
		},

		/**
		 * Get current user via request to the server.
		 */
		requestCurrentUser: function (forceReload) {
			forceReload = forceReload || false;
			if (!forceReload && service.isAuthenticated()) {
				return $q.when(service.currentUser);
			}
			else {
				/**get user status from proxy layer*/
				return $injector.get('users').getLoginStatus().then(function (response) {
					if(response.data && response.data.status === 'success'){
						return service.setUser(response.data.successData.userProfile);
					}
				});
			}
		},

		setUser: function (data) {
			//clear all object properties
			angular.forEach(service.currentUser, function (value, key) {
				delete service.currentUser[key];
			});
			console.log(data);
			$rootScope.userProfile = data;
			//appCon.cookie.setItem('userProfile', JSON.stringify(data),false,appContextPath);
			$cookieStore.put('userProfile', JSON.stringify(data));
			return data;
		},

		setPermissions: function () {
			return $injector.get('users').getPermissions().then(function (response) {
				if(response.data.status==='success'){
					$rootScope.loginPermission = JSON.stringify(response.data.successData.permissions);
					localStorage.setItem('userPermission_'+appContextPath, JSON.stringify(response.data.successData.permissions));
					aclService.setPermissions(response.data.successData.permissions);
				}
			});
		},
		
		removePermissions: function () {
			aclService.removePermissions();
			return;
		},
		
		checkUserStatus: function () {
			if (localStorage.getItem('userProfile')) {
				return $q.when(true);
			}
			return $q.when(false);
		},
		
		logout: function (unauthorizedHook, nextTarget, loggedOutErrorMsg) {			
			$interval.cancel($rootScope.Timer);	
			nextTarget = nextTarget || '/'+appCon.globalCon.authentication.page;
			_removeUserData();
			if (unauthorizedHook) {
				service.popup = null;
				$location.path(nextTarget);
			} else {
				if (angular.isDefined(appCon.globalCon.authentication.mode) && appCon.globalCon.authentication.mode.toLowerCase() === 'sso'){
					 var appUrl = $location.absUrl(); // will tell you the current path
				     var appUrlContext = appUrl.split('/')[3];
				     var appUrlDomain = appUrl.split('/' + appUrlContext + '/')[0];
				     window.location.href = appUrlDomain + '/' + appUrlContext + '/' + appCon.globalCon.authentication.SSOLogoutUrl;
				     /*var appUrlDomain = appUrl.split(appUrlContext)[0];
				     window.location.href = appUrlDomain + appUrlContext + '/' + appCon.globalCon.authentication.SSOLogoutUrl;*/
					//window.location.href = appCon.globalCon.authentication.SSOLogoutUrl;
				}else{
					$injector.get('users').logout().then(function () {
						$location.path(nextTarget);
						var loggedOutErrorKey='';
						if($rootScope.isForbiddenLoggedOut==='FORBIDDEN'){
							loggedOutErrorKey= 'FORBIDDEN';
						}else{
							loggedOutErrorKey= loggedOutErrorMsg;
						}
						if(loggedOutErrorKey && loggedOutErrorKey!==''){
							$rootScope.loggedOutMsg = loggedOutErrorKey;
						}else{
							$rootScope.loggedOutMsg = 'LOGGED_OUT';
						}
					});
				}
				
			}
		}
	};
	return service;
}]);