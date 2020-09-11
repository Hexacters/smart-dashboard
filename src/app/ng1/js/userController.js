'use strict';
angular.module(appCon.appName).controller("userController", ["$scope", "$rootScope", "$injector", "$location", "$cookieStore","Analytics","$filter", function($scope, $rootScope, $injector, $location, $cookieStore,Analytics,$filter) {
	var authMode = appCon.globalCon.authentication.mode.toLowerCase();
	if(angular.isDefined($rootScope.loginErrorResponse) && angular.isObject($rootScope.loginErrorResponse)) {
		$rootScope.userId = $rootScope.loginErrorResponse.errorData.userId;
	}
	
	//resetPassword UserID
	$scope.getUserId = function(result) {
		if(result.data && result.data.status=='error' && result.data.errorData.ResponseError[0].errorCode == '8270'){
			$rootScope.userId = result.data.errorData.userId;
		}
		return true;
    };
    
    if(appCon.globalCon.authentication.mode !== 'SSO'){ 
    	document.getElementById('loadingDiv').style.display='none';  
    }
    
    $scope.showCustomerSearchScreen = function() {
		if(! window.focus)return;
		var targetURL;
		var getCustomerSearchURL = appCon.globalCon.customerSearch.url;
		if(getCustomerSearchURL && getCustomerSearchURL != ""){
			targetURL = getCustomerSearchURL;
		}
		var customerSearchWindow=window.open(targetURL,"customerSearchWindow","dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
	};
    
    // after successive login, invoke callback fn for which actorType to check & redirect to specific app.
	$scope.afterLoginCallbackFn = function (result) {
		console.log('afterLoginCallbackFun');
		$rootScope.path = ($location.absUrl()).split('/')[3];
    	if(result.data && result.data.status && result.data.status==='success'){
			if(angular.isDefined(result.data.successData.additionalInformation)){
				$scope.userProfile = result.data.successData.additionalInformation;
				var actorType = (angular.isDefined($scope.userProfile.actorType)) ? $scope.userProfile.actorType : '';
				if(actorType !== '' && actorType === 'BUYR') {
					$scope.goToApp('bdb');
				} else if (actorType !== '' && actorType !== 'BUYR' && actorType !== 'VREP') {
					$scope.goToApp('rm');
				} else {
				// Check if the user needs to show welcome page from autologin.
					var isHideSysMsg = $scope.userProfile.isHideSysMessage;
					if(!isHideSysMsg) {
						var userCredential = $location.search().userCredential;
						var token = $location.search().token;
						if((angular.isDefined(userCredential) && userCredential != '') ||
								(angular.isDefined(token) && token != '')) {
							var e = document.getElementById('ng-app');
							var $injector = angular.element(e).injector();
							authService = $injector.get('authService');
							aclService = $injector.get('aclService');
							authService.requestCurrentUser(true).then(function(){
								authService.setPermissions().then(function(){
									$rootScope.canPerform = aclService.canPerform; 
									$rootScope.canAccess = aclService.canAccess;
										
									appCon.dashboard = _.get(result.data.successData, appCon.globalCon.dashboards.dashboardKey);
									
									/* Set default dashboard landing page if undefined */
									if((appCon.dashboard === 'undefined' || appCon.dashboard === null ) && appCon.globalCon.defaultDashboard !== ''){
										appCon.dashboard = appCon.globalCon.defaultDashboard;
									}
									//appCon.cookie.setItem('dashboard', appCon.dashboard);
									$cookieStore.put('dashboard', appCon.dashboard);
									if(appCon.globalCon.dashboards && appCon.globalCon.dashboards[appCon.dashboard] && appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage){
										$location.path(appCon.globalCon.extAppName+appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage);	
									}else{
										$location.path(appCon.globalCon.extAppName+appCon.globalCon.defaultLandingPage);
									}
								});
							});
							return;
						} else {Analytics.trackPage("/"+$rootScope.path+"/loginNVD/");return true;}
					} else{	Analytics.trackPage("/"+$rootScope.path+"/loginNVD/");return true;}
				}
			} else {Analytics.trackPage("/"+$rootScope.path+"/loginNVD/");return true;}
		} else if(result.data && result.data.status=='error' && result.data.errorData.ResponseError[0].errorCode == '8270'){
			return false;
		} else {Analytics.trackPage("/"+$rootScope.path+"/loginNVD/");return true;}
    };
    
    $scope.goToApp = function (whichApp) {
    	sessionStorage.clear();
		var e = document.getElementById('ng-app');
		var $injector = angular.element(e).injector();
		$cookieStore = $injector.get('$cookieStore');
		$rootScope.afterLoginLoading = true;
			$injector.get('users').logout().then(function () {
				$rootScope.userProfile = false;
				/*appCon.cookie.removeItem('userProfile',appContextPath);
				appCon.cookie.removeItem('dashboard',appContextPath);*/
				$cookieStore.remove('userProfile');
				//$cookieStore.remove('userInfo');
				$cookieStore.remove('dashboard');
				var userCredential = $scope.userProfile.userCredential;
				var vmURL = $scope.userProfile.vmURL;
				if(whichApp==='bdb'){
					var bdbUrl = appCon.globalCon.buyerDash.access.url;
					if (authMode === 'sso'){
						window.location.href=bdbUrl+'/goToDashboard?userCredential='+userCredential;
					}else{
						window.location.href=bdbUrl+'/#/goToDashboard?userCredential='+userCredential;
					}
				}else if(whichApp==='rm'){
					var rmUrl = appCon.globalCon.rm.access.url;
					window.location.href=rmUrl+'/login.do?key='+userCredential;
				}
				return;
			});
    };
    
    var $state, $http, $interval, authService, aclService;
    $scope.resetPassword = function(reset) {
		var resetPasswordForm = document.getElementById("resetPasswordForm");
		disableAll(resetPasswordForm);
        $rootScope.afterLoginLoading = true;
        $injector.get('users')['resetPassword'](reset).then(function(result) {
            if (result.data && result.data.status === 'success') {
                $scope.showResetPassError = false;
                $scope.autoLogin = {};
                $scope.autoLogin.j_username = result.data.successData.userId;
                $scope.autoLogin.j_password = result.data.successData.password;
                $injector.get('users')['login']($scope.autoLogin).then(function(result) {
                    if (result.data && result.data.status === 'success') {
                    	try{
                    		var returnCallback = true;
                    		returnCallback = $scope.afterLoginCallbackFn(result);
							if(angular.isDefined(returnCallback)) {
								authService = $injector.get('authService');
								aclService = $injector.get('aclService');
								//appCon.cookie.setItem('userProfile', JSON.stringify(result.data.successData));
								$cookieStore.put('userProfile', JSON.stringify(result.data.successData));
								//$cookieStore.put('userInfo', result.data.successData);
								authService.requestCurrentUser(true).then(function() {
									authService.setPermissions().then(function() {
										$rootScope.canPerform = aclService.canPerform;
										$rootScope.canAccess = aclService.canAccess;
										appCon.dashboard = _.get(result.data.successData, appCon.globalCon.dashboards.dashboardKey);
										//appCon.cookie.setItem('dashboard', appCon.dashboard);
										$cookieStore.put('dashboard', appCon.dashboard);
										if (appCon.globalCon.dashboards && appCon.globalCon.dashboards[appCon.dashboard] && appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage) {
											$location.path(appCon.globalCon.defaultLandingPage + appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage);
										} else {
											$location.path(appCon.globalCon.defaultLandingPage + appCon.globalCon.defaultLandingPage);
										}
									});
								});
                    		}
						}catch(e){}
                    } else {
						enableAll(resetPasswordForm);
                        $scope.errorMessage = result.data.errorData.ResponseError[0].longMessage;
                        $scope.showResetPassError = true;
                    }
                });
                $scope.disabledBtn = false;
            } else {
				enableAll(resetPasswordForm);
                $scope.errorMessage = result.data.errorData.ResponseError[0].longMessage;
                $scope.showResetPassError = true;
                $scope.disabledBtn = false;
            }
        });
        $rootScope.afterLoginLoading = false;
    };
    
}]);