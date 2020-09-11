'use strict';
angular.module(appCon.appName).controller('reportsController', ['$scope', '$rootScope','$injector','$state','$filter','Analytics', function($scope, $rootScope, $injector,$state,$filter,Analytics) {
	$scope.fromdateMissing = false;
	$scope.todateMissing = false;
	$scope.invalidFromdateError = false;
	$scope.invalidTodateError = false;
	
	$scope.loadInitalCredentialReport = function(isFrom,curentState) {
		if(curentState == 'shareMyCredentialsHistoryReport'){
			appCon.data["credentialsFrom"] = new Array();
			appCon.data["credentialsFrom"]["isFromAdmin"] = "false";
		}else{
			appCon.data["credentialsFrom"] = new Array();
			appCon.data["credentialsFrom"]["isFromAdmin"] = "true";
		}
		if(isFrom =='' || isFrom == undefined){
			$scope.todayDate = new Date();
			$rootScope.credentialReportToDate = $filter('date')(new Date(), 'MM/dd/yyyy');
			$scope.credentialEndDate = $filter('date')(new Date(), 'MM/dd/yyyy');
			var lastSevanthDays = new Date();
			lastSevanthDays.setDate($scope.todayDate.getDate() - 7);	
			$scope.credentialStartDate = $filter('date')(lastSevanthDays, 'MM/dd/yyyy');
			$rootScope.credentialReportFromDate = $filter('date')(lastSevanthDays, 'MM/dd/yyyy');
		}else if(isFrom == 'reportDetails'){
			if(appCon.data["shareMyCredentials"]["backStartDate"] !=''){
				$rootScope.credentialReportFromDate = appCon.data["shareMyCredentials"]["backStartDate"];
				$rootScope.credentialStartDate = appCon.data["shareMyCredentials"]["backStartDate"];
			}else{
				$scope.todayDate = new Date();
				var lastSevanthDays = new Date();
				lastSevanthDays.setDate($scope.todayDate.getDate() - 7);	
				$rootScope.credentialStartDate = $filter('date')(lastSevanthDays, 'MM/dd/yyyy');
				$rootScope.credentialReportFromDate = $filter('date')(lastSevanthDays, 'MM/dd/yyyy');
			}
			if(appCon.data["shareMyCredentials"]["backEndDate"] !=''){
				$rootScope.credentialReportToDate = appCon.data["shareMyCredentials"]["backEndDate"];			
				$rootScope.credentialEndDate = appCon.data["shareMyCredentials"]["backEndDate"];
			}else{
				$rootScope.credentialReportToDate = $filter('date')(new Date(), 'MM/dd/yyyy');
				$rootScope.credentialEndDate = $filter('date')(new Date(), 'MM/dd/yyyy');
			}
		}
	};

	$scope.hideCredentialTable =false;
	$scope.fromdateTodateError = false;
	//$scope.hideResponseError = true;
	$scope.shareCredentialHistoryereport = function(startDate,endDate,keyEnter) {
		if(startDate && startDate !=''){
			$scope.$$childHead.shareMyCredentialsHistoryReport.filter()['startDate']= startDate;
		}else{
			if(keyEnter == 'fromDate'){
				$scope.invalidFromdateError = true;
				$scope.invalidTodateError = false;
				$scope.hideCredentialTable =true;
			}else if(keyEnter == 'filter'){
				$scope.invalidFromdateError = false;
				$scope.invalidTodateError = false;
				$scope.hideCredentialTable =true;
			}
			$scope.fromdateMissing = true;
		}
		if(endDate && endDate !=''){
			$scope.$$childHead.shareMyCredentialsHistoryReport.filter()['endDate']= endDate;
		}else{
			if(keyEnter == 'toDate'){
				$scope.invalidTodateError = true;
				$scope.invalidFromdateError = false;
				$scope.hideCredentialTable =true;
			}else if(keyEnter == 'filter'){
				$scope.invalidFromdateError = false;
				$scope.invalidTodateError = false;
				$scope.hideCredentialTable =true;
			}
			$scope.todateMissing = true;
		}
		if(startDate && startDate !='' && endDate && endDate !=''){
			$scope.hideCredentialTable =false;
			$scope.fromdateTodateError = true;
			if(new Date(startDate) > new Date(endDate)){
				$scope.hideCredentialTable =true;
				$scope.fromdateTodateError = true;
			}else{
				$scope.hideCredentialTable =false;
				$scope.fromdateTodateError = false;
				$scope.hideFromToErrorMessage();
				$scope.$$childHead.searchTable();				
			}			
		}
	};
	
	$scope.enterShareCredentialHistoryeReport = function(FromDate,toDate,keyEvent,isfrom) {
		if (keyEvent.keyCode === 13){
			$scope.shareCredentialHistoryereport(FromDate,toDate,isfrom);
		}
	};
	
	$scope.shareCredentialHistoryeReportDetails = function(startDate,endDate,keyEnter) {
		if(startDate && startDate !=''){
			appCon.data["shareMyCredentials"]["startDate"]= startDate;
		}else{
			if(keyEnter == 'fromDate'){
				$scope.invalidFromdateError = true;
				$scope.invalidTodateError = false;
				$scope.hideCredentialTable =true;
			}else if(keyEnter == 'filter'){
				$scope.invalidFromdateError = false;
				$scope.invalidTodateError = false;
				$scope.hideCredentialTable =true;
			}
			$scope.fromdateMissing = true;
		}
		if(endDate && endDate !=''){
			appCon.data["shareMyCredentials"]["endDate"]= endDate;
		}else{
			if(keyEnter == 'toDate'){
				$scope.invalidTodateError = true
				$scope.invalidFromdateError = false;
				$scope.hideCredentialTable =true;
			}else if(keyEnter == 'filter'){
				$scope.invalidFromdateError = false;
				$scope.invalidTodateError = false;
				$scope.hideCredentialTable =true;
			}
			$scope.todateMissing = true;
		}
		if(startDate && startDate !='' && endDate && endDate !=''){
			$scope.hideCredentialTable =false;
			$scope.fromdateTodateError = true;
			if(new Date(startDate) > new Date(endDate)){
				$scope.hideCredentialTable =true;
				$scope.fromdateTodateError = true;
			}else{
				$scope.hideCredentialTable =false;
				$scope.fromdateTodateError = false;
				$scope.hideFromToErrorMessage();
				$scope.$$childHead.$$childHead.searchTable();
			}
		}
	};

	$scope.enterShareCredentialHistoryeReportDetails = function(FromDate,toDate,keyEvent,isFrom) {
		if (keyEvent.keyCode === 13){
			$scope.shareCredentialHistoryeReportDetails(FromDate,toDate,isFrom);
		}
	};
	
	$scope.hideFromToErrorMessage = function() {
		$scope.fromdateMissing = false;
		$scope.todateMissing = false;
		$scope.fromdateTodateError = false;		
	};
	
	$scope.clearDateValue = function() {
		appCon.data["shareMyCredentials"] = new Array();
		delete $rootScope.credentialReportToDate;
		delete $rootScope.credentialReportFromDate;
		delete $rootScope.credentialStartDate;
		delete $rootScope.credentialEndDate;
	};	

	$scope.loadMyCredentialsHistoryDetails = function(userOid,oid,sharedOnDate,expDate,currentUrl,fromDate,toDate) {
		$rootScope.credentialReportDetailMaxDate='';
		$rootScope.credentialReportDetailMinDate='';
		if(sharedOnDate && sharedOnDate !=''){
			var sharedOnDateSplit = sharedOnDate.split(" ");
			$rootScope.credentialReportDetailFromDate = $.datepicker.formatDate('mm/dd/yy', new Date(sharedOnDateSplit[0]));
		}
		if(expDate && expDate !=''){
			var expDateSplit = expDate.split(" ");
			$rootScope.credentialReportDetailToDate = $.datepicker.formatDate('mm/dd/yy', new Date(expDateSplit[0]));
		}
		appCon.data["shareMyCredentials"] = new Array();
		appCon.data["shareMyCredentials"]["oid"] = oid;
		var endDate = $rootScope.credentialReportDetailToDate;
		if(new Date() < new Date(endDate)){
			appCon.data["shareMyCredentials"]["endDate"] = $filter('date')(new Date(), 'MM/dd/yyyy');
			$rootScope.credentialReportDetailToDate = $filter('date')(new Date(), 'MM/dd/yyyy');
		}else{
			appCon.data["shareMyCredentials"]["endDate"] = $rootScope.credentialReportDetailToDate;
		}
		appCon.data["shareMyCredentials"]["startDate"] = $rootScope.credentialReportDetailFromDate;
		appCon.data["shareMyCredentials"]["backStartDate"] = fromDate;
		appCon.data["shareMyCredentials"]["backEndDate"] = toDate;
		$rootScope.credentialReportDetailMaxDate = $rootScope.credentialReportDetailToDate;
		$rootScope.credentialReportDetailMinDate = $rootScope.credentialReportDetailFromDate;
		if(currentUrl =='shareMyCredentialsHistoryReport'){
			$state.go('reports.shareMyCredentialsHistoryReportDetails');
		}else{
			$state.go('reports.shareStaffCredentialsHistoryReportDetails');
		}
	};	
	$scope.advancedReportsURL = function(){
		$rootScope.advancedReportIframeUrl = '';
		var vendorOid = $rootScope.userProfile.detail.vendorOid;
		var userOid = $rootScope.userProfile.id;
		var loggedroleListStr='';
		var loggedroleList = $rootScope.userProfile.authorities;
		var roleList = loggedroleList.map(function(loggedroleList) {
			return loggedroleList['role'];
		});
		var token = appCon.globalCon.reportdash.token;
		var reportDashUrl = appCon.globalCon.reportdash.url;
		if (vendorOid && userOid && roleList && token && reportDashUrl) {
			if (reportDashUrl != "") {
				var params = reportDashUrl+"?theme=VD&vendor_oid="+vendorOid+"&user_oid="+userOid+"&role="+roleList+"&token="+token;
				$rootScope.advancedReportIframeUrl = params;
			}
		}
	};
	
	$scope.reloadReportIframe = function(){
		$scope.iframeLoading = true;
		var advancedReportIframe = $rootScope.advancedReportIframeUrl;
		$rootScope.advancedReportIframeUrl = advancedReportIframe+"&rnd="+ (new Date()).getTime();
	};
	
	//google analytics page track
	$scope.callGAPageTrack = function(pageName){
		Analytics.trackPage("/"+$rootScope.path+"/"+pageName+"/");
	};
	$scope.iframeLoading = true;
	$scope.iframeLoadedCallBack = function(){
		$scope.iframeLoading = false;
    };
}]);