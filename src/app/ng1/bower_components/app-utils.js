'use strict';

var encodeUrlParamValue = function(params){
	return encodeURIComponent(JSON.stringify(params));
};

/**
 * Handle Request
 * 
 * @params params
 */
var transformRequest = function(params, operationKey) {
	var encodedParamValue;
    if (operationKey && operationKey._requestType === 'json') {
        if (operationKey._requestWrapper) {
            if (operationKey._method.toUpperCase() === 'POST') {
            	if(operationKey._operationType === 'export'){
            		encodedParamValue = encodeUrlParamValue(params);
                    return appCon.globalCon[operationKey._requestWrapper].param + '={"' + appCon.globalCon[operationKey._requestWrapper].value + '":' + encodedParamValue + '}';
            	} else if (appCon.globalCon[operationKey._requestWrapper] && appCon.globalCon[operationKey._requestWrapper].value) {
                	return '{"' + appCon.globalCon[operationKey._requestWrapper].value + '":' + angular.toJson(params) + '}';
                } else {
                    return angular.toJson(params);
                }
            } else if (operationKey._method.toUpperCase() === 'GET') {
            	encodedParamValue = encodeUrlParamValue(params);
            	return appCon.globalCon[operationKey._requestWrapper].param + encodeURI('={"') + appCon.globalCon[operationKey._requestWrapper].value + encodeURI('":') + encodedParamValue + encodeURI('}');
            }
        } else {
            return angular.toJson(params);
        }
    } else {
        return $.param(params, true);
    }
};

/**
 * Success response json
 */
var successReponseString = {
    'status': 'success',
    'successData': {}
};

/**
 * Failure response json
 */
var failureReponseString = {
    'status': 'error',
    'errorData': {}
};

/**
 * Remove user's data
 */
var _removeUserData = function(loggedOutError) {
	sessionStorage.clear();
	window.localStorage.removeItem('userPermission_'+appContextPath);

	var e = document.getElementById('ng-app');
	var $injector = angular.element(e).injector();
	var $rootScope = $injector.get('$rootScope'), 
		$location = $injector.get('$location'),
		$cookieStore = $injector.get('$cookieStore');
		$injector.get('users').logout().then(function () {
			$rootScope.userProfile = false;
			$cookieStore.remove('userProfile');
			//$cookieStore.remove('userInfo');
			$cookieStore.remove('dashboard');
			$rootScope.$evalAsync(function() {
				$rootScope.loggedOutMsg = loggedOutError;
				$location.path("/" + appCon.globalCon.authentication.page);
			});
		});
};

/**
 * Handle Response
 * 
 * @results results
 */

function _transformResponse(data, headers, operationKey) {
    var successReponseString = {
            'status': 'success',
            'successData': {}
        },
        failureReponseString = {
            'status': 'error',
            'errorData': {}
        },
        response, successFlag, failureFlag;
    
	    if(angular.isString(data)){
	    	try {
	    		data = JSON.parse(data);	
	    	}
	    	catch(err) {}
		
	    }
    if (operationKey && angular.isDefined(operationKey._responseWrapper)) {
    	
        if (appCon.globalCon && appCon.globalCon[operationKey._responseWrapper]) {
        	if (appCon.globalCon[operationKey._responseWrapper].param) {
        		response = data[appCon.globalCon[operationKey._responseWrapper].param];

                /**
                 * Checking the response root node having the json string values
                 * instead of json object if response comes as json string then
                 * convert into json object
                 */
                if (angular.isString(response)) {
                    response = JSON.parse(response);
                }

            } else {
                response = data;
            }
            successFlag = appCon.globalCon[operationKey._responseWrapper].successFlag ? appCon.globalCon[operationKey._responseWrapper].successFlag
                .split('=') : null;
            failureFlag = appCon.globalCon[operationKey._responseWrapper].failureFlag ? appCon.globalCon[operationKey._responseWrapper].failureFlag
                .split('=') : null;

            if (response) {
                if (successFlag && response[successFlag[0]] === successFlag[1]) {
                    angular.extend(successReponseString.successData, response);
                    data = successReponseString;
                } else if (failureFlag && response[failureFlag[0]] === failureFlag[1]) {
                    angular.extend(failureReponseString.errorData, response);
                    if(failureReponseString.errorData && failureReponseString.errorData.ResponseError && failureReponseString.errorData.ResponseError[0].errorCode === 1000){
						failureReponseString.errorData.ResponseError[0].errorCode = '1000';
					}
                    data = failureReponseString;
                } else {
                    angular.extend(successReponseString.successData, response);
                    data = successReponseString;
                }
            }
        }
    } else {
    	if(data.response && angular.isString(data.response)){
			data.response = JSON.parse(data.response);
		}
    	
        angular.extend(successReponseString.successData, data);
        data = successReponseString;
    }
    return data;
}

