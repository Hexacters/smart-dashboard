'use strict';
angular.module(appCon.appName).controller("accountController", ["$scope", '$modal', "$state", "$rootScope", "$injector", "$cookieStore", "$window", "$timeout", "$document", "$templateCache", "$uibModalStack", "$controller", "$stateParams", "$location", "$sce", function ($scope, $modal, $state, $rootScope, $injector, $cookieStore, $window, $timeout, $document, $templateCache, $uibModalStack, $controller, $stateParams, $location, $sce) {
	var authMode = appCon.globalCon.authentication.mode.toLowerCase();
	$scope.searchAccount = {};
	$rootScope.repProfileLoginUrlLoading = (angular.isDefined($rootScope.repProfileLoginUrlLoading)) ? $rootScope.repProfileLoginUrlLoading : false;
	$rootScope.accountDetailsTitle = (angular.isDefined($rootScope.accountDetailsTitle)) ? $rootScope.accountDetailsTitle : 'Account Details';
	$scope.flowServiceResponseError = '';
	$scope.searchResponseError = '';
	$scope.loadingIframe = true;
	$scope.upgradeFromSearchAccount = false;
	$scope.showIFrame = false;
	$rootScope.repProfileLoginUrl = (angular.isDefined($rootScope.repProfileLoginUrl)) ? $rootScope.repProfileLoginUrl : '';
	$rootScope.autoDocIframeURL = (angular.isDefined($rootScope.autoDocIframeURL)) ? $rootScope.autoDocIframeURL : '';
	$rootScope.paymentTechEnable = appCon.globalCon.pci.enable;
	// Base url configuration 
	var urlIndex = ($location.absUrl()).indexOf('/#/'), baseUrl;
	if (urlIndex !== -1) {
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	} else {
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/" + contextPath + "/");
		baseUrl = baseUrl[0] + "/" + contextPath;
	}
	if (angular.isDefined($rootScope.enableExpressRegistration) && $rootScope.enableExpressRegistration === true) {
		$rootScope.enableExpressRegistration = true;
	} else {
		$rootScope.enableExpressRegistration = false;
	}
	$scope.setSearchRequest = function (params) {
		$scope.searchAccount.searchRequest = params;
	};

	$scope.mailTo = function (mailId) {
		return window.encodeURIComponent(mailId);
	};

	$scope.openHelpDialog = function () {
		var modalInstance = $modal.open({
			templateUrl: 'views/accounts/help.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance) {
				$scope.cancelHelp = function () {
					$modalInstance.close();
				};
				$scope.goToClearForAccess = function () {
					$modalInstance.close();
					$state.go('printBadge.prepareForVisit', { 'printBadge': 'action' });
				};
			}
		});
	};
	$scope.reloadIframe = function () {
		$scope.iframeLoading = true;
		var exisitingUrl = $rootScope.repProfileLoginUrl;
		$rootScope.repProfileLoginUrl = exisitingUrl + (new Date()).getTime();
	}
	$scope.reloadPrintbadgeIframe = function () {
		$scope.iframeLoading = true;
		var exisitingUrl = $rootScope.printBadgeRepProfileUrl;
		$rootScope.printBadgeRepProfileUrl = exisitingUrl + (new Date()).getTime();
	}

	$scope.showLoadingForIframe = function () {
		if ($rootScope.repProfileLoginUrl && $rootScope.repProfileLoginUrl !== '' || $rootScope.printBadgeRepProfileUrl && $rootScope.printBadgeRepProfileUrl !== '') {
			$scope.iframeLoading = true;
		}
		$scope.iframeFrom = angular.isDefined($stateParams.tabsState) ? $stateParams.tabsState : $scope.iframeFrom;

		if (angular.isDefined($rootScope.previousState)) {
			var previousState = ['accounts.accountDetails.documents', 'accounts.accountDetails.documents.commonDocuments', 'accounts.accountDetails.documents.backgroundCheck', 'accounts.accountDetails.documents.optionalDocuments',
			                     'printBadge.prepareForVisit', 'paymentReceipt.grid', 'requestAppointAccordion.request'];
			if (_.indexOf(previousState, $rootScope.previousState.name) !== -1) {
				$scope.showIFrame = true;
			}
		}
	}
	/* Search Account Error Clear Function */
	$scope.clearSearchError = function () {
		$scope.searchResponseError = '';
	};
	/* Existing Registered Link Function From Search Account Grid */
	$scope.viewRegisteredAccountDetails = function (customerDetails) {
		if (angular.isUndefined(appCon.data.customerDetail)) {
			appCon.data.customerDetail = [];
		}
		if (angular.isUndefined(appCon.data.repDetails)) {
			appCon.data.repDetails = [];
		}
		appCon.data.customerDetail.customerOid = customerDetails.customerOid;
		var registrationFlowEnabled = false;
		if (angular.isDefined(appCon.globalCon.enable) && angular.isDefined(appCon.globalCon.enable.new['registration'])) {
			registrationFlowEnabled = appCon.globalCon.enable.new['registration'];
		}
		var accountServices = $injector.get('accountServices');
		$scope.getVendorRepLoading = true;
		var validateSearchForm = document.getElementById("validateSearchForm");
		disableAll(validateSearchForm);
		var eventObject = {
			"category": "SEARCH ACCOUNTS",
			"action": "REGISTERED",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#customerOid:" + customerDetails.customerOid,
			"value": 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		accountServices.getVendorRepAccount().then(function (result) {
			if (result.data.status === 'error') {
				$scope.getVendorRepLoading = false;
				enableAll(validateSearchForm);
				$scope.searchResponseError = result.data.errorData.ResponseError[0].longMessage;
			} else if (result.data.status === 'success') {
				if (angular.isDefined(result.data.successData.VendorRepAccount)) {
					$scope.searchResponseError = '';
					var getRepAccountResult = result.data.successData.VendorRepAccount;
					if ((getRepAccountResult.vcStatusCode).toLowerCase() === 'inact') {
						$scope.searchResponseError = 'No VC exists for this User and Customer';
						return;
					}
					if ((getRepAccountResult.expressRegistered === true && getRepAccountResult.enableExpressRegistration === true && getRepAccountResult.enabledNormalRegistration === true) || (getRepAccountResult.expressRegistered === true && getRepAccountResult.enabledNormalRegistration === true)) {
						$scope.manageAccountsUpgradeCautionDialog(getRepAccountResult, 'registeredSearchAccounts');
					} else if ((getRepAccountResult.expressRegistered === true && getRepAccountResult.enableExpressRegistration === true && getRepAccountResult.enabledNormalRegistration === false) || (getRepAccountResult.expressRegistered === true && getRepAccountResult.enabledNormalRegistration === false)) {
						$scope.showAccountIframeDetails(getRepAccountResult, 'express', 'registeredSearchAccounts');
					} else if (getRepAccountResult.expressRegistered === false) {
						$scope.showAccountIframeDetails(getRepAccountResult, 'normal', 'registeredSearchAccounts');
					}
				}
				$scope.getVendorRepLoading = false;
				enableAll(validateSearchForm);
			}
		});
	};

	/* Back To List Function */
	$scope.backToList = function (goToState) {
		accountIframeSection();
		if (angular.isDefined(goToState)) {
			if (goToState === 'searchAccounts' || goToState === 'registeredSearchAccounts') {
				$state.go('accounts.searchAccounts');
			} else {
				$state.go('accounts.manageAccounts');
			}
		}
	};

	var accountIframeSection = function (normalFlow) {
		if (angular.isDefined(normalFlow) && normalFlow === true) {
			$scope.showIFrame = true;
			$rootScope.accountDetailsTitle = 'Account Details for ' + $rootScope.customerName;
		} else {
			$rootScope.accountDetailsTitle = 'Account Details';
			$scope.showIFrame = false;
			$rootScope.repProfileLoginUrl = '';
			$rootScope.printBadgeRepProfileUrl = '';
		}
	};

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

	$scope.showAccountIframeDetails = function (manageAccounts, isFrom, tabFrom, documentURL) {
		var registrationFlowEnabled, accountDetailsTitle, landingPageCode, registrationUIConfigUrl;
		$rootScope.documentURL = documentURL;
		$scope.iframeFrom = tabFrom;
		if (angular.isDefined(manageAccounts.customerCompanyName)) {
			accountDetailsTitle = manageAccounts.customerCompanyName;
		} else if (angular.isDefined(manageAccounts.customerName)) {
			accountDetailsTitle = manageAccounts.customerName;
		}
		$rootScope.customerName = accountDetailsTitle.replace(/<\/?[^>]+(>|$)/g, '');
		if (angular.isDefined(appCon.globalCon.enable) && angular.isDefined(appCon.globalCon.enable.new['registration'])) {
			registrationFlowEnabled = appCon.globalCon.enable.new['registration'];
		}
		$rootScope.printBadgeRepProfileUrl = '';
		if (angular.isDefined(registrationFlowEnabled) && registrationFlowEnabled === 'true') {
			if (angular.isDefined(manageAccounts.registrationCompleted) && manageAccounts.registrationCompleted === false) {
				$scope.showPendingRegistrationFlow(manageAccounts);
			} else {
				if (isFrom && isFrom === 'express') {
					if (angular.isDefined(manageAccounts.corporateRegistration) && manageAccounts.corporateRegistration.toLowerCase() === 'completed') {
						landingPageCode = '&landingPageCode=COCD&';
					} else {
						landingPageCode = '';
					}
					if (tabFrom === 'searchAccounts') {
						if (authMode === 'sso') {
							window.location.href = baseUrl + '/endflowRedirect?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + manageAccounts.customerOid + '&isFrom=nvd&tabFrom=searchAccounts' + landingPageCode;
						} else {
							registrationUIConfigUrl = appCon.globalCon.registrationUI.url + '/#/goToOnboard?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + manageAccounts.customerOid + '&isFrom=nvd&tabFrom=searchAccounts' + landingPageCode;
							$window.open(registrationUIConfigUrl);
						}
					} else {
						if (authMode === 'sso') {
							window.location.href = baseUrl + '/endflowRedirect?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + manageAccounts.customerOid + '&isFrom=nvd' + landingPageCode;
						} else {
							registrationUIConfigUrl = appCon.globalCon.registrationUI.url + '/#/goToOnboard?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + manageAccounts.customerOid + '&isFrom=nvd' + landingPageCode;
							$window.open(registrationUIConfigUrl);
						}
					}
				} else if (isFrom && isFrom === 'normal') {
					accountIframeSection(true);
					if (angular.isDefined(tabFrom) && tabFrom.toLowerCase() === 'searchaccounts') {
						appCon.data.customerDetail.customerOid = manageAccounts.customerOid;
						var accountServices, params;
						accountServices = $injector.get('accountServices');
						params = { "customerDomainUrl": manageAccounts.domainUrl };
						accountServices.getAutoLoginIframeUrl(params).then(function (result) {
							if (result.data.status === 'error') {
								$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
							} else if (result.data.status === 'success') {
								var url = result.data.successData.autoIframeUrl;
								$rootScope.repProfileLoginUrl = url;
								$rootScope.autoDocIframeURL = url;
							}
						});
						appCon.data.registrationStatus = [];
						$state.go('accounts.accountDetails.normal.healthsystemDetails');
					} else {
						if (angular.isDefined(documentURL) || angular.isDefined($rootScope.documentURL)) {
							$rootScope.repProfileLoginUrl = manageAccounts.autoDocIframeURL;
						} else {
							$rootScope.repProfileLoginUrl = manageAccounts.repProfileLoginURL;
						}
						$rootScope.autoDocIframeURL = manageAccounts.autoDocIframeURL;
						if (manageAccounts.expressRegistered === true) {
							$rootScope.autoLoginExpressRegistrationURL = manageAccounts.autoLoginExpressRegistrationURL;
						}
						$scope.showPendingRegistrationFlow(manageAccounts);
					}
				}
			}
		} else {
			if (angular.isDefined(documentURL) || angular.isDefined($rootScope.documentURL)) {
				$rootScope.repProfileLoginUrl = manageAccounts.autoDocIframeURL;
			} else {
				$rootScope.repProfileLoginUrl = manageAccounts.repProfileLoginURL;
			}
			$rootScope.autoDocIframeURL = manageAccounts.autoDocIframeURL;
			if (manageAccounts.expressRegistered === true) {
				$rootScope.autoLoginExpressRegistrationURL = manageAccounts.autoLoginExpressRegistrationURL;
			}

			if (isFrom && isFrom === 'express') {
				$window.open($rootScope.autoLoginExpressRegistrationURL);
			} else if (isFrom && isFrom === 'normal') {
				accountIframeSection(true);
				$scope.iframeLoading = true;
				$rootScope.repProfileLoginUrlLoading = true;
				if (appCon.globalCon.iframe.enabled === 'true') {
					$state.go('accounts.accountDetails');
				} else {
					$scope.redirectAccountDetails();
				}
			}
		}
	};

	$scope.redirectAccountDetails = function(){
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'LANDING',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein,
			'value': 1
		};
		eventObject.label += '#vendorRepOid:'+appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid +'#isFrom:accountsTab';
		$rootScope.$emit("callAnalyticsController", eventObject);
		// Update RRP for RRP_STALE_TIME interval, which is used from VisionCore.
		$injector.get('accountDetailServices').updateRepRiskProfile({
			'shouldRecalculate' : true
		}).then(function (result) {
			// CREDMGR-35039 - Added state param to avoid param key script error while save badge photo
			$state.go('accounts.accountDetails.documents.commonDocuments', { 'tabsState': 'commonDoc' });
		});
	};

	$scope.showPendingRegistrationFlow = function (accountsDetails, isFrom) {
		var eventObject = {
			"category": "ACCOUNTS_TAB",
			"action": "",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein,
			"value": 1
		};
		eventObject.action += angular.isDefined(isFrom) ? "ACCOUNTS_TAB_" + isFrom.toUpperCase() : "ACCOUNTS_TAB_GRID";
		var accountServices, params, expressRegistered, registrationUIConfigUrl, repRegistration, corporateRegistration, onboardCompleted, accountDetailsTitle;
		if (angular.isDefined(accountsDetails.customerCompanyName)) {
			accountDetailsTitle = accountsDetails.customerCompanyName;
		} else if (angular.isDefined(accountsDetails.customerName)) {
			accountDetailsTitle = accountsDetails.customerName;
		}
		$rootScope.customerName = accountDetailsTitle.replace(/<\/?[^>]+(>|$)/g, '');
		accountServices = $injector.get('accountServices');
		appCon.data.repDetails = [];
		appCon.data.customerDetail = [];
		appCon.data.registrationStatus = [];
		appCon.data.customerDetail.customerOid = accountsDetails.customerOid;
		appCon.data.repDetails.expressRegistered = false;
		appCon.data.repDetails.customerOid = accountsDetails.customerOid;
		appCon.data.repDetails.vcOid = accountsDetails.vcOid;
		appCon.data.repDetails.repOid = accountsDetails.vendorRepOid;
		appCon.data.repDetails.customerName = accountDetailsTitle;
		if (appCon.data.auditDetail === null || angular.isUndefined(appCon.data.auditDetail)) {
			appCon.data.auditDetail = [];
		}
		eventObject.label += "#repOid:" + accountsDetails.vendorRepOid;
		appCon.data.auditDetail.actorOid = accountsDetails.vendorRepOid;
		appCon.data.auditDetail.vcRelationOid = accountsDetails.vcOid;
		if (angular.isDefined($rootScope.expressToNormalVC)) {
			eventObject.label += "#expressToNormalVC:" + $rootScope.expressToNormalVC;
			params = { "repOid": accountsDetails.vendorRepOid, "expressToNormalVC": $rootScope.expressToNormalVC };
		} else {
			params = { "repOid": accountsDetails.vendorRepOid };
		}
		$scope.errorCode = '';
		$scope.serviceResponseError = '';
		$scope.loadingManageAccounts = true;
		accountServices.getRegistrationStatus(params).then(function (result) {
			var paymentPage;
			if ($rootScope.paymentTechEnable === 'true') {
				paymentPage = 'accounts.accountDetails.normal.paymentDetailsPCI';
			}
			else {
				paymentPage = 'accounts.accountDetails.normal.paymentDetails';
			}
			var auditArray = [{ "REPHS": "accounts.accountDetails.normal.healthsystemDetails", "REPCD": "accounts.accountDetails.normal.companyDetails", "REPCR": "accounts.accountDetails.normal.companyRelationship", "REPUR": "accounts.accountDetails.normal.userRelationship", "REPAG": "accounts.accountDetails.normal.agreements", "REPPY": paymentPage }], landingPageCode, userNavigationPage, getRegistrationStatus, paymentDetails;
			delete $rootScope.expressToNormalVC;
			$scope.loadingManageAccounts = false;
			if (result.data.status === 'error') {
				$scope.errorCode = result.data.errorData.ResponseError[0].errorCode;
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				eventObject.value = 0;
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
					$rootScope.repProfileLoginUrl = accountsDetails.autoDocIframeURL;
				} else {
					$rootScope.repProfileLoginUrl = accountsDetails.repProfileLoginURL;
				}
				if (angular.isUndefined(landingPageCode) || (angular.isDefined(getRegistrationStatus.registrationCompleted) && getRegistrationStatus.registrationCompleted === true)
					|| ((angular.isDefined(getRegistrationStatus.repRegistration) && getRegistrationStatus.repRegistration.toLowerCase() === 'completed') && angular.isUndefined(isFrom))) {
					if (angular.isDefined(isFrom) && isFrom.toLowerCase() === 'incomplete') {
						$state.go("accounts.manageAccounts", {}, { reload: true });
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
								$scope.iframeFrom = 'manageAccounts';
								accountIframeSection(true);
								//$state.go('accounts.accountDetails.normal.paymentDetails');
								if ($rootScope.paymentTechEnable === 'true') {
									$state.go('accounts.accountDetails.normal.paymentDetailsPCI');
								} else {
									$state.go('accounts.accountDetails.normal.paymentDetails');
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
						accountIframeSection(true);
						appCon.data.registrationStatus.repRegistration = getRegistrationStatus.repRegistration;
						if (getRegistrationStatus.vrpAnswered === false) {
							$rootScope.enablePhiSecurityQues = getRegistrationStatus.enablePhiSecurityQuestions;
							$controller('registrationController', { $scope: $scope });
							$scope.getAllLookups('REV_TIER,VENDOR_TYPE_OF_BUSINESS', true);
							$controller('accountController', { $scope: $scope });
							$scope.showIFrame = true;
							$rootScope.showCompanyRelationshipTab = false;
							$state.go('accounts.accountDetails.normal.companyRelationship');
						} else if (getRegistrationStatus.rrpAnswered === false) {
							$state.go('accounts.accountDetails.normal.userRelationship');
						} else if (getRegistrationStatus.eulaSigned === false) {
							$rootScope.showExpressAgreementTab = true;
							$state.go('accounts.accountDetails.normal.agreements');
						} else if (getRegistrationStatus.paymentRequired === true) {
							if (angular.isDefined(getRegistrationStatus.paymentPrice)) {
								$rootScope.paymentPrice = getRegistrationStatus.paymentPrice;
							}
							if ($rootScope.paymentTechEnable === 'true') {
								$state.go('accounts.accountDetails.normal.paymentDetailsPCI');
							} else {
								$state.go('accounts.accountDetails.normal.paymentDetails');
							}
							//$state.go('accounts.accountDetails.normal.paymentDetails');
						} else {
							if (appCon.globalCon.iframe.enabled === 'true') {
								$state.go('accounts.accountDetails');
							} else {
								$scope.redirectAccountDetails();
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
							window.location.href = baseUrl + '/endflowRedirect?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + accountsDetails.customerOid + '&isFrom=nvd' + '&landingPageCode=' + landingPageCode + paymentDetails;
						} else {
							registrationUIConfigUrl = appCon.globalCon.registrationUI.url + '/#/goToOnboard?userCredential=' + $rootScope.userProfile.userCredential + '&custOid=' + accountsDetails.customerOid + '&isFrom=nvd' + '&landingPageCode=' + landingPageCode + paymentDetails;
							$window.open(registrationUIConfigUrl);
						}
					} else if (angular.isDefined(landingPageCode) && _.startsWith(landingPageCode, 'REP')) {
						accountIframeSection(true);
						$rootScope.repProfileLoginUrl = accountsDetails.autoDocIframeURL;
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
						if (angular.isDefined(getRegistrationStatus.paymentRequired) && (getRegistrationStatus.paymentRequired === false || getRegistrationStatus.paymentRequired === 'false') && getRegistrationStatus.landingPageCode === 'REPPY') {
							if (appCon.globalCon.iframe.enabled === 'true') {
								$state.go('accounts.accountDetails');
							} else {
								$scope.redirectAccountDetails();
							}
							// Add New Analytic object if "eventObject" is undefined
							var newObject = { "value": 1 };
							newObject.action += angular.isDefined(isFrom) ? "ACCOUNTS_TAB_INCOMPLETE" : "ACCOUNTS_TAB_GRID";
							var flowEndObject = angular.isDefined(eventObject) ? angular.copy(eventObject) : newObject;
							flowEndObject.label = "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#paymentRequired:" + getRegistrationStatus.paymentRequired + "#enableExpressRegistration:" + getRegistrationStatus.enableExpressRegistration + "#enableExpressRegistration:" + getRegistrationStatus.enableExpressRegistration;
							flowEndObject.category = "NORMAL";
							$scope.flowEndState("ACCOUNTS_TAB_REG_COMPLETED", flowEndObject);
							$scope.iframeFrom = 'manageAccounts';
							return;
						}
						$controller('accountController', { $scope: $scope });
						$scope.showIFrame = true;
						userNavigationPage = auditArray[0][landingPageCode];
						if (angular.isDefined(isFrom) && isFrom.toLowerCase() === 'incomplete') {
							$scope.iframeFrom = 'manageAccounts';
						}
						$state.go(userNavigationPage);
					}
				}
			}
		});
	};

	$scope.changeAccountAction = function (accType, action, repOid, companyName, customerOid, customerLength) {
		//Assign user selected customer from Accounts tap
		$rootScope.accType = accType;
		$rootScope.repOid = repOid;
		$rootScope.companyName = companyName;
		$rootScope.customerLength = customerLength;
		$rootScope.accountSelected = { "customerOid": customerOid, "customerCompanyName": companyName };
		if (action === 'checkCompliance') {
			$state.go('printBadge.prepareForVisit', { 'printBadge': 'accounts' });
		} else if (action === 'prepareforvisit') {
			$state.go('printBadge.prepareForVisit', { 'printBadge': 'accounts' });
		} else if (action === 'inactivateaccount') {
			var inactiveAccountDialog = $modal.open({
				templateUrl: 'views/accounts/inactiveAccount.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false
			});
		} else if (action === 'activateAccount') {
			var activeAccountDialog = $modal.open({
				templateUrl: 'views/accounts/activeAccount.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false
			});
		} else if (action === 'requestAppointment') {
			$state.go('requestAppointAccordion.request', ({ 'requestFrom': 'accounts', 'appointmentRandom': Math.random() }));
		}
	};

	$scope.showSearchGrid = function () {
		$scope.showGrid = true;
	};

	$scope.onBoardDialog = function (customerDetails, object) {
		$rootScope.customerDetails = customerDetails;
		var modalInstance = $modal.open({
			templateUrl: 'views/accounts/onboardCompany.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance, $state) {
				var eventObject = angular.copy(object);
				eventObject.label += "#isFrom:onBoardPopup";
				$scope.gotoRegistrionFromSearchAccounts = function (isFrom) {
					if (isFrom === 'express') {
						eventObject.action = "GOTO_EXPRESS_REGISTRATION";
						eventObject.label += "#userAction:NoButton#goTo:Express";
						$rootScope.$emit("callAnalyticsController", eventObject);
						$scope.showAccountIframeDetails($rootScope.customerDetails, isFrom, 'searchAccounts', $rootScope.documentURL);
					} else if (isFrom === 'normal') {
						eventObject.action = "GOTO_NORMAL_REGISTRATION";
						eventObject.label += "#userAction:YesButton#goTo:Normal";
						$rootScope.$emit("callAnalyticsController", eventObject);
						$scope.showAccountIframeDetails($rootScope.customerDetails, isFrom, 'searchAccounts', $rootScope.documentURL);
					}
				}
			}
		});
	};
	$scope.manageAccountsUpgradeCautionDialog = function (customerDetails, tabFrom, documentURL) {
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
	$scope.customerSearchUrl = function (customerName, expressUrl, normalUrl) {
		appCon.data.customerDetail = [];
		appCon.data.customerDetail.customerName = customerName;
		appCon.data.customerDetail.expressUrl = expressUrl;
		appCon.data.customerDetail.normalUrl = normalUrl;
		$rootScope.autoLoginExpressRegistrationURL = appCon.data.customerDetail.expressUrl;
	};

	$rootScope.activeAccountCommonPopupError = '';
	$rootScope.inactiveAccountCommonPopupError = '';
	$scope.inActiveGridReload = function (result) {
		if (result.data && result.data.status === 'success') {
			$uibModalStack.dismissAll();
			$state.go('accounts.manageAccounts', { 'homeAction': 'inActiveAccounts', 'manageRandom': Math.random() });
		} else {
			$rootScope.activeAccountPopupError = '';
			$rootScope.activeAccountPopupError = result.data;
			if ($rootScope.activeAccountPopupError.errorData.Status === 'Error' && $rootScope.activeAccountPopupError.errorData.ResponseError[0].errorCode === "5139") {
				$uibModalStack.dismissAll();
				var inactiveAccountPopup = $modal.open({
					templateUrl: 'views/accounts/activeAccountPopup.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false
				});
			} else {
				$rootScope.activeAccountCommonPopupError = result.data;
			}
		}
	};

	$scope.inCompleteGridReload = function (result) {
		var accType = $rootScope.accType;
		if (result.data && result.data.status === 'success') {
			$uibModalStack.dismissAll();
			if (accType === 'all') {
				$state.go('accounts.manageAccounts', { 'homeAction': '' }, { reload: true });
			} else if (accType === 'failedHealthAlert') {
				$state.go('accounts.manageAccounts', { 'homeAction': 'failedHealthAlert', 'manageRandom': Math.random() });
			} else if (accType === 'incompleteRegistrations') {
				$state.go('accounts.manageAccounts', { 'homeAction': 'incompleteRegistrations', 'manageRandom': Math.random() });
			}
		} else {
			$rootScope.inactiveAccountPopupError = '';
			$rootScope.inactiveAccountPopupError = result.data;
			if ($rootScope.inactiveAccountPopupError.errorData.Status === 'Error' && $rootScope.inactiveAccountPopupError.errorData.ResponseError[0].errorCode === "5138" || $rootScope.inactiveAccountPopupError.errorData.ResponseError[0].errorCode === "5139") {
				$uibModalStack.dismissAll();
				var inactiveAccountPopup = $modal.open({
					templateUrl: 'views/accounts/inactiveAccountPopup.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false
				});
			} else {
				$rootScope.inactiveAccountCommonPopupError = result.data;
			}
		}
	};

	$scope.closeInActiveGridReload = function () {
		var accType = $rootScope.accType;
		$uibModalStack.dismissAll();
		if (accType === 'all') {
			$state.go('accounts.manageAccounts');
		} else if (accType === 'failedHealthAlert') {
			$state.go('accounts.manageAccounts', { 'homeAction': 'failedHealthAlert' });
		} else if (accType === 'incompleteRegistrations') {
			$state.go('accounts.manageAccounts', { 'homeAction': 'incompleteRegistrations' });
		}
	};
	/* Flow Decision Functionality From Search Accounts */
	$scope.checkFlowDecisionPopup = function (customerDetails) {
		$rootScope.customerDetails = customerDetails;
		$scope.getCustomerAddressLoading = true;
		var validateSearchForm = document.getElementById("validateSearchForm");
		disableAll(validateSearchForm);
		var eventObject = {
			"category": "SEARCH ACCOUNTS",
			"action": "REGISTER",
			"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#customerOid:" + customerDetails.customerOid,
			"value": 1
		};
		$injector.get('accountServices').getCustomerAddressAndLocations({ 'customerOid': customerDetails.customerOid }).then(function (result) {
			if (result.data && result.data.status === 'success') {
				if (result.data.successData) {
					var customerData = result.data.successData.CustomerAddress;
					if (angular.isDefined(customerData)) {
						$rootScope.enableExpressRegistration = customerData.enableExpressRegistration;
						if (angular.isDefined(customerData.enableExpressRegistration) && angular.isDefined(customerData.enabledNormalRegistration)) {
							if (customerData.enabledNormalRegistration === true && customerData.enableExpressRegistration === true) {
								eventObject.label += "#userAction:RegisterButton#NormalRegistration:" + customerData.enabledNormalRegistration + "#ExpressRegistration:" + customerData.enableExpressRegistration + "#showsearchAccountFlowPopup:true";
								$rootScope.$emit("callAnalyticsController", eventObject);
								$scope.onBoardDialog(customerDetails, eventObject);
							} else if (customerData.enabledNormalRegistration === true && customerData.enableExpressRegistration === false) {
								//$scope.loadAccountRegistrationFrame('normal');
								eventObject.action = "GOTO_NORMAL_REGISTRATION";
								eventObject.label += "#userAction:RegisterButton#NormalRegistration:" + customerData.enabledNormalRegistration + "#ExpressRegistration:" + customerData.enableExpressRegistration + "#goTo:NormalHealthsystemDetails#isFrom:RegisterButtonClick";
								$scope.showAccountIframeDetails(customerDetails, 'normal', 'searchAccounts', eventObject);
							} else if (customerData.enabledNormalRegistration === false && customerData.enableExpressRegistration === true) {
								//$scope.loadAccountRegistrationFrame('express');
								eventObject.action = "GOTO_EXPRESS_REGISTRATION";
								eventObject.label += "#userAction:RegisterButton#NormalRegistration:" + customerData.enabledNormalRegistration + "#ExpressRegistration:" + customerData.enableExpressRegistration + "#goTo:ExpressRegistrationHealthsystemDetails#isFrom:RegisterButtonClick";
								$scope.showAccountIframeDetails(customerDetails, 'express', 'searchAccounts', eventObject);
							}
						}
					}
				} else {
					$rootScope.$emit("callAnalyticsController", eventObject);
				}
				$scope.getCustomerAddressLoading = false;
				enableAll(validateSearchForm);
			}
			else if (result.data && result.data.status === 'error') {
				$scope.getCustomerAddressLoading = false;
				enableAll(validateSearchForm);
				$scope.searchResponseError = result.data.errorData.ResponseError[0].longMessage;
				eventObject.value = 0;
				eventObject.label += "#errorMessage:" + $scope.searchResponseError;
				$rootScope.$emit("callAnalyticsController", eventObject);
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
									$scope.reloadManageAccounts();
								}
							});
					} else {
						$modalInstance.close();
					}
				};
			}
		});
	};

	$scope.reloadManageAccounts = function () {
		$state.go('accounts.manageAccounts', { 'tapsFrom': $stateParams.tapsFrom, 'homeAction': $stateParams.homeAction, 'manageRandom': $stateParams.manageRandom }, { reload: true });
	};
	/* 
	 Tooltip for Accounts tab header 
	*/

	$templateCache.put('requirementStatus.html',
		'<span>Rep Access Status&nbsp;<i uib-tooltip="Updates to Document & Policies impact your Access Status and may take up to 24 hours to be reflected." tooltip-append-to-body="true" class="fa fa-question-circle fa-lg"></i></span>'
	);
	$templateCache.put('companyStatus.html',
		'<span>Company Credentialing Status&nbsp;<i uib-tooltip="Incomplete Registration or Payments negatively impact your Company Credentialing Status" tooltip-append-to-body="true" class="fa fa-question-circle fa-lg"></i></span>'
	);
	$templateCache.put('renewalDate.html',
		'<span>Renewal Date&nbsp;<i uib-tooltip="The due date for your company&#39;s renewal payment at each health system." tooltip-append-to-body="true" class="fa fa-question-circle fa-lg"></i></span>'
	);
	$templateCache.put('registrationStatus.html',
		'<span>Company Registration Status&nbsp;<i uib-tooltip="Not all Network Registration Requests impact Access Status to a facility, as these requests can originate from other supply chain needs." tooltip-append-to-body="true" class="fa fa-question-circle fa-lg"></i></span>'
	);
	$scope.iframeLoading = true;
	$scope.iframeLoadedCallBack = function () {
		$scope.iframeLoading = false;
	};
}]);

