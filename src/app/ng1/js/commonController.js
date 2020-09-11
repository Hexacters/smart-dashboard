'use strict';
angular.module(appCon.appName).controller('commonController', ['$scope', '$window', '$timeout', '$modal', '$filter', '$injector', '$rootScope', '$state', '$uibModalStack', function ($scope, $window, $timeout, $modal, $filter, $injector, $rootScope, $state, $uibModalStack) {
	$rootScope.footerLink = appCon.globalCon.footer;
	var $translate = $filter('translate');
	$scope.imagecropper = $scope.cropImageFilePath = 'img/noImage.png';
	//today date & dateFormat
	$scope.MMDDYYYY = $filter('date')(new Date(), 'MM/dd/yyyy');
	$rootScope.portalUrl = { url: appCon.globalCon.ghxPortalUrl };

	$scope.fromManageReps = function (value, object) {
		$rootScope.isFromManageReps = value;
		appCon.data.userDetail = {};
		if (value !== true || (angular.isUndefined(object) && value === true)) {
			$rootScope.repAccountDetailsTitle = 'Rep Account Details';
			$rootScope.accountDetailsTitle = 'Account details';
			$rootScope.expressRegistered = false;
			appCon.data.userDetail.userId = $scope.userProfile.userId;
			appCon.data.userDetail.userOid = $scope.userProfile.id;
			appCon.data.userDetail.vendorOid = $scope.userProfile.detail.vendorOid;
			appCon.data.userDetail.vendorDetailOid = $scope.userProfile.detail.vendorDetailOid;
		} else {
			appCon.data.userDetail.userId = object.userId;
			appCon.data.userDetail.userOid = object.userOid;
			appCon.data.userDetail.vendorOid = object.vendorOid;
			appCon.data.userDetail.vendorDetailOid = angular.isDefined(object.vendorDetailOid)
				? object.vendorDetailOid
				: $scope.userProfile.detail.vendorDetailOid;
			appCon.data.userDetail.repLoginURL = object.repLoginURL;
			appCon.data.userDetail.accountsDetailsObj = object;
		}
	};

	$scope.fromAccountDetails = function (value) {
		$rootScope.isFromAccountDetails = value;
	};

	$scope.trackUserEvent = function (actionName) {
		if ($rootScope.userProfile !== undefined && $rootScope.userProfile.detail !== undefined) {
			var eventObject = {
				"category": "User",
				"action": actionName,
				"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#actorOid:" + $rootScope.userProfile.detail.actorOid + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#legalName:" + $rootScope.userProfile.detail.legalName,
				"value": 1
			};
			$rootScope.$emit("callAnalyticsEventTrack", eventObject);
		}
	};

	$scope.todayDate = new Date();
	$scope.refreshBtn = function () {
		$scope.todayDate = new Date();
	};

	$scope.openNewWindow = function (url) {
		var left = screen.width / 4 - 400, top = screen.height / 4 - 250;
		$window.open(url, '', 'top=' + top + ',left=' + left + ',width=600,height=800');
	};

	//Random Number
	$scope.getRandomSpan = function () {
		return Math.floor((Math.random() * 6) + 1);
	};

	//Read More Less content
	$scope.readMore = function (more) {
		$scope.numLimit = more;
		$scope.showLess = true;
	};

	$scope.readLess = function (less) {
		$scope.numLimit = less;
		$scope.showLess = false;
	};

	$scope.changeUsernamePassword = function (type) {
		if (type === 'changePassword') {
			$scope.changePasswordDialog = $modal.open({
				templateUrl: 'views/users/changePassword.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false
			});
		} else {
			$scope.changeUsernameDialog = $modal.open({
				templateUrl: 'views/users/changeUsername.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false
			});
		}
	};

	$scope.changePasswordError = '';
	$scope.changePasswordSuccess = function (result) {
		if (result.data && result.data.status === 'success') {
			$uibModalStack.dismissAll();
			var changePasswordSuccessPopup = $modal.open({
				templateUrl: 'views/users/changePasswordSuccess.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false
			});
		} else {
			$scope.changePasswordError = result.data;
		}
	};

	$scope.changeUsernameError = '';
	$scope.changeUsernameSuccess = function (result) {
		if (result.data && result.data.status === 'success') {
			$uibModalStack.dismissAll();
			var changeUsernameSuccessPopup = $modal.open({
				templateUrl: 'views/users/changeUsernameSuccess.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false
			});
		} else {
			$scope.changeUsernameError = result.data;
		}
	};

	//ShareStaffcredentials param length 0 and less 2 if come means search string is empty
	$scope.$parent.shareStaffParams = function (params) {
		if (params["searchString"].length === 0 || params["searchString"].length >= 3) {
			var valiedString = params["searchString"].length === 0 ? [] : params["searchString"].match(/[{}\[\]<>]/);
			if (valiedString !== null && valiedString.length > 0) {
				$scope.shareStaffCredentialsValidateError = true;
			} else {
				$scope.shareStaffCredentialsValidateError = false;
			}
		} else {
			params["searchString"] = "";
		}
		return params;
	};

	//Dynamic load popup content
	$scope.moreDialog = function (data, title) {
		$scope.modal = {};
		$scope.modal.modalHeading = title;
		$scope.modal.modalBodyContent = data;
		$modal.open({
			templateUrl: 'app/ng1/views/home/moreDialog.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope
		});
	};
	/* shareMyCredentials Checkbox checked & unchecked */
	$scope.shareMyCredentials = [];
	$scope.selectAllCredentials = function (checkStatus, data) {
		$scope.shareMyCredentials = []; //Remove already exist value.
		$scope.credentialsShowError = false;
		if (checkStatus) {
			for (var i = 0, length = data.length; i < length; i++) {
				$scope.shareMyCredentials.push(data[i]);
			}
		}
		else { $scope.shareMyCredentials = []; }
	};
	$scope.shareMyCredentialsValidate = function () {
		if ($scope.shareMyCredentials.length === 0) {
			$scope.credentialsShowError = true;
		}
		else {
			$scope.credentialsShowError = false;
		}
	};
	$scope.selectCredentials = function (status, data) {
		$scope.credentialsShowError = false;
		var credentialsIndex = $scope.shareMyCredentials.indexOf(data);
		if (status) {
			$scope.shareMyCredentials.push(data);
		}
		else {
			$scope.shareMyCredentials.splice(credentialsIndex, 1);
		}
	};
	$scope.paste = function (e) {
		e.preventDefault();
		return false;
	};

	//Set the userOid for ShareCredential
	$scope.goToShareMyCredential = function (userOid, vendorOid) {
		$rootScope.ShareMyCredentialUserOid = userOid;
		$rootScope.ShareMyCredentialVendorOid = vendorOid;
		$state.go('manage.shareCredentials', { 'isFrom': 'manageRep' });
	};

	// NSOR (HOW / WHY) text url replace.
	$scope.nsorTempHowWhyformate = function (param, replaceText) {
		var bcExpired, bcUrl, bcStatus, userOid, mail;
		if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
			bcUrl = 'https://www.backgroundchecks.com/solutions/vendormate';
		} else {
			userOid = appCon.data.userDetail.userOid;
			mail = encodeURIComponent(appCon.data.userDetail.userId);
			if (param.typeCode === 'CBC') {
				bcExpired = param.isCbcExpired;
				bcStatus = angular.lowercase(param.cbcStatus);
				bcUrl = (bcExpired || bcStatus === 'pass' || bcStatus === 'fail') ? appCon.globalCon.background.checks.cbcRenewal : appCon.globalCon.background.checks.cbcRegistration;
			} else {
				bcExpired = param.isNsorExpired;
				bcStatus = angular.lowercase(param.nsorStatus);
				bcUrl = (bcExpired || bcStatus === 'pass' || bcStatus === 'fail') ? appCon.globalCon.background.checks.renewal : appCon.globalCon.background.checks.registration;
			}
			bcUrl += "email=" + mail + "&ReferenceID=" + userOid;
		}
		replaceText = replaceText.replace(/bcUrl/g, "'" + bcUrl + "'");
		return replaceText;
	};

	$scope.setBCObject = function (result) {
		var bcObject;
		$scope.nsorWhyRedirect = '';
		$scope.nsorHowRedirect = '';
		if (result.data.successData.BCDetails) {
			bcObject = result.data.successData.BCDetails;
			$scope.nsorWhyRedirect = $scope.nsorTempHowWhyformate(bcObject[0], (bcObject[0].tempWhy + $translate('nsor.label.nsorRedirectUrlText')));
			$scope.nsorHowRedirect = $scope.nsorTempHowWhyformate(bcObject[0], (bcObject[0].tempHow + $translate('nsor.label.nsorRedirectUrlText')));
		}
	}

	$scope.goToUpdateCardProfile = function () {
		$injector.get('cardServices')['getCardProfile']().then(
			function (result) {
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].shortMessage;
						if ($scope.serviceResponseError === 'CARD PROFILE NOT FOUND') {
							//$state.go('cardProfile.edit',{'cardProfileOid':''});
							$state.go('noCardProfile', {}, { reload: true });
						}
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok') {
						$state.go('cardProfile.view');
					}
				}
			});
	}

	$scope.gaEventAndLogout = function () {
		var eventObject = {
			'category': 'LOGOUT',
			'action': 'USER_LOGOUT',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorOid:' + $rootScope.userProfile.detail.vendorOid + '#userOid:' + $rootScope.userProfile.id + '#localTime:' + new Date().toLocaleDateString() + ' ' + new Date().toTimeString(),
			'value': 1
		};
		$rootScope.$emit('callAnalyticsController', eventObject);
		$timeout(function () {
			$rootScope.logout();
		}, 100);
	};
}]);

