'use strict';
angular.module(appCon.appName).controller('analyticsController', ['$scope','$rootScope','Analytics', function($scope,$rootScope,Analytics){

	$rootScope.$on("callAnalyticsController", function(event, data){
		$scope.callGoogleAnalytics(data);
	});

	$scope.callGoogleAnalytics = function(value) {
		var object = angular.copy(value);
		if(angular.isDefined(appCon.globalCon.google.analytics.pageTrack) && (appCon.globalCon.google.analytics.pageTrack === true || appCon.globalCon.google.analytics.pageTrack === "true") && object.page){
			$scope.callPageTracker(object.page);
		} else if(angular.isDefined(appCon.globalCon.google.analytics.eventTrack) && (appCon.globalCon.google.analytics.eventTrack === true || appCon.globalCon.google.analytics.eventTrack === "true" ) && object.category){
			var isAudit;
			if(angular.isDefined(appCon.data.registrationStatus) && ((angular.isDefined(appCon.data.registrationStatus.repRegistration) && appCon.data.registrationStatus.repRegistration.toLowerCase() === 'completed'))){
				isAudit = false;
			} else {
				isAudit = true;
			}
			object.label += "#isAudit:"+isAudit;
			Analytics.trackEvent(object.category,object.action,object.label,object.value);
		}
	};

	$scope.callPageTracker = function(value){
		Analytics.trackPage(appContextPath+"/"+angular.copy(value));
	};
	
	$rootScope.$on("callAnalyticsEventTrack", function(event, data){
		$scope.callEventTracker(data);
	});
	
	$scope.callEventTracker = function(value){
		var object = angular.copy(value);
		Analytics.trackEvent(object.category,object.action,object.label,object.value);
	};

}]);