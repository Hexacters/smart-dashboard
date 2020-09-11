'use strict';
angular.module(appCon.appName).controller('shoppingCartController', ['$scope', '$window', '$timeout', '$modal', '$filter', '$injector', '$rootScope', '$location', '$state', '$stateParams', 'Analytics', '$cookieStore', '$sce', function ($scope, $window, $timeout, $modal, $filter, $injector, $rootScope, $location, $state, $stateParams, Analytics, $cookieStore, $sce) {

	var year = new Date().getFullYear();
	var range = [];
	range.push(year);
	for (var i = 1; i < 10; i++) {
		range.push(year + i);
	}
	$scope.expiryYears = range;
	console.log('$scope.expiryYears', $scope.expiryYears);

	$scope.clearErrorMessage = function (result) {
		if (result && result.status === 'success') {
			var activeUserList = result.successData.activeUserList;
			angular.forEach(activeUserList, function (value, key) {
				//Default button model value false
				activeUserList[key].isDeleted = false;
				if (angular.isDefined($rootScope.deletedRepsTemp) && ($rootScope.deletedRepsTemp).length > 0) {
					var checkedUserOid = ($rootScope.deletedRepsTemp).indexOf(activeUserList[key].userOid);
					//Update the button model value based on UserOid
					if (checkedUserOid !== -1) {
						activeUserList[key].isDeleted = true;
					}
				}
			});
			result.successData.activeUserList = activeUserList;
			$scope.repListTmp = activeUserList;
		}
		$scope.deleteRepErrorMsg = '';
		return result;
	};

	$scope.updateDeletedUserList = function (obj, value, index) {
		$scope.repListTmp[index].isDeleted = (value === true) ? true : false;
	}

	//Back button to summary page.
	$scope.backToSummayPage = function () {
		$scope.billingInfoResponseError = '';
		if ($state.current.name === 'manage.inviteReps') {
			$rootScope.showPaymentElement.showIncrementalPayment = true;
			$rootScope.showPaymentElement.payment.summary = true;
			$rootScope.showPaymentElement.payment.billing = false;
			$rootScope.showPaymentElement.payment.checkout = false;
		} else if ($state.current.name === 'inviteReps.addNewReps') {
			$rootScope.showAddNewRepPayment(false, true, false, false);
		} else {
			$state.go('shoppingCart.shoppingCartSummary');
		}
	};

	$scope.listUnpaidUsersDialog = function () {
		var modalInstance = $modal.open({
			templateUrl: 'views/shoppingCart/shoppingCartUnPaidUsersPopup.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance) {
				$scope.closePopup = function () {
					$modalInstance.close();
				};
			}
		});
	};

	$scope.deleteCustomer = function (customerList) {
		$scope.deleteRepErrorMsg = '';
		var repUID = [];
		var params = {};
		angular.forEach(customerList.activeUserList, function (value, key) {
			if (value.isDeleted) {
				repUID.push(value.userOid);
				params.userOids = repUID;
			}
		});

		$scope.validateRepExist = false;
		angular.forEach($scope.repListTmp, function (value, key) {
			if ($scope.repListTmp[key].isDeleted === false) {
				$scope.validateRepExist = true;
			}
		});

		var validateRepCount = (parseInt(appCon.data.itemElgibility.activeUsersCount) - parseInt(repUID.length)) + parseInt(appCon.data.pendingOrderDetails.buyupUserCount);

		if ($scope.validateRepExist === false) {
			$modal.open({
				templateUrl: 'views/shoppingCart/editRepAlertPopup.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope,
				controller: function ($scope, $modalInstance, $state) {
					$scope.cancelPopup = function () {
						$modalInstance.close();
					}
				}
			});
		} else if (validateRepCount > appCon.globalCon.openAccessPlan.maxRepCount) {
			$modal.open({
				templateUrl: 'views/shoppingCart/editRepAlertPopup.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope,
				controller: function ($scope, $modalInstance, $state) {
					$scope.navigateToSummaryScreen = function () {
						$modalInstance.close();
						$state.go('shoppingCart.shoppingCartSummary');
					}
				}
			});
		} else if (repUID.length >= 0) {
			$modal.open({
				templateUrl: 'views/shoppingCart/deleteCustomer.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope,
				controller: function ($scope, $modalInstance, $state) {
					$scope.deleteCustomerList = function () {
						var eventObject = {
							"category": "SHOPPING_CART",
							"action": "DELETE_REPS",
							"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
							"value": 1
						};
						appCon.data.pendingOrderDetails.deletedReps = angular.copy(repUID);
						$rootScope.deletedRepsTemp = angular.copy(repUID);
						//update the order amount after deleted reps count
						var calTotalAmount = (parseInt(appCon.data.itemElgibility.activeUsersCount) - parseInt(repUID.length)) + parseInt(appCon.data.pendingOrderDetails.buyupUserCount);
						$rootScope.repCountInSummaryDesc = parseInt(calTotalAmount);
						$rootScope.orderAmount = appCon.data.itemCatalogSummary[calTotalAmount - 1].amount;
						//update the pending reps count after deleted reps count
						$rootScope.pendingRepCount = (parseInt(appCon.globalCon.openAccessPlan.maxRepCount) - appCon.data.itemElgibility.activeUsersCount) + parseInt(repUID.length);
						$modalInstance.close();
						eventObject.label += "#deletedReps:" + (appCon.data.pendingOrderDetails.deletedReps).toString() + "#deletedRepsCount:" + parseInt(repUID.length);
						eventObject.label += "#buyupUserCount:" + parseInt(appCon.data.pendingOrderDetails.buyupUserCount);
						eventObject.label += "#activeUsersCount:" + parseInt(appCon.data.itemElgibility.activeUsersCount);
						eventObject.label += "#orderAmount:" + $rootScope.orderAmount;
						eventObject.label += "#pendingRepCount:" + $rootScope.pendingRepCount;
						eventObject.label += "#orderType:" + $rootScope.orderType;
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						$state.go('shoppingCart.shoppingCartSummary');
					}
				}
			});
		} else {
			$scope.deleteRepErrorMsg = 'Please select users to delete.';
		}
	};

	$scope.navBillingInfoScreen = function (orderType) {
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
			"value": 1
		};
		var shoppingCartSummaryGrid = document.getElementById("shoppingCartSummaryGrid");
		disableAll(shoppingCartSummaryGrid);
		if ($state.current.name === 'manage.inviteReps') {
			eventObject.action = 'CHECKOUT_INVITEREP';
			$rootScope.$emit("callAnalyticsEventTrack", eventObject);
			$rootScope.showPaymentElement.payment.random = Math.random();
			$rootScope.showPaymentElement.payment.summary = false;
			$rootScope.showPaymentElement.payment.billing = true;
			$rootScope.showPaymentElement.payment.checkout = false;
		} else if ($state.current.name === 'inviteReps.addNewReps') {
			$rootScope.showAddNewRepPayment(false, false, true, false);
		} else {
			if (angular.lowercase(orderType) === 'renewal') {
				$scope.saveRenewal();
			} else {
				eventObject.action = (angular.isDefined($rootScope.forceToShoppingCartCheckout) && $rootScope.forceToShoppingCartCheckout) ? 'CHECKOUT_FORCE' : 'CHECKOUT_CART';
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				$state.go('shoppingCart.billingInfo');
			}
		}
	}

	$scope.navEditRepRosterScreen = function () {
		var shoppingCartSummaryGrid = document.getElementById("shoppingCartSummaryGrid");
		disableAll(shoppingCartSummaryGrid);
		$state.go('shoppingCart.repList');
		enableAll(shoppingCartSummaryGrid);
	}

	$scope.openAddAdditionalscreen = function () {
		var shoppingCartSummaryGrid = document.getElementById("shoppingCartSummaryGrid");
		disableAll(shoppingCartSummaryGrid);
		//To avoid default form validation
		$scope.additionalReps = appCon.data.pendingOrderDetails.buyupUserCount > 0 ? appCon.data.pendingOrderDetails.buyupUserCount : 0;
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "ADDL_REPS_BTN",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
			"value": 1
		};
		eventObject.label += "#buyupUserCount:" + (appCon.data.pendingOrderDetails.buyupUserCount > 0 ? appCon.data.pendingOrderDetails.buyupUserCount : 0);
		eventObject.label += "#deletedRepsCount:" + (angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).length : 0);
		$rootScope.$emit("callAnalyticsEventTrack", eventObject);
		$modal.open({
			templateUrl: 'views/shoppingCart/addAdditionalReps.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'commonDialogW65',
			controller: function ($scope, $modalInstance, $state) {
				enableAll(shoppingCartSummaryGrid);
				$scope.plusOne = function (value) {
					var value = (value && value !== '') ? Number(value) : 0;
					return ++value;
				}
				$scope.minusOne = function (value) {
					var value = (value && value !== '') ? Number(value) : 0;
					return value === 0 ? 0 : --value;
				}
				$scope.closeModal = function () {
					$modalInstance.close();
					var eventObject = {
						"category": "SHOPPING_CART",
						"action": "ADDL_REPS_CANCEL",
						"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
						"value": 1
					};
					eventObject.label += "#buyupUserCount:" + (appCon.data.pendingOrderDetails.buyupUserCount > 0 ? appCon.data.pendingOrderDetails.buyupUserCount : 0);
					eventObject.label += "#deletedRepsCount:" + (angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).length : 0);
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				};
				$scope.evalAdditionalRepsCount = function (additionalRepsCount) {
					$modalInstance.close();
					var eventObject = {
						"category": "SHOPPING_CART",
						"action": "ADDL_REPS_SUBMIT",
						"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid,
						"value": 1
					};
					appCon.data.pendingOrderDetails.buyupUserCount = additionalRepsCount;
					var calPendingRepCount = parseInt($rootScope.pendingRepCount) - parseInt(appCon.data.pendingOrderDetails.buyupUserCount);
					$rootScope.pendingRepCount = parseInt(appCon.data.pendingOrderDetails.buyupUserCount) + parseInt(calPendingRepCount);
					var deletedCount = 0;
					if (angular.isDefined(appCon.data.pendingOrderDetails.deletedReps)) {
						deletedCount = appCon.data.pendingOrderDetails.deletedReps.length;
						eventObject.label += "#deletedReps:" + (appCon.data.pendingOrderDetails.deletedReps).toString() + "#deletedRepsCount:" + deletedCount;
					} else if (deletedCount === 0 && $rootScope.orderType.toLowerCase() === 'renewal') {
						var orderUpdatedDelReps = angular.isDefined($rootScope.deletedRepsTemp) && ($rootScope.deletedRepsTemp.length > 0) ? $rootScope.deletedRepsTemp.split(",") : '';
						var orderUpdatedDelRepsCount = orderUpdatedDelReps.length;
						deletedCount = orderUpdatedDelRepsCount;
					}

					var calTotalAmount = parseInt(appCon.data.pendingOrderDetails.buyupUserCount) + (parseInt(appCon.data.itemElgibility.activeUsersCount) - deletedCount);
					$rootScope.repCountInSummaryDesc = calTotalAmount;
					$rootScope.orderAmount = appCon.data.itemCatalogSummary[calTotalAmount - 1].amount;
					eventObject.label += "#buyupUserCount:" + parseInt(appCon.data.pendingOrderDetails.buyupUserCount);
					eventObject.label += "#activeUsersCount:" + parseInt(appCon.data.itemElgibility.activeUsersCount);
					eventObject.label += "#orderAmount:" + $rootScope.orderAmount;
					eventObject.label += "#pendingRepCount:" + ($rootScope.pendingRepCount - additionalRepsCount <= 0 ? 0 : ($rootScope.pendingRepCount - additionalRepsCount));
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				}
			}
		});
	};

	$scope.editOrder = function () {
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "EDIT_ORDER",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
			"value": 1
		};
		$rootScope.$emit("callAnalyticsEventTrack", eventObject);
		$rootScope.showRenewalFlow = false;
	}

	$scope.saveRenewal = function () {

		var params = {};
		var serviceName = 'shoppingCartServices';
		var operationName = 'saveShoppingOrder';
		params = {
			"fein": $rootScope.userProfile.detail.fein,
			"category": "OpenAccessPlan",
			"deletedUserOids": angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).toString() : appCon.data.pendingOrderDetails.deletedReps,
			"buyupUserCount": appCon.data.pendingOrderDetails.buyupUserCount
		};
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "CHECKOUT_CART",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
			"value": 1
		};
		eventObject.label += "#deletedUserOids:" + (angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).toString() : 'No Deleted Oid') + "#buyupUserCount:" + params.buyupUserCount;
		$injector.get(serviceName)[operationName](params).then(
			function (result) {
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.OrderSummaryResponseError = result.data.errorData.ResponseError[0].longMessage;
						$scope.enablePCILoading = false;
						eventObject.value = 0;
						eventObject.label += "#errorMessage:" + response.data.errorData.ResponseError[0].longMessage;
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok') {
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						$state.go('shoppingCart.shoppingCartSummary', {}, { reload: true });
						$rootScope.showRenewalFlow = true;
					}
				}
			});
	}

	$scope.billingInfoResponseError = '';
	/* billing & payment code starts*/
	$scope.submitShoppingCartBillingAddress = function (requestParam, isFrom, formId) {
		$scope.billingInfoResponseError = '';
		$scope.loading = true;
		$injector.get('dashboardServices').getUserByUserName().then(function (result) {
			$scope.loading = false;
			if (result.data && result.data.status === 'success') {
				var userDetailsResponse = result.data.successData.detail;
				if (userDetailsResponse.isSupplierBlocked === true) {
					$scope.billingInfoResponseError = userDetailsResponse.blockedMessage;
					var eventObject = {
						"category": "SHOPPING_CART",
						"action": "SUPPLIER_BLOCKED",
						"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid,
						"value": 1
					};
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				} else {
					$scope.billingInfoResponseError = '';
					$scope.loading = true;
					$rootScope.scbillingAddressDetails = '';
					$rootScope.scbillingAddressDetails = requestParam;
					if (angular.isDefined($rootScope.showPaymentElement) && angular.isDefined($rootScope.showPaymentElement.showIncrementalPayment) === true && $state.current.name === 'manage.inviteReps') {
						var eventObject = {
							"category": "SHOPPING_CART",
							"action": "BILLING_INFO_INVITEREP",
							"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
							"value": 1
						};
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						$rootScope.scPaymentPrice = $rootScope.orderAmount;
						$scope.showSCReadyPopup($rootScope.scPaymentPrice, formId);
					} else {
						$scope.validateOrder(formId);
					}
				}
			} else {
				$scope.billingInfoResponseError = result.data.errorData.ResponseError[0].longMessage;
			}
		});
	};

	$scope.validateOrder = function (formId) {
		var params = {};
		params.vendorOid = $rootScope.userProfile.detail.vendorOid
		params.buyupUserCount = appCon.data.pendingOrderDetails.buyupUserCount;
		params.deletedUserOids = angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).toString() : appCon.data.pendingOrderDetails.deletedReps;
		params.orderType = appCon.data.pendingOrderDetails.orderType;
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "BILLING_INFO_CART",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
			"value": 1
		};
		if (angular.isDefined($rootScope.forceToShoppingCartCheckout) && $rootScope.forceToShoppingCartCheckout) {
			eventObject.action = "BILLING_INFO_FORCE";
		}
		$injector.get("shoppingCartServices")["validateOrderDetails"](params).then(function (response) {
			if (response.data && response.data.status === 'success') {
				eventObject.label += "#scPaymentPrice:" + response.data.successData.amount + "#proceedPayment:" + response.data.successData.proceedPayment;
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				$rootScope.scPaymentPrice = response.data.successData.amount;
				if (response.data.successData.proceedPayment === true && angular.isDefined(response.data.successData.amount)) {
					$scope.showSCReadyPopup($rootScope.scPaymentPrice, formId);
				} else {
					$window.location.reload();
				}
			} else if (response.data && response.data.status === 'error') {
				eventObject.value = 0;
				eventObject.label += "#errorCode:" + response.data.errorData.ResponseError[0].errorCode + "#errorMessage:" + response.data.errorData.ResponseError[0].longMessage;
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				$scope.validationServicesErrorMessage = response.data.errorData.ResponseError[0].longMessage;
				$modal.open({
					templateUrl: 'views/printBadge/validationFailurePopup.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					scope: $scope,
					controller: function ($scope, $modalInstance, $window) {
						$scope.closeAndReload = function () {
							$modalInstance.close();
							$window.location.reload();
						};
					}
				});
			}
		});
	}

	$scope.showSCReadyPopup = function (paymentPrice, formId) {
		$scope.loading = false;
		var modalInstance = $modal.open({
			templateUrl: 'views/shoppingCart/shoppingCartPaymentPopup.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance) {
				console.log("enableAll", formId)
				$scope.goSCInformationPage = function () {
					$modalInstance.close();
					$scope.getSCPaymentFrameURL(paymentPrice);
				};
				$scope.cancelSCPaymentReadyPopup = function () {
					$modalInstance.close();
					var disableRegisterForm = document.getElementById(formId);
					enableAll(disableRegisterForm);
				};
			}
		});
	};

	$scope.getSCPaymentFrameURL = function (paymentPrice, formId) {
		$scope.serviceResponseError = '';
		appCon.data.scBillingDetails = {};
		$scope.billingAddress = angular.copy($rootScope.scbillingAddressDetails);
		appCon.data.scBillingDetails = $scope.billingAddress.shoppingCart;
		appCon.data.scBillingDetails.callbackUrl = appCon.globalCon.pci.shoppingCart_callback_url;
		appCon.data.scBillingDetails.cssUrl = appCon.globalCon.pci.shoppingCart_css_url;
		appCon.data.scBillingDetails.amount = paymentPrice;
		appCon.data.scBillingDetails.paymentTechFrameURL = appCon.globalCon.pci.paymentTechFrameURL;
		appCon.data.scBillingDetails.customerCareURL = appCon.globalCon.pci.customerCareURL;
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "GET_PAYMENT_UID_CART",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + paymentPrice,
			"value": 1
		};
		if (angular.isDefined($rootScope.showPaymentElement) && angular.isDefined($rootScope.showPaymentElement.showIncrementalPayment) === true && $state.current.name === 'manage.inviteReps') {
			eventObject.action = "GET_PAYMENT_UID_INVITEREP";
		} else if (angular.isDefined($rootScope.forceToShoppingCartCheckout) && $rootScope.forceToShoppingCartCheckout) {
			eventObject.action = "GET_PAYMENT_UID_FORCE";
		}
		var getUIDObject = {};
		getUIDObject.urlParams = {
			'amount': appCon.data.scBillingDetails.amount, 'customer_address': appCon.data.scBillingDetails.billingAddress1, 'customer_address2': appCon.data.scBillingDetails.billingAddress2, 'customer_email': appCon.data.scBillingDetails.billingEmail, 'customer_city': appCon.data.scBillingDetails.billingCity, 'customer_state': appCon.data.scBillingDetails.billingStateCode, 'customer_postal_code': appCon.data.scBillingDetails.billingZip, 'customer_country': appCon.data.scBillingDetails.billingCountryCode, 'callback_url': appCon.data.scBillingDetails.callbackUrl, 'css_url': appCon.data.scBillingDetails.cssUrl, 'hosted_tokenize': 'store_only',
			'requestFor': 'PAYMENT', 'acceptFee': true, 'acceptChangable': true, 'acceptAutoRenew': true, 'trueAndAccurate': true, "order_id": appCon.globalCon.pci.shopping_cart_order_id, "order_desc": appCon.globalCon.pci.shopping_cart_order_desc
		};
		//Update the source parma for Increamental payment Invite rep
		if (angular.isDefined($rootScope.showPaymentElement) && angular.isDefined($rootScope.showPaymentElement.showIncrementalPayment) === true && $state.current.name === 'manage.inviteReps') {
			getUIDObject.urlParams.source = 'INVITEREP';
			var details = { "newUsersCount": appCon.data.invitedNewRepCount, "fein": $rootScope.userProfile.detail.fein, "legalName": $rootScope.userProfile.detail.legalName }
			getUIDObject.urlParams.details = details;
			eventObject.label += "#newUsersCount:" + appCon.data.invitedNewRepCount + "#legalName:" + $rootScope.userProfile.detail.legalName;
		} else {
			var details = {
				"deletedUserOids": angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).toString() : appCon.data.pendingOrderDetails.deletedReps,
				"fein": $rootScope.userProfile.detail.fein
			}
			eventObject.label += "#deletedUserOids:" + (angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).toString() : 'No Deleted Oid');
			if (appCon.data.pendingOrderDetails.buyupUserCount > 0) {
				details.buyupUserCount = appCon.data.pendingOrderDetails.buyupUserCount;
				eventObject.label += "#buyupUserCount:" + details.buyupUserCount;
			}
			getUIDObject.urlParams.details = details;
			getUIDObject.urlParams.source = 'VDB_SCART';
			getUIDObject.urlParams.itemId = appCon.data.pendingOrderDetails.id;
		}
		angular.forEach(getUIDObject.urlParams, function (value, key) {
			if (!(key === 'details' || key === 'callback_url' || key === 'css_url')) {
				eventObject.label += "#" + key + ":" + value;
			}
		});
		$injector.get("shoppingCartServices")['getPaymentTechUID'](getUIDObject).then(function (result) {
			if (result && result.data && result.data.successData && result.data.successData.Status === 'Ok') {
				$rootScope.scPaymentCallUID = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL + result.data.successData.uIDKey);
				var UIDKey = result.data.successData.uIDKey;
				appCon.data.scBillingDetails.uID = UIDKey.split('uID=')[1];
				eventObject.label += '#uID:' + result.data.successData.uIDKey;
				$rootScope.$emit("callAnalyticsController", eventObject);

				if ($state.current.name === 'manage.inviteReps') {
					$rootScope.showPaymentElement.payment.random = Math.random();
					$rootScope.showPaymentElement.payment.summary = false;
					$rootScope.showPaymentElement.payment.billing = false;
					$rootScope.showPaymentElement.payment.checkout = true;
				} else if ($state.current.name === 'inviteReps.addNewReps') {
					$rootScope.showAddNewRepPayment(false, false, false, true);
				} else {
					$state.go('shoppingCart.checkout');
				}
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ErrorMsg;
				eventObject.value = 0;
				eventObject.label += "#errorMessage:" + result.data.errorData.ErrorMsg;
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				var disableRegisterForm = document.getElementById(formId);
				enableAll(disableRegisterForm);
			}
		});
	};

	$scope.completeCREShoppingCartAndUpdate = function (responseObject) {
		$scope.enablePCILoading = false;
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "SHOPPING_CART_PAYMENT_PROCESS_END_REACH",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid,
			"value": 1
		};
		angular.forEach(responseObject, function (value, key) {
			eventObject.label += "#" + key + ":" + value;
		});
		eventObject.label += "#localDate:" + new Date();
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.updatePaymentDetails(responseObject.code, responseObject.message, responseObject.uID);
	};

	$scope.startCREShoppingCartLoading = function () {
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "SHOPPING_CART_PAYMENT_PROCESS_START_REACH",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "UID:" + appCon.data.scBillingDetails.uID + "#localDate:" + new Date(),
			"value": 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.enablePCILoading = true;
	}

	$scope.creHandleShoppingCartDetailErrorsAndUpdate = function (errorCode, gatewayCode, gatewayMessage) {
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "SHOPPING_CART_PAYMENT_ERROR_CALLBACK_REACH",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "errorCode:" + errorCode + "#UID:" + appCon.data.scBillingDetails.uID + "#gatewayCode:" + gatewayCode + "#gatewayMessage:" + gatewayMessage + "#localDate:" + new Date(),
			"value": 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		console.log("creHandleDetailErrorsAndUpdate", errorCode, gatewayCode, gatewayMessage);
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
			if (isCardErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Please check the credit card information entered and try again.';
			} else if (isPaymentErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Your payment method was not accepted. Please try another card or contact your financial institution.';
			} else if (isBankErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.scBillingDetails.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
			} else {
				errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.scBillingDetails.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
			}
		}
		$scope.updatePaymentDetails(errorCode, errorMessage, appCon.data.scBillingDetails.uID);
	};

	$scope.creHandleShoppingCartErrorsAndUpdate = function (errorCode) {
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "SHOPPING_CART_PAYMENT_ERROR_REACH",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "errorCode:" + errorCode + "#UID:" + appCon.data.scBillingDetails.uID + "#localDate:" + new Date(),
			"value": 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		console.log("creHandleErrorsAndUpdate");
	};

	$scope.updatePaymentDetails = function (responseCode, message, uID) {
		var params = {}, succMongoId, isErrorOnPayment = false, eventObject = {}, doPaymentDetails = {};
		params.paymentDetailsVO = {};
		params.paymentDetailsVO = { 'responseCode': responseCode, 'message': message, 'uID': uID };
		if (angular.isDefined(responseCode) && responseCode != '000') {
			isErrorOnPayment = true;
			doPaymentDetails = { 'isCardProfileSaved': false };
		} else {
			doPaymentDetails = { 'isCardProfileSaved': true };
		}
		params.paymentDetailsVO.details = doPaymentDetails;

		$injector.get("shoppingCartServices")['updatePaymentDetails'](params).then(function (result) {
			var eventObject = {
				"category": "SHOPPING_CART",
				"action": "UPADTE_MONGO_CART",
				"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
				"value": 1
			};
			if (angular.isDefined($rootScope.showPaymentElement) && angular.isDefined($rootScope.showPaymentElement.showIncrementalPayment) === true && $state.current.name === 'manage.inviteReps') {
				eventObject.action = "UPADTE_MONGO_INVITEREP";
			} else if (angular.isDefined($rootScope.forceToShoppingCartCheckout) && $rootScope.forceToShoppingCartCheckout) {
				eventObject.action = "UPADTE_MONGO_FORCE";
			}
			if (result.data && result.data.successData && result.data.status === 'success') {
				succMongoId = result.data.successData.paymentDetailsVO.id;

				//prepare paymenTech UID request Params.
				//$scope.serviceResponseError = message;

				if (isErrorOnPayment) {
					eventObject.label += "#isFrom:ErrorOnCardProfileSave";
					$scope.serviceResponseError = message;
					$scope.getPaymentTechUID(eventObject);
				} else {
					var doPaymentParamsObject = {};
					doPaymentParamsObject = { 'paymentDetailId': succMongoId };
					$injector.get("shoppingCartServices")['doPaymentShoppingCart'](doPaymentParamsObject).then(function (result) {
						if (result.data && result.data.successData && result.data.successData.Status === 'Ok') {
							if (result.data.successData.isPaymentSuccess === true) {
								$rootScope.$emit("callAnalyticsEventTrack", eventObject);
								$scope.savePaymentProfileDetails('VDB_SCART', succMongoId, responseCode, uID);
							} else {
								var isPaymentErrorCodeArray = ['01', '05', '43', '60', '61', '62', '63', 'L2', '360'];
								var isCardErrorCodeArray = ['74', '200', '310', '315', '320', '330', '340', '350', '355', '357', '370', '500', '510', '520', '530', '531', '550', 'H9', '500', ''];
								var isBankErrorCodeArray = ['03', '12', 'B5', '79', '77', 'R4', '600', '610', '620', '630', '640', '100', '110', '300', '400'];
								var errorMessage;
								var errorFromDoPayment = result.data.successData.responseCode;
								var errorFromDoPaymentSplit = errorCode.split(' ')[0];
								//for (var i=0;i<errorCodeSplit.length;i++) {
								if (isCardErrorCodeArray.indexOf(errorFromDoPaymentSplit) != '-1') {
									errorMessage = 'Please check the credit card information entered and try again.';
								} else if (isPaymentErrorCodeArray.indexOf(errorFromDoPaymentSplit) != '-1') {
									errorMessage = 'Your payment method was not accepted. Please try another card or contact your financial institution.';
								} else if (isBankErrorCodeArray.indexOf(errorFromDoPaymentSplit) != '-1') {
									errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.scBillingDetails.customerCareURL + '">Customer Care</a> and provide error code ' + errorFromDoPaymentSplit + '.';
								} else {
									errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.scBillingDetails.customerCareURL + '">Customer Care</a> and provide error code ' + errorFromDoPaymentSplit + '.';
								}
								//}
								$scope.serviceResponseError = errorMessage;
								$scope.enablePCILoading = false;
								eventObject.label += "#isFrom:ErrorOnDoPaymentSuccess";
								$scope.getPaymentTechUID(eventObject);
							}
						} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
							$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
							$scope.enablePCILoading = false;
							console.log('do payement else');
							eventObject.label += "#isFrom:ErrorOnDoPaymentFailure";
							$scope.getPaymentTechUID(eventObject);
						}
					});
				}
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				$scope.enablePCILoading = false;
				eventObject.label += "#errorMessage:" + $scope.serviceResponseError;
				eventObject.value = 0;
				$rootScope.$emit("callAnalyticsController", eventObject);
			}
		});
	};

	$scope.getPaymentTechUID = function (eventObject) {
		console.log('comes into new method');
		var getUIDObject = {};
		getUIDObject.urlParams = {
			'amount': appCon.data.scBillingDetails.amount, 'customer_address': appCon.data.scBillingDetails.billingAddress1, 'customer_address2': appCon.data.scBillingDetails.billingAddress2, 'customer_email': appCon.data.scBillingDetails.billingEmail, 'customer_city': appCon.data.scBillingDetails.billingCity, 'customer_state': appCon.data.scBillingDetails.billingStateCode, 'customer_postal_code': appCon.data.scBillingDetails.billingZip, 'customer_country': appCon.data.scBillingDetails.billingCountryCode, 'callback_url': appCon.data.scBillingDetails.callbackUrl, 'css_url': appCon.data.scBillingDetails.cssUrl, 'hosted_tokenize': 'store_only',
			'requestFor': 'PAYMENT', 'source': 'VDB_SCART', 'acceptFee': true, 'acceptChangable': true, 'acceptAutoRenew': true, 'trueAndAccurate': true, "order_id": appCon.globalCon.pci.shopping_cart_order_id, "order_desc": appCon.globalCon.pci.shopping_cart_order_desc
		};
		//Update the source parma for Increamental payment Invite rep
		if (angular.isDefined($rootScope.showPaymentElement) && angular.isDefined($rootScope.showPaymentElement.showIncrementalPayment) === true && $state.current.name === 'manage.inviteReps') {
			getUIDObject.urlParams.source = 'INVITEREP';
			var details = { "newUsersCount": appCon.data.invitedNewRepCount, "fein": $rootScope.userProfile.detail.fein, "legalName": $rootScope.userProfile.detail.legalName }
			getUIDObject.urlParams.details = details;
			eventObject.label += "#newUsersCount:" + appCon.data.invitedNewRepCount + "#legalName:" + $rootScope.userProfile.detail.legalName;
		} else {
			var details = {
				"deletedUserOids": angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).toString() : appCon.data.pendingOrderDetails.deletedReps,
				"fein": $rootScope.userProfile.detail.fein
			}
			eventObject.label += "#deletedUserOids:" + (angular.isDefined(appCon.data.pendingOrderDetails.deletedReps) ? (appCon.data.pendingOrderDetails.deletedReps).toString() : "No Deleted Oid");
			if (appCon.data.pendingOrderDetails.buyupUserCount > 0) {
				details.buyupUserCount = appCon.data.pendingOrderDetails.buyupUserCount;
				eventObject.label += "#buyupUserCount:" + details.buyupUserCount;
			}
			getUIDObject.urlParams.details = details;
			getUIDObject.urlParams.source = 'VDB_SCART';
			getUIDObject.urlParams.itemId = appCon.data.pendingOrderDetails.id;
		}
		angular.forEach(getUIDObject.urlParams, function (value, key) {
			if (!(key === 'details' || key === 'callback_url' || key === 'css_url')) {
				eventObject.label += "#" + key + ":" + value;
			}
		});
		$injector.get("dashboardServices")['getPaymentTechUID'](getUIDObject).then(function (result) {
			if (result.data && result.data.successData && result.data.successData.Status === 'Ok') {
				$rootScope.scPaymentCallUID = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL + result.data.successData.uIDKey);
				var UIDKey = result.data.successData.uIDKey;
				appCon.data.scBillingDetails.uID = UIDKey.split('uID=')[1];
				$scope.enablePCILoading = false;
				eventObject.label += "#newPyamentTechUID:Yes" + '#uID:' + result.data.successData.uIDKey;
				$rootScope.$emit("callAnalyticsController", eventObject);
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ErrorMsg;
				$scope.enablePCILoading = false;
				eventObject.label += "#errorMessage:" + $scope.serviceResponseError;
				eventObject.value = 0;
				$rootScope.$emit("callAnalyticsController", eventObject);
				console.log('comes into global error handiling');
			}
		});
	};

	$scope.savePaymentProfileDetails = function (paymentFrom, mKey, responseCode, uID) {
		$scope.serviceResponseError = '';
		var params = {}, serviceName = 'shoppingCartServices', operationName = 'savePaymentProfileDetails';
		params = { 'paymentDetailId': mKey };
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "SAVE_PAYMENT_PROFILE_CART",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount,
			"value": 1
		};
		if (angular.isDefined($rootScope.showPaymentElement) && angular.isDefined($rootScope.showPaymentElement.showIncrementalPayment) === true && $state.current.name === 'manage.inviteReps') {
			eventObject.action = "SAVE_PAYMENT_PROFILE_INVITEREP";
		} else if (angular.isDefined($rootScope.forceToShoppingCartCheckout) && $rootScope.forceToShoppingCartCheckout) {
			eventObject.action = "SAVE_PAYMENT_PROFILE_FORCE";
		}
		eventObject.label += "#responseCode:" + responseCode + "#uID:" + uID + "#paymentDetailId:" + mKey;
		$injector.get(serviceName)[operationName](params).then(function (result) {
			if (result.data && result.data.status === "error") {
				if (result.data.errorData.ResponseError[0].errorCode === '20017') {
					eventObject.value = 0;
					eventObject.label += "#errorCode:" + result.data.errorData.ResponseError[0].errorCode + "#errorMessage:" + result.data.errorData.ResponseError[0].longMessage;
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.enablePCILoading = false;
					$scope.validationServicesErrorMessage = result.data.errorData.ResponseError[0].longMessage;
					$modal.open({
						templateUrl: 'views/printBadge/validationFailurePopup.html?rnd=' + appCon.globalCon.deployDate,
						backdrop: 'static',
						keyboard: false,
						scope: $scope,
						controller: function ($scope, $modalInstance, $window) {
							$scope.closeAndReload = function () {
								$modalInstance.close();
								var urlIndex = ($location.absUrl()).indexOf('/#/'), baseUrl;
								if (urlIndex !== -1) {
									baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
								} else {
									var contextPath = ($location.absUrl()).split('/')[3];
									baseUrl = ($location.absUrl()).split("/" + contextPath + "/");
									baseUrl = baseUrl[0] + "/" + contextPath;
								}
								window.top.location.href = baseUrl;
							};
						}
					});
				} else {
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					eventObject.label += "#errorCode:" + result.data.errorData.ResponseError[0].errorCode + "#errorMessage:" + $scope.serviceResponseError;
					eventObject.value = 0;
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.enablePCILoading = false;
				}
			} else if (result.data && result.data.status === 'success') {
				$rootScope.$emit("callAnalyticsController", eventObject);
				if (result.data.successData.Status === 'Ok') {
					if (angular.isDefined($rootScope.showPaymentElement) && angular.isDefined($rootScope.showPaymentElement.showIncrementalPayment) === true && $state.current.name === 'manage.inviteReps') {
						$rootScope.showInviteRepElement();
					} else {
						var params = {}, serviceName = 'shoppingCartServices', operationName = 'deleteUserOASmall';
						if (angular.isDefined(result.data.successData.deletedUserOids)) {
							var eventDeleteObject = {
								"category": "SHOPPING_CART",
								"action": "DELETE_REPS_CALLBACK",
								"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#orderAmount:" + $rootScope.orderAmount + "#deletedUserOids:" + result.data.successData.deletedUserOids,
								"value": 1
							};
							params.userOids = result.data.successData.deletedUserOids;
							$injector.get(serviceName)[operationName](params).then(
								function (result) {
									if (result.data && result.data.errorData) {
										eventDeleteObject.label += result.data.errorData.ResponseError[0].longMessage;
										eventDeleteObject.value = 0;
									}
									$rootScope.$emit("callAnalyticsController", eventDeleteObject);
									$scope.updatePaymentAndNavigation();
								});
						} else {
							$scope.updatePaymentAndNavigation();
						}
					}
				}
			}
		});
	};

	$scope.updatePaymentAndNavigation = function () {
		var modalInstance = $modal.open({
			templateUrl: 'views/shoppingCart/shoppingCartCheckoutConfirmPopup.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance) {
				$scope.goSCSuccessNavPage = function () {
					$modalInstance.close();
					var urlIndex = ($location.absUrl()).indexOf('/#/'), baseUrl;
					if (urlIndex !== -1) {
						baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
					} else {
						var contextPath = ($location.absUrl()).split('/')[3];
						baseUrl = ($location.absUrl()).split("/" + contextPath + "/");
						baseUrl = baseUrl[0] + "/" + contextPath;
					}
					window.top.location.href = baseUrl;
				};
			}
		});
	};

	$scope.navAccountsScreen = function (param) {
		if ($state.current.name === 'manage.inviteReps') {
			$rootScope.showInviteRepElement();
		} else if ($rootScope.eligibilityDetails.unPaidUser === true) {
			$rootScope.eligibilityDetails.unPaidUser = false;
			delete $rootScope.eligibilityDetails.expirationDate;
			$state.go('home', { relaod: true });
		} else {
			$state.go('accounts.manageAccounts');
		}
	};
	/*** billing & payment code starts 		***/
	/*** Buyup screens code for R-33 starts ****/
	$scope.openBuyupUser = function () {
		$scope.showBuyupUserError = false;
		$modal.open({
			templateUrl: 'views/shoppingCart/buyupUser.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance, $state) {
				$scope.updateBuyupUser = function (buyupUserCount) {
					$scope.showBuyupUserError = false;
					if (buyupUserCount <= '5') {
						$injector.get("shoppingCartServices")["updateBuyupUsers"]().then(function (response) {
							if (response.data.status === 'success') {
								$modalInstance.close();
								$state.go('shoppingCart.shoppingCartSummary', {}, { reload: true });
							}
						});
					} else {
						$scope.showBuyupUserError = true;
					}
				}
			}
		});
	}
	/*** Buyup screens code for R-33  Ends****/
	//mock 3 starts...
	$scope.navCardSummary = function () {
		var cardParam = { 'fein': $rootScope.userProfile.detail.fein };
		var eventObject = {
			"category": "OA_RENEWAL_CARD",
			"action": "GET_RENEWAL_CARD_PROFILE",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid,
			"value": 1
		};
		$injector.get('shoppingCartServices')['getLatestCardProfile'](cardParam).then(function (result) {
			if (result.data.status === 'success') {
				$rootScope.$emit("callAnalyticsController", eventObject);
				if (result.data.successData.cardProfileDetail && angular.isUndefined(result.data.successData.cardProfileDetail.nameOnCard)) {
					$scope.showCardProfileSuccessPopup();
				} else {
					$rootScope.getCCDetails = result.data.successData;
					$state.go('shoppingCart.cartSummary');
				}
			} else if (result.data && result.data.errorData && result.data.errorData.Status === 'Error' && result.data.errorData.ResponseError[0].longMessage) {
				eventObject.label += "#errorMessage:" + result.data.errorData.ResponseError[0].longMessage;
				eventObject.value = 0;
				$rootScope.$emit("callAnalyticsController", eventObject);
				$scope.showCardProfileSuccessPopup();
			}
		});
	}


	$rootScope.isAlreadyBillingDetails = false;
	$rootScope.cardProfileReadOnly = false;
	$rootScope.showCardProfile = false;

	$scope.editPaymentMethod = function () {
		$rootScope.cardProfileReadOnly = false;
		$rootScope.isAlreadyBillingDetails = true;
	}

	$scope.showCardProfileSuccessPopup = function () {
		var modalInstance = $modal.open({
			templateUrl: 'views/shoppingCart/renewalProfileConfirmation.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'app-modal-window',
			controller: function ($scope, $modalInstance) {
				$scope.closeRenewalPopup = function () {
					$modalInstance.close();
				};
				$scope.continueRenewalPopup = function () {
					$modalInstance.close();
					$state.go('shoppingCart.cartSummary');
					$rootScope.cardProfileReadOnly = true;
					$rootScope.isAlreadyBillingDetails = true;
					//$scope.personalCardProfileConfirmationPopup();
				};
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

	$scope.personalCardProfileConfirmationPopup = function () {
		var modalInstance = $modal.open({
			templateUrl: 'views/shoppingCart/personalProfileConfirmation.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'app-modal-window',
			controller: function ($scope, $modalInstance) {
				$scope.closePersonalPopup = function () {
					$modalInstance.close();
					$rootScope.isAlreadyBillingDetails = false;
					$rootScope.showCardProfile = false;
					//$scope.saveCardProfile(false);
					$state.go('shoppingCart.shoppingCartSummary');
				};
				$scope.continuePersonalPopup = function () {
					$modalInstance.close();
					$rootScope.isAlreadyBillingDetails = false;
					$rootScope.showCardProfile = false;
					$scope.updatePersonalCardProfile();
				};
			}
		});
	};

	$scope.saveCardProfile = function () {
		var cardProfileSaveParams = { 'cardProfileId': $scope.cardProfileMongoId, "itemId": appCon.data.pendingOrderDetails.id };
		var eventObject = {
			"category": "OA_RENEWAL_CARD",
			"action": "SAVE_RENEWAL_CARD_PROFILE",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#cardProfileId:" + $scope.cardProfileMongoId + "#itemId:" + appCon.data.pendingOrderDetails.id,
			"value": 1
		};
		$injector.get('shoppingCartServices')['savePaymentCardDetails'](cardProfileSaveParams).then(function (result) {
			if (result.data && result.data.errorData) {
				if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					eventObject.label += "#errorMessage:" + $scope.serviceResponseError;
					eventObject.value = 0;
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.loading = false;
				}
			} else if (result.data && result.data.successData) {
				if (result.data.successData.Status === 'Ok') {
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.loading = false;
					$scope.cardProfileOid = result.data.successData.renewalCardProfileOid;
					$scope.personalCardProfileConfirmationPopup();
				}
			}
		});
	};


	$scope.updatePersonalCardProfile = function () {
		var cardProfileUpdateParams = { 'cardProfileOid': $scope.cardProfileOid, "userOid": $rootScope.userProfile.id };
		var eventObject = {
			"category": "OA_RENEWAL_CARD",
			"action": "UPDATE_RENEWAL_CARD_PROFILE",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#cardProfileId:" + $scope.cardProfileMongoId + "#itemId:" + appCon.data.pendingOrderDetails.id,
			"value": 1
		};
		$injector.get('shoppingCartServices')['updatePersonalCardDetails'](cardProfileUpdateParams).then(function (result) {
			if (result.data && result.data.errorData) {
				if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					eventObject.label += "#errorMessage:" + $scope.serviceResponseError;
					eventObject.value = 0;
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.loading = false;
				}
			} else if (result.data && result.data.successData) {
				if (result.data.successData.Status === 'Ok') {
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.loading = false;
					$state.go('shoppingCart.shoppingCartSummary');
				}
			}
		});
	};


	$rootScope.isEnabledRestoreBtn = appCon.data.isOrderCancelled;
	$scope.navPendingOrderPopup = function () {
		$scope.cancelOrderResponseError = '';
		$modal.open({
			templateUrl: 'views/shoppingCart/cancelPendingOrderPopup.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'app-modal-window',
			controller: function ($scope, $modalInstance) {
				$scope.continuePendingPopup = function (formId) {
					$scope.updateOrderCancelStatus(formId, $modalInstance, true);
				};
			}
		});
	};

	$scope.updateOrderCancelStatus = function (formId, modalInstance, isCancel) {
		var eventObject = {
			"category": "SHOPPING_CART",
			"action": "SHOPPING_CART_CANCEL_PENDING_ORDER",
			"label": "email:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#globalProfileOid:" + appCon.data.orderGrpOid + "#isCancel:" + isCancel,
			"value": 1
		};
		var params = {
			"globalProfileOid": appCon.data.orderGrpOid,
			"cancelOrder": "",
			"fein": $rootScope.userProfile.detail.fein,
			"userOid": $rootScope.userProfile.id
		};
		params.cancelOrder = isCancel ? "TRUE" : "FALSE";
		$scope.cancelOrderLoading = true;
		var popupForm = document.getElementById(formId);
		disableAll(popupForm);
		$injector.get("shoppingCartServices")["cancelRenewalOrder"](params).then(
			function (result) {
				$scope.cancelOrderLoading = false;
				enableAll(popupForm);
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						eventObject.value = 0;
						eventObject.label += "#errorMessage:" + result.data.errorData.ResponseError[0].longMessage;
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						$scope.cancelOrderResponseError = result.data;
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok') {
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						appCon.data.isOrderCancelled = isCancel;
						$rootScope.isEnabledRestoreBtn = isCancel;
						$rootScope.showRenewalFlow = true;
					}
					modalInstance.close();
				}
			});
	};

	$scope.restoreCancelPendingOrderPopup = function () {
		$scope.cancelOrderResponseError = '';
		$modal.open({
			templateUrl: 'views/shoppingCart/restoreCancelOrderPopup.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			windowClass: 'app-modal-window',
			controller: function ($scope, $modalInstance) {
				$scope.continueRestorePopup = function (formId) {
					$scope.updateOrderCancelStatus(formId, $modalInstance, false);
				};
			}
		});
	};

	$scope.showBillingInfoReadOnly = function () {
		$rootScope.isAlreadyBillingDetails = true;
		$rootScope.cardProfileReadOnly = true;
	}

	$scope.showCardSummary = function () {
		if (angular.isDefined($scope.getCCDetails)) {
			$rootScope.isAlreadyBillingDetails = false;
			$rootScope.cardProfileReadOnly = false;
		} else {
			$state.go('shoppingCart.shoppingCartSummary');
		}
	}

	$scope.navSCSummary = function () {
		$state.go('shoppingCart.shoppingCartSummary');
	}

	$scope.navBackToSummary = function () {
		$rootScope.showRenewalFlow = true;
	}

	$scope.showBillingPage = function () {
		$rootScope.cardProfileReadOnly = true;
		$rootScope.isAlreadyBillingDetails = true;
		$scope.enableIframe = false;
		$rootScope.showCardProfile = false;
	}

	//for EditRenewal Order

	$scope.goToCardProfilePage = function (cardProfile) {
		$rootScope.paymentTechEnable = appCon.globalCon.pci.enable;
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
		appCon.data.cardProfile.callbackUrl = appCon.globalCon.pci.shoppingCartCardProfile_callback_url;
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
			"action": "RENEWAL_CARD_UPDATE_GET_PAYMENT_UID",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable,
			"value": 1
		};
		$rootScope.cardProfileReadOnly = false;
		$injector.get('dashboardServices')['getPaymentTechUID'](getUIDObject).then(function (result) {
			if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
				$scope.loading = false;
			}
			if (result && result.data && result.data.successData && result.data.successData.Status === 'Ok') {
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

	$scope.completeCRECardProfileAndUpdate = function (responseObject) {
		$scope.loading = false;
		$scope.updateCardProfileDetailsToMongo(responseObject.code, responseObject.message, responseObject.uID);
	};

	$scope.updateCardProfileDetailsToMongo = function (responseCode, message, uID) {
		var params = {}, succMongoId, isErrorOnPayment = false;
		params.cardProfileVO = { 'responseCode': responseCode, 'message': message, 'uID': uID };
		if (angular.isDefined(responseCode) && responseCode != '000') {
			isErrorOnPayment = true;
		}
		var eventObject = {
			"category": "CARD_PROFILE",
			"action": "RENEWAL_CARD_UPDATE_PROFILE_LOCAL",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable,
			"value": 1
		};
		$injector.get("cardServices")['updateLocalCardProfile'](params).then(function (result) {
			if (result.data && result.data.successData && result.data.status === 'success') {
				eventObject.label += "#status:" + result.data.status;
				$rootScope.$emit("callAnalyticsController", eventObject);
				succMongoId = result.data.successData.cardProfileVO.id;
				$scope.cardProfileMongoId = succMongoId;
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
					$scope.saveCardProfile();
					//$scope.updateCardProfile(succMongoId);
				}
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				$scope.loading = false;
				eventObject.label += "#status:" + result.data.status + "errorMessage:" + result.data.errorData.ResponseError[0].longMessage;
				$rootScope.$emit("callAnalyticsController", eventObject);
			}
		});
	};

	$scope.updateCardProfile = function (mKey) {
		$scope.serviceResponseError = '';
		var eventObject = {
			"category": "CARD_PROFILE",
			"action": "RENEWAL_CARD_UPDATE_PROFILE",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable,
			"value": 1
		};

		var cardProfileUpdateParams = {};
		cardProfileUpdateParams = { 'cardProfileMongoID': mKey };
		$injector.get('cardServices')['updateCardProfile'](cardProfileUpdateParams).then(function (result) {
			if (result.data && result.data.errorData) {
				if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
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
				}
			}
		});
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
			if (isCardErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Please check the credit card information entered and try again.';
			} else if (isPaymentErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Your payment method was not accepted. Please try another card or contact your financial institution.';
			} else if (isBankErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.cardProfile.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
			} else {
				errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.cardProfile.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
			}
		}
		var eventObject = {
			"category": "CARD_PROFILE",
			"action": "RENEWAL_CARD_UPDATE_PROFILE_ERROR",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#userOid:" + $rootScope.userProfile.id + "#vendorOid:" + $rootScope.userProfile.detail.vendorOid + "#vendorDetailsOid:" + $rootScope.userProfile.detail.vendorDetailOid + "#paymentTechEnable:" + $rootScope.paymentTechEnable + "#ErrorMessage:" + errorMessage,
			"value": 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.updateCardProfileDetailsToMongo(errorCode, errorMessage, appCon.data.cardProfile.uID);
	};

	$scope.completeCRECardProfileAndUpdate = function (responseObject) {
		$scope.loading = false;
		$scope.updateCardProfileDetailsToMongo(responseObject.code, responseObject.message, responseObject.uID);
	};

	$scope.creHandleCardProfileErrorsAndUpdate = function () {
		console.log("creHandleErrorsAndUpdate");
	};

}]);

