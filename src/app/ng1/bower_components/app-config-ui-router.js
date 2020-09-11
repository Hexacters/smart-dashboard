	'use strict';

	/**
	 * Define application context path
	 * @type string
	 */
	var appContextPath = '';
	
	/**
	 * Define application configuration
	 * @type {{}}
	 */
	//var appCon = {};

	/**
	 * Define application name
	 * @type string
	 */
	if (!appCon.appName) {
	    appCon.appName = 'vm';
	}

	/**
	 * Define angular versions 1.2.28 (=IE8), 1.3.13(>IE8, Firefox, Chrome, etc.,)
	 * @type array
	 */
	appCon.versions = ['1.2.28', '1.3.13'];

	/**
	 * Define new elements that are going dynamically create and tell to IE browser angular elements
	 * @type array
	 */
	appCon.newElements = ['ng-form', 'submit-data', 'get-data', 'vision-data-table', 'vision-form-extras', 'vision-action', 'login', 'token-login', 'logout', 'j-chart', 'autofocus', 'calendar', 'acl', 'ckeditor', 'when-scrolled', 'datepicker-popup', 'file-upload',
		              	    'auto-complete', 'show-error', 'multi-select', 'lpanel', 'cpanel', 'rpanel', 'cpanel2', 'rpanel2', 'vertical-scroll', 'server-side-grid', 'fixed-header',
		              	    'bar-chart', 'pie-chart', 'fullcalendar', 'modal-window', 'file-upload', 'tabset', 'tab', 'ui-select', 'angular-dropdown-multiselect',
		              	    'angucomplete-alt','jvector-map','vision-carousel', 'ui-select', 'ui-select-match','ui-select-choices','vision-check-all', 'image-cropper', 'toggle-switch', 'vision-tree'
		              	];
	/**
	 * Define data object that are used in API calls
	 * @type {{}}
	 */
	appCon.data = {};

	/**
	 * Initialize application dashboard by default null 
	 * @type array
	 */
	appCon.dashboard = null;

	/**
	 * Check the browser is IE or else
	 * @returns boolean
	 */
	appCon.isIE = function(version, comparison) {
	    var cc = 'IE',
	        b = document.createElement('B'),
	        docElem = document.documentElement,
	        isIE;

	    if (version) {
	        cc += ' ' + version;
	        if (comparison) {
	            cc = comparison + ' ' + cc;
	        }
	    }

	    b.innerHTML = '<!--[if ' + cc + ']><b id="iecctest"></b><![endif]-->';
	    docElem.appendChild(b);
	    isIE = !!document.getElementById('iecctest');
	    docElem.removeChild(b);
	    return isIE;
	};

	/**
	 * Get the browser version
	 * if version is IE8 then return angular version 1.2.x else 1.3.x
	 */
	appCon.selectedVersion = appCon.isIE(8) ? appCon.versions[0] : appCon.versions[1];
	if(appCon.isIE(8)) {
	    for (var i = 0; i < appCon.newElements.length; i++) {
	        document.createElement(appCon.newElements[i]);
	    }
	}
	/**
	 * Register router definitions and factory definitions
	 * @param data 
	 */
	appCon.registerRouterAndFactories = function(routersAndFactories) {

	    appCon.x2js = new X2JS();
	    console.log(appCon.globalCon);
		var extAppName = (appCon.globalCon.extAppName) ? '/'+appCon.globalCon.extAppName : '';
	    appCon.globalCon.extAppName = (appCon.globalCon.extAppName) ? '/'+appCon.globalCon.extAppName+'/' : '/';

	    angular.module(appCon.appName).config(function($injector, $provide, $locationProvider, $httpProvider, $translateProvider, $stateProvider, modalStateProvider, aclServiceProvider, $urlRouterProvider, $compileProvider) {

	        if(appCon.globalCon.html5Mode){
	        	$locationProvider.html5Mode({
	        		enabled: true,
	        		requireBase: false
	        	});
	        }
	    	
	    	/*if(appCon.globalCon.system.production && appCon.globalCon.system.production !== 'local'){
	    		$compileProvider.debugInfoEnabled(false);
	    	}*/
	    	
	        //Google analytics settings
	    	var GAPageTrack = angular.isDefined(appCon.globalCon['google.analytics.pageTrack']) ? appCon.globalCon['google.analytics.pageTrack'] : (angular.isDefined(appCon.globalCon.google) && angular.isDefined(appCon.globalCon.google.analytics) && angular.isDefined(appCon.globalCon.google.analytics.pageTrack)) ? appCon.globalCon.google.analytics.pageTrack : '',
		    	GAAccNo = angular.isDefined(appCon.globalCon['google.analytics.accountNumber']) ? appCon.globalCon['google.analytics.accountNumber'] : (angular.isDefined(appCon.globalCon.google) && angular.isDefined(appCon.globalCon.google.analytics) && angular.isDefined(appCon.globalCon.google.analytics.accountNumber)) ? appCon.globalCon.google.analytics.accountNumber : '';

	    	if (!appCon.globalCon.mock && GAPageTrack && GAPageTrack !== 'false' && GAAccNo !== '') {
	        	
	            var AnalyticsProvider = $injector.get('AnalyticsProvider');

	            AnalyticsProvider.setAccount(GAAccNo);
	            // Track all routes (or not)
	            AnalyticsProvider.trackPages(false);

	            // Track all URL query params (default is false)
	            AnalyticsProvider.trackUrlParams(false);

	            // Optional set domain (Use 'none' for testing on localhost)

	            AnalyticsProvider.setDomainName(appCon.globalCon.googleAnalytics.domainName ? appCon.globalCon.googleAnalytics.domainName : 'none');

	            // Use display features plugin
	            AnalyticsProvider.useDisplayFeatures(false);

	            // URL prefix (default is empty)
	            // - for example: when an app doesn't run in the root directory 
	            AnalyticsProvider.trackPrefix(appCon.globalCon.googleAnalytics.trackPrefix ? appCon.globalCon.googleAnalytics.trackPrefix : '');

	            // Use analytics.js instead of ga.js
	            AnalyticsProvider.useAnalytics(false);

	            // Ignore first page view... helpful when using hashes and whenever your bounce rate looks obscenely low.
	            AnalyticsProvider.ignoreFirstPageLoad(true);

	            // Change page event name
	            AnalyticsProvider.setPageEvent('$stateChangeSuccess');

	            // Delay script tag creation
	            // must manually call Analytics.createScriptTag(cookieConfig) or Analytics.createAnalyticsScriptTag(cookieConfig)
	            AnalyticsProvider.delayScriptTag(false);
	        }
	        
	        //Request and Response Transformation
	        $httpProvider.interceptors.push('httpInterceptor');

	        //Localization
	        appCon.globalCon.locale = 'en-US';
	        if (navigator.language && appCon.globalCon.supportedLanguages && appCon.globalCon.supportedLanguages.indexOf(navigator.language) > -1) {
	            appCon.globalCon.locale = navigator.language;
	        }

	        $translateProvider.preferredLanguage(appCon.globalCon.locale);
	        $translateProvider.useStaticFilesLoader({
	            prefix: 'app/ng1/locale/messages_properties_',
	            suffix: '.json'
	        });
	        
	        // load the ZeroClipboard.swf if included the app config modules.
	        if(_.includes(appCon.modules, 'zeroclipboard')){	        
		        var uiZeroclipConfigProvider = $injector.get('uiZeroclipConfigProvider');	        
		        uiZeroclipConfigProvider.setZcConf({
		            swfPath: 'bower_components/angular-zeroclipboard/ZeroClipboard.swf'
		        });
	        }

	        var jsonVals,
	            routerConfig,
	            routerViewConfig,
	            containerId,
	            serviceURL,
	            serviceName,
	            operationConfig,
	            makeHTTPRequest,
	            makeHTTPParam,
	            argumentsVal,
	            $stateObj;

			var updateRouterAndFactoriesToAngular = function(module){
				
				/**Convert router definitions from xml configuration register into $stateProvider*/
				routerConfig = (module.routers.router.length) ? module.routers.router : module.routers;

				angular.forEach(routerConfig, function(routerKey) {
					$stateObj = {
						config: {
							data: {},
							views: {},
							resolve: {}
						}
					};

					$stateObj.id = routerKey._id;
					//$stateObj.config.url = (routerKey._url) ? routerKey._url : '',
					if(routerKey._id.indexOf(".") === -1 && module._id != 'users'){
						$stateObj.config.url = (routerKey._url) ? extAppName+routerKey._url : '';
					}else{
						$stateObj.config.url = (routerKey._url) ? routerKey._url : '';
					}
					$stateObj.config.abstract = (routerKey._abstract && routerKey._abstract === 'true') ? true : '';
					$stateObj.config.sticky = (routerKey._sticky && routerKey._sticky === 'true') ? true : false;
					$stateObj.config.dsr = (routerKey._sticky && routerKey._sticky === 'true') ? true : false;
					$stateObj.config.data.auth = (routerKey._auth && routerKey._auth === 'true') ? true : false;
					//Check if only one view is defined for a router
					routerViewConfig = (routerKey.views.view.length) ? routerKey.views.view : routerKey.views;

					angular.forEach(routerViewConfig, function(routerViewKey) {
						containerId = (routerViewKey._containerId) ? routerViewKey._containerId : '';
						routerViewKey._templateUrl = routerViewKey._templateUrl +'?rnd='+appCon.globalCon.deployDate;
						if (routerKey._type && routerKey._type === 'dialog') {
							$stateObj.config.templateUrl = routerViewKey._templateUrl;
							if (containerId) {
								$stateObj.config.views['reusableDialog@'] = {};
								$stateObj.config.views['reusableDialog@'].template = '<div ui-view></div>';
							}
						} else {
							$stateObj.config.views[containerId] = {};
							$stateObj.config.views[containerId].templateUrl = routerViewKey._templateUrl;
						}
					});


					if (routerKey._auth && appCon.globalCon.authentication && appCon.globalCon.authentication.required) {
						$stateObj.config.resolve = {
							'auth': ['$q', '$cookieStore', function($q, $cookieStore) {
								if (routerKey._auth && routerKey._auth === 'true') {
									var userProfile = $cookieStore.get('userProfile');
									if (userProfile && userProfile !== 'null') {
										return true;
									} else {
										var error = {
											code: "UNAUTHORIZED"
										};
										return $q.reject(error);
									}
								}
							}]
						}
					}
					if (routerKey._resourceId && appCon.globalCon.authorization && appCon.globalCon.authorization.required) {
						$stateObj.config.resolve = {
							'acl': ['$q', 'aclService', '$timeout', function($q, AclService, $timeout) {
								var userPermission = localStorage.getItem('userPermission_'+appContextPath);
								if (userPermission && userPermission !== 'null') {
									if (AclService.canAccess('vm', routerKey._resourceId)) {
										return true;
									} else {
										var error = {
											code: "PERMISSION_DENIED"
										};
										return $q.reject(error);
									}
								}
							}]
						}
					}
					if (routerKey._type && routerKey._type === "dialog") {
						var modalClass = '';
						if(routerKey._modalClass){
							modalClass = routerKey._modalClass;
						}
						modalStateProvider.state($stateObj.id, $stateObj.config, modalClass);
					} else {
						$stateProvider.state($stateObj.id, $stateObj.config);
					}
				});
				
				/**
				 * Convert service definitions from xml configuration register into $factory   
				 */
				if (module.services) {

					serviceName = module.services._id;
					var operationConfig = (module.services.operations.operation.length) ? module.services.operations.operation : module.services.operations;
					//Loop the JSON and prepare the object for factory configuration
					var $returnFactory = {};
					$provide.factory(serviceName, ['$http', '$state', '$rootScope', '$q', function($http, $state, $rootScope, $q) {
						var canceler = [],httpRequestCount=0;
						angular.forEach(operationConfig, function(operationKey) {
							$returnFactory[operationKey._name] = function() {
								/**Make service url*/
								serviceURL = (operationKey._mockUrl) ? operationKey._mockUrl : "";
								if (!appCon.globalCon.mock && angular.isDefined(operationKey._mock) && operationKey._mock !== 'true') {
									if(operationKey._targetUrl){
										serviceURL = appCon.globalCon.serviceBaseURL + operationKey._url + "?targetURL=" + appCon.globalCon[operationKey._basePath] + operationKey._targetUrl;  
									}else{
										if (operationKey._basePath && appCon.globalCon[operationKey._basePath]) {
											serviceURL = (operationKey._url) ? appCon.globalCon[operationKey._basePath] + operationKey._url : "";
										} else {
											serviceURL = (operationKey._url) ? appCon.globalCon.serviceBaseURL + operationKey._url : "";
										}
									}
								}

								if (angular.isDefined(operationKey._serviceName)) {
									operationKey._name = operationKey._targetOperation ? operationKey._targetOperation : operationKey._name;
									if (serviceURL.indexOf("?") >= 0) {
										serviceURL += "&service=" + operationKey._serviceName + "&operation=" + operationKey._name;
									} else {
										serviceURL += "?service=" + operationKey._serviceName + "&operation=" + operationKey._name;
									}
								}

								/**Make http request with param either POST or GET method*/
								makeHTTPParam = {},
									argumentsVal = arguments;
								makeHTTPRequest = {
									method: operationKey._method.toUpperCase()
								};

								if (operationKey._method.toUpperCase() === 'POST') {
									makeHTTPRequest.url = serviceURL;
									if (operationKey.params) {
										if (typeof(argumentsVal[0]) === "undefined") {
											argumentsVal[0] = {};
										}
										var paramsConfig = (operationKey.params.param.length) ? operationKey.params.param : operationKey.params;
										angular.forEach(paramsConfig, function(operationParamKey) {
											if (operationParamKey._source === 'state' && $state.params[operationParamKey._key]) {
												_.set(argumentsVal[0], operationParamKey._name, $state.params[operationParamKey._key]);
											} else if (operationParamKey._source === 'rootScope' && $rootScope[operationParamKey._key]) {
												_.set(argumentsVal[0], operationParamKey._name, $rootScope[operationParamKey._key]);
											} else if (operationParamKey._source === 'userProfile') {
												setUserProfileToRequestParams($rootScope.userProfile, argumentsVal[0], operationParamKey);
											} else if (operationParamKey._source === 'static') {
												_.set(argumentsVal[0], operationParamKey._name, operationParamKey._value);
											} else {
												if (appCon.data[operationParamKey._module]) {
													_.set(argumentsVal[0], operationParamKey._name, appCon.data[operationParamKey._module][operationParamKey._key]);
												}
											}
											//update param with property from operation definition        
											argumentsVal[0] = updatePropertyName(argumentsVal[0], operationParamKey);
										});
									}
									if (operationKey._requestType && operationKey._requestType.toString().toLowerCase() === 'json') {
										makeHTTPRequest.data = transformRequest(argumentsVal[0], operationKey);
									} else {
										makeHTTPRequest.data = argumentsVal[0] ? $.param(argumentsVal[0]) : '';
										makeHTTPRequest.headers = {
											'Content-Type': 'application/x-www-form-urlencoded'
										};
									}

								} else if (operationKey._method.toUpperCase() === 'GET') {
									makeHTTPRequest.url = serviceURL;
									if (arguments && arguments[0]) {
										makeHTTPParam = arguments[0];
									}
									if (operationKey.params) {
										paramsConfig = (operationKey.params.param.length) ? operationKey.params.param : operationKey.params;
										angular.forEach(paramsConfig, function(operationParamKey) {
											if (operationParamKey._source === 'state' && $state.params[operationParamKey._key]) {
												_.set(makeHTTPParam, operationParamKey._name, $state.params[operationParamKey._key]);
											} else if (operationParamKey._source === 'rootScope' && $rootScope[operationParamKey._key]) {
												_.set(argumentsVal[0], operationParamKey._name, $rootScope[operationParamKey._key]);
											} else if (operationParamKey._source === 'userProfile') {
												setUserProfileToRequestParams($rootScope['userProfile'], makeHTTPParam, operationParamKey);
											} else if (operationParamKey._source === 'static') {
												_.set(makeHTTPParam, operationParamKey._name, operationParamKey._value);
											}  else {
												if (appCon.data[operationParamKey._module]) {
													_.set(makeHTTPParam, operationParamKey._name, appCon.data[operationParamKey._module][operationParamKey._key]);
												}
											}
											
											makeHTTPParam = updatePropertyName(makeHTTPParam, operationParamKey);
										});
									}
								}
								//Check path variable exist in the URL
								if( operationKey._url.indexOf(':') >=0 && (!appCon.globalCon.mock || !operationKey._mockUrl)) {
									var pathVariables = operationKey._url.split('/'); // Split the URL and find the path vars
									var i=0, pathVariablesLength = pathVariables.length;
									for(i;i < pathVariablesLength;i++){
										if(pathVariables[i].indexOf(':') >=0){
											if (operationKey._method.toUpperCase() === 'POST') {
												//Check path vars exist in the argument
												if(angular.isDefined(_.get(argumentsVal[0], pathVariables[i].substring(1,pathVariables[i].length)))){
													makeHTTPRequest.url = makeHTTPRequest.url.replace(pathVariables[i], _.get(argumentsVal[0], pathVariables[i].substring(1,pathVariables[i].length)));
												} 		                                				
												else{
													makeHTTPRequest.url = makeHTTPRequest.url.replace(pathVariables[i],'');
												}		                                				
											}
											if (operationKey._method.toUpperCase() === 'GET') {
												//Check path vars exist in the argument
												if(angular.isDefined(_.get(makeHTTPParam, pathVariables[i].substring(1,pathVariables[i].length)))){
													makeHTTPRequest.url = makeHTTPRequest.url.replace(pathVariables[i], _.get(makeHTTPParam, pathVariables[i].substring(1,pathVariables[i].length)));
													delete makeHTTPParam[pathVariables[i].substring(1,pathVariables[i].length)];
												} 		                                				
												else{
													makeHTTPRequest.url = makeHTTPRequest.url.replace(pathVariables[i],'');
												}		                                				
											}
										}
									}	                                	
								}
								// add query params after the path variable replaced.
								if (makeHTTPParam && operationKey._method.toUpperCase() === 'GET') {
									if (makeHTTPRequest.url.indexOf("?") >= 0) {
										makeHTTPRequest.url += "&" + transformRequest(makeHTTPParam, operationKey);
									} else {
										makeHTTPRequest.url += "?" + transformRequest(makeHTTPParam, operationKey);
									}
								}
								
								/*Response wrapper*/
								makeHTTPRequest.transformResponse = function(data, headers){
									return _transformResponse(data, headers, operationKey);
								}
								
								//Add canceler to stop the previous service call. 
								canceler[httpRequestCount] = $q.defer();
								makeHTTPRequest.timeout = canceler[httpRequestCount].promise;
								if($http.pendingRequests.length > 0){
									angular.forEach($http.pendingRequests, function(httpRequest) {
										if(httpRequest.url === makeHTTPRequest.url){
											canceler[httpRequestCount-1].resolve();
										}
									});
								}	
								++httpRequestCount;
								if(angular.isDefined(operationKey._operationType)){
									if(operationKey._operationType === 'export' || operationKey._operationType === 'file'){
										return makeHTTPRequest;	
									}
								}else{
									if(window.navigator.userAgent.indexOf("MSIE ") >= 0 && angular.isDefined(appCon.globalCon.synchronousCall)) {
										var deferred = $q.defer();
										return $http(makeHTTPRequest).success(function(data) {
											if(!appCon.globalCon.mock && appCon.globalCon.authentication && appCon.globalCon.authentication.required && appCon.globalCon.sessionExpiration){
												if($rootScope.sessionTimeoutDialog){
													$rootScope.sessionTimeoutDialog.close();
												}
												$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
											}
											deferred.resolve(data);
											return deferred.promise;
										});
									} else {
										return $http(makeHTTPRequest).success(function(data) {
											if(!appCon.globalCon.mock && appCon.globalCon.authentication && appCon.globalCon.authentication.required && appCon.globalCon.sessionExpiration){
												if($rootScope.sessionTimeoutDialog){
													$rootScope.sessionTimeoutDialog.close();
												}
												$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
											}
											return data;
										});
									}
								}
							};
						});
						return $returnFactory;
					}]);
				}
			}

			/*Register router and factories*/
	        if (angular.isArray(routersAndFactories)) {
	            angular.forEach(routersAndFactories, function(routerFactory) {

	                /**Convert xml into json*/
	                jsonVals = appCon.x2js.xml_str2json(routerFactory.data);
	                if(jsonVals.modules && angular.isArray(jsonVals.modules.module)){
						angular.forEach(jsonVals.modules.module, function(value, key){
							updateRouterAndFactoriesToAngular(jsonVals.modules.module[key]);
						});
					}else{
						updateRouterAndFactoriesToAngular(jsonVals.module);
					}
	                // if url is not match our router, load the default landing page.
	                if(!appCon.globalCon.mock){
		                if(appCon.cookie.getItem('dashboard') && appCon.cookie.getItem('dashboard') !== 'null'){
		                	if(appCon.globalCon.dashboards[appCon.cookie.getItem('dashboard')]){
		                		//$urlRouterProvider.when('',appCon.globalCon.extAppName+appCon.globalCon.dashboards[appCon.cookie.getItem('dashboard')].authTrueUrlLandingPage);
				                //$urlRouterProvider.otherwise(appCon.globalCon.extAppName+appCon.globalCon.dashboards[appCon.cookie.getItem('dashboard')].authTrueUrlLandingPage);
		                	}
		                	
						}else{
							//$urlRouterProvider.when('',appCon.globalCon.extAppName+ appCon.globalCon.defaultLandingPage);
			                //$urlRouterProvider.otherwise(appCon.globalCon.extAppName+ appCon.globalCon.defaultLandingPage);
						}
	                } else {
						//$urlRouterProvider.when('',appCon.globalCon.extAppName+ appCon.globalCon.defaultLandingPage);
			           // $urlRouterProvider.otherwise(appCon.globalCon.extAppName+ appCon.globalCon.defaultLandingPage);
					}
	            });
	        }
	    }).
	    run(['$rootScope', '$cookieStore', '$http', '$q', '$timeout', '$state', '$stateParams', '$location', '$modal', '$interval', 'authService', 'aclService', '$injector', '$filter',
	        function($rootScope, $cookieStore, $http, $q, $timeout, $state, $stateParams, $location, $modal, $interval, authService, aclService, $injector, $filter) {
	    	
	    		var contextPath = $location.absUrl(); // will tell you the current path
	    		appContextPath = contextPath.split('/')[3];
	    		
	            //Set application config in rootscope
	            $rootScope.$appConfiguration = appCon.globalCon;

	            var Analytics, userProfile, userPermission;
	            
	            //Enable google analytics page tracking
	            /*if (!appCon.globalCon.mock && appCon.globalCon.googleAnalytics && appCon.globalCon.googleAnalytics.required && appCon.globalCon.googleAnalytics.accountId !== ''){
	            	Analytics = $injector.get('Analytics');
	            }*/

	            //Set state and state params in rootscope - for use inside templates
	            $rootScope.$state = $state;
	            $rootScope.$stateParams = $stateParams;
	            
	            //Set IE8 status in rootscope
	            $rootScope.$ie8 = appCon.isIE(8) ? true : false;
	            
	            $rootScope.logout = function(loggedOutErrorMsg) {	            	
	            	authService.logout('','',loggedOutErrorMsg);	            		               
	            };
	            
	            //Check user authentication
	            if (appCon.globalCon.authentication && appCon.globalCon.authentication.required) {
	            	
	            	//Start - To check login authentication mode
	            	
	            	if(angular.isDefined(appCon.globalCon.authentication.mode) && appCon.globalCon.authentication.mode.toLowerCase() === 'sso'){
	            		authService.requestCurrentUser(true).then(function(result){
	            			authService.setPermissions().then(function(){
            					$rootScope.canPerform = aclService.canPerform; 
			        			$rootScope.canAccess = aclService.canAccess;
			        			
			        			/********* Session Timeout ****************/
			                    if(!appCon.globalCon.mock && appCon.globalCon.sessionExpiration){
			                    	$interval.cancel($rootScope.Timer);
				                    appCon.globalCon.sessionExpiration.sessionTimeOutValue = appCon.globalCon.sessionExpiration.sessionTimeoutInSec - 60;
			                		appCon.globalCon.sessionExpiration.sessionBeforeAlertValue = appCon.globalCon.sessionExpiration.sessionTimeOutValue - (appCon.globalCon.sessionExpiration.sessionTimeOutValue - appCon.globalCon.sessionExpiration.alertBeforeSec);
			                		var $modalStack = $injector.get('$modalStack');
			                		var lockTime = false;
				                    $rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
				                    $rootScope.Timer = $interval(function(){
					        			$rootScope.sessionTimeoutValue = $rootScope.initSessionTimeoutInterval;
					        			if($rootScope.sessionTimeoutValue == 0 && !lockTime){
					        				$interval.cancel($rootScope.Timer);
					        				$modalStack.dismissAll();
			                                $rootScope.logout('SESSION_EXPIRED');
			                                $rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
					        			}else if($rootScope.sessionTimeoutValue == appCon.globalCon.sessionExpiration.sessionBeforeAlertValue){
					        				$rootScope.sessionTimeoutDialog = $modal.open({
						 	                    template: appCon.prepareSessionExpireDialogContainer,
						 	                    backdrop: 'static',
						 	                    controller: function($scope, $modalInstance, $rootScope, $state) {	
						 	                    	$scope.lockTimeLoading = false;
						                            $scope.ok = function() {
						                            	lockTime = true;
						                            	$scope.lockTimeLoading = true;
						                            	$modalInstance.close();
						                            	$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;					                               
						                            	$injector.get(appCon.globalCon.sessionExpiration.service)[appCon.globalCon.sessionExpiration.operation]().then(function(result) {
						                            		lockTime = false;
						                            		$scope.lockTimeLoading = false;
						                            		$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
							                                $modalInstance.close();
						                                });				                            	
						                            };
						                            $scope.cancel = function() {
						                            	$interval.cancel($rootScope.Timer);
								        				$modalStack.dismissAll();
						                                $rootScope.logout();
						                                $rootScope.initSessionTimeoutInterval=appCon.globalCon.sessionExpiration.sessionTimeOutValue;
						                            };
						 	                    }
						 	                });
					        			}
					        			if($rootScope.sessionTimeoutValue > 0){
					        				$rootScope.initSessionTimeoutInterval--;
					        			}
					        		},1000);
			                    }
                    			
			        			if(appCon.dashboard === undefined || appCon.dashboard === null ) {
			        				appCon.dashboard = _.get({'userProfile' : result}, appCon.globalCon.dashboards.dashboardKey);
			        			}
                        		
                        		/* Set default dashboard landing page if undefined */
	                    		if((appCon.dashboard === undefined || appCon.dashboard === null ) && appCon.globalCon.defaultDashboard !== ''){
									appCon.dashboard = appCon.globalCon.extAppName+appCon.globalCon.defaultDashboard;
								}
								//appCon.cookie.setItem('dashboard', appCon.dashboard,false,appContextPath);
	                    		$cookieStore.put('dashboard', appCon.dashboard);
								if(angular.isDefined($state.params.destination) && $state.params.destination !== ''){
									$state.go($state.params.destination);
								}
								else if(appCon.globalCon.dashboards && appCon.globalCon.dashboards[appCon.dashboard] && appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage){
									//$location.path(appCon.globalCon.extAppName+appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage);	
								}else if(appCon.globalCon.defaultLandingPage){
									//$location.path(appCon.globalCon.extAppName+appCon.globalCon.defaultLandingPage);
								}
            				});
            			});
	            		// End - To check login authentication mode
	            	}
	            	else{
	            		//userProfile = appCon.cookie.getItem('userProfile');
	            		userProfile = $cookieStore.get('userProfile');
		            	if (userProfile && userProfile !== 'null') {
		                    
		                    /********* Session Timeout ****************/
		                    if(!appCon.globalCon.mock && appCon.globalCon.sessionExpiration){
		                    	$interval.cancel($rootScope.Timer);
			                    appCon.globalCon.sessionExpiration.sessionTimeOutValue = appCon.globalCon.sessionExpiration.sessionTimeoutInSec - 60;
		                		appCon.globalCon.sessionExpiration.sessionBeforeAlertValue = appCon.globalCon.sessionExpiration.sessionTimeOutValue - (appCon.globalCon.sessionExpiration.sessionTimeOutValue - appCon.globalCon.sessionExpiration.alertBeforeSec);
		                		var $modalStack = $injector.get('$modalStack');
		                		var lockTime = false;
			                    $rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
			                    $rootScope.Timer = $interval(function(){
				        			$rootScope.sessionTimeoutValue = $rootScope.initSessionTimeoutInterval;
				        			if($rootScope.sessionTimeoutValue == 0 && !lockTime){
				        				$interval.cancel($rootScope.Timer);
				        				$modalStack.dismissAll();
		                                $rootScope.logout('SESSION_EXPIRED');
		                                $rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
				        			}else if($rootScope.sessionTimeoutValue == appCon.globalCon.sessionExpiration.sessionBeforeAlertValue){
				        				$rootScope.sessionTimeoutDialog = $modal.open({
					 	                    template: appCon.prepareSessionExpireDialogContainer,
					 	                    backdrop: 'static',
					 	                    controller: function($scope, $modalInstance, $rootScope, $state) {	
					 	                    	$scope.lockTimeLoading = false;
					                            $scope.ok = function() {
					                            	lockTime = true;
					                            	$scope.lockTimeLoading = true;
					                            	$modalInstance.close();
					                            	$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;					                               
					                            	$injector.get(appCon.globalCon.sessionExpiration.service)[appCon.globalCon.sessionExpiration.operation]().then(function(result) {
					                            		lockTime = false;
					                            		$scope.lockTimeLoading = false;
					                            		$rootScope.initSessionTimeoutInterval = appCon.globalCon.sessionExpiration.sessionTimeOutValue;
						                                $modalInstance.close();
					                                });				                            	
					                            };
					                            $scope.cancel = function() {
					                            	$interval.cancel($rootScope.Timer);
							        				$modalStack.dismissAll();
					                                $rootScope.logout();
					                                $rootScope.initSessionTimeoutInterval=appCon.globalCon.sessionExpiration.sessionTimeOutValue;
					                            };
					 	                    }
					 	                });
				        			}
				        			if($rootScope.sessionTimeoutValue > 0){
				        				$rootScope.initSessionTimeoutInterval--;
				        			}
				        		},1000);
		                    }
		                    var windowLocation = window.location.href,
		                    	entryPointUrls = appCon.globalCon.authentication.entryPointUrls, 
		                    	urlMatched = false;
		                    	
	                		if(entryPointUrls.indexOf(',')>=0){
	                			var authenticationEntryPoints = entryPointUrls.split(',');
	                			for(var i =0; i<authenticationEntryPoints.length; i++){
	                				if(windowLocation.indexOf(authenticationEntryPoints[i])>=0 ){
	                					urlMatched = true;
	                				}
	                			}
	                		}else{
	                			if(entryPointUrls !== '') {
		                			if(windowLocation.indexOf(entryPointUrls)>=0){
		                				urlMatched = true;
		                			}
		                		}
	                		}
	                		$rootScope.userProfile = JSON.parse(userProfile);

		                    userPermission = localStorage.getItem('userPermission_'+appContextPath);
		                    if (userPermission && userPermission !== 'null') {
		                    	aclService.setPermissions(JSON.parse(userPermission));
			                    $rootScope.canPerform = aclService.canPerform;
			                    $rootScope.canAccess = aclService.canAccess;
		                    }
		                    
	                		if(urlMatched === false){
	                			if (appCon.globalCon.pageRefreshCallback){
			        				var fn = window[appCon.globalCon.pageRefreshCallback];
			        				fn($injector, appCon);
			        			}else{
			        				if($cookieStore.get('dashboard') && $cookieStore.get('dashboard') !== 'null'){
			        					$location.path(appCon.globalCon.extAppName+appCon.globalCon.dashboards[$cookieStore.get('dashboard')].authTrueUrlLandingPage);	                	
			        				}else{
			        					$location.path(appCon.globalCon.extAppName+appCon.globalCon.defaultLandingPage);
			        				}
			        			}
	                		}
		                } else {
		                	var windowLocation = window.location.href;
		                	if (appCon.globalCon.authentication && appCon.globalCon.authentication.required && appCon.globalCon.authentication.entryPointUrls) {
		                		var entryPointUrls = appCon.globalCon.authentication.entryPointUrls;
		                		if(entryPointUrls.indexOf(',')>=0){
		                			var authenticationEntryPoints = entryPointUrls.split(','), urlMatched = false;
		                			for(var i =0; i<authenticationEntryPoints.length; i++){
		                				if(windowLocation.indexOf(authenticationEntryPoints[i])>=0 ){
		                					urlMatched = true;
		                				}
		                			}
		                			if(urlMatched === false){
		                				$location.path('/' + appCon.globalCon.authentication.page);
		                			}
		                		}else{
		                			if(entryPointUrls !== '') {
			                			if(windowLocation.indexOf(entryPointUrls)<0 ){
			                				$location.path('/' + appCon.globalCon.authentication.page);
			                			}
			                		}else{
			                			$location.path('/' + appCon.globalCon.authentication.page);
			                		}
		                		}
		                	}else{
		                		$location.path('/' + appCon.globalCon.authentication.page);
		                	}
		                }
	            	}
	            }

	            //Check session and redirect to specific page
	            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
	            	            	
	            	$rootScope.currentState = toState;
	            	$rootScope.currentStateParams = toParams;
	            	
	            	$rootScope.previousState = fromState;
	            	$rootScope.previousStateParams = fromParams;
	            	
	            	/**Redirecting the dashboard if user comes to login state directly from url hit or browsers history */
	            	if(toState.name === appCon.globalCon.authentication.page){
	            		if (appCon.globalCon.authentication && appCon.globalCon.authentication.required) {
	    	                //userProfile = appCon.cookie.getItem('userProfile');
	            			userProfile = $cookieStore.get('userProfile');	            			
	    	                if (userProfile && userProfile !== 'null') {
	    	                	if(appCon.globalCon.dashboards && appCon.globalCon.dashboards[appCon.dashboard] && appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage){
									$location.path(appCon.globalCon.extAppName+appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage);	
								}else{
									$location.path(appCon.globalCon.extAppName+appCon.globalCon.defaultLandingPage);
								}
	    	                }
	    	            }
	            		if(!appCon.globalCon.mock){
							$interval.cancel($rootScope.Timer);	
							$rootScope.initSessionTimeoutInterval=appCon.globalCon.sessionExpiration.sessionTimeOutValue;
						}
	            	}
	            });
	            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
	                if (angular.isObject(error) && angular.isString(error.code)) {
	                    switch (error.code) {
	                        case 'PERMISSION_DENIED':
	                            event.preventDefault();
	                            $location.path("/" + appCon.globalCon.authorization.page);
	                            break;
	                        case 'UNAUTHORIZED':
	                            event.preventDefault();
	                            $location.path("/" + appCon.globalCon.authentication.page);
	                            break;
	                        default:
	                            //do nothing;
	                            break;
	                    }
	                }
	            });

	            //Prepare modal dialog for session expiration alert
	            if (appCon.globalCon.sessionExpiration && appCon.globalCon.sessionExpiration.alert) {

	                $rootScope.openSessionExpDialog = function() {
	                    $modal.open({
	                        template: appCon.prepareSessionExpDiaContainer,
	                        backdrop: 'static',
	                        controller: function($scope, $modalInstance, $rootScope, $state) {

	                            $rootScope.modalInstanceSessionExpDialog = $modalInstance;
	                            $scope.ok = function() {
	                                appCon.globalCon.sessionExpiration.sessionTimeoutInSec = appCon.globalCon.sessionExpiration.maxInactiveInterval - 10;
	                                $modalInstance.close();
	                            };

	                            $scope.cancel = function() {
	                                $interval.cancel(appCon.globalCon.sessionExpiration.setInterval);
	                                $modalInstance.close();
	                                $rootScope.logout();
	                            };

	                        }
	                    });
	                };
	            }

	            $rootScope.commonAlertDialog = function() {
	                $modal.open({
	                    template: appCon.prepareCommonAlertDialogContainer,
	                    backdrop: 'static',
	                    controller: function($scope, $modalInstance, $rootScope, $state) {
	                        $scope.ok = function() {
	                            $modalInstance.close();
	                        };
	                    }
	                });
	            };
	            
	            $rootScope.toasterOptions = {'time-out': 10000,
						            	      'close-button': true,
						            	      'position-class': 'toast-center',
						            	      'limit':1,
						            	      'tap-to-dismiss':false //Clicked anywhere on the toast body, the toast will be dismissed.
						            	     };
	            
	            $rootScope.showToaster = function (messageTitleCode, messageType, messageBody) {
					 if(_.includes(appCon.modules, 'toaster')){
						var toaster = $injector.get('toaster');
						if (messageTitleCode) {
							var messageTitle= $filter('translate')(messageTitleCode);
							toaster.pop({
								type: messageType || 'error',
								title: messageTitle,
								body: messageBody,
								bodyOutputType: 'trustedHtml'
							});							
						}
					 }				
				};

	            /*$rootScope.logout = function(loggedOutErrorMsg) {
	                authService.logout('','',loggedOutErrorMsg);
	            };*/
	        }
	    ]);
	};

	//Cookies read & write program
	appCon.cookie = {
	    getItem: function(sKey) {
	        if (!sKey) {
	            return null;
	        }
	        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	    },
	    setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
	        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
	            return false;
	        }
	        var sExpires = "";
	        if (vEnd) {
	            switch (vEnd.constructor) {
	                case Number:
	                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
	                    break;
	                case String:
	                    sExpires = "; expires=" + vEnd;
	                    break;
	                case Date:
	                    sExpires = "; expires=" + vEnd.toUTCString();
	                    break;
	            }
	        }
	        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	        return true;
	    },
	    removeItem: function(sKey, sPath, sDomain) {
	        if (!this.hasItem(sKey)) {
	            return false;
	        }
	        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
	        return true;
	    },
	    hasItem: function(sKey) {
	        if (!sKey) {
	            return false;
	        }
	        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	    },
	    keys: function() {
	        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
	        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
	            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
	        }
	        return aKeys;
	    }
	};

	/**
	 * prepare html container for alert dialog container
	 */
	appCon.prepareCommonAlertDialogContainer = function() {
	    var popuDivHtmlContent = '';
	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-header">';
	    popuDivHtmlContent = popuDivHtmlContent + '<h3 class="modal-title" style="font-size:14px;font-weight:bold;">{{commonAlertDialogTitle}}</h3>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-body">';
	    popuDivHtmlContent = popuDivHtmlContent + '<div class="bd">';
	    popuDivHtmlContent = popuDivHtmlContent + '<div style="float:none;">';
	    popuDivHtmlContent = popuDivHtmlContent + '<p ng-bind-html="commonAlertDialogContent | trustAsHtml"></p>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-footer">';
	    popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-info" ng-click="ok()">OK</button>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    return popuDivHtmlContent;
	};
	
	/**
	 * prepare html container for confirmation dialog container
	 */
	appCon.prepareCommonConfirmationDialogContainer = function() {
	    var popuDivHtmlContent = '';
	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-header">';
	    popuDivHtmlContent = popuDivHtmlContent + '<h3 class="modal-title" style="font-size:14px;font-weight:bold;">{{commonConfirmationDialogTitle}}</h3>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-body">';
	    popuDivHtmlContent = popuDivHtmlContent + '<div class="bd">';
	    popuDivHtmlContent = popuDivHtmlContent + '<div style="float:none;">';
	    popuDivHtmlContent = popuDivHtmlContent + '<p ng-bind-html="commonConfirmationDialogErrorContent"></p>';
	    popuDivHtmlContent = popuDivHtmlContent + '<p ng-bind-html="commonConfirmationDialogContent"></p>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-footer">';
	    popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-info" ng-click="ok()">OK</button>';
	    popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-danger" ng-click="cancel()">Cancel</button>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    return popuDivHtmlContent;
	};
	
	/**
	 * prepare html container for Session Expire dialog container
	 */
	appCon.prepareSessionExpireDialogContainer = function() {
	    var popuDivHtmlContent = '';
	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-header">';
	    popuDivHtmlContent = popuDivHtmlContent + '<h3 class="modal-title" style="font-size:14px;font-weight:bold;">Session Expiration Alert</h3>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-body">';
	    popuDivHtmlContent = popuDivHtmlContent + '<div class="bd">';
	    popuDivHtmlContent = popuDivHtmlContent + '<div style="float:none;">';
	    popuDivHtmlContent = popuDivHtmlContent + '<p ng-bind-html="commonConfirmationDialogErrorContent"></p>';
	    popuDivHtmlContent = popuDivHtmlContent + '<p ng-show="lockTimeLoading" class="loading-container-data"></p>';
	    popuDivHtmlContent = popuDivHtmlContent + 'Your session is about to expire in <span id="sessionTimeoutSpan" style="color:red;">{{sessionTimeoutValue}}s</span>. Do you want to extend it?';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-footer">';
	    popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-info" ng-disabled="lockTimeLoading" ng-click="ok()">Yes</button>';
	    popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-danger" ng-disabled="lockTimeLoading" ng-click="cancel()">No</button>';
	    popuDivHtmlContent = popuDivHtmlContent + '</div>';

	    return popuDivHtmlContent;
	};

	/**
	 * Create alert dialogue for displaying session expirations & initiate method for session timeout counter
	 * The following $rootScope variables are used for this operation
	 * $rootScope.openSessionExpDialog()
	 * $rootScope.modalInstanceSessionExpDialog
	 * $rootScope.formatTimeLeft
	 */
	appCon.prepareSessionTimeOutCheck = function($rootScope, $state, $timeout) {
	    appCon.globalCon.sessionExpiration.sessionTimeoutInSec = appCon.globalCon.sessionExpiration.alertFromSec;
	    appCon.globalCon.sessionExpiration.setInterval = $interval(function() {
	        appCon.doSessionTimeOutCheck($interval, $rootScope, $state);
	    }, 1000);
	};

	/**
	 * Check the sessiontimeout (counter- global variable) in every 1 second 
	 */
	appCon.doSessionTimeOutCheck = function($interval, $rootScope, $state) {
	    var left_minutes = 0,
	        left_seconds = 0,
	        formatTimeLeft = "";

	    appCon.globalCon.sessionExpiration.sessionTimeoutInSec = appCon.globalCon.sessionExpiration.sessionTimeoutInSec - 1;
	    var sessionTimeoutInSecs = appCon.globalCon.sessionExpiration.sessionTimeoutInSec;

	    if (sessionTimeoutInSecs == appCon.globalCon.sessionExpiration.alertFromSec) {

	        left_minutes = parseInt(sessionTimeoutInSecs / 60);
	        left_seconds = parseInt(sessionTimeoutInSecs % 60);
	        formatTimeLeft = (left_minutes !== 0) ? left_minutes + 'm' : '';
	        formatTimeLeft += (left_minutes !== 0 && left_seconds !== 0) ? ', ' : '';
	        formatTimeLeft += (left_seconds !== 0) ? left_seconds + 's ' : '';
	        $rootScope.formatTimeLeft = formatTimeLeft;
	        $rootScope.openSessionExpDialog();
	    } else if (sessionTimeoutInSecs <= 0) {

	        $rootScope.modalInstanceSessionExpDialog.close();
	        $interval.cancel(appCon.globalCon.sessionExpiration.setInterval);
	        $rootScope.logout();
	        
	    } else if (sessionTimeoutInSecs < appCon.globalCon.sessionExpiration.alertFromSec) {

	        left_minutes = parseInt(sessionTimeoutInSecs / 60);
	        left_seconds = parseInt(sessionTimeoutInSecs % 60);
	        formatTimeLeft = (left_minutes !== 0) ? left_minutes + 'm' : '';
	        formatTimeLeft += (left_minutes !== 0 && left_seconds !== 0) ? ', ' : '';
	        formatTimeLeft += (left_seconds !== 0) ? left_seconds + 's ' : '';
	        $rootScope.formatTimeLeft = formatTimeLeft;
	    }
	};