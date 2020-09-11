'use strict';
angular.module(appCon.appName).controller('cardManagementController',
	[
		'$scope', '$modal', '$injector', '$rootScope', '$state', '$sce',
		function ($scope, $modal, $injector, $rootScope, $state, $sce) {
			var cardManagementServices = $injector.get('cardManagementServices');
			$scope.cardProfileBillingAddress = {};
			$scope.editBillingAddressDetails = {};
			$scope.cardList = [];
			$scope.isNewCardAddPageActive = true;
			$scope.editCardIndex = 0;
			$scope.selectedCardType = '';
			$scope.isCorporateCardAvailable = false;
			$scope.isPrimaryCardAvailable = false;
			$scope.isSecondaryCardAvailable = false;
			$scope.isPrecedenceAddressSelected = false;
			$scope.hasSupplierSuperAdmin = false;
			$rootScope.paymentTechEnable = appCon.globalCon.pci.enable;
			$scope.enableIframe = false;
			$scope.servciesErrorMessage = '';
			$scope.setCardAsPrimary = {
				type: null
			};
			$scope.selectedCardOId = '';
			$scope.expiryYears = [];
			$scope.serverDate = '';
			$scope.paymentTechUID = '';
			$scope.isCardSaveFailure = false;

			$scope.goToPaymentCardDetailsPage = function (cardProfile) {
				$scope.servciesErrorMessage = '';
				$scope.cardProfileBillingAddress = cardProfile || $scope.cardProfileBillingAddress;
				appCon.data.cardProfile = {};
				appCon.data.cardProfile = angular.copy(cardProfile);
				$scope.loading = true;
				$scope.isCardSaveFailure = false;
				if ($rootScope.paymentTechEnable === 'true') {
					$scope.paymentTechUID = '';
					$scope.getPaymentIframeURL();
					$scope.enableIframe = true;
				} else {
					$scope.enableIframe = false;
				}
			};

			$scope.backToBillingAddressPage = function () {
				$scope.servciesErrorMessage = '';
				$scope.loading = false;
				$state.go('myProfile.cardManagement.addNewCardPayment');
			};

			$scope.openAddNewCardPaymentPage = function () {
				$scope.loading = false;
				$scope.cardProfileBillingAddress = {};
				$scope.isPrecedenceAddressSelected = false;
				// Need to check again the get card list api call
				$scope.getCardList('addNewPayment');
			};

			$scope.backToCardListPage = function () {
				$scope.servciesErrorMessage = '';
				$scope.loading = false;
				$scope.cardProfileBillingAddress = {};
				$scope.isPrecedenceAddressSelected = false;
				$scope.getCardList();
			};

			$scope.goToEditPaymentCardDetailsPage = function () {
				if ($rootScope.paymentTechEnable === 'true') {
					$scope.paymentTechUID = '';
					$scope.getPaymentIframeURL();
					$scope.enableIframe = true;
				} else {
					$scope.enableIframe = false;
				}
				$scope.selectedCardOId = $scope.editBillingAddressDetails.oid;
				$state.go('myProfile.cardManagement.paymentCardDetails.edit', {cardProfileOid: $scope.selectedCardOId});
			};

			$scope.showHidePanel = function (card) {
				card.isOpen = !card.isOpen;
			};

			$scope.setCardType = function (selectedCardType) {
				$scope.selectedCardType = selectedCardType;
			};

			$scope.checkCardExpired = function (card) {
				var endDate = moment([card.expirationYear, (card.expirationMonthCode - 1)]).endOf('month').format('DD');
				var cardExpiryDate = moment([card.expirationYear, (card.expirationMonthCode - 1), endDate]);
				var todayDate = moment($scope.serverDate);
				return cardExpiryDate.diff(todayDate, 'days') < 0;
			};

			$scope.checkCardExpireSoon = function (card) {
				var endDate = moment([card.expirationYear, (card.expirationMonthCode - 1)]).endOf('month').format('DD');
				var cardExpiryDate = moment([card.expirationYear, (card.expirationMonthCode - 1), endDate]);
				var todayDate = moment($scope.serverDate);
				var days = cardExpiryDate.diff(todayDate, 'days');
				return days <= 30 && days >= 0;
			};

			$scope.openPaymentCardEditConfirmationPopup = function (card) {
				$scope.editBillingAddressDetails = card;
				$modal.open({
					templateUrl: 'views/myProfile/paymentCardEditConfirmationPopUp.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					scope: $scope,
					windowClass: 'commonDialogW30'
				});
			};

			$scope.openPaymentCardRemoveConfirmationPopup = function (selectedCardOId) {
				$scope.selectedCardOId = selectedCardOId;
				$modal.open({
					templateUrl: 'views/myProfile/paymentCardRemoveConfirmationPopup.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					scope: $scope,
					windowClass: 'commonDialogW30',
					controller: function ($scope) {
						$scope.removePaymentCard = function () {
							$scope.$parent.popupLoading = true;
							$scope.removePaymentMethod();
						};
					}
				});
			};

			$scope.openPaymentCardBillingAddressUpdatedSuccessPopup = function () {
				$scope.hidePaymentCardBillingAddress();
				$modal.open({
					templateUrl: 'views/myProfile/paymentCardBillingAddressUpdatedSuccessPopup.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					scope: $scope,
					windowClass: 'commonDialogW40'
				});
			};

			$scope.showPaymentCardBillingAddress = function (card) {
				card.isShowEditCardBillingAddressForm = true;
				$scope.editBillingAddressDetails = card;
			};

			$scope.selectPrecedenceBillingAddress = function (event) {
				$scope.isPrecedenceAddressSelected = event.target.checked;
				if ($scope.isPrecedenceAddressSelected) {
					$scope.cardProfileBillingAddress = _.find($scope.cardList, function (card) {
						return card.cardCategory === 'CORPORATE' || (card.cardCategory === 'INDIVIDUAL' && card.primaryCard);
					});
				} else {
					$scope.cardProfileBillingAddress = {};
				}
			};

			$scope.openChangeCardTypeConfirmationPopup = function (selectedCardDetails) {
				$scope.selectedCardDetails = selectedCardDetails;
				$modal.open({
					templateUrl: 'views/myProfile/paymentCardTypeChangeConfirmationPopup.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					windowClass: 'commonDialogW30',
					scope: $scope,
					controller: function () {
						$scope.updateCardType = function () {
							$scope.$parent.popupLoading = true;
							$scope.updateSecondaryToPrimaryCardType();
						};
					}
				});
			};

			$scope.closeCardErrorMessage = function() {
				$scope.servciesErrorMessage = '';
			};

			/**
			 * Payment tech page related stuff
			 */
			$scope.iframeLoadedCallBack = function () {
				if ($scope.paymentTechUID) {
					$scope.loading = false;
				}
			};

			$scope.showNewCardPaymentSuccessPopup = function () {
				$modal.open({
					templateUrl: 'views/myProfile/paymentCardSavedSuccessPopup.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					scope: $scope,
					windowClass: 'commonDialogW25'
				});
			};

			/**
			 * Card Management Services
			 */
			$scope.getCardList = function (isFrom) {
				$scope.servciesErrorMessage = '';
				$scope.cardList = [];
				$scope.isCorporateCardAvailable = false;
				$scope.isPrimaryCardAvailable = false;
				$scope.isSecondaryCardAvailable = false;
				if (isFrom !== 'addNewPayment') {
					$state.go('myProfile.cardManagement.cardList');
				}
				$scope.popupLoading = true;
				var params = {
					userId: $rootScope.userProfile.id,
					vendorOid: $rootScope.userProfile.detail.vendorOid
				};
				cardManagementServices.getCardDetails(params).then(function (response) {
					$scope.popupLoading = false;
					if ($scope.checkSuccessResponseHandler(response)) {
						$scope.cardList = response.data.successData.response.cardList || [];
						$scope.corporateCardRegistered = response.data.successData.response.corporateCardRegistered;
						if ($scope.cardList.length) {
							$scope.cardList.map(function (card) {
								card.isOpen = false;
								return card;
							});
							$scope.isCorporateCardAvailable = $scope.cardList.some(function (card) {
								return card.cardCategory === 'CORPORATE';
							});
							$scope.isPrimaryCardAvailable = $scope.cardList.some(function (card) {
								return card.cardCategory === 'INDIVIDUAL' && card.primaryCard;
							});
							$scope.isSecondaryCardAvailable = $scope.cardList.some(function (card) {
								return card.cardCategory === 'INDIVIDUAL' && !card.primaryCard;
							});
						}
						if ($scope.hasSupplierSuperAdmin) {
							$scope.selectedCardType = $scope.isCorporateCardAvailable ?
								'primary' :
								'corporate';
						} else {
							$scope.selectedCardType = 'primary';
						}
						// check its come from add New Payment button click
						if (isFrom !== 'addNewPayment' || (($scope.cardList.length >= 3 && $scope.hasSupplierSuperAdmin) || ($scope.cardList.length >= 2 && !$scope.hasSupplierSuperAdmin))) {
							var page = $scope.cardList.length ?
								'myProfile.cardManagement.cardList' :
								'myProfile.cardManagement.addNewCardPayment';
							$state.go(page);
						} else {
							$state.go('myProfile.cardManagement.addNewCardPayment');
						}
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			$scope.updateSecondaryToPrimaryCardType = function () {
				$scope.servciesErrorMessage = '';
				$scope.popupLoading = true;
				var cardProfile = {
					primaryCard: true
				};
				var params = {
					userId: $rootScope.userProfile.id,
					cardId: $scope.selectedCardDetails.oid,
					cardProfile: JSON.stringify(cardProfile)
				};
				cardManagementServices.update(params).then(function (response) {
					$scope.popupLoading = false;
					if ($scope.checkSuccessResponseHandler(response)) {
						$scope.getCardList();
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			$scope.removePaymentMethod = function () {
				$scope.servciesErrorMessage = '';
				$scope.popupLoading = true;
				var params = {
					userId: $rootScope.userProfile.id,
					cardId: $scope.selectedCardOId
				};
				cardManagementServices.deleteById(params).then(function (response) {
					$scope.popupLoading = false;
					if ($scope.checkSuccessResponseHandler(response)) {
						$scope.getCardList();
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			$scope.updatePaymentCardBillingAddress = function (card) {
				cardManagementServices.updateCardList(card).then(function (response) {
					if ($scope.checkSuccessResponseHandler(response)) {
						$scope.openPaymentCardBillingAddressUpdatedSuccessPopup();
					}
					if ($scope.checkFailureResponseHandler()) {
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			/**
			 * Payment tech related services
			 */
			$scope.submitCardDetails = function (cardProfileData) {
				$scope.servciesErrorMessage = '';
				$scope.loading = true;
				Object.assign(appCon.data.cardProfile, cardProfileData);
				cardManagementServices.submitCardDetails().then(function (response) {
					$scope.loading = false;
					if ($scope.checkSuccessResponseHandler(response)) {
						$scope.showNewCardPaymentSuccessPopup();
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			$scope.saveCardDetails = function () {
				$scope.loading = true;
				$scope.servciesErrorMessage = '';
				var params = {
					userOid: $rootScope.userProfile.id,
					uId: $scope.paymentTechUID
				};
				cardManagementServices.saveCardDetails(params).then(function (response) {
					$scope.loading = false;
					if ($scope.checkSuccessResponseHandler(response)) {
						$scope.showNewCardPaymentSuccessPopup();
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.isCardSaveFailure = true;
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			$scope.updateCardDetails = function () {
				$scope.loading = true;
				$scope.servciesErrorMessage = '';
				var params = {
					userId: $rootScope.userProfile.id,
					cardId: $scope.selectedCardOId,
					uId: $scope.paymentTechUID
				};
				cardManagementServices.updateCardDetails(params).then(function (response) {
					$scope.loading = false;
					if ($scope.checkSuccessResponseHandler(response)) {
						$scope.showNewCardPaymentSuccessPopup();
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.isCardSaveFailure = true;
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			/**
			 * Payment tech related services
			 */
			$scope.getPaymentIframeURL = function () {
				var profileParam = {
					customerEmail: $rootScope.userProfile.detail.email,
					customerAddress: $scope.cardProfileBillingAddress.billingAddress1,
					customerAddress2: $scope.cardProfileBillingAddress.billingAddress2,
					customerCity: $scope.cardProfileBillingAddress.billingCity,
					customerState: $scope.cardProfileBillingAddress.billingStateCode,
					customerPostalCode: $scope.cardProfileBillingAddress.billingZip,
					customerCountry: $scope.cardProfileBillingAddress.billingCountryCode,
					callbackUrl: appCon.globalCon.pci.cardManagement_callback_url,
					cssUrl: appCon.globalCon.pci.cardprofile_css_url,
					hostedTokenize: 'store_only',
					requestFor: 'CARD_PROFILE',
					userOid: $rootScope.userProfile.id,
					vendorOid: $rootScope.userProfile.detail.vendorOid,
					primaryCard: !($scope.selectedCardType === 'primary' && $scope.isPrimaryCardAvailable),
					cardProfileOid: _.includes($state.current.name, 'edit') ?
						$scope.editBillingAddressDetails.oid :
						null,
					cardCategory: ($scope.hasSupplierSuperAdmin && $scope.selectedCardType === 'corporate') ?
						'CORPORATE' :
						'INDIVIDUAL'
				};
				var getUIDObject = {
					profileRequest: JSON.stringify(profileParam)
				};
				var eventObject = {
					category: 'CARD_PROFILE',
					action: 'NORMAL_GET_PAYMENT_UID',
					label: 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#userOid:' + $rootScope.userProfile.id + '#vendorOid:' + $rootScope.userProfile.detail.vendorOid + '#vendorDetailsOid:' + $rootScope.userProfile.detail.vendorDetailOid + '#paymentTechEnable:' + $rootScope.paymentTechEnable,
					value: 1
				};
				cardManagementServices.generateTransactionUid(getUIDObject).then(function (response) {
					if ($scope.checkSuccessResponseHandler(response)) {
						if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
							$scope.loading = false;
						}
						$scope.paymentTechUID = response.data.successData.responseHeaderMap.Uid;
						var UIDKey = 'uID=' + $scope.paymentTechUID;
						$scope.cardManagementURL = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL + UIDKey);
						$rootScope.$emit('callAnalyticsController', eventObject);
						$state.go('myProfile.cardManagement.paymentCardDetails');
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.loading = false;
						eventObject.label += '#errorMessage:' + (response.response && response.response.detail || response.statusPhrase);
						eventObject.value = 0;
						$rootScope.$emit('callAnalyticsController', eventObject);
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			$scope.addCardProfileDetailsToMongo = function (responseCode, message, uId) {
				$scope.loading = true;
				var isErrorOnPayment = false;
				var cardProfileParam = {
					responseCode: responseCode,
					message: message
				};
				var params = {
					uId: uId,
					cardProfile: JSON.stringify(cardProfileParam)
				};
				if (angular.isDefined(responseCode) && responseCode !== '000') {
					isErrorOnPayment = true;
				}
				var eventObject = {
					category: 'CARD_PROFILE',
					action: 'ADD_CARD_PROFILE_LOCAL',
					label: 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#userOid:' + $rootScope.userProfile.id + '#vendorOid:' + $rootScope.userProfile.detail.vendorOid + '#vendorDetailsOid:' + $rootScope.userProfile.detail.vendorDetailOid + '#paymentTechEnable:' + $rootScope.paymentTechEnable,
					value: 1
				};
				cardManagementServices.updateTransactionStatus(params).then(function (response) {
					$scope.loading = false;
					if ($scope.checkSuccessResponseHandler(response)) {
						eventObject.label += '#status:' + response.data.status;
						$rootScope.$emit('callAnalyticsController', eventObject);
						if (isErrorOnPayment) {
							$scope.servciesErrorMessage = message;
							$scope.getPaymentIframeURL();
							$scope.loading = true;
						} else {
							_.includes($state.current.name, 'edit') ?
								$scope.updateCardDetails() :
								$scope.saveCardDetails();
						}
					}
					if ($scope.checkFailureResponseHandler(response)) {
						$scope.isCardSaveFailure = true;
						eventObject.label += '#status:' + response.data.status + 'errorMessage:' + (response.response && response.response.detail || response.statusPhrase);
						$rootScope.$emit('callAnalyticsController', eventObject);
						$scope.handleServerError(response.data.successData);
					}
				});
			};

			/**
			 * Handled Payment tech chase call back functions
			 */
			$scope.cmCompletedSavedPaymentMethod = function (responseObject) {
				$scope.servciesErrorMessage = '';
				$scope.loading = false;
				$scope.addCardProfileDetailsToMongo(responseObject.code, responseObject.message, responseObject.uID);
			};

			$scope.cmStartingPaymentMethodSave = function () {
				$scope.servciesErrorMessage = '';
				$scope.loading = true;
			};

			$scope.cmPaymentMethodDetailErrorsHandler = function (errorCode, gatewayCode) {
				var isPaymentErrorCodeArray = ['01', '05', '43', '60', '61', '62', '63', 'L2', '360'];
				var isCardErrorCodeArray = ['74', '200', '310', '315', '320', '330', '340', '350', '355', '357', '370', '500', '510', '520', '530', '531', '550', 'H9', '500', ''];
				var isBankErrorCodeArray = ['03', '12', 'B5', '79', '77', 'R4', '600', '610', '620', '630', '640', '100', '110', '300', '400'];
				var errorMessage;
				if (angular.isDefined(gatewayCode)) {
					// var gatewayCode = gatewayCode;
					// var gatewayMessage = gatewayMessage;
				}
				var errorCodeSplit = errorCode.split('|');
				for (var errorCount = 0; errorCount < errorCodeSplit.length; errorCount += 1) {
					if (isCardErrorCodeArray.indexOf(errorCodeSplit[errorCount]) !== '-1') {
						errorMessage = 'Please check the credit card information entered and try again.';
					} else if (isPaymentErrorCodeArray.indexOf(errorCodeSplit[errorCount]) !== '-1') {
						errorMessage = 'Your payment method was not accepted. Please try another card or contact your financial institution.';
					} else if (isBankErrorCodeArray.indexOf(errorCodeSplit[errorCount]) !== '-1') {
						errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.cardProfile.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
					} else {
						errorMessage = 'Please contact the <a target="_blank" href="' + appCon.data.cardProfile.customerCareURL + '">Customer Care</a> and provide error code ' + responseCode + '.';
					}
				}
				var eventObject = {
					category: 'CARD_PROFILE',
					action: 'ADD_CARD_PROFILE_ERROR',
					label: 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#userOid:' + $rootScope.userProfile.id + '#vendorOid:' + $rootScope.userProfile.detail.vendorOid + '#vendorDetailsOid:' + $rootScope.userProfile.detail.vendorDetailOid + '#paymentTechEnable:' + $rootScope.paymentTechEnable + '#ErrorMessage:' + errorMessage,
					value: 1
				};
				$rootScope.$emit('callAnalyticsController', eventObject);
				$scope.addCardProfileDetailsToMongo(errorCode, errorMessage, $scope.paymentTechUID);
			};

			$scope.cmPaymentMethodErrorsHandler = function () {
				// console.log('cmPaymentMethodErrorsHandler');
			};

			/**
			 * Handling Error for all services
			 */
			$scope.handleServerError = function (errorResponse) {
				$scope.servciesErrorMessage = '';
				if (errorResponse.statusCode !== '400') {
					$scope.servciesErrorMessage = 'Service is not available. Please try again later.';
				} else {
					$scope.servciesErrorMessage = (errorResponse.response && errorResponse.response.detail || errorResponse.statusPhrase);
				}
			};

			/**
			 * Initializa card management call
			 */
			$scope.initCardManagement = function () {
				$scope.hasSupplierSuperAdmin = $rootScope.canAccess('vm', 'CorporateCardButton');
				$scope.serverDate = angular.copy($rootScope.serverTime.serverDateTime);
				var date = new Date($scope.serverDate);
				var year = date.getFullYear();
				var range = [];
				range.push(year);
				for (var count = 1; count < 10; count += 1) {
					range.push(year + count);
				}
				$scope.expiryYears = range;
			};

			/**
			 * Check Success/Failure response
			 */
			$scope.checkSuccessResponseHandler = function (response) {
				return response.data && response.data.successData && response.data.successData.statusFlag === 'Ok';
			};

			$scope.checkFailureResponseHandler = function (response) {
				return response.data.successData.statusFlag === 'Error';
			};
		}
	]
);
/**
 * Payment tech chase call back functions
 */
var cmCompletedSavedPaymentMethod,
	cmStartingPaymentMethodSave,
	cmPaymentMethodDetailErrorsHandler,
	cmPaymentMethodErrorsHandler;

cmCompletedSavedPaymentMethod = function (responseObject) {
	angular.element($('#cardManagementContainer')).scope().cmCompletedSavedPaymentMethod(responseObject);
};

cmStartingPaymentMethodSave = function () {
	angular.element($('#cardManagementContainer')).scope().cmStartingPaymentMethodSave();
};

cmPaymentMethodDetailErrorsHandler = function (errorCode, gatewayCode, gatewayMessage) {
	angular.element($('#cardManagementContainer')).scope().cmPaymentMethodDetailErrorsHandler(errorCode, gatewayCode, gatewayMessage);
};

cmPaymentMethodErrorsHandler = function (errorCode) {
	angular.element($('#cardManagementContainer')).scope().cmPaymentMethodErrorsHandler(errorCode);
};
