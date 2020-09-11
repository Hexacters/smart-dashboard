'use strict';

angular.module(appCon.appName).controller('footerController', ['$scope', '$rootScope', '$window','$filter', function($scope,$rootScope,$window,$filter){
	var currentHour = '',
		eventObject = '',
		currentDay = '',
		chatAvailableDays = '';

	$scope.footercurrtentYear = function(){
		$scope.footerYear = $filter('date')(new Date(), 'yyyy');
	};
	$rootScope.$appConfiguration = appCon.globalCon;
	$scope.showRingChat = false;
	$scope.isOfficeWorkingHour = false;
	$scope.isChatAvailableDay = false;
	chatAvailableDays = appCon.globalCon.ringCentralChat.officeWorkingDays.split(',');
	$rootScope.$watch('serverTime.serverDateTime', function (serverDateTime) {
		if (serverDateTime) {
			currentHour = serverDateTime.getHours();
			currentDay = serverDateTime.getDay().toString();
			if (currentHour >= parseInt(appCon.globalCon.ringCentralChat.startTime) && currentHour < parseInt(appCon.globalCon.ringCentralChat.endTime)) {
				$scope.isOfficeWorkingHour = true;
			}
			if (chatAvailableDays.indexOf(currentDay) >= 0) {
				$scope.isChatAvailableDay = true;
			}
		}
	});
	
	$scope.supportLink = function () {
		if(appCon.globalCon.footer.salesforce.support.url != null && appCon.globalCon.footer.salesforce.support.token != null){
			var url = appCon.globalCon.footer.salesforce.support.url+'?token='+appCon.globalCon.footer.salesforce.support.token;
			if(angular.isDefined($scope.userProfile) && $scope.userProfile != ''){
				url += angular.isDefined($scope.userProfile.name) && $scope.userProfile.name !== '' ? "&cfn="+encodeURIComponent($scope.userProfile.name) : '' ;
				url += angular.isDefined($scope.userProfile.userId) && $scope.userProfile.userId !== '' ? "&cem="+encodeURIComponent($scope.userProfile.userId)  : '' ;
				if(angular.isDefined($scope.userProfile.detail) && $scope.userProfile.detail != ''){
					url += angular.isDefined($scope.userProfile.detail.legalName) && $scope.userProfile.detail.legalName !== '' ? "&cmp="+encodeURIComponent($scope.userProfile.detail.legalName) : '';
					url += angular.isDefined($scope.userProfile.detail.phone) && $scope.userProfile.detail.phone !== '' ? "&cph="+encodeURIComponent($scope.userProfile.detail.phone) : '';
				}
			}
			$window.open(url,'_blank', 'width=1080,height=600,scrollbars=1,toolbar=0,location=0,menubar=0');
		}
	};
	$scope.toggleRingChat = function () {
		$scope.showRingChat = !$scope.showRingChat;
		eventObject = {
			'category': 'CHAT',
			'action': $scope.showRingChat
				? 'OPEN'
				: 'CLOSE',
			'label': 'email:' + $rootScope.userProfile.detail.userName + '#userOid:' + $rootScope.userProfile.id + '#fein:' + $rootScope.userProfile.detail.fein + '#vendorOid:' + $rootScope.userProfile.detail.vendorOid + '#vendorDetailsOid:' + $rootScope.userProfile.detail.vendorDetailOid,
			'value': 1
		};
		$rootScope.$emit('callAnalyticsEventTrack', eventObject);
	};
}]);
