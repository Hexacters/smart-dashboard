'use strict';
angular.module(appCon.appName).controller('manageRepController', ['$scope', '$window', '$state', '$modal', '$rootScope', '$injector', '$controller', '$stateParams', '$location', function ($scope, $window, $state, $modal, $rootScope, $injector, $controller, $stateParams, $location) {
	var authMode = appCon.globalCon.authentication.mode.toLowerCase();
	$rootScope.paymentTechEnable = appCon.globalCon.pci.enable;
	$scope.showIFrame = false;
	$rootScope.repAccountDetailsTitle = (angular.isDefined($rootScope.repAccountDetailsTitle)) ? $rootScope.repAccountDetailsTitle : 'Rep Account Details';
	$rootScope.repProfileLoginUrlLoading = (angular.isDefined($rootScope.repProfileLoginUrlLoading)) ? $rootScope.repProfileLoginUrlLoading : false;
	// Base url configuration
	var urlIndex = ($location.absUrl()).indexOf('/#/'), baseUrl;
	if (urlIndex !== -1) {
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	} else {
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/" + contextPath + "/");
		baseUrl = baseUrl[0] + "/" + contextPath;
	}
	$scope.getInitialvalue = function () {
		if (angular.isDefined($rootScope.previousState)) {
			var previousState = ['manage.repAccountDetails.documents.optionalDocuments', 'manage.repAccountDetails.documents.commonDocuments', 'manage.repAccountDetails.documents.accountSpecificDocuments', 'manage.repAccountDetails.repAccountsTab.documents.commonDocuments', 'manage.repAccountDetails.repAccountsTab.documents.optionalDocuments', 'paymentReceipt.grid', 'printBadge.prepareForVisit', 'requestAppointAccordion.request'];
			if (_.indexOf(previousState, $rootScope.previousState.name) !== -1) {
				$rootScope.repAccountDetails = false;
				$scope.showIFrame = true;
			} else {
				$rootScope.repAccountDetails = true;
			}
		} else {
			$rootScope.repAccountDetails = true;
		}
	};
	$scope.shareMyCredentialShow = true;
	$scope.accessRepAccountTitle = function (isFrom, vendorName, CompanyName, repName, customerOid, expressRegistered) {
		if (angular.isDefined(expressRegistered)) {
			$rootScope.expressRegistered = expressRegistered;
		} else {
			$rootScope.expressRegistered = false;
		}
		if (angular.isDefined(isFrom) && isFrom === 'associated') {
			$rootScope.fromAccordion = 'fromAssociatedCompanies';
		} else {
			delete $rootScope.fromAccordion;
		}
		CompanyName = CompanyName.replace(/<\/?[^>]+(>|$)/g, '');
		repName = repName.replace(/<\/?[^>]+(>|$)/g, '');
		vendorName = angular.isDefined(vendorName) ? vendorName.replace(/<\/?[^>]+(>|$)/g, '') : '';
		$rootScope.accountSelected = { "customerOid": customerOid, "customerCompanyName": CompanyName };
		$rootScope.repAccountDetails = false;
		if (isFrom === 'accounts') {
			repName = repName.split(',')[0] + " " + repName.split(',')[1];
			$rootScope.repAccountDetailsTitle = 'Rep Account Details for - ' + CompanyName + ' : ' + repName + ' : ' + vendorName;
		} else if (isFrom === 'associated') {
			$rootScope.repAccountDetailsTitle = 'Details for ' + vendorName;
		} else {
			$rootScope.repAccountDetailsTitle = 'Rep Account Details';
		}
	};

	$scope.reloadIframe = function () {
		$scope.iframeLoading = true;
		var exisitingUrl = $rootScope.repLoginUrl;
		$rootScope.repLoginUrl = exisitingUrl + (new Date()).getTime();
	}

	$scope.getRandomSpan = function () {
		return Math.floor((Math.random() * 6) + 1);
	};

	$scope.reloadIframeState = function () {
		$scope.iframeLoading = true;
		$state.go('manage.repAccountDetails.repAccountsTab', { 'random': $scope.getRandomSpan() });
	};

	$scope.shareMyCredential = function () {
		$scope.shareMyCredentialShow = false;
	};
	$scope.repAccountDetailsShow = function () {
		$rootScope.repAccountDetails = false;
	};

	$scope.showAccountIframeDetails = function (manageRepAccounts, isFrom, documentURL, fromUserEmail) {
		$scope.showIFrame = true;
		$rootScope.documentURL = documentURL;
		var registrationFlowEnabled, accountDetailsTitle, landingPageCode, registrationUIConfigUrl;
		registrationFlowEnabled = false;
		if (angular.isDefined(appCon.globalCon.enable) && angular.isDefined(appCon.globalCon.enable.new['registration'])) {
			registrationFlowEnabled = appCon.globalCon.enable.new['registration'];
		}
		if (angular.isDefined(registrationFlowEnabled) && registrationFlowEnabled === 'true') {
			if (angular.isDefined(manageRepAccounts.registrationCompleted) && manageRepAccounts.registrationCompleted === false && angular.isUndefined(fromUserEmail)) {
				$scope.showPendingRegistrationFlow(manageRepAccounts);
			} else if (angular.isDefined(fromUserEmail) && fromUserEmail === true) {
				/*
				 * if(angular.isDefined(manageRepAccounts.expressRegistered) &&
				 * manageRepAccounts.expressRegistered === true){
				 * $rootScope.repLoginUrl =
				 * manageRepAccounts.autoLoginExpressRegistrationURL; } else
				 * if(angular.isDefined(manageRepAccounts.expressRegistered) &&
				 * manageRepAccounts.expressRegistered === false){
				 * $rootScope.repLoginUrl = manageRepAccounts.repLoginURL; }
				 */
				$rootScope.repLoginUrl = manageRepAccounts.repLoginURL;
			} else {
				if (isFrom && isFrom === 'express') {
					if (angular.isDefined(manageRepAccounts.corporateRegistration) && manageRepAccounts.corporateRegistration.toLowerCase() === 'completed') {
						landingPageCode = '&landingPageCode=COCD&';
					} else {
						landingPageCode = '';
					}
					if (authMode === 'sso') {
						window.location.href = baseUrl + '/endflowRedirect?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + manageRepAccounts.customerOid + '&isFrom=nvd' + landingPageCode;
					} else {
						registrationUIConfigUrl = appCon.globalCon.registrationUI.url + '/#/goToOnboard?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + manageRepAccounts.customerOid + '&isFrom=nvd' + landingPageCode;
						$window.open(registrationUIConfigUrl);
					}
				} else if (isFrom && isFrom === 'normal') {
					if (angular.isDefined(documentURL) || angular.isDefined($rootScope.documentURL)) {
						$rootScope.repLoginUrl = manageRepAccounts.autoDocLoginURL;
					} else {
						$rootScope.repLoginUrl = manageRepAccounts.repLoginURL;
					}
					$rootScope.autoDocIframeURL = manageRepAccounts.autoDocLoginURL;
					if (manageRepAccounts.expressRegistered === true) {
						$rootScope.autoLoginExpressRegistrationURL = manageRepAccounts.autoLoginExpressRegistrationURL;
					}
					$scope.showPendingRegistrationFlow(manageRepAccounts);
				}
			}
		} else {
			$rootScope.printBadgeRepProfileUrl = '';
			if (angular.isDefined(documentURL) || angular.isDefined($rootScope.documentURL)) {
				$rootScope.repLoginUrl = manageRepAccounts.autoDocLoginURL;
			} else {
				$rootScope.repLoginUrl = manageRepAccounts.repLoginURL;
			}
			$rootScope.autoDocIframeURL = manageRepAccounts.autoDocLoginURL;
			if (manageRepAccounts.expressRegistered === true) {
				$rootScope.autoLoginExpressRegistrationURL = manageRepAccounts.autoLoginExpressRegistrationURL;
			}

			if (isFrom && isFrom === 'express') {
				$window.open($rootScope.autoLoginExpressRegistrationURL);
			} else if (isFrom && isFrom === 'normal') {
				$scope.iframeLoading = true;
				$rootScope.repProfileLoginUrlLoading = true;
				if (appCon.globalCon.iframe.enabled === 'true') {
					$state.go('manage.repAccountDetails.repAccountsTab');
				} else {
					$scope.redirectManageRepDetails();
				}
			}
		}
	};

	$scope.redirectManageRepDetails = function(){
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'LANDING',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein,
			'value': 1
		};
		eventObject.label += '#vendorRepOid:'+appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid +'#isFrom:manageRepsTab';
		$rootScope.$emit("callAnalyticsController", eventObject);
		// Update RRP for RRP_STALE_TIME interval, which is used from VisionCore.
		$injector.get('accountDetailServices').updateRepRiskProfile({
			'shouldRecalculate' : true
		}).then(function (result) {
			// CREDMGR-35039 Added state param to avoid param key script error while save badge photo
			$state.go('manage.repAccountDetails.repAccountsTab.documents.commonDocuments', { 'tabsState': 'commonDoc' });
		});
	};

	$scope.accessRepAccountsUpgradeCautionDialog = function (customerDetails, documentURL) {
		$rootScope.customerDetails = customerDetails;
		$rootScope.documentURL = documentURL;
		$rootScope.tabFrom = documentURL;
		var companyNameTitle
		if (angular.isDefined(customerDetails.customerCompanyName)) {
			companyNameTitle = customerDetails.customerCompanyName;
		}
		$scope.companyNameTitle = companyNameTitle.replace(/<\/?[^>]+(>|$)/g, '');
		var modalInstance = $modal.open({
			templateUrl: 'views/accounts/manageAccountsUpgradeCautions.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance, $state) {
				$scope.accountUpgradeDecision = function (isFrom) {
					if (isFrom === 'express') {
						$rootScope.expressToNormalVC = false;
						$scope.showAccountIframeDetails($rootScope.customerDetails, 'express', $rootScope.tabFrom, $rootScope.documentURL);
					} else if (isFrom === 'normal') {
						$rootScope.expressToNormalVC = true;
						$scope.showAccountIframeDetails($rootScope.customerDetails, 'normal', $rootScope.tabFrom, $rootScope.documentURL);
					}
				}
			}
		});
	};

	$scope.showRepAccountDetails = function () {
		$scope.showPendingRegistrationFlow(appCon.data.userDetail.accountsDetailsObj);
	};

	$scope.iframeLoading = true;
	$scope.iframeLoadedCallBack = function () {
		$scope.iframeLoading = false;
	};
	/** Back to list from Iframe */
	$scope.backToListFromIframe = function () {
		$scope.showIFrame = false;
		$rootScope.repAccountDetailsTitle = 'Rep Account Details';
		$state.go('manage.accessRepAccounts');
	}

	$scope.attentionPopup = function () {
		$modal.open({
			templateUrl: 'views/common/attention.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance, $state) {
			}
		});
	};

	$scope.showPendingRegistrationFlow = function (accountsDetails, isFrom) {
		var eventObject = {
			"category": "MANAGE_ACCOUNTS_TAB",
			"action": "",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein,
			"value": 1
		};
		eventObject.action += angular.isDefined(isFrom) ? "MANAGE_ACCOUNTS_TAB_" + isFrom.toUpperCase() : "MANAGE_ACCOUNTS_TAB_GRID";
		var accountServices, params, expressRegistered, registrationUIConfigUrl, repRegistration, corporateRegistration, onboardCompleted, userCredential;
		$rootScope.loadingSearchAccounts = true;
		accountServices = $injector.get('accountServices');
		appCon.data.repDetails = [];
		appCon.data.customerDetail = [];
		appCon.data.registrationStatus = [];
		appCon.data.customerDetail.customerOid = accountsDetails.customerOid;
		appCon.data.repDetails.expressRegistered = false;
		appCon.data.repDetails.customerOid = accountsDetails.customerOid;
		appCon.data.repDetails.vcOid = accountsDetails.vcRelationOid;
		appCon.data.repDetails.repOid = accountsDetails.vendorRepOid;
		appCon.data.repDetails.customerName = accountsDetails.customerCompanyName ? accountsDetails.customerCompanyName : '';
		$rootScope.customerName = (appCon.data.repDetails.customerName).replace(/<\/?[^>]+(>|$)/g, '');
		appCon.data.accountsDetails = accountsDetails;
		if (appCon.data.auditDetail === null || angular.isUndefined(appCon.data.auditDetail)) {
			appCon.data.auditDetail = [];
		}
		appCon.data.auditDetail.actorOid = accountsDetails.vendorRepOid;
		eventObject.label += "#repOid:" + accountsDetails.vendorRepOid;
		appCon.data.auditDetail.vcRelationOid = accountsDetails.vcRelationOid;
		if (angular.isDefined($rootScope.expressToNormalVC)) {
			eventObject.label += "#expressToNormalVC:" + $rootScope.expressToNormalVC;
			params = { "repOid": accountsDetails.vendorRepOid, "expressToNormalVC": $rootScope.expressToNormalVC };
		} else {
			params = { "repOid": accountsDetails.vendorRepOid };
		}
		$scope.errorCode = '';
		$scope.serviceResponseError = '';
		if (angular.isDefined(accountsDetails.userCredential)) {
			userCredential = accountsDetails.userCredential;
		} else {
			userCredential = $rootScope.userProfile.userCredential;
		}
		accountServices.getRegistrationStatus(params).then(function (result) {
			var paymentPage;
			if ($rootScope.paymentTechEnable === 'true') {
				paymentPage = 'manage.repAccountDetails.repAccountsTab.normal.paymentDetailsPCI';
			}
			else {
				paymentPage = 'manage.repAccountDetails.repAccountsTab.normal.paymentDetails';
			}
			var auditArray = [{ "REPHS": "manage.repAccountDetails.repAccountsTab.normal.healthsystemDetails", "REPCD": "manage.repAccountDetails.repAccountsTab.normal.companyDetails", "REPCR": "manage.repAccountDetails.repAccountsTab.normal.companyRelationship", "REPUR": "manage.repAccountDetails.repAccountsTab.normal.userRelationship", "REPAG": "manage.repAccountDetails.repAccountsTab.normal.agreements", "REPPY": paymentPage }], landingPageCode, userNavigationPage, getRegistrationStatus, paymentDetails;
			delete $rootScope.expressToNormalVC;
			$rootScope.loadingSearchAccounts = false;
			if (result.data.status === 'error') {
				$scope.errorCode = result.data.errorData.ResponseError[0].errorCode;
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				eventObject.vale += 0;
				eventObject.label += "#errorMessage:" + $scope.serviceResponseError;
				$rootScope.$emit("callAnalyticsController", eventObject);
				var errorObject = {
					"errorCode": result.data.errorData.ResponseError[0].errorCode,
					"repOid": accountsDetails.vendorRepOid,
					"errorMessage": result.data.errorData.ResponseError[0].longMessage
				};
				$scope.registrationModuleDisabledPopup(errorObject);
			} else if (result.data.status === 'success') {
				getRegistrationStatus = result.data.successData.RegistrationStatus;
				angular.forEach(getRegistrationStatus, function (value, key) {
					eventObject.label += "#" + key + ":" + value;
				});
				$rootScope.$emit("callAnalyticsController", eventObject);
				$rootScope.enableExpressRegistration = getRegistrationStatus.enableExpressRegistration;
				$rootScope.expressRegistered = angular.isString(getRegistrationStatus.expressRegistered) ? (getRegistrationStatus.expressRegistered === 'true') : getRegistrationStatus.expressRegistered;
				$rootScope.vcStatus = getRegistrationStatus.vcStatus;
				if (angular.isDefined(getRegistrationStatus.paymentPrice)) {
					$rootScope.paymentPrice = getRegistrationStatus.paymentPrice;
					paymentDetails = '&paymentPrice=' + $rootScope.paymentPrice + '&';
				} else {
					paymentDetails = '';
				}
				landingPageCode = getRegistrationStatus.landingPageCode;
				if (angular.isDefined($rootScope.documentURL)) {
					$rootScope.repLoginUrl = accountsDetails.autoDocLoginURL;
				} else {
					$rootScope.repLoginUrl = accountsDetails.repLoginURL;
				}
				if (angular.isUndefined(landingPageCode) || (angular.isDefined(getRegistrationStatus.registrationCompleted) && getRegistrationStatus.registrationCompleted === true)
					|| ((angular.isDefined(getRegistrationStatus.repRegistration) && getRegistrationStatus.repRegistration.toLowerCase() === 'completed') && angular.isUndefined(isFrom))) {
					if (angular.isDefined(isFrom) && isFrom.toLowerCase() === 'incomplete') {
						$state.go("manage.accessRepAccounts", {}, { reload: true });
					} else if (angular.isDefined(isFrom) && isFrom.toLowerCase() === 'complete') {
						// Check the vcStatus for PaymentPage redirect
						if (angular.isDefined($rootScope.vcStatus) && $rootScope.vcStatus === 'RFPMT') {
							if (angular.isDefined($rootScope.expressRegistered) && $rootScope.expressRegistered === true) {
								if (authMode === 'sso') {
									window.location.href = baseUrl + '/endflowRedirect?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + accountsDetails.customerOid + '&isFrom=nvd' + '&landingPageCode=' + landingPageCode + paymentDetails;
								} else {
									registrationUIConfigUrl = appCon.globalCon.registrationUI.url + '/#/goToOnboard?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + accountsDetails.customerOid + '&isFrom=nvd' + '&landingPageCode=' + landingPageCode + paymentDetails;
									$window.open(registrationUIConfigUrl);
								}
							} else {
								if ($rootScope.paymentTechEnable === 'true') {
									$state.go('manage.repAccountDetails.repAccountsTab.normal.paymentDetailsPCI');
								} else {
									$state.go('manage.repAccountDetails.repAccountsTab.normal.paymentDetails');
								}
							}
						} else {
							if (angular.isDefined($rootScope.enableExpressRegistration) && $rootScope.enableExpressRegistration === true) {
								$scope.showAccountIframeDetails(accountsDetails, 'express')
							} else {
								$scope.attentionPopup();
							}
						}
					} else {
						appCon.data.registrationStatus.repRegistration = getRegistrationStatus.repRegistration;
						if (getRegistrationStatus.vrpAnswered === false) {
							$rootScope.enablePhiSecurityQues = getRegistrationStatus.enablePhiSecurityQuestions;
							$controller('registrationController', { $scope: $scope });
							$scope.getAllLookups('REV_TIER,VENDOR_TYPE_OF_BUSINESS', true);
							$controller('manageRepController', { $scope: $scope });
							$scope.showIFrame = true;
							$rootScope.showCompanyRelationshipTab = false;
							$state.go('manage.repAccountDetails.repAccountsTab.normal.companyRelationship');
						} else if (getRegistrationStatus.rrpAnswered === false) {
							$state.go('manage.repAccountDetails.repAccountsTab.normal.userRelationship');
						} else if (getRegistrationStatus.eulaSigned === false) {
							$rootScope.showExpressAgreementTab = true;
							$state.go('manage.repAccountDetails.repAccountsTab.normal.agreements');
						} else if (getRegistrationStatus.paymentRequired === true) {
							if (angular.isDefined(getRegistrationStatus.paymentPrice)) {
								$rootScope.paymentPrice = getRegistrationStatus.paymentPrice;
							}
							if ($rootScope.paymentTechEnable === 'true') {
								$state.go('manage.repAccountDetails.repAccountsTab.normal.paymentDetailsPCI');
							} else {
								$state.go('manage.repAccountDetails.repAccountsTab.normal.paymentDetails');
							}
						} else {
							if (appCon.globalCon.iframe.enabled === 'true') {
								$state.go('manage.repAccountDetails.repAccountsTab');
							} else {
								$scope.redirectManageRepDetails();
							}

							$rootScope.repProfileLoginUrlLoading = true;
						}
					}
				} else {
					if (_.startsWith(landingPageCode, 'CO') || _.startsWith(landingPageCode, 'OB')) {
						if (_.startsWith(landingPageCode, 'CO')) {
							if (angular.isDefined(getRegistrationStatus.paymentRequired) && getRegistrationStatus.paymentRequired === false && landingPageCode === "COPY") {
								landingPageCode = "COCD";
							}
							if (angular.isDefined(getRegistrationStatus.enableVendorDetailContacts) && getRegistrationStatus.enableVendorDetailContacts === false && landingPageCode === "COCON") {
								landingPageCode = "CODIV";
							}
							if (angular.isDefined(getRegistrationStatus.enableVendorDetailDiversity) && getRegistrationStatus.enableVendorDetailDiversity === false && landingPageCode === "CODIV") {
								landingPageCode = "CODOC";
							}
							if (angular.isDefined(getRegistrationStatus.allowUploadEntityDocuments) && getRegistrationStatus.allowUploadEntityDocuments === false && landingPageCode === "CODOC") {
								landingPageCode = "COPOC";
							}
							if (angular.isDefined(getRegistrationStatus.allowAckDuringEntityRegistration) && getRegistrationStatus.allowAckDuringEntityRegistration === false && landingPageCode === "COPOC") {
								landingPageCode = "COAG";
							}
						}
						if (authMode === 'sso') {
							window.location.href = baseUrl + '/endflowRedirect?userCredential=' + userCredential + '&custOid=' + accountsDetails.customerOid + '&isFrom=nvd' + '&landingPageCode=' + landingPageCode + paymentDetails;
						} else {
							registrationUIConfigUrl = appCon.globalCon.registrationUI.url + '/#/goToOnboard?userCredential=' + userCredential + '&custOid=' + accountsDetails.customerOid + '&isFrom=nvd' + '&landingPageCode=' + landingPageCode + paymentDetails;
							$window.open(registrationUIConfigUrl);
						}
					} else if (angular.isDefined(landingPageCode) && _.startsWith(landingPageCode, 'REP')) {
						$rootScope.repLoginUrl = accountsDetails.autoDocLoginURL;
						// Condition for PHI questions visibility
						if (angular.isDefined(getRegistrationStatus.enablePhiSecurityQuestions)) {
							$rootScope.enablePhiSecurityQues = getRegistrationStatus.enablePhiSecurityQuestions;
						}
						if (angular.isDefined(getRegistrationStatus.vrpAnswered)) {
							$rootScope.showCompanyRelationshipTab = getRegistrationStatus.vrpAnswered;
						} else {
							$rootScope.showCompanyRelationshipTab = true;
						}
						$controller('registrationController', { $scope: $scope });
						$scope.getAllLookups('REV_TIER,VENDOR_TYPE_OF_BUSINESS', true);
						if (angular.isDefined(getRegistrationStatus.paymentRequired) && (getRegistrationStatus.paymentRequired === false || getRegistrationStatus.paymentRequired === "false") && getRegistrationStatus.landingPageCode === 'REPPY') {
							if (appCon.globalCon.iframe.enabled === 'true') {
								$state.go('manage.repAccountDetails.repAccountsTab');
							} else {
								$scope.redirectManageRepDetails();
							}
							// Add New Analytic object if "eventObject" is
							// undefined
							var newObject = { "value": 1 };
							newObject.action += angular.isDefined(isFrom) ? "MANAGE_ACCOUNTS_TAB_INCOMPLETE" : "MANAGE_ACCOUNTS_TAB_GRID";
							var flowEndObject = angular.isDefined(eventObject) ? angular.copy(eventObject) : newObject;
							flowEndObject.category = "NORMAL";
							flowEndObject.label = "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#paymentRequired:" + getRegistrationStatus.paymentRequired;
							$scope.iframeFrom = 'manageAccounts';
							$scope.flowEndState("MANAGE_ACCOUNTS_TAB_REG_COMPLETED", flowEndObject);
							return;
						}
						$controller('manageRepController', { $scope: $scope });
						$scope.showIFrame = true;
						userNavigationPage = auditArray[0][landingPageCode];
						$scope.iframeFrom = 'manageAccounts';
						$state.go(userNavigationPage);
					}
				}
			}
		});
	};

	/* Registration Modules Disble Popup */
	$scope.registrationModuleDisabledPopup = function (errorObject) {
		var modalInstance = $modal.open({
			templateUrl: 'views/common/registrationDisabledPopup.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance, $state) {
				$scope.regDisableObj = errorObject;
				$scope.closePopup = function (status) {
					if (status === 'ok' && $scope.regDisableObj.errorCode === '5172') {
						$injector.get('accountServices').updateRepRegistrationStatus({ "repOid": errorObject.repOid }).then(
							function (result) {
								if (angular.lowercase(result.data.status) === 'error') {
									$scope.updateErrorObject = result.data.errorData.ResponseError[0];
								} else {
									$modalInstance.close();
									$scope.reloadManageReps();
								}
							});
					} else {
						$modalInstance.close();
					}
				};
			}
		});
	};
	$scope.reloadManageReps = function () {
		$state.go('manage.accessRepAccounts', {}, { reload: true });
	};
}]);