// Nsor (HOW / WHY) text redirect url and close popup
var redirectNsorUrl = function (nsorUrl) {
	var homeDocPopup = angular.element($("#commonDocumentAlertCloseIcon")).scope();
	if (angular.isDefined(homeDocPopup)) {
		homeDocPopup.$apply(function () {
			homeDocPopup.cancelDialog();
		})
	}
	var nsorCommonPopup = angular.element($("#nsorCheckDetailPopup")).scope();
	if (angular.isDefined(nsorCommonPopup)) {
		nsorCommonPopup.$apply(function () {
			nsorCommonPopup.$close();
		})
	}
	var moreDialogPopup = angular.element($("#complianceCautionCloseIcon")).scope();
	if (angular.isDefined(moreDialogPopup)) {
		moreDialogPopup.$apply(function () {
			moreDialogPopup.$close();
		})
	}
	window.open(nsorUrl);
};
angular.module(appCon.appName).controller('googleAnalyticsController', ['$scope', '$rootScope', 'Analytics', '$location', function ($scope, $rootScope, Analytics, $location) {
	// By default home tab visible is true.
	$scope.homeInit = function () {
		$rootScope.showHome = true;
	};
	$rootScope.path = ($location.absUrl()).split('/')[3];
	//google analytics page track
	$scope.callGAPageTrack = function (pageName) {
		Analytics.trackPage("/" + $rootScope.path + "/" + pageName + "/");
	};
}]);

angular.module(appCon.appName).controller('appController', ['$scope', '$rootScope', '$injector', '$cookieStore', '$modal', '$window', '$state', '$timeout', function ($scope, $rootScope, $injector, $cookieStore, $modal, $window, $state, $timeout) {
	if (angular.isDefined($rootScope.userProfile) && $rootScope.userProfile.logSignInEventForUser === false) {
		var userProfileCookie = $rootScope.userProfile, userServices = $injector.get("users");
		userServices.logSignInEventForUser().then(function (result) {
			userProfileCookie.logSignInEventForUser = true;
			/*appCon.cookie.removeItem('userProfile');
			appCon.cookie.setItem('userProfile', JSON.stringify(userProfileCookie));*/
			$cookieStore.remove('userProfile');
			$cookieStore.put('userProfile', JSON.stringify(userProfileCookie));
		});
	}

	$injector.get('users')['getBuyerProducts']().then(function (result) {
		if (result.data && result.data.status === 'success') {
			$scope.applicationData = result.data.successData.products;
		}
	});

	var step = 100;
	//Product scroll Up
	$scope.scrollContentTop = function (event) {
		event.preventDefault();
		$("#multiAppContent").animate({
			scrollTop: "-=" + step + "px"
		});
	};

	//Product scroll Down
	$scope.scrollContentBottom = function (event) {
		event.preventDefault();
		$("#multiAppContent").animate({
			scrollTop: "+=" + step + "px"
		});
	};
	$scope.showHideScrollLink = function (event) {
		var scrollDivHeight = $("#multiAppContent ul").height();
		var screenWidth = (angular.isDefined($window.innerWidth) && $window.innerWidth >= 1920) ? 450 : 300;
		if (scrollDivHeight > screenWidth) {
			return true;
		} else {
			return false;
		}
	};

	$scope.goToMedzo = function () {
		if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
			window.open("http://sales-demo.vmcorp/medzo/vendorLoginPage.html");
			return;
		}
		var userToken, userCredential, medzoEntryPointUrl, medzoEntryPointUrlAuthType;
		userToken = $scope.userProfile.token,
			userCredential = $scope.userProfile.userCredential,
			medzoEntryPointUrl = appCon.globalCon.medzo.secure.entryPoint.url,
			medzoEntryPointUrlAuthType = appCon.globalCon.auth.type;
		if ((medzoEntryPointUrlAuthType).toLowerCase() === "token") {
			if (userToken !== '') {
				window.open(medzoEntryPointUrl + "?token=" + userToken + "&destination=VENDOR_VIEW");
			}
		} else if ((medzoEntryPointUrlAuthType).toLowerCase() === "basic") {
			if (userCredential !== '') {
				window.open(medzoEntryPointUrl + "?userCredential=" + userCredential + "&destination=VENDOR_VIEW");
			}
		}
	};
	$scope.goToPcm = function () {
		if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
			window.open("http://sales-demo.vmcorp/pcm/#/buyer/autologin");
			return;
		}
		var userToken, userCredential, crEntryPointUrl, crEntryPointUrlAuthType;
		userToken = $scope.userProfile.token;
		userCredential = $scope.userProfile.userCredential;
		crEntryPointUrl = appCon.globalCon.cr.secure.entryPoint.url;
		crEntryPointUrlAuthType = appCon.globalCon.auth.type;
		if ((crEntryPointUrlAuthType).toLowerCase() === "token") {
			if (userToken !== '') {
				window.open(crEntryPointUrl + "?token=" + userToken + "&destination=vendorOnBoardingHome");
			}
		} else if ((crEntryPointUrlAuthType).toLowerCase() === "basic") {
			if (userCredential !== '') {
				window.open(crEntryPointUrl + "?userCredential=" + userCredential + "&destination=vendorOnBoardingHome");
			}
		}

	};
	//Header popup - near AppNavigation
	$scope.showSystemInformation = function () {
		$modal.open({
			templateUrl: 'views/users/systemInformation.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'commonDialogW65',
			controller: function ($scope, $modalInstance, $sce) {
				$scope.systemInfoUrl = $sce.trustAsResourceUrl($rootScope.$appConfiguration.ghx.systemInfo.url);
				$scope.closeInformation = function () {
					$modalInstance.close();
				};
				$scope.desktopIconFrame = function () {
					document.getElementById('displayloader').style.display = 'none';
				};
			}
		});
	};
	/* Logoff before App Navigation*/
	$scope.clearLocalCookie = function () {
		sessionStorage.clear();
		window.localStorage.removeItem('userPermission_' + appContextPath);
		$cookieStore.remove('userProfile');
		$cookieStore.remove('dashboard');
		$cookieStore.put('userProfile', false);
		$rootScope.userProfile = false;
	};
	/* App Navigation*/
	$scope.changeApp = function (redirectUri) {
		if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
			$window.open("http://sales-demo.vmcorp/medzo/RMLoginPage.html", '_blank');
		} else {
			if (angular.isDefined(appCon.globalCon.authentication.mode) && appCon.globalCon.authentication.mode.toLowerCase() === 'sso') {
				$scope.clearLocalCookie();
				$injector.get('users').logOff().then(function (response) {
					if (response.data && response.data.status === 'success') {
						$rootScope.afterLoginLoading = true;
						$window.location = redirectUri;
						return;
					}
				});
			}
		}
	};

	$scope.formateSCDetails = function (pendingOrderDetails, eventObject) {
		appCon.data.pendingOrderDetails.orderRepCount = $rootScope.getInitialOrderRepCount(pendingOrderDetails);
		$rootScope.orderAmount = appCon.data.itemCatalogSummary[appCon.data.pendingOrderDetails.orderRepCount - 1].amount;
		// calculate currentOrderAmount for incremental payment
		if ($rootScope.orderType.toLowerCase() === 'incremental') {
			var quantity = $rootScope.getInitialOrderRepCount(pendingOrderDetails);
			var amountPerRep = ((appCon.data.itemCatalogSummary[quantity - 1].amount) / quantity);
			var pendingDays = getDaysOfPendingOrder($rootScope.serverTime.serverDateTime, appCon.data.itemElgibility.expirationDate);
			var orderAmount = parseFloat(((amountPerRep / 365) * pendingDays) * appCon.data.itemElgibility.unPaidUsersCount);
			$rootScope.orderAmount = truncateDecimal(orderAmount);
			eventObject.label += "#amountPerRep:" + amountPerRep + "#pendingDays:" + pendingDays;
		} else {
			$rootScope.repCountInSummaryDesc = appCon.data.pendingOrderDetails.orderRepCount;
		}
		// Split pendingRepCount calculations for renewal and others
		if ($rootScope.orderType.toLowerCase() === 'renewal') {
			var deletedRepsCount = angular.isDefined($rootScope.deletedRepsTemp) && ($rootScope.deletedRepsTemp.length > 0) ? $rootScope.deletedRepsTemp.split(",") : '';
			var pendingRepCount = appCon.data.itemElgibility.activeUsersCount - deletedRepsCount.length;
			$rootScope.pendingRepCount = parseInt(appCon.globalCon.openAccessPlan.maxRepCount) - pendingRepCount;
		} else {
			$rootScope.pendingRepCount = parseInt(appCon.globalCon.openAccessPlan.maxRepCount) - appCon.data.itemElgibility.activeUsersCount;
		}
		eventObject.label += "#orderAmount:" + $rootScope.orderAmount;
		appCon.data.pendingOrderDetails.buyupUserCount = (angular.isDefined(pendingOrderDetails.buyupUserCount) && (pendingOrderDetails.buyupUserCount > 0)) ? pendingOrderDetails.buyupUserCount : 0;
	};

	$rootScope.getInitialOrderRepCount = function (pendingOrderDetails) {
		var planCategoryRepCount;
		if ($rootScope.orderType.toLowerCase() === 'incremental') {
			//planCategoryRepCount = parseInt(appCon.data.itemElgibility.activeUsersCount) - parseInt(appCon.data.itemElgibility.unPaidUsersCount);
			planCategoryRepCount = parseInt(appCon.data.itemElgibility.purchasedUserCount);
			$rootScope.repCountInSummaryDesc = parseInt(appCon.data.itemElgibility.unPaidUsersCount);
		} else {
			var categoryDesc = pendingOrderDetails.quantity;
			var str = categoryDesc.split(" ");
			planCategoryRepCount = parseInt(str[0]);
		}

		return planCategoryRepCount;
	};

	$rootScope.showShoppingItemList = function (errorCode) {
		var pendingOrderDetails;
		appCon.data.pendingOrderDetails = {};
		if (errorCode && errorCode !== '') {
			$scope.showShoppingItemDialog(errorCode);
		} else {
			var eventObject = {
				"category": "SHOPPING_CART",
				"action": "GET_ORDER_DETAILS_ICON",
				"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid,
				"value": 1
			};
			$injector.get("users")["getAllPendingOrders"]().then(function (result) {
				if (result.data && result.data.successData && result.data.status === 'success') {
					pendingOrderDetails = result.data.successData.pendingOrderDetails.pendingOrdersList[0];
					appCon.data.orderGrpOid = result.data.successData.pendingOrderDetails.oid;
					appCon.data.isOrderCancelled = false;
					if (angular.lowercase(pendingOrderDetails.orderType) === 'renewal' && angular.lowercase(pendingOrderDetails.itemStatus) === 'pending') {
						appCon.data.isOrderCancelled = result.data.successData.pendingOrderDetails.isOrderCancelled;
					}
					appCon.data.pendingOrderDetails = pendingOrderDetails;
					$rootScope.deletedRepsTemp = angular.isDefined(pendingOrderDetails.deletedUserOids) ? pendingOrderDetails.deletedUserOids : '';
					$rootScope.orderType = pendingOrderDetails.orderType;
					angular.forEach(appCon.data.pendingOrderDetails, function (value, key) {
						eventObject.label += "#" + key + ":" + value;
					});
					eventObject.label += "#orderGrpOid:" + appCon.data.orderGrpOid + "#isOrderCancelled:" + result.data.successData.pendingOrderDetails.isOrderCancelled;
					$scope.formateSCDetails(pendingOrderDetails, eventObject);
					if ($rootScope.orderType.toLowerCase() === 'initial') {
						$scope.showShoppingItemDialog();
					} else if ($rootScope.orderType.toLowerCase() === "renewal" || $rootScope.orderType.toLowerCase() === 'incremental') {
						if ($rootScope.orderType.toLowerCase() === "renewal" && angular.isDefined(pendingOrderDetails.deletedUserOids)) {
							appCon.data.pendingOrderDetails.deletedReps = pendingOrderDetails.deletedUserOids !== '' ?
								pendingOrderDetails.deletedUserOids.split(',') : [];
						}
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						$timeout(function () {
							$rootScope.showRenewalFlow = true;
							showSCLoading(false);
							$state.go('shoppingCart.shoppingCartSummary');
						}, 1000);
					}
				} else {
					eventObject.value = 0;
					eventObject.label += "#errorMessage:" + result.data.errorData.ResponseError[0].longMessage;
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
					$scope.showShoppingItemDialog(result.data.errorData.ResponseError[0].errorCode);
				}
			});
		}
	};


	$scope.showShoppingItemDialog = function (errorCode) {
		$scope.cartItemErrorCode = errorCode && errorCode !== '' ? errorCode : "";
		$modal.open({
			templateUrl: 'views/shoppingCart/shoppingCartItemList.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'commonDialogW65',
			controller: function ($scope, $modalInstance, $state) {
				showSCLoading(false);
				$scope.selectShoppingItem = function () {
					var eventObject = {
						"category": "SHOPPING_CART",
						"action": "GET_ORDER_DETAILS_POPUP",
						"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
						"value": 1
					};
					angular.forEach(appCon.data.pendingOrderDetails, function (value, key) {
						eventObject.label += "#" + key + ":" + value;
					});
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
					$state.go('shoppingCart.shoppingCartSummary');
					$modalInstance.close();
				}
			}
		});
	};

}]);

