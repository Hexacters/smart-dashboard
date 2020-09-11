'use strict';

angular.module(appCon.appName).controller('cardProfileController', ['$scope', '$rootScope', '$state', '$sce', '$injector', '$modal', '$controller', '$window', '$filter', '$cookieStore', function ($scope, $rootScope, $state, $sce, $injector, $modal, $controller, $window, $filter, $cookieStore) {
	$rootScope.showCardProfile = false;
	$rootScope.paymentTechEnable = appCon.globalCon.pci.enable;
	$scope.enableIframe = false;
	var year = new Date().getFullYear();
	var range = [];
	range.push(year);
	for (var i = 1; i < 10; i++) {
		range.push(year + i);
	}
	$scope.expiryYears = range;

	$scope.iframeLoadedCallBack = function () {
		$scope.loading = false;
	};
	$scope.goToCardProfilePage = function (cardProfile) {
		appCon.data.cardProfile = {};
		appCon.data.cardProfile = angular.copy(cardProfile);
		appCon.data.cardProfile.cardProfileOid = $scope.cardProfileOid;
		if ($rootScope.paymentTechEnable === 'true') {
			$scope.getPaymentIframeURL(cardProfile);
			$scope.enableIframe = true;
		} else {
			$scope.enableIframe = false;
			$rootScope.showCardProfile = true;
		}
	};
	$scope.getPaymentIframeURL = function (cardProfile) {
		var userProfile = {};
		$cookieStore = $injector.get('$cookieStore');
		userProfile = JSON.parse($cookieStore.get('userProfile'));
		$scope.loading = true;
		appCon.data.cardProfile.callbackUrl = appCon.globalCon.pci.cardprofile_callback_url;
		appCon.data.cardProfile.cssUrl = appCon.globalCon.pci.cardprofile_css_url;
		appCon.data.cardProfile.paymentTechFrameURL = appCon.globalCon.pci.paymentTechFrameURL;
		appCon.data.cardProfile.customerCareURL = appCon.globalCon.pci.customerCareURL;
		appCon.data.cardProfile.cardProfileOid = $scope.cardProfileOid;
		if (userProfile && userProfile.detail) {
			appCon.data.cardProfile.repOid = userProfile.detail.actorOid;
			appCon.data.cardProfile.vcOid = userProfile.detail.vcRelationOid;
		}
		var getUIDObject = {};
		getUIDObject.urlParams = {
			'customer_email': appCon.data.cardProfile.billingEmail, 'customer_address': appCon.data.cardProfile.billingAddress1, 'customer_address2': appCon.data.cardProfile.billingAddress2, 'customer_city': appCon.data.cardProfile.billingCity, 'customer_state': appCon.data.cardProfile.billingStateCode, 'customer_postal_code': appCon.data.cardProfile.billingZip, 'customer_country': appCon.data.cardProfile.billingCountryCode, 'callback_url': appCon.data.cardProfile.callbackUrl, 'css_url': appCon.data.cardProfile.cssUrl, 'hosted_tokenize': 'store_only',
			'requestFor': 'CARD_PROFILE', 'source': 'VDB', 'vcOid': appCon.data.cardProfile.vcOid, 'repOid': appCon.data.cardProfile.repOid, 'cardProfileOid': appCon.data.cardProfile.cardProfileOid
		};
		var eventObject = {
			"category": "CARD_PROFILE",
			"action": "NORMAL_GET_PAYMENT_UID",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable,
			"value": 1
		};
		$injector.get('dashboardServices')['getPaymentTechUID'](getUIDObject).then(function (result) {
			if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
				$scope.loading = false;
			}
			if (result && result.data && result.data.successData && result.data.successData.Status === "Ok") {
				eventObject.label += '#uID:' + result.data.successData.uIDKey;
				var UIDKey = result.data.successData.uIDKey;
				$rootScope.cardProfileURL = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL + result.data.successData.uIDKey);
				appCon.data.cardProfile.uID = UIDKey.split('uID=')[1];
				$rootScope.showCardProfile = true;
				$rootScope.$emit("callAnalyticsController", eventObject);
				/*$state.go('accounts.accountDetails.normal.paymentCardDetails');*/
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				eventObject.label += "#errorMessage:" + $scope.serviceResponseError;
				eventObject.value = 0;
				$rootScope.$emit("callAnalyticsController", eventObject);
			}
		});
	};
	$scope.showCardProfileSuccessPopup = function () {
		var modalInstance = $modal.open({
			templateUrl: 'views/cardProfile/updateCardProfileSuccess.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'app-modal-window',
			controller: function ($scope, $modalInstance) {
				$scope.closeSuccessPopup = function () {
					$modalInstance.close();
					$state.go('cardProfile.view', {}, { reload: true });
				};
			}
		});

	};
	$scope.goToCardProfileEdit = function () {
		$rootScope.showCardProfile = false;
		$scope.serviceResponseError = '';
		$scope.serviceResponseError = '';
	};
	$scope.setCardHolderName = function (cardProfile) {
		$scope.cardHolderName = cardProfile.nameOnCard;
		$scope.cardProfileOid = cardProfile.oid;
	};
	$scope.updateCardProfile = function (mKey) {
		$scope.serviceResponseError = '';
		var eventObject = {
			"category": "CARD_PROFILE",
			"action": "UPDATE_CARD_PROFILE",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable,
			"value": 1
		};

		var cardProfileUpdateParams = {};
		cardProfileUpdateParams = { 'cardProfileMongoID': mKey };
		$injector.get('cardServices')['updateCardProfile'](cardProfileUpdateParams).then(function (result) {
			if (result.data && result.data.errorData) {
				if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					eventObject.label += "#errorMessage:" + $scope.serviceResponseError;
					eventObject.value = 0;
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.loading = false;
				}
			} else if (result.data && result.data.successData) {
				if (result.data.successData.Status === 'Ok') {
					eventObject.label += "#Message:Success#Status:" + result.data.successData.Status;
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.loading = false;
					$scope.showCardProfileSuccessPopup();
				}
			}
		});
	};

	$scope.updateCardProfileDetailsToMongo = function (responseCode, message, uID) {
		var params = {}, succMongoId, isErrorOnPayment = false;
		params.cardProfileVO = { 'responseCode': responseCode, 'message': message, 'uID': uID };
		if (angular.isDefined(responseCode) && responseCode !== '000') {
			isErrorOnPayment = true;
		}
		var eventObject = {
			"category": "CARD_PROFILE",
			"action": "UPDATE_CARD_PROFILE_LOCAL",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable,
			"value": 1
		};
		$injector.get("cardServices")['updateLocalCardProfile'](params).then(function (result) {
			if (result.data && result.data.successData && result.data.status === 'success') {
				eventObject.label += "#status:" + result.data.status;
				$rootScope.$emit("callAnalyticsController", eventObject);
				succMongoId = result.data.successData.cardProfileVO.id;
				if (isErrorOnPayment) {
					$scope.serviceResponseError = message;
					var getUIDObject = {};
					getUIDObject.urlParams = {
						'customer_email': appCon.data.cardProfile.billingEmail, 'customer_address': appCon.data.cardProfile.billingAddress1, 'customer_address2': appCon.data.cardProfile.billingAddress2, 'customer_city': appCon.data.cardProfile.billingCity, 'customer_state': appCon.data.cardProfile.billingStateCode, 'customer_postal_code': appCon.data.cardProfile.billingZip, 'customer_country': appCon.data.cardProfile.billingCountryCode, 'callback_url': appCon.data.cardProfile.callbackUrl, 'css_url': appCon.data.cardProfile.cssUrl, 'hosted_tokenize': 'store_only',
						'requestFor': 'CARD_PROFILE', 'source': 'VDB', 'vcOid': appCon.data.cardProfile.vcOid, 'repOid': appCon.data.cardProfile.repOid, 'cardProfileOid': appCon.data.cardProfile.cardProfileOid
					};
					$injector.get("dashboardServices")['getPaymentTechUID'](getUIDObject).then(function (result) {
						if (result.data && result.data.successData && result.data.successData.Status === 'Ok') {
							var UIDKey = result.data.successData.uIDKey;
							$rootScope.cardProfileURL = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL + result.data.successData.uIDKey);
							appCon.data.cardProfile.uID = UIDKey.split('uID=')[1];
							$rootScope.showCardProfile = true;
							$scope.loading = false;
						} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
							$scope.serviceResponseError = result.data.errorData.ErrorMsg;
							scope.loading = false;
						}
					});
				} else {
					$scope.updateCardProfile(succMongoId);
				}
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				$scope.loading = false;
				eventObject.label += "#status:" + result.data.status + "errorMessage:" + result.data.errorData.ResponseError[0].longMessage;
				$rootScope.$emit("callAnalyticsController", eventObject);
			}
		});
	};

	$scope.updateCardProfileUsingOrbitalApi = function (cardProfileData) {
		$scope.serviceResponseError = '';
		$scope.loading = true;
		$scope.formDisabled = true;
		Object.assign(appCon.data.cardProfile, cardProfileData);
		$injector.get('cardServices')['updateCardProfileUsingOrbitalApi']().then(
			function (result) {
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
						$scope.loading = false;
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok') {
						$scope.loading = false;
						$scope.showCardProfileSuccessPopup();
					}
				}
			});
	};

	$scope.getAllLookups = function (lookupsCategory, secure) {
		var userServices = $injector.get('dashboardServices');
		var lookupsParam = { 'isVision': 'true', 'categories': lookupsCategory };
		if (secure === false) {
			userServices.getAllLookupsByCategoriesNonSecure(lookupsParam).then(function (result) {
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					}
				} else if (result.data && result.data.successData && result.data.status === 'success') {
					$rootScope.allLookups = result.data.successData;
				}
			});
		} else if (secure === true) {
			userServices.getAllLookupsByCategories(lookupsParam).then(function (result) {
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					}
				} else if (result.data && result.data.successData && result.data.status === 'success') {
					$rootScope.allLookups = result.data.successData;
				}
			});
		}
	};

	$scope.startCREPaymentLoading = function () {
		$scope.loading = true;
	};

	$scope.completeCRECardProfileAndUpdate = function (responseObject) {
		$scope.loading = false;
		$scope.updateCardProfileDetailsToMongo(responseObject.code, responseObject.message, responseObject.uID);
	};

	$scope.creHandleDetailCardProfileErrorsAndUpdate = function (errorCode, gatewayCode, gatewayMessage) {
		var isPaymentErrorCodeArray = ['01', '05', '43', '60', '61', '62', '63', 'L2', '360'];
		var isCardErrorCodeArray = ['74', '200', '310', '315', '320', '330', '340', '350', '355', '357', '370', '500', '510', '520', '530', '531', '550', 'H9', '500', ''];
		var isBankErrorCodeArray = ['03', '12', 'B5', '79', '77', 'R4', '600', '610', '620', '630', '640', '100', '110', '300', '400'];
		var errorMessage;
		if (angular.isDefined(gatewayCode)) {
			var gatewayCode = gatewayCode;
			var gatewayMessage = gatewayMessage;
		}
		var errorCodeSplit = errorCode.split('|');
		for (var i = 0; i < errorCodeSplit.length; i++) {
			if (isCardErrorCodeArray.indexOf(errorCodeSplit[i]) !== '-1') {
				errorMessage = 'Please check the credit card information entered and try again.';
			} else if (isPaymentErrorCodeArray.indexOf(errorCodeSplit[i]) !== '-1') {
				errorMessage = 'Your payment method was not accepted. Please try another card or contact your financial institution.';
			} else if (isBankErrorCodeArray.indexOf(errorCodeSplit[i]) !== '-1') {
				errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.cardProfile.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
			} else {
				errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.cardProfile.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
			}
		}
		var eventObject = {
			"category": "CARD_PROFILE",
			"action": "UPDATE_CARD_PROFILE_ERROR",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable + "#ErrorMessage:" + errorMessage,
			"value": 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.updateCardProfileDetailsToMongo(errorCode, errorMessage, appCon.data.cardProfile.uID);
	};

	$scope.creHandleCardProfileErrorsAndUpdate = function () {
		console.log("creHandleErrorsAndUpdate");
	};

}]);

var completeHPCardProfile,
	startHostedPaymentCardProfile,
	hostedHandleDetailErrorsCardProfile,
	hostedHandleErrorsCardProfile;

completeHPCardProfile = function (responseObject) {
	angular.element($('#cardProfileContainer')).scope().completeCRECardProfileAndUpdate(responseObject);
};

startHostedPaymentCardProfile = function () {
	angular.element($('#cardProfileContainer')).scope().startCRECardProfileLoading();
};

hostedHandleDetailErrorsCardProfile = function (errorCode, gatewayCode, gatewayMessage) {
	angular.element($('#cardProfileContainer')).scope().creHandleDetailCardProfileErrorsAndUpdate(errorCode, gatewayCode, gatewayMessage);
};

hostedHandleErrorsCardProfile = function (errorCode) {
	angular.element($('#cardProfileContainer')).scope().creHandleCardProfileErrorsAndUpdate(errorCode);
};