var transformResponse = function(results){	
	var e = document.getElementById('ng-app');
	var $injector = angular.element(e).injector();
	var $rootScope = $injector.get('$rootScope');	
	if(results.status === 0){
		window.location.reload();
	}
	
	
	if(results.status === 401) { 
		/** Unauthorized **/ 	 
		$rootScope.loading = false; 
		$rootScope.showToaster('401');
	}else if(results.status === 403) { 
		/** Vulnerability checking **/
		$rootScope.loading = false;
		if(angular.isDefined(appCon.globalCon.authentication.mode) && 
				appCon.globalCon.authentication.mode.toLowerCase() === 'sso') {				
			$rootScope.showToaster('403');		
		} else {
			$rootScope.isForbiddenLoggedOut='FORBIDDEN';  
			$rootScope.logout('FORBIDDEN');
			return;
		}
	}else if(results.status === 404){
		$rootScope.loading = false;
		$rootScope.showToaster('404');
	}else if(results.status === 500){
		$rootScope.loading = false;
		$rootScope.showToaster('500');
	}
	
	var response = angular.toJson(results.data);	
	if(results.data && results.data.errorData && angular.isObject(results.data.errorData.ResponseError) && results.data.errorData.ResponseError[0].shortMessage){
		var shortMessage = results.data.errorData.ResponseError[0].shortMessage.toLowerCase(),
			errorCode = results.data.errorData.ResponseError[0].errorCode;
		
		if(shortMessage === 'password expired'){
			
			//check entry point urls - password expired error
			var urlMatched = false,
				windowLocation = window.location.href;
			
			if(appCon.globalCon.authentication.entryPointUrls){
				var entryPointUrls = appCon.globalCon.authentication.entryPointUrls;
	    		if(entryPointUrls.indexOf(',')>=0){
	    			var authenticationEntryPoints = entryPointUrls.split(','), urlMatched = false;
	    			for(var i =0; i<authenticationEntryPoints.length; i++){
	    				if(windowLocation.indexOf(authenticationEntryPoints[i])>=0 ){
	    					urlMatched = true;
	    				}
	    			}
	    			if(urlMatched === true){
	    				$rootScope.loginErrorResponse = results.data;
	    				//window.location.hash = appCon.globalCon.authentication.passwordExpired ? appCon.globalCon.authentication.passwordExpired : 'resetPassword';
	    				var $location = $injector.get('$location');
	    				var resetPasswordPage = appCon.globalCon.authentication.passwordExpired ? appCon.globalCon.authentication.passwordExpired : 'resetPassword';
	    				$location.path("/" + resetPasswordPage);
	    				return true;
	    			}
	    		}else{
	    			if(entryPointUrls !== '') {
	        			if(windowLocation.indexOf(entryPointUrls)>=0 ){
	        				$rootScope.loginErrorResponse = results.data;
		    				//window.location.hash = appCon.globalCon.authentication.passwordExpired ? appCon.globalCon.authentication.passwordExpired : 'resetPassword';
	        				var $location = $injector.get('$location');
	        				var resetPasswordPage = appCon.globalCon.authentication.passwordExpired ? appCon.globalCon.authentication.passwordExpired : 'resetPassword';
	        				$location.path("/" + resetPasswordPage);
		    				return true;
	        			}
	        		}
	    		}	
			}
    		
			if($rootScope.currentState.name  === appCon.globalCon.authentication.page){
				$rootScope.loginErrorResponse = results.data;
				//window.location.hash = appCon.globalCon.authentication.passwordExpired ? appCon.globalCon.authentication.passwordExpired : 'resetPassword';
				var $location = $injector.get('$location');
				var resetPasswordPage = appCon.globalCon.authentication.passwordExpired ? appCon.globalCon.authentication.passwordExpired : 'resetPassword';
				$location.path("/" + resetPasswordPage);
			}else{
				$rootScope.logout('PASSWORD_EXPIRED');
			}
			
		}else if(shortMessage.indexOf('session expired') >= 0 ){
			$rootScope.logout('LOGGED_OUT');
		}else if(shortMessage.indexOf('bad credentials') >= 0 ){
			$rootScope.logout('INVALID_CREDENTIALS');
		}else if(shortMessage === 'access denied'){
			$rootScope.logout('ACCESS_DENIED');
			//window.location.hash = appCon.globalCon.authentication.accessDenied ? appCon.globalCon.authentication.accessDenied : 'accessDenied';
		}else if(shortMessage.indexOf('account locked') >= 0 ){
		   var $location = $injector.get('$location');
		   var redirectionUrlValue = appCon.globalCon.authentication.accountLocked ? appCon.globalCon.authentication.accountLocked : 'accountLocked';
		   $location.path("/" + redirectionUrlValue);
		   var scope = angular.element($("#loginFormId")).scope();                 
		   scope.$evalAsync(function(){
		    scope.loading = false;
		    $rootScope.afterLoginLoading= false;
		   });              
		   return false;
			//window.location.hash = appCon.globalCon.authentication.accountLocked ? appCon.globalCon.authentication.accountLocked : 'accountLocked';
		}else if(shortMessage.indexOf('attempt failure') >= 0 ){
		   var $location = $injector.get('$location');
		   var redirectionUrlValue = appCon.globalCon.authentication.attemptFailure ? appCon.globalCon.authentication.attemptFailure : 'loginAttemptFailure';
		   $location.path("/" + redirectionUrlValue);
		   var scope = angular.element($("#loginFormId")).scope();                 
		   scope.$evalAsync(function(){
		    scope.loading = false;
		    $rootScope.afterLoginLoading= false;
		   });              
		   return false;
			//window.location.hash = appCon.globalCon.authentication.attemptFailure ? appCon.globalCon.authentication.attemptFailure : 'loginAttemptFailure';
		}else if(shortMessage.indexOf('attempt locked') >= 0 ){
		   var $location = $injector.get('$location');
		   var redirectionUrlValue = appCon.globalCon.authentication.attemptLock ? appCon.globalCon.authentication.attemptLock : 'userAttemptLock';
		   $location.path("/" + redirectionUrlValue);
		   var scope = angular.element($("#loginFormId")).scope();                 
		   scope.$evalAsync(function(){
		    scope.loading = false;
		    $rootScope.afterLoginLoading= false;
		   });              
		   return false;
			//window.location.hash = appCon.globalCon.authentication.attemptLock ? appCon.globalCon.authentication.attemptLock : 'userAttemptLock';
		}else if(shortMessage.indexOf('invalid token') >= 0 ){
			$rootScope.logout('INVALID_TOKEN');
		}
		
		var errorList = [];
		//errorList.push({'errorCode':'2304','shortMessage':'SESSION EXPIRED'});
		//errorList.push({'errorCode':'2309','shortMessage':'ACCESS DENIED'});
		errorList.push({'errorCode':'5070','shortMessage':'THIS USER NOT HAVE RELATION WITH VENDOR'});
		errorList.push({'errorCode':'5071','shortMessage':'THIS USER ACTOR STATUS IS NOT ACTIVE'});
		errorList.push({'errorCode':'5072','shortMessage':'THIS USER NOT HAVE RELATION WITH CUSTOMER'});
		errorList.push({'errorCode':'5073','shortMessage':'CUSTOMER STATUS IS NOT ACTIVE'});
		errorList.push({'errorCode':'5074','shortMessage':'THERE IS NO ACTORS FOR THIS USER'});
		errorList.push({'errorCode':'5075','shortMessage':'NO ROLE SPECIFIED'});
		//errorList.push({'errorCode':'8252','shortMessage':'INVALID TOKEN'});
		errorList.push({'errorCode':'8254','shortMessage':'INVALID USER'});
		errorList.push({'errorCode':'8259','shortMessage':'TOKEN EXPIRED'});
		//errorList.push({'errorCode':'8269','shortMessage':'BAD CREDENTIALS'});
		//errorList.push({'errorCode':'8270','shortMessage':'PASSWORD EXPIRED'});
		errorList.push({'errorCode':'8271','shortMessage':'USER ACCOUNT LOCKED'});
		errorList.push({'errorCode':'8277','shortMessage':'USERNAME OR PASSWORD IS INVALID'});
		
		for(var i=0; i < errorList.length-1; i++){
			if( errorCode == errorList[i].errorCode && shortMessage == errorList[i].shortMessage.toLowerCase()){
				$rootScope.logout('LOGGED_OUT');
				break;
			}
		}
	}
	
	if(response && response.toLowerCase().indexOf('session expired') >= 0  && (results.config.url.indexOf('.html') >= 0 || results.config.url.indexOf('VMClientProxyServlet') >= 0 )){
		$rootScope.logout('LOGGED_OUT');
	}
	
	return results;
};