angular.module(appCon.appName).controller('initController', ['$rootScope', '$injector', '$scope', '$interval', '$location', '$state', '$timeout', function ($rootScope, $injector, $scope, $interval, $location, $state, $timeout) {
	appCon.data.itemElgibility = [];
	$rootScope.shoppingCarIcon = false;
	$rootScope.forceToShoppingCartCheckout = false;
	var eligibilityDetails;
	$timeout(function () {
		$rootScope.userProfile.detail.afterLoginLoading = false;
	//}, 3000);
	console.log('initController', $rootScope.userProfile);
	$rootScope.userProfile.detail.afterLoginLoading = true;
	$rootScope.maxRepCount = parseInt(appCon.globalCon.openAccessPlan.maxRepCount);

	$rootScope.checkShoppingcartEligibility = function (isFrom) {
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "CHECK_ELIGIBLE_LOGIN",
			"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid,
			"value": 1
		}, params = {};

		params.isFromIconClick = false;
		if (angular.isDefined(isFrom) && isFrom === 'SC_ICON') {
			showSCLoading(true);
			params.isFromIconClick = true;
			eventObject.action = "CHECK_ELIGIBLE_ICON";
		}
		$injector.get("users")["checkOpenAccessEligibility"](params).then(function (response) {
			if (response.data && response.data.status === 'success') {
				eligibilityDetails = response.data.successData.eligibilityDetails;
				$rootScope.shoppingCartEnabled = eligibilityDetails.shoppingCartEnabled;
				appCon.data.itemElgibility.activeUsersCount = eligibilityDetails.activeUsersCount;
				appCon.data.itemElgibility.notificationCount = eligibilityDetails.notificationCount;
				appCon.data.itemElgibility.unPaidUsersCount = eligibilityDetails.unPaidUsersCount;
				$rootScope.isUnPaidUser = appCon.data.itemElgibility.unPaidUser = eligibilityDetails.unPaidUser;
				appCon.data.itemElgibility.expirationDate = eligibilityDetails.expirationDate;
				appCon.data.itemElgibility.purchasedUserCount = eligibilityDetails.purchasedUserCount;
				$rootScope.expirationDate = appCon.data.itemElgibility.expirationDate;
				$rootScope.shoppingCarIcon = eligibilityDetails.showShoppingCartIcon;
				$rootScope.orderType = angular.isDefined(eligibilityDetails.orderType) ? eligibilityDetails.orderType : "";
				//$rootScope.showAddNewRep = angular.isDefined(eligibilityDetails.expirationDate) && eligibilityDetails.expirationDate != '' ? true : false;
				angular.forEach(eligibilityDetails, function (value, key) {
					eventObject.label += "#" + key + ":" + value;
				});
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				if (angular.isDefined(isFrom) && isFrom === 'SC_ICON') {
					$scope.showRenewalOrderSummery();
					return;
				}
				$scope.checkCatalogServices();
			} else {
				eventObject.value = 0;
				eventObject.label += "#errorMessage:" + response.data.errorData.ResponseError[0].longMessage;
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				if (angular.isDefined(isFrom) && isFrom === 'SC_ICON') {
					$rootScope.showShoppingItemList(response.data.errorData.ResponseError[0].errorCode, isFrom);
				}
				$rootScope.userProfile.detail.afterLoginLoading = false;
			}
		});
	};

	$scope.showRenewalOrderSummery = function () {
		$injector.get('users')['getAllItemCatalog']({
			'orderType': $rootScope.orderType,
			'fein': $rootScope.userProfile.detail.fein
		}).then(function (response) {
			if (response.data && response.data.status === 'success') {
				appCon.data.itemCatalogSummary = response.data.successData.ItemCatalogSummary;
			}
			$rootScope.showShoppingItemList('');
			$rootScope.userProfile.detail.afterLoginLoading = false;
		});
	}

	$scope.checkCatalogServices = function (details) {
		appCon.data.itemCatalogSummary = {};
		var itemCatalogparam = {
			'orderType': $rootScope.orderType,
			'fein': $rootScope.userProfile.detail.fein
		};

		$injector.get('users')['getAllItemCatalog'](itemCatalogparam).then(function (response) {
			if (response.data && response.data.status === 'success') {
				appCon.data.itemCatalogSummary = response.data.successData.ItemCatalogSummary;
				if (angular.isDefined(appCon.data.itemElgibility.expirationDate) && appCon.data.itemElgibility.unPaidUser === true && appCon.data.itemElgibility.unPaidUsersCount > 0) {
					var eventObject = {
						"category": "SHOPPING_CART",
						"action": "GET_ORDER_DETAILS_LOGIN",
						"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid,
						"value": 1
					};
					$injector.get("users")["getAllPendingOrders"]().then(function (response) {
						if (response.data && response.data.status === 'success') {
							// Force user to Incremental payment.
							var pendingOrderDetails = response.data.successData.pendingOrderDetails.pendingOrdersList[0],
								quantity, amountPerRep, pendingDays, orderAmount;
							appCon.data.orderGrpOid = response.data.successData.pendingOrderDetails.oid;
							appCon.data.isOrderCancelled = false;
							if (angular.lowercase(pendingOrderDetails.orderType) === 'renewal' && angular.lowercase(pendingOrderDetails.itemStatus) === 'pending') {
								appCon.data.isOrderCancelled = response.data.successData.pendingOrderDetails.isOrderCancelled;
							}
							appCon.data.pendingOrderDetails = pendingOrderDetails;
							$rootScope.orderType = pendingOrderDetails.orderType;
							quantity = $rootScope.getInitialOrderRepCount(pendingOrderDetails);
							//$rootScope.repCountInSummaryDesc = quantity; 
							amountPerRep = ((appCon.data.itemCatalogSummary[quantity - 1].amount) / quantity);
							pendingDays = getDaysOfPendingOrder($rootScope.serverTime.serverDateTime, appCon.data.itemElgibility.expirationDate);

							// calculate currentOrderAmount for incremental payment
							orderAmount = parseFloat(((amountPerRep / 365) * pendingDays) * appCon.data.itemElgibility.unPaidUsersCount);
							$rootScope.orderAmount = truncateDecimal(orderAmount);

							eventObject.label += "#amountPerRep:" + amountPerRep + "#pendingDays:" + pendingDays + "#orderAmount:" + $rootScope.orderAmount;
							angular.forEach(pendingOrderDetails, function (value, key) {
								eventObject.label += "#" + key + ":" + value;
							});
							eventObject.label += "#orderGrpOid:" + appCon.data.orderGrpOid + "#isOrderCancelled:" + response.data.successData.pendingOrderDetails.isOrderCancelled;
							$rootScope.$emit("callAnalyticsEventTrack", eventObject);
							$state.go('shoppingCart.shoppingCartSummary');
							$rootScope.forceToShoppingCartCheckout = true;
							$timeout(function () {
								$rootScope.userProfile.detail.afterLoginLoading = false;
							}, 3000);
						} else {
							eventObject.value = 0;
							eventObject.label += "#errorMessage:" + response.data.errorData.ResponseError[0].longMessage;
							$rootScope.$emit("callAnalyticsEventTrack", eventObject);
							$rootScope.userProfile.detail.afterLoginLoading = false;
						}
					});
				} else {
					$rootScope.userProfile.detail.afterLoginLoading = false;
				}
			} else {
				$rootScope.userProfile.detail.afterLoginLoading = false;
			}
		});
	};

	$rootScope.blockedMessage = '';
	$rootScope.isSupplierBlocked = false;
	$scope.isSupplierBlockLoading = true;
	$rootScope.portalUrl = { url: appCon.globalCon.ghxPortalUrl };
	$injector.get('dashboardServices')['getUserByUserName']().then(function (result) {
		$scope.isSupplierBlockLoading = false;
		if (result.data && result.data.successData && result.data.successData.Status === 'Ok') {
			$rootScope.isSupplierBlocked = result.data.successData.detail.isSupplierBlocked;
			$rootScope.blockedMessage = result.data.successData.detail.blockedMessage;
			if (angular.isDefined($rootScope.isSupplierBlocked) && $rootScope.isSupplierBlocked === true) {
				if (angular.isDefined($rootScope.userProfile) && $rootScope.userProfile.detail) {
					$rootScope.userProfile.detail.afterLoginLoading = false;
				}
				var eventObject = {
					"category": "SUPPLIER_BLOCKED",
					"action": "GET_SUPPLIER_BLOCKED_DETAILS",
					"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#actorOid:" + $rootScope.userProfile.detail.actorOid + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#legalName:" + $rootScope.userProfile.detail.legalName,
					"value": 1
				};
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				return;
			} else {
				$rootScope.userProfile.detail.appMessage = result.data.successData.detail.appMessage;
				$rootScope.userProfile.detail.isAppMessageConfigured = result.data.successData.detail.isAppMessageConfigured;
				$rootScope.isSupplierBlocked = false;
				$timeout(function () {
					//$state.go('home');
					$rootScope.checkShoppingcartEligibility();
					$scope.getAppConfigProperties();
				}, 300);
			}
		} else {
			$rootScope.isSupplierBlocked = false;
			$timeout(function () {
				$state.go('home');
				$rootScope.checkShoppingcartEligibility();
				$scope.getAppConfigProperties();
			}, 300);
			var eventObject = {
				"category": "USER_BY_USERNAME",
				"action": "GET_USER_BY_USERNAME_ERROR",
				"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#actorOid:" + $rootScope.userProfile.detail.actorOid + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#legalName:" + $rootScope.userProfile.detail.legalName + "#errorCode:" + result.data.errorData.ResponseError[0].errorCode + "errorMessage" + result.data.errorData.ResponseError[0].longMessage,
				"value": 0
			};
			$rootScope.$emit("callAnalyticsEventTrack", eventObject);
		}
	});

	$scope.getAppConfigProperties = function () {
		var params = { 'propertyName': 'supplier.iframe.enabled' };
		appCon.globalCon.iframe = {};
		$injector.get('users')['getAppConfigPropByName'](params).then(function (result) {
			if (result.data && result.data.status === 'success') {
				$rootScope.isIframeEnabled = result.data.successData.propertyValue;
				appCon.globalCon.iframe.enabled = result.data.successData.propertyValue;
			} else {
				$rootScope.isIframeEnabled = appCon.globalCon.iframe.enabled = 'true';
				var eventObject = {
					'category': 'CONFIG_PROP_BY_NAME',
					'action': 'GET_APP_CONFIG_PROP_BY_NAME_ERROR',
					'label': 'email:' + $rootScope.userProfile.detail.userName + '#userOid:' + $rootScope.userProfile.id + '#actorOid:' + $rootScope.userProfile.detail.actorOid + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorOid:' + $rootScope.userProfile.detail.vendorOid + '#legalName:' + $rootScope.userProfile.detail.legalName + '#errorCode:' + result.data.errorData.ResponseError[0].errorCode + 'errorMessage' + result.data.errorData.ResponseError[0].longMessage,
					'value': 0
				};
				$rootScope.$emit('callAnalyticsEventTrack', eventObject);
			}
		});
	};

	var shoppingCartServices = $injector.get('shoppingCartServices');

	$rootScope.getBillingCountryLookups = function () {
		var countryParam = { 'isVision': 'true', "categories": "COUNTRIES" };
		if (!angular.isDefined($rootScope.billingCountryLookup) || ($rootScope.billingCountryLookup).length === 0) {
			$rootScope.billingCountryLookup = [];
			shoppingCartServices.getAllLookupsByCategories(countryParam).then(function (result) {
				if (result.data && result.data.status === 'success') {
					var countryList = result.data.successData.lookups.COUNTRIES;
					$rootScope.billingCountryLookup = _.filter(countryList, function (o) { return (o.code === 'US' || o.code === 'CA'); });
					$scope.getBillingStateLookup();
				}
			});
		} else if (!angular.isDefined($rootScope.billingStateLookup) || ($rootScope.billingStateLookup).length === 0) {
			$scope.getBillingStateLookup();
		}
	};

	$scope.getBillingStateLookup = function () {
		var countryParam = { 'isVision': 'true', "categories": "STATES" }, disableLable = "- - - - - - - - - - - - - - - - - - - - - ";
		$rootScope.billingStateLookup = [];
		shoppingCartServices.getAllLookupsByCategories(countryParam).then(function (result) {
			if (result.data && result.data.status === 'success') {
				var stateUS = [[], []], stateCA = [{ "name": disableLable, disabled: true, _id: 1002 }], stateLookup;
				stateLookup = result.data.successData.lookups.STATES;
				angular.forEach(stateLookup, function (value, key) {
					if (value.seqNumber <= 50 && value.parentId === 'COUNTRY_US') {
						stateUS[0].push(value);
						if (value.seqNumber === 50) stateUS[0].push({ "name": disableLable, disabled: true, _id: 1001 });
					} else if (value.seqNumber >= 51 && value.parentId === 'COUNTRY_US') {
						stateUS[1].push(value);
					} else if (value.parentId === 'COUNTRY_CA') {
						stateCA.push(value);
					}
				});
				stateUS = stateUS[0].concat(stateUS[1]);
				$rootScope.billingStateLookup = stateUS.concat(stateCA);
			}
		});
	};

	var userServices = $injector.get("users");
	var saluationParam = { "category": "SALUTATION" };
	if ($rootScope.userProfile !== undefined && $rootScope.userProfile.detail !== undefined) {
		var eventObject = {
			"category": "User",
			"action": "Login",
			"label": "email:" + $rootScope.userProfile.detail.userName + "#userOid:" + $rootScope.userProfile.id + "#actorOid:" + $rootScope.userProfile.detail.actorOid + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#legalName:" + $rootScope.userProfile.detail.legalName + "#isForLogin:" + $rootScope.userProfile.detail.isForLogin,
			"value": 1
		};
		$rootScope.$emit("callAnalyticsEventTrack", eventObject);
	}
	userServices.getLookups(saluationParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.saluationLookup = result.data.successData.SALUTATION;
		}
	});
	var countryParam = { "category": "COUNTRY" };
	userServices.getLookups(countryParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.countryLookup = result.data.successData.COUNTRY;
		}
	});

	/** get the stateLookupValues depends on the countryCode **/
	$rootScope.updateStateDropDown = function (value) {
		var stateArray, countryCode = "COUNTRY_";
		countryCode += (angular.isDefined(value) && value !== '') ? angular.uppercase(value) : 'US';
		stateArray = _.filter($rootScope.internationalStates, _.matches({ 'parentId': countryCode }));
		$rootScope.internationalStatesLookup = stateArray;
	};

	/** Getting the International state lookup for "Company Contact Information" **/
	var countryParam = { 'isVision': 'true', 'categories': 'STATES' };
	userServices.getAllLookupsByCategories(countryParam).then(function (result) {
		if (result.data && result.data.successData && angular.lowercase(result.data.status) === 'success') {
			$rootScope.internationalStates = result.data.successData.lookups.STATES;
			$scope.updateStateDropDown('US');
		}
	});

	var monthList = { "category": "MONTH" };
	userServices.getLookups(monthList).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.monthLookup = result.data.successData.MONTH;
		}
	});
	var vendorTypeOfBusiness = { "category": "VENDOR_TYPE_OF_BUSINESS" };
	userServices.getLookups(vendorTypeOfBusiness).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.vendorBusinessLookup = result.data.successData.VENDOR_TYPE_OF_BUSINESS;
		}
	});
	var ediCapableParam = { "category": "EDI_CAPABLE" };
	userServices.getLookups(ediCapableParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.ediCapabilitiesLookup = result.data.successData.EDI_CAPABLE;
		}
	});
	var failedBidsParam = { "category": "FAILED_BID" };
	userServices.getLookups(failedBidsParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.failedBidsLookup = result.data.successData.FAILED_BID;
		}
	});
	/*  SalesTerritory Multi Selector Lookup 
	Begin { */
	//Step One
	var stateParam = { "category": "STATE" };
	userServices.getLookups(stateParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.stateLookup = result.data.successData.STATE;
		}
	});
	//Step Two
	var stateCanParam = { "category": "STATE_CAN" };
	userServices.getLookups(stateCanParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.stateCanLookup = result.data.successData.STATE_CAN;
			//Step Three
			var stateUsOtherParam = { "category": "STATE_US_OTHER" };
			userServices.getLookups(stateUsOtherParam).then(function (result) {
				if (result.data && result.data.status === 'success') {
					$rootScope.stateUsOtherLookup = result.data.successData.STATE_US_OTHER;
					var result = $rootScope.stateCanLookup.concat($rootScope.stateUsOtherLookup);
					$rootScope.salesTerritoryLookup = $rootScope.stateLookup.concat(result);
				}
			});
		}
	});
	/* }
	Finished */
	var certificationAgencyParam = { "category": "CERTIFICATION_AGENCY" };
	userServices.getLookups(certificationAgencyParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.certificationAgencyLookup = result.data.successData.CERTIFICATION_AGENCY;
			$rootScope.certificationAgencyLookup.push({ "value": "other", "label": "Other" });
		}
	});
	var minorityTypeParam = { "category": "MINORITY_TYPE" };
	userServices.getLookups(minorityTypeParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.minorityTypeLookup = result.data.successData.MINORITY_TYPE;
		}
	});
	var timeZoneParam = { "category": "TIME_ZONE" };
	userServices.getLookups(timeZoneParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.timeZoneLookup = result.data.successData.TIME_ZONE;
		}
	});
	var timeZoneGmtParam = { "category": "TIME_ZONE_GMT" };
	userServices.getLookups(timeZoneGmtParam).then(function (result) {
		if (result.data && result.data.status === 'success') {
			$rootScope.timeZoneGmtLookup = result.data.successData.TIME_ZONE_GMT;
		}
	});
	$scope.getServerDateTimeInterval = function () {
		userServices.getServerDateAndTime().then(function (result) {
			$rootScope.serverTime = [];
			if (result.data && result.data.status === 'success') {
				var serverDateTimeValue, serverDateTimeArray, serverYear, serverMonth, serverDay, serverHours, serverMinutes, serverSeconds, serverMilliseconds, serverLiveDateTime;
				$rootScope.serverTime.serverTimezoneOffet = result.data.successData.serverTimezoneOffet;
				$rootScope.serverTime.TZ001 = result.data.successData.TZ001;
				$rootScope.serverTime.TZ002 = result.data.successData.TZ002;
				$rootScope.serverTime.TZ003 = result.data.successData.TZ003;
				$rootScope.serverTime.TZ004 = result.data.successData.TZ004;
				$rootScope.serverTime.TZ009 = result.data.successData.TZ009;
				$rootScope.serverTime.TZ013 = result.data.successData.TZ013;
				$rootScope.serverTime.serverTimezoneValue = result.data.successData.serverTimezoneValue;
				serverDateTimeValue = result.data.successData.serverDateTime;
				serverDateTimeArray = serverDateTimeValue.split("/");
				serverYear = parseInt(serverDateTimeArray[2], 10);
				serverMonth = parseInt(serverDateTimeArray[0], 10) - 1;
				serverDay = parseInt(serverDateTimeArray[1], 10);
				serverHours = parseInt(serverDateTimeArray[3], 10);
				serverMinutes = parseInt(serverDateTimeArray[4], 10);
				serverSeconds = parseInt(serverDateTimeArray[5], 10);
				serverMilliseconds = parseInt(serverDateTimeArray[6], 10);
				serverLiveDateTime = new Date(serverYear, serverMonth, serverDay, serverHours, serverMinutes, serverSeconds, serverMilliseconds);
				if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
					serverLiveDateTime = new Date();
				}
				$rootScope.serverTime.serverDateTime = serverLiveDateTime;
			}
		});
	};
	$scope.getServerDateTimeInterval();

	//get server live date and time for every one minute.
	$scope.serverLiveDateTimeLoad = function () {
		var serverLiveDateTime = new Date($rootScope.serverTime.serverDateTime);
		serverLiveDateTime.setMinutes(parseInt(serverLiveDateTime.getMinutes(), 10) + 1);
		$rootScope.serverTime.serverDateTime = serverLiveDateTime;
	}
	$interval($scope.serverLiveDateTimeLoad, 60000);
	$rootScope.path = ($location.absUrl()).split('/')[3];

	/** Delete ManageReps retain filter and Default radio button select */
	delete appCon.data.accessRepSearchParam;
	delete appCon.data.accessRep;

	$scope.setSupportUrl = function () {
		var url = appCon.globalCon.footer.salesforce.support.url + '?token=' + appCon.globalCon.footer.salesforce.support.token;
		if (angular.isDefined($scope.userProfile) && $scope.userProfile !== '') {
			url += angular.isDefined($scope.userProfile.name) && $scope.userProfile.name !== '' ? "&cfn=" + encodeURIComponent($scope.userProfile.name) : '';
			url += angular.isDefined($scope.userProfile.userId) && $scope.userProfile.userId !== '' ? "&cem=" + encodeURIComponent($scope.userProfile.userId) : '';
			if (angular.isDefined($scope.userProfile.detail) && $scope.userProfile.detail !== '') {
				url += angular.isDefined($scope.userProfile.detail.legalName) && $scope.userProfile.detail.legalName !== '' ? "&cmp=" + encodeURIComponent($scope.userProfile.detail.legalName) : '';
				url += angular.isDefined($scope.userProfile.detail.phone) && $scope.userProfile.detail.phone !== '' ? "&cph=" + encodeURIComponent($scope.userProfile.detail.phone) : '';
			}
		}
		appCon.data.supportUrl = url;
	};

	$scope.setSupportUrl();
}, 5000);
}]);
angular.module(appCon.appName).filter('dateFormate', ['$sce', function ($sce) {
	return function (input) {
		if (input) {
			input = input.split("-").join("/");
			input = new Date(input);
		}
		return input;
	};
}]);
angular.module(appCon.appName).config(['$validationProvider', function ($validationProvider) {

	var expression = {
		validateExpirationDate: function (value, scope, element, attrs) {
			value = _.trim(value);
			var effectiveDate = angular.isDefined(attrs.effectiveDate) ? attrs.effectiveDate : '';
			if (value && effectiveDate) {
				if (new Date(value) < new Date(effectiveDate)) {
					return false;
				} else {
					return true;
				}
			} else if (value && !effectiveDate) {
				if (new Date() > new Date(effectiveDate)) {
					return false;
				} else {
					return true;
				}
			}
		},
		validateGreaterthanTodayDate: function (value, scope, element, attrs) {
			value = _.trim(value);
			var todayDate = $.datepicker.formatDate("mm/dd/yy", new Date());
			var inputVal = $.datepicker.formatDate("mm/dd/yy", new Date(value));
			if (value) {
				if (new Date(todayDate) >= new Date(inputVal) || new Date(todayDate).valueOf() === new Date(inputVal).valueOf()) {
					return false;
				} else {
					return true;
				}
			}
		},
		validateCustomField: function (value, scope, element, attrs) {
			value = _.trim(value);
			var customValidate = angular.isDefined(attrs.customValidate) ? attrs.customValidate : '';
			customValidate = customValidate.split(',');
			if ((value !== '' && (customValidate[0] === '' || customValidate[1] === '')) ||
				(value === '' && customValidate[0] === '' && customValidate[1] === '') ||
				(value !== '' && customValidate[0] !== '' && customValidate[1] !== '')) {
				return true;
			} else {
				return false;
			}
		},
		validateYear: function (value) {
			value = _.trim(value);
			if (value < 1000) {
				return false;
			} else {
				return true;
			}
		},
		validateYearValidation: function (value) {
			var currYear = new Date().getFullYear();
			value = _.trim(value);
			if (value > currYear) {
				return false;
			} else {
				return true;
			}
		},
		validateZero: function (value) {
			value = _.trim(value);
			value = value !== '' ? Number(value) : '';
			if ((value === 0 || value === '0') && value !== '') {
				return false;
			} else {
				return true;
			}
		},
		validateWebsiteURL: function (value, scope, element, attrs) {
			value = _.trim(value);
			return value.length > 0 ? value.match(/^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|(www\.)?){1}[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s\,\{\}\\|\\\^\[\]]+)?/i) : true;

		},
		validateUploadRequired: function (value, scope, element, attrs) {
			value = _.trim(value);
			var uploadRequired = angular.isDefined(attrs.uploadRequired) ? attrs.uploadRequired : '';
			var uploadRequiredMongo = angular.isDefined(attrs.uploadRequiredMongo) ? attrs.uploadRequiredMongo : '';
			var uploadRequiredFile = angular.isDefined(attrs.uploadRequiredFile) ? attrs.uploadRequiredFile : '';
			if ((uploadRequired === "false" || uploadRequiredMongo === '' || uploadRequiredFile === '') && !!value === false) {
				return false;
			} else {
				return true;
			}
		},
		validateCustomDob: function (value, scope, element, attrs) {
			value = _.trim(value);
			var date = value;
			if (date !== undefined && date !== '') {
				var last = date.length;
				var res = date.substring(last - 1, last);
				if (res !== '/') {
					var yearFormat = date.split("/");
					if (yearFormat.length > 1) {
						if (yearFormat[0].length === 2 && yearFormat[1].length === 2 && !yearFormat[2]) {
							if (yearFormat[0] > 0 && yearFormat[0] <= 12 && yearFormat[1] > 0 && yearFormat[1] <= 31) {
								return true;
							} else {
								return false;
							}
						} else if (angular.isDefined(yearFormat[2]) && yearFormat[0] > 0 && yearFormat[0] <= 12 && yearFormat[1] > 0 && yearFormat[1] <= 31 && yearFormat[0].length === 2 && yearFormat[1].length === 2 && (yearFormat[2].length === 4) && yearFormat[2] <= new Date().getFullYear()) {
							if (yearFormat[2].length === 4 && yearFormat[2] > 1000) {
								var now = dateFormat(new Date(), 'mm/dd/yyyy');
								if (new Date(value) > new Date(now)) {
									return false;
								} else {
									return true;
								}
							} else if (yearFormat[2] < 1 && yearFormat[2] < 1000 && yearFormat[2].length === 1 && yearFormat[2].length === 3 && yearFormat[2].length < 4) {
								return false;
							} else if (yearFormat[2] > 0 && yearFormat[2] >= 1000 && yearFormat[0].length === 2 && yearFormat[1].length === 2 && yearFormat[2].length === 4) {
								return true;
							}
						} else {
							return false;
						}
					}
				} else {
					return false;
				}
			} else {
				return true;
			}
		},
		validateFuture: function (value) {
			value = _.trim(value);
			var now = dateFormat(new Date(), 'mm/dd/yyyy');
			if (new Date(value) < new Date(now)) {
				return false;
			} else {
				return true;
			}
		},
		validateZipCode: function (value, scope, element, attrs) {
			value = _.trim(value);
			var zipcodeFormat = angular.isDefined(attrs.zipcodeFormat) ? attrs.zipcodeFormat : '';
			if (zipcodeFormat === 'CA') {
				return value.length > 0 ? value.match(/^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1}\s\d{1}[A-Z]{1}\d{1}$/) : true;
			} else if (zipcodeFormat === 'US') {
				return value.length > 0 ? value.match(/^\d{5}(-\d{4})?$/) : true;
			}
		},
		validateGpo: function (value, scope, element, attrs) {
			value = _.trim(value);
			var customValidate = angular.isDefined(attrs.customValidate) ? attrs.customValidate : ",";
			customValidate = customValidate.split(',');
			if (value !== '' || customValidate[0] !== '' || customValidate[1] === 'true') {
				return true;
			} else {
				return false;
			}
		},
		validateFoundedDate: function (value, scope, element, attrs) {
			value = _.trim(value);
			var customValidate = angular.isDefined(attrs.customValidate) ? attrs.customValidate : '';
			customValidate = customValidate.split(',');
			var today = new Date();
			if (customValidate[0] === 'month' && customValidate[1] > 999) {
				var founded = new Date(customValidate[1], value - 1, 0);
				if (founded < today) {
					return true;
				} else {
					return false;
				}
			} else if (customValidate[0] === 'year') {
				if (value > 999) {
					var founded = new Date(value, customValidate[1] - 1, 0);
					if (founded < today) {
						return true;
					} else {
						return false;
					}
				}
			}
		},
		validateDateWithYear: function (value) {
			var text = _.trim(value);
			if (text) {
				var regEx1 = RegExp("(\\d{1,2}\/\\d{1,2}\/\\d{2,4})$");
				var regEx2 = RegExp("(\\d{1,2}-\\d{1,2}-\\d{2,4})$");
				var regEx3 = RegExp("(\\d{1,2}\\.\\d{1,2}\\.\\d{2,4})$");
				var regEx4 = RegExp("(\\d{1,2}\\s\\d{1,2}\\s\\d{2,4})$");
				var regEx5 = RegExp("(\\d{1,2}\/\\d{1,2})$");
				var regEx6 = RegExp("(\\d{1,2}-\\d{1,2})$");
				var regEx7 = RegExp("(\\d{1,2}\\.\\d{1,2})$");
				var regEx8 = RegExp("(\\d{1,2}\\s\\d{1,2})$");
				var flag = false;
				if (regEx1.test(text) || regEx2.test(text) || regEx3.test(text) || regEx4.test(text)) {
					flag = true;
				} else if (regEx5.test(text)) {
					if (!text.match(/[\s\.-]/)) {
						flag = true;
					}
				} else if (regEx6.test(text)) {
					if (!text.match(/[\s\.\/]/)) {
						flag = true;
					}
				} else if (regEx7.test(text)) {
					if (!text.match(/[\s-\/]/)) {
						flag = true;
					}
				} else if (regEx8.test(text)) {
					if (!text.match(/[\.-\/]/)) {
						flag = true;
					}
				}
				if (!flag) {
					return flag;
				}
				var dob;
				if (text.indexOf("/") !== -1) {
					dob = text.split("/");
				} else if (text.indexOf("-") !== -1) {
					dob = text.split("-");
					text = text.replace(/-/g, "/");
				} else if (text.indexOf(" ") !== -1) {
					dob = text.split(" ");
				} else if (text.indexOf(".") !== -1) {
					dob = text.split(".");
					text = text.replace(/\./g, "/");
				}
				var year;
				var dobMonth = dob[0];
				var dobDay = dob[1];
				if (dob[2] && dob[2] !== "") { //&& (dob[2].length === 4 || dob[2].length === 2)) {
					year = dob[2];
					year = parseInt(year, 10);
					if (year < 1000) {
						return false;
					}
				}
				if (!year) {
					var mydate = new Date();
					year = mydate.getFullYear() - 1;
				} else {
					var mydate = new Date(year, dobMonth - 1, dobDay);
					year = mydate.getFullYear();
				}
				var current_date = new Date();
				var current_month = current_date.getMonth() + 1;
				var current_day = current_date.getDate();
				if (year > current_date.getFullYear()) {
					return false;
				}
				if ((year > current_date.getFullYear() || year === current_date.getFullYear()) && dobMonth > current_month) {
					return false;
				}
				if (year === current_date.getFullYear()) {
					if ((dobMonth === current_month) && (dobDay > current_day)) {
						return false;
					}
				}
				var validDate = true;
				var daysArr = new Array();
				for (var i = 1; i <= 12; i++) {
					daysArr[i] = 31;
					if (i === 4 || i === 6 || i === 9 || i === 11) {
						daysArr[i] = 30;
					}
					if (i === 2) {
						daysArr[i] = 29;
					}
				}
				if (dobDay < 1 || dobDay > 31 || (dobMonth > 12 || dobMonth < 1) || (year === 0) || (dobMonth === 2 && dobDay > (((year % 4 === 0) && ((!(year % 100 === 0)) || (year % 400 === 0))) ? 29 : 28)) || dobDay > daysArr[dobMonth]) {
					var validDate = false;
				}
				return validDate;
			} else {
				return true;
			}
		},
		validateDouble: function (value, scope, element, attrs) {
			var customValidateFrom = angular.isDefined(attrs.customValidateFrom) ? attrs.customValidateFrom : '';
			customValidateFrom = customValidateFrom.split(',');
			value = _.trim(value);
			if (value === '') {
				if (customValidateFrom.length > 0) {
					if (customValidateFrom[0] === 'companyProfile') {
						scope.data.VendorDetail.largestContractAmountStr = value;
					} else if (customValidateFrom[0] === 'documents') {
						if (customValidateFrom[1] === 'docMinimumValue') {
							scope.$parent.$parent.data.DocumentDetailSummary.docMinimumValue = value;
						} else if (customValidateFrom[1] === 'docMaximumValue') {
							scope.$parent.$parent.data.DocumentDetailSummary.docMaximumValue = value;
						}
					}
				}
				return true;
			} else {
				if (validateNumberWithDollar(value)) {
					return false;
				}
				value = dollarWithNumberFormatConvert(value);
				if (value.length > 15 && value.indexOf(".") >= 13) {
					value = value.substring(0, value.indexOf("."));
				}
				if (value.length > 15) {
					return false;
				} else {
					if (customValidateFrom.length > 0) {
						if (customValidateFrom[0] === 'companyProfile') {
							scope.data.VendorDetail.largestContractAmountStr = value;
						} else if (customValidateFrom[0] === 'documents') {
							if (customValidateFrom[1] === 'docMinimumValue') {
								scope.$parent.$parent.data.DocumentDetailSummary.docMinimumValue = value;
							} else if (customValidateFrom[1] === 'docMaximumValue') {
								scope.$parent.$parent.data.DocumentDetailSummary.docMaximumValue = value;
							}
						}
					}
					return true;
				}
			}
		},
		validateDigits: function (value, scope, element, attrs) {
			value = _.trim(value);
			if (!checkIsDigit(value) && value !== '') {
				return false;
			} else {
				return true;
			}
		},
		validateAdditionalRepCount: function (value, scope, element, attrs) {
			value = _.trim(value);
			value = value !== '' ? Number(value) : '';
			var pendingRep = angular.isDefined(attrs.pendingRepCount) ? Number(attrs.pendingRepCount) : 0;
			if (value > pendingRep && value !== '') {
				return false
			} else if (value <= pendingRep && value !== '') {
				return true;
			}
		},
		validateNegative: function (value) {
			value = _.trim(value);
			value = value !== '' ? Number(value) : '';
			if ((value < 0) && value !== '') {
				return false;
			} else {
				return true;
			}
		},
	};
	var defaultMsg = {
		validateExpirationDate: {
			error: 'End Date should be greater than start date',
			success: 'Success!'
		},
		validateCustomField: {
			error: 'Fail',
			success: 'Success!'
		},
		validateYear: {
			error: 'Invalid Number Format.',
			success: 'Success!'
		},
		validateYearValidation: {
			error: 'Invalid Number Format.',
			success: 'Success!'
		},
		validateZero: {
			error: 'Please enter a numeric value greater than 0.',
			success: 'Success!'
		},
		validateWebsiteURL: {
			error: 'Invalid URL',
			success: 'Success!'
		},
		validateGreaterthanTodayDate: {
			error: 'Date should be greater or equal than today date',
			success: 'Success!'
		},
		validateUploadRequired: {
			error: 'Upload is Required',
			success: 'Success!'
		},
		validateCustomDob: {
			error: 'Not a valid Date format. Please re-enter.',
			success: 'Success!'
		},
		validateFuture: {
			error: 'Please select the future date.',
			success: 'Success!'
		},
		validateZipCode: {
			error: 'Invalid Zip Code',
			success: 'Success!'
		}, validateGpo: {
			error: 'Must select at least one',
			success: 'Success!'
		}, validateFoundedDate: {
			error: 'Founded month and year must be less than or equal to current month and Year.',
			success: 'Success!'
		},
		validateDateWithYear: {
			error: 'Not a valid Date format. Please re-enter.',
			success: 'Success!'
		},
		validateDouble: {
			error: 'Invalid Number Format.',
			success: 'Success!'
		},
		validateDigits: {
			error: 'No of employees must be numeric.',
			success: 'Success!'
		},
		validateAdditionalRepCount: {
			error: 'No of Rep Exceeded.',
			success: 'Success!'
		},
		validateNegative: {
			error: 'Please enter a numeric value greater than or equal 0.',
			success: 'Success!'
		},
	};
	$validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
	$validationProvider.showSuccessMessage = false; // or true(default)
	$validationProvider.showErrorMessage = true; // or true(default)

	function validateNumberWithDollar(text) {
		text = text.replace(/[$]/g, "");
		text = text.replace(/[,]/g, "");
		if (text.indexOf("(") !== -1) {
			if (text.indexOf(")") !== -1) {
				text = text.replace(/[(]/g, "-");
			} else {
				return true;
			}
		}
		text = text.replace(/[)]/g, "");
		var dot = text.indexOf(".");
		if (dot !== -1) {
			var dotArr = text.split(".");
			if (dotArr.length >= 3) {
				text = dotArr[0] + "." + dotArr[1];
			}
		}
		if (!text.match(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/)) {
			return true;
		}
		return false;
	}
	function dollarWithNumberFormatConvert(text) {
		text = text.replace(/[$]/g, "");
		text = text.replace(/[,]/g, "");
		if (text.indexOf("(") !== -1) {
			if (text.indexOf(")") !== -1) {
				text = text.replace(/[(]/g, "-");
			}
		}
		text = text.replace(/[)]/g, "");
		var dot = text.indexOf(".");
		if (dot !== -1) {
			var dotArr = text.split(".");
			if (dotArr.length >= 3) {
				text = dotArr[0] + "." + dotArr[1];
			}
		}
		return text;
	}
	function checkIsDigit(text) {
		if ((text.indexOf("-") !== -1) || (text.indexOf(".") !== -1)) {
			return false;
		} else if (!text.match(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/)) {
			return false;
		}
		return true;
	}
}]);


