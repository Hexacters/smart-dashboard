'use strict';

/*
 * Change request for every call i.e wrapping request. this is our standard
 * Also, handling application & server errors
 */
angular.module(appCon.appName).factory('httpInterceptor', function() {
	var httpInterceptor = {
        request: function(config) {
        	if(config.url.indexOf('.json') >= 0  && config.url.indexOf('messages_properties_') >= 0){
        		config.url = config.url + '?' + appCon.globalCon.deployDate;
        	}else if(config.url.indexOf('.html') < 0){
        		if(config.url.indexOf('?')>=0){
        			config.url = config.url + '&' + new Date().getTime();	
        		}else{
        			config.url = config.url + '?' + new Date().getTime();
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
});