/**set user profile data into service param*/
function setUserProfileToRequestParams(object, arg, operationKey){
	if (!angular.isObject(object)){
		object = JSON.parse(object);
	}
	
	var paramValue = _.get(object, operationKey._key);
	_.set(arg, operationKey._name, paramValue);
}

/**Delete object(s) from json nested object*/
var DOT_SEPARATOR = '.';

var deleteKeysFromObject = function(object, keys, options) {

	var keysToDelete;

	// deep copy by default
	var isDeep = true;

	// to preserve backwards compatibility, assume that only explicit options means shallow copy
	if (_.isUndefined(options) === false) {
		if (_.isBoolean(options.copy)) {
			isDeep = options.copy;
		}
	}

	// do not modify original object if copy is true (default)
	var finalObject;
	if (isDeep) {
		finalObject = _.clone(object, isDeep);
	} else {
		finalObject = object;
	}

	if (typeof finalObject === 'undefined') {
		throw new Error('undefined is not a valid object.');
	}
	if (arguments.length < 2) {
		throw new Error(
				'provide at least two parameters: object and list of keys');
	}

	// collect keys
	if (Array.isArray(keys)) {
		keysToDelete = keys;
	} else {
		keysToDelete = [ keys ];
	}

	keysToDelete.forEach(function(elem) {
		for ( var prop in finalObject) {
			if (finalObject.hasOwnProperty(prop)) {
				if (elem === prop) {
					// simple key to delete
					delete finalObject[prop];
				} else if (elem.indexOf(DOT_SEPARATOR) !== -1) {
					var parts = elem.split(DOT_SEPARATOR);
					var pathWithoutLastEl;

					var lastAttribute;

					if (parts && parts.length === 2) {

						lastAttribute = parts[1];
						pathWithoutLastEl = parts[0];
						var nestedObjectRef = finalObject[pathWithoutLastEl];
						if (nestedObjectRef) {
							delete nestedObjectRef[lastAttribute];
						}
					} else if (parts && parts.length === 3) {
						// last attribute is the last part of the parts
						lastAttribute = parts[2];
						var deepestRef = (finalObject[parts[0]])[parts[1]];
						delete deepestRef[lastAttribute];
					} else {
						throw new Error('Nested level ' + parts.length + ' is not supported yet');
					}

				} else {
					if (_.isObject(finalObject[prop]) && !_.isArray(finalObject[prop])) {

						finalObject[prop] = deleteKeysFromObject(
								finalObject[prop], keysToDelete, options);
					}
				}
			}
		}
	});
	return finalObject;
};