/****
 *Local time Stamp for sign in a vendor 
 ***/

function localTimeStamp() {
	var currentDate = new Date();
	//get the four position year and make it a string
	var currentYear = currentDate.getFullYear() + "";
	//document.form1.localTime.value = currentYear;
	//get the zero-indexed month and add 1
	//for the real month and make it a strintg
	var currentMonth = padout(currentDate.getMonth() + 1) + "";
	//document.form1.localTime.value = currentYear + '/' + currentMonth;
	//get the current day of the month and make it a string
	var currentDayOfMonth = padout(currentDate.getDate()) + "";
	//document.form1.localTime.value = currentYear + '/' + currentMonth + '/' + currentDayOfMonth;
	//get the current hour and make it a string
	var currentHour = padout(currentDate.getHours()) + "";
	//document.form1.localTime.value = currentYear + '/' + currentMonth + '/' + currentDayOfMonth + ' ' + currentHour;
	//get the current minute and make it a string
	var currentMinute = padout(currentDate.getMinutes()) + "";
	//document.form1.localTime.value = currentYear + '/' + currentMonth + '/' + currentDayOfMonth + ' ' + currentHour + ':' + currentMinute;
	//get the current second and make it a string
	var currentSecond = padout(currentDate.getSeconds()) + "";
	return (currentYear + '/' + currentMonth + '/' + currentDayOfMonth + ' ' + currentHour + ':' + currentMinute + ':' + currentSecond);
}

