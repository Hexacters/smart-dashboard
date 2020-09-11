'use strict';
angular.module(appCon.appName).controller('accountDetailController', ['$scope', '$state', '$injector', '$rootScope', '$window', '$filter', '$timeout', function ($scope, $state, $injector, $rootScope, $window, $filter, $timeout) {
	var getGeneralInformationTimeOut;

	$scope.translationCustomerName = appCon.data['repDetails'] && appCon.data['repDetails']['customerName'] ? { customerName: appCon.data['repDetails']['customerName'] } : '';
	$scope.apinfoCheckedCount = 0;
	$scope.toggleEEOApInfo = function (apiInfo) {
		if (apiInfo && apiInfo.checked) {
			$scope.apinfoCheckedCount++;
		} else {
			$scope.apinfoCheckedCount--;
		}
	};

	/* Save Agreement function */
	$scope.validateAgreement = function (data) {
		$scope.serviceResponseError = '';
		$scope.showRelationShipError = false;
		$scope.showAffiliationsError = false;
		$scope.showCompensationError = false;

		if (data.conflictSummary.cfiRelationship) {
			var relationShipListCount = 0;
			angular.forEach(data.conflictsOfInterestDetails.relat, function (value, key) {
				if ((value.organization !== '' && angular.isDefined(value.organization)) && (value.person !== '' && angular.isDefined(value.person)) && (value.natureOfRelationship !== '' && angular.isDefined(value.natureOfRelationship))) {
					relationShipListCount++;
				}
			});
			$scope.showRelationShipError = relationShipListCount === 0 ? true : false;
		}

		if (data.conflictSummary.cfiBoardAffl) {
			var affiliationsListCount = 0;
			angular.forEach(data.conflictsOfInterestDetails.serve, function (value, key) {
				if ((value.organization !== '' && angular.isDefined(value.organization)) && (value.person !== '' && angular.isDefined(value.person)) && (value.natureOfRelationship !== '' && angular.isDefined(value.natureOfRelationship))) {
					affiliationsListCount++;
				}
			});
			$scope.showAffiliationsError = affiliationsListCount === 0 ? true : false;
		}

		if (data.conflictSummary.cfiCompensation) {
			var conflictsOfInteresListCount = 0;
			angular.forEach(data.conflictsOfInterestDetails.comps, function (value, key) {
				if ((value.organization !== '' && angular.isDefined(value.organization)) && (value.person !== '' && angular.isDefined(value.person)) && (value.natureOfRelationship !== '' && angular.isDefined(value.natureOfRelationship))) {
					conflictsOfInteresListCount++;
				}
			});
			$scope.showCompensationError = conflictsOfInteresListCount === 0 ? true : false;
		}

		if (!$scope.showRelationShipError && !$scope.showAffiliationsError && !$scope.showCompensationError) {
			$scope.prepareAgreementsAndSave(data);
		}
	};

	$scope.prepareAgreementsAndSave = function (data) {
		var request = {
			'conflictSummary': {
				'cfiRelationship': data.conflictSummary.cfiRelationship,
				'cfiBoardAffl': data.conflictSummary.cfiBoardAffl,
				'cfiCompensation': data.conflictSummary.cfiCompensation,
				'vendorRepOid': appCon.data.repDetails.repOid
			}
		};
		request.conflictSummary.relatList = $scope.formateConflictReferenceVO(data.conflictsOfInterestDetails.relat, data.conflictSummary.cfiRelationship, 'relat', 1);
		request.conflictSummary.serveList = $scope.formateConflictReferenceVO(data.conflictsOfInterestDetails.serve, data.conflictSummary.cfiBoardAffl, 'serve', 4);
		request.conflictSummary.compList = $scope.formateConflictReferenceVO(data.conflictsOfInterestDetails.comps, data.conflictSummary.cfiCompensation, 'comps', 7);
		$scope.saveAgreement(request);
	};

	$scope.formateConflictReferenceVO = function (coiList, isChecked, typeCode, seq) {
		var list = [];
		angular.forEach(coiList, function (coi, key) {
			coi.actorOid = appCon.data.repDetails.repOid;
			coi.typeCode = typeCode;
			if (isChecked) {
				if (angular.isUndefined(coi['organization'])) {
					coi['organization'] = '';
				}

				if (angular.isUndefined(coi['person'])) {
					coi['person'] = '';
				}

				if (angular.isUndefined(coi['natureOfRelationship'])) {
					coi['natureOfRelationship'] = '';
				}
			} else {
				coi['seq'] = seq++;
				coi['organization'] = '';
				coi['person'] = '';
				coi['natureOfRelationship'] = '';
			}
			(list).push(coi);
		});
		return list;
	};

	$scope.loadingSaveAgreements = false;
	$scope.saveAgreement = function (param) {
		var serviceName = 'accountDetailServices',
			operationName = 'saveVendorRepAgreement',
			formElement = document.getElementById('conflictOfInterest');
		disableAll(formElement);
		$scope.loadingSaveAgreements = true;
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'SAVE_VENDOR_REP_AGREEMENT',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid,
			'value': 1
		};
		eventObject.label += '#isFrom:'+$state.current.name + '#cfiBoardAffl:'+param.conflictSummary.cfiBoardAffl + '#cfiCompensation:'+param.conflictSummary.cfiCompensation + '#cfiRelationship:'+param.conflictSummary.cfiRelationship + '#comps:[';
		angular.forEach(param.conflictSummary.compList, function (value, key){
			eventObject.label += '#index:'+ key + $scope.getConflictSummaryList(value);
		});
		eventObject.label += ']#relat:[';
		angular.forEach(param.conflictSummary.relatList, function (value, key){
			eventObject.label += '#index:'+ key + $scope.getConflictSummaryList(value);
		});
		eventObject.label += ']#serve:[';
		angular.forEach(param.conflictSummary.serveList, function (value, key){
			eventObject.label += '#index:'+ key + $scope.getConflictSummaryList(value);
		});
		eventObject.label += ']';
		$injector.get(serviceName)[operationName](param).then(
			function (result) {
				enableAll(formElement);
				$scope.loadingSaveAgreements = false;
				if (result.status && result.status === 'error') {
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					eventObject.value = 0;
					eventObject.label += '#errorMessage:'+$scope.serviceResponseError;
				} else {
					var randomNumber = Math.random(), redirectPage = '';
					if ($rootScope.isFromManageReps) {
						redirectPage = 'manage.repAccountDetails.repAccountsTab.conflictsOfInterest';
					} else {
						redirectPage = 'accounts.accountDetails.conflictsOfInterest';
					}
					$state.go(redirectPage, { 'randomNumber': randomNumber });
				}
				$rootScope.$emit('callAnalyticsController', eventObject);
			});
	};

	$scope.getConflictSummaryList = function (object){
		var listString = object.oid !== '' ? '#oid:'+ object.oid : object.person !== '' ? '#person:'+ object.person : '';
		listString += object.typeCode !== '' ? '#typeCode:'+ object.typeCode : object.organization !== '' ? '#organization:'+ object.organization : '';
		listString += object.natureOfRelationship !== '' ? '#natureOfRelationship:'+ object.natureOfRelationship : angular.isDefined(object.seq) && object.seq !== '' ? '#seq:'+object.seq : '';
		return listString;
	};

	$scope.formateGetVendorRepAgreement = function (response) {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'GET_VENDOR_REP_AGREEMENT',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#isFrom:'+$state.current.name,
			'value': 1
		};
		if ((response.status).toLowerCase() === 'success') {
			var conflictSummary = response.successData.conflictSummary;
			conflictSummary.cfiBoardAffl = !conflictSummary.cfiBoardAffl;
			conflictSummary.cfiCompensation = !conflictSummary.cfiCompensation;
			conflictSummary.cfiRelationship = !conflictSummary.cfiRelationship;
			conflictSummary.eulaSignedSig = (conflictSummary.vrepEulaSignedSig !== '');
			conflictSummary.eulaSignedSigValidate = $scope.assignEulaSignedValue(conflictSummary.vrepEulaSignedSig);
			eventObject.label += '#cfiBoardAffl:'+conflictSummary.cfiBoardAffl + '#cfiCompensation:'+conflictSummary.cfiCompensation + '#cfiRelationship:'+conflictSummary.cfiRelationship + '#comps:[';
			angular.forEach(response.successData.conflictsOfInterestDetails.comps, function (value, key){
				eventObject.label += '#index:'+ key + $scope.getConflictSummaryList(value);
			});
			eventObject.label += ']#relat:[';
			angular.forEach(response.successData.conflictsOfInterestDetails.relat, function (value, key){
				eventObject.label += '#index:'+ key + $scope.getConflictSummaryList(value);
			});
			eventObject.label += ']#serve:[';
			angular.forEach(response.successData.conflictsOfInterestDetails.serve, function (value, key){
				eventObject.label += '#index:'+ key + $scope.getConflictSummaryList(value);
			});
			eventObject.label += ']';
			$rootScope.$emit('callAnalyticsController', eventObject);
		}
		return response;
	};

	$scope.assignEulaSignedValue = function (isChecked) {
		return (isChecked ? 'true' : '');
	};

	$scope.getAPInformationLookup = function () {
		$scope.apinfoCheckedCount = 0;
		var userServices = $injector.get('users');
		var monthList = { 'category': 'AP_INFORMATION_EEO_CODE' };
		userServices.getLookups(monthList).then(function (result) {
			if (result.data && result.data.status === 'success') {
				$rootScope.APIInformationEEOCode = result.data.successData.AP_INFORMATION_EEO_CODE;
			}
		});
		var vendorTypeOfBusiness = { 'category': 'AP_INFORMATION_FOB_CODE' };
		userServices.getLookups(vendorTypeOfBusiness).then(function (result) {
			if (result.data && result.data.status === 'success') {
				$rootScope.APIInformationFOBCode = result.data.successData.AP_INFORMATION_FOB_CODE;
			}
		});
		var vendorTypeOfBusiness = { 'category': 'AP_INFORMATION_PAYMENT_TERMS_CODE' };
		userServices.getLookups(vendorTypeOfBusiness).then(function (result) {
			if (result.data && result.data.status === 'success') {
				$rootScope.APIInformationPaymentTermsCode = result.data.successData.AP_INFORMATION_PAYMENT_TERMS_CODE;
			}
		});
	};

	$scope.loadURLVendorResource = function (url) {
		var newUrl = '';
		if (!/^(f|ht)tps?:\/\//i.test(url)) {
			newUrl = 'http://' + url;
			$window.open(newUrl, '_blank');
		} else {
			$window.open(url, '_blank');
		}
	};

	$scope.apInformationCallback = function (response) {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'GET_AP_INFORMATION',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#isFrom:'+$state.current.name,
			'value': 1
		};
		if (response.data && response.data.successData && response.data.successData.apOnboardingDetails) {
			angular.forEach($rootScope.APIInformationEEOCode, function (apInformationEEO) {
				if (response.data.successData.apOnboardingDetails.eeoCodePrimary === apInformationEEO.value
					|| response.data.successData.apOnboardingDetails.eeoCodeSecondary === apInformationEEO.value) {
					$scope.apinfoCheckedCount++;
					apInformationEEO.checked = true;
				} else {
					apInformationEEO.checked = false;
				}
			});
			angular.forEach(response.data.successData.apOnboardingDetails, function (value, key) {
				if(value !== '') eventObject.label += '#'+ key+ ':'+ value;
			});
		} else {
			eventObject.value = 0;
			eventObject.label += '#errorMessage:'+response.data.errorData.ResponseError[0].longMessage;
		}
		$rootScope.$emit('callAnalyticsController', eventObject);
	};

	$scope.setSelectedCustomerDetail = function (accountDetails) {
		if (accountDetails && accountDetails !== '') {
			$rootScope.accountSelected = { 'customerOid': accountDetails.customerOid, 'customerCompanyName': accountDetails.customerName };
		}
	}

	$scope.saveAPInformationError = '';
	$scope.saveOrUpdateAPInformation = function (apInformation, eeoCode) {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'SAVE_AP_INFORMATION',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid,
			'value': 1
		};
		eventObject.label += '#isFrom:'+$state.current.name;
		$scope.saveAPInformationLoading = true;
		$scope.saveAPInformationError = '';
		var params = {};
		params['apOnboardingDetails'] = apInformation;
		delete params['apOnboardingDetails']['createdBy'];
		delete params['apOnboardingDetails']['createdOn'];
		delete params['apOnboardingDetails']['deleteAction'];
		delete params['apOnboardingDetails']['updateAction'];
		delete params['apOnboardingDetails']['updatedBy'];
		delete params['apOnboardingDetails']['updatedOn'];
		if (eeoCode && eeoCode !== '') {
			var selectedEEOCode = [];
			angular.forEach(eeoCode, function (selectedEEO) {
				if (selectedEEO.checked === true) {
					selectedEEOCode.push(selectedEEO.value);
				}
			});
			params['apOnboardingDetails']['eeoCodePrimary'] = selectedEEOCode[0] ? selectedEEOCode[0] : '';
			params['apOnboardingDetails']['eeoCodeSecondary'] = selectedEEOCode[1] ? selectedEEOCode[1] : '';
		}
		var APInformationContainer = document.getElementById('APInformationContainer');
		angular.forEach(params.apOnboardingDetails, function (value, key) {
			if(value !== '') eventObject.label += '#'+ key+ ':'+ value;
		});
		disableAll(APInformationContainer);
		$injector.get('accountDetailServices')['saveOrUpdateAPOnBoardingDetails'](params).then(function (result) {
			enableAll(APInformationContainer);
			$scope.saveAPInformationLoading = false;
			if (result.status && result.status === 'error') {
				$scope.saveAPInformationError = result.data;
				eventObject.value = 0;
				eventObject.label += '#errorMessage:'+result.data.errorData.ResponseError[0].longMessage;
				$rootScope.$emit('callAnalyticsController', eventObject);
			} else {
				$rootScope.$emit('callAnalyticsController', eventObject);
				if ($rootScope.isFromManageReps) {
					$state.go('manage.repAccountDetails.repAccountsTab.apInformation', { 'randomNumber': Math.random() });
				} else {
					$state.go('accounts.accountDetails.apInformation', { 'randomNumber': Math.random() });
				}
			}
		});
	};

	/* User Relationship Submit Function */
	$scope.loadingYourRelationship = false;
	$scope.submitYourRelationship = function (data) {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'SAVE_USER_RELATION_SHIP',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#isFrom:'+$state.current.name,
			'value': 1
		};
		$scope.serviceResponseError = '';
		var params = {
			RepRiskParameter: {},
			VendorRepCustomerDrq: [],
			vendorRepOid: appCon.data.repDetails.repOid,
			repSelectedLocationOids: '',
			repSelectedDepartmentOids: ''
		},
			selectedLocations = [],
			selectedDepartments = [],
			serviceName = 'accountDetailServices',
			operationName = 'saveRepRiskProfile';

		params.RepRiskParameter.onSite = data.RepRiskSummary.repOnSite;
		params.RepRiskParameter.oid = data.RepRiskSummary.repRiskParametersOid;
		params.RepRiskParameter.repQuestionString1 = data.RepRiskSummary.rrpRiskQuestion1;
		params.RepRiskParameter.repQuestionString2 = data.RepRiskSummary.rrpRiskQuestion2;
		params.RepRiskParameter.repQuestionString3 = data.RepRiskSummary.rrpRiskQuestion3;
		params.RepRiskParameter.repQuestionString4 = data.RepRiskSummary.rrpRiskQuestion4;
		params.RepRiskParameter.repQuestionString5 = data.RepRiskSummary.rrpRiskQuestion5;
		params.RepRiskParameter.q1 = data.RepRiskSummary.q_1;
		params.RepRiskParameter.q2 = data.RepRiskSummary.q_2;
		params.RepRiskParameter.q3 = data.RepRiskSummary.q_3;
		params.RepRiskParameter.q4 = data.RepRiskSummary.q_4;
		params.RepRiskParameter.q5 = data.RepRiskSummary.q_5;
		angular.forEach(data.RepRiskSummary.customerDynamicQues, function (value, key) {
			var question = angular.copy(value);
			question.customerDynamicRrpQuestionOid = question.questionOid;
			question.vendorRepOid = appCon.data.repDetails.repOid;
			delete question.deleteAction;
			delete question.updateAction;
			delete question.questionOid;
			delete question.question;
			eventObject.label += '#customerDynamicRrpQuestionOid:'+ question.customerDynamicRrpQuestionOid+'#answered:'+ question.answer;
			params.VendorRepCustomerDrq.push(question);
		});
		angular.forEach(data.CustomerLocations, function (location, key) {
			if (location.checked) {
				selectedLocations.push(location.parentLocation);
			}
			if (location.childLocationList) {
				angular.forEach(location.childLocationList, function (location, key) {
					if (location.checked) {
						selectedLocations.push(location.locationOid);
					}
				});
			}
		});
		angular.forEach(data.DepartmentSummaryList, function (department, key) {
			if (department.checked) {
				selectedDepartments.push(department.oid);
			}
		});
		params.repSelectedLocationOids = selectedLocations.toString();
		params.repSelectedDepartmentOids = selectedDepartments.toString();
		angular.forEach(params.RepRiskParameter , function(value, key){
			if(value !== '') eventObject.label += '#'+ key +':' + value;
		});
		eventObject.label += '#repSelectedDepartmentOids:' + params.repSelectedDepartmentOids + '#repSelectedLocationOids:' + params.repSelectedLocationOids;
		var formElement = document.getElementById('userRelationShipForm');
		disableAll(formElement);
		$scope.loadingYourRelationship = true;
		$injector.get(serviceName)[operationName](params).then(
			function (result) {
				if (result.data && result.data.errorData) {
					enableAll(formElement);
					$scope.loadingYourRelationship = false;
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
						eventObject.label += '#errorMessage:'+$scope.serviceResponseError;
						eventObject.value = 0;
						$rootScope.$emit('callAnalyticsController', eventObject);
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok') {
						$rootScope.$emit('callAnalyticsController', eventObject);
						$injector.get(serviceName).updateVrpRrp().then(
							function (result) {
								if (result.data && result.data.errorData) {
									enableAll(formElement);
									$scope.loadingYourRelationship = false;
									if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
										$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
									}
								} else if (result.data && result.data.successData) {
									if (result.data.successData.Status === 'Ok') {
										$injector.get(serviceName).updateRepRiskProfile().then(
											function (result) {
												if (result.data && result.data.errorData) {
													enableAll(formElement);
													$scope.loadingYourRelationship = false;
													if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
														$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
													}
												} else if (result.data && result.data.successData) {
													$scope.yourRelationShipSuccessRedirect(formElement);
												}
											});
									}
								} else {
									$scope.yourRelationShipSuccessRedirect(formElement);
								}
							});
					}
				} else {
					$scope.yourRelationShipSuccessRedirect(formElement);
				}
			});
	}

	$scope.yourRelationShipSuccessRedirect = function (formElement) {
		enableAll(formElement);
		$scope.loadingYourRelationship = false;
		$rootScope.generalInfoRandom = Math.floor((Math.random() * 6) + 1);
		if ($rootScope.isFromManageReps && $rootScope.isFromAccountDetails) {
			$state.go('manage.repAccountDetails.repAccountsTab.documents.commonDocuments');
		} else if (!$rootScope.isFromManageReps && $rootScope.isFromAccountDetails) {
			$state.go('accounts.accountDetails.documents.commonDocuments');
		}
	}

	$scope.repRiskProfileResponseFormatter = function (response) {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'GET_USER_RELATION_SHIP',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#isFrom:'+$state.current.name,
			'value': 1
		};
		if (response.status === 'success') {
			var LocationList = response.successData.CustomerLocations,
				departmentList = response.successData.DepartmentSummaryList,
				selectedLoctions = (angular.isDefined(response.successData.RepRiskSummary.repLocationOids)) ? (response.successData.RepRiskSummary.repLocationOids).split(',') : [],
				selectedDepartments = (angular.isDefined(response.successData.RepRiskSummary.repDepartmentOids)) ? (response.successData.RepRiskSummary.repDepartmentOids).split(',') : [],
				repRiskSummary = response.successData.RepRiskSummary;
			eventObject.label += '#currentRepRiskProfileOid:'+ repRiskSummary.currentRepRiskProfileOid + '#repOnSite:'+ response.successData.RepRiskSummary.repOnSite;
			eventObject.label += '#q1:'+ repRiskSummary.q_1 +'#q2:'+ repRiskSummary.q_2+ '#q3:'+ repRiskSummary.q_3;
			eventObject.label += '#q4:'+ repRiskSummary.q_4 +'#q5:'+ repRiskSummary.q_5+ '#rrpqsAnswered:'+ repRiskSummary.rrpqsAnswered;
			angular.forEach(LocationList, function (value, key) {
				value.checked = selectedLoctions.indexOf(value.parentLocation) >= 0 ? true : false;
				if (angular.isDefined(value.childLocationList)) {
					angular.forEach(value.childLocationList, function (childLocation, key) {
						childLocation.checked = selectedLoctions.indexOf(childLocation.locationOid) >= 0 ? true : false;
					})
				}
			});
			angular.forEach(departmentList, function (department, key) {
				department.checked = selectedDepartments.indexOf(department.oid) >= 0 ? true : false;
			});
			eventObject.label += '#repLocationOids:'+ selectedLoctions.toString() + '#repDepartmentOids:'+ selectedDepartments.toString();
			$rootScope.$emit('callAnalyticsController', eventObject);
		}
		return response;
	};

	$scope.checkLocationGroup = function (locationGroup, isChecked) {
		angular.forEach(locationGroup, function (parentLocation, key) {
			parentLocation.checked = isChecked;
			if (parentLocation.childLocationList) {
				angular.forEach(parentLocation.childLocationList, function (childLocation, key) {
					childLocation.checked = isChecked;
				});
			}
		});
	};

	$scope.getGeneralInformation = function () {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'GENERAL_INFO',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:' + appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#isFrom:' + $state.current.name,
			'value': 1
		};
		$scope.generalInfoLoading = true;
		getGeneralInformationTimeOut = $timeout(function() {
			$injector.get('accountDetailServices').getGeneralInformation().then(function(result) {
				$scope.generalInfoLoading = false;
				if (result.data && result.data.successData && result.data.successData.Status === 'Ok') {
					$rootScope.accountInfoDetails = result.data.successData;
					eventObject.label += '#complianceStatus:' + $rootScope.accountInfoDetails.complianceStatus;
					angular.forEach($rootScope.accountInfoDetails.generalInfo, function(value, key) {
						if (value !== '' && key !== 'Status' && key !== 'contentType') {
							eventObject.label += '#' + key + ':' + value;
						}
					});
				} else {
					$rootScope.accountInfoDetails = result.data;
					eventObject.label += '#errorMessage:' + result.data.errorData.ResponseError[0].longMessage;
					eventObject.value = 0;
				}
				$rootScope.$emit('callAnalyticsController', eventObject);
			});
		}, 1000);
	}

	$scope.enablePhiSecurityQuestion = false;
	$scope.generalInformationCallback = function (response) {
		if (response.data && response.data.successData && response.data.successData.Status === 'Ok') {
			$scope.enablePhiSecurityQuestion = response.data.successData.generalInfo.enablePhiSecurityQues;
		} else {
			$scope.enablePhiSecurityQuestion = false;
		}
	};

	$scope.formateSendAPInfoMailParam = function (param){
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'SEND_AP_INFO_MAIL',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#emailId:'+param.emailId + '#isFrom:'+$state.current.name,
			'value': 1
		};
		$rootScope.$emit('callAnalyticsController', eventObject);
		return param;
	};

	$scope.apInformationSendMailCallback = function (response) {
		if (response.data && response.data.successData && response.data.successData.Status === 'Ok') {
			if ($rootScope.isFromManageReps) {
				$state.go('manage.repAccountDetails.repAccountsTab.apInformation');
			} else {
				$state.go('accounts.accountDetails.apInformation');
			}
		} else{
			eventObject.value = 0;
			eventObject.label += '#errorMessage:'+response.data.errorData.ResponseError[0].longMessage;
			$rootScope.$emit('callAnalyticsController', eventObject);
		}
	};

	$scope.apInformationSendMail = function () {
		if ($rootScope.isFromManageReps) {
			$state.go('manage.repAccountDetails.repAccountsTab.apInformationSendMail');
		} else {
			$state.go('accounts.accountDetails.apInformationSendMail');
		}
	};

	$scope.saveBusinessRelationshipFormatter = function(request) {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'SAVE_BUSINESS_RELATION_SHIP',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#isFrom:'+$state.current.name,
			'value': 1
		};
		angular.forEach(request, function(value, key){
			if(value !== '') eventObject.label += '#'+ key+ ':'+ value;
		});
		$rootScope.$emit('callAnalyticsController', eventObject);
		request.totalCompanySpend = $scope.convertDollerToNumber(request.totalCompanySpend);
		return request;
	};

	$scope.getBusinessRelationshipFormatter = function(response) {
		var eventObject = {
			'category': 'ACCOUNT_DETAILS',
			'action': 'GET_BUSINESS_RELATION_SHIP',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorRepOid:' + appCon.data.repDetails.repOid + '#vcRelationOid:'+appCon.data.repDetails.vcOid + '#customerOid:' + appCon.data.repDetails.customerOid + '#isFrom:'+$state.current.name,
			'value': 1
		};
		if (response.status === 'success') {
			angular.forEach(response.successData, function(value, key){
				if(value !== '' && key !=='Status' && key !== 'contentType') eventObject.label += '#'+ key+ ':'+ value;
			});
			$rootScope.$emit('callAnalyticsController', eventObject);
			response.successData.repCount -= 1;
			response.successData.totalCompanySpend = $scope
					.convertNumberToDoller(response.successData.totalCompanySpend);
		}
		return response
	};

	$scope.convertDollerToNumber = function(value) {
		var amount = value !== '' ? angular.copy(value.toString()) : '0';
		amount = amount.replace(/[$]/g,"");
		amount = amount.replace(/[,]/g,"");
		if (amount.indexOf("(") !== -1) {
			if (amount.indexOf(")") !== -1) {
				amount = amount.replace(/[(]/g,"-");
			}
		}
		amount = amount.replace(/[)]/g,"");
		var dot = amount.indexOf(".");
		if (dot != -1) {
			var dotArr = amount.split(".");
			if (dotArr.length >= 3) {
				amount = dotArr[0] + "." +dotArr[1];
			}
		}
		return Number(amount);
	};

	$scope.convertNumberToDoller = function(value) {
		var amount = angular.copy(Number(value));
		return $filter('currency')(amount, '$', 2);
	};

	$scope.$on('$destroy', function(){
		$timeout.cancel(getGeneralInformationTimeOut);
	});

}]);