/** 
 * Prepare request json for data table
 * @params params
 * @params attrs
 * @returns object
 */
function populateSearchRequestParam(params, attrs) {
	var request = {};
	var searchType = attrs.searchType;
	
	if(params){
		if(attrs.type === 'server' && (searchType === 'searchRequestWithPagination' || searchType === 'searchRequestES')){
			request.searchRequest = {
				'startIndex' : (params.page - 1) * params.count,
			    'results' : params.count,
			    'pagination' : true
		    };
			
			request.searchRequest.sortFields = [];
	        
	        angular.forEach(params.sorting, function(value, key) {
	        	request.searchRequest.sortFields.push({
                    'sortField': key,
                    'sortValue': value
                });
	        });
			
		} else if(attrs.type === 'server' && searchType !== 'searchRequestWithPagination'){
			request.startIndex = (params.page - 1) * params.count;
		    request.results = params.count;
		    request.pagination = true;
		    
		    angular.forEach(params.sorting, function(value, key) {
	        	request.sort = key;
	        	request.dir = value;
	        });
		}
		
		if(searchType === 'searchRequest' || searchType === 'searchRequestWithPagination' || searchType === 'searchRequestES'){
			if (params.filter !== undefined) {
				if(angular.isUndefined(request.searchRequest)){
					request.searchRequest = {};
				}
		        request.searchRequest.searchFields = [];
		        
		        if(searchType !== 'searchRequestES'){
		        	request.searchRequest.searchDateFieldsList = [];
		        }
		        
		        angular.forEach(params.filter, function(value, key) {
		        	if (key.indexOf('_start') === -1 && key.indexOf('_end') === -1 && key.indexOf('_startDate') === -1 && key.indexOf('_endDate') === -1 && key.indexOf('_DateRangeFilter') === -1 && key.indexOf('_MultiSelectFilter') === -1 && key.indexOf('_options') === -1) {
		        		if(angular.isObject(value) && value != ''){
		        			if(params.filter[key+'_MultiSelectFilter'] === '' || !params.filter[key+'_MultiSelectFilter']){
			        			var checkedValues = [];
				                for (var val in value) {
				                    checkedValues.push(value[val].id);
				                }
				                value = '~'+checkedValues.join('~,~')+'~';
		        			}
		        		}
		        		if(!angular.isObject(value) && value != ''){
			                request.searchRequest.searchFields.push({
			                    'searchField': key,
			                    'searchValue': value
			                });
		        		}
		            } else if (key.indexOf('_DateRangeFilter') >= 0){
		            	if(searchType !== 'searchRequestES'){
			            	request.searchRequest.searchDateFieldsList.push({
			                    'searchField': key.split('_')[0],
			                    'startDate': value.split('#vmsdr#')[0],
			                    'endDate': value.split('#vmsdr#')[1]
			                });
		            	}else{
		            		request.searchRequest.searchFields.push({
			                    'searchField': key.split('_')[0],
			                    'searchValue': value
			                });
		            	}
		            } else if (key.indexOf('_MultiSelectFilter') >= 0){
		            	if(angular.isArray(value) && value != ''){
	        				var checkedValues = [];
			                for (var val in value) {
			                    checkedValues.push(value[val].id);
			                }
			                value = '~'+checkedValues.join('~,~')+'~';
		        			
		                    request.searchRequest.searchFields.push({
			                    'searchField': key.split('_')[0],
			                    'searchValue': value
			                });
		        		}else{
		        			if(angular.isString(value) && value !== ''){
		        				request.searchRequest.searchFields.push({
				                    'searchField': key.split('_')[0],
				                    'searchValue': '~'+value+'~'
				                });
		        			}
		        		}
		            }
		        });
		    }
		}else{
			if(params.filter){
				angular.forEach(params.filter, function(value, key) {
					if (key.indexOf('_DateRangeFilter') >= 0){
						delete params.filter[key];
					}
				});
				angular.extend(request, params.filter);
			}
		}
	}
	if(angular.isDefined(params) && angular.isDefined(params.saveDefaultReport) && searchType === 'searchRequestES'){
		request.saveDefaultReport = params.saveDefaultReport;
	}
    return request;
}

