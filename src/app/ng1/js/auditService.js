'use strict';

angular.module(appCon.appName).factory('auditService', ['$injector', function ($injector) {
	
	/** @property roles {Array} */
	var service = {			
		saveAudit: function (serviceName, authToken) {
			if(angular.isDefined(appCon.data.registrationStatus) && ((angular.isDefined(appCon.data.registrationStatus.repRegistration) && appCon.data.registrationStatus.repRegistration.toLowerCase() === 'completed'))){
				return;
			} else {
				return $injector.get(serviceName)['saveUserRegistrationStatus']();
			}
		}
	};
	return service;
}]);