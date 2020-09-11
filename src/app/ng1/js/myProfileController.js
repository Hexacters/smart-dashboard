'use strict';
angular.module(appCon.appName).controller('myProfileController', ['$scope', '$modal', '$injector', '$rootScope', '$parse', '$timeout', '$state','$filter','$templateCache','$cookieStore','Analytics', function($scope, $modal, $injector, $rootScope, $parse, $timeout, $state, $filter ,$templateCache, $cookieStore,Analytics) {
	var myProfileServices = $injector.get('myProfileServices');
	//Initial getCall ProductAndServiceCode
	$scope.getProductAndServiceCode = function() {
		var postParam = {};
		postParam.userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
		$scope.enableLoading = true;
		myProfileServices.getProductAndServiceCodes(postParam).then(function(result) {
			$scope.enableLoading = false;
			if (result.data && result.data.status === 'success') {
				$scope.userSelectedProducts = result.data.successData.ProductCodeList;
				if (result.data.successData.myProductDesc) {
					$scope.myProductDesc = result.data.successData.myProductDesc;
				} else {
					$scope.myProductDesc = "";
				}
			}
		});
	};

	/**
	 * reload payment method every time accordion open
	 */
	$rootScope.isCMOpen = false;
	$rootScope.checkCMOpen = function () {
		$rootScope.isCMOpen = !$rootScope.isCMOpen;
		if ($rootScope.isCMOpen) {
			$state.go('myProfile.cardManagement', {}, {reload: true});
		}
	};
	
	$scope.changeDobToDobString = function(param){
		var value = angular.copy(param);
		value.User.dobstring = value.User.dob;
		delete value.User.dob;
		return value;
	};

	$scope.myProfileChangeUserName=function(){	
		$scope.changePasswordDialog =  $modal.open({
			templateUrl : 'views/users/changeUsername.html?rnd='+appCon.globalCon.deployDate,
			backdrop : 'static',
			keyboard : false,
			windowClass:'commonDialogW50'
		});
	};
	
	$scope.referenceListSortByOid = function(param){
		if(param.status === 'success'){
			param.successData.ReferenceList = _.sortByAll(param.successData.ReferenceList, ['oid']);
		}
		return param;
	};
	
	//Search Call
	$scope.productAndServiceCall = function(searchString, exactMatch, selected) {
		$scope.responseError = false;
		$scope.noRecordFound = false;
		$scope.alreadySelected = false;
		$scope.mustSelectError = false;
		$scope.requiredErrorMessage = false;
		var param = {
				"searchString": searchString,
				"exactMatch": exactMatch
		};
		if (searchString) {
			$scope.enableLoading = true;
			$scope.requiredErrorMessage = false;
			var productAndServiceOfferingForm = document.getElementById("productAndServiceOfferingEdit");
			disableAll(productAndServiceOfferingForm);
			myProfileServices.searchProducts(param).then(function(result) {
				enableAll(productAndServiceOfferingForm);
				$scope.enableLoading = false;
				$scope.responseError = false;
				$scope.noRecordFound = false;
				$scope.alreadySelected = false;
				if (result.data.errorData) {
					$scope.userSelectedProducts = [];
					$scope.responseError = true;
					$scope.responseErrorMessage = result.data;
				} else {
					if (result.data.successData.lookupList) {
						$scope.userSelectedProducts = result.data.successData.lookupList;
						var selectedList = 0;
						if((result.data.successData.lookupList).length > 0 && selected.length > 0){
							angular.forEach(result.data.successData.lookupList, function(value, key) {
								var indexAlready =  _.findIndex(selected, function(o) { return o.code == value.code;});
								if(indexAlready !== -1){
									selectedList++; 
								}
							});
						$scope.alreadySelected = selectedList === (result.data.successData.lookupList).length ? true : false;
						}
					} else {
						$scope.userSelectedProducts = [];
						$scope.noRecordFound = true;
						$scope.alreadySelected = false;
					}
				}
			});
		} else {
			$scope.requiredErrorMessage = true;
		}
	};

	//post Call saveProductsAndServices
	$scope.saveProductsAndServices = function(dataParam, dataDesc,redirect) {
		$scope.productString = dataParam;
		$scope.responseError = false;
		$scope.noRecordFound = false;
		$scope.alreadySelected = false;
		$scope.requiredErrorMessage = false;
		if (dataParam.productAndServiceCodes.length === 0) {
			$scope.mustSelectError = true;
		} else {
			$scope.mustSelectError = false;
			var codes = '';
			angular.forEach($scope.productString, function(value, key) {
				if (key === "productAndServiceCodes") {
					for (var i = 0; i < ($scope.productString.productAndServiceCodes.length); i++) {
						if (i === 0) {
							codes = value[i].code;
						} else {
							codes = codes + "," + value[i].code;
						}
					}
				}
			});

			var postParam = {
					"myProductDesc": dataDesc,
					"productAndServiceCodes": codes
			};
			$scope.enableLoading = true;
			var productAndServiceOfferingEditForm  = document.getElementById("productAndServiceOfferingEdit");
			disableAll(productAndServiceOfferingEditForm);
			myProfileServices.saveProductsAndServices(postParam).then(function(result) {
				enableAll(productAndServiceOfferingEditForm);
				$scope.saveProductsAndServicesSubmitError = {};
				$scope.enableLoading = false;
				if (result.data && result.data.status === 'success') {
					if(!$rootScope.isFromManageReps)	{
						$state.go('myProfile.productServiceOfferingView',{reload : true});
					}
					else if($rootScope.isFromManageReps){
						$state.go('manage.repAccountDetails.manageRepProfile.productServiceOfferingView',{reload : true});
					}
				} else {
					$scope.saveProductsAndServicesSubmitError = result.data;
				}
			});
		}
	};

	$scope.contactEditInfo = function (param) {
		$scope.contactPersonalInfoSubmitError = {};
		if (param.data.status == 'success') {
			if(!$rootScope.isFromManageReps){
				$state.go('myProfile.contactPersonalInfoView',{reload : true});
			}
			else if($rootScope.isFromManageReps){
				$state.go('manage.repAccountDetails.manageRepProfile.contactPersonalInfoView',{reload : true});
			}
		}else{
			$scope.contactPersonalInfoSubmitError = param.data;
		}
	};
	$scope.accountEditInfo = function (param) {
		$scope.saveUserWithAddressSubmitError = {};
		if (param.data.status == 'success') {
			if(!$rootScope.isFromManageReps)	{
				$state.go('myProfile.accountInformationView',{reload : true});
			}
			else if($rootScope.isFromManageReps){
				$state.go('manage.repAccountDetails.manageRepProfile.accountInformationView',{reload : true});
			}
		}else{
			$scope.saveUserWithAddressSubmitError = param.data;
		}
	};
	$scope.productServiceEditInfo = function () {
		if(!$rootScope.isFromManageReps)	{
			$state.go('myProfile.productServiceOfferingView',{reload : true});
		}
		else if($rootScope.isFromManageReps){
			$state.go('manage.repAccountDetails.manageRepProfile.productServiceOfferingView',{reload : true});
		}
	};
	$scope.salesTerritoryEditInfo = function () {
		if(!$rootScope.isFromManageReps)	{
			$state.go('myProfile.salesTerritoryView',{reload : true});
		}
		else if($rootScope.isFromManageReps){
			$state.go('manage.repAccountDetails.manageRepProfile.salesTerritoryView',{reload : true});
		}
	};
	
	$scope.supervisorEditInfo = function (param) {
		$scope.supervisorEditInfoSubmitError = {};
		if (param.data.status == 'success') {
			if(!$rootScope.isFromManageReps)	{
				$state.go('myProfile.supervisorInformationView',{reload : true});
			}
			else if($rootScope.isFromManageReps){
				$state.go('manage.repAccountDetails.manageRepProfile.supervisorInformationView',{reload : true});
			}
		}else{
			$scope.supervisorEditInfoSubmitError = param.data;
		}
	};
	$scope.saveReferencesRemoveKey = function(param){
		var userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
		if(angular.isUndefined(param.Reference)){
			param.Reference = [];
			param.Reference.push({"parentOid":userOid});
			param.Reference.push({"parentOid":userOid});
			param.Reference.push({"parentOid":userOid});
		}else{
			var checkIsArray = angular.isArray(param.Reference);
			if(!checkIsArray){
				var listOfAddress = [];
				for(var i=0;i<=2;i++){
					if(angular.isUndefined(param.Reference[i])){
						listOfAddress.push({"parentOid":userOid});
					}else{
						param.Reference[i].parentOid = userOid;
						listOfAddress.push(param.Reference[i]);
					}
				}
				param.Reference = listOfAddress;
			}else{
				for(var i=0;i<param.Reference.length;i++){
					delete param.Reference[i].updatedBy;
					delete param.Reference[i].createdOn;
					delete param.Reference[i].createdBy;
					delete param.Reference[i].updatedOn;
					delete param.Reference[i].deleteAction;
					delete param.Reference[i].updateAction;
				}
				delete param.contentType;
				delete param.Status;
			}
		}
		delete param.reference1;
		delete param.userOid;
		return param;
	};
	$scope.referencesEditInfo = function (param) {
		$scope.saveReferencesSubmitError = {};
		if (param.data.status == 'success') {
			if(!$rootScope.isFromManageReps)	{
				$state.go('myProfile.referencesView',{reload : true});
			}
			else if($rootScope.isFromManageReps){
				$state.go('manage.repAccountDetails.manageRepProfile.referencesView',{reload : true});
			}
		}else{
			$scope.saveReferencesSubmitError = param.data;
		}
	};
	$scope.companyGeographicSalesInfo = function () {
		if(!$rootScope.isFromManageReps)	{
			$state.go('companyProfile.viewGeographicSalesCapability',{reload : true});
		}
		else if($rootScope.isFromManageReps){
			$state.go('manage.repAccountDetails.companyProfile.viewGeographicSalesCapability',{reload : true});
		}
	};
	$scope.getGeoSalesTerritoriesaParam = function(){
		var param = {};
		if($state.current.name === 'companyProfile.viewGeographicSalesCapability' || 
			$state.current.name === 'companyProfile.editGeographicSalesCapability' ||
			$state.current.name === 'manage.repAccountDetails.companyProfile.viewGeographicSalesCapability' ||
			$state.current.name === 'manage.repAccountDetails.companyProfile.editGeographicSalesCapability'){
			param.parentOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorDetailOid :$scope.userProfile.detail.vendorDetailOid;
			param.vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
		}else if($state.current.name === 'myProfile.salesTerritoryView' || 
			$state.current.name === 'myProfile.salesTerritoryEdit' || 
			$state.current.name === 'manage.repAccountDetails.manageRepProfile.salesTerritoryView' || 
			$state.current.name === 'manage.repAccountDetails.manageRepProfile.salesTerritoryEdit'){
			param.parentOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
		}
		return param
	};
	//post call saveSalesTerritories
	$scope.saveSalesTerritories = function(countyList, stateList,redirect,isFrom) {
		var countryCodeList = countyList;
		var stateCodeList = stateList;
		var stateCode = '',parentOid = '', countryCode = '';
		for (var i = 0; i < (countryCodeList.length); i++) {
			if (i === 0) {
				countryCode = countryCodeList[i].countryCode;
			} else {
				countryCode = countryCode + "," + countryCodeList[i].countryCode;
			}
		}
		for (var j = 0; j < (stateCodeList.length); j++) {
			if (j === 0) {
				stateCode = stateCodeList[j].stateCode;
			} else {
				stateCode = stateCode + "," + stateCodeList[j].stateCode;
			}
		}
		var postParam = {"countryCodes": countryCode,"stateCodes": stateCode};
		if(isFrom === 'myProfile'){
			postParam.parentOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
		}else if (isFrom === 'companyProfile'){
			postParam.parentOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorDetailOid : $scope.userProfile.detail.vendorDetailOid;
		}
		
		$scope.responseError = false;
		var salesAndTerritoryEditForm = document.getElementById("salesAndTerritoryEdit");
		var geoSalesEditForm = document.getElementById("geoSalesEdit");
		if(isFrom === 'myProfile'){
			disableAll(salesAndTerritoryEditForm);
		}else if(isFrom === 'companyProfile'){
			disableAll(geoSalesEditForm);
		}
		myProfileServices.saveSalesTerritories(postParam).then(function(result) {
			if(isFrom === 'myProfile'){
				enableAll(salesAndTerritoryEditForm);
			}else if(isFrom === 'companyProfile'){
				enableAll(geoSalesEditForm);
			}
			$scope.saveSalesTerritoriesSubmitError ={};
			if (result.data.status !== 'success') {
				$scope.responseError = true;
				$scope.saveSalesTerritoriesSubmitError = result.data;
			} else if (result.data && result.data.status === 'success') {
				if(isFrom === 'myProfile'){
					if(!$rootScope.isFromManageReps)	{
						$state.go('myProfile.salesTerritoryView');
					} else {
						$state.go('manage.repAccountDetails.manageRepProfile.salesTerritoryView');
					}
				}
				if(isFrom === 'companyProfile'){
					if(!$rootScope.isFromManageReps)	{
						$state.go('companyProfile.viewGeographicSalesCapability',{reload : true});
					} else{
						$state.go('manage.repAccountDetails.companyProfile.viewGeographicSalesCapability');
					}
				}
			}
		});
	};

	$scope.formateDobString = function(param){
		if(param.status === 'success'){
			if(param.successData.User.dob){
				var dob = angular.copy(param.successData.User.dob);
				dob = new Date((dob).split("-").join("/"));
				if(dob != 'Invalid Date' && dob!= ''){
					param.successData.User.dob = $filter('date')(dob, 'MM/dd/yyyy');
				}	
			}
		}
		return param;
	};

	$templateCache.put('dlpanel.html',
			'<div class="col-sm-5 vision-padding-0">'+
			'	<label for="{{lpanel.label}}">{{lpanel.label}}</label>'+
			'   <span ng-if="lpanel.tooltipText" tooltip-html-unsafe="{{lpanel.tooltipText}}" tooltip-class="vision-multiselect-tooltip" tooltip-placement="{{lpanel.tooltipPlacement}}"><i class="fa fa-question-circle"></i></span>'+
			'	<select tabindex="5000" class="form-control {{lpanel.className}}" style="width:100%;" size="{{lpanel.size}}" id="{{lpanel.id}}" ng-model="lpanel.selectedData" name="{{lpanel.id}}" multiple="multiple">'+
			'		<option ng-repeat="item in lpanel.data | orderBy: lpanel.orderBy" value="{{item[lpanel.value]}}">{{item[rpanel.value]}} - {{item[lpanel.text]}}</option>'+
			'	</select>'+
			'</div>'
	);
	$templateCache.put('drpanel.html',
			'<div class="col-sm-5 vision-padding-0">'+
			'	<label for="{{rpanel.label}}">{{rpanel.label}}</label>'+
			'   <span ng-if="rpanel.tooltipText" tooltip-html-unsafe="{{rpanel.tooltipText}}" tooltip-class="vision-multiselect-tooltip" tooltip-placement="{{rpanel.tooltipPlacement}}"><i class="fa fa-question-circle"></i></span>'+
			'	<select tabindex="5005" class="form-control {{rpanel.className}}" size="{{rpanel.size}}" id="{{rpanel.id}}" ng-model="rpanel.selectedData"  multiple="multiple">'+
			'		<option ng-repeat="item in (rpanel.data | orderBy: rpanel.orderBy | sortBaseFieldWithOption:\'disabledData\')"  ng-disabled="{{item[\'disabledData\']==true}}" value="{{item[rpanel.value]}}">{{item[rpanel.value]}} - {{item[rpanel.text]}}</option>'+
			'	</select>'+
			'</div>'
	);
	$scope.updateUserDetails = function(firstName, lastName, phone){
		if(!$rootScope.isFromManageReps){
			$rootScope.userProfile.firstName = firstName;
			$rootScope.userProfile.lastName = lastName;
			$rootScope.userProfile.name = firstName+' '+lastName;
			$rootScope.userProfile.detail.phone = phone;
			//$cookieStore = $injector.get('$cookieStore');
			$cookieStore.remove('userProfile');
			$cookieStore.put('userProfile',JSON.stringify($rootScope.userProfile));
			/*appCon.cookie.removeItem('userProfile');
			appCon.cookie.setItem('userProfile', JSON.stringify($rootScope.userProfile));*/
		}
	};

	//google analytics page track
	$scope.callGAPageTrack = function(pageName){
		Analytics.trackPage("/"+$rootScope.path+"/"+pageName+"/");
	};
}]);