/**TODO to be removed soon*/
/** 
 * Prepare request json for Grid
 * @params params
 * @params attrs
 * @returns object 
 */
function populateSearchRequestForGrid(params, attrs) {
    var request = {
		startIndex : (params.page() - 1) * params.count(),
		results : params.count(), 
		searchRequest : {}
    };
    if (params.filter() !== undefined) {
        request.searchRequest.searchFields = [];
        angular.forEach(params.filter(), function(value, key) {
            if (key.indexOf('_startDate') === -1 && key.indexOf('_endDate') === -1 && key.indexOf('_options') === -1 && key.indexOf('_start') === -1 && key.indexOf('_end') === -1) {
                request.searchRequest.searchFields.push({
                    'searchField': key,
                    'searchValue': encodeURIComponent(value)
                });
            } else if (key.indexOf('status') !== -1) {
                var checkedValues = [];
                for (var val in value) {
                    checkedValues.push(encodeURIComponent(value[val].id));
                }
                request.searchRequest.searchFields.push({
                    'searchField': key,
                    'searchValue': checkedValues.join(',')
                });
            }
        });
    }
    if (params.sorting() !== undefined) {
        request.searchRequest.sortFields = [];
        angular.forEach(params.sorting(), function(value, key) {
            request.sort = key;
            request.dir = encodeURIComponent(value);
        });
    }
    return request;
}