function padout(number) {
	return (number < 10) ? '0' + number : number;
}

var dateFormat = function () {
	var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) === "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d: d,
				dd: pad(d),
				ddd: dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m: m + 1,
				mm: pad(m + 1),
				mmm: dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy: String(y).slice(2),
				yyyy: y,
				h: H % 12 || 12,
				hh: pad(H % 12 || 12),
				H: H,
				HH: pad(H),
				M: M,
				MM: pad(M),
				s: s,
				ss: pad(s),
				l: pad(L, 3),
				L: pad(L > 99 ? Math.round(L / 10) : L),
				t: H < 12 ? "a" : "p",
				tt: H < 12 ? "am" : "pm",
				T: H < 12 ? "A" : "P",
				TT: H < 12 ? "AM" : "PM",
				Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};

}();

//HTML chars filter. 
angular.module(appCon.appName).filter('limitHtml', function () {
	return function (text, limit) {
		if (angular.isDefined(text)) {
			return text.trim().length > limit ? htmlSubstring(text, limit) : text;
		}
	}
});
/*Iframe onload call back in SystmemInformation.html  */
function desktopIconFrame() {
	document.getElementById('displayloader').style.display = 'none';
}

/**
 * get year of pending order from expirationDate
 * @param serverDate - current server date
 * @param expireDate - "mm/dd/YYYY"
 * @returns yearOfPendingOrder - "0.25"
 */
