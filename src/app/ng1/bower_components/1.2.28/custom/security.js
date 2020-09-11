'use strict';

angular.module(appCon.appName).factory('authService', ['$injector', '$q', '$state', '$modal', '$timeout',"aclService", "$rootScope","$location", function ($injector, $q, $state, $modal, $timeout, aclService, $rootScope, $location) {

	var _removeUserData = function () {
		sessionStorage.clear();
		window.localStorage.removeItem("userProfile");
		delete $rootScope.userProfile;
		service.removePermissions();
		service.setUser(null);
	};
	
	/** @property roles {Array} */
	var service = {

		// Current user cached info
		currentUser: {},
		userProfile: {},
		
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
				return $injector.get("users")["getLoginStatus"]().then(function (response) {
					return service.setUser(response.data.successData.userProfile);
				});
			}
		},

		setUser: function (data) {
			//clear all object properties
			angular.forEach(service.currentUser, function (value, key) {
				delete service.currentUser[key];
			});
			$rootScope["userProfile"] = data; 
			localStorage.setItem("userProfile", JSON.stringify(data));
			return angular.extend(service.currentUser, data);
		},

		setPermissions: function () {
			return $injector.get("users")["getPermissions"]().then(function (response) {
				if(response.data.status==='success'){
					aclService.setPermissions(response.data.successData.permissions);
				}
				return;
			});
		},
		
		removePermissions: function () {
			aclService.removePermissions();
			return;
		},
		
		checkUserStatus: function () {
			if (localStorage.getItem("userProfile")) {
				return $q.when(true);
			}
			return $q.when(false);
		},
		
		logout: function (unauthorizedHook, nextTarget) {
			nextTarget = nextTarget || '/'+appCon.globalCon.authentication.page;
			_removeUserData();
			if (unauthorizedHook) {
				service.popup = null;
				$location.path(nextTarget);
			} else {
				$injector.get('users')["logout"]().then(function () {
					$location.path(nextTarget);
				});
			}
		}
		
	};
	return service;
}]);