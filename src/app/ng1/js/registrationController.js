'use strict';
angular.module(appCon.appName).controller('registrationController', ['$injector', '$scope', '$state', '$window', '$rootScope', '$http', '$q', '$modal','$location','$cookieStore','$controller', 'auditService','$timeout', '$sce', function ($injector, $scope, $state, $window, $rootScope, $http, $q, $modal, $location,$cookieStore,$controller,auditService,$timeout, $sce) {
	var authMode = appCon.globalCon.authentication.mode.toLowerCase();
	$scope.data = {};
	$rootScope.repProfileLoginUrlLoading=false;
	$scope.templateFromNVD=true;
	$rootScope.unspscLink = appCon.globalCon.unspsc;
	$rootScope.showExpressAgreementTab=true;
	$rootScope.ghxPurchasePlan = appCon.globalCon.ghxPurchasePlan;
	$rootScope.ghxEducation = appCon.globalCon.ghxEducationVideo;
	$rootScope.paymentTechEnable = appCon.globalCon.pci.enable;
	$window.scopeToShare = $scope;
	$window.state = $state;
	$window.appConData = appCon.data;
	$scope.goToGhxVideo = function (fromPage) {
		var videoURL;
		if (fromPage === 1) {
			videoURL = $rootScope.ghxEducation.supplierSetup;
		} else if (fromPage === 2) {
			videoURL = $rootScope.ghxEducation.supplierRegister;
		}
		$window.open(videoURL);
	};
	
	// Base url configuration 
	var urlIndex = ($location.absUrl()).indexOf('/#/'),baseUrl;
	if(urlIndex !== -1){
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	}else{
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/"+contextPath+"/");
		baseUrl = baseUrl[0]+"/"+ contextPath;
	}
	
	var registrationUIFrom,healthsystemDetailsPage,companyDetailPage,companyRelationshipPage,userRelationshipPage,agreementsPage,paymentDetailsPage,paymentDetailsThankYouPage,healthsystemDetailsThankYouPage;
	if($rootScope.isFromManageReps){
		registrationUIFrom='manage.repAccountDetails.repAccountsTab.normal';
	}else{
		registrationUIFrom='accounts.accountDetails.normal';
	}
	healthsystemDetailsPage=registrationUIFrom+'.healthsystemDetails';
	companyDetailPage=registrationUIFrom+'.companyDetails';
	companyRelationshipPage=registrationUIFrom+'.companyRelationship';
	userRelationshipPage=registrationUIFrom+'.userRelationship';
	agreementsPage=registrationUIFrom+'.agreements';
	if($rootScope.paymentTechEnable === 'true'){
		paymentDetailsPage=registrationUIFrom+'.paymentDetailsPCI';
	}else{
		paymentDetailsPage=registrationUIFrom+'.paymentDetails';
	}
	paymentDetailsThankYouPage=registrationUIFrom+'.paymentDetails.thankYou';
	healthsystemDetailsThankYouPage=registrationUIFrom+'.healthsystemDetails.thankYou';
	$scope.healthSystemDetailFormSubmit = false;

	$scope.validateSupplierBlocked = function(isFrom, customerInfo){
		$scope.serviceResponseError = '';
		$injector.get('dashboardServices')['getUserByUserName']().then(function(result) {
			if(result.data && result.data.successData && result.data.successData.Status === 'Ok'){
				if(angular.isDefined(result.data.successData.detail.isSupplierBlocked) && result.data.successData.detail.isSupplierBlocked === true){
					$scope.serviceResponseError = result.data.successData.detail.blockedMessage;
				} else {
					$scope.submitHealthSystemDetails(isFrom, customerInfo);
				}
			} else {
				$scope.submitHealthSystemDetails(isFrom, customerInfo);
			}
		});
	};

	$scope.submitHealthSystemDetails = function (isFrom,customerInfo) {
		if($scope.healthSystemDetailFormSubmit === true){
			return;
		}
		$scope.healthSystemDetailFormSubmit = true;
		$scope.serviceResponseError='';
		var registrationServices = $injector.get('dashboardServices');
		disableFormById("normalHealthSystemDetailsForm");
		if(angular.isUndefined(appCon.data.repDetails)){
    		appCon.data.repDetails=[];
    	}
		appCon.data.paymentCouponDetails={};
		appCon.data.customerDetail.expressRegistered=(isFrom && isFrom === 'normal') ? 'false' : 'true';
		var eventObject = {
				"category"	: "NORMAL",
				"action"	: "NORMAL_HEALTH_SYSTEM_DETAILS",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#userOid:"+$rootScope.userProfile.id+"#expressRegistered:"+appCon.data.customerDetail.expressRegistered+"#paymentTechEnable:"+$rootScope.paymentTechEnable,
				"value"		: 1
		};
		if(angular.isDefined(customerInfo) && customerInfo !== null) {
			eventObject.label += "#userAction:clickNextButton";
			appCon.data.customerDetail.verticalCode = customerInfo.verticalCode;
			appCon.data.customerDetail.enableExpressRegistered = customerInfo.enableExpressRegistration;
			var customerName=customerInfo.companyName;
			$rootScope.customerName= customerName.replace(/<\/?[^>]+(>|$)/g, '');
		}
		$scope.euiMatchKey = {};
		if(angular.isDefined($rootScope.inviteVO) && angular.isDefined($rootScope.inviteVO.euiMatchKey)){
			$scope.euiMatchKey = {'euiMatchKey':$rootScope.inviteVO.euiMatchKey};
		}
		registrationServices.saveVendorAndUser($scope.euiMatchKey).then(
			function (result) {
			if (result.data.status === 'error') {
				$scope.healthSystemDetailFormSubmit = false;
				enableFormById("normalHealthSystemDetailsForm");
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				eventObject.value = 0;
				eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
				$rootScope.$emit("callAnalyticsController", eventObject);
			} else if (result.data.status === 'success') {
				var companyDetailsUpdated = result.data.successData.VendorDetail.companyDetailsUpdated; 	
				eventObject.label += "#vrpqsAnswered:"+result.data.successData.VCRelation.vrpqsAnswered+"#isExpressRegistered:"+result.data.successData.VCRelation.isExpressRegistered;
				$rootScope.showCompanyRelationshipTab=result.data.successData.VCRelation.vrpqsAnswered;				
				appCon.data.repDetails.vcOid=result.data.successData.VCRelation.oid;
				appCon.data.repDetails.expressRegistered = result.data.successData.VCRelation.isExpressRegistered;
				if(angular.isDefined(result.data.successData.VREP)){
					appCon.data.repDetails.customerOid = result.data.successData.VREP.customerOid;
					appCon.data.repDetails.repOid = result.data.successData.VREP.oid;
				}
				appCon.data.auditDetail.actorOid = result.data.successData.VREP.oid;
				appCon.data.auditDetail.vcRelationOid = result.data.successData.VCRelation.oid;
				eventObject.label += "#actorOid:"+appCon.data.auditDetail.actorOid+"#VCRelationOid:"+appCon.data.auditDetail.vcRelationOid;
				var docRepoCustomerOid=result.data.successData.VendorDetail.docRepoCustomerOid;
				if(((appCon.data.customerDetail.verticalCode==='1CRED') && (docRepoCustomerOid !== null && docRepoCustomerOid === appCon.data.customerDetail.customerOid))){
					$rootScope.showExpressAgreementTab=false;
				}else{
					$rootScope.showExpressAgreementTab=true;
				}
				if(isFrom && isFrom === 'normal'){
					$scope.healthSystemDetailFormSubmit = false;
					enableFormById("normalHealthSystemDetailsForm");
					$rootScope.enablePhiSecurityQues = customerInfo.enablePhiSecurityQuestions;
					/* Skip company details and redirect vrp or rrp page if existing vendor */
					if (angular.isDefined(companyDetailsUpdated)) {
						if (companyDetailsUpdated === true) {
							if ($rootScope.showCompanyRelationshipTab===true) {
								eventObject.label += "#goTo:userRelationshipPage";
								$rootScope.$emit("callAnalyticsController", eventObject);
								$state.go(userRelationshipPage);
							}else if ($rootScope.showCompanyRelationshipTab===false) {
								eventObject.label += "#goTo:companyRelationshipPage";
								$rootScope.$emit("callAnalyticsController", eventObject);
								$state.go(companyRelationshipPage);
							}
							
						} else if (companyDetailsUpdated === false) {
							eventObject.label += "#goTo:companyDetailPage";
							$rootScope.$emit("callAnalyticsController", eventObject);
							$state.go(companyDetailPage);
						} 
					} else  {
						eventObject.label += "#goTo:companyDetailPage";
						$rootScope.$emit("callAnalyticsController", eventObject);
						$state.go(companyDetailPage);
					}
				}
				// Sync TPM entity
				var tpmParams = {'organizationName' : $rootScope.customerName};								
				registrationServices.syncTPMEntityRelationForRep(tpmParams).then(
						function (result) {
						/*if (result.data.status === 'error') {
							$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
						}*/
				});
				auditService.saveAudit('dashboardServices');
			}
		});
	};
	/* Common Function For Express Flow if express flag is true */
	$scope.flowEndState=function(isFrom, object){
		if(angular.isDefined(object)){
			var flowEndEvent = angular.copy(object);
			flowEndEvent.label += "#phaseCompleted:true#flowEndFrom:" + (angular.isDefined(isFrom) ? angular.copy(isFrom) : "direct");
			$rootScope.$emit("callAnalyticsController", flowEndEvent);
		}
		if(angular.isDefined($rootScope.enableExpressRegistration)){
			if($rootScope.enableExpressRegistration === true){
				//$scope.onboardingJIT();
				var modalInstance = $modal.open({
					templateUrl : 'views/registration/normal/nvdExpressFlowPopup.html?rnd='+appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					scope : $scope
				});
				if ($rootScope.isIframeEnabled === 'true') {
					$rootScope.repProfileLoginUrlLoading = true;
				}
			}else if($rootScope.enableExpressRegistration === false){
				auditService.saveAudit('dashboardServices');
				$rootScope.repProfileLoginUrlLoading = true;
				if ($rootScope.isIframeEnabled === 'false' && $rootScope.isFromManageReps === false) {
					$state.go('accounts.accountDetails.documents.commonDocuments');
				} else if($rootScope.isIframeEnabled === 'false' && $rootScope.isFromManageReps === true){
					$state.go('manage.repAccountDetails.repAccountsTab.documents.commonDocuments');
				}
			}
		}
	};
	$scope.saveProductsAndServices = function (dataParam,requstParam) {
		$scope.productString = dataParam;
		$scope.responseError = false;
		$scope.noRecordFound = false;
		$scope.mustSelectError = false;
		$scope.requiredErrorMessage = false;
		$scope.searchStringErrorMessage = false;
			var codes='';
			$scope.searchStringErrorMessage = false;
			var dbaname,dnblistnumber;
			var productService ={};
			if(requstParam && requstParam.companyDetails.dbaName && requstParam.companyDetails.dbaName !== undefined){
				dbaname = requstParam.companyDetails.dbaName;
			}
			if(requstParam && requstParam.companyDetails.dnbListingNumber && requstParam.companyDetails.dnbListingNumber !== undefined){
				dnblistnumber = requstParam.companyDetails.dnbListingNumber;
			}
			var eventObject = {
					"category"	: "NORMAL",
					"action"	: "NORMAL_COMPANY_DETAILS",
					"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#typeOfBusinessCode:"+requstParam.companyDetails.typeOfBusinessCode+"#paymentTechEnable:"+$rootScope.paymentTechEnable,
					"value"		: 1
			};
			productService.VendorDetail = {'typeOfBusinessCode':requstParam.companyDetails.typeOfBusinessCode,'dnbListingNumber':dnblistnumber,'dbaName':dbaname};
			disableFormById("normalCompanyDetailsForm");
			$injector.get('dashboardServices').saveVendorDetailNormalReg(productService).then(function(result){
				enableFormById("normalCompanyDetailsForm");
				if(result.data && result.data.status==='success'){
					angular.forEach($scope.productString, function(value, key){
						if(key === 'productAndServiceCodes'){
							for(var i=0;i<($scope.productString.productAndServiceCodes.length);i++){	
								if(i===0){
									codes=value[i].code;
								}else{
									codes=codes+','+value[i].code;
								}
							}
						}
					});
					if(codes==='' || angular.isUndefined(codes)){
						eventObject.label += "#productAndServiceCodes:NULL";
						if($rootScope.showCompanyRelationshipTab===true){
							//$state.go('accounts.accountDetails.normal.userRelationship');
							eventObject.label += "#goTo:userRelationship";
							$rootScope.$emit("callAnalyticsController", eventObject);
							$state.go(userRelationshipPage);
						}else if($rootScope.showCompanyRelationshipTab===false)
						{
							//$state.go('accounts.accountDetails.normal.companyRelationship');
							eventObject.label += "#goTo:companyRelationship";
							$rootScope.$emit("callAnalyticsController", eventObject);
							$state.go(companyRelationshipPage);
						}
					}else{
					var myProduct ='';
					var postParam = {'myProductDesc':myProduct,'productAndServiceCodes':codes};
					eventObject.label += "#productAndServiceCodes:"+codes;
					var saveProductEvent = angular.copy(eventObject);
					saveProductEvent.label += "#isFrom:saveVendorDetailSuccess";
					disableFormById("normalCompanyDetailsForm");
					$injector.get('dashboardServices').saveProductsAndServices(postParam).then(function(result){
						enableFormById("normalCompanyDetailsForm");
						if(result.data && result.data.status==='success'){
							if($rootScope.showCompanyRelationshipTab===true){
								//$state.go('accounts.accountDetails.normal.userRelationship');
								saveProductEvent.label += "#goTo:userRelationship";
								$rootScope.$emit("callAnalyticsController", saveProductEvent);
								$state.go(userRelationshipPage);
							}else if($rootScope.showCompanyRelationshipTab===false)
							{
								//$state.go('accounts.accountDetails.normal.companyRelationship');
								saveProductEvent.label += "#goTo:companyRelationship";
								$rootScope.$emit("callAnalyticsController", saveProductEvent);
								$state.go(companyRelationshipPage);
							}
						}else{
							$scope.responseError = true;
							$scope.responseErrorMessage = result.data;
							saveProductEvent.value = 0;
							saveProductEvent.label += "#errorMessage:"+result.data.errorData.ResponseError[0].longMessage;
							$rootScope.$emit("callAnalyticsController", saveProductEvent);
						}
					});
				} 
				auditService.saveAudit('dashboardServices');
				}else{
					$scope.responseError = true;
					$scope.responseErrorMessage = result.data;
					eventObject.label += "#errorMessage:"+result.data.errorData.ResponseError[0].longMessage;
					eventObject.value = 0;
					$rootScope.$emit("callAnalyticsController", eventObject);
				}
			});
	};
	$scope.getProductAndServiceCode = function (){
		$injector.get('dashboardServices').getRecentProductCodes().then(function(result){
			if(result.data && result.data.status==='success'){
				$scope.productData = result.data.successData.ProductCodeList;
			}
		});
	};
	/**  get typeOfBusinessCode from getVendor response **/
	$scope.getBusinessType = function(param){
		var businessList = "";
		if(angular.lowercase(param.status) === 'success'){
			var findKey = _.findIndex($rootScope.allLookups.lookups.VENDOR_TYPE_OF_BUSINESS, function(o) { return o.code == param.successData.VendorDetail.typeOfBusinessCode; });
			businessList = findKey !== -1 ? $rootScope.allLookups.lookups.VENDOR_TYPE_OF_BUSINESS[findKey] : ""
		}
		param.successData.VendorDetail.businessList = businessList;
		return param;
	};
	/** Set Dynamic Payment Expiry Years **/
	var year = new Date().getFullYear();
	var range = [];
	range.push(year);
	for(var i=1;i<10;i++) {
		range.push(year + i);
	}
	$scope.expiryYears = range;	
	/** Get Lookup Call Function **/
	$scope.getAllLookups = function(lookupsCategory, secure) {
		var userServices = $injector.get('dashboardServices');
		var lookupsParam = {'isVision':'true','categories':lookupsCategory};
		if(secure === false){			
			userServices.getAllLookupsByCategoriesNonSecure(lookupsParam).then(function(result){
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					}
				} else if(result.data && result.data.successData && result.data.status==='success'){
					$rootScope.allLookups = result.data.successData;
				}
			});
		} else if(secure === true) {
			userServices.getAllLookupsByCategories(lookupsParam).then(function(result){
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					}
				} else if(result.data && result.data.successData && result.data.status==='success'){
					$rootScope.allLookups = result.data.successData;
				}
			});
		}
	};
	/* User Relationship Submit Function */
	$scope.submitYourRelationship = function (data){
		$scope.serviceResponseError='';
		var params = {},operationName,serviceName,i,j=0,k=0,m;
		serviceName = 'dashboardServices';
		operationName = 'saveRepRiskProfile';
		params.RepRiskParameter = [];
		params.RepRiskParameter = data.RepRiskSummary;
		$scope.repSelectedLocationOids ='';
		$scope.repSelectedDepartmentOids ='';		
		params.vendorRepOid =appCon.data.repDetails.repOid;
		if(data.RepRiskSummary.customerDynamicQues){
			params.VendorRepCustomerDrq = data.RepRiskSummary.customerDynamicQues;
		}
		angular.forEach(data.CustomerLocations, function(value, key) {
			if(value.checked === true){
				if (j === 0){
					$scope.repSelectedLocationOids = value.parentLocation;
				} else {
					$scope.repSelectedLocationOids = $scope.repSelectedLocationOids + ',' +value.parentLocation;
				}
				j++;
			}
			if(value.childLocationList){
				for(i=0; i<value.childLocationList.length; i++){
					if(value.childLocationList[i].checked === true){
						if($scope.repSelectedLocationOids !== ''){
							$scope.repSelectedLocationOids = $scope.repSelectedLocationOids + ',' +value.childLocationList[i].locationOid;
						} else {
							$scope.repSelectedLocationOids = value.childLocationList[i].locationOid;
						}
					}
				}
			}
		});
		params.repSelectedLocationOids = $scope.repSelectedLocationOids;
		angular.forEach(data.DepartmentSummaryList, function(value, key) {
			if(value.checked === true){
				if (k === 0){
					$scope.repSelectedDepartmentOids = value.oid;
				} else {
					$scope.repSelectedDepartmentOids = $scope.repSelectedDepartmentOids + ',' +value.oid;
				}
				k++;
			}
		});
		params.repSelectedDepartmentOids = $scope.repSelectedDepartmentOids;
		if(params.VendorRepCustomerDrq && params.VendorRepCustomerDrq.length > 0){
			for(i=0; i<params.VendorRepCustomerDrq.length; i++){
				params.VendorRepCustomerDrq[i].customerDynamicRrpQuestionOid = params.VendorRepCustomerDrq[i].questionOid;
				params.VendorRepCustomerDrq[i].vendorRepOid =appCon.data.repDetails.repOid;
				delete params.VendorRepCustomerDrq[i].deleteAction;
				delete params.VendorRepCustomerDrq[i].updateAction;
				delete params.VendorRepCustomerDrq[i].questionOid;
				delete params.VendorRepCustomerDrq[i].question;
			}
		}
		delete params.RepRiskParameter.customerOid;
		delete params.RepRiskParameter.updateAction;
		delete params.RepRiskParameter.vcOid;
		delete params.RepRiskParameter.rrpqsAnswered;
		delete params.RepRiskParameter.riskProfileUpdatedOn;
		delete params.RepRiskParameter.riskProfileUpdatedBy;
		delete params.RepRiskParameter.riskProfileType;
		delete params.RepRiskParameter.riskProfileOid;
		delete params.RepRiskParameter.riskProfileCreatedOn;
		delete params.RepRiskParameter.riskProfileCreatedBy;
		delete params.RepRiskParameter.riskParamOid;
		delete params.RepRiskParameter.repOid;
		delete params.RepRiskParameter.deleteAction;
		delete params.RepRiskParameter.currentRepRiskProfileOid;
		delete params.RepRiskParameter.repLocationOids;
		delete params.RepRiskParameter.riskProfileComment;
		delete params.RepRiskParameter.docVerificationReq;
		delete params.RepRiskParameter.optionalDocumentBundles;
		delete params.RepRiskParameter.requiredDocumentBundles;
		delete params.RepRiskParameter.maintainPhiOnBehalfOfHospital;
		delete params.RepRiskParameter.phiOnSite;
		delete params.RepRiskParameter.riskProfileOid;
		delete params.RepRiskParameter.riskProfileComment;
		delete params.RepRiskParameter.docVerificationReq;
		delete params.RepRiskParameter.encryptedTaxId;
		delete params.RepRiskParameter.customerDynamicQues;
		delete params.RepRiskParameter.riskQ1SignedBy;
		delete params.RepRiskParameter.riskQ2SignedBy;
		delete params.RepRiskParameter.riskQ3SignedBy;
		delete params.RepRiskParameter.riskQ4SignedBy;
		delete params.RepRiskParameter.riskQ5SignedBy;
		delete params.RepRiskParameter.riskParamCustomerLocationIds;
		delete params.RepRiskParameter.riskParamCustomerDepartmentIds;
		delete params.RepRiskParameter.repDepartmentOids;
		delete params.RepRiskParameter.repLocationOids;
		var eventObject = {
				"category"	: "NORMAL",
				"action"	: "NORMAL_USER_RELATIONSHIP",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.auditDetail.vcRelationOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#paymentTechEnable:"+$rootScope.paymentTechEnable+"#userAction:ClickNextButton",
				"value"		: 1
		};
		disableFormById("normalUserRelationShipForm");
		$injector.get(serviceName)[operationName](params).then(
			function (result) {
				enableFormById("normalUserRelationShipForm");
			if (result.data && result.data.errorData) {
				if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;	
					eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
					eventObject.value = 0;
					$rootScope.$emit("callAnalyticsController", eventObject);
				}
			} else if (result.data && result.data.successData) {
				if (result.data.successData.Status === 'Ok') {
					if(angular.isDefined(result.data.successData.eulaSigned)){
						if(result.data.successData.eulaSigned==='true'){
							$rootScope.showExpressAgreementTab=false;
						}else if(result.data.successData.eulaSigned==='false'){
							$rootScope.showExpressAgreementTab=true;
						}
					}
					var updateVrpRrpEvent = angular.copy(eventObject);
					updateVrpRrpEvent.label += "#isFrom:saveRRP";
					$injector.get(serviceName).updateVrpRrp().then(
							function (result) {
							if (result.data && result.data.errorData) {
								if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
									$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
									updateVrpRrpEvent.label += "#errorMessage:"+$scope.serviceResponseError;
									updateVrpRrpEvent.value = 0;
									$rootScope.$emit("callAnalyticsController", updateVrpRrpEvent);
								}
							} else if (result.data && result.data.successData) {
								if (result.data.successData.Status === 'Ok') {
									var updateRRPEvent = angular.copy(updateVrpRrpEvent);
									updateRRPEvent.label += "#isFrom:updateRRP";
									$injector.get(serviceName).updateRepRiskProfile().then(
										function (result) {
										if (result.data && result.data.errorData) {
											if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
												$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
												updateRRPEvent.label += "#errorMessage:"+$scope.serviceResponseError;
												updateRRPEvent.value = 0;
												$rootScope.$emit("callAnalyticsController", updateRRPEvent);
											}
										} else if (result.data && result.data.successData) {
											if (result.data.successData.Status === 'Ok') {
												if(angular.isDefined($rootScope.showExpressAgreementTab) && $rootScope.showExpressAgreementTab===true){
													//$state.go('accounts.accountDetails.normal.agreements');
													updateRRPEvent.label += "#goTo:normalAgreements";
													$rootScope.$emit("callAnalyticsController", updateRRPEvent);
													$state.go(agreementsPage);
													auditService.saveAudit('dashboardServices');
												}else if(angular.isDefined($rootScope.showExpressAgreementTab) && $rootScope.showExpressAgreementTab===false){
													var saveVendorRiskNormalEvent = angular.copy(updateRRPEvent);
													$injector.get("dashboardServices")['refreshPaymentProfileAndVC']().then(function (refreshPaymnetResult) {
														var refreshPaymnetStatus  = angular.isDefined(refreshPaymnetResult.data.successData.Status) ? "Ok" : "Error";
														saveVendorRiskNormalEvent.label += "#refreshPaymentProfileAndVCStatus:"+refreshPaymnetStatus;
														$injector.get('dashboardServices').saveVendorRiskProfileForNormal().then(function (saveVRPResult) {
															saveVendorRiskNormalEvent.label += "#isFrom:saveVRPNormalSuccess";
															if (saveVRPResult.data.status === 'error') {
																$scope.serviceResponseError = saveVRPResult.data.errorData.ResponseError[0].longMessage;
																saveVendorRiskNormalEvent.label += "#errorMessage:"+$scope.serviceResponseError;
																saveVendorRiskNormalEvent.value = 0;
																$rootScope.$emit("callAnalyticsController", saveVendorRiskNormalEvent);
															} else if (saveVRPResult.data.successData.Status === 'Ok'){
																$rootScope.paymentPrice=saveVRPResult.data.successData.paymentPrice;
																saveVendorRiskNormalEvent.label += "#paymentPrice:"+$rootScope.paymentPrice;
																if(saveVRPResult.data.successData.paymentRequired && saveVRPResult.data.successData.paymentRequired === true){
																	//$state.go('accounts.accountDetails.normal.paymentDetails');
																	$rootScope.paymentSkip = true;
																	$rootScope.paymentRequired = true;
																	saveVendorRiskNormalEvent.label += "#goTo:paymentDetails#paymentRequired:true";
																	$rootScope.$emit("callAnalyticsController", saveVendorRiskNormalEvent);
																	auditService.saveAudit('dashboardServices');
																	$state.go(paymentDetailsPage);
																} else{
																	$rootScope.paymentRequired = false;
																	$rootScope.paymentSkip = false;
																	appCon.data.auditDetail.phaseCompleted='true';
																	saveVendorRiskNormalEvent.label += "#paymentRequired:false";
																	$scope.flowEndState('saveVRPNormal',saveVendorRiskNormalEvent);
																}
															}
														});
													});
												}
											}
										}
									});
								}
							}
						});
				}
			}
		});
	};
	/* Save Agreement function */
	$scope.validateAgreement=function(cfiRelationship,cfiBoardAffl,cfiCompensation,relationArray,affArray,compArray,conflictSummary,isFrom){
		$scope.showRelationShipError=false;
		$scope.showAffiliationsError=false;
		$scope.showCompensationError=false;						
		if(cfiRelationship==='true'){
			var relationCount=0;
			angular.forEach(relationArray,function(value,key){
				if((value.organization!==''&& angular.isDefined(value.organization)) && (value.person!=='' && angular.isDefined(value.person)) && (value.natureOfRelationship!=='' && angular.isDefined(value.natureOfRelationship))){
					relationCount++;
				}	
			});					
			if(relationCount===0){
				$scope.showRelationShipError=true;
			}else{
				$scope.showRelationShipError=false;
			}
		}
		if(cfiBoardAffl==='true'){
			var affCount=0;
			angular.forEach(affArray,function(value,key){
				if((value.organization!==''&& angular.isDefined(value.organization)) && (value.person!=='' && angular.isDefined(value.person)) && (value.natureOfRelationship!=='' && angular.isDefined(value.natureOfRelationship))){
					affCount++;
				}	
			});
			if(affCount===0){
				$scope.showAffiliationsError=true;
			}else{
				$scope.showAffiliationsError=false;
			}
		}
		if(cfiCompensation==='true'){
			var compCount=0;
			angular.forEach(compArray,function(value,key){
				if((value.organization!==''&& angular.isDefined(value.organization)) && (value.person!=='' && angular.isDefined(value.person)) && (value.natureOfRelationship!=='' && angular.isDefined(value.natureOfRelationship))){
					compCount++;
				}	
			});
			if(compCount===0){
				$scope.showCompensationError=true;
			}else{
				$scope.showCompensationError=false;
			}					
		}
		if(!$scope.showRelationShipError && !$scope.showAffiliationsError && !$scope.showCompensationError){
					$scope.saveAgreement(conflictSummary,1,isFrom);
			}
	};
	$scope.saveAgreement = function (conflictSummary,type,isFrom) {
		if (conflictSummary.cfiRelationship === 'false') {
			delete conflictSummary.relatList;
		}
		if (conflictSummary.cfiBoardAffl === 'false') {
			delete conflictSummary.serveList;
		}
		if (conflictSummary.cfiCompensation === 'false') {
			delete conflictSummary.compList;
		}	
		var params = {};		
		params.conflictSummary = conflictSummary;
		if(angular.isDefined(params.conflictSummary.vendorRepOid)){
			params.conflictSummary.vendorRepOid=appCon.data.repDetails.repOid;
		}
		/* Replaced VendorRepOid if fields to be filled */
		if(angular.isDefined(conflictSummary.relatList)){
			angular.forEach(conflictSummary.relatList,function(value,key){
				if(angular.isDefined(value["actorOid"])){
					value["actorOid"]=appCon.data.repDetails.repOid;
				}
				if(angular.isUndefined(value["organization"])){
					value["organization"]='';
				}
				if(angular.isUndefined(value["person"])){
					value["person"]='';
				}
				if(angular.isUndefined(value["natureOfRelationship"])){
					value["natureOfRelationship"]='';
				}
			});
		}
		if(angular.isDefined(conflictSummary.serveList)){
			angular.forEach(conflictSummary.serveList,function(value,key){
				if(angular.isDefined(value["actorOid"])){
					value["actorOid"]=appCon.data.repDetails.repOid;
				}
				if(angular.isUndefined(value["organization"])){
					value["organization"]='';
				}
				if(angular.isUndefined(value["person"])){
					value["person"]='';
				}
				if(angular.isUndefined(value["natureOfRelationship"])){
					value["natureOfRelationship"]='';
				}
			});
		}
		if(angular.isDefined(conflictSummary.compList)){
			angular.forEach(conflictSummary.compList,function(value,key){
				if(angular.isDefined(value["actorOid"])){
					value["actorOid"]=appCon.data.repDetails.repOid;
				}
				if(angular.isUndefined(value["organization"])){
					value["organization"]='';
				}
				if(angular.isUndefined(value["person"])){
					value["person"]='';
				}
				if(angular.isUndefined(value["natureOfRelationship"])){
					value["natureOfRelationship"]='';
				}
			});
		}
		params.vendorRepOid=appCon.data.repDetails.repOid;
		var serviceName = 'dashboardServices';
		var operationName = 'saveVendorRepAgreement';
		var eventObject = {
				"category"	: "NORMAL",
				"action"	: "NORMAL_AGREEMENTS",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.auditDetail.vcRelationOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#paymentTechEnable:"+$rootScope.paymentTechEnable,
				"value"		: 1
		};
		disableFormById("normalAgreementsForm");
		$injector.get(serviceName)[operationName](params).then(
				function (result) {
				if (result.data && result.data.errorData) {
					enableFormById("normalAgreementsForm");
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {						
							$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
							eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
							eventObject.value = 0;
							$rootScope.$emit("callAnalyticsController", eventObject);
							return;
						}
						
					}
				else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok') {
						if (result.data.successData) {								
							if(result.data.successData.VREP){
								if(angular.isDefined(result.data.successData.VREP.vrepEulaSignedSig)){
									$rootScope.vrepEulaSigned=true;
								}else{
									$rootScope.vrepEulaSigned=false;
								}
							}else{
								$rootScope.vrepEulaSigned=false;
							}
							var saveVendorRiskNormalEvent = angular.copy(eventObject);
							saveVendorRiskNormalEvent.label += "#isFrom:saveVendorRepAgreementSuccess";
							$injector.get("dashboardServices")['refreshPaymentProfileAndVC']().then(function (refreshPaymnetResult) {
								var refreshPaymnetStatus  = angular.isDefined(refreshPaymnetResult.data.successData.Status) ? "Ok" : "Error";
								saveVendorRiskNormalEvent.label += "#refreshPaymentProfileAndVCStatus:"+refreshPaymnetStatus;
								$injector.get('dashboardServices').saveVendorRiskProfileForNormal().then(function (saveVRPResult) {
									if (saveVRPResult.data.status === 'error') {
										enableFormById("normalAgreementsForm");
										$scope.serviceResponseError = saveVRPResult.data.errorData.ResponseError[0].longMessage;
										saveVendorRiskNormalEvent.label += "#errorMessage:"+$scope.serviceResponseError;
										saveVendorRiskNormalEvent.value = 0;
										$rootScope.$emit("callAnalyticsController", saveVendorRiskNormalEvent);
									} else if (saveVRPResult.data.successData.Status === 'Ok'){
										enableFormById("normalAgreementsForm");
										$rootScope.paymentPrice=saveVRPResult.data.successData.paymentPrice;
										if(saveVRPResult.data.successData.paymentRequired && saveVRPResult.data.successData.paymentRequired === true){
											auditService.saveAudit('dashboardServices');
											//$state.go('accounts.accountDetails.normal.paymentDetails');
											saveVendorRiskNormalEvent.label += "#goTo:paymentDetails";
											$rootScope.$emit("callAnalyticsController", saveVendorRiskNormalEvent);
											$state.go(paymentDetailsPage);
										} else {
											appCon.data.auditDetail.phaseCompleted='true';
											$scope.flowEndState(operationName,saveVendorRiskNormalEvent);
										}
									}
								});
							});
						}
					}
				}
		});					
	};	
	/* Payment Save Function */
	$scope.paymentFormSubmit = false;
	$scope.updatePaymentAndVcRelation = function (requestParam, isFrom) {
		if($scope.paymentFormSubmit === true){
			return;
		}
		$scope.paymentFormSubmit = true;
		//$rootScope.repProfileLoginUrl = $rootScope.autoDocIframeURL;
		$scope.serviceResponseError='';
		var params = {};
		var serviceName = 'dashboardServices';
		var operationName = 'takePaymentAndUpdateVCRelation';
		params.CardProfile = requestParam.CardProfile;
		params.VendorRegistration={'vcRelationOid':appCon.data.repDetails.vcOid,'vendorPrice':$rootScope.paymentPrice,'customerOid':appCon.data.repDetails.customerOid,'regType':isFrom,'vrepOid':appCon.data.repDetails.repOid};
		params.paymentFrom = 'vdb';
		var eventObject = {
				"category"	: "NORMAL",
				"action"	: "NORMAL_PAYMENT",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.auditDetail.vcRelationOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable,
				"value"		: 1
		};
		disableFormById("normalPaymentDetailsForm");
		$injector.get(serviceName)[operationName](params).then(
				function (result) {
				$scope.paymentFormSubmit = false;
				enableFormById("normalPaymentDetailsForm");
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
						eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
						eventObject.value = 0;
						$rootScope.$emit("callAnalyticsController", eventObject);
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok'){
						appCon.data.auditDetail.phaseCompleted='true';
						$scope.flowEndState("takePayment",eventObject);
					}
				  }
			});
	};
	/** Get Vendor Risk Parameters Call Function **/
	$scope.getVendorRiskParameters=function(){
		$scope.serviceResponseError='';
		var normalServices = $injector.get('dashboardServices');
		normalServices.getVendorRiskParameters().then(function(result){
			if(result.data && result.data.status==='success'){
				if(angular.isDefined(result.data.successData.VendorRiskParameters)){
					var companyRelationshipFields=['expressVc','encryptedTaxId','allowPotentialVendors','onSite','riskQuestion1','riskQuestion2','riskQuestion3','riskQuestion4','riskQuestion5','question1','question2','question3','question4','question5','legalName','potential','spend','oid','vrpqsAnswered','maintainPhiOnBehalfOfHospital','phiOnSite','tierCode'];
					angular.forEach(companyRelationshipFields,function(value,key){
						if(angular.isDefined(result.data.successData.VendorRiskParameters[value])){
							$scope.data[value]=result.data.successData.VendorRiskParameters[value];
						}
					});
					if(!$scope.data.numberOfReps){
						$scope.data.numberOfReps=0;
					}
				}	
			}
			else if (result.data && result.data.status === 'error') {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
			}	
		});
	};
	$scope.getAllSelectedLocation = function(LocationObj, selectedLocObj){
		var selectedLocObjArr = selectedLocObj.split(',');
		if(selectedLocObjArr){
			for(var i=0; i<selectedLocObjArr.length; i++){
				angular.forEach(LocationObj, function(value, key) {
					if(value.parentLocation === selectedLocObjArr[i]){
						value.checked=true;
					}
					if(value.childLocationList){
						for(var j=0; j<value.childLocationList.length; j++){
							if(value.childLocationList[j].locationOid === selectedLocObjArr[i]){
								value.childLocationList[j].checked=true;
							}
						}
					}
				});
			}
		}
	};
	$scope.getAllSelectedDept = function(DeptObj, selectedLocObj){
		var selectedLocObjArr = selectedLocObj.split(',');
		if(selectedLocObjArr){
			for(var i=0; i<selectedLocObjArr.length; i++){
				angular.forEach(DeptObj, function(value, key) {
					if(value.oid === selectedLocObjArr[i]){
						value.checked=true;
					}
				});
			}
		}
	};
	$scope.getProducts = function (searchTerm, match) {
		$scope.searchStringError = false;
		$scope.searchStringErrorMessage = false;
		if (searchTerm === '' || angular.isUndefined(searchTerm)) {
			$scope.noRecordFound =false;
			$scope.mustSelectError =false;
			$scope.searchStringError = true;
			$scope.searchStringErrorMessage = true;
		} else {
			var getProduct = {},operationName = 'searchProducts',serviceName = 'dashboardServices';
			getProduct.searchString = searchTerm;
			if (angular.isUndefined(match)) {
				getProduct.exactMatch = false;
			} else {
				getProduct.exactMatch = match;
			}
			$injector.get(serviceName)[operationName](getProduct).then(
				function (result) {
				$scope.responseError = false;
				$scope.noRecordFound = false;
				if(result.data.errorData){
					$scope.productData = [];
					$scope.responseError = true;
					$scope.responseErrorMessage = result.data;
				}else{
					$scope.mustSelectError = false;
					if(result.data.successData.lookupList){
						$scope.productData = result.data.successData.lookupList;
					}else{
						$scope.productData = [];
						$scope.noRecordFound = true;
					}
				}
			});
		}
	};
	$scope.saveVendorRiskProfile= function(params) {
		if(params.riskQuestion1 === ''){delete params.question1;}
		if(params.riskQuestion2 === ''){delete params.question2;}
		if(params.riskQuestion3 === ''){delete params.question3;}
		if(params.riskQuestion4 === ''){delete params.question4;}
		if(params.riskQuestion5 === ''){delete params.question5;}
		delete params.riskQuestion1;delete params.riskQuestion2;delete params.riskQuestion3;delete params.riskQuestion4;delete params.riskQuestion5;
		delete params.riskQ1SignedBy;delete params.riskQ2SignedBy;delete params.riskQ3SignedBy;delete params.riskQ4SignedBy;delete params.riskQ5SignedBy;
		delete params.vrpqsAnswered;
		delete params.companyDetails;
		return params;		
	};
	$scope.getAllCheckedLocation = function(checkedObj, checkedValue, checkedFrom){
		var i;
		if(checkedValue === true ){
			angular.forEach(checkedObj, function(value, key) {
				value.checked=true;
				if(value.childLocationList){
					for(i=0; i<value.childLocationList.length; i++){
						value.childLocationList[i].checked=true;
					}
				}
			});
		} else if(checkedValue === false){
			angular.forEach(checkedObj, function(value, key) {
				value.checked=false;
				if(value.childLocationList){
					for(i=0; i<value.childLocationList.length; i++){
						value.childLocationList[i].checked=false;
					}
				}
			});
		}
	};
	$scope.getSelectedCheckedLocation = function(checkedObj, checkedValue){
		if(checkedValue === true ){
			angular.forEach(checkedObj, function(value, key) {
				value.checked=true;
			});
		} else if(checkedValue === false){
			angular.forEach(checkedObj, function(value, key) {
				value.checked=false;
			});
		}
	};
	$scope.getAllCheckedDept = function(checkedObj, checkedValue){
		if(checkedValue === true ){
			angular.forEach(checkedObj, function(value, key) {
				value.checked=true;
			});
		} else if(checkedValue === false){
			angular.forEach(checkedObj, function(value, key) {
				value.checked=false;
			});
		}
	};
	
	/**CREDMGR-1428 Displaying static "Conflict of Interest" information In Reg UI Flow.**/
	/** Get Conflict of interest Call Function **/
	/*$scope.getConflictOfInterest=function(){
		$scope.serviceResponseError='';
		var normalServices = $injector.get('dashboardServices');
		normalServices.getCustomerConflictQuestions().then(function(result){
			if(result.data && result.data.status==='success'){
				var conflictQuestions=result.data.successData.customerConflictQuestions;						
				if(angular.isDefined(conflictQuestions)){														
					if(angular.isDefined(conflictQuestions.conflictCustomerCheckName) && conflictQuestions.conflictCustomerCheckName!==''){
						$scope.relationShipQuestion=true;
					}else{
						$scope.relationShipQuestion=false;								
					}
					if(angular.isDefined(conflictQuestions.conCustomerNheckNameServe) && conflictQuestions.conCustomerNheckNameServe!==''){
						$scope.affiliationsQuestion=true;
					}else{
						$scope.affiliationsQuestion=false;								
					}
					if(angular.isDefined(conflictQuestions.conCustomerCheckNameComps) && conflictQuestions.conCustomerCheckNameComps!==''){
						$scope.compensationQuestion=true;
					}else{
						$scope.compensationQuestion=false;								
					}
				}	
			}
			else if (result.data && result.data.status === 'error') {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
			}
		});
	};*/
	
	$scope.showConflictOfInterest = function (conflictFlag, divId) {
		if (conflictFlag === 'true') {			
			$scope[divId] = true;
		} else {
			$scope[divId] = false;
		}
	};
	$scope.couponCodeFormSubmit = false;
	$scope.applyCouponCode = function(couponCode,isFrom){
		$scope.checkSupplierIsBlocked(false,couponCode,isFrom);
	}
	$scope.setApplyCouponCode = function(couponCode,isFrom){
		if($scope.couponCodeFormSubmit === true){
			return;
		}
		$scope.couponCodeFormSubmit = true;
		var eventObject = {
				"category"	: "NORMAL",
				"action"	: "NORMAL_PAYMENT",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#paymentTechEnable:"+$rootScope.paymentTechEnable+"#userAction:applyCouponCode"+"#couponCode:",
				"value"		: 1
		};
		$scope.serviceResponseError='';
		if(angular.isUndefined(couponCode) || couponCode===''){
			eventObject.value = 0;
			eventObject.label += "NULL#errorMessage:couponRequired";
			$rootScope.$emit("callAnalyticsController", eventObject);
			$scope.couponError=true;
		}else{
		eventObject.label += couponCode;
		var VRPCouponEvent = angular.copy(eventObject);
		$scope.couponError=false;
		if(angular.isUndefined(appCon.data.paymentCouponDetails)){
    		appCon.data.paymentCouponDetails={};
    	}
		appCon.data.paymentCouponDetails.couponCode=couponCode;
		var normalServices = $injector.get('dashboardServices');
		disableFormById("normalPaymentDetailsForm");
		normalServices.saveVendorRiskProfileApplyCoupon().then(
				function (result) {
				VRPCouponEvent.label += "#isFrom:saveVRPApplyCoupon";
				if (result.data && result.data.errorData) {
					enableFormById("normalPaymentDetailsForm");
					$scope.couponCodeFormSubmit = false;
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
						VRPCouponEvent.value = 0;
						VRPCouponEvent.label += "#errorMessage:"+$scope.serviceResponseError;
						$rootScope.$emit("callAnalyticsController", VRPCouponEvent);
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok'){	
						enableFormById("normalPaymentDetailsForm");
						$scope.couponCodeFormSubmit = false;
						/**
						 * Redirect payment page if payment required is true otherwise it redirects to next page on both normal & express flow.
						 * EGXPCM-896 - System should skip the payment page for 0 dollar payment.
						 */
						var paymentRequired = result.data.successData.paymentRequired;
						VRPCouponEvent.label += "#paymentRequired:"+paymentRequired;
						if(paymentRequired === true) {
							$rootScope.paymentPrice=result.data.successData.paymentPrice;
							VRPCouponEvent.label += "#paymentPrice:"+$rootScope.paymentPrice;
							if(isFrom==='normal'){
								//$state.go('accounts.accountDetails.normal.paymentDetails');
								VRPCouponEvent.label += "#PaymentGoTo:normal";
								$rootScope.$emit("callAnalyticsController", VRPCouponEvent);
								$state.go(paymentDetailsPage);
							}
						} else {
							$rootScope.$emit("callAnalyticsController", VRPCouponEvent);
							appCon.data.auditDetail.phaseCompleted = 'true';
							auditService.saveAudit('dashboardServices');
							// CREDMGR-32515 - Added flowEndState method to decide express flow
							$scope.flowEndState('saveVRPApplyCoupon', VRPCouponEvent);
						}
					}else{
						VRPCouponEvent.value = 0;
						VRPCouponEvent.label += "#errorMessage:"+result.data.errorData.ResponseError[0].longMessage;
						$rootScope.$emit("callAnalyticsController", VRPCouponEvent);
					}
				}
			});
		}
	};
	/* Company Relationship Save Function */
	$scope.saveCompanyRelationShip=function(data){
		var companyRelationShipData=$scope.saveVendorRiskProfile(data);
		$scope.serviceResponseError='';
		var removeKeys=["exactMatch","spend","encryptedTaxId","expressVc","oid","legalName","searchString","allowPotentialVendors"];
		angular.forEach(removeKeys,function(value,key){
			if(angular.isDefined(companyRelationShipData[value])){
				delete companyRelationShipData[value];
			}
		});	
		var eventObject = {
				"category"	: "NORMAL",
				"action"	: "NORMAL_COMPANY_RELATIONSHIP",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.auditDetail.vcRelationOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#tierCode:"+companyRelationShipData.tierCode+"#paymentTechEnable:"+$rootScope.paymentTechEnable,
				"value"		: 1
		};
		var normalServices = $injector.get('dashboardServices');
		disableFormById("normalCompanyRelationshipForm");
		normalServices.saveVendorRiskProfile(companyRelationShipData).then(function(result){
			enableFormById("normalCompanyRelationshipForm");
			if(result.data && result.data.status==='success'){	
				if(result.data.successData){
					//$state.go("accounts.accountDetails.normal.userRelationship");
					eventObject.label += "#goTo:"+userRelationshipPage;
					$rootScope.$emit("callAnalyticsController", eventObject);
					$state.go(userRelationshipPage);
				}
				auditService.saveAudit('dashboardServices');
			} else if (result.data && result.data.status === 'error') {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				eventObject.value = 0;
				eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
				$rootScope.$emit("callAnalyticsController", eventObject);
			}
		});
	};
	$scope.unspscDocView = function () {
		var url = baseUrl+'/docs/UNSPSCSearchHelp.pdf';
		var viewDocWin=window.open(url,'View','height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes');
		viewDocWin.focus();
	};
	
	$scope.setAuditCode = function (auditCode, registrationType) {
		if (appCon.data.auditDetail === null || angular.isUndefined(appCon.data.auditDetail)) {
			appCon.data.auditDetail = [];
		}
		appCon.data.auditDetail.auditCode =  auditCode;
		appCon.data.auditDetail.registrationType = registrationType;
	};
	
	/* Copy the customerAddress form "getCustomerAddressAndLocations" operation inital call */
	var customerAddressObject;
	$scope.populateCustomerAddress = function(value){
		if(angular.lowercase(value.status) === 'success'){
			if(value.successData.CustomerAddress){
				customerAddressObject = angular.copy(value.successData.CustomerAddress);
			}else{
				value.successData.CustomerAddress = angular.copy(customerAddressObject);
			}
		}
		return value;
	};
	
	$scope.saveAudit = function (serviceName, token) {				
		auditService.saveAudit(serviceName, token);
	};
	
	
	/** Redirect RegUI Express Flow Function **/
	$scope.goToExpressFlow=function(){
		if ($rootScope.isIframeEnabled === 'true') {
			$rootScope.repProfileLoginUrlLoading = true;
		}
		if (authMode === 'sso'){
			window.location.href = baseUrl+'/endflowRedirect?userCredential='+$rootScope.userProfile.userCredential+'&custOid='+appCon.data.customerDetail.customerOid+'&isFrom=nvd'+'&landingPageCode=COCD';
		}else{
			var registrationUIConfigUrl=appCon.globalCon.registrationUI.url+'/#/goToOnboard?userCredential='+$rootScope.userProfile.userCredential+'&custOid='+appCon.data.customerDetail.customerOid+'&isFrom=nvd'+'&landingPageCode=COCD';
			$window.open(registrationUIConfigUrl);
		}
	};
	/** Function for onboarding JIT if express registered flag is enabled **/
	$scope.onboardingJIT=function(){
							var ser = 'dashboardServices';
							var op = 'saveVendor';
							$scope.obvendor= {};
							$scope.obvendor.customerOid=appCon.data.customerDetail.customerOid;
							$scope.obvendor.emailId=$rootScope.userProfile.userId;
							$injector.get(ser)[op]($scope.obvendor).then(function(result){
								if(result.data.status === 'success'){
									var resultData = result.data.successData;
									if((resultData.VENDOR_MANAGER_ENABLED === true && resultData.VENDOR_ONBOARDING_MANAGER_ENABLED === true) || 
											resultData.contractDocumentRequest === true || resultData.baDocumentRequest === true) {
										var modalInstance = $modal.open({
											templateUrl : 'views/registration/normal/nvdExpressFlowPopup.html?rnd='+appCon.globalCon.deployDate,
											backdrop: 'static',
											keyboard: false,
											scope : $scope
										});
									} else {
										$rootScope.repProfileLoginUrlLoading=true;
									}
									auditService.saveAudit('dashboardServices');
								}
							});
	};
	$scope.dbaNameReadOnly = false;
	// DBA Field Readonly if value is not empty
	$scope.checkDbaNameExist = function (dbaValue) {
		if (angular.isDefined(dbaValue) && dbaValue !== '' ) {
			$scope.dbaNameReadOnly = true;
		} else {
			$scope.dbaNameReadOnly = false;
		}
	}; 
	// Corporate Purchase Plan Window Functionality
	$scope.supportWindowURL = function(){
		$window.open($rootScope.ghxPurchasePlan.url);
	}
	var enableFormById= function(formElementId){
		var formElement = document.getElementById(formElementId);
		if(angular.isDefined(formElement) && formElement != null){
			enableAll(formElement);
		}
	};
	var disableFormById= function(formElementId){
		var formElement = document.getElementById(formElementId);
		if(angular.isDefined(formElement) && formElement != null){
			disableAll(formElement);
		}
	};
	
	$scope.submitBillingAddressAndVcRelation = function (requestParam, isFrom, formId) {
		$rootScope.billingAddressDetails = '';
		$rootScope.billingAddressDetails = requestParam;
		$rootScope.regType = isFrom;
		var eventObject = {
				"category" : "NORMAL",
				"action" : "NORMAL_BILLING_INFO",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.repDetails.vcOid+"#actorOid:"+appCon.data.repDetails.repOid+"#regType:"+$rootScope.regType+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable,
				"value"		: 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.checkSupplierIsBlocked(formId);
		//$scope.showCardReadyPopup($rootScope.paymentPrice, formId);
		//$scope.getPaymentFrameURL($rootScope.paymentPrice);
	};

	$scope.showCardReadyPopup = function (paymentPrice, formId) {
		var modalInstance = $modal.open({
			templateUrl: 'views/registration/normal/paymentCardReadyPopup.html?rnd='+appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance) {
				console.log("enableAll", formId)
				$scope.goCardInformationPage = function () {
					$modalInstance.close();
					//$controller('registrationController',{$scope:$scope});
					$scope.getPaymentFrameURL(paymentPrice, formId);
				};
				$scope.cancelPaymentCardReadyPopup = function(){
					$modalInstance.close();
					var disableRegisterForm = document.getElementById(formId);
					enableAll(disableRegisterForm);
				};
			}
		});
	};
	
	$scope.getPaymentFrameURL = function(paymentPrice, formId){
		appCon.data.billingDetails = {};
		var vcOid, repOid;
		$scope.billingAddress = angular.copy($rootScope.billingAddressDetails);
		appCon.data.billingDetails = $scope.billingAddress.CardProfile;
		appCon.data.billingDetails.callbackUrl = appCon.globalCon.pci.callback_url;
		appCon.data.billingDetails.cssUrl = appCon.globalCon.pci.css_url;
		appCon.data.billingDetails.amount = paymentPrice;
		vcOid = appCon.data.repDetails.vcOid;
		repOid = appCon.data.repDetails.repOid;	
		appCon.data.billingDetails.paymentTechFrameURL = appCon.globalCon.pci.paymentTechFrameURL;
		appCon.data.billingDetails.customerCareURL = appCon.globalCon.pci.customerCareURL;
		var eventObject = {
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.auditDetail.vcRelationOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable+"#regType:Normal#Source:VDB",
				"value"		: 1
		};
		eventObject.category = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP" : "NORMAL";
		eventObject.action = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP_GET_PAYMENT_UID" : "NORMAL_GET_PAYMENT_UID";
		var getUIDObject = {};
		getUIDObject.urlParams = {'amount': appCon.data.billingDetails.amount,'customer_address' :appCon.data.billingDetails.billingAddress1, 'customer_address2' : appCon.data.billingDetails.billingAddress2, 'customer_email' : appCon.data.billingDetails.billingEmail, 'customer_city' : appCon.data.billingDetails.billingCity, 'customer_state' : appCon.data.billingDetails.billingStateCode, 'customer_postal_code' : appCon.data.billingDetails.billingZip, 'customer_country' : appCon.data.billingDetails.billingCountryCode, 'callback_url' : appCon.data.billingDetails.callbackUrl, 'css_url' : appCon.data.billingDetails.cssUrl ,'hosted_tokenize' : 'store_authorize', 
								 'requestFor' :'PAYMENT', 'regType' :'normal', 'source' : 'VDB' ,'acceptAutoRenew' : true, 'acceptChangable' : true , 'acceptFee' : true ,'trueAndAccurate' : true ,'vcOid':vcOid, 'repOid' :repOid};
		$injector.get("dashboardServices")['getPaymentTechUID'](getUIDObject).then(function (result) {
			if(result && result.data && result.data.successData && result.data.successData.Status == "Ok"){
				//eventObject += '#uID:'+result.data.successData.uIDKey;
				$rootScope.paymentCallUID = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL+result.data.successData.uIDKey);
				var UIDKey =  result.data.successData.uIDKey;
				appCon.data.billingDetails.uID = UIDKey.split('uID=')[1];
				eventObject.label += "#goTo:normalCheckout"+'#uID:'+result.data.successData.uIDKey;
				$rootScope.$emit("callAnalyticsController", eventObject);
		        //$state.go('accounts.accountDetails.normal.paymentCardDetails');
				if($rootScope.isFromManageReps){
					$state.go('manage.repAccountDetails.repAccountsTab.normal.paymentCardDetails');					
				}else{
					$state.go('accounts.accountDetails.normal.paymentCardDetails');					
				}
			}
			else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ErrorMsg;
				eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
				eventObject.value = 0;
				$rootScope.$emit("callAnalyticsController", eventObject);
				var disableRegisterForm = document.getElementById(formId);
				enableAll(disableRegisterForm);
			}			
		});
	};
	$scope.updatePaymentAndVC = function (paymentFrom, mKey, responseCode, uID) {
		$scope.serviceResponseError = '';
		var params = {};
		var serviceName = 'dashboardServices';
		var operationName = 'updatePaymentAndVCRelation';
		params = {'paymentFrom':paymentFrom,'paymentDetailId':mKey};
		var eventObject = {
				"category"	: "NORMAL",
				"action"	: "NORMAL_CHECKOUT",
				"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+$rootScope.userProfile.detail.vcRelationOid+"#actorOid:"+$rootScope.userProfile.detail.actorOid+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable+"#regType:Normal#Source:VDB#responseCode:"+responseCode+"#uID:"+uID,
				"value"		: 1
		};
		$injector.get(serviceName)[operationName](params).then(
				function (result) {
				if (result.data && result.data.errorData) {
					if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
						$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;  
						eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
						eventObject.value = 0;
						$rootScope.$emit("callAnalyticsController", eventObject);
						console.log("Update Payment and VC Error");
						$scope.enablePCILoading = false;
					}
				} else if (result.data && result.data.successData) {
					if (result.data.successData.Status === 'Ok'){
						$scope.enablePCILoading = false;
						console.log("Update Payment and VC Done");
						appCon.data.auditDetail.phaseCompleted = 'true';
						$scope.flowEndState("takePayment",eventObject);
					}
					auditService.saveAudit(serviceName);
				}
			});
	};
	
	
	$scope.updatePaymentDetails = function(responseCode,message,uID){
		var params = {}, succMongoId, isErrorOnPayment = false, eventObject = {}, updatePaymentAndVCRelationParams= {};
		params.paymentDetailsVO = {};
		params.paymentDetailsVO = {'responseCode':responseCode,'message':message,'uID':uID};
		if(angular.isDefined(responseCode) && responseCode != '000'){
			isErrorOnPayment = true;
		}
		$injector.get("dashboardServices")['updatePaymentDetails'](params).then(function (result) {
			console.log(result);
			if (result.data && result.data.successData && result.data.status === 'success') {
				succMongoId = result.data.successData.paymentDetailsVO.id;
				console.log(succMongoId);
				console.log(isErrorOnPayment);
				console.log($rootScope);
				console.log(appCon.globalCon);
				console.log($rootScope.isFrom);
				if(isErrorOnPayment) {
					$scope.serviceResponseError = message;
					var getUIDObject = {};
					getUIDObject.urlParams = {'amount': appCon.data.billingDetails.amount,'customer_address' :appCon.data.billingDetails.billingAddress1, 'customer_address2' : appCon.data.billingDetails.billingAddress2, 'customer_email' : appCon.data.billingDetails.billingEmail, 'customer_city' : appCon.data.billingDetails.billingCity, 'customer_state' : appCon.data.billingDetails.billingStateCode, 'customer_postal_code' : appCon.data.billingDetails.billingZip, 'customer_country' : appCon.data.billingDetails.billingCountryCode, 'callback_url' : appCon.data.billingDetails.callbackUrl, 'css_url' : appCon.data.billingDetails.cssUrl ,'hosted_tokenize' : 'store_authorize',
							'requestFor' :'PAYMENT', 'regType' :$rootScope.regType, 'source' : 'VDB' ,'acceptAutoRenew' : true, 'acceptChangable' : true , 'acceptFee' : true ,'trueAndAccurate' : true ,'vcOid':appCon.data.repDetails.vcOid, 'repOid' :appCon.data.repDetails.repOid};
					eventObject = {
							"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.auditDetail.vcRelationOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable+"#regType:Normal#Source:VDB#responseCode:"+responseCode+"#uID:"+uID+"#errorMessage:"+message,
							"value"		: 1
						};
					eventObject.category = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP_UPDATE_MONGO" : "NORMAL_UPDATE_MONGO";
					eventObject.action = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP_UPDATE_MONGO_STATUS" : "NORMAL_UPDATE_MONGO_STATUS";
					updatePaymentAndVCRelationParams = {'paymentFrom':'VDB','paymentDetailId':succMongoId};
					$injector.get("dashboardServices")['updatePaymentAndVCRelation'](updatePaymentAndVCRelationParams).then(function (result) {
						console.log(result.data);
						if (result.data && result.data.errorData) {
							if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
								$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
								eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
								eventObject.value = 0;
								$rootScope.$emit("callAnalyticsController", eventObject);
							}
						} else if (result.data && result.data.successData) {
							if (result.data.successData.Status === 'Ok'){
								eventObject.label += "#successMessage:"+result.data.successDatar;
							}
						}
						$rootScope.$emit("callAnalyticsController", eventObject);
						$injector.get("dashboardServices")['getPaymentTechUID'](getUIDObject).then(function (result) {
							console.log(result);
							eventObject = {};
							eventObject = {
									"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.auditDetail.vcRelationOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable+"#regType:Normal#Source:VDB#paymentFailed:yes",
									"value"		: 1
							};
							eventObject.category = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP" : "NORMAL";
							eventObject.action = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP_GET_PAYMENT_UID" : "NORMAL_GET_PAYMENT_UID";
							if(result.data && result.data.successData && result.data.successData.Status == "Ok"){
								$rootScope.paymentCallUID = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL+result.data.successData.uIDKey);						
								var UIDKey =  result.data.successData.uIDKey;
								appCon.data.billingDetails.uID = UIDKey.split('uID=')[1];
						        console.log($rootScope.paymentCallUID);
						        $scope.enablePCILoading = false;
						        eventObject.label += "#newPyamentTechUID:Yes"+'#uID:'+result.data.successData.uIDKey;
								$rootScope.$emit("callAnalyticsController", eventObject);
							} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
								$scope.serviceResponseError = result.data.errorData.ErrorMsg;
								$scope.enablePCILoading = false;
								eventObject.label += "#errorMessage:"+$scope.serviceResponseError;
								eventObject.value = 0;
								$rootScope.$emit("callAnalyticsController", eventObject);
							}
						});
					});
					
				} else {
					$scope.updatePaymentAndVC('VDB', succMongoId, responseCode, uID);
				}
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
				$scope.enablePCILoading = false;
				eventObject = {
						"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.repDetails.vcOid+"#actorOid:"+appCon.data.auditDetail.actorOid+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable+"#regType:Normal#Source:VDB#responseCode:"+responseCode+"#uID:"+uID+"#errorMessage:"+message+"#serviceErrorMessage:"+$scope.serviceResponseError,
						"value"		: 0
					};
				eventObject.category = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP_UPDATE_MONGO" : "NORMAL_UPDATE_MONGO";
				eventObject.action = ($rootScope.isFromManageReps === true) ? "NORMAL_MANAGE_REP_UPDATE_MONGO_STATUS" : "NORMAL_UPDATE_MONGO_STATUS";
				$rootScope.$emit("callAnalyticsController", eventObject);
			}
		});
	};
	
	$scope.startCREPaymentLoading = function(){
		var eventObject = {
			"category"	: "NORMAL",
			"action"		: "VDB_PCI_PAYMENT_PROCESS_START_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"UID:"+appCon.data.billingDetails.uID+"#localDate:"+new Date(),
			"value"		: 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.enablePCILoading = true;
	}
	
	$scope.completeCREPaymentAndUpdate = function(responseObject){
		$scope.enablePCILoading = false;
		var eventObject = {
			"category"	: "NORMAL",
			"action"		: "VDB_PCI_PAYMENT_PROCESS_END_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid,
			"value"		: 1
		};
		angular.forEach(responseObject , function(value,key){
			eventObject.label += "#"+key+":"+value;
		});
		eventObject.label += "#localDate:"+new Date();
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.updatePaymentDetails(responseObject.code,responseObject.message,responseObject.uID);
	};
	
	$scope.creHandleDetailErrorsAndUpdate = function(errorCode, gatewayCode, gatewayMessage){
		var eventObject = {
			"category"	: "NORMAL",
			"action"		: "VDB_PCI_PAYMENT_ERROR_CALLBACK_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"errorCode:"+ errorCode+"#UID:"+appCon.data.billingDetails.uID+"#gatewayCode:"+ gatewayCode +"#gatewayMessage:" + gatewayMessage+"#localDate:"+new Date(),
			"value"		: 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		console.log("creHandleDetailErrorsAndUpdate", errorCode, gatewayCode, gatewayMessage);
		var isPaymentErrorCodeArray = ['01','05','43','60','61','62','63','L2','360'];
		var isCardErrorCodeArray = ['74','200','310','315','320','330','340','350','355','357','370','500','510','520','530','531','550','H9','500',''];
		var isBankErrorCodeArray = ['03','12','B5','79','77','R4','600','610','620','630','640','100','110','300','400'];
		var errorMessage;
		if (angular.isDefined(gatewayCode)){
			var gatewayCode = gatewayCode;
			var gatewayMessage = gatewayMessage;
		}
		var errorCodeSplit = errorCode.split('|');
		for (var i=0;i<errorCodeSplit.length;i++) {
			if(isCardErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Please check the credit card information entered and try again.';
			} else if(isPaymentErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Your payment method was not accepted. Please try another card or contact your financial institution.';
			} else if(isBankErrorCodeArray.indexOf(errorCodeSplit[i]) != '-1') {
				errorMessage = 'Please contact the <a target="_blank" href="'+appCon.data.billingDetails.customerCareURL+'">Customer Care</a> and provide error code '+responseCode+'.';
			} else {
				errorMessage = 'Please contact the <a target="_blank" href="'+appCon.data.billingDetails.customerCareURL+'">Customer Care</a> and provide error code '+responseCode+'.';
			}
		}
		$scope.updatePaymentDetails(errorCode,errorMessage,appCon.data.billingDetails.uID);
	};
	
	$scope.creHandleErrorsAndUpdate = function(errorCode){
		var eventObject = {
			"category"	: "NORMAL",
			"action"		: "VDB_PCI_PAYMENT_ERROR_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"errorCode:"+ errorCode+"#UID:"+appCon.data.billingDetails.uID+"#localDate:"+new Date(),
			"value"		: 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		console.log("creHandleErrorsAndUpdate");
	};

	$scope.checkSupplierIsBlocked = function (formId,couponCode,isFrom){
		$scope.serviceResponseError = '';
		$injector.get('dashboardServices').getUserByUserName().then(function(result){
			if(result.data && result.data.status === 'success'){
				var userDetailsResponse = result.data.successData.detail;
				if(userDetailsResponse.isSupplierBlocked === true) {
					$scope.serviceResponseError = userDetailsResponse.blockedMessage;
					var eventObject = {
						"category"  : "NORMAL",
						"action"    : "SUPPLIER_BLOCKED",
						"label"		: "email:"+$rootScope.userProfile.userId+"#fein:"+$rootScope.userProfile.detail.fein+"#customerOid:"+appCon.data.customerDetail.customerOid+"#userOid:"+$rootScope.userProfile.id+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#VCRelationId:"+appCon.data.repDetails.vcOid+"#actorOid:"+appCon.data.repDetails.repOid+"#regType:"+$rootScope.regType+"#paymentPrice:"+$rootScope.paymentPrice+"#paymentTechEnable:"+$rootScope.paymentTechEnable,
						"value"		: 1
					};
					$rootScope.$emit("callAnalyticsController", eventObject);
				} else {
					$scope.serviceResponseError = '';
					if(formId === false){
						$scope.setApplyCouponCode(couponCode,isFrom);
					} else {
						var disableRegisterForm = document.getElementById(formId);
						disableAll(disableRegisterForm);
						$scope.showCardReadyPopup($rootScope.paymentPrice, formId);
					}
				}
			} else {
				$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
			}
		});
	};

}]);