angular.module(appCon.appName).controller("accessRepsAccountController", ["$scope", "$state", "$rootScope", "$injector", "$cookieStore", "$timeout", "$stateParams", "$templateCache", "Analytics", "ngTableParams", "$modal", "$uibModalStack", "$filter", function ($scope, $state, $rootScope, $injector, $cookieStore, $timeout, $stateParams, $templateCache, Analytics, ngTableParams, $modal, $uibModalStack, $filter) {
	var $translate = $filter('translate');
	$scope.account = {};
	$scope.manageReps = {};
	$scope.accounts = {};
	$scope.showSearhGrid = false;

	/** Initiate the Access Rep Accounts Form value based on the user navigation */
	$scope.initalAccessRepSearchForm = function () {

		/** comes from Back to list using "search" */
		if (angular.isDefined(appCon.data.accessRepSearchParam)) {
			$scope.accounts.accountName = appCon.data.accessRepSearchParam.accountName;
			$scope.accounts.googleString = appCon.data.accessRepSearchParam.googleString;
			$scope.includeInactiveAccount = appCon.data.includeInactAccounts;
			$scope.showSearhGrid = true;
			$scope.manageReps.accessRep = 'search';

		} else if (angular.isDefined(appCon.data.accessRep)) {
			/** comes from Back to list using "showAll" */
			$scope.manageReps.accessRep = appCon.data.accessRep
			$scope.showSearhGrid = false;
			$scope.includeInactiveAccount = appCon.data.includeInactAccounts;
		} else {
			/** Initiate the Fresh form */
			$scope.manageReps.accessRep = 'search';
			$scope.accounts.accountName = '';
			$scope.accounts.googleString = '';
			$scope.includeInactiveAccount = false;
			$scope.showSearhGrid = false;
		}
		var loggedroleList = $rootScope.userProfile.authorities;
		$scope.roleList = loggedroleList.map(function (loggedroleList) {
			return loggedroleList['role'];
		});
	}

	/** Initiate Search Param and hide Grid Response */

	$scope.populateSearchParam = function (accessRep) {
		delete appCon.data.accessRep;
		$scope.errorMsg = { "showModScecurity": false, "showEmptyString": false };
		$scope.manageReps.accessRep = accessRep;
		$scope.accounts.accountName = '';
		$scope.accounts.googleString = '';
		$scope.showSearhGrid = false;
		$scope.includeInactiveAccount = false;
	}

	/** Retain "showAll" Radio Button using appCon and Remove search Params */

	$scope.removeSearchParam = function (accessRep) {

		delete appCon.data.accessRepSearchParam;
		$scope.errorMsg = { "showModScecurity": false, "showEmptyString": false };
		$scope.manageReps.accessRep = 'showAll';
		$scope.showSearhGrid = false;
		appCon.data.accessRep = accessRep;
		$scope.includeInactiveAccount = false;
		appCon.data.includeInactAccounts = false;
		accessRepAccountsSearchGrid = {};
		$scope['accessRepSearchAccounts'].$params.page = 1;
		$scope['accessRepSearchAccounts'].$params.sorting = { 'lastName,firstName,userId': 'asc' };
		$scope['accessRepSearchAccounts'].reload();
	}

	$scope.showEmptyErrorMsg = false;

	/** Mod security Validation Rule */
	$scope.checkValiedString = function (value) {
		var matchedArray = value.length === 0 ? [] : value.match(/[{}\[\]<>]/);
		return matchedArray;
	};

	/** Grid Search validation and retain the Filter */
	$scope.searchAccessRepAccounts = function (account, accessRep, inactiveAccount) {
		var accountName = (angular.isDefined(account.accountName) && (account.accountName).length >= 1) ? account.accountName : '';
		var googleString = (angular.isDefined(account.googleString) && (account.googleString).length >= 1) ? account.googleString : '';
		var includeInactAccounts = inactiveAccount;
		if (accountName.length >= 1 || googleString.length >= 1) {
			var valiedAccountName = $scope.checkValiedString(accountName);
			var valiedgoogleString = $scope.checkValiedString(googleString);
			if ((valiedAccountName != null && valiedAccountName.length > 0) ||
				(valiedgoogleString != null && valiedgoogleString.length > 0)) {
				$scope.errorMsg = { "showModScecurity": true, "showEmptyString": false };
			} else {
				$scope.errorMsg = { "showModScecurity": false, "showEmptyString": false };
				appCon.data.accessRepSearchParam = account;
				appCon.data.includeInactAccounts = includeInactAccounts;
				appCon.data.accessRep = accessRep;
				$scope.showSearhGrid = true;
				accessRepAccountsSearchGrid = {};
				$scope['accessRepSearchAccounts'].$params.page = 1;
				$scope['accessRepSearchAccounts'].$params.sorting = { 'lastName,firstName,userId': 'asc' };
				$scope['accessRepSearchAccounts'].reload();
			}
		} else if (accountName.length === 0 && googleString.length === 0) {
			delete appCon.data.accessRepSearchParam;
			$scope.errorMsg = { "showModScecurity": false, "showEmptyString": true };
		}
	};
	$scope.ManageRepsClearforAccess = function (isFrom, Object) {
		if (isFrom === 'Inactive' || isFrom === 'Activate') {
			$modal.open({
				templateUrl: 'views/manageReps/activeInactiveRepPopup.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope,
				controller: function ($scope) {
					$scope.showActiveInactiveMsg = isFrom;
					var param = {};
					param["repOid"] = Object.vendorRepOid;
					param["isFromManageRep"] = true;
					$scope.activeInactiveRepError = '';
					$scope.activeInactiveRepRegistration = function (action) {
						$scope.activeInactiveLoading = true;
						var activeInactiveRepForm = document.getElementById("activeInactiveRepForm");
						disableAll(activeInactiveRepForm);
						var activeInactiveOperation = (action === 'Active') ? 'activateRep' : 'inActivateRep';
						$injector.get('manageRepsServices')[activeInactiveOperation](param).then(function (result) {
							enableAll(activeInactiveRepForm);
							if (result.data.status === 'success') {
								if (result.data && result.data.status === 'success') {
									$uibModalStack.dismissAll();
									accessRepAccountsSearchGrid = {};
									$scope['accessRepSearchAccounts'].$params.page = 1;
									$scope['accessRepSearchAccounts'].reload();
								}
								$scope.activeInactiveLoading = false;
							} else if (result.data && result.data.status === 'error' && result.data.errorData.ResponseError[0].errorCode === '5138') {
								$scope.activeInactiveLoading = false;
								$uibModalStack.dismissAll();
								$modal.open({
									templateUrl: 'views/manageReps/warningInactiveRepPopup.html?rnd=' + appCon.globalCon.deployDate,
									backdrop: 'static',
									keyboard: false,
									controller: function ($scope) {
										$scope.warningInactiveRepError = '';
										$scope.warningInactiveRepRegistration = function () {
											$scope.activeInactiveLoading = true;
											param["inactivatePayingRep"] = true;
											var warningInactiveRepForm = document.getElementById("warningInactiveRepForm");
											disableAll(warningInactiveRepForm);
											$injector.get('manageRepsServices')['inActivateRep'](param).then(function (result) {
												enableAll(warningInactiveRepForm);
												if (result.data.status === 'success') {
													if (result.data && result.data.status === 'success') {
														$uibModalStack.dismissAll();
														$state.go('manage.accessRepAccounts', {}, { 'reload': true });
													}
													$scope.activeInactiveLoading = false;
												} else {
													$scope.warningInactiveRepError = result.data;
													$scope.activeInactiveLoading = false;
												}
											});
										};
									}
								});
							} else {
								$scope.activeInactiveRepError = result.data;
								$scope.activeInactiveLoading = false;
							}
						});
					};

					$scope.cancelModalDialog = function () {
						$uibModalStack.dismissAll();
					};
				}
			});
		} else if (isFrom === 'Delete') {
			$scope.unDeleteUserError = '';
			var modalInstance = $modal.open({
				templateUrl: 'views/manageReps/accountDeletePopup.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope,
				controller: function ($scope) {
					$scope.deleteUser = function () {
						var params = {};
						params.userOid = Object.userOid;
						params.callFrom = 'MANAGE_REPS_USER_DELETE';
						$injector.get('manageRepsServices')['deleteUser'](params).then(function (result) {
							if (result.data.successData && result.data.successData.Status === 'Ok') {
								$uibModalStack.dismissAll();
								$state.reload();
							} else {
								$scope.unDeleteUserError = result.data.errorData.ResponseError[0].errorCode;
							}
						});
					}
				}
			});
		} else {
			$rootScope.accountSelected = { "customerOid": Object.customerOid, "customerCompanyName": Object.companyName };
			$state.go('manage.repAccountDetails.clearedForAccess', ({ 'clearForAccessFromReps': 'isfromRepDetail' }));
		}
	};

	$scope.includeInactivatedAccounts = function (inactiveAccount) {
		appCon.data.includeInactAccounts = inactiveAccount;
		accessRepAccountsSearchGrid = {};
		$scope['accessRepSearchAccounts'].$params.page = 1;
		$scope['accessRepSearchAccounts'].reload();
	};

	$scope.refreshAccessRepAccounts = function () {
		accessRepAccountsSearchGrid = {};
		$scope['accessRepSearchAccounts'].$params.page = 1;
		$scope['accessRepSearchAccounts'].reload();
	};

	/** Search Grid using ngTableParams */
	var accessRepAccountsSearchGrid;
	$rootScope.loadingSearchAccounts = false;
	$scope.accessRepSearchAccounts = new ngTableParams(
		{
			page: 1,
			total: 1,
			count: 25,
			sorting: { 'lastName,firstName,userId': 'asc' },
			type: 'server'
		}, {
			getData: function ($defer, params) {
				if (!angular.equals(JSON.stringify($scope.accessRepSearchAccounts.$params), accessRepAccountsSearchGrid)) {
					var serviceParam = { 'startIndex': (params.page() - 1) * params.count(), 'results': params.count(), "pagination": true };
					var accessRepAccountsFrom = document.getElementById("accessRepAccountsFrom");
					disableAll(accessRepAccountsFrom);
					if (angular.isDefined(appCon.data.accessRep) && appCon.data.accessRep === 'search') {
						var accessRepAccOperation = 'searchVendorRepProfiles';
						serviceParam.accountName = angular.isDefined(appCon.data.accessRepSearchParam) ? appCon.data.accessRepSearchParam.accountName : "";
						serviceParam.googleString = angular.isDefined(appCon.data.accessRepSearchParam) ? appCon.data.accessRepSearchParam.googleString : "";
						serviceParam.includeInactAccounts = appCon.data.includeInactAccounts;
					} else if (angular.isDefined(appCon.data.accessRep) && appCon.data.accessRep === 'showAll') {
						var accessRepAccOperation = 'getAllVendorRepProfiles';
						serviceParam.includeInactAccounts = appCon.data.includeInactAccounts;
					}
					serviceParam.iframeEnabled = $rootScope.isIframeEnabled;
					/* Set sort field to request param */
					angular.forEach(params.$params.sorting, function (value, key) {
						serviceParam.sort = key;
						serviceParam.dir = value;
					});

					$rootScope.loadingSearchAccounts = true;
					if (angular.isDefined(appCon.data.accessRep) && appCon.data.accessRep != '') {
						$injector.get('manageRepsServices')[accessRepAccOperation](serviceParam).then(
							function (result) {
								enableAll(accessRepAccountsFrom);
								if (result.data.status === 'success') {
									result.data = esGridMaxPaginationCount(result.data, 'totalRecords');
									$scope.data = result.data;
									params.total(result.data.successData.totalRecords);
									$defer.resolve(result.data.successData.VendorRepProfileViewList);
								} else {
									params.total(0); // hide pagination if no
														// results found
									$defer.resolve(result.data);
								}
								$rootScope.loadingSearchAccounts = false;
							},
							function (error) {
								$rootScope.loadingSearchAccounts = false;
								$defer.resolve(error);
							}
						)
						accessRepAccountsSearchGrid = JSON.stringify($scope.accessRepSearchAccounts.$params);
					}
				}
			}
		});

	/*
	 * Tooltip for Accounts tab header
	 */

	$templateCache.put('requirementStatus.html',
		'<span>Rep Access Status&nbsp;<i uib-tooltip="Alert- Updates to documents or policies may take up to 24 hours to be reflected in this status" tooltip-append-to-body="true" class="fa fa-question-circle fa-lg"></i></span>'
	);
	$templateCache.put('companyStatus.html',
		'<span>Company Credentialing Status&nbsp;<i uib-tooltip="Incomplete Registration or Payments negatively impact your Company Credentialing Status" tooltip-append-to-body="true" class="fa fa-question-circle fa-lg"></i></span>'
	);
	$templateCache.put('registrationStatus.html',
		'<span>Company Registration Status&nbsp;<i uib-tooltip="Not all Network Registration Requests impact Access Status to a facility, as these requests can originate from other supply chain needs." tooltip-placement="left" tooltip-append-to-body="true" class="fa fa-question-circle fa-lg"></i></span>'
	);
	// google analytics page track
	$scope.callGAPageTrack = function (pageName) {
		Analytics.trackPage("/" + $rootScope.path + "/" + pageName + "/");
	};

	$scope.getShareCredentialUserOid = function (userOid, vendorOid) {
		$rootScope.ShareMyCredentialUserOid = userOid;
		$rootScope.ShareMyCredentialVendorOid = vendorOid;
	};

	$scope.setToolTipMessage = function (dataObject) {
		var gridData;
		if (angular.isArray(dataObject)) {
			gridData = dataObject[0];
		} else {
			gridData = dataObject;
		}
		$scope.toolTipPass = $translate('accounts.manageMyaccount.label.requirementStatusPass');
		$scope.toolTipFail = $translate('accounts.manageMyaccount.label.requirementStatusFail');
		$scope.toolTipAlert = $translate('accounts.manageMyaccount.label.requirementStatusAlert');
		$scope.toolTipNA = $translate('accounts.manageMyaccount.label.requirementStatusNa');
		$scope.toolTipBcFail = $translate('nsor.errorMessage.backgroundCheckFailed');
		$scope.toolTipBcIncom = $translate('nsor.errorMessage.backgroundCheckIncomplete');
		$scope.toolTipBcExp = $translate('nsor.errorMessage.backgroundCheckExpired');
		$scope.toolTipBlocked = $translate('accounts.manageMyaccount.label.repHasBeenBlocked');
		if (angular.isDefined(gridData.overAllStatusForReport) && gridData.overAllStatusForReport.toLowerCase() === 'pass') {
			gridData['toolTip'] = $scope.toolTipPass;
		} else if (angular.isDefined(gridData.overAllStatusForReport) && gridData.overAllStatusForReport.toLowerCase() === 'na') {
			gridData['toolTip'] = $scope.toolTipNA;
		} else if (angular.isDefined(gridData.overAllStatusForReport) && gridData.overAllStatusForReport.toLowerCase() === 'alert') {
			gridData['toolTip'] = ((gridData.cbcEnabled && gridData.userCBCStatus === 'pass' && gridData.userCBCExpired) || (gridData.nsorEnabled && gridData.userNSORStatus === 'pass' && gridData.userNSORExpired)) ? $scope.toolTipBcExp :
				((gridData.cbcEnabled && gridData.userCBCStatus === 'incomplete') || (gridData.nsorEnabled && gridData.userNSORStatus === 'incomplete')) ? $scope.toolTipBcIncom : $scope.toolTipAlert;
		} else if (angular.isDefined(gridData.overAllStatusForReport) && gridData.overAllStatusForReport.toLowerCase() === 'fail') {
			gridData['toolTip'] = ((gridData.cbcEnabled && gridData.userCBCStatus === 'fail') || (gridData.nsorEnabled && gridData.userNSORStatus === 'fail')) ? $scope.toolTipBcFail :
				((gridData.cbcEnabled && gridData.userCBCStatus === 'pass' && gridData.userCBCExpired && gridData.cbcInGracePeriod.toLowerCase() === 'no') || (gridData.nsorEnabled && gridData.userNSORStatus === 'pass' && gridData.userNSORExpired && gridData.nsorInGracePeriod.toLowerCase() === 'no')) ? $scope.toolTipBcExp :
					((gridData.cbcEnabled && gridData.userCBCStatus === 'incomplete' && gridData.cbcInGracePeriod.toLowerCase() === 'no') || (gridData.nsorEnabled && gridData.userNSORStatus === 'incomplete' && gridData.nsorInGracePeriod.toLowerCase() === 'no')) ? $scope.toolTipBcIncom : $scope.toolTipFail;
		} else if (angular.isDefined(gridData.overAllStatusForReport) && gridData.overAllStatusForReport.toLowerCase() === 'blocked') {
			gridData['toolTip'] = $scope.toolTipBlocked;
		}
	}
}]);