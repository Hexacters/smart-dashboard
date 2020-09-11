'use strict';
angular.module(appCon.appName).controller("decideLandingController", ["$scope", "$rootScope", "$injector","$state", "$cookieStore", "$window", function($scope, $rootScope, $injector, $state, $cookieStore, $window) {
   /* Logoff before App Navigation*/
	$scope.clearLocalCookie = function(){
		sessionStorage.clear();
		window.localStorage.removeItem('userPermission_'+appContextPath);
		$cookieStore.remove('userProfile');
		$cookieStore.remove('dashboard');
		$cookieStore.put('userProfile', false);
		$rootScope.userProfile = false;	
	};

	/* App Navigation*/
	$scope.goToPortal = function(redirectUri){
		if(angular.isDefined(appCon.globalCon.authentication.mode) && appCon.globalCon.authentication.mode.toLowerCase() === 'sso'){
			$scope.clearLocalCookie();
			$injector.get('users').logOff().then(function (response) {
				if(response.data && response.data.status === 'success'){
					$rootScope.afterLoginLoading=true;
					$window.location = redirectUri;
					return;
				}
			});
		}
	};
}]);