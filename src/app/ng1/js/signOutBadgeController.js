'use strict';
angular.module(appCon.appName).controller('signOutBadgeController', ['$scope', '$window', '$state', '$modal', '$rootScope', '$injector', '$filter', function($scope, $window, $state, $modal, $rootScope, $injector, $filter) {
	$scope.signoutBadge = function(signout) {
		var signOut = {
			badgeNumber : signout.badgeNumber,
			mongoId : signout.id,
			osVersion : '',
			phoneType : '',
			gpsLocation : '',
			mobileAppId : '',
			deviceId : '',
			signoutPoeOid : 'VD_SIGN_OUT',
			signoutPoeName : 'VD_SIGN_OUT',
			signoutLocationOid : 'VD_SIGN_OUT',
			signoutLocationName : 'VD_SIGN_OUT',
			localTime : localTimeStamp()
		};
		$injector.get('signOutServices')['kioskSignOut'](signOut).then(function(result) {
			if (result.data && result.data.status==='success') {
				$state.go('signOut.signupList', {}, { reload: true });
			}
		});
	};
	$scope.signoutTooltip = function (poe,poeOther,dep,depOther,emailid,purpose){
		var dateofvisitTooltip,poeName = '',poeOtherName,departmentName = '',
		departmentOtherName,mainContact,reason,poeSelectedName,departmentSelectedName;
		poeSelectedName = poe;
		poeOtherName = poeOther;
		if(poeOtherName!=null && poeOtherName!=""){
			if( poeSelectedName!=null && poeSelectedName!=""){
				poeName = poeSelectedName+","+poeOtherName;
			}else{
				poeName = "NOT SPECIFIED"+","+poeOtherName;
			}
		}else{
			poeName = poeSelectedName;
		}		
		departmentSelectedName = dep;
		departmentOtherName = depOther;
		if(departmentOtherName!=null && departmentOtherName!=""){
			if( departmentSelectedName!=null && departmentSelectedName!=""){
				departmentName = departmentSelectedName+","+departmentOtherName;
			}else{
				departmentName = "NOT SPECIFIED"+","+departmentOtherName;
			}
		}else{
			departmentName = departmentSelectedName;
		}
		poeName ='Point Of Entry: '+poeName;
		departmentName = 'Department: '+departmentName;
		mainContact = 'Main Contact: '+emailid;
		reason = 'Reason: '+purpose;
		dateofvisitTooltip = poeName+"<br/>"+departmentName+"<br/>"+mainContact+"<br/>"+reason;
		$scope.dateofvisitTooltip = dateofvisitTooltip;
	}
}]);