var completeHostedPayment,
	startHostedPayment,
	hostedHandleDetailErrors,
	hostedHandleErrors;

completeHostedPayment = function (responseObject) {
	var eventObject = {
			'category': 'NORMAL',
			'action': 'VDB_PCI_PAYMENT_PROCESS_END',
			'label': '',
			'value': 1
		},
		scopeEvent = angular.element($('#registrationContainer')).scope();
	angular.forEach(responseObject, function (value, key) {
		eventObject.label += '#' + key + ':' + value;
	});
	eventObject.label += '#localDate:' + new Date();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.completeCREPaymentAndUpdate(responseObject);
};

startHostedPayment = function () {
	var eventObject = {
			'category': 'NORMAL',
			'action': 'VDB_PCI_PAYMENT_PROCESS_START',
			'label': 'UID:' + appCon.data.billingDetails.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#registrationContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.startCREPaymentLoading();
};

hostedHandleDetailErrors = function (errorCode, gatewayCode, gatewayMessage) {
	var eventObject = {
			'category': 'NORMAL',
			'action': 'VDB_PCI_PAYMENT_ERROR_CALLBACK',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.billingDetails.uID + '#gatewayCode:' + gatewayCode + '#gatewayMessage:' + gatewayMessage + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#registrationContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleDetailErrorsAndUpdate(errorCode, gatewayCode, gatewayMessage);
};

hostedHandleErrors = function (errorCode) {
	var eventObject = {
			'category': 'NORMAL',
			'action': 'VDB_PCI_PAYMENT_ERROR',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.billingDetails.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#registrationContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleErrorsAndUpdate(errorCode);
}