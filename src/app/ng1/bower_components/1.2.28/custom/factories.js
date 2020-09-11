"use strict";

/*
 * Change request for every call i.e wrapping request. this is our standard
 * Also, handling application & server errors
 */
angular.module(appCon.appName).factory("httpInterceptor", ["$location", "$cookieStore", function($location, $cookieStore) {
    var httpInterceptor = {
        request: function(config) {
            
        	if(config.url.indexOf("oauth/token")>0 || config.url.indexOf("jwtToken.json")>0 ){
        		// Skip request interceptor for authentication, we are passing form values as key value parameters
        	}else{
    			if(angular.isDefined(config.data) && angular.isObject(config.data[0])){
            		if(appCon.globalCon.request.value){
            			config.data[appCon.globalCon.request.value] = config.data[0];
            			delete config.data[0];
            		}else{
            			config.data = data[0];
	            		delete config.data[0];
            		}
            	}
        	}
            return config;
        },
        response: function(config) {
        	return transformResponse(config);
        },
        responseError: function(config) {
        	return transformResponse(config);
        }
    };
    return httpInterceptor;
}]);

//Setting token header for subsequent request once loggedin
angular.module(appCon.appName).factory("tokenHeader", ["$http", "$rootScope", "$cookieStore", function($http, $rootScope, $cookieStore) {
    var setHeader = {
        set: function() {
            //$http.defaults.headers.common["token"] = $cookieStore.get("userInfo").token;
        	$http.defaults.headers.common["token"] = $cookieStore.get("token");
        }
    };
    return setHeader;
}]);