'use strict';
angular.module(appCon.appName).controller('addNewRepController', ['$scope', '$window', '$state', '$modal', '$rootScope', '$injector','ngTableParams','Analytics','$sce', function($scope, $window, $state, $modal, $rootScope, $injector, ngTableParams,Analytics, $sce) {
	var checkOpenParam = '',
		eligibilityDetails = '';

	var addNewRepServices = $injector.get("addNewRepServices");
	$scope.oneToManyAddToList = [];
	$scope.enableValidateButton = true;
	$scope.validateAddNewRep = function(value) {
		appCon.data.userSelectedList = [];
		$scope.enableValidateButton = false;
		appCon.data.globalProfileForRegistration = [];
		var addNewRepInviteForm = document.getElementById('addNewRepInviteForm');
		disableAll(addNewRepInviteForm);
		
		$scope.oneToManyAddToList["firstName"] = value.firstname;
		$scope.oneToManyAddToList["lastName"] = value.lastname;
		$scope.oneToManyAddToList["userId"] = angular.lowercase(value.email);
		$scope.oneToManyAddToList["workPhone"] = value.workPhone;
		$scope.oneToManyAddToList['vendorOid'] = $scope.userProfile.detail.vendorOid;
		//isNewRep - used to Calculate newly added user count for OA payment.
		$scope.oneToManyAddToList['isNewRep'] = false;
		$scope.oneToManyAddToList['customerOidsString'] = "vendormate";
		$scope.oneToManyAddToList['checked'] = true;
		$scope.addNewRepInValid = false;
		
		var param = {"vendorOid":$scope.userProfile.detail.vendorOid,"userId":value.email};
		addNewRepServices.validateVendorRep(param).then(function(result){
			appCon.data.globalProfileForRegistration = [];
			if(result.data && result.data.status==='success'){
				var checkVendor = result.data.successData;
				if(checkVendor.errorMessage && checkVendor.errorMessage == 'DELETED_USER_ERROR_5183'){
					$scope.addNewRepInValid = {"deletedUser":true};
					$scope.enableValidateButton = true;
				}else if(checkVendor.isExist=='false' || checkVendor.isInActiveUser=='true' || (checkVendor.isExist=='true'&& checkVendor.isAssoWithVendor=='true') ){
					if(checkVendor.isExist=='false'){
						$scope.getGlobalProfileForRegistration(angular.lowercase(value.email));
					}else if(checkVendor.isInActiveUser=='true'){
						$scope.addNewRepInValid = {"isInActiveUser":true};
						enableAll(addNewRepInviteForm);
						$scope.enableValidateButton = true;
					} else {
						$scope.oneToManyAddToList["invitationStatus"] = "error";
						$scope.oneToManyAddToList["errorFromArray"] = false;
						$scope.openInvitationStatusPopup($scope.oneToManyAddToList);
						enableAll(addNewRepInviteForm);
						$scope.enableValidateButton = true;
					}
				}else if(checkVendor.isExist=='true' && checkVendor.isAssoWithVendor=='false'){
					if(checkVendor.actorType=='VREP' && checkVendor.vendorName){
						//User is already registered with another vendor company.
						$scope.addNewRepInValid = {"anotherVendorCompany":true,"vendorName":checkVendor.vendorName};
					}else {
						//User is already registered with another role. not a rep
						$scope.addNewRepInValid = {"notRep":true,"description":checkVendor.actorDescription};
					}
					enableAll(addNewRepInviteForm);
					$scope.enableValidateButton = true;
				}
			}else{
				$scope.enableValidateButton = true;
				enableAll(addNewRepInviteForm);
				$scope.addNewRepInValid = {"error":true,"data":result.data};
			}
		});
	};

	$scope.getGlobalProfileForRegistration = function(newRepEmail){
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"		: "INVITE_ADDREP",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#inviteRepEmail:"+newRepEmail,
			"value"		: 1
		};
		var param = {"fein":$rootScope.userProfile.detail.fein};
		addNewRepServices.getGlobalProfileForRegistration(param).then(function(result){
			var addNewRepInviteForm = document.getElementById('addNewRepInviteForm');
			enableAll(addNewRepInviteForm);
			if(result.data && result.data.status==='success'){
				var isOpenAccessSmall = angular.isDefined(result.data.successData.grpPlan) && result.data.successData.grpPlan.toLowerCase() == 'openaccessplan' ? true: false;
				$scope.isOpenAccess = isOpenAccessSmall;
				if(result.data.successData.allowRepRegistration && isOpenAccessSmall){
					appCon.data.globalProfileForRegistration.registeredVrepCount = result.data.successData.registeredVrepCount;
					appCon.data.globalProfileForRegistration.maxRepCount = result.data.successData.maxRepCount;
					var updatedVrepCount = ($scope.getNewlyAddedRep()).length,
						buyUpRepCount = $scope.getBuyUpRepCount();
					updatedVrepCount = (buyUpRepCount >= updatedVrepCount ) ? 0 : (buyUpRepCount > 0) ? (updatedVrepCount - buyUpRepCount) : updatedVrepCount;
					// Check the maxRepCount exceed
					if((updatedVrepCount + result.data.successData.maxRepCount) > parseInt(appCon.globalCon.openAccessPlan.maxRepCount)){
						var errorMessage = "You have exceeded the maximum number of representatives under this corporate plan. Please contact support for assistance.";
						eventObject.value = 0;
						eventObject.label += "#errorMessage:"+errorMessage;
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						$scope.enableValidateButton = true;
						//User is not allowed for RepRegistration.
						$scope.addNewRepInValid = {"notAllowRepRegistration":true,"errorMessage": errorMessage};
					}else{
						//isNewRep - used to Calculate newly added user count for OA payment.
						$scope.oneToManyAddToList['isNewRep'] = true;
						appCon.data.userSelectedList.push($scope.oneToManyAddToList);
						$scope.checkOpenAccessPayment(eventObject);
					}
				}else if(angular.isDefined(result.data.successData.errorMessage)){
					$scope.enableValidateButton = true;
					//User is not allowed for RepRegistration.
					eventObject.value = 0;
					eventObject.label += "#errorMessage:"+ result.data.successData.errorMessage;
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
					$scope.addNewRepInValid = {"notAllowRepRegistration":true,"errorMessage": result.data.successData.errorMessage};
				}else{
					appCon.data.userSelectedList.push($scope.oneToManyAddToList);
					$scope.checkOpenAccessPayment(eventObject);
				}
			}else{
				eventObject.value = 0;
				eventObject.label += "#errorMessage:"+ result.data.errorData.ResponseError[0].longMessage;
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				$scope.enableValidateButton = true;
				$scope.addNewRepInValid = {"error":true,"data":result.data};
			}
		});
	};
	
	$scope.checkOpenAccessPayment = function(eventObject){
		var newlyAddedRepUserId = $scope.getNewlyAddedRep();
		//Get the newly added user count
		var newlyAddedRepCount = (newlyAddedRepUserId).length,
			buyUpRepCount = $scope.getBuyUpRepCount();
			console.log(buyUpRepCount);
		newlyAddedRepCount = (buyUpRepCount >= newlyAddedRepCount ) ? 0 : (buyUpRepCount > 0 && newlyAddedRepCount > 0) ? (newlyAddedRepCount - buyUpRepCount) : newlyAddedRepCount;
		
		if(newlyAddedRepCount === 0){
			eventObject.label += "#goTo:sendInvite";
			$rootScope.$emit("callAnalyticsEventTrack", eventObject);
			$scope.sendInvitation();
		}else{
			$scope.checkItemCatalog(newlyAddedRepCount, eventObject);
		}
	}

	$scope.checkItemCatalog = function(repCount, gaEvent) {
		var addNewRepInviteForm = document.getElementById('addNewRepInviteForm');
		$rootScope.orderType = 'Incremental';
		disableAll(addNewRepInviteForm);
		$injector.get('users')['getAllItemCatalog']({
			'orderType': $rootScope.orderType,
			'fein': $rootScope.userProfile.detail.fein
		}).then(function(response) {
			if (response.data && response.data.status === 'success') {
				enableAll(addNewRepInviteForm);
				appCon.data.itemCatalogSummary = response.data.successData.ItemCatalogSummary;
			}
			$scope.showInviteRepOrderSummery(repCount, gaEvent);
		});
	}

	$scope.showInviteRepOrderSummery = function(newlyAddedRepCount, gaEvent) {
		$scope.enableValidateButton = true;
		var amountPerRep = ((appCon.data.itemCatalogSummary[appCon.data.itemElgibility.purchasedUserCount - 1].amount) / appCon.data.itemElgibility.purchasedUserCount);
		var pendingDays = getDaysOfPendingOrder($rootScope.serverTime.serverDateTime, appCon.data.itemElgibility.expirationDate);
		// calculate currentOrderAmount for incremental payment
		var orderAmount = parseFloat(((amountPerRep / 365) * pendingDays) * newlyAddedRepCount);

		$rootScope.addNewRepOrderAmount = truncateDecimal(orderAmount);
		$rootScope.repCountInSummaryDesc = newlyAddedRepCount;
		appCon.data.invitedNewRepCount = newlyAddedRepCount;
		gaEvent.label += '#orderAmount:' + $rootScope.addNewRepOrderAmount + '#goTo:billingSummery';
		$rootScope.$emit('callAnalyticsEventTrack', gaEvent);
		$state.go('addNewRep.cartSummary');
		// Go to start payment
	}

	/**
	 * Get the newly added user list
	 * return - newlyAddedRepArray - Array
	 */
	$scope.getNewlyAddedRep = function(){
		var newlyAddedRepArray = [];
		var invitedRepsList = appCon.data.userSelectedList;
		angular.forEach(invitedRepsList , function(value,key){
			if(invitedRepsList[key].isNewRep && invitedRepsList[key].checked === true){
				newlyAddedRepArray.push(invitedRepsList[key].userId);
			}
		});
		console.log(newlyAddedRepArray);
		return newlyAddedRepArray;
	}
	
	/**
	 * Get BuyUpRep count for Calculate incremental payment.
	 * return - buyUpCount - integer
	 */
	$scope.getBuyUpRepCount = function (){
		var buyUpCount = 0;
		console.log(buyUpCount);
		if(angular.isDefined(appCon.data.globalProfileForRegistration) && (appCon.data.globalProfileForRegistration.maxRepCount > appCon.data.globalProfileForRegistration.registeredVrepCount)){
			buyUpCount = (appCon.data.globalProfileForRegistration.maxRepCount - appCon.data.globalProfileForRegistration.registeredVrepCount);
		}
		console.log(buyUpCount);
		return parseInt(buyUpCount);
	}
	
	$scope.navAddNewRepBillingInfoScreen = function(orderType){
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"		: "CHECKOUT_ADDREP",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#orderAmount:"+$rootScope.addNewRepOrderAmount,
			"value"		: 1
		};
		$rootScope.$emit("callAnalyticsEventTrack", eventObject);
		var shoppingCartSummaryGrid = document.getElementById("shoppingCartSummaryGrid");
		disableAll(shoppingCartSummaryGrid);
		$state.go('addNewRep.billingInfo');
	}
	
	$scope.billingInfoResponseError = '';
	/* billing & payment code starts*/
	$scope.submitAddNewRepBillingAddress = function (requestParam, isFrom, formId) {
		$scope.billingInfoResponseError = '';
		$scope.loading = true;
		$injector.get('dashboardServices').getUserByUserName().then(function(result){
			$scope.loading = false;
			if(result.data && result.data.status === 'success'){
				var userDetailsResponse = result.data.successData.detail;
				if(userDetailsResponse.isSupplierBlocked === true) {
					$scope.billingInfoResponseError = userDetailsResponse.blockedMessage;
					var eventObject = {
						"category"	: "SHOPPING_CART",
						"action"	: "SUPPLIER_BLOCKED",
						"label"		: "email:"+ $rootScope.userProfile.userId+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid,
						"value"		: 1
					};
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				} else {
					$scope.loading = true;
					$rootScope.scbillingAddressDetails = '';
					$rootScope.scbillingAddressDetails = requestParam;
					$rootScope.scPaymentPrice = $rootScope.addNewRepOrderAmount;
					var eventObject = {
						"category"	: "ADD_NEW_REP",
						"action"		: "BILLING_INFO_ADDREP",
						"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#orderAmount:"+$rootScope.addNewRepOrderAmount,
						"value"		: 1
					};
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
					$scope.showAddNewRepReadyPopup($rootScope.scPaymentPrice, formId);
				}
			} else {
				$scope.billingInfoResponseError = result.data.errorData.ResponseError[0].longMessage;
			}
		});
	};
	
	$scope.showAddNewRepReadyPopup = function (paymentPrice, formId) {
		$scope.loading = false;
		var modalInstance = $modal.open({
			templateUrl: 'views/addNewRep/addNewRepPaymentPopup.html',
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function ($scope, $modalInstance) {
				console.log("enableAll", formId)
				$scope.goAddNewRepInformationPage = function () {
					$modalInstance.close();
					$scope.getAddNewRepPaymentFrameURL(paymentPrice);
				};
				$scope.cancelAddNewRepPaymentReadyPopup = function(){
					$modalInstance.close();
					var disableRegisterForm = document.getElementById(formId);
					enableAll(disableRegisterForm);
				};
			}
		});
	};
	
	$scope.getAddNewRepPaymentFrameURL = function(paymentPrice, formId){
		var addNewRepPaymentDetailsForm = document.getElementById('addNewRepPaymentDetailsForm');
		disableAll(addNewRepPaymentDetailsForm);
		$scope.loading = true;
		$scope.addNewRepServiceResponseError = '';
		appCon.data.addNewRepBillingDetails = {};
		$scope.billingAddress = angular.copy($rootScope.scbillingAddressDetails);
		appCon.data.addNewRepBillingDetails = $scope.billingAddress.shoppingCart;
		appCon.data.addNewRepBillingDetails.addNewRep_callback_url = appCon.globalCon.pci.addNewRep_callback_url;
		appCon.data.addNewRepBillingDetails.cssUrl = appCon.globalCon.pci.shoppingCart_css_url;
		appCon.data.addNewRepBillingDetails.amount = paymentPrice;
		appCon.data.addNewRepBillingDetails.paymentTechFrameURL = appCon.globalCon.pci.paymentTechFrameURL;
		appCon.data.addNewRepBillingDetails.customerCareURL = appCon.globalCon.pci.customerCareURL;
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"		: "GET_PAYMENT_UID_ADDREP",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#orderAmount:"+paymentPrice,
			"value"		: 1
		};
		var getUIDObject = {};
		getUIDObject.urlParams = {'amount': appCon.data.addNewRepBillingDetails.amount,'customer_address' :appCon.data.addNewRepBillingDetails.billingAddress1, 'customer_address2' : appCon.data.addNewRepBillingDetails.billingAddress2, 'customer_email' : appCon.data.addNewRepBillingDetails.billingEmail, 'customer_city' : appCon.data.addNewRepBillingDetails.billingCity, 'customer_state' : appCon.data.addNewRepBillingDetails.billingStateCode, 'customer_postal_code' : appCon.data.addNewRepBillingDetails.billingZip, 'customer_country' : appCon.data.addNewRepBillingDetails.billingCountryCode, 'callback_url' : appCon.data.addNewRepBillingDetails.addNewRep_callback_url, 'css_url' : appCon.data.addNewRepBillingDetails.cssUrl ,'hosted_tokenize' : 'store_only', 
								 'requestFor' :'PAYMENT', 'acceptFee' : true ,'acceptChangable' : true, 'acceptAutoRenew' : true, 'trueAndAccurate' : true, "order_id": appCon.globalCon.pci.shopping_cart_order_id, "order_desc" : appCon.globalCon.pci.shopping_cart_order_desc };
		getUIDObject.urlParams.source = 'INVITEREP';
		var details = {"newUsersCount":1, "fein":$rootScope.userProfile.detail.fein, "legalName":$rootScope.userProfile.detail.legalName, "isFrom":"AddNewRep"}
		eventObject.label += "#newUsersCount:1#legalName:"+$rootScope.userProfile.detail.legalName;
		getUIDObject.urlParams.details=details;
		angular.forEach(getUIDObject.urlParams, function(value, key) {
			if(!(key === 'details' || key === 'callback_url' || key === 'css_url')){
				eventObject.label += "#"+key+":"+value;
			}
		});
		addNewRepServices.getPaymentTechUID(getUIDObject).then(function (result) {
			if(result && result.data && result.data.successData && result.data.successData.Status == "Ok"){
				$rootScope.addNewRepScPaymentCallUID = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL+result.data.successData.uIDKey);
				var UIDKey =  result.data.successData.uIDKey;
				appCon.data.addNewRepBillingDetails.uID = UIDKey.split('uID=')[1];
				eventObject.label += '#uID:'+result.data.successData.uIDKey;
				$rootScope.$emit("callAnalyticsController", eventObject);
				enableAll(addNewRepPaymentDetailsForm);
				$scope.loading = false;
				$state.go('addNewRep.checkout');
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.addNewRepServiceResponseError = result.data.errorData.ErrorMsg;
				eventObject.value = 0;
				eventObject.label += "#errorMessage:"+ result.data.errorData.ErrorMsg;
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				enableAll(addNewRepPaymentDetailsForm);
				$scope.loading = false;
			}
		});
	};
	
	$scope.sendInvitation = function() {
		var params = {}, i, invitedRepsSelectedList;
		$rootScope.inviteRepErrorMsg = [];
		params["InviteReps"] = [];
		invitedRepsSelectedList = appCon.data.userSelectedList;
		if(invitedRepsSelectedList && invitedRepsSelectedList.length > 0){
			for(i = 0; i<invitedRepsSelectedList.length; i++){
				invitedRepsSelectedList[i].userId = angular.lowercase(invitedRepsSelectedList[i].userId);
				if(invitedRepsSelectedList[i].checked === true){
					params["InviteReps"][i] = {"firstName":invitedRepsSelectedList[i].firstName,"lastName":invitedRepsSelectedList[i].lastName,"userId":invitedRepsSelectedList[i].userId,"workPhone":invitedRepsSelectedList[i].workPhone,
							"customerOids":invitedRepsSelectedList[i].customerOidsString,"vendorOid":invitedRepsSelectedList[i].vendorOid}
				}
			}
			$scope.sendInviteLoading = true;
			var eventObject = {
				"category"	: "ADD_NEW_REP",
				"action"		: "SEND_INVITE_ADDREP",
				"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#orderAmount:"+$rootScope.addNewRepOrderAmount,
				"value"		: 1
			};
			angular.forEach(params["InviteReps"][0], function(value, key) {
				eventObject.label += "#"+key+":"+value;
			});
			addNewRepServices.inviteRepsProcess(params).then(function(result){
				$scope.enableValidateButton = true;
				if((result.data && result.data.status==='success') || (result.data && result.data.status==='error' && angular.isDefined(result.data.errorData.InviteRepsSummaryList))){
					$scope.sendInviteLoading = false;
					var inviteeSummaryList,findErrorUserIdIndex,j;
					if(result.data && result.data.status==='success'){
						inviteeSummaryList = result.data.successData.InviteRepsSummaryList;
					} else if(result.data && result.data.status==='error'){
						inviteeSummaryList = result.data.errorData.InviteRepsSummaryList;
					}
					if(inviteeSummaryList && inviteeSummaryList.length > 0 && invitedRepsSelectedList && invitedRepsSelectedList.length > 0){
						for(j=0;j< inviteeSummaryList.length;j++){
							findErrorUserIdIndex = _.findIndex(invitedRepsSelectedList, function(o) { return o.userId == inviteeSummaryList[j].userId;});
							if(findErrorUserIdIndex !== -1){
								if(angular.lowercase(inviteeSummaryList[j].status) === 'error' || angular.lowercase(inviteeSummaryList[j].status) === 'alert'){
									invitedRepsSelectedList[findErrorUserIdIndex].invitationStatus = angular.lowercase(inviteeSummaryList[j].status);
									eventObject.value = 0;
									if(angular.isDefined(inviteeSummaryList[j].invitationErrorList)){
										invitedRepsSelectedList[findErrorUserIdIndex].errorMessageList = inviteeSummaryList[j].invitationErrorList;
										invitedRepsSelectedList[findErrorUserIdIndex].errorFromArray = true;
										eventObject.label += "#errorMessage:"+inviteeSummaryList[j].invitationErrorList[0].errorMessage;
									}else{
										invitedRepsSelectedList[findErrorUserIdIndex].errorMessage = inviteeSummaryList[j].errorMessage;
										invitedRepsSelectedList[findErrorUserIdIndex].errorFromArray = false;
										eventObject.label += "#errorMessage:"+inviteeSummaryList[j].errorMessage;
									}
								}else if(angular.lowercase(result.data.status === 'error') && angular.lowercase(inviteeSummaryList[j].isBulkUserInvited) === false && angular.isDefined(inviteeSummaryList[j].userOid)){
									eventObject.value = 0;
									eventObject.label += "#invitationStatus:tpmAlert";
									invitedRepsSelectedList[findErrorUserIdIndex].invitationStatus = "tpmAlert";
									invitedRepsSelectedList[findErrorUserIdIndex].errorMessage = result.data.errorData.ResponseError[0].errorCode;
									invitedRepsSelectedList[findErrorUserIdIndex].errorFromArray = false;
								}else{
									eventObject.value = 1;
									eventObject.label += "#invitationStatus:success";
									invitedRepsSelectedList[findErrorUserIdIndex].invitationStatus = 'success';
									invitedRepsSelectedList[findErrorUserIdIndex].errorFromArray = false;
								}
							}
						}
					}
				}else{
					$scope.sendInviteLoading = false;
				}
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				appCon.data.userSelectedList = invitedRepsSelectedList;
				$scope.openInvitationStatusPopup(appCon.data.userSelectedList[0]);
			});
		}
	};
	
	$scope.openInvitationStatusPopup = function (object){
		$scope.errorPopupObject = object;
		$scope.enablePCILoading = false;
		$modal.open({
			templateUrl : 'views/addNewRep/invitationStatus.html?rnd='+appCon.globalCon.deployDate,
			windowClass:'commonDialogW30',
			keyboard: false,
			backdrop: 'static',
			scope : $scope,
			controller: function($scope,$modalInstance) {
				$scope.closeInviteStatusPopup = function(){
					$modalInstance.close();
					appCon.data.userSelectedList = [];
					if ($scope.isOpenAccess === false) {
						$scope.checkOpenAccessAndGrpEligibility();
					}
					$state.go('addNewRep.inviteRep', {}, { reload: true });
				};
			}
		});
	};
	
	$scope.completeCREAddNewRepAndUpdate = function(responseObject){
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"		: "INVITE_ADDREP_PAYMENT_PROCESS_END_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid,
			"value"		: 1
		};
		angular.forEach(responseObject , function(value,key){
			eventObject.label += "#"+key+":"+value;
		});
		eventObject.label += "#localDate:"+new Date();
		$rootScope.$emit("callAnalyticsController", eventObject);
		$scope.enablePCILoading = false;
		$scope.updateAddNewRepPaymentDetails(responseObject.code,responseObject.message,responseObject.uID);
	};
	
	$scope.startCREAddNewRepLoading = function(){
		$scope.enablePCILoading = true;
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"	: "INVITE_ADDREP_PAYMENT_PROCESS_START_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"UID:"+appCon.data.addNewRepBillingDetails.uID+"#localDate:"+new Date(),
			"value"		: 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
	}
	
	$scope.creHandleAddNewRepDetailErrorsAndUpdate = function(errorCode, gatewayCode, gatewayMessage){
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"		: "INVITE_ADDREP_PAYMENT_ERROR_CALLBACK_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"errorCode:"+ errorCode+"#UID:"+appCon.data.addNewRepBillingDetails.uID+"#gatewayCode:"+ gatewayCode +"#gatewayMessage:" + gatewayMessage+"#localDate:"+new Date(),
			"value"		: 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		//$scope.enablePCILoading = true;
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
				errorMessage = 'Please contact the <a target="_blank" href="'+appCon.data.addNewRepBillingDetails.customerCareURL+'">Customer Care</a> and provide error code '+responseCode+'.';
			} else {
				errorMessage = 'Please contact the <a target="_blank" href="'+appCon.data.addNewRepBillingDetails.customerCareURL+'">Customer Care</a> and provide error code '+responseCode+'.';
			}
		}
		$scope.updateAddNewRepPaymentDetails(errorCode,errorMessage,appCon.data.addNewRepBillingDetails.uID);
	};
	
	$scope.creHandleAddNewRepErrorsAndUpdate = function(errorCode){
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"		: "INVITE_ADDREP_PAYMENT_ERROR_REACH",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"errorCode:"+ errorCode+"#UID:"+appCon.data.addNewRepBillingDetails.uID+"#localDate:"+new Date(),
			"value"		: 1
		};
		$rootScope.$emit("callAnalyticsController", eventObject);
		console.log("creHandleErrorsAndUpdate");
	};
	
	$scope.updateAddNewRepPaymentDetails = function(responseCode,message,uID){
		var params = {}, succMongoId, isErrorOnPayment = false, eventObject = {}, doPaymentDetails = {};
		params.paymentDetailsVO = {};
		params.paymentDetailsVO = {'responseCode':responseCode,'message':message,'uID':uID};
		if(angular.isDefined(responseCode) && responseCode != '000'){
			isErrorOnPayment = true;
			doPaymentDetails = {'isCardProfileSaved':false};
		}else {
			doPaymentDetails = {'isCardProfileSaved':true};
		}
		params.paymentDetailsVO.details = doPaymentDetails;
		
		addNewRepServices.updatePaymentDetails(params).then(function (result) {
			var eventObject = {
				"category"	: "ADD_NEW_REP",
				"action"		: "UPADTE_MONGO_ADDREP",
				"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#orderAmount:"+$rootScope.orderAmount,
				"value"		: 1
			};
			if (result.data && result.data.successData && result.data.status === 'success') {
				succMongoId = result.data.successData.paymentDetailsVO.id;
				if(isErrorOnPayment) {
					$scope.addNewRepServiceResponseError = message;
					eventObject.label += "#isFrom:ErrorOnCardProfileSave";
					$scope.getPaymentTechUID(eventObject);
				} else {
					var doPaymentParamsObject = {};
					doPaymentParamsObject = {'paymentDetailId': succMongoId};
					$injector.get("shoppingCartServices")['doPaymentShoppingCart'](doPaymentParamsObject).then(function (result) {
						if(result.data && result.data.successData && result.data.successData.Status == "Ok"){
							if(result.data.successData.isPaymentSuccess == true){
								$rootScope.$emit("callAnalyticsEventTrack", eventObject);
								$scope.saveAddNewRepPaymentProfileDetails('VDB_SCART', succMongoId, responseCode, uID);
							} else {
								var isPaymentErrorCodeArray = ['01','05','43','60','61','62','63','L2','360'];
								var isCardErrorCodeArray = ['74','200','310','315','320','330','340','350','355','357','370','500','510','520','530','531','550','H9','500',''];
								var isBankErrorCodeArray = ['03','12','B5','79','77','R4','600','610','620','630','640','100','110','300','400'];
								var errorMessage;
								var errorFromDoPayment = result.data.successData.responseCode;
								var errorFromDoPaymentSplit = errorCode.split(' ')[0];
								//for (var i=0;i<errorCodeSplit.length;i++) {
									if(isCardErrorCodeArray.indexOf(errorFromDoPaymentSplit) != '-1') {
										errorMessage = 'Please check the credit card information entered and try again.';
									} else if(isPaymentErrorCodeArray.indexOf(errorFromDoPaymentSplit) != '-1') {
										errorMessage = 'Your payment method was not accepted. Please try another card or contact your financial institution.';
									} else if(isBankErrorCodeArray.indexOf(errorFromDoPaymentSplit) != '-1') {
										errorMessage = 'Please contact the <a target="_blank" href="'+appCon.data.scBillingDetails.customerCareURL+'">Customer Care</a> and provide error code '+responseCode+'.';
									} else {
										errorMessage = 'Please contact the <a target="_blank" href="'+appCon.data.scBillingDetails.customerCareURL+'">Customer Care</a> and provide error code '+responseCode+'.';
									}
								//}
								$scope.serviceResponseError = errorMessage;
								$scope.enablePCILoading = false;
								eventObject.label += "#isFrom:ErrorOnDoPaymentSuccess";
								$scope.getPaymentTechUID(eventObject);
							}
						} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
							$scope.addNewRepServiceResponseError = result.data.errorData.ResponseError[0].longMessage;
							$scope.enablePCILoading = false;
							console.log('do payement else');
							eventObject.label += "#isFrom:ErrorOnDoPaymentFailure";
							$scope.getPaymentTechUID(eventObject);
						}
					});
					//$rootScope.$emit("callAnalyticsEventTrack", eventObject);
					//$scope.saveAddNewRepPaymentProfileDetails('VDB_SCART', succMongoId, responseCode, uID);
				}
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.addNewRepServiceResponseError = result.data.errorData.ResponseError[0].longMessage;
				$scope.enablePCILoading = false;
				eventObject.label += "#errorMessage:"+$scope.addNewRepServiceResponseError;
				eventObject.value = 0;
				$rootScope.$emit("callAnalyticsController", eventObject);
			}else{
				$scope.enablePCILoading = false;
			}
		});
	};
	
	$scope.getPaymentTechUID = function(eventObject){
		var getUIDObject = {};
		getUIDObject.urlParams = {'amount': appCon.data.addNewRepBillingDetails.amount,'customer_address' :appCon.data.addNewRepBillingDetails.billingAddress1, 'customer_address2' : appCon.data.addNewRepBillingDetails.billingAddress2, 'customer_email' : appCon.data.addNewRepBillingDetails.billingEmail, 'customer_city' : appCon.data.addNewRepBillingDetails.billingCity, 'customer_state' : appCon.data.addNewRepBillingDetails.billingStateCode, 'customer_postal_code' : appCon.data.addNewRepBillingDetails.billingZip, 'customer_country' : appCon.data.addNewRepBillingDetails.billingCountryCode, 'callback_url' : appCon.data.addNewRepBillingDetails.addNewRep_callback_url, 'css_url' : appCon.data.addNewRepBillingDetails.cssUrl ,'hosted_tokenize' : 'store_only', 
				 'requestFor' :'PAYMENT', 'source' : 'VDB_SCART' , 'acceptFee' : true ,'acceptChangable' : true, 'acceptAutoRenew' : true, 'trueAndAccurate' : true, "order_id": appCon.globalCon.pci.shopping_cart_order_id, "order_desc" : appCon.globalCon.pci.shopping_cart_order_desc };
		getUIDObject.urlParams.source = 'INVITEREP';
		var details = {"newUsersCount":1, "fein":$rootScope.userProfile.detail.fein, "legalName":$rootScope.userProfile.detail.legalName}
		getUIDObject.urlParams.details=details;
		eventObject.label += "#newUsersCount:1#legalName:"+$rootScope.userProfile.detail.legalName;
		angular.forEach(getUIDObject.urlParams, function(value, key) {
			if(!(key === 'details' || key === 'callback_url' || key === 'css_url')){
				eventObject.label += "#"+key+":"+value;
			}
		});
		
		$injector.get("dashboardServices")['getPaymentTechUID'](getUIDObject).then(function (result) {
			if(result.data && result.data.successData && result.data.successData.Status == "Ok"){
				$rootScope.addNewRepScPaymentCallUID = $sce.trustAsResourceUrl(appCon.globalCon.pci.paymentTechFrameURL+result.data.successData.uIDKey);	
				var UIDKey =  result.data.successData.uIDKey;
				appCon.data.addNewRepBillingDetails.uID = UIDKey.split('uID=')[1];
				$scope.enablePCILoading = false;
				eventObject.label += "#newPyamentTechUID:Yes"+'#uID:'+result.data.successData.uIDKey;
				$rootScope.$emit("callAnalyticsController", eventObject);
			} else if (result.data && result.data.errorData && (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error')) {
				$scope.addNewRepServiceResponseError = result.data.errorData.ErrorMsg;
				$scope.enablePCILoading = false;
				eventObject.label += "#errorMessage:"+$scope.addNewRepServiceResponseError;
				eventObject.value = 0;
				$rootScope.$emit("callAnalyticsController", eventObject);
			}
		});
	};
	
	$scope.saveAddNewRepPaymentProfileDetails = function (paymentFrom, mKey, responseCode, uID) {
		$scope.addNewRepServiceResponseError = '';
		var params = {};
		params = {'paymentDetailId':mKey};
		var eventObject = {
			"category"	: "ADD_NEW_REP",
			"action"		: "SAVE_PAYMENT_PROFILE_ADDREP",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#vendorOid:"+$rootScope.userProfile.detail.vendorOid+"#vendorDetailsOid:"+$rootScope.userProfile.detail.vendorDetailOid+"#orderAmount:"+$rootScope.addNewRepOrderAmount,
			"value"		: 1
		};
		eventObject.label += "#responseCode:"+responseCode+"#uID:"+uID+"#paymentDetailId:"+mKey;
		addNewRepServices.savePaymentProfileDetails(params).then(
			function (result) {
			if (result.data && result.data.errorData) {
				if (result.data.errorData.Status === 'Error' || result.data.errorData.Status === 'error') {
					$scope.addNewRepServiceResponseError = result.data.errorData.ResponseError[0].longMessage;
					$scope.enablePCILoading = false;
					eventObject.label += "#errorCode:"+result.data.errorData.ResponseError[0].errorCode+"#errorMessage:"+$scope.addNewRepServiceResponseError;
					eventObject.value = 0;
					$rootScope.$emit("callAnalyticsController", eventObject);
				}
			} else if (result.data && result.data.successData) {
				if (result.data.successData.Status === 'Ok'){
					$rootScope.$emit("callAnalyticsController", eventObject);
					$scope.sendInvitation();
				}else{
					$scope.enablePCILoading = false;
				}
			}else{
				$scope.enablePCILoading = false;
			}
		});
	};
	
	//Back button to summary page.
	$scope.backToAddNewRepSummayPage = function(){
		$scope.billingInfoResponseError = '';
		$state.go('addNewRep.cartSummary');
	};

	$scope.checkOpenAccessAndGrpEligibility = function () {
		checkOpenParam = {
			'isFromIconClick': false,
			'userOid': $rootScope.userProfile.id,
			'fein': $rootScope.userProfile.detail.fein,
			'vendorOid': $rootScope.userProfile.detail.vendorOid
		};
		$injector.get('users').checkOpenAccessEligibility(checkOpenParam).then(function (response) {
			if (response.data && response.data.status === 'success') {
				eligibilityDetails = response.data.successData.eligibilityDetails;
				$rootScope.shoppingCarIcon = eligibilityDetails.showShoppingCartIcon;
				$rootScope.shoppingCartEnabled = eligibilityDetails.shoppingCartEnabled;
				$scope.isOpenAccess = '';
			}
		});
	};
}]);