var downloadFileFromUrl = function(downloadFilePath){
	var $injector = angular.injector(['ng']), 
		$http = $injector.get('$http');
	$http.get(downloadFilePath, {		
        responseType: 'arraybuffer'
    }).success(function(data, status, headers) {
    	var octetStreamMime = 'application/octet-stream';
        // Get the headers
        headers = headers();
        // Determine the content type from the header or default to 'application/octet-stream'
        var contentType = headers['content-type'] || octetStreamMime;
        
        if(contentType.indexOf('text/xml') >= 0 && data.indexOf('<shortMessage>SESSION EXPIRED</shortMessage>') >= 0){
        	//_removeUserData('LOGGED_OUT');
        	var e = document.getElementById('ng-app');
			var $injector = angular.element(e).injector();
			var $rootScope = $injector.get('$rootScope');
        	$rootScope.logout('LOGGED_OUT');
        }else{   
            var contentDisposition = 'inline', fileName, blob, urlCreator, url;
            if(headers && headers['content-disposition']){
            	contentDisposition = headers['content-disposition'].split(';')[0];
            	 // Get the filename from the x-filename header or default to 'download.bin'
            	fileName = headers['content-disposition'].split(';')[1];            	
            	fileName = fileName.split('=')[1];
        	}             
                    
            if(contentDisposition.indexOf('inline')>-1){
            	// Get the blob url creator
                urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                if (urlCreator) {	                                
                    // Prepare a blob URL
                    // Use application/octet-stream when using window.location to force download
                    blob = new Blob([data], {
                        type: octetStreamMime
                    });
                    url = urlCreator.createObjectURL(blob);
                    window.open(url, 'popup','width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');                              
                } else {
                    //window.open($scope.appPath + 'CourseRegConfirm/getfile', '_blank', '');
                	var newwindow = window.open(downloadFilePath ,'fileWindow','height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes');
            		if (window.focus) {newwindow.focus();}
            	    if (!newwindow.closed) {newwindow.focus();}
                }
            }else{
            	// Support for saveBlob method (Currently only implemented in Internet Explorer as msSaveBlob, other extension incase of future adoption)
                var saveBlob = navigator.msSaveBlob || navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;

                if (saveBlob) {
                    // Save blob is supported, so get the blob as it's contentType and call save.
                    blob = new Blob([data], {
                        type: contentType
                    });
                    saveBlob(blob, fileName);
                } else {
                    // Get the blob url creator
                    urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                    if (urlCreator) {
                        // Try to use a download link
                        var link = document.createElement('a');
                        if ('download' in link) {
                            // Prepare a blob URL
                            blob = new Blob([data], {
                                type: contentType
                            });
                            url = urlCreator.createObjectURL(blob);
                            link.setAttribute('href', url);

                            // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                            link.setAttribute('download', fileName);

                            // Simulate clicking the download link
                            var event = document.createEvent('MouseEvents');
                            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                            link.dispatchEvent(event);	

                        } else {
                            // Prepare a blob URL
                            // Use application/octet-stream when using window.location to force download
                            blob = new Blob([data], {
                                type: octetStreamMime
                            });
                            url = urlCreator.createObjectURL(blob);
                            window.location = url;
                        }

                    } else {	                        	
                    	if ($('#downloadFileIframe').length > 0) {
                    		$('#downloadFileIframe').attr('src', downloadFilePath);
                    	}else{
                    		$('<iframe />', {
                    		    name: 'downloadFileIframe',
                    		    id:   'downloadFileIframe',
                    		    style: 'visibility:hidden;display:none;',
                    		    src: downloadFilePath
                    		}).appendTo('body');
                    	}
                    }
                }
            }
        }
    })
    .error(function(data, status) {
        alert(status);
    });    	 
};

/**
*
*  MD5 (Message-Digest Algorithm)
*
**/

var MD5 = function (string) {

	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}

	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}

 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }

	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};

	function WordToHex(lValue) {
		var WordToHexValue='',WordToHexValue_temp='',lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = '0' + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};

	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,'\n');
		var utftext = '';

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	};

	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;

	string = Utf8Encode(string);

	x = ConvertToWordArray(string);

	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}

	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

	return temp.toLowerCase();
}

function uid() {
    var result='';
    for(var i=0; i<32; i++){
     result += Math.floor(Math.random()*16).toString(16).toUpperCase();
    }
    return result;
}

function getChartSeriesFromObj(chartFields,chartData,type,yaxisRightDisable){
	var chartSeries = [];
	if(chartFields.length > 0){	        		
		angular.forEach(chartFields, function(value, key) {
			var chartObj = {},
				newChartData = [];
			chartObj.name = value;			
			if(type === 'bar,line'){
				if(!yaxisRightDisable){
					chartObj.yAxisIndex = 0;
				}else{
					chartObj.yAxisIndex = 1;
				}				
				chartObj.type = 'line';
			}else if(type === 'line'){
				chartObj.type = 'line';
			}else{
				chartObj.type = type;
			}
			angular.forEach(chartData, function(value1, key1) {	        				
				if(value1[value]){
					newChartData.push(value1[value]);
        		}else{
        			newChartData.push(0);
        		}				
	        });
			chartObj.data = newChartData;
			chartSeries.push(chartObj);
		});		
    }
	return chartSeries;
}

