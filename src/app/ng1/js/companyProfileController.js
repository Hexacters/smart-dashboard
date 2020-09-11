'use strict';
angular.module(appCon.appName).controller('companyProfileController', ['$scope', '$modal', '$state', '$injector', '$filter','$rootScope','$location','Analytics', function($scope, $modal, $state, $injector, $filter,$rootScope,$location,Analytics) {
	var scope = $scope;
	var commonObj = {};
	appCon.data.certification=[];
	appCon.data.isCertDeleted=[];
	appCon.data.metadataDirty=[];
	appCon.data.certDocDirty=[];
	appCon.data.certDocDirty.isFrom=[];
	$scope.mailTo = function(mailId){
		return  window.encodeURIComponent(mailId);
	};

	var nextday = new Date();
	nextday.setDate(nextday.getDate()); 
	$scope.nextday =  nextday;
	var minDate = new Date();
	var serviceName = 'companyProfileServices';
	
	// Base url configuration 
	var urlIndex = ($location.absUrl()).indexOf('/#/'),baseUrl;
	if(urlIndex !== -1){
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	}else{
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/"+contextPath+"/");
		baseUrl = baseUrl[0]+"/"+ contextPath;
	}
	
	var gpoMemberInit;
	$scope.getGpoMember = function(param){
		if (param.status == 'success'){
			gpoMemberInit = param.successData.VendorDetail.gpoMember;
			if(angular.isUndefined(param.successData.VendorDetail.foundedMonthCode)){
				param.successData.VendorDetail.foundedMonthCode = '1';
			}
			if(param.successData.VendorDetail.largestContractAmountStr){
				param.successData.VendorDetail.largestContractAmountStr = $filter('currency')(param.successData.VendorDetail.largestContractAmountStr, '$', 2);
			}
		}
		return param;
	};
	$scope.convertDollerToNumber = function(value){
		var amount = value !== '' ? angular.copy(value.toString()) : '0';
		amount = amount.replace(/[$]/g,"");
		amount = amount.replace(/[,]/g,"");
		if (amount.indexOf("(") != -1) {
			if (amount.indexOf(")") != -1) {
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
	$scope.convertNumberToDoller = function(value){
		var amount = angular.copy(Number(value));
		value = $filter('currency')(amount, '$', 2);
		return value;
	};
	$scope.companyPrincipalSave = function(param){
		param.CompanyPrincipal.vendorOid =  $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
		return param;
	};
	$scope.openGpos = function(params) {
		$scope.data = params;
		$scope.gpoListFromEdit = $scope.data.vendorGPOList;	
		var gpoOtherFromEdit = $scope.data.VendorDetail.gpoOther;
		if(!angular.isDefined(params.VendorDetail.gpoOther) || params.VendorDetail.gpoOther === ''){
			$rootScope.gpoOtherEnable = 'false';
		}else{
			$rootScope.gpoOtherEnable = 'true';
		}
		$modal.open({
			templateUrl: 'views/companyProfile/companyAffliatedGPO.html?rnd='+appCon.globalCon.deployDate,
			scope: $scope,
			backdrop: 'static',
			keyboard: false,
			controller: function($scope,$modalInstance) {
			$scope.clearGpos = function(gpoEnable,gopOther){
				$scope.data.VendorDetail.gpoOther = '';
			};
			$scope.closeGpos = function(gpoEnable,gopOther,gpoList){
				gpoMemberInit = $scope.data.VendorDetail.gpoMember;
				$scope.data.vendorGPOList =	gpoList;
				$rootScope.gpoOtherEnable = gpoEnable;
				$scope.data.VendorDetail.gpoOther = gopOther;
				if(gpoEnable === 'false'){$scope.data.VendorDetail.gpoOther = '';}
				if($scope.data.vendorGPOList.length === 0 && $scope.data.VendorDetail.gpoOther === ''){
					$scope.data.VendorDetail.gpoMember = false;
				}else{
					$scope.data.VendorDetail.gpoMember = true;
				}
				$modalInstance.close();
			};
				$scope.cancelGPOs = function(){
					$scope.data.VendorDetail.gpoMember = gpoMemberInit;
					$scope.data.VendorDetail.gpoOther = gpoOtherFromEdit;
					$modalInstance.close();
				}
			}
		});
	};
	
	$scope.setGpoOthersValue = function(gpoOthers) {
		if(angular.isDefined(gpoOthers) && gpoOthers !=''){
			$rootScope.affliatedGPOsOther = gpoOthers;
		}
	};	

	$scope.removeAddressKey = function(param){
		angular.forEach(param, function(value, key) {
			delete(value.createdBy);
			delete(value.createdOn);
			delete(value.updatedBy);
			delete(value.updatedOn);
			delete(value.updateAction);
			delete(value.deleteAction);
			delete(value.securityMap);
			delete(value.addressValidatedOn);
		});
		return  param;
	};

	$scope.copyAddressToRemit = function(object){
		if (!object[1]) {
			object[1] = {};
		}
		object[1].addressLine1 = object[0].addressLine1;
		object[1].addressLine2 = object[0].addressLine2;
		object[1].addressLine3 = object[0].addressLine3;
		object[1].parentOid = object[0].parentOid;
		object[1].city = object[0].city;
		object[1].countryCode = object[0].countryCode;
		object[1].stateCode = object[0].stateCode;
		object[1].zip = object[0].zip;
		
		if(object[0].addressTypeCode === 'ADDHQ'){
			object[1].addressTypeCode = 'ADDRM';
		}else if(object[0].addressTypeCode === 'ADDRM'){
			object[1].addressTypeCode = 'ADDHQ';
		}
		object = $scope.removeAddressKey(object);
		return  object;
	};

	$scope.populateVendorDatail = function(detailObject){
		var vendorDetailObject = {};
		vendorDetailObject.remitToAddressFax = angular.isDefined(detailObject.remitToAddressFax) ? detailObject.remitToAddressFax : '';
		vendorDetailObject.headquartersPhone = angular.isDefined(detailObject.headquartersPhone) ? detailObject.headquartersPhone : '';
		vendorDetailObject.headquartersFax = angular.isDefined(detailObject.headquartersFax) ? detailObject.headquartersFax : '';
		vendorDetailObject.mainEmailAddress = angular.isDefined(detailObject.mainEmailAddress) ? detailObject.mainEmailAddress : '';
		vendorDetailObject.websiteURL = angular.isDefined(detailObject.websiteURL) ? detailObject.websiteURL : '';
		vendorDetailObject.isHqAddrRemitAddrStr = angular.isDefined(detailObject.isHqAddrRemitAddrStr) ? detailObject.isHqAddrRemitAddrStr : '';
		vendorDetailObject.oid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorDetailOid : $scope.userProfile.detail.vendorDetailOid;
		return vendorDetailObject;
	};

	var isValidateHQ, isValidateRM, j, contactInfoAddressList, contactInfoAddressFormValue, onlyHQAddress = false;
	$scope.getContactInformation = function(param) {
		if (param.status == 'success'){
			contactInfoAddressList = angular.copy(param.successData.AddressList);
			onlyHQAddress = contactInfoAddressList.length === 1 ? true : false;
			for(j=0; j < contactInfoAddressList.length; j++){
				if(angular.isDefined(contactInfoAddressList[j]) && contactInfoAddressList[j].addressTypeCode === 'ADDHQ'){
					isValidateHQ = contactInfoAddressList[j].addressValidated;
				}else if(angular.isDefined(contactInfoAddressList[j]) && contactInfoAddressList[j].addressTypeCode === 'ADDRM'){
					isValidateRM = contactInfoAddressList[j].addressValidated;
				}
			}
			if(contactInfoAddressList.length === 1){
				if(param.successData.VendorDetail.isHqAddrRemitAddr === true ){
					param.successData.AddressList = $scope.copyAddressToRemit(param.successData.AddressList);
				}else{
					param.successData.AddressList.push({"countryCode":"US","addressTypeCode":"ADDRM"});
				}
			}
			$rootScope.updatedContactAddress = param.successData.AddressList[0];
			for(j=0; j < contactInfoAddressList.length; j++){
				if(angular.isDefined(contactInfoAddressList[j]) && contactInfoAddressList[j].addressTypeCode === 'ADDHQ'){
					param.successData.AddressList[0] = contactInfoAddressList[j];
				}else if(angular.isDefined(contactInfoAddressList[j]) && contactInfoAddressList[j].addressTypeCode === 'ADDRM'){
					param.successData.AddressList[1] = contactInfoAddressList[j];
				}
			}
			contactInfoAddressList = angular.copy(param.successData.AddressList);
			$rootScope.updateStateDropDown(param.successData.AddressList[0].countryCode)
		}
		return param;
	};

	// Save contactInfo CREDMGR-2192 "Remit To Address" section to be removed
	$scope.saveCompanyContactVendorInformation = function(param) {
		var object = {
				"VendorDetail" : $scope.populateVendorDatail(angular.copy(param['VendorDetail'])),
		};
		$scope.enableLoading = true;
		if($state.current.name === 'companyProfile.editContactInformation' 
		|| $state.current.name === 'manage.repAccountDetails.companyProfile.editContactInformation'){
		var companyContactInformationEditForm = document.getElementById("companyContactInformationEdit");
		disableAll(companyContactInformationEditForm);
			$injector.get(serviceName)['saveVendorContactDetail'](object).then(function(result) {
			enableAll(companyContactInformationEditForm);
				$scope.enableLoading = false;
				$scope.contactInfosubmitErro = {};
				if (result.data.status == 'success') {
					if(!$rootScope.isFromManageReps){
						$state.go('companyProfile.viewContactInformation');
					} else{
						$state.go('manage.repAccountDetails.companyProfile.viewContactInformation');
					}
				}else{
					$scope.contactInfosubmitError = result.data;
				}
			}, function(error) {
				$scope.data = JSON.parse(handleError(error));
			});
		}
	};

	/**
	 * CREDMGR-2192 "Remit To Address" section to be removed

	// Validate Address Popup 
	$scope.validateAddressPopup = function(addressList,object,steps) {
		if(steps === 'oneTime' || steps === 'validateHqOnly'){
			$scope.hgHeader = true;
		}else{
			$scope.hgHeader = false;
		}
	    $modal.open({
	        templateUrl: 'views/companyProfile/validateAddress.html?rnd='+appCon.globalCon.deployDate,
			windowClass:'commonDialogW50',
			keyboard: false,
	        backdrop: 'static',
			scope:$scope,
	        controller: function($scope, $modalInstance, $state) {
	            $scope.addressList = addressList;
	            $scope.updateMalisaAddress = function(validateAddressList) {
					if(steps === 'oneTime'){
						object['AddressList'][0] = $scope.updateMellisaAddress(object['AddressList'][0],validateAddressList);
						object['AddressList'] = $scope.copyAddressToRemit(object['AddressList']);
						object['AddressList'][0].addressValidated = true;
						object['AddressList'][1].addressValidated = true;
						object['AddressList'][0].addressValidatedSource = 'MELLISA';
						object['AddressList'][1].addressValidatedSource = 'MELLISA';
						object['AddressList'][1].normalizedNote = object['AddressList'][0].normalizedNote;
						object['VendorDetail']['remitToAddressFax']  = object['VendorDetail']['headquartersFax'];
						object['VendorDetail'] = $scope.populateVendorDatail(object['VendorDetail']);
						delete object.Status;
						$modalInstance.close();
						$scope.saveCompanyContactInformation(object);
					}if(steps === 'validateHqOnly'){
						$modalInstance.close();
						object['AddressList'][0] = $scope.updateMellisaAddress(object['AddressList'][0],validateAddressList);
						object['AddressList'][0].addressValidated = true;
						object['AddressList'][0].addressValidatedSource = 'MELLISA';
						$scope.validateMellisaRemitAddress(object);
					}if(steps === 'validateRmOnly'){
						$modalInstance.close();
						object['AddressList'][1] = $scope.updateMellisaAddress(object['AddressList'][1],validateAddressList);
						object['AddressList'][1].addressValidated = true;
						object['AddressList'][1].addressValidatedSource = 'MELLISA';
						object['AddressList'] = $scope.removeAddressKey(object['AddressList']);
						object['VendorDetail'] = $scope.populateVendorDatail(object['VendorDetail']);
						delete object.Status;
						$scope.saveCompanyContactInformation(object);
					}
	            };
	            $scope.closeValidateAddressPopup = function() {
					$modalInstance.close();
					if(steps === 'oneTime'){
						object['AddressList'][0].addressValidated = false;
						object['AddressList'][0].addressValidatedSource = '';
						object['AddressList'][0].normalizedNote = '';
						$scope.oneTimeValidationSave(object,object['VendorDetail'],object['AddressList']);
					}if(steps === 'validateHqOnly'){
						object['AddressList'][0].addressValidated = false;
						object['AddressList'][0].addressValidatedSource = '';
						object['AddressList'][0].normalizedNote = '';
						$scope.validateMellisaRemitAddress(object);
					}if(steps === 'validateRmOnly'){
						object['AddressList'][1].addressValidated = false;
						object['AddressList'][1].addressValidatedSource = '';
						object['AddressList'][1].normalizedNote = '';
						object['AddressList'] = $scope.removeAddressKey(object['AddressList']);
						object['VendorDetail'] = $scope.populateVendorDatail(object['VendorDetail']);
						delete object.Status;
						$scope.saveCompanyContactInformation(object);
					}
	            };
	        }
	    });
	};	
	
	$scope.updateMellisaAddress = function(param,valiedAddress){
		param.addressLine1 = valiedAddress.addressLine1;
		param.addressLine2 = valiedAddress.addressLine2;
		param.city = valiedAddress.city;
		param.zip = valiedAddress.zip;
		param.normalizedNote = valiedAddress.normalizedNote;
		return param;
	};
	
	$scope.validateMellisaRemitAddress = function(object){
		var addressList = angular.copy(object['AddressList']),isChanged,Request;
		if(addressList[1].countryCode === 'US' || addressList[1].countryCode === 'CA') {
			if(isValidateRM){
				isChanged = $scope.checkAddressModification(contactInfoAddressList[1],object['AddressList'][1]);
				if(!isChanged){
					object['AddressList'][1].addressValidated = true;
					object['AddressList'][1].addressValidatedSource = 'MELLISA';
					object['AddressList'] = $scope.removeAddressKey(object['AddressList']);
					object['VendorDetail'] = $scope.populateVendorDatail(object['VendorDetail']);
					delete object.Status;
					$scope.saveCompanyContactInformation(object);
				}else{
					Request = {"addressLine1":addressList[1].addressLine1,"addressLine2":addressList[1].addressLine2,
							"city":addressList[1].city,"countryCode":addressList[1].countryCode,
							"stateCode":addressList[1].stateCode,"zip":addressList[1].zip};
					$scope.validateMelissaRequest(Request,object,'validateRmOnly');
				}
			}else{
				Request = {"addressLine1":addressList[1].addressLine1,"addressLine2":addressList[1].addressLine2,
							"city":addressList[1].city,"countryCode":addressList[1].countryCode,
							"stateCode":addressList[1].stateCode,"zip":addressList[1].zip};
				$scope.validateMelissaRequest(Request,object,'validateRmOnly');
			}
		}else{
			object['AddressList'][1].addressValidated = false;
			object['AddressList'][1].addressValidatedSource = '';
			object['AddressList'][1].normalizedNote = '';
			object['AddressList'] = $scope.removeAddressKey(object['AddressList']);
			object['VendorDetail'] = $scope.populateVendorDatail(object['VendorDetail']);
			delete object.Status;
			$scope.saveCompanyContactInformation(object);
		}
	};
	
	
	$scope.validateMelissaRequest = function(param,object,steps){
		$scope.enableLoading = true;
		var companyContactInformationEditForm = document.getElementById("companyContactInformationEdit");
		disableAll(companyContactInformationEditForm);
		$injector.get(serviceName)["validateAddresses"](param).then(function(result) {
			enableAll(companyContactInformationEditForm);
			$scope.enableLoading = false;
			if (result.data && result.data.errorData) {
				if (angular.lowercase(result.data.errorData.Status) === "error") {
					if(steps === 'oneTime'){
						object['AddressList'][0].addressValidated = false;
						object['AddressList'][0].addressValidatedSource = 'MELLISA';
						object['AddressList'][0].normalizedNote = result.data.errorData.ResponseError[0].longMessage;
						$scope.oneTimeValidationSave(object,object['VendorDetail'],object['AddressList']);
					}else if(steps === 'validateHqOnly'){
						object['AddressList'][0].addressValidated = false;
						object['AddressList'][0].addressValidatedSource = 'MELLISA';
						object['AddressList'][0].normalizedNote = result.data.errorData.ResponseError[0].longMessage;
						$scope.validateMellisaRemitAddress(object);
					}else if(steps === 'validateRmOnly'){
						object['AddressList'][1].addressValidated = false;
						object['AddressList'][1].addressValidatedSource = 'MELLISA';
						object['AddressList'][1].normalizedNote = result.data.errorData.ResponseError[0].longMessage;
						object['AddressList'] = $scope.removeAddressKey(object['AddressList']);
						object['VendorDetail'] = $scope.populateVendorDatail(object['VendorDetail']);
						delete object.Status;
						$scope.saveCompanyContactInformation(object);
					}
				}
			}else if (result.data && result.data.successData) {
				if (result.data.successData.Status === "Ok") {
					if (result.data.successData.AddressList) {
						if($state.current.name === 'companyProfile.editContactInformation' 
						|| $state.current.name === 'manage.repAccountDetails.companyProfile.editContactInformation'){
						$scope.validateAddressPopup(result.data.successData.AddressList,object,steps);
						}
					}
				}
			}
		});
	};
	
	$scope.savContactInformationEdit = function(param) {
		contactInfoAddressFormValue = angular.copy(param);
		if (param.VendorDetail.isHqAddrRemitAddr === true) {
			$scope.validateHqAddrRemitAddr(contactInfoAddressFormValue);
		}else{
			$scope.validateHqAddrAndRemitAddr(contactInfoAddressFormValue);
		}
	};
	$scope.validateHqAddrRemitAddr = function(object){
		var addressArray,Request,isChanged,VendorDetailList;
		addressArray = angular.copy(object['AddressList']);
		VendorDetailList = angular.copy(object['VendorDetail']);
		if(addressArray[0].countryCode === 'US' || addressArray[0].countryCode === 'CA') {
			Request = {"addressLine1":addressArray[0].addressLine1,"addressLine2":addressArray[0].addressLine2,
							"city":addressArray[0].city,"countryCode":addressArray[0].countryCode,
							"stateCode":addressArray[0].stateCode,"zip":addressArray[0].zip};			
			if(isValidateHQ){
				isChanged = $scope.checkAddressModification(contactInfoAddressList[0],object['AddressList'][0]);
				if(!isChanged){
					object['AddressList'][0].addressValidated = true;
					object['AddressList'][0].addressValidatedSource = 'MELLISA';
					$scope.oneTimeValidationSave(object,VendorDetailList,addressArray);
				}else{
					$scope.validateMelissaRequest(Request,object,'oneTime');			
				}
			}else{
				$scope.validateMelissaRequest(Request,object,'oneTime');
			}
		}else{
			object['AddressList'][0].addressValidated = false;
			object['AddressList'][0].addressValidatedSource = '';
			object['AddressList'][0].normalizedNote = '';
			$scope.oneTimeValidationSave(object,VendorDetailList,addressArray);
		}
	};
	
	$scope.validateHqAddrAndRemitAddr = function(object){
		var addressList = angular.copy(object['AddressList']),Request,isChanged;
		if(addressList[0].countryCode === 'US' || addressList[0].countryCode === 'CA') {
			if(isValidateHQ){
				isChanged = $scope.checkAddressModification(contactInfoAddressList[0],object['AddressList'][0]);
				if(!isChanged){
					object['AddressList'][0].addressValidated = true;
					object['AddressList'][0].addressValidatedSource = 'MELLISA';
					$scope.validateMellisaRemitAddress(object);
				}else{
					Request = {"addressLine1":addressList[0].addressLine1,"addressLine2":addressList[0].addressLine2,
							"city":addressList[0].city,"countryCode":addressList[0].countryCode,
							"stateCode":addressList[0].stateCode,"zip":addressList[0].zip};
					$scope.validateMelissaRequest(Request,object,'validateHqOnly');					
				}
			}else{
				 Request = {"addressLine1":addressList[0].addressLine1,"addressLine2":addressList[0].addressLine2,
							"city":addressList[0].city,"countryCode":addressList[0].countryCode,
							"stateCode":addressList[0].stateCode,"zip":addressList[0].zip};	
				$scope.validateMelissaRequest(Request,object,'validateHqOnly');	
			}
		}else{
			object['AddressList'][0].addressValidated = false;
			object['AddressList'][0].addressValidatedSource = '';
			object['AddressList'][0].normalizedNote = '';
			$scope.validateMellisaRemitAddress(object);
		}
	};
	$scope.checkAddressModification = function(param,newValue){
		if(param.addressLine1 === newValue.addressLine1 && param.addressLine2 === newValue.addressLine2 &&
			param.city === newValue.city &&	param.zip === newValue.zip && param.countryCode === newValue.countryCode ){
			return false;
		}else{
			return true;
		}
	};
	$scope.oneTimeValidationSave = function(object,vendorDetail,addressArray){
		object['VendorDetail'] = $scope.populateVendorDatail(vendorDetail);
		object['AddressList'] = $scope.copyAddressToRemit(addressArray);
		object['AddressList'][1].addressValidated  = object['AddressList'][0].addressValidated;
		if(angular.isDefined(object['AddressList'][0].normalizedNote)){
			object['AddressList'][1].normalizedNote = object['AddressList'][0].normalizedNote;
		}
		if(angular.isDefined(object['AddressList'][0].addressValidatedSource)){
			object['AddressList'][1].addressValidatedSource = object['AddressList'][0].addressValidatedSource;
		}
		object['VendorDetail']['remitToAddressFax']  = object['VendorDetail']['headquartersFax'];
		delete object.Status;
		$scope.saveCompanyContactInformation(object);
	};
	
	$scope.saveCompanyContactInformation = function(param){
		$scope.enableLoading = true;
		param['AddressList'][1].parentOid = param['AddressList'][0].parentOid;
		if($state.current.name === 'companyProfile.editContactInformation' 
		|| $state.current.name === 'manage.repAccountDetails.companyProfile.editContactInformation'){
		var companyContactInformationEditForm = document.getElementById("companyContactInformationEdit");
		disableAll(companyContactInformationEditForm);
			$injector.get(serviceName)['saveCompanyContactInformation'](param).then(function(result) {
			enableAll(companyContactInformationEditForm);
				$scope.enableLoading = false;
				$scope.contactInfosubmitErro = {};
				if (result.data.status == 'success') {
					if(!$rootScope.isFromManageReps){
						$state.go('companyProfile.viewContactInformation');
					} else{
						$state.go('manage.repAccountDetails.companyProfile.viewContactInformation');
					}
				}else{
					$scope.contactInfosubmitError = result.data;
				}
			}, function(error) {
				$scope.data = JSON.parse(handleError(error));
			});
		}
	};
	*/
	$scope.splitGpovalue = function(param) {
		if(!param.VendorDetail.gpoMember){
			param.VendorDetail.gpoMemberStr = '';
			param.VendorDetail.gpoOther = '';
			param.vendorGPOList = [];
		}
		if(!param['vendorGPOList']){
			param['gpos'] = '';
			param['vendorGPOList'] = '';
		}
		var value = angular.copy(param.VendorDetail.largestContractAmountStr);
		if(value !== ''){
			value = value.replace(/[$]/g,'');
			value = value.replace(/[,]/g,"");
			if (value.indexOf("(") != -1) {
				if (value.indexOf(")") != -1) {
					value = value.replace(/[(]/g,"-");
				}
			}
			value = value.replace(/[)]/g,"");
			var dot = value.indexOf(".");
			if (dot != -1) {
				var dotArr = value.split(".");
				if (dotArr.length >= 3) {
					value = dotArr[0] + "." +dotArr[1];
				}
			}
			value = value.replace(/[$]/g,'');
			value = value.replace(/[,]/g,"");
			if (value.indexOf("(") != -1) {
				if (value.indexOf(")") != -1) {
					value = value.replace(/[(]/g,"-");
				}
			}
			value = value.replace(/[)]/g,"");
			var dot = value.indexOf(".");
			if (dot != -1) {
				var dotArr = value.split(".");
				if (dotArr.length >= 3) {
					value = dotArr[0] + "." +dotArr[1];
				}
			}
			if (value.length>15 && value.indexOf(".")>=13 ){
				value = value.substring(0, value.indexOf("."));
			}
			param.VendorDetail.largestContractAmountStr = value;
		}
		$scope.postValue = param;
		var i;
		if (param.vendorGPOList) {
			$scope.postValue.gpos = '';
			for (i = 0; i < (param.vendorGPOList.length); i++) {
				if (i === 0) {
					$scope.postValue.gpos = param.vendorGPOList[i].oid;
				} else {
					$scope.postValue.gpos = $scope.postValue.gpos + "," + param.vendorGPOList[i].oid;
				}
			}
		}
		if($scope.postValue.VendorDetail.dnbListingNumberNew && $scope.postValue.VendorDetail.dnbListingNumberNew !=''){
			$scope.postValue.VendorDetail.dnbListingNumber = $scope.postValue.VendorDetail.dnbListingNumberNew;
		}
		return $scope.postValue;
	};
	$scope.companyPrincipalAlertTitle ='';
	$scope.openCompanyProfile = function(principalsOid, modalName) {
		$scope.actionLoader = true;
		$scope.selectedAction = "";
		appCon.data.principals = {};
		appCon.data.principals.companyPrincipalOid = principalsOid;
		$scope.companyPrincipalOid = principalsOid;
		if (modalName === 'view') {
				$scope.companyPrincipalView = '';
				$injector.get('companyProfileServices')['getCompanyPrincipalByOid']().then(function(result){
					if(result.data.status == "success"){
						$scope.actionLoader = false;
						$scope.companyPrincipalView = result.data;
						$modal.open({
							templateUrl: 'views/companyProfile/companyPrincipalsView.html?rnd='+appCon.globalCon.deployDate,
							backdrop: 'static',
							windowClass:'commonDialogW80',
							keyboard: false,
							scope: $scope
						});
					}else{
						$scope.actionLoader = false;
						$scope.companyPrincipalView = result.data;
						if($scope.companyPrincipalView.errorData.ResponseError[0].errorCode =='5024'){
							$scope.companyPrincipalAlertTitle ='View Company Principal';
							$modal.open({
								templateUrl: 'views/companyProfile/companyPrincipalsAlert.html?rnd='+appCon.globalCon.deployDate,
								backdrop: 'static',
								keyboard: false,
								scope: $scope
							});
						}else{
							$modal.open({
								templateUrl: 'views/companyProfile/companyPrincipalsView.html?rnd='+appCon.globalCon.deployDate,
								backdrop: 'static',
								windowClass:'commonDialogW80',
								keyboard: false,
								scope: $scope
							});
						}
					}
				});
		}
		if (modalName === 'edit') {
				$scope.data = {};
				$injector.get('companyProfileServices')['getCompanyPrincipalByOid']().then(function(result){
					if(result.data.status == "success"){
						$scope.actionLoader = false;
						$scope.data.CompanyPrincipal = result.data.successData.CompanyPrincipalList[0];
						$modal.open({
							templateUrl: 'views/companyProfile/companyPrincipalsEdit.html?rnd='+appCon.globalCon.deployDate,
							backdrop: 'static',
							windowClass:'commonDialogW80',
							keyboard: false,
							scope: $scope
						});
					}else{
						$scope.actionLoader = false;
						$scope.data.CompanyPrincipal = result.data;
						if($scope.data.CompanyPrincipal.errorData.ResponseError[0].errorCode ==='5024' || $scope.data.CompanyPrincipal.errorData.ResponseError[0].errorCode === '4100'){
							$scope.companyPrincipalAlertTitle ='Edit Company Principal';
							$modal.open({
								templateUrl: 'views/companyProfile/companyPrincipalsAlert.html?rnd='+appCon.globalCon.deployDate,
								backdrop: 'static',
								keyboard: false,
								scope: $scope
							});
						}else{
							$modal.open({
								templateUrl: 'views/companyProfile/companyPrincipalsEdit.html?rnd='+appCon.globalCon.deployDate,
								backdrop: 'static',
								windowClass:'commonDialogW80',
								keyboard: false,
								scope: $scope
							});
						}
					}
				});
		}
		if (modalName === 'delete') {
			$scope.actionLoader = false;
			if(!$rootScope.isFromManageReps){
				$scope.commonDeleteDialog('companyProfile.companyPrincipals','companyProfileServices','deleteCompanyPrincipal',principalsOid);
			} else {
				$scope.commonDeleteDialog('manage.repAccountDetails.companyPrincipals','companyProfileServices','deleteCompanyPrincipal',principalsOid);
			}
		}
	};
	
	$scope.deleteAlertCancel = function() {
		if(!$rootScope.isFromManageReps)	{
			$state.go('companyProfile.companyPrincipals',{},{reload : true});
		} else {
			$state.go('manage.repAccountDetails.companyProfile.companyPrincipals',{'random':$scope.getRandomSpan()});
		}
	};
	
	$scope.restricCompanyPrincipalsInitial = function(CompanyPrincipalsList) {
		var companyPrincipalsList = CompanyPrincipalsList.data;
		$scope.restricCompanyPrincipals(companyPrincipalsList)
	};
	
	$scope.restricCompanyPrincipalsCallback = function(result) {
		if(result && result.successData && result.successData.CompanyPrincipalList){
			$scope.restricCompanyPrincipals(result.successData.CompanyPrincipalList);		
		}
	};
	
	$scope.restricCompanyPrincipals = function(CompanyPrincipalsList) {
		$scope.hideCompanyPrincipalsValue = 0;
		angular.forEach(CompanyPrincipalsList, function(value, key) {
			if (value['officerContactTypeCode'] === 'VOPRI') {
				$scope.hideCompanyPrincipalsValue++;
			}
		});
		if ($scope.hideCompanyPrincipalsValue >= 5) {
			$rootScope.hideCompanyPrincipals = true;
		} else {
			$rootScope.hideCompanyPrincipals = false;
		}
	};

	$scope.saveComplianceOfficerInformation = function(param) {
		var companyProfileServices = $injector.get("companyProfileServices");
		if(!angular.isDefined(param['Address'])){
			param['Address'] = {'addressLine1':'','countryCode':'US'}
			}
		param['Address'].countryCode = angular.isDefined(param['Address'].countryCode) && param['Address'].countryCode != '' ?  param['Address'].countryCode : 'US' ;
		delete(param['Status']);
		delete(param['contentType']);
		angular.forEach(param, function(value, key) {
			if(key === 'ComplianceOfficer'){
				 delete(value.createdBy); delete(value.createdOn);
				 delete(value.updatedBy); delete(value.updatedOn);
				 delete(value.deleteAction); delete(value.updateAction);
				 delete(value.dob); delete(value.yearsWithCompanyStr);
				 delete(value.facisBatchSubmitted);
				 delete(value.inDea); delete(value.inFda);
				 delete(value.inGsa); delete(value.inNara);
				 delete(value.inOfac); delete(value.inOig);
				 delete(value.inPhs); delete(value.inState);
				 delete(value.inTricare); delete(value.maskedSsn);
				 delete(value.queueSearchString); delete(value.maskedDriversLicense);
				 delete(value.maskedDriversLicense);
			}
			if(key === 'Address'){
				 delete(value.createdBy);
				 delete(value.createdOn);
				 delete(value.updatedBy);
				 delete(value.updatedOn);
				 delete(value.updateAction);
				 delete(value.deleteAction);
				 delete(value.securityMap);
			}
		});
		$scope.enableSaveLoading = true;
		var complanceOfficerEditForm = document.getElementById("complanceOfficerEditForm");
		disableAll(complanceOfficerEditForm);
		companyProfileServices.saveComplianceOfficerInformation(param).then(function(result) {
			enableAll(complanceOfficerEditForm);
			$scope.complainceOfficerSubmitError = {};
			$scope.enableSaveLoading = false;
			if (result.data.status === 'success') {
				if(!$rootScope.isFromManageReps)	{
					$state.go('companyProfile.complainceOfficerView');
				} else {
					$state.go('manage.repAccountDetails.companyProfile.complainceOfficerView');
				}
			}
			else if (result.data.status === 'error') {
				if(result.data.errorData.ResponseError[0].errorCode === '5135' || result.data.errorData.ResponseError[0].errorCode === '5024'){
					if(!$rootScope.isFromManageReps)	{
						$state.go('companyProfile.complainceOfficerView');
					} else{
						$state.go('manage.repAccountDetails.companyProfile.complainceOfficerView');
					}
				} else{
					$scope.complainceOfficerSubmitError = result.data;
				}
			}
		}, function(error) {
			$scope.data = JSON.parse(handleError(error));
		});
	};
	
	$scope.commonDeleteDialog = function(redirectState, serviceURL, operationURL, params) {
		$scope.hideDeletePrincipalContent = false;
		$modal.open({
			templateUrl: 'views/companyProfile/companyPrincipalsDelete.html?rnd='+appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function($scope, $modalInstance) {
				$scope.deletePrincipalLoading =false;
				$scope.ok = function() {
					$scope.deletePrincipalLoading =true;
					$injector.get(serviceURL)[operationURL]({
						companyPrincipalOid: params
					}).then(function(result) {
						if (result.data.status == 'success') {
							$scope.deletePrincipalLoading =false;
							$modalInstance.close();
							if (redirectState) {
								if(!$rootScope.isFromManageReps)	{
									$state.go('companyProfile.companyPrincipals',{},{reload : true});
									$scope.$dismiss();
								} else {
									$state.go('manage.repAccountDetails.companyProfile.companyPrincipals',{'random':$scope.getRandomSpan()});
									$scope.$dismiss();
								}
							}
						} else {
							$scope.deletePrincipalLoading =false;
							if(result.data.errorData.ResponseError[0].errorCode =='5024'){
								$scope.hideDeletePrincipalContent = true;
							}else{
								$scope.hideDeletePrincipalContent = false;
								$scope.commonConfirmationDialogErrorContent = '<div class="alert alert-danger"><i class="fa fa-exclamation-triangle"></i> ' + $filter("translate")(result.data.errorData.ResponseError[0].errorCode); + '</div>';
							}
						 }
					}, function(error) {
						$scope.data = JSON.parse(handleError(error));
					});

				};
				$scope.deleteAlertCancel = function() {
					if(!$rootScope.isFromManageReps)	{
						$state.go('companyProfile.companyPrincipals',{},{reload : true});
						$scope.$dismiss();
					} else {
						$scope.$dismiss();
						$state.go('manage.repAccountDetails.companyProfile.companyPrincipals',{'random':$scope.getRandomSpan()});
					}
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};

			}
		});
	};
	commonObj.prepareAppCommonConfirmationDialogContainer = function() {
		var popuDivHtmlContent = '';
		popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-header">'
		popuDivHtmlContent = popuDivHtmlContent +'<button id="closeIcon" type="button" class="close" aria-hidden="true" ng-click="cancel();">&times;</button>';
		popuDivHtmlContent = popuDivHtmlContent + '<h3 class="modal-title" style="font-size:14px;font-weight:bold;">{{"companyProfile.companyPrincipals.header.deleteCompanyPrincipal" | translate}}</h3>';
		popuDivHtmlContent = popuDivHtmlContent + '</div>';

		popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-body">';
		popuDivHtmlContent = popuDivHtmlContent + '<div class="bd">';
		popuDivHtmlContent = popuDivHtmlContent + '<div style="float:none;">';
		popuDivHtmlContent = popuDivHtmlContent + '<p ng-bind-html="commonConfirmationDialogErrorContent"></p>';
		popuDivHtmlContent = popuDivHtmlContent + '{{"common.deleteConfirmation" | translate}}';
		popuDivHtmlContent = popuDivHtmlContent + '</div>';
		popuDivHtmlContent = popuDivHtmlContent + '</div>';
		popuDivHtmlContent = popuDivHtmlContent + '</div>';

		popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-footer">';
		popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-info" ng-click="ok()">{{"common.yes" | translate}}</button>';
		popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-warning" ng-click="cancel()" autofocus>{{"common.no" | translate}}</button>';
		popuDivHtmlContent = popuDivHtmlContent + '</div>';

		return popuDivHtmlContent;
	};
	
	$scope.viewDiversityDocument = function (certTypeCode) {
		if(!window.focus)return;
		var vendorDetailOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorDetailOid : $scope.userProfile.detail.vendorDetailOid;
		if(certTypeCode && certTypeCode !== ''){
			if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true' ){
				var target = baseUrl+"/img/download.jpg";
			} else {
				var params = "{\"VisionRequest\":{\"certificationTypeCode\":\""+certTypeCode+"\",\"vendorDetailOid\":\""+vendorDetailOid+"\"}}";
				var target = baseUrl+"/VMClientProxyServlet?service=vendor&operation=getCertificationDocument&visionRequest="+encodeURIComponent(params);
			}
			var certificateWin=window.open(target,"certificateWin","height=700,width=900,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
			certificateWin.focus();
		}
	};
	$scope.showDiversityDetails = function (diversityFlag, divId) {
		if (diversityFlag == "true") {
			$scope[divId] = true;
		} else {
			$scope[divId] = false;
		}
		$rootScope.metadataDirty='true';
		if(divId === 'diversity1'){appCon.data.certification.diversity1 = true}
		if(divId === 'diversity2'){appCon.data.certification.diversity2 = true}
		if(divId === 'diversity3'){appCon.data.certification.diversity3 = true}
		if(divId === 'diversity4'){appCon.data.certification.diversity4 = true}
		if(divId === 'diversity5'){appCon.data.certification.diversity5 = true}
		if(divId === 'diversity6'){appCon.data.certification.diversity6 = true}
		if(divId === 'diversity7'){appCon.data.certification.diversity7 = true}
		if(divId === 'diversity8'){appCon.data.certification.diversity8 = true}
		if(divId === 'diversity9'){appCon.data.certification.diversity9 = true}
		if(divId === 'diversity10'){appCon.data.certification.diversity10 = true}
	};
	$scope.setMetadataDirty =  function(certMetaData) {
		if(certMetaData === 'diversity1'){appCon.data.metadataDirty.diversity1 = true}
		if(certMetaData === 'diversity2'){appCon.data.metadataDirty.diversity2 = true}
		if(certMetaData === 'diversity3'){appCon.data.metadataDirty.diversity3 = true}
		if(certMetaData === 'diversity4'){appCon.data.metadataDirty.diversity4 = true}
		if(certMetaData === 'diversity5'){appCon.data.metadataDirty.diversity5 = true}
		if(certMetaData === 'diversity6'){appCon.data.metadataDirty.diversity6 = true}
		if(certMetaData === 'diversity7'){appCon.data.metadataDirty.diversity7 = true}
		if(certMetaData === 'diversity8'){appCon.data.metadataDirty.diversity8 = true}
		if(certMetaData === 'diversity9'){appCon.data.metadataDirty.diversity9 = true}
		if(certMetaData === 'diversity10'){appCon.data.metadataDirty.diversity10 = true}
	};
	
	$scope.deleteUploadedDocument = function(certFile){
		if(certFile === 'diversity1'){appCon.data.certDocDirty.diversity1 = true; appCon.data.certDocDirty.isFrom.diversity1 = 'delete';}
		if(certFile === 'diversity2'){appCon.data.certDocDirty.diversity2 = true; appCon.data.certDocDirty.isFrom.diversity2 = 'delete';}
		if(certFile === 'diversity3'){appCon.data.certDocDirty.diversity3 = true; appCon.data.certDocDirty.isFrom.diversity3 = 'delete';}
		if(certFile === 'diversity4'){appCon.data.certDocDirty.diversity4 = true; appCon.data.certDocDirty.isFrom.diversity4 = 'delete';}
		if(certFile === 'diversity5'){appCon.data.certDocDirty.diversity5 = true; appCon.data.certDocDirty.isFrom.diversity5 = 'delete';}
		if(certFile === 'diversity6'){appCon.data.certDocDirty.diversity6 = true; appCon.data.certDocDirty.isFrom.diversity6 = 'delete';}
		if(certFile === 'diversity7'){appCon.data.certDocDirty.diversity7 = true; appCon.data.certDocDirty.isFrom.diversity7 = 'delete';}
		if(certFile === 'diversity8'){appCon.data.certDocDirty.diversity8 = true; appCon.data.certDocDirty.isFrom.diversity8 = 'delete';}
		if(certFile === 'diversity9'){appCon.data.certDocDirty.diversity9 = true; appCon.data.certDocDirty.isFrom.diversity9 = 'delete';}
		if(certFile === 'diversity10'){appCon.data.certDocDirty.diversity10 = true; appCon.data.certDocDirty.isFrom.diversity10 = 'delete';}
	};
	
	$scope.uploadDocumentSuccess = function(data, scope){
		if(data.status === 'success' && data.successData.mongoKey != ''){
			if(scope.id === 'minorityOwnedUploaderUI'){appCon.data.certDocDirty.diversity1 = true; appCon.data.certDocDirty.isFrom.diversity1 = 'upload';}
			if(scope.id === 'womenOwnedUploaderUI'){appCon.data.certDocDirty.diversity2 = true; appCon.data.certDocDirty.isFrom.diversity2 = 'upload';}
			if(scope.id === 'smallDisOwnedUploaderUI'){appCon.data.certDocDirty.diversity3 = true; appCon.data.certDocDirty.isFrom.diversity3 = 'upload';}
			if(scope.id === 'smallENTOwnedUploaderUI'){appCon.data.certDocDirty.diversity4 = true; appCon.data.certDocDirty.isFrom.diversity4 = 'upload';}
			if(scope.id === 'veretenOwnedUploaderUI'){appCon.data.certDocDirty.diversity5 = true; appCon.data.certDocDirty.isFrom.diversity5 = 'upload';}
			if(scope.id === 'serviceDisabledOwnedUploaderUI'){appCon.data.certDocDirty.diversity6 = true; appCon.data.certDocDirty.isFrom.diversity6 = 'upload';}
			if(scope.id === 'disabilityOwnedUploaderUI'){appCon.data.certDocDirty.diversity7 = true; appCon.data.certDocDirty.isFrom.diversity7 = 'upload';}
			if(scope.id === 'lgbtOwnedUploaderUI'){appCon.data.certDocDirty.diversity8 = true; appCon.data.certDocDirty.isFrom.diversity8 = 'upload';}
			if(scope.id === 'hubzoneOwnedUploaderUI'){appCon.data.certDocDirty.diversity9 = true; appCon.data.certDocDirty.isFrom.diversity9 = 'upload';}
			if(scope.id === 'eightAOwnedUploaderUI'){appCon.data.certDocDirty.diversity10 = true; appCon.data.certDocDirty.isFrom.diversity10 = 'upload';}
		}
	};
	var certifiedListArray = [];
	$scope.getDiversityInfo = function(param){
		
		if(param.status == 'success'){
			certifiedListArray = angular.isDefined(param.successData.CertificationList) ? angular.copy(param.successData.CertificationList) : [];
			
			var selected,certificationList,vendorDetail;
			certificationList = angular.copy(param.successData.CertificationList);
			vendorDetail = angular.copy(param.successData.VendorDetail);
			
			/* Add "minorityType" key for ng-options */
			selected = vendorDetail.minorityCode !== '' ? _.findIndex($scope.minorityTypeLookup, function(o) { return o.value == vendorDetail.minorityCode; }) : -1;
			param.successData.VendorDetail.minorityType = selected !== -1 ? $scope.minorityTypeLookup[selected] : '';
			
			/* Add "certificationAgency" key for ng-options */
			angular.forEach(certificationList , function(value,key){
				selected = '';
				selected = value.certificationAgencyOid !== '' ? _.findIndex($scope.certificationAgencyLookup, function(o) { return o.value == value.certificationAgencyOid; }) : -1;
				param.successData.CertificationList[key].certificationAgency = selected !== -1 ? $scope.certificationAgencyLookup[selected] : '';
			});
		}
		return param;
	};
	
	$scope.checkDiversityDirty = function(param){
		var Key = _.findIndex(certifiedListArray, function(o) { return o.certificationTypeCode == param.certificationTypeCode; });
		if(Key !== -1){
			if((param.certificationAgencyOid === certifiedListArray[Key].certificationAgencyOid) && 
				(param.certEffectiveDateString === certifiedListArray[Key].certEffectiveDateString) &&
				(param.certExpDateString === certifiedListArray[Key].certExpDateString) &&
				(param.certNumber === certifiedListArray[Key].certNumber) &&
				(param.certAgencyOtherName === certifiedListArray[Key].certAgencyOtherName)){
				return false;
			}else{
				return true;
			}
		}else{
			return true;
		}
	}

	$scope.submitDiversityForm = function(requestParam,isChanged) {
		var requestParam = angular.copy(requestParam);
		$scope.serviceResponseError = {};
		if(isChanged && ((angular.isUndefined(appCon.data.certDocDirty.diversity1)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity2)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity3)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity4)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity5)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity6)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity7)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity8)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity9)) && 
				(angular.isUndefined(appCon.data.certDocDirty.diversity10))
				)){
			$state.go('companyProfile.diversityInformaionView',{reload : true});
		}else{
			var params = {}, operationName="saveDiversityInformation", serviceName = "companyProfileServices";
			params["VendorDetail"] = {
				"oid": requestParam["diversityDetails"]["VendorDetail"]["oid"],
				"minorityOwnedStr": requestParam["diversityDetails"]["VendorDetail"]["minorityOwnedStr"],
				"minorityCode": requestParam["diversityDetails"]["VendorDetail"]["minorityCode"],
				"womenOwnedStr": requestParam["diversityDetails"]["VendorDetail"]["womenOwnedStr"],
				"smallDisadvantagedStr": requestParam["diversityDetails"]["VendorDetail"]["smallDisadvantagedStr"],
				"smallBusinessEnterpriseStr": requestParam["diversityDetails"]["VendorDetail"]["smallBusinessEnterpriseStr"],
				"disabledVeteranStr": requestParam["diversityDetails"]["VendorDetail"]["disabledVeteranStr"],
				"serviceDisabledVeteranOwnedStr": requestParam["diversityDetails"]["VendorDetail"]["serviceDisabledVeteranOwnedStr"],
				"disabledOwnedStr": requestParam["diversityDetails"]["VendorDetail"]["disabledOwnedStr"],
				"lgbtOwnedStr": requestParam["diversityDetails"]["VendorDetail"]["lgbtOwnedStr"],
				"hubZoneStr": requestParam["diversityDetails"]["VendorDetail"]["hubZoneStr"],
				"eightAStr": requestParam["diversityDetails"]["VendorDetail"]["eightAStr"],
				"certificationGender": requestParam["diversityDetails"]["VendorDetail"]["certificationGender"],
				"certificationEthnicity": requestParam["diversityDetails"]["VendorDetail"]["certificationEthnicity"]
			};

			var cert1 = {},
				cert2 = {},
				cert3 = {},
				cert4 = {},
				cert5 = {},
				cert6 = {},
				cert7 = {},
				cert8 = {},
				cert9 = {},
				cert10 = {},
				vendorDetailOid,
				oid,
				certificationTypeCode,
				certFileUploadedOn,
				mongoKey;
			params["addOnParams"] = [];
			params["CertificationFile"] = [];
			params["CertificationMetaData"] = [];
			params["addOnParams"] = {
				"certDocDirty": "false",
				"metadataDirty": "false"
			}
			vendorDetailOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorDetailOid : $scope.userProfile.detail.vendorDetailOid;
			if (angular.isDefined(appCon.data.certDocDirty.diversity1) && appCon.data.certDocDirty.diversity1 === true) {
				oid = requestParam["certification1"].oid;
				certificationTypeCode = requestParam["certification1"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity1) && appCon.data.certDocDirty.isFrom.diversity1 === 'upload' && angular.isDefined(requestParam["minorityOwnedBusiness"]) && angular.isDefined(requestParam["minorityOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["minorityOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["minorityOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity1) && appCon.data.certDocDirty.isFrom.diversity1 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert1["vendorDetailOid"] = vendorDetailOid;
				cert1["certificationOid"] = oid;
				cert1["certificationTypeCode"] = certificationTypeCode;
				cert1["certFileUploadedOnStr"] = certFileUploadedOn;
				cert1["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert1);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity2) && appCon.data.certDocDirty.diversity2 === true) {
				oid = requestParam["certification2"].oid;
				certificationTypeCode = requestParam["certification2"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity2) && appCon.data.certDocDirty.isFrom.diversity2 === 'upload' && angular.isDefined(requestParam["womenOwnedBusiness"]) && angular.isDefined(requestParam["womenOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["womenOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["womenOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity2) && appCon.data.certDocDirty.isFrom.diversity2 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert2["vendorDetailOid"] = vendorDetailOid;
				cert2["certificationOid"] = oid;
				cert2["certificationTypeCode"] = certificationTypeCode;
				cert2["certFileUploadedOnStr"] = certFileUploadedOn;
				cert2["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert2);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity3) && appCon.data.certDocDirty.diversity3 === true) {
				oid = requestParam["certification3"].oid;
				certificationTypeCode = requestParam["certification3"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity3) && appCon.data.certDocDirty.isFrom.diversity3 === 'upload' && angular.isDefined(requestParam["smallDisOwnedBusiness"]) && angular.isDefined(requestParam["smallDisOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["smallDisOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["smallDisOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity3) && appCon.data.certDocDirty.isFrom.diversity3 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert3["vendorDetailOid"] = vendorDetailOid;
				cert3["certificationOid"] = oid;
				cert3["certificationTypeCode"] = certificationTypeCode;
				cert3["certFileUploadedOnStr"] = certFileUploadedOn;
				cert3["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert3);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity4) && appCon.data.certDocDirty.diversity4 === true) {
				oid = requestParam["certification4"].oid;
				certificationTypeCode = requestParam["certification4"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity4) && appCon.data.certDocDirty.isFrom.diversity4 === 'upload' && angular.isDefined(requestParam["smallENTOwnedBusiness"]) && angular.isDefined(requestParam["smallENTOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["smallENTOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["smallENTOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity4) && appCon.data.certDocDirty.isFrom.diversity4 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert4["vendorDetailOid"] = vendorDetailOid;
				cert4["certificationOid"] = oid;
				cert4["certificationTypeCode"] = certificationTypeCode;
				cert4["certFileUploadedOnStr"] = certFileUploadedOn;
				cert4["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert4);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity5) && appCon.data.certDocDirty.diversity5 === true) {
				oid = requestParam["certification5"].oid;
				certificationTypeCode = requestParam["certification5"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity5) && appCon.data.certDocDirty.isFrom.diversity5 === 'upload' && angular.isDefined(requestParam["veretenOwnedBusiness"]) && angular.isDefined(requestParam["veretenOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["veretenOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["veretenOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity5) && appCon.data.certDocDirty.isFrom.diversity5 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert5["vendorDetailOid"] = vendorDetailOid;
				cert5["certificationOid"] = oid;
				cert5["certificationTypeCode"] = certificationTypeCode;
				cert5["certFileUploadedOnStr"] = certFileUploadedOn;
				cert5["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert5);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity6) && appCon.data.certDocDirty.diversity6 === true) {
				oid = requestParam["certification6"].oid;
				certificationTypeCode = requestParam["certification6"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity6) && appCon.data.certDocDirty.isFrom.diversity6 === 'upload' && angular.isDefined(requestParam["serviceDisabledOwnedBusiness"]) && angular.isDefined(requestParam["serviceDisabledOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["serviceDisabledOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["serviceDisabledOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity6) && appCon.data.certDocDirty.isFrom.diversity6 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert6["vendorDetailOid"] = vendorDetailOid;
				cert6["certificationOid"] = oid;
				cert6["certificationTypeCode"] = certificationTypeCode;
				cert6["certFileUploadedOnStr"] = certFileUploadedOn;
				cert6["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert6);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity7) && appCon.data.certDocDirty.diversity7 === true) {
				oid = requestParam["certification7"].oid;
				certificationTypeCode = requestParam["certification7"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity7) && appCon.data.certDocDirty.isFrom.diversity7 === 'upload' && angular.isDefined(requestParam["disabilityOwnedBusiness"]) && angular.isDefined(requestParam["disabilityOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["disabilityOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["disabilityOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity7) && appCon.data.certDocDirty.isFrom.diversity7 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert7["vendorDetailOid"] = vendorDetailOid;
				cert7["certificationOid"] = oid;
				cert7["certificationTypeCode"] = certificationTypeCode;
				cert7["certFileUploadedOnStr"] = certFileUploadedOn;
				cert7["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert7);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity8) && appCon.data.certDocDirty.diversity8 === true) {
				oid = requestParam["certification8"].oid;
				certificationTypeCode = requestParam["certification8"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity8) && appCon.data.certDocDirty.isFrom.diversity8 === 'upload' && angular.isDefined(requestParam["lgbtOwnedBusiness"]) && angular.isDefined(requestParam["lgbtOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["lgbtOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["lgbtOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity8) && appCon.data.certDocDirty.isFrom.diversity8 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert8["vendorDetailOid"] = vendorDetailOid;
				cert8["certificationOid"] = oid;
				cert8["certificationTypeCode"] = certificationTypeCode;
				cert8["certFileUploadedOnStr"] = certFileUploadedOn;
				cert8["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert8);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity9) && appCon.data.certDocDirty.diversity9 === true) {
				oid = requestParam["certification9"].oid;
				certificationTypeCode = requestParam["certification9"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity9) && appCon.data.certDocDirty.isFrom.diversity9 === 'upload' && angular.isDefined(requestParam["hubzoneOwnedBusiness"]) && angular.isDefined(requestParam["hubzoneOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["hubzoneOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["hubzoneOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity9) && appCon.data.certDocDirty.isFrom.diversity9 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert9["vendorDetailOid"] = vendorDetailOid;
				cert9["certificationOid"] = oid;
				cert9["certificationTypeCode"] = certificationTypeCode;
				cert9["certFileUploadedOnStr"] = certFileUploadedOn;
				cert9["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert9);
			}

			if (angular.isDefined(appCon.data.certDocDirty.diversity10) && appCon.data.certDocDirty.diversity10 === true) {
				oid = requestParam["certification10"].oid;
				certificationTypeCode = requestParam["certification10"].certificationTypeCode;
				if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity10) && appCon.data.certDocDirty.isFrom.diversity10 === 'upload' && angular.isDefined(requestParam["eightAOwnedBusiness"]) && angular.isDefined(requestParam["eightAOwnedBusiness"].successData)) {
					certFileUploadedOn = requestParam["eightAOwnedBusiness"].successData.uploadedTime;
					mongoKey = requestParam["eightAOwnedBusiness"].successData.mongoKey;
					params["addOnParams"]["certDocDirty"] = "true";
				} else if (angular.isDefined(appCon.data.certDocDirty.isFrom.diversity10) && appCon.data.certDocDirty.isFrom.diversity10 === 'delete') {
					certFileUploadedOn = '';
					mongoKey = '';
					params["addOnParams"]["certDocDirty"] = "true";
				}
				cert10["vendorDetailOid"] = vendorDetailOid;
				cert10["certificationOid"] = oid;
				cert10["certificationTypeCode"] = certificationTypeCode;
				cert10["certFileUploadedOnStr"] = certFileUploadedOn;
				cert10["mongoKey"] = mongoKey;
				params["CertificationFile"].push(cert10);
			}
			if(appCon.data.metadataDirty.diversity1 === true || appCon.data.metadataDirty.diversity2 === true || appCon.data.metadataDirty.diversity3 === true || appCon.data.metadataDirty.diversity4 === true || appCon.data.metadataDirty.diversity5 === true || appCon.data.metadataDirty.diversity6 === true || appCon.data.metadataDirty.diversity7 === true || appCon.data.metadataDirty.diversity8 === true || appCon.data.metadataDirty.diversity9 === true || appCon.data.metadataDirty.diversity10 === true){
				params["addOnParams"]["metadataDirty"] = "true";
			}
			if (params["VendorDetail"].minorityOwnedStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification1"]) || angular.isDefined(appCon.data.metadataDirty.diversity1) && appCon.data.metadataDirty.diversity1 === true){
					requestParam["certification1"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification1"]);
				}
			}else if(params["VendorDetail"].minorityOwnedStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity1) && appCon.data.metadataDirty.diversity1 === true){
				$scope.removeCertificationParamValue(requestParam["certification1"]);
				requestParam["certification1"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification1"]);
			}
			if (params["VendorDetail"].womenOwnedStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification2"]) || angular.isDefined(appCon.data.metadataDirty.diversity2) && appCon.data.metadataDirty.diversity2 === true){
					requestParam["certification2"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification2"]);
				}
			}else if(params["VendorDetail"].womenOwnedStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity2) && appCon.data.metadataDirty.diversity2 === true){
				$scope.removeCertificationParamValue(requestParam["certification2"]);
				requestParam["certification2"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification2"]);
			}
			if (params["VendorDetail"].smallDisadvantagedStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification3"]) || angular.isDefined(appCon.data.metadataDirty.diversity3) && appCon.data.metadataDirty.diversity3 === true){
					requestParam["certification3"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification3"]);
				}
			}else if(params["VendorDetail"].smallDisadvantagedStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity3) && appCon.data.metadataDirty.diversity3 === true){
				$scope.removeCertificationParamValue(requestParam["certification3"]);
				requestParam["certification3"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification3"]);
			}
			if (params["VendorDetail"].smallBusinessEnterpriseStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification4"]) || angular.isDefined(appCon.data.metadataDirty.diversity4) && appCon.data.metadataDirty.diversity4 === true){
					requestParam["certification4"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification4"]);
				}
			}else if(params["VendorDetail"].smallBusinessEnterpriseStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity4) && appCon.data.metadataDirty.diversity4 === true){
				$scope.removeCertificationParamValue(requestParam["certification4"]);
				requestParam["certification4"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification4"]);
			}
			if (params["VendorDetail"].disabledVeteranStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification5"]) || angular.isDefined(appCon.data.metadataDirty.diversity5) && appCon.data.metadataDirty.diversity5 === true){
					requestParam["certification5"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification5"]);
				}
			}else if(params["VendorDetail"].disabledVeteranStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity5) && appCon.data.metadataDirty.diversity5 === true){
				$scope.removeCertificationParamValue(requestParam["certification5"]);
				requestParam["certification5"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification5"]);
			}
			if (params["VendorDetail"].serviceDisabledVeteranOwnedStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification6"]) || angular.isDefined(appCon.data.metadataDirty.diversity6) && appCon.data.metadataDirty.diversity6 === true){
					requestParam["certification6"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification6"]);
				}
			}else if(params["VendorDetail"].serviceDisabledVeteranOwnedStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity6) && appCon.data.metadataDirty.diversity6 === true){
				$scope.removeCertificationParamValue(requestParam["certification6"]);
				requestParam["certification6"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification6"]);
			}
			if (params["VendorDetail"].disabledOwnedStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification7"]) || angular.isDefined(appCon.data.metadataDirty.diversity7) && appCon.data.metadataDirty.diversity7 === true){
					requestParam["certification7"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification7"]);
				}
			}else if(params["VendorDetail"].disabledOwnedStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity7) && appCon.data.metadataDirty.diversity7 === true){
				$scope.removeCertificationParamValue(requestParam["certification7"]);
				requestParam["certification7"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification7"]);
			}
			if (params["VendorDetail"].lgbtOwnedStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification8"]) || angular.isDefined(appCon.data.metadataDirty.diversity8) && appCon.data.metadataDirty.diversity8 === true){
					requestParam["certification8"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification8"]);
				}
			}else if(params["VendorDetail"].lgbtOwnedStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity8) && appCon.data.metadataDirty.diversity8 === true){
				$scope.removeCertificationParamValue(requestParam["certification8"]);
				requestParam["certification8"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification8"]);
			}
			if (params["VendorDetail"].hubZoneStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification9"]) || angular.isDefined(appCon.data.metadataDirty.diversity9) && appCon.data.metadataDirty.diversity9 === true){
					requestParam["certification9"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification9"]);
				}
			}else if(params["VendorDetail"].hubZoneStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity9) && appCon.data.metadataDirty.diversity9 === true){
				$scope.removeCertificationParamValue(requestParam["certification9"]);
				requestParam["certification9"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification9"]);
			}
			if (params["VendorDetail"].eightAStr === 'true') {
				if($scope.checkDiversityDirty(requestParam["certification10"]) || angular.isDefined(appCon.data.metadataDirty.diversity10) && appCon.data.metadataDirty.diversity10 === true){
					requestParam["certification10"]["vendorDetailOid"] = vendorDetailOid;
					params["CertificationMetaData"].push(requestParam["certification10"]);
				}
			}else if(params["VendorDetail"].eightAStr === 'false' && angular.isDefined(appCon.data.metadataDirty.diversity10) && appCon.data.metadataDirty.diversity10 === true){
				$scope.removeCertificationParamValue(requestParam["certification10"]);
				requestParam["certification10"]["vendorDetailOid"] = vendorDetailOid;
				params["CertificationMetaData"].push(requestParam["certification10"]);
			}

			for (var i = 0; i < params.CertificationMetaData.length; i++) {
				if(params.CertificationMetaData[i].certificationAgencyOid && params.CertificationMetaData[i].certificationAgencyOid !== 'other'){
					params.CertificationMetaData[i].certAgencyOtherName = '';
				}
				delete params.CertificationMetaData[i].certificationAgency;
				delete params.CertificationMetaData[i].certAgencyName;
				delete params.CertificationMetaData[i].certificateImageMimeType;
				delete params.CertificationMetaData[i].certVerifyStatusCode;
				delete params.CertificationMetaData[i].isCertExpired;
				delete params.CertificationMetaData[i].isCertExpiring;
				delete params.CertificationMetaData[i].metadataDirty;
				delete params.CertificationMetaData[i].updatedBy;
				delete params.CertificationMetaData[i].updatedOn;
				delete params.CertificationMetaData[i].mongoKey;
				delete params.CertificationMetaData[i].directory;
				delete params.CertificationMetaData[i].certificateUploadedBy;
				delete params.CertificationMetaData[i].certFileUploadedOn;
				delete params.CertificationMetaData[i].fileName;
				delete params.CertificationMetaData[i].certificationEnabled;
				delete params.CertificationMetaData[i].updateAction;
				delete params.CertificationMetaData[i].deleteAction;
				delete params.CertificationMetaData[i].certFileOid;
				delete params.CertificationMetaData[i].createdBy;
				delete params.CertificationMetaData[i].createdOn;
				delete params.CertificationMetaData[i].certExpDate;
				delete params.CertificationMetaData[i].certEffectiveDate;
			}
			$scope.enableDiversitySaveLoading = true;
			var diversityInfomationEditForm = document.getElementById("diversityInfomationEdit");
			disableAll(diversityInfomationEditForm);
			$injector.get(serviceName)[operationName](params).then(
				function(result) {
					enableAll(diversityInfomationEditForm);
					$scope.enableDiversitySaveLoading = false;
					if (result.data.status == "success") {
						if(!$rootScope.isFromManageReps)	{
							$state.go('companyProfile.diversityInformaionView',{reload : true});
						}
						else{
							$state.go('manage.repAccountDetails.companyProfile.diversityInformaionView',{reload : true});
						}
					} else {
						$scope.serviceResponseError = result.data;
					}
			});
		}
	};
	
	$scope.removeCertificationParamValue = function (certMetaData) {
		certMetaData.certificationAgencyOid ='';
		certMetaData.certAgencyOtherName ='';
		certMetaData.certNumber ='';
		certMetaData.certEffectiveDateString ='';
		certMetaData.certExpDateString='';
		return certMetaData;
	};

	var dobstring = $scope.$watch('$$childHead.data.CompanyPrincipal.dob', function() {
		if ($scope.$$childHead && $scope.$$childHead.data && $scope.$$childHead.data.CompanyPrincipal && $scope.$$childHead.data.CompanyPrincipal.dob) {
			var dob = $scope.$$childHead.data.CompanyPrincipal.dob;
			dob = new Date((dob).split("-").join("/"));
			if(dob != 'Invalid Date'){
				$scope.$$childHead.data.CompanyPrincipal.dob = $filter('date')(dob, 'MM/dd/yyyy');
			}
			dobstring();
		}
	});
//Company Profile redirections.
	
	$scope.companyInfo = function (param) {
		$scope.companyInfoSubmitError = {};
		if(param.data.status === 'success'){
			if(!$rootScope.isFromManageReps) {
					$state.go('companyProfile.viewInformation',{reload : true});
			} else {
				$state.go('manage.repAccountDetails.companyProfile.viewInformation');
			}
		}else{
			$scope.companyInfoSubmitError = param.data;
		}
	};
	$scope.companyContactInfo = function () {
		if($rootScope.isFromManageReps){
			$state.go('companyProfile.viewContactInformation',{reload : true});
		} else {
			$state.go('manage.repAccountDetails.companyProfile.viewContactInformation');
		}
	};
	
	$scope.companyPrinciples= function(gridDetails) {
		$rootScope.gridDetails = gridDetails;
	};
	
	$scope.getRandomSpan = function(){
	  return Math.floor((Math.random()*6)+1);
	}
	
	$scope.companyPrinciplesInfo = function (param) {
		$scope.companyPrinciplesSubmitError = {};
		if(param.data.status === 'success'){
			if(!$rootScope.isFromManageReps) {
				$state.go('companyProfile.companyPrincipals',{},{reload : true});
				$scope.$dismiss();
			} else {
				$scope.$dismiss();
				$state.go('manage.repAccountDetails.companyProfile.companyPrincipals',{'random':$scope.getRandomSpan()});
			}
		}else{
			if(param.data.errorData.ResponseError[0].errorCode =='4100'){
				if(!$rootScope.isFromManageReps) {
					$scope.$dismiss();
					$state.go('companyProfile.companyPrincipals.commonDialogAlert');
				} else {
					$scope.$dismiss();
					$state.go('manage.repAccountDetails.companyProfile.companyPrincipals.commonDialogAlert');
				}
			}else{
				$scope.companyPrinciplesSubmitError = param.data;
			}
		}
	};
	$scope.companyGeographicSalesInfo = function () {
		if(!$rootScope.isFromManageReps){
			$state.go('companyProfile.viewGeographicSalesCapability');
		} else{
			$state.go('manage.repAccountDetails.companyProfile.viewGeographicSalesCapability');
		}
	};
	
	$scope.complianceOfficerInfo = function () {
		if(!$rootScope.isFromManageReps){
			$state.go('companyProfile.complainceOfficerView');
		} else {
			$state.go('manage.repAccountDetails.companyProfile.complainceOfficerView');
		}
	};

	var companyDuns  = $scope.$watch('$$childHead.data.VendorDetail.dnbListingNumber', function() {
		if ($scope.$$childHead.data && $scope.$$childHead.data.VendorDetail && $scope.$$childHead.data.VendorDetail.dnbListingNumber) {
			$scope.companyDnbListing = $scope.$$childHead.data.VendorDetail.dnbListingNumber;
			companyDuns();
		}
	});
	
	//set restrictCompanyDocuments flag to root scope for the purpose of manage reps tab 
	$scope.restrictCompanyDocumentsVendorLevel = function(VendorSuccessData) {
		if(angular.isDefined(VendorSuccessData.data.successData) && angular.isDefined(VendorSuccessData.data.successData.VendorDetail)
			&& angular.isDefined(VendorSuccessData.data.successData.VendorDetail.restrictCompanyDocuments)){
			$rootScope.restrictCompanyDocuments = VendorSuccessData.data.successData.VendorDetail.restrictCompanyDocuments;
		}
		return VendorSuccessData;
	};
	
	//google analytics page track
	$scope.callGAPageTrack = function(pageName){
		Analytics.trackPage("/"+$rootScope.path+"/"+pageName+"/");
	};
}]);

angular.module(appCon.appName).directive('currency', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function (elem, $scope, attrs, ngModel) {
            ngModel.$formatters.push(function (val) {
                return $filter('currency')(val)
            });
            ngModel.$parsers.push(function (val) {
                return val.replace(/[\$,]/, '')
            });
        }
    }
}])
