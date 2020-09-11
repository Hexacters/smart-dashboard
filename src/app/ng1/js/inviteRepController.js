'use strict';
angular.module(appCon.appName).controller('inviteRepController', ['$scope', '$window', '$state', '$modal', '$rootScope', '$injector','ngTableParams','Analytics','$sce', function($scope, $window, $state, $modal, $rootScope, $injector, ngTableParams,Analytics, $sce) {
	var checkOpenParam = '',
		eligibilityDetails = '';

	var manageRepsServices = $injector.get("manageRepsServices");
	manageRepsServices.getAssociatedCompanies().then(function(result){
		if(result.data && result.data.status==='success'){
			$scope.allFeinList = result.data.successData.AssociatedCompanyList;
		}else{
			$scope.allFeinList = [];
		}
	});
	$scope.vrepAccountType = 'vrepOneToMany';
	$scope.showInviteRep = false;
	$scope.showAddListBtn = true;
	$scope.maxRepSelected = false;
	$scope.inviteRepOverlay = false;
	var overLayDivId = document.getElementById('overLayDivId');
	$scope.disableSendInvitation = false;
	$scope.invitationStatus;
	$scope.selectedAccountId=[];
	$scope.showAddtoListBtn = function() {
		if ($scope.selectedAccountId[0]) {
			$scope.showAddListBtn = false;
		}
	};
	$scope.maximumSelectedError = {};
	$scope.showAddtoListBtnMany2One = function(rep, account) {
		if (rep && account[0]) {
			$scope.maxRepSelected = false;
			$scope.showAddListBtn = false;
		}
	};
	$scope.showAddRepForm = false;
	$scope.showAddForm = function(value){
		$scope.checkBoxValid = false;
		$scope.radioButtonValid = false;
		checkedOneToManyAccounts = [];
		$scope.addNewRepInvalid = false;
		checkedOneToManyCustomerOid = [];
		checkedOneToManycompanyName = [];
		$scope.oneToManySelectedUserOid = '';
		$scope.reloadOneToMany();
		$scope.showAddRepForm = value;
		if(value){
			$scope.addNewRepRandom = Math.random();
		}
	};
	$scope.enableValidateButton = true;
	$scope.getGlobalProfileForRegistration = function(newRepEmail){
		var eventObject = {
			"category"	: "SHOPPING_CART",
			"action"		: "INVITE_REP",
			"label"		: "email:"+ $rootScope.userProfile.detail.userName+"#userOid:"+ $rootScope.userProfile.id +"#fein:" + $rootScope.userProfile.detail.fein+"#inviteRepEmail:"+newRepEmail+"#isFrom:getGlobalProfile",
			"value"		: 1
		};
		var param = {"fein":$rootScope.userProfile.detail.fein};
		manageRepsServices.getGlobalProfileForRegistration(param).then(function(result){
			$scope.enableValidateButton = true;
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
					eventObject.label += "#registeredVrepCount:"+ result.data.successData.registeredVrepCount+"#maxRepCount:"+result.data.successData.maxRepCount+"#allowRepRegistration:"+result.data.successData.allowRepRegistration;
					if((updatedVrepCount + result.data.successData.maxRepCount) > parseInt(appCon.globalCon.openAccessPlan.maxRepCount) || 
						((($scope.getNewlyAddedRep()).length + result.data.successData.registeredVrepCount) == parseInt(appCon.globalCon.openAccessPlan.maxRepCount))){
						//User is not allowed for RepRegistration.
						var errorMessage = "You have exceeded the maximum number of representatives under this corporate plan. Please contact support for assistance.";
						eventObject.value = 0;
						eventObject.label += "#errorMessage:"+errorMessage;
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						$scope.addNewRepInvalid = {"notAllowRepRegistration":true,"errorMessage": errorMessage};
					}else{
						$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						//isNewRep - used to Calculate newly added user count for OA payment.
						$scope.oneToManyAddToList['isNewRep'] = true;
						$scope.addToInviteList();
					}
				}else if(angular.isDefined(result.data.successData.errorMessage)){
					//User is not allowed for RepRegistration.
					eventObject.value = 0;
					eventObject.label += "#errorMessage:"+ result.data.successData.errorMessage;
					$rootScope.$emit("callAnalyticsEventTrack", eventObject);
					$scope.addNewRepInvalid = {"notAllowRepRegistration":true,"errorMessage": result.data.successData.errorMessage};
				}else{
					$scope.addToInviteList();
				}
			}else{
				eventObject.value = 0;
				eventObject.label += "#errorMessage:"+ result.data.errorData.ResponseError[0].longMessage;
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
				$scope.addNewRepInvalid = {"error":true,"data":result.data};
			}
		});
	};
	
	$scope.addToInviteList = function(){
		//User is not exit (or) User registered with given vendor company.
		$scope.inviteSelectedReps();
		$scope.addNewRepRandom = Math.random()
		$scope.showAddRepForm = true;
	}

	$scope.validateAddNewRep = function(value){
		$scope.enableValidateButton = false;
		appCon.data.globalProfileForRegistration = [];
		$scope.oneToManyAddToList["firstName"] = value.firstname;
		$scope.oneToManyAddToList["lastName"] = value.lastname;
		$scope.oneToManyAddToList["userId"] = angular.lowercase(value.email);
		$scope.oneToManyAddToList["workPhone"] = value.workPhone;
		$scope.oneToManyAddToList['vendorOid'] = $scope.feinId;
		//isNewRep - used to Calculate newly added user count for OA payment.
		$scope.oneToManyAddToList['isNewRep'] = false;
		$scope.oneToManyAddToList['checked'] = true;
		$scope.addNewRepInvalid = false;
		var param = {"vendorOid":$scope.feinId,"userId":value.email};
		manageRepsServices.validateVendorRep(param).then(function(result){
			if(result.data && result.data.status==='success'){
				var checkVendor = result.data.successData;
				if(checkVendor.errorMessage && checkVendor.errorMessage == 'DELETED_USER_ERROR_5183'){
					$scope.addNewRepInvalid = {"deletedUser":true};
					$scope.enableValidateButton = true;
				}else if(checkVendor.isExist=='false' || checkVendor.isInActiveUser=='true' || (checkVendor.isExist=='true'&& checkVendor.isAssoWithVendor=='true') ){
					if(checkVendor.isExist=='false'){
						$scope.getGlobalProfileForRegistration(angular.lowercase(value.email));
					}else{
						$scope.enableValidateButton = true;
						$scope.addToInviteList();
					}
				}else if(checkVendor.isExist=='true' && checkVendor.isAssoWithVendor=='false'){
					$scope.enableValidateButton = true;
					if(checkVendor.actorType=='VREP' && checkVendor.vendorName){
						//User is already registered with another vendor company.
						$scope.addNewRepInvalid = {"anotherVendorCompany":true,"vendorName":checkVendor.vendorName};
					}else{
						//User is already registered with another role. not a rep
						$scope.addNewRepInvalid = {"notRep":true,"description":checkVendor.actorDescription};
					}
				}
			}else{
				$scope.enableValidateButton = true;
				$scope.addNewRepInvalid = {"error":true,"data":result.data};
			}
		});
	};
	
	$scope.divOverlayInviteRep = function() {
		$scope.showClearBtn = true;
		$scope.inviteRepOverlay = true;
		disableAll(overLayDivId);
	};
	$scope.clearInviteReps = function() {
		$scope.inviteRepOverlay = false;
		enableAll(overLayDivId);
		$scope.showClearBtn = false;
		$scope.showInviteRep = false;
		$scope.selectedInviteReps = [];
		$state.go('manage.inviteReps', {
			'inviteAct': 'vrepOneToMany'
		}, {
			reload: true
		});
	};
	$scope.reloadOneToMany = function () {
		oneToManySearchField = 'firstName,lastName,userId';
		oneToManySearchString = '';
		oneToManySearchState = '';
		$scope.showAddRepForm = false;
		$scope.randomOneToMany =   Math.random();
		oneToManyAccountsGridPrevParams = {};
		$scope['oneToManyAccountsGrid'].$params.page = 1;
		$scope['oneToManyAccountsGrid'].reload();
		oneToManyRepsGridPrevParams = {};
		$scope['oneToManyRepsGrid'].$params.page = 1;
		$scope['oneToManyRepsGrid'].reload();
		$scope.oneToManySearchAccountsValidateError = false;
		$scope.oneToManySearchRepValidateError = false;
		$scope.selectedAccountsCount = 0;
	};
	$scope.reloadManyToOne = function () {
		ManyToOneSearchField = 'firstName,lastName,userId';
		manyToOneSearchString = '';
		manyToOneSearchState = '';
		$scope.randomManyToOne =   Math.random();
		manyToOneRepsGridPrevParams = {};
		$scope['manytToOneRepsGrid'].$params.page = 1;
		$scope['manytToOneRepsGrid'].reload();
		manyToOneAccountsGridPrevParams = {};
		$scope['manytToOneAccountsGrid'].$params.page = 1;
		$scope['manytToOneAccountsGrid'].reload();
		$scope.manyToOneSearchAccountsValidateError = false;
		$scope.manyToOneSearchRepValidateError = false;
	};

	$scope.feinId = $scope.userProfile.detail.vendorOid;
	$scope.changeFein = function (vendorOid){
		$scope.feinId  = vendorOid;
		$scope.oneToManyAddToList = {};
		if($scope.vrepAccountType === 'vrepOneToMany'){
			checkedOneToManyCustomerOid = [];
			checkedOneToManycompanyName = [];
			$scope.oneToManySelectedUserOid = '';
			$scope.selectedOneToMany('default','');
			$scope.reloadOneToMany();
		}else{
			$scope.vrepAccountType = 'vrepOneToMany';
			$scope.selectedManyToOne('default','');
		}
		$scope.userSelectedList = [];
		waitingForInviteArray = [];
		$scope.checkBoxValid = false;
		$scope.radioButtonValid = false;
		$scope.showSelectedGrid = false;
		$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
	};
	
	var checkedOneToManyAccounts = [];
	var checkedOneToManyCustomerOid = [];
	var checkedOneToManycompanyName = [];
	$scope.checkBoxValid = false;
	$scope.radioButtonValid = false;
	$scope.oneToManyCheckedValue = function(checked,object){
		if(checked === true){
			checkedOneToManyAccounts.push({customerOid:object.customerOid,companyName:object.companyName});
			checkedOneToManyCustomerOid.push(object.customerOid);
			checkedOneToManycompanyName.push(object.companyName);
		}else{
			var preChecked = [];
			for(var j = 0 ;j < checkedOneToManyAccounts.length ;j++ ){
				if(checkedOneToManyAccounts[j].customerOid !== object.customerOid){
					preChecked.push(checkedOneToManyAccounts[j]);
				}
			}
			checkedOneToManyCustomerOid.splice(checkedOneToManyCustomerOid.indexOf(object.customerOid), 1);
			checkedOneToManycompanyName.splice(checkedOneToManycompanyName.indexOf(object.companyName), 1);
			
			checkedOneToManyAccounts = preChecked;
		}
		$scope.oneToManyAddToList['customerOids'] = checkedOneToManyCustomerOid;
		$scope.oneToManyAddToList['customerOidsString'] = checkedOneToManyCustomerOid.toString();
		$scope.oneToManyAddToList['companyName'] = checkedOneToManycompanyName;
		$scope.oneToManyAddToList['companyNameString'] = checkedOneToManycompanyName.toString();
		$scope.checkBoxValid = checkedOneToManyAccounts.length === 0 ? false : true;
		$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
	};
	
	$scope.selectedOneToMany = function(isFrom,object){
		$scope.oneRepToMany = {"vendorOid":$scope.feinId ,"searchMode":"vendor","getAllRecordsByVendorOid":"true","serviceFilterType":"REGISTERED"};
		if(isFrom === 'default'){
			$scope.oneToManyAddToList = {};
			$scope.oneRepToMany["getAllRecordsByUserOid"] ="false";
			$scope.radioButtonValid = false;
			$scope.checkBoxValid = false;
		}else if(isFrom === 'repsGrid' && object.oid !== ''){
			if(angular.isDefined($scope.userSelectedList)){
				var selectedAccounts = angular.copy($scope.userSelectedList);
				var userIndex = selectedAccounts.length !== '' ? 
					_.findIndex(selectedAccounts , function(o){return o.userId == object.userId;}) : -1;
				$scope.selectedAccountsCount = userIndex !== -1 ? (selectedAccounts[userIndex].customerOids).length : 0;
			}
			$scope.oneToManyAddToList["firstName"] = object.firstName;
			$scope.oneToManyAddToList["lastName"] = object.lastName;
			$scope.oneToManyAddToList["userId"] = object.userId;
			$scope.oneToManyAddToList['vendorOid'] = $scope.feinId;
			$scope.oneToManyAddToList['checked'] = true;
			$scope.radioButtonValid = true;
			$scope.checkBoxValid = false;
			$scope.oneToManySelectedUserOid = object.oid;
			
			$scope.oneRepToMany["getAllRecordsByUserOid"] = "true";
			$scope.oneRepToMany["serviceFilterType"] = "UN_REGISTERED";
			$scope.oneRepToMany["userOid"] = object.oid;
			oneToManyAccountsGridPrevParams = {};
			$scope['oneToManyAccountsGrid'].$params.page = 1;
			$scope['oneToManyAccountsGrid'].reload();
		}
		checkedOneToManyAccounts = [];
		checkedOneToManyCustomerOid = [];
		checkedOneToManycompanyName = [];
		$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
	};
	$scope.selectedOneToMany('default','');
	
	var oneToManySearchField = 'firstName,lastName,userId';
	var oneToManySearchString = '';
	$scope.searchOneToManyReps = function(searchString,searchType,isFrom){
		if(searchString.length >= 3  || ( searchString.length >= 3  && oneToManySearchField !== searchType ) || ( isFrom === 'string' && searchString.length === 0) ){
			oneToManySearchString = searchString.length >= 3 ? searchString : '';
			var validString = searchString.length === 0 ? [] :searchString.match(/[{}\[\]<>]/);
			if(validString != null && validString.length > 0){
				$scope.oneToManySearchRepValidateError = true;
			}else{
				$scope.oneToManySearchRepValidateError = false;
				oneToManySearchField = searchType;
				$scope.reloadOneToManySearchRep();
			}
		}
	};
	
	$scope.reloadOneToManySearchRep = function(){
		$scope.oneToManySelectedUserOid = '';
		checkedOneToManyCustomerOid = [];
		checkedOneToManycompanyName = [];
		$scope.radioButtonValid = false;
		$scope.checkBoxValid = false;
		oneToManyRepsGridPrevParams = {};
		$scope['oneToManyRepsGrid'].$params.page = 1;
		$scope['oneToManyRepsGrid'].reload();
	};
	
	var oneToManyRepsGridPrevParams;
	$scope.oneToManyRepsGrid = new ngTableParams(
		{ page: 1,total: 1,count: 5,sorting: {"firstName":"asc"},filter: {},type: 'server'},{
		getData: function($defer, params) {
		
			if (!angular.equals(JSON.stringify($scope.oneToManyRepsGrid.$params), oneToManyRepsGridPrevParams)){
				var serviceParam={'startIndex' : (params.page() - 1) * params.count(),'results' : params.count(),"pagination":true,"vendorOid":$scope.feinId,"searchFields":oneToManySearchField,"searchType":"Exact","getAllRecordsByUserOid":false,"getAllRecordsByVendorOid":true, "searchString":oneToManySearchString};
				/*Set sort field to request param */
				angular.forEach(params.$params.sorting, function(value, key) {
					serviceParam.sort = key;
					serviceParam.dir = value;
				});
				
				$scope.loadingOneToManyReps = true;
				$injector.get('manageRepsServices')['searchVendorReps'](serviceParam).then(
					function(result) {
						if (result.data.status === 'success') {
								result.data = esGridMaxPaginationCount(result.data, 'totalRecords');
								$scope.data = result.data;
							params.total(result.data.successData.totalRecords);
							$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
							for(var j = 0 ;j < result.data.successData.VendorsRepList.length ;j++ ){
								if(result.data.successData.VendorsRepList[j].oid === $scope.oneToManySelectedUserOid){
									result.data.successData.VendorsRepList[j].checked = true;
								}else{
									result.data.successData.VendorsRepList[j].checked = false;
								}
							}
							$defer.resolve(result.data.successData.VendorsRepList);
						} else {
							params.total(0); // hide pagination if no results found
							$defer.resolve(result.data);
						}
						$scope.loadingOneToManyReps = false;
					},
					function(error) {
						$scope.loadingOneToManyReps = false;
						$defer.resolve(error);
					}
				)
			oneToManyRepsGridPrevParams = JSON.stringify($scope.oneToManyRepsGrid.$params);
			}
		}
	});
	
	var oneToManySearchState = '',oneToManySearchType = 'STATE_SEARCH';
	$scope.searchOneToManyAccounts = function(requestType,word,state){
		if(requestType==='state'){
			oneToManySearchState = state;
			oneToManySearchType = 'STATE_SEARCH';
			$scope.reloadOneToManySearchAccount();
		}else if(requestType==='key' && (word.length === 0 || word.length >= 3)){
				oneToManySearchType = 'KEYWORD_SEARCH';
				var validString = word.length === 0 ? [] :word.match(/[{}\[\]<>]/);
				if(validString != null && validString.length > 0){
					$scope.checkBoxValid = false;
					$scope.oneToManySearchAccountsValidateError = true;
				}else{
					$scope.oneToManySearchAccountsValidateError = false;
					oneToManySearchState = word;
					$scope.reloadOneToManySearchAccount();
				}
		}
	};
	
	$scope.reloadOneToManySearchAccount = function(){
		checkedOneToManyCustomerOid = [];
		checkedOneToManycompanyName = [];
		$scope.checkBoxValid = false;
		oneToManyAccountsGridPrevParams = {};
		$scope['oneToManyAccountsGrid'].$params.page = 1;
		$scope['oneToManyAccountsGrid'].reload();
	};
	var oneToManyAccountsGridPrevParams;
	$scope.oneToManyAccountsGrid = new ngTableParams(
		{ page: 1,total: 1,count: 5,sorting: {"companyName":"asc"},filter: {},type: 'server'},{
		getData: function($defer, params) {			
			if (!angular.equals(JSON.stringify($scope.oneToManyAccountsGrid.$params), oneToManyAccountsGridPrevParams)){
				var serviceParams= $scope.oneRepToMany;
				serviceParams["searchString"]=oneToManySearchState;
				serviceParams["startIndex"] = (params.page() - 1) * params.count();
				serviceParams["results"] = params.count();
				serviceParams["pagination"]=true;
				serviceParams["searchType"]=oneToManySearchType;
				/*Set sort field to request param */
				angular.forEach(params.$params.sorting, function(value, key) {
					serviceParams.sort = key;
					serviceParams.dir = value;
				});
				
				$scope.loadingOneToManyAccounts = true;
				$injector.get('manageRepsServices')['getVendorAssociatedAccounts'](serviceParams).then(
					function(result) {
						if (result.data.status === 'success') {
							$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
							params.total(result.data.successData.totalRecords);
							for(var j = 0 ;j < result.data.successData.CustomerList.length ;j++ ){
								if((checkedOneToManyCustomerOid &&  checkedOneToManyCustomerOid.indexOf(result.data.successData.CustomerList[j].customerOid) != -1)){
									result.data.successData.CustomerList[j].checked = true;
								}else{
									result.data.successData.CustomerList[j].checked = false;
								}
							}
							$defer.resolve(result.data.successData.CustomerList);
						} else {
							params.total(0); // hide pagination if no results found
							$defer.resolve(result.data);
						}
						$scope.loadingOneToManyAccounts = false;
					},
					function(error) {
						$scope.loadingOneToManyAccounts = false;
						$defer.resolve(error);
					}
				)
				oneToManyAccountsGridPrevParams = JSON.stringify($scope.oneToManyAccountsGrid.$params);
			}
		}
	});
	
	var manyToOneSearchState = '',manyToOneSearchType = 'STATE_SEARCH';
	$scope.searchManyToOneAccounts = function(requestType,word,state){
		if(requestType==='state'){
			manyToOneSearchState = state;
			manyToOneSearchType = 'STATE_SEARCH';
			$scope.reloadManyToOneSearchAccount();
		}else if(requestType==='key' && (word.length === 0 || word.length >= 3)){
			manyToOneSearchType = 'KEYWORD_SEARCH';
			var validString = word.length === 0 ? [] : word.match(/[{}\[\]<>]/);
			if(validString != null && validString.length > 0){
				$scope.manyToOneSearchAccountsValidateError = true;
			}else{
				$scope.manyToOneSearchAccountsValidateError = false;
				manyToOneSearchState = word;
				$scope.reloadManyToOneSearchAccount();
			}
		}
	};
	
	$scope.reloadManyToOneSearchAccount = function(){
		$scope.manyToOneSelectedCustomerOid = '';
		$scope.radioButtonValid = false;
		$scope.checkBoxValid = false;
		manyToOneAccountsGridPrevParams = {};
		$scope['manytToOneAccountsGrid'].$params.page = 1;
		$scope['manytToOneAccountsGrid'].reload();
	};
	
	var manyToOneAccountsGridPrevParams;
	$scope.manytToOneAccountsGrid = new ngTableParams(
		{ page: 1,total: 1,count: 5,sorting: {"companyName":"asc"},filter: {},type: 'server'},{
		getData: function($defer, params) {
			if (!angular.equals(JSON.stringify($scope.manytToOneAccountsGrid.$params), manyToOneAccountsGridPrevParams)){
				var serviceParams={'startIndex' : (params.page() - 1) * params.count(),'results' : params.count(),"pagination":true,"vendorOid":$scope.feinId,"searchMode":"vendor","getAllRecordsByUserOid":"false","getAllRecordsByVendorOid":"true", "searchString":manyToOneSearchState,"serviceFilterType":"REGISTERED","searchType":manyToOneSearchType}; 
				
				/*Set sort field to request param */
				angular.forEach(params.$params.sorting, function(value, key) {
					serviceParams.sort = key;
					serviceParams.dir = value;
				});
				
				$scope.loadingManyToOneAccounts = true;
				$injector.get('manageRepsServices')['getVendorAssociatedAccounts'](serviceParams).then(
					function(result) {
						if (result.data.status === 'success') {
							$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
							params.total(result.data.successData.totalRecords);
							for(var j = 0 ;j < result.data.successData.CustomerList.length ;j++ ){
								if(result.data.successData.CustomerList[j].customerOid === $scope.manyToOneSelectedCustomerOid){
									result.data.successData.CustomerList[j].checked = true;
								}else{
									result.data.successData.CustomerList[j].checked = false;
								}
							}
							$defer.resolve(result.data.successData.CustomerList);
						} else {
							params.total(0); // hide pagination if no results found
							$defer.resolve(result.data);
						}
						$scope.loadingManyToOneAccounts = false;
					},
					function(error) {
						$scope.loadingManyToOneAccounts = false;
						$defer.resolve(error);
					}
				)
				manyToOneAccountsGridPrevParams = JSON.stringify($scope.manytToOneAccountsGrid.$params);
			}
		}
	});
	
	var ManyToOneSearchField = 'firstName,lastName,userId';
	var manyToOneSearchString = '';
	$scope.searchManyToOneReps = function(searchString,searchType,isFrom){
		if(searchString.length >= 3  || ( searchString.length >= 3  && ManyToOneSearchField !== searchType ) || ( isFrom === 'string' && searchString.length === 0) ){
			manyToOneSearchString = searchString.length >= 3 ? searchString : '';
			var validString = manyToOneSearchString.length === 0 ? [] : manyToOneSearchString.match(/[{}\[\]<>]/);
			if(validString != null && validString.length > 0){
				$scope.manyToOneSearchRepValidateError = true;
				$scope.checkBoxValid = false;
			}else{
				$scope.manyToOneSearchRepValidateError = false;
				ManyToOneSearchField = searchType;
				$scope.reloadManyToOneSearchRep();
			}
		}
	};
	
	$scope.reloadManyToOneSearchRep = function(){
		checkedManyToOneCustomerOid = [];
		$scope.checkBoxValid = false;
		manyToOneRepsGridPrevParams = {};
		$scope['manytToOneRepsGrid'].$params.page = 1;
		$scope['manytToOneRepsGrid'].reload();
	};
	
	var manyToOneRepsGridPrevParams;
	$scope.manytToOneRepsGrid = new ngTableParams(
		{ page: 1,total: 1,count: 5,sorting: {"firstName":"asc"},filter: {},type: 'server'},{
		getData: function($defer, params) {
			if (!angular.equals(JSON.stringify($scope.manytToOneRepsGrid.$params), manyToOneRepsGridPrevParams)){
				var serviceParams= $scope.manyRepToOne;
				serviceParams["searchFields"] = ManyToOneSearchField;
				serviceParams["searchString"] = manyToOneSearchString;
				serviceParams["startIndex"] = (params.page() - 1) * params.count();
				serviceParams["results"] = params.count();
				serviceParams["pagination"]=true;
				
				/*Set sort field to request param */
				angular.forEach(params.$params.sorting, function(value, key) {
					serviceParams.sort = key;
					serviceParams.dir = value;
				});
				
				$scope.loadingManyToOneReps = true;
				$injector.get('manageRepsServices')['searchVendorReps'](serviceParams).then(
					function(result) {
						if (result.data.status === 'success') {
								result.data = esGridMaxPaginationCount(result.data, 'totalRecords');
								$scope.data = result.data;
							$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
							params.total(result.data.successData.totalRecords);
							$defer.resolve(result.data.successData.VendorsRepList);
							for(var j = 0 ;j < result.data.successData.VendorsRepList.length ;j++ ){
								if((checkedManyToOneCustomerOid &&  checkedManyToOneCustomerOid.indexOf(result.data.successData.VendorsRepList[j].oid) != -1))
								{
									result.data.successData.VendorsRepList[j].checked = true;
								}else{
									result.data.successData.VendorsRepList[j].checked = false;
								}
							}
						} else {
							params.total(0); // hide pagination if no results found
							$defer.resolve(result.data);
						}
						$scope.loadingManyToOneReps = false;
					},
					function(error) {
						$scope.loadingManyToOneReps = false;
						$defer.resolve(error);
					}
				)
				manyToOneRepsGridPrevParams = JSON.stringify($scope.manytToOneRepsGrid.$params);
			}
		}
	});
	var checkedManyToOneAccounts = [];
	var checkedManyToOneCustomerOid = [];
	$scope.manyToOneAddToList = {};
	$scope.manyToOneCheckedValue = function(checked,object){
		if(checked === true){
			checkedManyToOneAccounts.push({oid:object.oid,firstName:object.firstName});
			checkedManyToOneCustomerOid.push(object.oid);
			var pushedValue = {"firstName":object.firstName,"lastName":object.lastName,"userId":object.userId,"vendorOid":$scope.feinId,"checked":true,"customerOids":[],"companyName":[]};
			if(angular.isDefined($scope.manyToOneAddToList['customerOid'])){
				pushedValue['customerOids'].push($scope.manyToOneAddToList['customerOid']);
				pushedValue['customerOidsString'] = $scope.manyToOneAddToList['customerOid'];
			}
			if(angular.isDefined($scope.manyToOneAddToList['companyName'])){
				pushedValue['companyName'].push($scope.manyToOneAddToList['companyName']);
				pushedValue['companyNameString'] = $scope.manyToOneAddToList['companyName'];
			}
			$scope.manyToOneAddToList['selecteReps'].push(pushedValue);
			$scope.manyToOneAddToList['selecteUserIds'].push(object.userId);
		}else{
			var preChecked = [];
			var removedValue = _.findIndex($scope.manyToOneAddToList['selecteReps'], function(o) { return o.userId == object.userId;});
			if(removedValue !== -1){
				$scope.manyToOneAddToList['selecteReps'].splice(removedValue,1);
				$scope.manyToOneAddToList['selecteUserIds'].splice(removedValue,1);
			}
			for(var j = 0 ;j < checkedManyToOneAccounts.length ;j++ ){
				if(checkedManyToOneAccounts[j].oid !== object.oid){
					preChecked.push(checkedManyToOneAccounts[j]);
				}
			}
			checkedManyToOneCustomerOid.splice(checkedManyToOneCustomerOid.indexOf(object.oid), 1);
			checkedManyToOneAccounts = preChecked;
		}
		$scope.checkBoxValid = checkedManyToOneAccounts.length === 0 ? false : true;
		$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
	};
	
	$scope.SelectedManyToOne = function(isFrom,customerOid,companyName){
		$scope.manyRepToOne = {"vendorOid":$scope.feinId,"searchType":"Exact","getAllRecordsByUserOid":"false"};
		if(isFrom === 'default'){
			$scope.radioButtonValid = false;
			$scope.checkBoxValid = false;
			$scope.manyToOneAddToList = {};
			$scope.manyToOneAddToList['selecteReps'] = [];
			$scope.manyToOneAddToList['selecteUserIds'] = [];
			$scope.manyRepToOne["getAllRecordsByVendorOid"] ="true";
		}else if(isFrom === 'accountsGrid' && customerOid !== ''){
			$scope.manyRepToOne["getAllRecordsByVendorOid"] = "false";
			checkedManyToOneAccounts = [];
			checkedManyToOneCustomerOid = [];
			$scope.manyToOneAddToList['customerOid'] = customerOid;
			$scope.manyToOneAddToList['companyName'] = companyName;
			$scope.manyToOneAddToList['selecteReps']= [];
			$scope.manyToOneAddToList['selecteUserIds']	=[];
			$scope.checkBoxValid = false;
			$scope.radioButtonValid = true;
			$scope.manyRepToOne["customerOid"] = customerOid;
			$scope.manyToOneSelectedCustomerOid = 	customerOid;
			manyToOneRepsGridPrevParams = {};
			$scope['manytToOneRepsGrid'].$params.page = 1;
			$scope['manytToOneRepsGrid'].reload();
		}
		$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
	};
	
	$scope.SelectedManyToOne('default','');
		$scope.randomManyToOne =   Math.random();
		$scope.randomOneToMany =   Math.random();
	$scope.changeVrepAccountType = function(param){
		checkedManyToOneAccounts = [];
		checkedManyToOneCustomerOid = [];
		checkedOneToManyAccounts = [];
		checkedOneToManyCustomerOid = [];
		checkedOneToManycompanyName = [];
		$scope.manyToOneSelectedCustomerOid = '';
		$scope.oneToManySelectedUserOid = '';
		if(param === 'vrepOneToMany'){
			$scope.reloadOneToMany();
			$scope.selectedOneToMany('default','');
		}else if(param === 'accountOneToMany'){
			$scope.SelectedManyToOne('default','');
			$scope.reloadManyToOne();
		}
		$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
		$scope.showAddRepForm = false;
	};
	
	$scope.selectRepsGrid = function(selectedRep) {
		$scope.selectedInviteRep = selectedRep;
	};
	
	$scope.showSelectedGrid = false;
	var waitingForInviteArray = [];
	
	$scope.inviteSelectedReps = function() {
		var isFrom = $scope.vrepAccountType,reload;
		if(isFrom === 'vrepOneToMany'){
			if($scope.oneToManyAddToList.customerOids.length > 10){
				$scope.maximumSelectedError = {"error":true,"customerError":true,"usersError":false};
			}else{
				$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
				var getUsersTotal = waitingForInviteArray.length + 1;
				if(getUsersTotal > 10){
					$scope.maximumSelectedError = {"error":true,"customerError":false,"usersError":true};
				}else{
					$scope.checkBoxValid = false;
					$scope.radioButtonValid = false;
					if($scope.oneToManyAddToList !== {} && waitingForInviteArray.length === 0){
						waitingForInviteArray.push($scope.oneToManyAddToList);
						reload = true;
					}else if($scope.oneToManyAddToList !== {} && waitingForInviteArray.length > 0){
						var preSelectedGrid = [],isAlready,waitingCustomer,waitingCompanyName,getCustomerTotal,i,j;
						isAlready = _.findIndex(waitingForInviteArray, function(o) { return o.userId == $scope.oneToManyAddToList.userId;});
						if(isAlready !== -1){
							waitingCustomer = waitingForInviteArray[isAlready].customerOids;
							waitingCompanyName = waitingForInviteArray[isAlready].companyName;
							getCustomerTotal = waitingCustomer.length;
							for(i=0;i < $scope.oneToManyAddToList.customerOids.length;i++){
								if(waitingCustomer.indexOf( $scope.oneToManyAddToList.customerOids[i]) == -1){
									getCustomerTotal ++;
								}
							}
							if(getCustomerTotal > 10){
								$scope.maximumSelectedError = {"error":true,"customerError":true,"usersError":false};
								reload = false;
							}else
							{
								reload = true;
								$scope.maximumSelectedError = {"error":true,"customerError":true,"usersError":true};
								for(j=0;j < $scope.oneToManyAddToList.customerOids.length;j++){
									if(waitingCustomer.indexOf( $scope.oneToManyAddToList.customerOids[j]) == -1){
										waitingCustomer.push($scope.oneToManyAddToList.customerOids[j]);
										waitingCompanyName.push($scope.oneToManyAddToList.companyName[j]);
									}
								}
								// OverWrite the firstName and LastName Based On Rep userId
								waitingForInviteArray[isAlready].firstName = $scope.oneToManyAddToList.firstName;
								waitingForInviteArray[isAlready].lastName = $scope.oneToManyAddToList.lastName;

								waitingForInviteArray[isAlready].customerOids = waitingCustomer;
								waitingForInviteArray[isAlready].companyName = waitingCompanyName;
								waitingForInviteArray[isAlready].customerOidsString = waitingForInviteArray[isAlready].customerOids.toString();
								waitingForInviteArray[isAlready].companyNameString = waitingForInviteArray[isAlready].companyName.toString();
							}
						}else{
							$scope.disableSendInvitation = false; 
							reload = true;
							waitingForInviteArray.push($scope.oneToManyAddToList);
						}
					}
				}
				if(reload === true){
					$scope.checkBoxValid = false;
					$scope.radioButtonValid = false;
					checkedOneToManyCustomerOid = [];
					checkedOneToManycompanyName = [];
					$scope.userSelectedList =  waitingForInviteArray;
					$scope.userSelectedList['totalRecords'] =  waitingForInviteArray.length;
					$scope.oneToManyAddToList = {};
					$scope.showSelectedGrid = true;
					$scope.selectedOneToMany('default','');
					$scope.oneToManySelectedUserOid = '';
					$scope.reloadOneToMany();
					$scope.$$childHead.inviteListGrid.reload();
				}else{
					$scope.checkBoxValid = true;
					$scope.radioButtonValid = true;
				}
			}
		}else if(isFrom === 'accountOneToMany'){
			if($scope.manyToOneAddToList.selecteUserIds.length > 10){
				$scope.maximumSelectedError = {"error":true,"customerError":false,"usersError":true};
			}else{
				$scope.checkBoxValid = false;
				$scope.radioButtonValid = false;
				if($scope.manyToOneAddToList !== {} && waitingForInviteArray.length === 0){
					waitingForInviteArray = $scope.manyToOneAddToList.selecteReps;
					$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
					reload = true;
				}else {
					if($scope.manyToOneAddToList !== {} && waitingForInviteArray.length > 0){
					var getUsersTotal = waitingForInviteArray.length,findUserId,id;
					for(id=0;id <  $scope.manyToOneAddToList.selecteUserIds.length;id++){
						findUserId = _.findIndex(waitingForInviteArray, function(o) { return o.userId == $scope.manyToOneAddToList.selecteUserIds[id];});
						if(findUserId === -1){
						 getUsersTotal++;
						}
					}
					if(getUsersTotal > 10){
						reload = false;
						$scope.maximumSelectedError = {"error":true,"customerError":false,"usersError":true};
					}else{
						var max=0,getMaxCustomersArray = [],k,key,findUserIndex,findCustomerIndex;
						for(key=0;key <  $scope.manyToOneAddToList.selecteUserIds.length;key++){
							findUserIndex = _.findIndex(waitingForInviteArray, function(o) { return o.userId == $scope.manyToOneAddToList.selecteUserIds[key];});
							if(findUserIndex !== -1){
								findCustomerIndex = waitingForInviteArray[findUserIndex].customerOids.indexOf($scope.manyToOneAddToList.customerOid);
								if(findCustomerIndex === -1){
									getMaxCustomersArray.push(waitingForInviteArray[findUserIndex].customerOids.length + 1);
								}
							}
						}
						 for(k=0;k<getMaxCustomersArray.length;k++){
							if(max<getMaxCustomersArray[k])
								max=getMaxCustomersArray[k];
						}
						if(max > 10){
							$scope.maximumSelectedError = {"error":true,"customerError":true,"usersError":false};
							reload = false;
						}else{
							$scope.maximumSelectedError = {"error":false,"customerError":false,"usersError":false};
							reload = true;
							var newPushedArray = [],i,j,findUserIdIndex,findCustomerOidIndex;
							for(i=0;i <  $scope.manyToOneAddToList.selecteUserIds.length;i++){
								findUserIdIndex = _.findIndex(waitingForInviteArray, function(o) { return o.userId == $scope.manyToOneAddToList.selecteUserIds[i];});
								if(findUserIdIndex !== -1){
									findCustomerOidIndex = waitingForInviteArray[findUserIdIndex].customerOids.indexOf($scope.manyToOneAddToList.customerOid);
									// Add New Customer Based on Rep userId
									if(findCustomerOidIndex === -1){
										waitingForInviteArray[findUserIdIndex].customerOids.push($scope.manyToOneAddToList.customerOid);
										waitingForInviteArray[findUserIdIndex].companyName.push($scope.manyToOneAddToList.companyName);
										waitingForInviteArray[findUserIdIndex].customerOidsString = waitingForInviteArray[findUserIdIndex].customerOids.toString();
										waitingForInviteArray[findUserIdIndex].companyNameString = waitingForInviteArray[findUserIdIndex].companyName.toString();
									}
									// OverWrite the firstName and LastName Based On Rep userId
									waitingForInviteArray[findUserIdIndex].firstName = $scope.manyToOneAddToList.selecteReps[i].firstName;
									waitingForInviteArray[findUserIdIndex].lastName = $scope.manyToOneAddToList.selecteReps[i].lastName;
								}else{
									newPushedArray.push($scope.manyToOneAddToList.selecteReps[i]);
								}
							}
							for(j=0;j <  newPushedArray.length;j++){
								waitingForInviteArray.push(newPushedArray[j]);
								}
							}
						}
					}
				}
				if(reload === true){
					$scope.checkBoxValid = false;
					$scope.radioButtonValid = false;
					checkedManyToOneCustomerOid = [];
					$scope.userSelectedList =  waitingForInviteArray;
					$scope.userSelectedList['totalRecords'] =  waitingForInviteArray.length;
					$scope.manyToOneAddToList = {};
					$scope.showSelectedGrid = true;
					$scope.SelectedManyToOne('default','');
					$scope.manyToOneSelectedCustomerOid = '';
					$scope.reloadManyToOne();
					$scope.$$childHead.inviteListGrid.reload();
				}else{
					$scope.checkBoxValid = true;
					$scope.radioButtonValid = true;
				}
			}
		}
	};
	
	$scope.openUnsucceeInvitation = function (object){
		$scope.errorPopupObject = object;
		$modal.open({
			templateUrl : 'views/manageReps/unSucceeInvitation.html?rnd='+appCon.globalCon.deployDate,
			windowClass:'commonDialogW30',
			keyboard: false,
			backdrop: 'static',
			scope : $scope,
			controller: function($scope,$modalInstance) {
				$scope.closeInviteStatusPopup = function(){
					$modalInstance.close();
				};
			}
		});
	};
	
	$scope.inviteeListRepsDetails = function(isChecked,userId){
		var preSelectedValue = $scope.userSelectedList;
		var selectedIndex = _.findIndex(preSelectedValue, function(o) { return o.userId == userId; });
		if(isChecked){
			preSelectedValue[selectedIndex].checked = true;
		}else{
			preSelectedValue[selectedIndex].checked = false;
		}
		var findCheckedIndex = _.findIndex(preSelectedValue, function(o) { return o.checked == true; });
		if(findCheckedIndex === -1){
			$scope.disableSendInvitation = true;
		} else {
			$scope.disableSendInvitation = false; 
		}
		$scope.userSelectedList = preSelectedValue;
	};
	
	$scope.companyNameMorePopup = function(companyName){
		$scope.companyNameGrid = [];
		var templateName = companyName
		angular.forEach(templateName, function (value,key) {
			$scope.companyNameGrid.push({
				'customerName': value
			});
		});
		$scope.companyNameGrid["totalRecords"] = $scope.companyNameGrid.length;
		$modal.open({
				templateUrl : 'views/manageReps/customerNamePopup.html?rnd='+appCon.globalCon.deployDate,
				keyboard: false,
				backdrop: 'static',
				scope : $scope
		});
	};

	$rootScope.showPaymentElement = {
		showIncrementalPayment	: false,
		payment		: {
			summary : false,
			billing : false,
			checkout : false,
			random : Math.random()
		}
	};
	$scope.showClearBtn = false;

	$scope.inviteRepSupplierBlockedMsg = '';
	$scope.validateSupplierBlocked = function(){
		$scope.inviteRepSupplierBlockedMsg = '';
		$injector.get('dashboardServices')['getUserByUserName']().then(function(result) {
			if(result.data && result.data.successData && result.data.successData.Status === 'Ok'){
				$scope.isSupplierBlocked = result.data.successData.detail.isSupplierBlocked;
				if(angular.isDefined($scope.isSupplierBlocked) && $scope.isSupplierBlocked === true){
					$scope.inviteRepSupplierBlockedMsg = result.data.successData.detail.blockedMessage;
				} else {
					$scope.checkOpenAccessPayment();
				}
			} else {
				$scope.checkOpenAccessPayment();
			}
		});
	};

	$scope.checkOpenAccessPayment = function(){
		//Get the newly added user count
		var newlyAddedRepCount = ($scope.getNewlyAddedRep()).length,
			buyUpRepCount = $scope.getBuyUpRepCount();
		newlyAddedRepCount = (buyUpRepCount >= newlyAddedRepCount ) ? 0 : (buyUpRepCount > 0 && newlyAddedRepCount > 0) ? (newlyAddedRepCount - buyUpRepCount) : newlyAddedRepCount;
		$scope.addNewRepInvalid = false;

		if(newlyAddedRepCount === 0){
			$rootScope.showInviteRepElement();
		}else{
			if(angular.isDefined(appCon.data.globalProfileForRegistration) && (newlyAddedRepCount + appCon.data.globalProfileForRegistration.maxRepCount) > parseInt(appCon.globalCon.openAccessPlan.maxRepCount)){
				//User is not allowed for RepRegistration.
				var errorMessage = "You have exceeded the maximum number of representatives under this corporate plan. Please contact support for assistance.";
				$scope.addNewRepInvalid = {"notAllowRepRegistration":true,"errorMessage": errorMessage};
				return;
			}
			$scope.checkItemCatalog(newlyAddedRepCount);
		}
	}

	$scope.checkItemCatalog = function(repCount) {
		$rootScope.orderType = 'Incremental';
		$injector.get('users')['getAllItemCatalog']({
			'orderType': $rootScope.orderType,
			'fein': $rootScope.userProfile.detail.fein
		}).then(function(response) {
			if (response.data && response.data.status === 'success') {
				appCon.data.itemCatalogSummary = response.data.successData.ItemCatalogSummary;
			}
			$scope.showInviteRepOrderSummery(repCount);
		});
	}

	$scope.showInviteRepOrderSummery = function(newlyAddedRepCount) {
		var amountPerRep = ((appCon.data.itemCatalogSummary[appCon.data.itemElgibility.purchasedUserCount - 1].amount) / appCon.data.itemElgibility.purchasedUserCount);
		var pendingDays = getDaysOfPendingOrder($rootScope.serverTime.serverDateTime, appCon.data.itemElgibility.expirationDate);
		// calculate currentOrderAmount for incremental payment
		var orderAmount = parseFloat(((amountPerRep / 365) * pendingDays) * newlyAddedRepCount);
		$rootScope.orderAmount = truncateDecimal(orderAmount);

		$rootScope.repCountInSummaryDesc = newlyAddedRepCount;
		appCon.data.invitedNewRepCount = newlyAddedRepCount;
		var eventObject = {
			'category': 'SHOPPING_CART',
			'action': 'GET_ORDER_DETAILS_INVITEREP',
			'label': 'email:' + $rootScope.userProfile.detail.userName + '#userOid:' + $rootScope.userProfile.id + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorOid:' + $rootScope.userProfile.detail.vendorOid + '#vendorDetailsOid:' + $rootScope.userProfile.detail.vendorDetailOid + '#newlyAddedRepUserId:' + $scope.getNewlyAddedRep().toString() + '#newlyAddedRepCount:' + newlyAddedRepCount + '#amountPerRep:' + amountPerRep + '#pendingDays:' + pendingDays + '#orderAmount:' + $rootScope.orderAmount,
			'value': 1
		};

		angular.forEach(appCon.data.pendingOrderDetails, function(value, key) {
			eventObject.label += '#' + key + ':' + value;
		});
		$rootScope.$emit('callAnalyticsEventTrack', eventObject);
		//Change CancelOrder is false if Renewal order available
		appCon.data.isOrderCancelled = false;
		//Invite Rep OpenAccessPlan navigate to payment page before send invitation
		$rootScope.showPaymentElement.showIncrementalPayment = true;
		$rootScope.showPaymentElement.payment.summary = true;
		$rootScope.showPaymentElement.payment.billing = false;
		$rootScope.showPaymentElement.payment.checkout = false;
	}

	/**
	 * Get BuyUpRep count for Calculate incremental payment.
	 * return - buyUpCount - integer
	 */
	$scope.getBuyUpRepCount = function (){
		var buyUpCount = 0;
		if(angular.isDefined(appCon.data.globalProfileForRegistration) && (appCon.data.globalProfileForRegistration.maxRepCount > appCon.data.globalProfileForRegistration.registeredVrepCount)){
			buyUpCount = (appCon.data.globalProfileForRegistration.maxRepCount - appCon.data.globalProfileForRegistration.registeredVrepCount);
		}
		return parseInt(buyUpCount);
	}

	/**
	 * Get the newly added user list
	 * return - newlyAddedRepArray - Array
	 */
	$scope.getNewlyAddedRep = function(){
		var newlyAddedRepArray = [];
		var invitedRepsList = $scope.userSelectedList;
		angular.forEach(invitedRepsList , function(value,key){
			if(invitedRepsList[key].isNewRep && invitedRepsList[key].checked === true){
				newlyAddedRepArray.push(invitedRepsList[key].userId);
			}
		});
		return newlyAddedRepArray;
	}

	$rootScope.showInviteRepElement = function () {
		$rootScope.showPaymentElement.showIncrementalPayment = false;
		$scope.divOverlayInviteRep();
		$scope.sendInvitation();
	};

	$scope.hidePayment = function(){
		$scope.showPaymentElement.showIncrementalPayment = false;
	}

	$scope.sendInvitation = function() {
		var params = {}, i, invitedRepsSelectedList;
		$rootScope.inviteRepErrorMsg = [];
		params["InviteReps"] = [];
		invitedRepsSelectedList = $scope.userSelectedList;
		if(invitedRepsSelectedList && invitedRepsSelectedList.length > 0){
			for(i = 0; i<invitedRepsSelectedList.length; i++){
				invitedRepsSelectedList[i].userId = angular.lowercase(invitedRepsSelectedList[i].userId);
				if(invitedRepsSelectedList[i].checked === true){
					params["InviteReps"].push({"firstName":invitedRepsSelectedList[i].firstName,"lastName":invitedRepsSelectedList[i].lastName,"userId":invitedRepsSelectedList[i].userId,"workPhone":invitedRepsSelectedList[i].workPhone,
							"customerOids":invitedRepsSelectedList[i].customerOidsString,"vendorOid":invitedRepsSelectedList[i].vendorOid});
				}
			}
			$scope.sendInviteLoading = true;
			manageRepsServices.inviteRepsProcess(params).then(function(result){
				if((result.data && result.data.status==='success') || (result.data && result.data.status==='error' && angular.isDefined(result.data.errorData.InviteRepsSummaryList))){
					$scope.sendInviteLoading = false;
					var inviteeSummaryList,findErrorUserIdIndex,j;
					if(result.data && result.data.status==='success'){
						inviteeSummaryList = result.data.successData.InviteRepsSummaryList;
						if ($scope.isOpenAccess === false) {
							$scope.checkOpenAccessAndGrpEligibility();
						}
					} else if(result.data && result.data.status==='error'){
						inviteeSummaryList = result.data.errorData.InviteRepsSummaryList;
					}
					if(inviteeSummaryList && inviteeSummaryList.length > 0 && invitedRepsSelectedList && invitedRepsSelectedList.length > 0){
						for(j=0;j< inviteeSummaryList.length;j++){
							findErrorUserIdIndex = _.findIndex(invitedRepsSelectedList, function(o) { return o.userId == inviteeSummaryList[j].userId;});
							if(findErrorUserIdIndex !== -1){
								if(angular.lowercase(inviteeSummaryList[j].status) === 'error' || angular.lowercase(inviteeSummaryList[j].status) === 'alert'){
									invitedRepsSelectedList[findErrorUserIdIndex].invitationStatus = angular.lowercase(inviteeSummaryList[j].status);
									if(angular.isDefined(inviteeSummaryList[j].invitationErrorList)){
										invitedRepsSelectedList[findErrorUserIdIndex].errorMessageList = inviteeSummaryList[j].invitationErrorList;
										invitedRepsSelectedList[findErrorUserIdIndex].needToShowGrid = true;
									}else{
										invitedRepsSelectedList[findErrorUserIdIndex].errorMessage = inviteeSummaryList[j].errorMessage;
										invitedRepsSelectedList[findErrorUserIdIndex].needToShowGrid = false;
									}
								}else if(angular.lowercase(result.data.status === 'error') && angular.lowercase(inviteeSummaryList[j].isBulkUserInvited) === false && angular.isDefined(inviteeSummaryList[j].userOid)){
									invitedRepsSelectedList[findErrorUserIdIndex].invitationStatus = "tpmAlert";
									invitedRepsSelectedList[findErrorUserIdIndex].errorMessage = result.data.errorData.ResponseError[0].errorCode;
									invitedRepsSelectedList[findErrorUserIdIndex].needToShowGrid = false;
								}else{
									invitedRepsSelectedList[findErrorUserIdIndex].invitationStatus = 'success';
								}
							}
						}
					}
				}else{
					$scope.sendInviteLoading = false;
				}
			});
			$scope.userSelectedList = invitedRepsSelectedList;
			$scope.$$childHead.inviteListGrid.reload();
		}
	};
	
	//google analytics page track
	$scope.callGAPageTrack = function(pageName){
		Analytics.trackPage("/"+$rootScope.path+"/"+pageName+"/");
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

//SupporForm url formation in Invite Rep error Popup
function supportFormInviteRep(){
	if(appCon.globalCon.footer.salesforce.support.url != null && appCon.globalCon.footer.salesforce.support.token != null){
		var url = appCon.data.supportUrl;
		window.open(url,'_blank', 'width=1080,height=600,scrollbars=1,toolbar=0,location=0,menubar=0');
	}
}