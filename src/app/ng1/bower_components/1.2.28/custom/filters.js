/**
 * Skip ng-repeat JSON ordering
 * http://stackoverflow.com/questions/19287716/skip-ng-repeat-json-ordering-in-angular-js
 * Usage <div ng-repeat="(key, value) in data | keys"></div>
 * 
 */
angular.module(appCon.appName).filter('keys', function() {
	return function(input) {
		if (!input) {
			return [];
		}
		return Object.keys(input);
	}
});

/*
 * return trusted url for iframe and relative URL's
 * Usage <iframe ng-src="{{url | trustedUrl}}"></iframe>
 */
angular.module(appCon.appName).filter('trustedUrl', ["$sce", function($sce) {
	return function(input) {
		return $sce.trustAsResourceUrl(input);
	}
}]);