var completeHPShoppingCart,
	startHostedPaymentShoppingCart,
	hostedHandleDetailErrorsSCOA,
	hostedHandleErrorsSCOA,
	completeHPSCCardProfile,
	startHostedPaymentSCCardProfile,
	hostedHandleDetailErrorsSCCardProfile,
	hostedHandleErrorsSCCardProfile;

completeHPShoppingCart = function (responseObject) {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_CARD_SHOPPING_CART_PAYMENT_PROCESS_END',
			'label': '',
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	angular.forEach(responseObject, function (value, key) {
		eventObject.label += '#' + key + ':' + value;
	});
	eventObject.label += '#localDate:' + new Date();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.completeCREShoppingCartAndUpdate(responseObject);
};

startHostedPaymentShoppingCart = function () {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_CARD_SHOPPING_CART_PAYMENT_PROCESS_START',
			'label': 'UID:' + appCon.data.scBillingDetails.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.startCREShoppingCartLoading();
};

hostedHandleDetailErrorsSCOA = function (errorCode, gatewayCode, gatewayMessage) {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_CARD_SHOPPING_CART_PAYMENT_ERROR_CALLBACK',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.scBillingDetails.uID + '#gatewayCode:' + gatewayCode + '#gatewayMessage:' + gatewayMessage + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleShoppingCartDetailErrorsAndUpdate(errorCode, gatewayCode, gatewayMessage);
};