angular.module(appCon.appName).filter('trustAsResourceUrl', ['$sce', function ($sce) {
	return function (val) {
		return $sce.trustAsResourceUrl(val);
	};
}]);

angular.module(appCon.appName).controller("manageMyAccountController", ["$scope", "$state", "$rootScope", "$injector", "$cookieStore", "$timeout", "$stateParams", "$filter", "Analytics", function ($scope, $state, $rootScope, $injector, $cookieStore, $timeout, $stateParams, $filter, Analytics) {
	$scope.account = {};
	var $translate = $filter('translate'), manageMyAccountsReloadTimeout;
	if ($stateParams.homeAction !== '') {
		$scope.accountType = $stateParams.homeAction;
		$scope.account.accountType = $stateParams.homeAction;
	} else {
		$scope.searchType = 'all';
		$scope.account.accountType = 'all';
	}

	$scope.changeVendorRepParams = function (searchType, searchString) {
        var searchString = angular.isDefined(searchString) && searchString !== '' ? searchString : '';
		// Commented for fix id : CREDMGR-30855
		//searchString = searchString.replace(/'/g, '"');
		if (searchType === 'inActiveAccounts') {
			$scope.vendorRepParams = { 'customerName' : searchString };
		} else {
            $scope.vendorRepParams = { 'customerName' : searchString, 'accountType' : searchType, 'iframeEnabled': $rootScope.isIframeEnabled };
        }
	};

	$scope.changeInitialRequest = function (searchType, searchString) {
		$scope.hideRenewal = true;
		$scope.showReqStatus = false;
		var searchString = angular.isDefined(searchString) && searchString !== '' ? searchString : '';
		// Commented for fix id : CREDMGR-30855
		//searchString = searchString.replace(/'/g, '"');
		if (searchType === 'inActiveAccounts') {
			if (angular.isDefined($scope.$$childHead) && $scope.$$childHead && $scope.$$childHead.manageMyAccounts) {
				if (angular.isDefined($scope.$$childHead.manageMyAccounts.$params.sorting['blockedStatus,vendorRepReqStatus'])) {
					delete $scope.$$childHead.manageMyAccounts.$params.sorting['blockedStatus,vendorRepReqStatus'];
					$scope.$$childHead.manageMyAccounts.$params.sorting = { 'customerSortSeq,customerCompanyName': 'asc' };
				}
			}
			$scope.hideRenewal = false;
			$scope.showReqStatus = true;
			$scope.vendorRepParams = { 'customerName' : searchString };
			$scope.initialRepParams = { 'page' : 1, 'sorting' : { "customerSortSeq,customerCompanyName": "asc" } };
		} else {
			$scope.hideRenewal = true;
			$scope.showReqStatus = false;
			$scope.vendorRepParams = { 'customerName': searchString, 'accountType': searchType, 'iframeEnabled': $rootScope.isIframeEnabled };
			$scope.initialRepParams = { 'page': 1, 'sorting': { 'customerSortSeq,customerCompanyName': 'asc' } };
		}
		if (angular.isDefined($scope.$$childHead) && $scope.$$childHead && $scope.$$childHead.manageMyAccounts) {
			manageMyAccountsReloadTimeout = $timeout(function () {
				$scope.$$childHead.manageMyAccounts.reload();
			}, 100);
		}
		$scope.todayDate = new Date();
		$scope.refreshBtn = function () {
			$scope.todayDate = new Date();
		};
	};

	$scope.searchAccountsSuccess = function (resultParam) {
		if (resultParam.successData && resultParam.successData.VendorRepAccountList && resultParam.successData.VendorRepAccountList.length > 0) {
			var result = esGridMaxPaginationCount(resultParam, 'totalRecords');
			$scope.toolTipPass = $translate('accounts.manageMyaccount.label.requirementStatusPass');
			$scope.toolTipFail = $translate('accounts.manageMyaccount.label.requirementStatusFail');
			$scope.toolTipAlert = $translate('accounts.manageMyaccount.label.requirementStatusAlert');
			$scope.toolTipNA = $translate('accounts.manageMyaccount.label.requirementStatusNa');
			$scope.toolTipBcFail = $translate('nsor.errorMessage.backgroundCheckFailed');
			$scope.toolTipBcIncom = $translate('nsor.errorMessage.backgroundCheckIncomplete');
			$scope.toolTipBcExp = $translate('nsor.errorMessage.backgroundCheckExpired');
			$scope.toolTipBlocked = $translate('accounts.manageMyaccount.label.repHasBeenBlocked');
			var totalRec = result.successData.VendorRepAccountList;
			for (var i = 0; i < totalRec.length; i++) {
				if (totalRec[i].overAllStatusForReport.toLowerCase() === 'pass') {
					totalRec[i]['toolTip'] = $scope.toolTipPass;
				} else if (totalRec[i].overAllStatusForReport.toLowerCase() === 'na') {
					totalRec[i]['toolTip'] = $scope.toolTipNA;
				} else if (totalRec[i].overAllStatusForReport.toLowerCase() === 'alert') {
					totalRec[i]['toolTip'] = ((totalRec[i].cbcEnabled && totalRec[i].cbcStatus === 'pass' && totalRec[i].cbcExpired) || (totalRec[i].nsorEnabled && totalRec[i].nsorStatus === 'pass' && totalRec[i].nsorExpired)) ? $scope.toolTipBcExp :
						((totalRec[i].cbcEnabled && totalRec[i].cbcStatus === 'incomplete') || (totalRec[i].nsorEnabled && totalRec[i].nsorStatus === 'incomplete')) ? $scope.toolTipBcIncom : $scope.toolTipAlert;
				} else if (totalRec[i].overAllStatusForReport.toLowerCase() === 'fail') {
					totalRec[i]['toolTip'] = ((totalRec[i].cbcEnabled && totalRec[i].cbcStatus === 'fail') || (totalRec[i].nsorEnabled && totalRec[i].nsorStatus === 'fail')) ? $scope.toolTipBcFail :
						((totalRec[i].cbcEnabled && totalRec[i].cbcStatus === 'pass' && totalRec[i].cbcExpired && totalRec[i].cbcGracePeriod.toLowerCase() === 'no') || (totalRec[i].nsorEnabled && totalRec[i].nsorStatus === 'pass' && totalRec[i].nsorExpired && totalRec[i].gracePeriod.toLowerCase() === 'no')) ? $scope.toolTipBcExp :
							((totalRec[i].cbcEnabled && totalRec[i].cbcStatus === 'incomplete' && totalRec[i].cbcGracePeriod.toLowerCase() === 'no') || (totalRec[i].nsorEnabled && totalRec[i].nsorStatus === 'incomplete' && totalRec[i].gracePeriod.toLowerCase() === 'no')) ? $scope.toolTipBcIncom : $scope.toolTipFail;
				} else if (totalRec[i].overAllStatusForReport.toLowerCase() === 'blocked') {
					totalRec[i]['toolTip'] = $scope.toolTipBlocked;
				}
			}
			if ($scope.account.accountType && $scope.account.accountType === 'all') {
				$scope.callGAPageTrack('refreshManageMyAccounts');
			} else if ($scope.account.accountType && $scope.account.accountType === 'incompleteRegistrations') {
				$scope.callGAPageTrack('refreshManageMyAccountsFromInComp');
			} else if ($scope.account.accountType && $scope.account.accountType === 'failedHealthAlert') {
				$scope.callGAPageTrack('refreshManageMyAccountsFromHealthSys');
			} else if ($scope.account.accountType && $scope.account.accountType === 'inActiveAccounts') {
				$scope.callGAPageTrack('refreshManageMyAccountsFromInActive');
			}

			for (i = 0; i < totalRec.length; i++) {
				if (totalRec[i].vcStatusCode === 'RFPMT') {
					if (totalRec[i].overAllStatusForReport.toLowerCase() === 'pass') {
						totalRec[i].overAllStatusForReport = 'NA';
						totalRec[i]['toolTip'] = $scope.toolTipNA;
					}
					totalRec[i]['renewalIncomplete'] = true;
				} else {
					totalRec[i]['renewalIncomplete'] = false;
				}
			}
		}
	};

	//google analytics page track
	$scope.callGAPageTrack = function (pageName) {
		Analytics.trackPage("/" + $rootScope.path + "/" + pageName + "/");
	};

	$scope.$on('$destroy', function () {
		$timeout.cancel(manageMyAccountsReloadTimeout);
	});

}]);
// Search Account Controller 
angular.module(appCon.appName).controller("searchAccountController", ["$scope", "$rootScope", "ngTableParams", "$injector", function ($scope, $rootScope, ngTableParams, $injector) {
	$scope.hideErrorMessage = function () {
		$scope.showRequiredError = false;
		$scope.showSpecialCharError = false;
	};
	$scope.hideErrorMessage();

	/**
	 * CustomerSearchGrid Filter validation
 	*/
	$scope.changeSearchString = function (searchAccount) {
		$scope.hideErrorMessage();
		$scope.showTableContent = false;
		var searchValue = searchAccount.searchString;
		var valiedString = searchValue.match(/[{}\[\]<>]/);
		if (valiedString !== null) {
			$scope.showSpecialCharError = true;
		} else {
			if (searchAccount.searchString && searchAccount.searchString !== '') {
				var searchAccountString = (searchAccount.searchString).replace(/'/g, '"');
				appCon.data.searchCustomerParam = {
					"searchString": searchAccountString,
					"searchType": searchAccount.searchType
				};
				searchCustomerValiedGrid = {};
				$scope['searchAccountsList'].$params.page = 1;
				$scope['searchAccountsList'].reload();
				$scope.showTableContent = true;
			} else if (searchAccount.searchString === '') {
				$scope.showRequiredError = true;
			}
		}
	};
	var validateSearchForm = document.getElementById("validateSearchForm");
	$scope.showTableContent = false;
	$scope.enableLoading = false;
	var searchCustomerValiedGrid;

	/* 
	 *  CustomerSearchGrid Valid Service call using "ngTableParams" 
	 * */
	$scope.searchAccountsList = new ngTableParams(
		{
			page: 1,
			total: 1,
			count: 25,
			sorting: { "customerName": "asc" },
			type: 'server'
		},
		{
			getData: function ($defer, params) {
				if (!angular.equals(JSON.stringify($scope.searchAccountsList.$params), searchCustomerValiedGrid)) {
					var serviceParam = {
						'startIndex': (params.page() - 1) * params.count(),
						'results': params.count(),
						"pagination": true
					};
					serviceParam.isVisionSearchableCustomer = true;
					serviceParam.searchString = angular.isDefined(appCon.data.searchCustomerParam) ? appCon.data.searchCustomerParam.searchString : "";
					serviceParam.searchType = angular.isDefined(appCon.data.searchCustomerParam) ? appCon.data.searchCustomerParam.searchType : "";
					/*Set sort field to request param */
					angular.forEach(params.$params.sorting, function (value, key) {
						serviceParam.sort = key;
						serviceParam.dir = value;
					});
					$scope.showTableContent = true;
					$scope.enableLoading = true;
					disableAll(validateSearchForm);
					var eventObject = {
						"category": "SEARCH ACCOUNTS",
						"action": "SEARCH_CUSTOMER_ACCOUNTS",
						"label": "email:" + $rootScope.userProfile.userId + "#fein:" + $rootScope.userProfile.detail.fein + "#searchString:" + serviceParam.searchString + "#searchType:" + serviceParam.searchType,
						"value": 1
					};
					$injector.get('accountServices')['searchCustomerLocationsWithRegFlag'](serviceParam).then(
						function (result) {
							if (result.data.status === 'success') {
								result.data = esGridMaxPaginationCount(result.data, 'totalRecords');
								$scope.data = result.data;
								$scope.enableLoading = false;
								params.total(result.data.successData.totalRecords);
								$defer.resolve(result.data.successData.CustomerLocationList);
								$rootScope.$emit("callAnalyticsController", eventObject);
								enableAll(validateSearchForm);
							} else {
								params.total(0); // hide pagination if no results found
								$defer.resolve(result.data);
								eventObject.value = 0;
								eventObject.label += "#errorMessage:" + result.data.errorData.ResponseError[0].longMessage;
								$rootScope.$emit("callAnalyticsController", eventObject);
								$scope.enableLoading = false;
								enableAll(validateSearchForm);
							}
						},
						function (error) {
							$defer.resolve(error);
							$scope.enableLoading = false;
							enableAll(validateSearchForm);
						}
					);
					searchCustomerValiedGrid = JSON.stringify($scope.searchAccountsList.$params);
				}
			}
		}
	);
}]);