var completeHPAddNewRep,
	startHostedPaymentAddNewRep,
	hostedHandleDetailErrorsAddNewRep,
	hostedHandleErrorsAddNewRep;

completeHPAddNewRep = function (responseObject) {
	var eventObject = {
			'category': 'ADD_NEW_REP',
			'action': 'INVITE_ADDREP_PAYMENT_PROCESS_END',
			'label': '',
			'value': 1
		},
		scopeEvent = angular.element($('#addNewRepContainer')).scope();
	angular.forEach(responseObject, function (value, key) {
		eventObject.label += '#' + key + ':' + value;
	});
	eventObject.label += '#localDate:' + new Date();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.completeCREAddNewRepAndUpdate(responseObject);
};

startHostedPaymentAddNewRep = function () {
	var eventObject = {
			'category': 'ADD_NEW_REP',
			'action': 'INVITE_ADDREP_PAYMENT_PROCESS_START',
			'label': 'UID:' + appCon.data.addNewRepBillingDetails.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#addNewRepContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.startCREAddNewRepLoading();
};

hostedHandleDetailErrorsAddNewRep = function (errorCode, gatewayCode, gatewayMessage) {
	var eventObject = {
			'category': 'ADD_NEW_REP',
			'action': 'INVITE_ADDREP_PAYMENT_ERROR_CALLBACK',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.addNewRepBillingDetails.uID + '#gatewayCode:' + gatewayCode + '#gatewayMessage:' + gatewayMessage + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#addNewRepContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleAddNewRepDetailErrorsAndUpdate(errorCode, gatewayCode, gatewayMessage);
};

hostedHandleErrorsAddNewRep = function (errorCode) {
	var eventObject = {
			'category': 'ADD_NEW_REP',
			'action': 'INVITE_ADDREP_PAYMENT_ERROR',
			'label': 'errorCode:' + errorCode + '#UID:' + appCon.data.addNewRepBillingDetails.uID + '#localDate:' + new Date(),
			'value': 1
		},
		scopeEvent = angular.element($('#addNewRepContainer')).scope();
	scopeEvent.callGoogleAnalytics(eventObject);
	scopeEvent.creHandleAddNewRepErrorsAndUpdate(errorCode);
};
