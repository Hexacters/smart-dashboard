'use strict';
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
	};
});

/**
 * return trusted url for iframe and relative URL's
 * Usage <iframe ng-src="{{url | trustedUrl}}"></iframe>
 */
angular.module(appCon.appName).filter('trustedUrl', ['$sce', function($sce) {
	return function(input) {
		return $sce.trustAsResourceUrl(input);
	};
}]);

/**
 * add spaces in given text
 * Usage '| unwrapFilter : 20'
 */
angular.module(appCon.appName).filter('unwrapFilter', function() {
	return function(input, count) {
		if(count){
		    for(var i=0; i<count; i++){
		    	input+= String.fromCharCode(160);
		    }
		}
	    return input;
	};
});

/**
 * return trusted html
 * Usage <div ng-bind-html-unsafe="html | trustAsHtml"></iframe>
 */
angular.module(appCon.appName).filter('trustAsHtml', ['$sce', function($sce) {
	return function(input) {
		return $sce.trustAsHtml(input);
	};
}]);

angular.module(appCon.appName).filter("sortBaseFieldWithOption", function () {
    return function (array, key) {
    	if(array && angular.isArray(array)){    	
	        var present = array.filter(function (item) {
	            return item[key];
	        });
	        var empty = array.filter(function (item) {
	            return !item[key]
	        });
	        return present.concat(empty);
    	}
    };
});