//ngTable polyfill
if (!Array.prototype.map) {
 	Array.prototype.map = function (fun,thisp) {
 		var len = this.length;

 		if (typeof fun != "function")
 			throw new TypeError();

 		var res = new Array(len);
 		var thisp = arguments[1];

 		for (var i = 0; i < len; i++) {
 			if (i in this)
 				res[i] = fun.call(thisp, this[i], i, this);
 		}
 		return res;
 	};
 }

 if (!Object.create) {
 	Object.create = function (o, properties) {
 		if (typeof o !== 'object' && typeof o !== 'function')
 			throw new TypeError('Object prototype may only be an Object: ' + o);
 		else if (o === null)
 			throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");

 		if (typeof properties != 'undefined')
 			throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");

 		function F() {}
 		F.prototype = o;

 		return new F();
 	};
}
 
function validateAlphanumSpecialWithOneSpace(text) {
	var charArray = null;
	var temp = '';

	if(text.indexOf(" ") != -1) {
		charArray = new Array();
		charArray = text.split(" ");
		for(i = 0;i < charArray.length;i++) {
			if(i == charArray.length - 1) {
				temp = "null";
			} else {
				temp = charArray[i+1];
			}
			var str = charArray[i] + " " + temp;
			/*if (str.search(/(\s|\s-|'\s|\s')/) >= 0) {
				return true;
			}
			str = str.replace(/-/g,"");
			str = str.replace(/\'/g,"");*/
			if(str.search(/([a-zA-Z0-9\s-*&()!@#$%^|\\/\:;?_+=.,`~'"]+)\s([a-zA-Z0-9\s-*&()!@#$%^|\\/\:;?_+=.,`~'"]+)/) == -1) {
				return true;
			}
		}
	}
	return false;
}
function validateAlphaWithOneSpaceWithoutPunctuation(text) {
	var charArray = null;
	var temp = '';

	if(text.indexOf(" ") != -1) {
		charArray = new Array();
		charArray = text.split(" ");
		for(i = 0;i < charArray.length;i++) {
			if(i == charArray.length - 1) {
				temp = "null";
			} else {
				temp = charArray[i+1];
			}
			var str = charArray[i] + " " + temp;
			if (str.search(/(-\s|\s-|'\s|\s')/) >= 0) {
				return true;
			}
			str = str.replace(/-/g,"");
			str = str.replace(/\'/g,"");
			if(str.search(/([a-zA-Z]+)\s([a-zA-Z]+)/) == -1) {
				return true;
			}
		}
	}
	if (text.indexOf("-") != -1) {
		charArray = new Array();
		charArray = text.split("-");
		for(i = 0;i < charArray.length;i++) {
			if(i == charArray.length - 1) {
				temp = "null";
			} else {
				temp = charArray[i+1];
			}
			var str = charArray[i] + "-" + temp;
			if (str.search(/(-'|'-|-\s|\s-)/) >= 0) {
				return true;
			}
			str = str.replace(/\s/g,"");
			str = str.replace(/\'/g,"");
			if(str.search(/([a-zA-Z]+)-([a-zA-Z]+)/) == -1) {
				return true;
			}
		}
	}
	text = text.replace(/\s/g,"");
	text = text.replace(/-/g,"");
	if(text.search(/(^[a-zA-Z]+)$/) == -1) {
		return true;
	}
	return false;
}

function validateAlphaWithOneSpaceAndPunctuation(text) {
	var charArray = null;
	var temp = '';

	if(text.indexOf(" ") != -1) {
		charArray = new Array();
		charArray = text.split(" ");
		for(i = 0;i < charArray.length;i++) {
			if(i == charArray.length - 1) {
				temp = "null";
			} else {
				temp = charArray[i+1];
			}
			var str = charArray[i] + " " + temp;
			if (str.search(/(-\s|\s-|'\s|\s')/) >= 0) {
				return true;
			}
			str = str.replace(/-/g,"");
			str = str.replace(/\'/g,"");
			if(str.search(/([a-zA-Z]+)\s([a-zA-Z]+)/) == -1) {
				return true;
			}
		}
	}
	if (text.indexOf("'") != -1) {
		charArray = new Array();
		charArray = text.split("'");
		for(i = 0;i < charArray.length;i++) {
			if(i == charArray.length - 1) {
				temp = "null";
			} else {
				temp = charArray[i+1];
			}
			var str = charArray[i] + "'" + temp;
			if (str.search(/(-'|'-|'\s|\s')/) >= 0) {
				return true;
			}
			str = str.replace(/-/g,"");
			str = str.replace(/\s/g,"");
			if(str.search(/([a-zA-Z]+)\'([a-zA-Z]+)/) == -1) {
				return true;
			}
		}
	}
	if (text.indexOf("-") != -1) {
		charArray = new Array();
		charArray = text.split("-");
		for(i = 0;i < charArray.length;i++) {
			if(i == charArray.length - 1) {
				temp = "null";
			} else {
				temp = charArray[i+1];
			}
			var str = charArray[i] + "-" + temp;
			if (str.search(/(-'|'-|-\s|\s-)/) >= 0) {
				return true;
			}
			str = str.replace(/\s/g,"");
			str = str.replace(/\'/g,"");
			if(str.search(/([a-zA-Z]+)-([a-zA-Z]+)/) == -1) {
				return true;
			}
		}
	}
	text = text.replace(/'/g,"");
	text = text.replace(/\s/g,"");
	text = text.replace(/-/g,"");
	if(text.search(/(^[a-zA-Z]+)$/) == -1) {
		return true;
	}
	return false;
}

function deepDelete(target, context) {
	// Assume global scope if none provided.
	context = context || window;

	var targets = target.split('.');

	if (targets.length > 1){
		deepDelete(targets.slice(1).join('.'), context[targets[0]]);
	}else{
		delete context[target];
	}
}

var updatePropertyName = function(paramsObj, operationKey){
	var paramValue = '';
	if(angular.isDefined(operationKey) && angular.isDefined(paramsObj)){
		if(angular.isDefined(operationKey._property)){
			paramValue = _.get(paramsObj, operationKey._property)
			_.set(paramsObj, operationKey._name, paramValue);
			deepDelete(operationKey._property, paramsObj);
		}
	}
	return paramsObj;
}

function padout(number) {
	return (number < 10) ? '0' + number : number;
}

function reset_form_element (e) {
    e.wrap('<form>').parent('form').trigger('reset');
    e.unwrap();
}

/**
 * Disables everything in the given element.
 *
 * @param {HTMLElement} element
 */
var disableAll = function(element) {
    angular.element(element).addClass('disable-all');
    element.style.color = 'gray';
    disableElements(element.getElementsByTagName('input'));
    disableElements(element.getElementsByTagName('button'));
    disableElements(element.getElementsByTagName('textarea'));
    disableElements(element.getElementsByTagName('select'));
    element.addEventListener('click', preventDefault, true);
};

/**
 * Enables everything in the given element.
 *
 * @param {HTMLElement} element
 */
var enableAll = function(element) {
    angular.element(element).removeClass('disable-all');
    element.style.color = 'inherit';
    enableElements(element.getElementsByTagName('input'));
    enableElements(element.getElementsByTagName('button'));
    enableElements(element.getElementsByTagName('textarea'));
    enableElements(element.getElementsByTagName('select'));
    element.removeEventListener('click', preventDefault, true);
};

/**
 * Callback used to prevent user clicks.
 *
 * @param {Event} event
 * @returns {boolean}
 */
var preventDefault = function(event) {
    for (var i = 0; i < event.target.attributes.length; i++) {
        var atts = event.target.attributes[i];
        if(atts.name === "skip-disable"){
            return true;
        }
    }
    event.stopPropagation();
    event.preventDefault();
    return false;
};

/**
 * Disables given elements.
 *
 * @param {Array.<HTMLElement>|NodeList} elements List of dom elements that must be disabled
 */
var disableElements = function(elements) {
    var len = elements.length;
    for (var i = 0; i < len; i++) {
        var shouldDisable = true;
        for (var j = 0; j < elements[i].attributes.length; j++) {
            var atts = elements[i].attributes[j];
            if(atts.name === "skip-disable"){
                shouldDisable = false;
                continue;
            }
        }
        if (shouldDisable && elements[i].disabled === false) {
            elements[i].disabled = true;
            elements[i].disabledIf = true;
        }
    }
};

/**
 * Enables given elements.
 *
 * @param {Array.<HTMLElement>|NodeList} elements List of dom elements that must be enabled
 */
var enableElements = function(elements) {
    var len = elements.length;
    for (var i = 0; i < len; i++) {
        if (elements[i].disabled === true && elements[i].disabledIf === true) {
            elements[i].disabled = false;
            elements[i].disabledIf = null;
        }
    }
};