function getDaysOfPendingOrder(serverDate, expireDate) {
	var formatDate = new Date(serverDate);
	var day = formatDate.getDate();
	var month = formatDate.getMonth() + 1;
	var year = formatDate.getFullYear();
	var formatCurrentDate = month + "/" + day + "/" + year;
	var currentDate = new Date(formatCurrentDate);
	var expDate = new Date(expireDate);
	var timeDiff = Math.abs(expDate.getTime() - currentDate.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	return ++diffDays;
}
/**
 * get the value with full decimal value and truncate ceil the second decimal
 * @param proratedAmount - "1.5638999"
 * @returns proratedAmount - "1.57"
 */
function truncateDecimal(proratedAmount) {
	var numberofDecimals = 2;
	var proratedAmountStr = proratedAmount.toString();
	if (proratedAmountStr.indexOf(".") < 0) {
		return proratedAmount;
	}
	var digitsAfterDot = proratedAmountStr.substring(proratedAmountStr.indexOf("."), proratedAmountStr.length);
	if (digitsAfterDot.length > 3) {
		if (parseInt(digitsAfterDot.substring(3, 4)) > 0 && parseInt(digitsAfterDot.substring(3, 4)) < 5) {
			proratedAmount = parseFloat(proratedAmount + 0.01).toFixed(2);
		} else if (parseInt(digitsAfterDot.substring(3, 4)) > 0 && parseInt(digitsAfterDot.substring(3, 4)) >= 5) {
			proratedAmount = parseFloat(proratedAmount).toFixed(2);
		} else {
			proratedAmount = parseFloat(proratedAmount).toFixed(2);
		}
	} else {
		console.log("Calculated Amount is having less than 3 digits. So no need to convert again to 2 digit.>>>", proratedAmount);
	}
	return proratedAmount;
}
/**
 * show full screen fade and opacity loading on entire page
 * @param value
 */
function showSCLoading(value) {
	var containerFixed = document.getElementById('containerFixed'),
		loadingLayer;
	if (value) {
		angular.element(containerFixed).addClass('loading-container');
		loadingLayer = angular.element('<div class="loading" id="shoppinCartLoading"></div>');
		angular.element(containerFixed).append(loadingLayer);
	} else {
		angular.element(containerFixed).removeClass('loading-container');
		loadingLayer = document.getElementById('shoppinCartLoading');
		angular.element(loadingLayer).remove();
	}
}

function htmlSubstring(s, n) {
	var m, r = /<([^>\s]*)[^>]*>/g, stack = [], lasti = 0, result = '';
	//for each tag, while we don't have enough characters
	while ((m = r.exec(s)) && n) {
		//get the text substring between the last tag and this one
		var temp = s.substring(lasti, m.index).substr(0, n);
		//append to the result and count the number of characters added
		result += temp;
		n -= temp.length;
		lasti = r.lastIndex;
		if (n) {
			result += m[0];
			if (m[1].indexOf('/') === 0) {
				//if this is a closing tag, than pop the stack (does not account for bad html)
				stack.pop();
			} else if (m[1].lastIndexOf('/') !== m[1].length - 1) {
				//if this is not a self closing tag than push it in the stack
				stack.push(m[1]);
			}
		}
	}
	//add the remainder of the string, if needed (there are no more tags in here)
	result += s.substr(lasti, n);
	//fix the unclosed tags
	while (stack.length) {
		if (stack.pop() !== "br") {
			result += '</' + stack.pop() + '>';
		}
	}
	return result;
}

//AutoFocus Directives
angular.module(appCon.appName).directive('focusMe', function ($timeout) {
	return function (scope, element, attrs) {
		scope.$watch(attrs.focusMe, function (value) {
			if (value) {
				$timeout(function () {
					element.focus();
				}, 700);
			}
		});
	};
});
angular.module(appCon.appName).directive('iframeOnload', function () {
	return {
		scope: {
			callBack: '&iframeOnload'
		},
		link: function (scope, element, attrs) {
			element.on('load', function () {
				return scope.callBack();
			})
		}
	}
});
angular.module(appCon.appName).filter('trustAsResourceUrl', ['$sce', function ($sce) {
	return function (val) {
		return $sce.trustAsResourceUrl(val);
	};
}]);

angular.module(appCon.appName).controller('mockController', ['$rootScope', '$injector', '$scope', '$interval', '$location', 'aclService', '$cookieStore', '$controller', function ($rootScope, $injector, $scope, $interval, $location, aclService, $cookieStore, $controller) {
	var params = { 'j_username': 'peter@gmail.com', 'j_password': 'gltd123@' };
	var serviceName = 'users';
	$injector.get(serviceName).login(params).then(
		function (profileResult) {
			if (profileResult.data && profileResult.data.errorData) {
				if (profileResult.data.errorData.Status === 'Error' || profileResult.data.errorData.Status === 'error') {
					$scope.serviceResponseError = profileResult.data.errorData.ResponseError[0].longMessage;
				}
			} else if (profileResult.data && profileResult.data.successData) {
				if (profileResult.data.successData.Status === 'Ok') {
					$injector.get("users")["getLoginStatus"]().then(function (response) {
						$rootScope.$emit("CallParentMethod", response);

						$rootScope["userProfile"] = response.data.successData.userProfile;
						localStorage.setItem("userProfile", JSON.stringify(response));
						$cookieStore = $injector.get('$cookieStore');
						$cookieStore.put('userProfile', JSON.stringify($rootScope.userProfile));
						var authService = $injector.get('authService');
						var aclService = $injector.get('aclService');
						authService.requestCurrentUser(true).then(function () {
							authService.setPermissions().then(function () {
								$rootScope.canPerform = aclService.canPerform;
								$rootScope.canAccess = aclService.canAccess;
								appCon.dashboard = _.get(response.data.successData, appCon.globalCon.dashboards.dashboardKey);
								appCon.cookie.setItem('dashboard', appCon.dashboard);
								$cookieStore.put('dashboard', appCon.dashboard);
								$location.path(appCon.globalCon.extAppName + 'home');
							});
						});
					});
				}
			}
		});
}]);
angular.module(appCon.appName).directive('bindHtmlCompile', ['$compile', function ($compile) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			scope.$watch(function () {
				return scope.$eval(attrs.bindHtmlCompile);
			}, function (value) {
				element.html(value);
				$compile(element.contents())(scope);
			});
		}
	};
}]);

//Convert date : '2019-04-29T02:13:02.000Z'
angular.module(appCon.appName).filter('dateFormatWithTime', ['$sce', function ($sce) {
	return function (input, format) {
		var dateMoment;
		if (input) {
			input = input.split("-").join("/");
			input = input.split("T").join(" ");
			input = input.split(".");
			dateMoment = moment(input[0]).format(format);
		}
		return dateMoment;
	}
}
]);

function esGridMaxPaginationCount(response, toalRecordKey) {
	if (response.status === 'success') {
		var esPaginationMaxCount = 10000;
		response.successData.actualRecords = angular.copy(response.successData[toalRecordKey]);
		response.successData.paginationMessage = {
			actualRecords: response.successData.actualRecords,
			paginationMaxCount: esPaginationMaxCount
		};
		response.successData[toalRecordKey] = response.successData[toalRecordKey] >= esPaginationMaxCount ?
			esPaginationMaxCount :
			response.successData[toalRecordKey];
	}
	return response;
}