hostedHandleErrorsSCOA = function (errorCode) {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_CARD_SHOPPING_CART_PAYMENT_ERROR',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.scBillingDetails.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleShoppingCartErrorsAndUpdate(errorCode);
};

// For Edit Rewenwal Card

completeHPSCCardProfile = function (responseObject) {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_OA_RENEWAL_CARD_PROFILE_PAYMENT_PROCESS_END',
			'label': '',
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	angular.forEach(responseObject, function (value, key) {
		eventObject.label += '#' + key + ':' + value;
	});
	eventObject.label += '#localDate:' + new Date();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.completeCRECardProfileAndUpdate(responseObject);
};

startHostedPaymentSCCardProfile = function () {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_OA_RENEWAL_CARD_PROFILE_PAYMENT_PROCESS_START',
			'label': 'UID:' + appCon.data.cardProfile.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.startCRECardProfileLoading();
};

hostedHandleDetailErrorsSCCardProfile = function (errorCode, gatewayCode, gatewayMessage) {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_OA_RENEWAL_CARD_PROFILE_PAYMENT_ERROR_CALLBACK',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.cardProfile.uID + '#gatewayCode:' + gatewayCode + '#gatewayMessage:' + gatewayMessage + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleDetailCardProfileErrorsAndUpdate(errorCode, gatewayCode, gatewayMessage);
};

hostedHandleErrorsSCCardProfile = function (errorCode) {
	var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'UPDATE_OA_RENEWAL_CARD_PROFILE_PAYMENT_ERROR',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.cardProfile.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#shoppingCartContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleCardProfileErrorsAndUpdate(errorCode);
};
