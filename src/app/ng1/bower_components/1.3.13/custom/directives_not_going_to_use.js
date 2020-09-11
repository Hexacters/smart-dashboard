(function () {
	/**
	 * vmAction Directive
	 * 
	 * Get data from service using either GET or POST method
	 * Submit the form to external service to save or update information given by user
	 * 
	 */
	angular.module(appCon.appName).directive('vmAction', function($rootScope) {
		return {
	        restrict : 'EA',
	        scope : true,
	        controller : "vmActionController" 
		};
	});
	
	angular.module(appCon.appName).controller("vmActionController", [ "$injector", "$element", "$scope", "$state", "$rootScope", function($injector, $element, $scope, $state, $rootScope){

		var $parse = $injector.get("$parse"),
			getData = $element.children('get-data'),
	    	submitData = $element.children('submit-data'),
	    	formTag = $element.find('form'),
	    	getServiceName, 
	    	getOperationName, 
	    	submitServiceName,
	    	submitOperationName,
	    	params, 
	    	rootNode, 
	    	formNode,
	    	responseModel,
	    	redirectState,
	    	redirectStateParams;
		
		var loadGetData = function(){
			$injector.get(getServiceName)[getOperationName](params).then(function(result) { 
	        	/**
	        	 * Assign response into specified scope model
	        	 * @rootNode - Which node from response json is going to be used in template
	        	 * @formNode - Which object from template scope is going to submit into service 
	        	 * Unused object deleted from scope (i.e scope.data).
	        	 */
	        	rootNode = getData.attr('root-node');
	        	formNode = getData.attr('form-node');
	        	
	        	$scope.loading = false;
	        	$rootScope.loading = false;
	        	if(result.data.status==="success"){
	        		$scope.data = result.data;
		        	if(angular.isDefined(rootNode)){
		        		responseModel = $parse(rootNode)($scope);
		        		delete $scope.data;
		        		
		        		if(angular.isDefined(formNode)){
		        			$parse(formNode).assign($scope, responseModel);
		        		}else{
		        			$scope.data = responseModel;
		        		}
		        	}else if (angular.isDefined(formNode)){
		        		$parse(formNode).assign($scope, result.data);
		        		delete $scope.data;
		        	}
	        	}else if(result.data.status==="error"){
	        		$scope.getError = result.data;
	        	}
	            
	        }, function(error){
	        	$scope.loading = false;
	        	$rootScope.loading = false;
	        	$scope.getError = error.data;
	        }); 
		};
		
		if (getData.attr('service')) {
	    	getServiceName = getData.attr('service');
	    	getOperationName = getData.attr('operation');
	    	params = getData.attr('params'); 
	    	
	    	//Show loading container from template
	        $scope.loading = true;
	        $rootScope.loading = true;
	        
	        if (getData.attr('params')){
		        $scope.$watch(
		        	function() {
		        		return getData.attr('params');
					}, 
					function(newValue) {
						if(newValue.indexOf("{{") < 0){
							params = JSON.parse(newValue);
							loadGetData();
						}
					}
				);
	        }else{
	        	loadGetData();
	        }
	    }

	    //Submit data
	    if (submitData.attr('service')) {
	    	$scope.submit = function() {
	    		submitServiceName = submitData.attr('service');
	        	submitOperationName = submitData.attr('operation');
	        	submitFormNode = submitData.attr('form-node') ? submitData.attr('form-node') : "data";
	        	
	        	var removeKeys = submitData.attr('remove-keys') ? submitData.attr('remove-keys') : "";
	        	
	        	if ($scope[formTag.attr('name')].$valid) {
	                $scope.loading = true;
	                $rootScope.loading = true;
	                params = $parse(submitFormNode)($scope);
	                
	                if(removeKeys && removeKeys.length > 0){
	                	if(removeKeys.indexOf(",")>=0){
	                		removeKeys = removeKeys.split(",");
	                	}
	                	
	                	params = deleteKeysFromObject(params, removeKeys);
	                }
	                
	                $scope.promise = $injector.get(submitServiceName)[submitOperationName](params).then(
	                	function(result) {
	                		
	                		$scope[formTag.attr('name')].$setPristine(true);
	                		$scope.loading = false;
	                		$rootScope.loading = false;
	                		
	                		if(result.data.status==="success"){
	                			redirectState = submitData.attr('redirectState');
	                			redirectStateParams = submitData.attr('redirectStateParams');
		                		
		                		if (redirectState) {
	                                if(typeof $scope.cancelDialog === 'function'){
	                                	$scope.cancelDialog();                                    
	                                }
	                                if (angular.isDefined(redirectStateParams) && angular.isString(redirectStateParams)) {
	                                	redirectStateParams = JSON.parse(redirectStateParams.replace(/'/g, '"'));
	                                }
	                                
	                                if ($state.includes(redirectState)){
	                                	$state.go(redirectState, redirectStateParams, {reload:true});
	                                }else{
	                                	$state.go(redirectState, redirectStateParams);	
	                                }
	                            }else{
	                            	$scope.submitSuccess = result.data;
	                            }
	                		}else if (result.data.status==="error"){
	                			$scope.submitError = result.data;
	                		}
		                },
		                function(error){
		                	$scope[formTag.attr('name')].$setPristine(true);
		                	$scope.submitError = error.data;
		                	$scope.loading = false;
		                	$rootScope.loading = false;
		                }
	                );
	            }
	        };
	
	        $scope.cancel = function() {
	            $state.go(submitData.attr('cancel-redirect'));
	        };
	    }
	}]);
	
	//TODO : Custom form events are binded here - review and cleanup
	angular.module(appCon.appName).directive('vmFormExtras', function($rootScope) {
		return {
	        restrict : 'A',
	        scope : false,
	        controller : "vmFormExtrasController"
		};
	});
	
	angular.module(appCon.appName).controller("vmFormExtrasController", [ "$injector", "$scope", "$parse", "$modal", "$state", "$translate", "$rootScope", function($injector, $scope, $parse, $modal, $state, $translate, $rootScope){
		/**Add row*/
	    $scope.addRowItem = function(arrayDataObj, dataObj) {
	    	var dataModel; 
	    	if(angular.isDefined(arrayDataObj) && angular.isString(arrayDataObj)){
	    		dataModel = $parse(arrayDataObj)($scope);
	    	}
	    	dataModel.push(dataObj);
	    	$parse(arrayDataObj).assign($scope, dataModel);
	    };
	    
	    /**Remove row*/
	    $scope.removeRowItem = function(arrayDataModel, index) {
	    	if(angular.isUndefined(arrayDataModel)){ 
	    		return ;
	    	}
	    	if(angular.isArray(arrayDataModel)){
	    		arrayDataModel.splice(index, 1);
	    	}
	    };
	    
	    /**Replace space*/
	    $scope.replaceMultipleSpace = function(model, replaceString){
	    	if(angular.isDefined(model)){
	    		return model.replace(/\s+/g, replaceString);	
	    	}
	    };
	
	    /**Call Event*/
	    $scope.callFormEvent = function(service, operation, params, config, index) {
	    	if(angular.isDefined(params) && angular.isString(params)){
	    		params = JSON.parse(params);
	    	}
	    	if(angular.isDefined(service) && service !== "" && angular.isDefined(operation) && operation !== ""){
	    		
	    		if(angular.isDefined(config) && config.type === "deleteModel"){
	    			$scope.showDeleteModal(config.message,config.title).then(function() {
	    				formEventServiceCall(service, operation, params, config, index);
	    			});
	    		}else{
	    			formEventServiceCall(service, operation, params, config, index);
	    		}
	    	}
	    };
	    
	    $scope.showDeleteModal = function (message, title) {
	    	$scope.requestMessage = $translate.instant(message);
	    	$scope.modalTitle = $translate.instant(title);
			var modalInstance = $modal.open({
				templateUrl : 'DeleteAlert.html',
				scope : $scope,
				windowClass:"alert-sm"
			});
			return modalInstance.result;
	    };
	    
	    $scope.showErrorModal = function (errorMessage, title) {
			$scope.errorMessage = errorMessage;
			$scope.modalTitle = title;
			var modalInstance = $modal.open({
				templateUrl : 'ErrorAlert.html',
				scope : $scope,
				windowClass:"alert-sm"
			});
			return modalInstance.result;
	    };
	    
	    var formEventServiceCall = function(service, operation, params, config, index){
	    	$scope.loading = true;
	    	$rootScope.loading = true;
			$injector.get(service)[operation](params).then(
				function(result){
					$scope.loading = false;
					$rootScope.loading = false;
					if(result.data.status === 'success') {
						$scope.successData = result.data;						
						if(angular.isDefined(config) && angular.isObject(config)){
							if(config.type === "deleteModel" && angular.isDefined(config.dataModel)){
								$scope.removeRowItem(config.dataModel, index);
								if(angular.isDefined(config.reloadTable)){
									if(config.reloadTable.$params.page === 1){
										config.reloadTable.reload();
									}else{
										config.reloadTable.$params.page=1;
									}									
								}else if(angular.isDefined(config.reloadState)) {
									var reloadStateParams = {};
									if(angular.isDefined(config.reloadStateParams)){
										reloadStateParams = config.reloadStateParams;
									}
									$state.go(config.reloadState, reloadStateParams, { reload: true });
								}
							}else if (config.type === "updateModel"){
								if(angular.isDefined(config.dataModel)){
									if(config.rootNode){
										$scope.data = result.data;  
										$parse(config.dataModel).assign($scope,$parse(config.rootNode)($scope));
									}else{
										$parse(config.dataModel).assign($scope, result.data);
									}
								}	
								if(angular.isDefined(config.reloadTable)){
									if(config.reloadTable.$params.page === 1){
										config.reloadTable.reload();
									}else{
										config.reloadTable.$params.page=1;
									}
								}else if(angular.isDefined(config.reloadState)) {
									var reloadStateParams = {};
									if(angular.isDefined(config.reloadStateParams)){
										reloadStateParams = config.reloadStateParams;
									}
									$state.go(config.reloadState, reloadStateParams, { reload: true });
								}
							}
						}
					}else {
						$scope.showErrorModal(result.data.errorData,"Alert");
					}
				},
				function(error){
					$scope.errorData = error.data;
					$scope.loading = false;
					$rootScope.loading = false;
				}
			);
	    };
	}]);

	/**
	 *Login directive
	 */
	angular.module(appCon.appName).directive('login', function($injector){
	    var directive = {};
	    directive.restrict = 'A';
	    directive.scope = true;
	
	    /* Setup providers */
	    var $rootScope, $state, $cookieStore, tokenHeader, $location, $http, $interval; 
	    
	    $http = $injector.get("$http");
	    $rootScope = $injector.get("$rootScope");
	    $state = $injector.get("$state");
	    
	    $cookieStore = $injector.get("$cookieStore");
	    $location = $injector.get("$location");
	    $interval = $injector.get("$interval");
	    
	    authService = $injector.get("authService");
	    aclService = $injector.get("aclService");
	    
	    directive.compile = function(element, attributes) {
	
	        var linkFunction = function($scope, element, attributes) {
	        	
	            var submitData = element.children('submit-data'),
	                formTag = element.find('form'),
	                sc_module, sc_key, sc_value,
	                serviceName, operationName;
	
	            /* Submit login request */
	            if (submitData.attr('service')) {
	                serviceName = submitData.attr('service');
	                operationName = submitData.attr('operation');
	
	                $scope.submit = function() {
	                    if ($scope[formTag.attr('name')].$valid) {
	                    	$scope.loading=true;
	                    	$rootScope.loading = true;
	                    	
	                    	/* API call */
	                        $injector.get(serviceName)[operationName]($scope.data).then(
	                        	
	                        	/* Request Success */
	                        	function(result) { 
	                        		if (result.data.status === 'success') {
	                        			element.hide();
	                        			
	                        			$cookieStore.put('userInfo', result.data.successData);
	                        			
	                        			authService.requestCurrentUser(true).then(function(userProfile){
	                        				authService.setPermissions().then(function(){
	                        					
	                        					$rootScope.canPerform = aclService.canPerform; 
	    					        			$rootScope.canAccess = aclService.canAccess;
	    	                        			
	    		                        		appCon.dashboard = getValueFromObjByString(result.data.successData, appCon.globalCon.dashboards.dashboardKey);
	    					                    
	    		                        		/* Set default dashboard landing page if undefined */
	    		                        		if((appCon.dashboard === "undefined" || appCon.dashboard === null ) && appCon.globalCon.defaultDashboard !== ""){
	    											appCon.dashboard = appCon.globalCon.defaultDashboard;
	    										}
	    										appCon.cookie.setItem('dashboard', appCon.dashboard);
	    										if(appCon.globalCon.dashboards && appCon.globalCon.dashboards[appCon.dashboard] && appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage){
	    											$location.path("/"+appCon.globalCon.dashboards[appCon.dashboard].authTrueUrlLandingPage);	
	    										}else{
	    											$location.path("/"+appCon.globalCon.defaultLandingPage);
	    										}
	                        				})
	                        			});
                						
										$scope.loading=false;
		                        		$rootScope.loading = false;
		                        	} else if (result.data.status === 'error' ){
		                        		$scope.loginError = result.data;
		                        		$scope.loading=false;
		                        		$rootScope.loading = false;
		                        	} 
	                        	},
		                        /* Request Failure */
		                        function(error){
		                        	$scope.loading=false;
		                        	$rootScope.loading = false;
		                        	$scope.loginError = JSON.parse(handleError(error.data));
		                        	element.show();
		                        }
		                    );
	                    }
	                };
	            }
	        }
	        return linkFunction;
	    }
	    return directive;
	});
	
	//datatable
	angular.module(appCon.appName).directive('clientGrid', ['$filter', 'ngTableParams','$injector','$state', "$parse", function($filter, ngTableParams, $injector, $state, $parse) {
	    var directive = {};
	    directive.restrict = 'EA';
	    directive.scope = true;

	    directive.compile = function(element, attributes) {
	        var linkFunction = function($scope, element, attributes) {
	        	
	        	var results = [];
	        	
	        	var recordsPerPage = attributes.recordsPerPage ? attributes.recordsPerPage : "10";
	            var config = attributes.config;
	            if (config != undefined) {
	                config = JSON.parse(config.replace(/'/g, '"'))
	            } else {
	                config = {};
	            }
	            config = angular.extend({}, {
	                page: 1,
	                count: recordsPerPage
	            }, config);

	        	
	        	var tableTag = element.find('table');
	            $scope[tableTag.attr('ng-table')] = new ngTableParams(config, {
	                getData: function($defer, params) {
	                	if(results){
		                	// use build-in angular filter
		                    var filteredData = params.filter() ?
		                        $filter('filter')(results, params.filter()) :
		                        results;
		                    var orderedData = params.sorting() ?
		                        $filter('orderBy')(filteredData, params.orderBy()) :
		                        results;
		                    params.total(orderedData.length); // set total for recalc pagination
		                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		                }
	                }
	            });
	        	
	            $scope.$watch('data', function() {
	            	if ($scope.data !== undefined ) {
	            		results = $parse(attributes.rootNode)($scope);
	            		$scope[tableTag.attr('ng-table')].reload();
	                }
	            });
	        };
	        return linkFunction;
	    };
	    return directive;
	}]);
	
	//datetime picker popup
	angular.module(appCon.appName).directive('datetimePicker', ["$compile", "$parse", "$document", "$position", "dateFilter", "dateParser", "uiDatetimePickerConfig", function(a, b, c, d, e, f, g) {
	    var directive = {};
	    directive.restrict = 'EA';
	    directive.link = function($scope, element, attrs) {	    	
	        $scope.openCalendar = function($event, date) {
	            $event.preventDefault();
	            $event.stopPropagation();
	            $scope.open = {};
	            $scope.open[date] = true;
	        };
	    }	
	    return directive;
	}]);
	
	//File Upload Directive   
	angular.module(appCon.appName).directive('fileUpload', ['FileUploader', function($injector, $rootScope, $state, $parse, $window, $cookieStore, $http) {
		var maxUploadFileCount = 1, 
	    maxFileSize = 1, 
	    allowedExtensions= '', 
	    isMockEnabled=false, 
	    configUploadUrl='', 
	    autoUpload=appCon.globalCon.file.autoUpload ? appCon.globalCon.file.autoUpload : false, 
	    configMaxfileSize= appCon.globalCon.file.maxFileSize?appCon.globalCon.file.maxFileSize:1,
	    allowedFileSize = configMaxfileSize, 	
	    maxFileSize = (allowedFileSize) * 1024 * 1024,
	    uploader;
	    return {
	        restrict: 'EAC',
	        templateUrl: 'fileupload.html',
	        scope: {
	            maxFiles: '=',
	            fileSize: '=',
	            fileExtensions: '=',
	            filesList: '=',
	            screenMode: '@'
	        },
	        controller: function($scope, FileUploader, $element, $attrs, $parse, $window, $cookieStore, $http, $translate) {

	    	    maxUploadFileCount = $attrs.maxUploadFileCount ? $attrs.maxUploadFileCount:1, 
	    	    allowedExtensions = $attrs.fileExtensions ? $attrs.fileExtensions:'*';
	    	    $scope.maxUploadFileCount = maxUploadFileCount;
	    	    var returnField = $attrs.returnField?$attrs.returnField:'id';
	    	    var returnType = $attrs.returnType?$attrs.returnType:'comma';
	    	    var requestType = $attrs.requestType ? $attrs.requestType:'query';
	    	    
	            isMockEnabled = appCon.globalCon.mock;
	            if (isMockEnabled == true) {
	                configUploadUrl = appCon.globalCon.file.mockUrl;
	            } else {
	                configUploadUrl = appCon.globalCon.serviceBaseURL+appCon.globalCon.file.uploadURL;
	            }
	            
	            if (angular.isDefined($attrs.fileSize)) {
	               allowedFileSize = $attrs.fileSize;
	               maxFileSize = (allowedFileSize) * 1024 * 1024;
	            }
	            
	            allowedExtensions = allowedExtensions.replace(/,/g, "|");
	            allowedExtensions = allowedExtensions.replace("[", "|");
	            allowedExtensions = allowedExtensions.replace("]", "|");
	            $scope.uploadedItems = [];
	            uploader = $scope.uploader = new FileUploader({
	            	headers:{'token': $cookieStore.get('token')},
	            	url: configUploadUrl,
	                autoUpload : autoUpload
	            });
	            // Added Filter For File Type
	            uploader.filters.push({
	                name: 'typeFilter',
	                fn: function(item /*{File|FileLikeObject}*/ , options) {
	                    var fileExtension = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';
	                    return allowedExtensions.indexOf(fileExtension) !== -1;
	                }
	            });
	            // Added Filter For Single File Size
	            uploader.filters.push({
	                name: 'sizeFilter',
	                fn: function(item /*{File|FileLikeObject}*/ , options) {
	                    return item.size <= maxFileSize;
	                }
	            });
	            // Added Filter For File Count
	            uploader.filters.push({
	                name: 'customFilter',
	                fn: function(item /*{File|FileLikeObject}*/ , options) {
	                    return $scope.uploadedItems.length < maxUploadFileCount;
	                }
	            });
	            
	            //file name length
	            uploader.filters.push({
	                name: 'fileNameLengthFilter',
	                fn: function(item /*{File|FileLikeObject}*/ , options) {
	                    return item.name.length < 100;
	                }
	            });
	            
	            uploader.filters.push({
	                name: 'fileNameCharacterFilter',
	                fn: function(item /*{File|FileLikeObject}*/ , options) {
	                    return item.name.match(/^[a-zA-Z0-9\s-*&()!@#$%^|\\/\:;?_+=.,`~'"]+$/)=== null ?false:true;
	                }
	            });
	            
	            //Prepare the object to show file list in edit screen	            
	            $scope.$watch('filesList', function() {	            	
                    if (angular.isDefined($scope.filesList)) {
                    	var uploadedId = [];
    	            	if(angular.isArray($scope.filesList)){
    	            		angular.forEach($scope.filesList, function(fileList, key) {
    	            			$scope.uploadedItems.push({'successData':fileList});
    	            			if(returnType == 'list'){
    	            				var uploadJson = {};
    		            			uploadJson[returnField] = fileList.id;
    		            			uploadedId.push(uploadJson);
    	            			}else{
    	            				uploadedId.push(fileList.id);
    	            			}   	            				
    	            			
    		            	});
    	            	}else{
    	            		$scope.uploadedItems.push({'successData':$scope.filesList});
    	            		if(returnType == 'list'){
	            				var uploadJson = {};
		            			uploadJson[returnField] = $scope.filesList.id;
		            			uploadedId.push(uploadJson);
	            			}else{
	            				uploadedId.push($scope.filesList.id);
	            			} 
    	            		
    	            	}
    	            	$scope.$evalAsync(function(){
    	            		if(returnType != 'list')
		                		uploadedId = uploadedId.join(",");
    	                	uploaderScopeSetter($scope, uploadedId.length > 0 ? uploadedId : "");
    	                });
                    }
	            });
	            // CALLBACKS
	            uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/ , filter, options) {
	                var filterName = filter.name;
	                switch (filterName) { 
	                    case 'typeFilter':
	                        $scope.fileError = $translate.instant('common.invalidFileFormat');
	                        break;
	                    case 'sizeFilter':
	                        $scope.fileError = $translate.instant('common.sizeFilter');
	                        break;
	                    case 'customFilter':
	                        $scope.fileError = $translate.instant('common.maxFilesUploaded');
	                        break;
	                    case 'fileNameLengthFilter':  
	                    	$scope.fileError =  $translate.instant('common.fileMaxLength');
	                        break;
	                    case 'fileNameCharacterFilter':  
	                    	$scope.fileError = $translate.instant('common.invalidFileName');
	                        break;    
	                    default:
	                        $scope.fileError = "";
	                }
	            };
	            uploader.onAfterAddingFile = function(fileItem) {
	                $scope.fileError = "";
	            };
	            uploader.onAfterAddingAll = function(addedFileItems) {
	                $scope.fileError = "";
	            };
	            var uploaderScopeGetter = $parse($attrs.parentDataField);
	            var uploaderScopeSetter = uploaderScopeGetter.assign;
	            
	            uploader.onCompleteItem = function(item, response, status, headers) {
	            	response = _transformResponse({'data':response});
	            	if($scope.uploadedItems && response && status == 200){
		            	$scope.uploadedItems.push(response.data);
		            	var uploadedId = [];
		            	for (var i = $scope.uploadedItems.length - 1; i >= 0; i--) {
		            		if(returnType == 'list'){
		            			var uploadJson = {};
		            			uploadJson[returnField] = $scope.uploadedItems[i].successData.id;
		            			uploadedId.push(uploadJson);
		            		}else{
		            			uploadedId.push($scope.uploadedItems[i].successData.id);
		            		}
		            		
		            	}
		                $scope.$evalAsync(function(){
		                	if(returnType != 'list')
		                		uploadedId = uploadedId.join(",");
		                	uploaderScopeSetter($scope, uploadedId.length > 0 ? uploadedId : "");
		                });
	            	}
	            	uploader.clearQueue();
	            }
	            
	            $scope.downloadFile = function(id) {	
	            	var requestParam = 'id='+id;
	            	if(appCon.globalCon.request)
	            		requestParam = appCon.globalCon.request.param+"={\""+appCon.globalCon.request.value+"\":{\"id\":\""+id+"\"}}";
	            	else if(requestType ==='json')
	            		requestParam = "{\"id\":\""+id+"\"}";
	            	
	            	var downloadFilePath = appCon.globalCon.serviceBaseURL+appCon.globalCon.file.downloadURL;
	            	if(downloadFilePath.indexOf(":")>=0){
	            		downloadFilePath = downloadFilePath.replace(':id',id);
	            	}
	            	else{	
		            	if(appCon.globalCon.file.downloadURL.indexOf("?") >=0 )
		            		downloadFilePath +='&'+requestParam;
		            	else 
		            		downloadFilePath += '?'+requestParam;
	            	}
	            	 // Use an arraybuffer
	            	$http.get(downloadFilePath, {
	                		token: $cookieStore.get('token'),
	                        responseType: "arraybuffer"
	                    }).success(function(data, status, headers) {
	                    	var octetStreamMime = headers["content-type"];
	
	                        // Get the headers
	                        headers = headers();
	                        var contentDisposition = "inline", fileName;
	                        if(headers && headers["content-disposition"]){
	                        	contentDisposition = headers["content-disposition"].split(";")[0]
	                        	fileName = headers["content-disposition"].split(";")[1];
	                        	fileName = fileName.split("=")[1];
	                    	}
	                        
	                        // Get the filename from the x-filename header or default to "download.bin"
	                        var filename = fileName;
	
	                        // Determine the content type from the header or default to "application/octet-stream"
	                        var contentType = headers["content-type"] || octetStreamMime;
	                        
	                        if(contentDisposition.indexOf('inline')>-1){
	                        	// Get the blob url creator
	                            var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
	                            if (urlCreator) {	                                
                                    // Prepare a blob URL
                                    // Use application/octet-stream when using window.location to force download
                                    var blob = new Blob([data], {
                                        type: octetStreamMime
                                    });
                                    var url = urlCreator.createObjectURL(blob);
                                    $window.open(url, "popup","width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0");                              
	                            } else {
	                                window.open($scope.appPath + 'CourseRegConfirm/getfile', '_blank', '');
	                            }
	                        }else{
	                        	// Support for saveBlob method (Currently only implemented in Internet Explorer as msSaveBlob, other extension incase of future adoption)
	                            var saveBlob = navigator.msSaveBlob || navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
	
	                            if (saveBlob) {
	                                // Save blob is supported, so get the blob as it's contentType and call save.
	                                var blob = new Blob([data], {
	                                    type: contentType
	                                });
	                                saveBlob(blob, filename);
	                            } else {
	                                // Get the blob url creator
	                                var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
	                                if (urlCreator) {
	                                    // Try to use a download link
	                                    var link = document.createElement("a");
	                                    if ("download" in link) {
	                                        // Prepare a blob URL
	                                        var blob = new Blob([data], {
	                                            type: contentType
	                                        });
	                                        var url = urlCreator.createObjectURL(blob);
	                                        link.setAttribute("href", url);
	
	                                        // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
	                                        link.setAttribute("download", filename);
	
	                                        // Simulate clicking the download link
	                                        var event = document.createEvent('MouseEvents');
	                                        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	                                        link.dispatchEvent(event);
	
	                                        //console.log("Download link Success");
	
	                                    } else {
	                                        // Prepare a blob URL
	                                        // Use application/octet-stream when using window.location to force download
	                                        var blob = new Blob([data], {
	                                            type: octetStreamMime
	                                        });
	                                        var url = urlCreator.createObjectURL(blob);
	                                        window.location = url;
	                                    }
	
	                                } else {
	                                    window.open($scope.appPath + 'CourseRegConfirm/getfile', '_blank', '');
	                                }
	                            }
	                        }	
	                    })
	                    .error(function(data, status) {
	                        $scope.info = "Request failed with status: " + status;
	                    });
	            }            
	            
	            /*$scope.downloadFileUrl = function(id){
	            	var requestParam = 'id='+id;
	            	if(appCon.globalCon.request)
	            		requestParam = appCon.globalCon.request.param+"={\""+appCon.globalCon.request.value+"\":{\"id\":\""+id+"\"}}";
	            	else if(requestType ==='json')
	            		requestParam = "{\"id\":\""+id+"\"}";
	            	
	            	var downloadFilePath = appCon.globalCon.serviceBaseURL+appCon.globalCon.file.downloadURL;
	            	if(downloadFilePath.indexOf(":")>=0){
	            		downloadFilePath = downloadFilePath.replace(':id',id);
	            	}
	            	else{	
		            	if(appCon.globalCon.file.downloadURL.indexOf("?") >=0 )
		            		downloadFilePath +='&'+requestParam;
		            	else 
		            		downloadFilePath += '?'+requestParam;
	            	}
	            	//var configDownloadUrl = appCon.globalCon.serviceBaseURL + "/rest/secure" + appCon.globalCon.downloadServiceURL+"?visionRequest={\"VisionRequest\":{\"id\":\""+id+"\"}}&token="+$cookieStore.get('token');
	            	$window.open(downloadFilePath, "popup","width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0");
	            }*/
	            
	            $scope.deleteFile = function(item){
	            	delete $scope[item];
	            }
	            
	            $scope.removeFile = function(item){
	            	if($scope.imagecropper)
	            		delete $scope.imagecropper;
	            	if ($scope.uploadedItems){
		            	var uploadedId = [];
		            	for (var i = $scope.uploadedItems.length - 1; i >= 0; i--) {
		            		if (item.successData.id==$scope.uploadedItems[i].successData.id){
		            			$scope.uploadedItems.splice(i,1);
		            		}else{
		            			uploadedId.push($scope.uploadedItems[i].successData.id);
		            		}
		            	}
		                $scope.$evalAsync(function(){
		                	uploadedId = uploadedId.join(",");
		                	uploaderScopeSetter($scope, uploadedId);
		                });
	            	}
	            }
	        }
	    }
	}]);
	
	/**
	 * Multiselect Directive with/without drag&drop and sortable
	 * 
	 * @params - To specify if search from outer scope of this directive to reload the data
	 * @returnType - return type to be single or object
	 * @returnFields - what are the fields to be needed for form scope or else (declare from available fields)
	 * @rootNode - specify to took data from response for which object(i.e from scope data)
	 * @parentDataField - update selected data to form scope.
	 * @initialDataLoad - data to be loaded by rendering component or not.
	 *  
	 <multi-select mode='1-1'
		params='{"param1":"param1value"}'
		return-type="object"
		return-fields="id, name"
		service="serviceName"
		operation="operationName"
		root-node="rootNode"
		parent-data-field="formScopeNode"
		initial-data-load="false">
		
		<lpanel id="availableSubscriptions" label="Available" size="7" order-by="name" filter="" value="xsblId" text="name"></lpanel>
		<cpanel id="cpanelAssignedSubscriptions"></cpanel>
		<rpanel id="assignedSubscriptions" label="Selected" size="7" order-by="name" filter="orgId={{$parent.data.organizationId}}" value="xsblId" text="name"></rpanel>
	 </multi-select>
	 *
	 */
	
	angular.module(appCon.appName).directive("multiSelect", function($parse, $translate) {
	    return {
	        restrict: "E",
	        controller: "vmMultiSelectController",
	        scope: true,
	        link: function($scope, element, attributes) {
	            var lpanelDir = element.find('lpanel');
	            var rpanelDir = element.find('rpanel');
	            var data = [],
	                mode = attributes.mode;
	
	            $scope.lpanel = [];
	            $scope.lpanel.id = $scope.lpanel.name = lpanelDir.attr('id');
	            $scope.lpanel.text = lpanelDir.attr('text');
	            $scope.lpanel.value = lpanelDir.attr('value');
	            $scope.lpanel.draggable = lpanelDir.attr('draggable');
	            $scope.lpanel.sortable = lpanelDir.attr('sortable');
	            $scope.lpanel.label = $translate.instant(lpanelDir.attr('label'));
	            $scope.lpanel.size = lpanelDir.attr('size');
	            $scope.lpanel.orderBy = lpanelDir.attr('order-by');
	            $scope.lpanel.selectedData = [];
	            $scope.lpanel.lpanelSortableOptions = {
	                accept: function(sourceItemHandleScope, destSortableScope) {
	                    return true
	                }
	            };
	
	            $scope.rpanel = [];
	            $scope.rpanel.id = $scope.rpanel.name = rpanelDir.attr('id');
	            $scope.rpanel.text = rpanelDir.attr('text');
	            $scope.rpanel.value = rpanelDir.attr('value');
	            $scope.rpanel.label = $translate.instant(rpanelDir.attr('label'));
	            $scope.rpanel.draggable = rpanelDir.attr('draggable');
	            $scope.rpanel.sortable = rpanelDir.attr('sortable');
	            $scope.rpanel.size = rpanelDir.attr('size');
	            $scope.rpanel.orderBy = rpanelDir.attr('order-by');
	            $scope.rpanel.selectedData = [];
	            $scope.rpanel.rpanelSortableOptions = {
	                accept: function(sourceItemHandleScope, destSortableScope) {
	                    return true
	                }
	            };
	
	            var rpanel2Dir = element.find('rpanel2');
	            if (mode == '1-2') {
	                $scope.rpanel2 = [];
	                $scope.rpanel2.id = $scope.lpanel.name = rpanel2Dir.attr('id');
	                $scope.rpanel2.text = rpanel2Dir.attr('text');
	                $scope.rpanel2.value = rpanel2Dir.attr('value');
	                $scope.rpanel2.label = rpanel2Dir.attr('label');
	                $scope.rpanel2.size = rpanel2Dir.attr('size');
	                $scope.rpanel2.draggable = rpanel2Dir.attr('draggable');
	                $scope.rpanel2.sortable = rpanel2Dir.attr('sortable');
	                $scope.rpanel2.orderBy = rpanel2Dir.attr('order-by');
	                $scope.rpanel2.selectedData = [];
	            }
	            
	            /**pre populate data in edit mode - need to check again*/
	            $scope.dataPrepopulated = false;
	            var parentDataFieldModel = $parse(attributes.parentDataField);
	            $scope.$watch(attributes.parentDataField, function (){
	            	//if(!$scope.dataPrepopulated){
		            	data = [];
		            	var rpanelData = parentDataFieldModel($scope);
		            	if($scope.lpanel.data && $scope.lpanel.data.length> 0 ){
		            		for (var i = $scope.lpanel.data.length - 1; i >= 0; i--) {
		            			for (var j = rpanelData.length - 1; j >= 0; j--) {
		            				if ($scope.lpanel.data[i] && ($scope.lpanel.data[i][$scope.lpanel.value] == rpanelData[j][$scope.lpanel.value])) {
		            					data.push($scope.lpanel.data[i]);
		            					$scope.lpanel.data.splice(i, 1);
		            				}
		                		}
		            		}
		            		$scope.dataPrepopulated = true;
		            	}
		            	$scope.rpanel.data = rpanelData;
	            	//}
	            });
	        }
	    }
	});
	
	angular.module(appCon.appName).directive("lpanel", function() {
	    return {
	        restrict: "E",
	        templateUrl: function(elem, attrs) {
	            if (attrs.draggable || attrs.sortable) {
	                return "lpanelDraggable.html";
	            } else {
	                return "lpanel.html";
	            }
	        },
	        require: "^multiSelect"
	    }
	});
	
	angular.module(appCon.appName).directive("cpanel", function() {
	    return {
	        restrict: "E",
	        templateUrl: "cpanel.html",
	        require: "^multiSelect"
	    }
	});
	
	angular.module(appCon.appName).directive("rpanel", function() {
	    return {
	        restrict: "E",
	        templateUrl: function(elem, attrs) {
	            if (attrs.draggable || attrs.sortable) {
	                return "rpanelDraggable.html";
	            } else {
	                return "rpanel.html";
	            }
	        },
	        require: ['^form']
	    }
	});
	
	angular.module(appCon.appName).directive("cpanel2", function() {
	    return {
	        restrict: "E",
	        templateUrl: "cpanel2.html",
	        require: "^multiSelect"
	    }
	});
	
	angular.module(appCon.appName).directive("rpanel2", function() {
	    return {
	        restrict: "E",
	        templateUrl: "rpanel2.html",
	        require: "^multiSelect"
	    }
	});
	
	angular.module(appCon.appName).controller("vmMultiSelectController", ["$scope", "$attrs", "$parse", "$injector", "$element", function($scope, $attrs, $parse, $injector, $element) {
	    /*Multiselect mode : 1-1, 1-2 events*/
		
		/**
		 * Data load from remote url or from local
		 */
		var lpanelDir = $element.find('lpanel');
	    var rpanelDir = $element.find('rpanel');
	    
		$scope.initialDataLoad = false;
		
		var loadDataToMultiSelect = function(){
			var service = $attrs.service,
				operation = $attrs.operation,
				params = $attrs.params;
			
			try{
				params = JSON.parse(params.replace(/'/g, '"'));
			}catch(e){}
			
			$injector.get(service)[operation](params).then(
				function(success){
					$scope.data = success.data;
					assignDataToMultiSelect();
				}, function(error){
					$scope.data = {};
				}
			);
		}
		
		if($attrs.localData){
			$scope.data = $attrs.localData;
			assignDataToMultiSelect();
		}else{
			if(!$attrs.params){
				loadDataToMultiSelect();
			}
		}
		
		//Watch param attribute if has any changes happen, dataset can be fetch from remote url
		$attrs.$observe("params", function(){
			if($attrs.params && $scope.initialDataLoad){
				loadDataToMultiSelect();
			}else{
				$scope.initialDataLoad = true;
			}
		});
		
		//Populate the data if dataset is available.
		var assignDataToMultiSelect = function(){
			var data = [],
	        mode = $attrs.mode;
			
			if($attrs.rootNode){
				var model = $parse($attrs.rootNode),
					response = model($scope);
			}else{
				response = $scope.data;
			}
			
			if (response != undefined) {
			    if (angular.isArray(response)) {
	            	filter = lpanelDir.attr('filter');
	                filter = filter.split("=");
	
	                baseField = lpanelDir.attr('base-field');
	                if (baseField) {
	                    baseField = baseField.split("=");
	                }
	                
	                angular.forEach(response, function(value, key) {
	                	if (value[filter[0]] == filter[1]) {
	                        /*if (baseField && value[baseField[0]].toString() == baseField[1].toString()) {
	                            value["disabledData"] = true;
	                        } else {
	                            value["disabledData"] = false;
	                        }*/
	                        data.push(value);
	                    }
	                });
	                $scope.lpanel.data = data;
	                
	                data = [];
	                filter = rpanelDir.attr('filter');
	                filter = filter.split("=");
	                baseField = rpanelDir.attr('base-field');
	                if (baseField) {
	                    baseField = baseField.split("=");
	                }
	
	                angular.forEach(response, function(value, key) {
	            		if (value[filter[0]] == filter[1]) {
	                        if (baseField && value[baseField[0]].toString() == baseField[1].toString()) {
	                            value["disabledData"] = true;
	                        } else {
	                            value["disabledData"] = false;
	                        }
	                        data.push(value);
	                	}
	                    
	                });
	                $scope.rpanel.data = data;
	
	                if (mode == '1-2') {
	                    data = [];
	                    filter = rpanel2Dir.attr('filter');
	                    filter = filter.split("=");
	
	                    baseField = rpanel2Dir.attr('base-field');
	                    if (baseField) {
	                        baseField = baseField.split("=");
	                    }
	                    angular.forEach(response, function(value, key) {
	                        if (value[filter[0]] == filter[1]) {
	                            if (baseField && value[baseField[0]].toString() == baseField[1].toString()) {
	                                value["disabledData"] = true;
	                            } else {
	                                value["disabledData"] = false;
	                            }
	                            data.push(value);
	                        }
	                    });
	                    $scope.rpanel2.data = data;
	                }
	            }
	        }
			
		};
		
		/*$scope.$watch($attrs.rootNode, function() {
	    	var model = $parse($attrs.rootNode);
			var results = model($scope);
			
	    });*/
		
		/*set parent scope data*/
		$scope.btnRight = function(lpanel, rpanel) {
			var innerScopeGetter = $parse($attrs.parentDataField);
		    var innerScopeSetter = innerScopeGetter.assign;
		    
	        angular.forEach(lpanel.selectedData, function(value, key) {
	            for (var i = lpanel.data.length - 1; i >= 0; i--) {
	                if (lpanel.data[i][lpanel.value] == value) {
	                    rpanel.data.push(lpanel.data[i]);
	                    lpanel.data.splice(i, 1);
	                }
	            }
	        });
	        
	        $scope.$evalAsync(function(){
	        	innerScopeSetter($scope,rpanel.data.length>0 ? rpanel.data : "");
	        });
	        
	        lpanel.selectedData = [];
	    }
	
	    $scope.btnLeft = function(lpanel, rpanel) {
	    	var innerScopeGetter = $parse($attrs.parentDataField);
		    var innerScopeSetter = innerScopeGetter.assign;
	        angular.forEach(rpanel.selectedData, function(value, key) {
	            for (var i = rpanel["data"].length - 1; i >= 0; i--) {
	                if (rpanel.data[i][rpanel.value] == value) {
	                    lpanel.data.push(rpanel.data[i]);
	                    rpanel.data.splice(i, 1);
	                }
	            }
	        });
	        $scope.$evalAsync(function(){
	        	innerScopeSetter($scope,rpanel.data.length>0 ? rpanel.data : "");
	        });
	        rpanel.selectedData = [];
	    }
	
	    $scope.btnAllRight = function(lpanel, rpanel) {
	    	var innerScopeGetter = $parse($attrs.parentDataField);
		    var innerScopeSetter = innerScopeGetter.assign;
	        for (var i = lpanel["data"].length - 1; i >= 0; i--) {
	            //if (lpanel.data[i]["disabledData"].toString() != "true") {
	                rpanel.data.push(lpanel.data[i]);
	                lpanel.data.splice(i, 1);
	            //}
	        }
	        $scope.$evalAsync(function(){
	        	innerScopeSetter($scope,rpanel.data.length>0 ? rpanel.data : "");
	        });
	        lpanel.selectedData = [];
	    }
	
	    $scope.btnAllLeft = function(lpanel, rpanel) {
	    	var innerScopeGetter = $parse($attrs.parentDataField);
		    var innerScopeSetter = innerScopeGetter.assign;
	        for (var i = rpanel["data"].length - 1; i >= 0; i--) {
	            //if (rpanel.data[i]["disabledData"].toString() != "true") {
	                lpanel.data.push(rpanel.data[i]);
	                rpanel.data.splice(i, 1);
	            //}
	        }
	        $scope.$evalAsync(function(){
	        	innerScopeSetter($scope,rpanel.data.length>0 ? rpanel.data : "");
	        });
	        rpanel.selectedData = [];
	    }
	
	    $scope.updateSelectedData = function(item, panel, event) {
	        var itemAvailable = false;
	        //panel.selectedData = [];
	        for (i = 0; i < panel.selectedData.length; i++) {
	            if (panel.selectedData[i] == item) {
	                itemAvailable = true;
	                $(event.target).removeClass('focusDiv');
	                panel.selectedData.splice(i, 1);
	            }
	        }
	        if (itemAvailable == false) {
	            $(event.target).addClass('focusDiv');
	            panel.selectedData.push(item);
	        }
	    }
	
	}]);
	
	/*Vertical Scroll directive*/
	angular.module(appCon.appName).directive("verticalScroll", function() {
	    return {
	        restrict: "AE",
	        controller: "verticalScrollController",
	        scope: true,
	        link: function(scope, element, attributes) {
	            var raw = element[0];
	            element.bind('scroll', function() {
	            	if (Number(raw.scrollTop + raw.offsetHeight) >= Number(raw.scrollHeight)) {
	            		if(typeof scope.verticalScrollProcessCompleted == 'undefined' || scope.verticalScrollProcessCompleted){
	            			scope.$apply(scope.loadData());
	            		}
	                }
	            });
	        }
	    }
	});
	
	angular.module(appCon.appName).controller("verticalScrollController", ["$scope", "$http", "$attrs", "$injector", "$parse","$state","$rootScope", function($scope, $http, $attrs, $injector, $parse, $state, $rootScope) {
	    $scope.results = [];
	    $scope.totalRecords = 0;
	
	    var counter = 0,
	        service = $attrs.service,
	        operation = $attrs.operation,
	        rootNode = $attrs.rootNode,startIndex;
	    
	    try{
	    	if (typeof $state.params[$attrs.searchParams] != undefined && $state.params[$attrs.searchParams] != "undefined"  && $state.params[$attrs.searchParams] !=""){
	        	var searchParams = JSON.parse(unescape($state.params[$attrs.searchParams]));	
	        }	
	    }catch(e){
	    	var searchParams = {};
	    }
	
	    $scope.limit = $attrs.limit;
	    
	    $scope.loadData = function() {
	    	$scope.verticalScrollProcessCompleted = false;
	    	if (!startIndex){
	    		startIndex = 0;
	    	}
	        if (counter < $scope.totalRecords || counter == 0) {
	        	var data={};
	        	if(searchParams){
		    		data = searchParams;
		    	}
	        	data["startIndex"] = startIndex * $scope.limit;
	        	data["limit"] = $scope.limit;
	        	
	        	$scope.loading = true;
	        	$rootScope.loading = true;
	            $injector.get(service)[operation](data).then(function(result) {
	            	if(result.data.status==='success'){
	            		$scope.data = result.data;
	            		var items = $parse(rootNode)($scope);
		            	if (result.data.successData.totalRecords){
		            		$scope.totalRecords = result.data.successData.totalRecords;
		            	}else if(result.data.successData.TotalRecords){
		            		$scope.totalRecords = result.data.successData.TotalRecords;
		            	} 
		                for (var i = 0; i < items.length; i++) {
		                    $scope.results.push(items[i]);
		                    counter += 1;
		                }
	            	}
	            	$scope.verticalScrollProcessCompleted = true;
	            	$scope.loading = false;
	            	$rootScope.loading = false;
	            },function(error) {
	            	$scope.verticalScrollProcessCompleted = true;
	            	if(counter<=0){
	            		$scope.data = error;
	            	}
	            	$scope.loading = false;
	            	$rootScope.loading = false;
	            });
	            startIndex++;
	        }
	    };
	    $scope.loadData();
	}]);
	
	//Serverside grid.
	angular.module(appCon.appName).directive('serverSideGrid', function($injector, ngTableParams, $http) {
	    return {
	        restrict: 'E',
	        scope: true,
	        controller: "serverSideGridController"
	    }
	})
	
	angular.module(appCon.appName).controller("serverSideGridController", ["$scope", "$filter", "ngTableParams", "$injector", "$element", "$attrs", "$parse", "$rootScope", function($scope, $filter, ngTableParams, $injector, $element, $attrs, $parse, $rootScope) {
		var tableTag = $element.find('table'),
		service = $attrs.service, 
		operation = $attrs.operation,
		recordsPerPage = $attrs.recordsPerPage ? $attrs.recordsPerPage : "10",
		rootNode = $attrs.rootNode,
		config = $attrs.config;
		
		
         if (config != undefined) {
             config = JSON.parse(config.replace(/'/g, '"'))
         } else {
             config = {};
         }
         config = angular.extend({}, {
	        page: 1,
	        total: 1, // value less than count hide pagination
	        count: recordsPerPage,
	        sorting: {},
	        filter: {}
	    }, config);

         
		$scope[tableTag.attr('ng-table')] = new ngTableParams(config, {
	        getData: function($defer, params) {
	        	$scope.loading = true;
	        	$rootScope.loading = true;
	        	var param = populateSearchRequestForGrid(params, $attrs);
	        	$injector.get(service)[operation](param).then(
	                function(result) {
	                	if (result.data.status === 'success' ){	                		
	                        params.total(result.data.successData.TotalRecords);
	                        $scope.data = result.data;	                       
	                        $defer.resolve($parse(rootNode)($scope));
	                        delete $scope.data;
	                    }else{
	                    	params.total(0); // hide pagination if no results found
	                    	$defer.resolve(result.data);
	                    }
	                	$scope.loading = false;
	                	$rootScope.loading = false;
	                },
	                function(error) {
	                	$scope.loading = false;
	                	$rootScope.loading = false;
	                	$defer.resolve(error);
	                }
	            );
	        }
	    });
	
	    $scope.$watch('data.length', function(newx, oldx) {
	        if (newx != null && newx !== oldx && newx > 0) {
	        	$scope[tableTag.attr('ng-table')].reload();
	        }
	    });
	}]);
	
	/*Bar Chart*/
	angular.module(appCon.appName).directive('barChart', ["$state", function($state) {
	    return {
	        restrict: 'E',
	        scope: {
	            data: "=",
	            xaxisfield: "@",
	            yaxisfield: "@",
	            rootnode: "@",
	            height: "@",
	            width: "@",
	            marginBottom: "@",
	            xaxisrotate: "@",
	            xaxistextlength: "@",
	            xaxistickslength: "@",
	            redirect: "@",
	            showtooltip: "@",
	            clickEvent:"@"
	        },
	        link: function(scope, element) {
	            scope.width = typeof(scope.width) != undefined ? scope.width : 450;
	            scope.height = typeof(scope.height) != undefined ? scope.height : 350;
	            scope.xaxisrotate = typeof(scope.xaxisrotate) != undefined ? scope.xaxisrotate : 0;
	            scope.xaxistextlength = typeof(scope.xaxistextlength) != undefined ? scope.xaxistextlength : 250;
	            scope.xaxistickslength = typeof(scope.xaxistickslength) != undefined ? scope.xaxistextlength : 5;
	            var showtooltip = typeof(scope.showtooltip) != undefined ? scope.showtooltip : "false";
	            var redirect = typeof(scope.redirect) != undefined ? scope.redirect : "";
	
	            var margin = {
	                    top: 40,
	                    right: 20,
	                    bottom: typeof(scope.marginBottom) != undefined ? scope.marginBottom : 30,
	                    left: 40
	                },
	                width = Number(scope.width) - margin.left - margin.right,
	                height = Number(scope.height) - margin.top - margin.bottom;
	            
	            var barWidth;
	            
	            // Render graph based on 'data'
	            scope.render = function(data) {
	            	if(data.length < 11){
	        			barWidth = 35;
	        			width = (barWidth + 10) * data.length;
	        		}else{
	        			barWidth = 25;
	        			width = (barWidth + 10) * data.length;
	        		}
	        		if(data.length == 1){
	        			width = '125';
	        		}
	        		
	        		var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
	
	                var y = d3.scale.linear().range([height, 0]);
	
	                var xAxis = d3.svg.axis().scale(x).orient("bottom");
	
	                //var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(formatPercent);
	                var yAxis = d3.svg.axis().scale(y).orient("left").ticks(6);
	
	                var color = d3.scale.category10();
	
	                var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
	                    return "<strong>" + d[scope.xaxisfield] + ":</strong> <span>" + d[scope.yaxisfield] + "</span>";
	                })
	                
	        		var svg = d3.select(element[0]).append("svg")
	                .attr("width", Number(width) + Number(margin.left) + Number(margin.right))
	                .attr("height", Number(height) + Number(margin.top) + Number(margin.bottom))
	                .append("g")
	                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	        		svg.call(tip);
	        		
	                x.domain(data.map(function(d) {
	                    return d[scope.xaxisfield];
	                }));
	                y.domain([0, d3.max(data, function(d) {
	                    return d[scope.yaxisfield];
	                })]);
	
	                svg.append("g")
	                    .attr("class", "x axis")
	                    .attr("transform", "translate(0," + height + ")")
	                    .call(xAxis);
	                
	                if (typeof scope.clickEvent !== 'undefined') {	                	
	                	svg.selectAll("g .x.axis").selectAll("text").on('click', function(d, i) {	                    	
	                    return eval("scope."+scope.clickEvent+"(d, i)");
	                    });
	                 }
	                
	                if (scope.xaxisrotate && scope.xaxisrotate != "0") {
	                    svg.selectAll("g .x.axis")
	                        .selectAll("text")
	                        .style("text-anchor", "end")
	                        .style("fill", "#21759b")
	                        .style("font", "13px verdana")
	                        .attr("dx", "-.8em")
	                        .attr("dy", ".15em")
	                        .attr("transform", function(d) {
	                            return "rotate(" + scope.xaxisrotate + ")"
	                        }).text(
	                            function(t) {
	                                if (t) {
	                                    if (scope.xaxistextlength && t.length > Number(scope.xaxistextlength)) {
	                                        return t.substring(0, scope.xaxistextlength) + "...";
	                                    } else {
	                                        return t;
	                                    }
	                                }
	                            }
	                        );
	                }
	                svg.append("g")
	                    .attr("class", "y axis")
	                    .style("font", "13px Arial")
	                    .style("fill", "grey")
	                    .call(yAxis);
	
	                var rect = svg.selectAll(".bar")
	                    .data(data)
	                    .enter().append("rect")
	                    .style("opacity","0")
	                	.style("fill", "white");         
				    
				    
	                rect.transition()
				     .duration(function(d,i){
				    	 return 300 * i;
				     }).ease("linear")
	                
	                	.attr("class", "bar")
	
	                    .attr("x", function(d) {
	                        return x(d[scope.xaxisfield]);
	                    })
	                    .attr("width", x.rangeBand())
	                    .style("fill", function(d, i) {
	                        return color(i);
	                    })
	                    .style("opacity",'.75')
	                    .attr("y", function(d) {
	                        return y(d[scope.yaxisfield]);
	                    })
	                    .attr("height", function(d) {
	                        return height - y(d[scope.yaxisfield]);
	                    });
	
	                if (showtooltip == "true") {
	                    rect.on('mouseover', tip.show)
	                        .on('mouseout', tip.hide);
	                }	               
	                
	                if (typeof redirect !='undefined' &&  redirect != "") {
	                    rect.on('click', function(d) {
	                        return $state.go(redirect);
	                    });
	                }
	                
	                if (typeof scope.clickEvent !== 'undefined') {	                	
	                     rect.on('click', function(d, i) {	                    	
	                      return eval("scope."+scope.clickEvent+"(d, i)");
	                     });
	                 }
	
	            };
	
	            //Watch 'data' and run scope.render(newVal) whenever it changes
	            //Use true for 'objectEquality' property so comparisons are done on equality and not reference
	            scope.$watch('data', function() {
	                if (scope.data != undefined) {
	                    var results = eval("scope.data." + scope.rootnode);
	                    if (angular.isArray(results)) {
	                        scope.render(results)
	                    }
	                }
	            }, true);
	        }
	    };
	}]);
	
	/*PieChart*/
	angular.module(appCon.appName).directive('pieChart', ["$state", function($state) {
	    return {
	        restrict: 'E',
	        scope: {
	            data: "=",
	            xaxisfield: "@",
	            yaxisfield: "@",
	            rootnode: "@",
	            height: "@",
	            width: "@",
	            radius: "@",
	            redirect: "@",
	            showtooltip: "@",
	            showlegend:"@",
	            showText:"@",
	            clickEvent:"@",
	            legendContainer:"@"
	            
	        },
	        link: function(scope, element) {
	            scope.width = typeof(scope.width) != undefined ? scope.width : 250;
	            scope.height = typeof(scope.height) != undefined ? scope.height : 250;
	            var outerRadius = typeof(scope.radius) != undefined ? scope.radius : 120;
	            var showtooltip = typeof(scope.showtooltip) != undefined ? scope.showtooltip : "false";
	            var redirect = typeof(scope.redirect) != undefined ? scope.redirect : "";
	            var color = d3.scale.category10();
	            var showLegend = scope.showlegend?scope.showlegend:false;
	            var showText = scope.showText?scope.showText:false;
	            
	            var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
	                return "<strong>" + d.data[scope.xaxisfield] + ":</strong> <span>" + d.data[scope.yaxisfield] + "</span>";
	            })
	
	            // Render graph based on 'data'
	            scope.render = function(data) {
	            	element.empty();
	                var vis = d3.select(element[0]).append("svg:svg")
	                    .data([data])
	                    .attr("width", Number(scope.width))
	                    .attr("height", Number(scope.height))
	                    .style("float", "left")
	                    .append("svg:g")
	                    .attr("transform", "translate(" + 1.1 * Number(outerRadius) + "," + 1.1 * Number(outerRadius) + ")");
	
	                vis.call(tip);
	
	                var arc = d3.svg.arc().outerRadius(Number(outerRadius));
	
	                var pie = d3.layout.pie()
	                    .value(function(d) {
	                        return d[scope.yaxisfield];
	                    })
	                    .sort(function(d) {
	                        return null;
	                    });
	
	                var arcs = vis.selectAll("g.slice")
	                    .data(pie)
	                    .enter()
	                    .append("svg:g")
	                    .attr("class", "slice");
	
	                var path = arcs.append("svg:path").style("opacity","0");
	
	                path.attr("fill", function(d, i) {
	                    return color(i);
	                }).attr("d", arc)
	                .transition().delay(function(d, i) { return i * 0; })
	                .duration(1000)
					.attrTween('d', function(d) {
				       var i = d3.interpolate(d.startAngle, d.endAngle);
				       return function(t) {
				           d.endAngle = i(t);
				         return arc(d);
				       }
					  })
					  .style("opacity","1");
	
	                if (showtooltip == "true") {
	                    path.on('mouseover', tip.show)
	                        .on('mouseout', tip.hide);
	                }
	                if (typeof redirect !='undefined' &&  redirect != "") {
	                    path.on('click', function(d) {
	                        return $state.go(redirect);
	                    });
	                }
	                
	                if (typeof scope.clickEvent !== 'undefined') {	                	
	                	path.on('click', function(d, i) {	                    	
	                      return eval("scope."+scope.clickEvent+"(d, i)");
	                     });
	                 }
	
	                /*arcs.append("svg:text")
		                .attr("transform", function(d) { //set the label's origin to the center of the arc
		                	d.radius = Number(outerRadius) + 50; // Set Outer Coordinate
		                	d.innerRadius = Number(outerRadius) + 45; // Set Inner Coordinate
		                	return "translate(" + arc.centroid(d) + ")";
		                })
		                .attr("text-anchor", "middle") //center the text on it's origin
		                .text(function(d, i) { return data[i][scope.xaxisfield]; }); //get the label from our original data array*/
	                if(showText == true || showText == 'true'){
		                arcs.filter(function(d) {
		                        return d.endAngle - d.startAngle > .2;
		                    }).append("svg:text")
		                    .attr("dy", ".35em")
		                    .attr("text-anchor", "middle")
		                    .style("fill","white")
		                    .attr("transform", function(d) { //set the label's origin to the center of the arc
		                        //d.radius = Number(outerRadius); // Set Outer Coordinate
		                        //d.innerRadius = Number(outerRadius) + 20; // Set Inner Coordinate
		                    	d.innerRadius = 0;
		                    	d.outerRadius = Number(outerRadius) + 20;
		                        return "translate(" + arc.centroid(d) + ")"; })
		                    .text(function(d) {
		                        return d.data[scope.yaxisfield];
		                    });
	                }
	                var radius = 84,
	                    padding = 0;
	                if(showLegend == true || showLegend == 'true'){
	                	$('#'+scope.legendContainer).empty();
	                	var legendRectSize = 18;                                  
		                var legendSpacing = 4;
		                if(angular.isDefined(scope.legendContainer)){
		            		  var legend = d3.select('#'+scope.legendContainer)
		                  		.append('svg')
		                  		.attr('height', data.length*23)
		                  		.selectAll('.legend')                     
		                  		.data(data)                                   
		                  		.enter()                                                
		                  		.append('g')                                            
		                  		.attr('class', 'legend')                                
		                  		.attr('transform', function(d, i) {                     
		                  			var height = legendRectSize + legendSpacing;         
		                  			var offset =  height * color.domain().length / 2;     
		                  			var horz = -2 * legendRectSize;                       
		                  			var vert = i * height;	                   
		                  			return 'translate(0,' + vert + ')';        
		                  		}); 
		            	  }else{
			                var legend = d3.select(element[0]).append("svg")
			                    .attr("class", "legend")
			                    .attr("width", "30%")
			                    .attr("height", outerRadius * 2.5)
			                    .style("float", "right")
			                    .style("padding", "15px 0 0 20px")
			                    .selectAll("g")
			                    .data(data)
			                    .enter().append("g")
			                    .attr("transform", function(d, i) {
			                        return "translate(0," + (i * 25) + ")";
			                    });
		            	  }
		
		                legend.append("rect")
		                    .attr("width", legendRectSize)
		                    .attr("height", legendRectSize)
		                    .style("fill", function(d, i) {
		                        return color(i);
		                    });
		
		                legend.append("text")
		                    .attr("x", legendRectSize + legendSpacing)
		                    .attr("y", legendRectSize - legendSpacing)		                    
		                    .text(function(d) {
		                        return d[scope.xaxisfield];
		                    });
		                if (typeof scope.clickEvent !== 'undefined') {	                	
		                	legend.on('click', function(d, i) {	                    	
		                      return eval("scope."+scope.clickEvent+"(d, i)");
		                     });
		                 }
	                }
	                function angle(d) {
	                    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
	                    return a > 90 ? a - 180 : a;
	                }
	            };
	
	            //Watch 'data' and run scope.render(newVal) whenever it changes
	            //Use true for 'objectEquality' property so comparisons are done on equality and not reference
	            scope.$watch('data', function() {
	                if (scope.data != undefined) {
	                    var results = eval("scope.data." + scope.rootnode);
	                    if (angular.isArray(results)) {
	                        scope.render(results)
	                    }
	                }
	            }, true);
	        }
	    };
	}]);
	
	/*Full Calendar*/
	angular.module(appCon.appName).directive('fullcalendar', [function() {
	    return {
	        restrict: "E",
	        controller: "calendarController",
	        scope: {
	            height: "@",
	            service: "@",
	            operation: "@",
	            eventLimit: "@",
	            rootNode: "@"
	        },
	        template: '<div ng-class="{dNone:!loading}" class="text-right" style="margin-bottom:10px;"><img src="bower_components/' + appCon.selectedVersion + '/custom/img/ajax-loader-autocomplete.gif" align="absmiddle"/>&nbsp;loading...</div>'+
	        '<div class="form-group table-responsive" ng-show="data.status==\'error\'">'+
				'<div class="text-danger"><span class="fa fa-warning" aria-hidden="true"></span>&nbsp;{{data.errorData.ResponseError[0].errorCode | translate}}</div>'+
	        '</div>'+
	        '<div class="calendar" ng-model="eventSources" calendar="myCalendar" ui-calendar="uiConfig.calendar"></div>'
	    }
	}]);
	
	angular.module(appCon.appName).controller("calendarController", ["$scope", "$injector", "$compile", "uiCalendarConfig", "$filter", "$parse", "$rootScope", function($scope, $injector, $compile, uiCalendarConfig, $filter, $parse, $rootScope) {
	
	    $scope.eventsF = function(start, end, timezone, callback) {
	        var param = {
    				startDate : $filter('date')(new Date(start).getTime(), 'MM/dd/yyyy'),
    				endDate : $filter('date')(new Date(end).getTime(), 'MM/dd/yyyy')
    			},
	        	data={};
	
	        $scope.loading = true;
	        $injector.get($scope.service)[$scope.operation](param).then(
	        	function(result) {
	        		$scope.loading = false;
	        		$rootScope.loading = false;
	        		if(result.data.status === "success"){
	        			$scope.data = result.data;
			        	data = $parse($scope.rootNode)($scope);
			        	delete $scope.data;
			        	
			            var events = [];
			            for (i = 0; i < data.length; i++) {
			            	events.push({
			            		id: data[i].id,
			                    title: data[i].title,
			                    start: new Date(data[i].eventDate ? data[i].eventDate : ""),
			                    end: data[i].end ? data[i].end : null,
			                    allDay: data[i].allDay,
			                    url: data[i].url,
			                    description: data[i].description,
			                    agenda: data[i].agenda,
			                    place: data[i].eventPlace
			                });
			            }
			            callback(events);
	        		}else{
	        			$scope.loading = false;
	        			$rootScope.loading = false;
	        			//$scope.data = result.data;
	        		}
		        }, function(error){
	            	//$scope.data = error.data;
	            	$scope.loading = false;
	            	$rootScope.loading = false;
	            }
	        );
	    };
	
	    /* Render Tooltip */
	    $scope.eventRender = function(event, element, view) {
	    	var eventDate = $filter('date')(new Date(event.start).getTime(), 'MM/dd/yyyy');
	    	element.popover({
	    		html:true,
	            title: event.title,
	            placement: 'bottom',
	            trigger: 'hover',
	            container: "body",
	            content: '<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa-calendar"></i></label><div class="col-lg-10">' + eventDate + '</div></div>'+
	            '<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa-map-marker"></i></label><div class="col-lg-10">' + event.place + '</div></div>'+
	            '<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa-sort-amount-asc"></i></label><div class="col-lg-10"><strong>' + event.agenda + '</strong></div></div>'+
	            '<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa fa-list"></i></label><div class="col-lg-10">' + event.description + '</div></div>'
	        });
	    	//element.attr({"data-toggle":"popover","data-container": "body"});
	        /*element.attr({
	            'tooltip-html-unsafe': function() {
	            	var content = '<div class="calDesc">';
	            	content += '<strong>Title:</strong> ' + event.title + '<br/>';
	            	content += '<strong>Date:</strong> ' + eventDate+'<br/>';
	            	content += '<strong>Place:</strong> ' + event.place;
	            	content += '</div>';
	                    
	                return content;
	            },
	            'tooltip-append-to-body': true
	        });*/
	        $compile(element)($scope);
	    	//if(event.start.getMonth() !== view.start.getMonth()) { return false; }
	    };
	    /* config object */
	    $scope.uiConfig = {
	        calendar: {
	            height: $scope.height ? $scope.height : 450,
	            editable: true,
	            eventLimit: $scope.eventLimit ? $scope.eventLimit : false,
	            header: {
	                left: 'title',
	                center: '',
	                right: 'today prev,next'
	            },
	            eventClick: $scope.alertOnEventClick,
	            eventDrop: $scope.alertOnDrop,
	            eventResize: $scope.alertOnResize,
	            eventRender: $scope.eventRender
	        }
	    };
	
	    /* event sources array*/
	    $scope.eventSources = [$scope.eventsF];
	}]);
	
	/*Auto Complete Select - Start*/
	
	/*Filter*/
	angular.module(appCon.appName).filter('propsFilter', function() {
	    return function(items, props) {
	        var out = [];
	
	        if (angular.isArray(items)) {
	            items.forEach(function(item) {
	                var itemMatches = false;
	
	                var keys = Object.keys(props);
	                for (var i = 0; i < keys.length; i++) {
	                    var prop = keys[i];
	                    var text = props[prop].toLowerCase();
	                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
	                        itemMatches = true;
	                        break;
	                    }
	                }
	
	                if (itemMatches) {
	                    out.push(item);
	                }
	            });
	        } else {
	            out = items;
	        }
	
	        return out;
	    }
	});
	
	/*Component*/
	angular.module(appCon.appName).directive('autoCompleteSelect', [function() {
	    return {
	        restrict: "E",
	        controller: "autoCompleteSelectController",
	        scope: true,
	        template: '<ui-select ng-model="item.selected" theme="select2" ng-disabled="disabled" style="min-width: 300px;">\
				<ui-select-match placeholder="{{placeholder}}">{{$select.selected[field]}}</ui-select-match>\
					<ui-select-choices group-by="groupfield" repeat="item in autocompletedata | filter: $select.search">\
						<div style="width:90%; float:left; word-wrap:break-word;" ng-click="autoCompleteSelectItemClick(item)" class="clear" ng-bind-html="item[field] | highlight: $select.search" ></div>\
						<div style="float:right; width:8%;" ng-click="autoCompleteSelectImageClick(item)"><small><img ng-src=\'img/edit.png\'></img></small></div>\
					</ui-select-choices>\
				</ui-select>'
	    }
	}]);
	
	/*Controller*/
	angular.module(appCon.appName).controller("autoCompleteSelectController", ["$scope", "$attrs", "$state", function($scope, $attrs, $state) {
	    $scope.groupfield = function(item) {
	        return item[$attrs.groupby];
	    };
	    $scope.field = $attrs.field;
	    $scope.placeholder = $attrs.placeholder;
	    $scope.imageurl = $attrs.imageurl;
	    $scope.itemurl = $attrs.itemurl;
	    $scope.item = {};
	    $scope.item.selected = undefined;
	    $scope.$watch('data', function() {
	        $scope.autocompletedata = $scope.data;
	    });
	    $scope.autoCompleteSelectImageClick = function(item) {
	        $state.go($scope.imageurl);
	    }
	    $scope.autoCompleteSelectItemClick = function(item) {
	        $state.go($scope.itemurl, {}, {
	            reload: true
	        });
	    }
	}]);
	
	/*Auto Complete Select - End*/
	
	/* Modal Dialog Resize Functionality */
	angular.module(appCon.appName).directive('modalWindow', ['$modal', '$timeout', function($modal, $timeout) {
	    return {
	        restrict: 'EAC',
	        link: function(scope, element) {
	        	var dialogWidth  = $(element).find(".modal-view").attr("width");
	            var dialogHeight = $(element).find(".modal-view").attr("height");
	            var modalResize  = $(element).find(".resize").length;
	        	if(modalResize>0 || dialogWidth != undefined || dialogHeight != undefined)
	        	{	
		            $timeout(function() {	               	            	
		            	if(modalResize>0)
		            	{	
		            		var resizeOpts = {handles: "all",autoHide: true};
		            		$(element).find(".modal-content").resizable(resizeOpts);
		            	}
		            	if(dialogWidth != undefined)
		            	{
		            		$(element).find(".modal-dialog").css("width", dialogWidth);
		            		$(element).find(".modal-content").css("overflow", "hidden");
		            	}	
		            	if(dialogHeight != undefined)
		            	{
		            		$(element).find(".modal-body").css("height", dialogHeight);
		                	$(element).find(".modal-content").css("overflow", "hidden");
		            	}
		            	
		            }, 0);
	            
	        	}
	        }
	    }
	}]);
	
	
	/* Modal Dialog Resize Functionality - End*/
	
	/*
	 * Getter, Setter for managing data in global config object i.e appCon.data
	 * eg: <set-data module="common" key="repositoryId" value="{{userInfo.UserProfile.cpmUserId}}"></set-data>
	 */
	angular.module(appCon.appName).directive('setData', function() {
	    var directive = {};
	    directive.restrict = 'E';
	    directive.scope = {
	    	module: "@",
	        key: "@",
	        value: "@"
	    },
	
	    directive.compile = function(element, attributes) {
	
	        var linkFunction = function($scope, element, attributes) {
	            if(!appCon.data[$scope.module]){
	            	appCon.data[$scope.module] = {};
	            }
	           	//appCon.data[$scope.module][$scope.key] = $scope.value;
	            $scope.$watch('value', function() {
	                if(typeof($scope.value) != "undefined") {
	                    appCon.data[$scope.module][$scope.key] = $scope.value;
	                }
	            });
	        }
	
	        return linkFunction;
	    }
	
	    return directive;
	});
	
	/*Combo select box - Component*/
	angular.module(appCon.appName).directive("comboInput", function($parse, $translate, $injector) {
	    return {
	        restrict: "E",
	        templateUrl: "comboInput.html",
	        scope: true,
	        link: function($scope, element, attributes) {
	            
	        	$scope.name = attributes.name;
	            $scope.idField = attributes.idField;
	            $scope.nameField = attributes.nameField;
	            $scope.params = attributes.params;
	            $scope.selectedModel = [];
	            
	            $scope.getComboData = function(){
	            	$injector.get(attributes.service)[attributes.operation](params).then(function(result) {
	                	$scope.data = result.data;
	                	$scope.comboData = $parse(attributes.rootNode)($scope);
	                	delete $scope.data;
	                });
	            }
	            
	            var params= {};
	            /*Populate param if dependent model is available*/
	            
	            if(attributes.dependentModel && attributes.dependentModel != ""){
	            	
	            	var dependentModelGetter = $parse(attributes.dependentModel);
	                $scope.$watch(attributes.dependentModel, function (){
	                	if (dependentModelGetter($scope) && dependentModelGetter($scope) != ""){
			            	var dependentGetter = $parse(attributes.dependentModel);
			            	if(attributes.params){
			            		params = JSON.parse(attributes.params);	
			            	}
			            	
			            	$scope.getComboData();
	            		}else{
	            			delete $scope.comboData;
	            		}
	            	});
	            }else{
	            	$scope.getComboData();
	            }
	            
	            /**pre populate data in edit mode*/
	            $scope.dataPrepopulated = false;
	            
	            element.bind('change', function() {
	            	var parentDataFieldGetter = $parse(attributes.parentDataField);
	                var parentDataFieldSetter = parentDataFieldGetter.assign;
	                
	                var parentIdFieldGetter = $parse(attributes.parentIdField); 
	                var parentIdFieldSetter = parentIdFieldGetter.assign;
	                
	                $scope.$evalAsync(function(){
	                	if($scope.selectedModel){
	                		if(parentDataFieldSetter){
	                			parentDataFieldSetter($scope,$scope.selectedModel[$scope.nameField]);
	                		}                		
	                		if(parentIdFieldSetter){
	                			parentIdFieldSetter($scope,$scope.selectedModel[$scope.idField]);
	                		}                		
	                	}else{
	                		if(parentDataFieldSetter){
	                			parentDataFieldSetter($scope,"");
	                		}
	                		if(parentIdFieldSetter){
	                			parentIdFieldSetter($scope,"");
	                		}
	                	}
	            		
	            		$scope.dataPrepopulated = true;
	                });
	            });
	            
	            $scope.$watch('comboData', function (){
	            	if($scope.comboData != undefined && $scope.comboData != ''){
	            		$scope.$watch(attributes.parentDataField, function (){
	                		if(!$scope.dataPrepopulated){
	                    		var parentDataFieldGetter = $parse(attributes.parentDataField);
	                            var parentData = parentDataFieldGetter($scope);
	                            if(parentData && parentData !=""){
	                            	angular.forEach($scope.comboData, function(value, key) {
	        	            			if(value[$scope.nameField] == parentData){
	        	            				$scope.selectedModel = value;
	        	            			}
	        	            		});
	        	            		$scope.dataPrepopulated = true;
	        	            	}
	                    	}
	                	});
	            	}
	            	
	            });
	        }
	    }
	});
	
	angular.module(appCon.appName).filter('to_trusted', ['$sce', function($sce){
	    return function(text) {
	        return $sce.trustAsHtml(text);
	    };
	}]);
	
	/** ng-enter event for search boxes **/
	angular.module(appCon.appName).directive('ngEnter', function() {
	    return function(scope, element, attrs) {
	        element.bind("keydown keypress", function(event) {
	            if(event.which === 13) {
	                    scope.$apply(function(){
	                            scope.$eval(attrs.ngEnter);
	                    });
	                    
	                    event.preventDefault();
	            }
	        });
	    };
	});
	
	/** numeric-only for restrict char value **/
	angular.module(appCon.appName).directive('numericOnly', function(){
	    return {
	        require: 'ngModel',
	        link: function(scope, element, attrs, modelCtrl) {
	
	            modelCtrl.$parsers.push(function (inputValue) {
	                var transformedInput = inputValue.replace(/[^\d.-]/g,'');
	
	                if (transformedInput!=inputValue) {
	                    modelCtrl.$setViewValue(transformedInput);
	                    modelCtrl.$render();
	                }
	
	                return transformedInput;
	            });
	        }
	    };
	});
	
	/** Angular jqgrid directive **/
	angular.module('angular-jqcloud', []).directive('jqcloud', ['$parse', function($parse) {
	  // get existing options
	  var defaults = jQuery.fn.jQCloud.defaults.get(),
	      jqcOptions = [];
	
	  for (var opt in defaults) {
	    if (defaults.hasOwnProperty(opt)) {
	      jqcOptions.push(opt);
	    }
	  }
	
	  return {
	    restrict: 'E',
	    template: '<div></div>',
	    replace: true,
	    scope: {
	      words: '=words',
	      text: '@',
	      weight: '@',
	      link:'@'
	    },
	    link: function($scope, $elem, $attr) {
	    	
	      $scope.$watch('words', function() {
		      var options = {};
		
		      for (var i=0, l=jqcOptions.length; i<l; i++) {
		        var opt = jqcOptions[i];
		        var attr = $attr[opt] || $elem.attr(opt);
		        if (attr !== undefined) {
		          options[opt] = $parse(attr)();
		        }
		      }
		      
		      //Change key for text and weight
		      angular.forEach($scope.words, function(value, key) {
		    	  
		    	  angular.forEach(value, function(value2, key2) {
		    		  if(key2 == $scope.text){
		        		  $scope.words[key].text = $scope.words[key][key2];
		        	  }
		    		  
		    		  if(key2 == $scope.weight){
		        		  $scope.words[key].weight = $scope.words[key][key2];
		        	  }
		    		  
		    	  });
		    	  
		      });	      
		      
		      jQuery($elem).jQCloud($scope.words, options);
		
		      $scope.$watchCollection('words', function() {
		        $scope.$evalAsync(function() {
		          var words = [];
		          $.extend(words,$scope.words);
		          jQuery($elem).jQCloud('update', words);
		        });
		      });
		
		      $elem.bind('$destroy', function() {
		        jQuery($elem).jQCloud('destroy');
		      });
	      });
	      
	    }
	  };
	}]);
	
	/**** workflow diagram ****/
	angular.module(appCon.appName).directive('workflow', function() {
	    var directive = {};
	    directive.restrict = 'E';
	    directive.scope = {
	        data: '=',
	        mainContainerId : '@',
	        containerId : '@',
	        topMargin : '@'
	    };
	    
	    directive.template = '<div id="{{mainContainerId}}"><div id="{{containerId}}" style="float:left;"></div></div>';
	    
	    directive.compile = function(element, attributes) {
	
	        var linkFunction = function($scope, element, attributes) {
	        	$scope.$watch('data', function() {
	        		if ($scope.data != undefined) {
	        			workFlowDiagram($scope.data, $scope.mainContainerId, $scope.containerId,$scope.topMargin);
	        		}
	        	});
	        }
	
	        return linkFunction;
	    };
	
	    return directive;
	});
	
	/**
	 *LineChart
	 *
	 * <line-chart 
	   		data="data" 
	   		rootnode="VisionResponse.temperatureDetails" 
	   		width="250" 
	   		height="150" 
	   		xaxisfield="xaxis" 
	   		xaxisparser="number" 
	   		showxaxislabel="false" 
	   		yaxisfields="yaxis1,yaxis2,yaxis3" 
			yaxisfieldlabel=""
			showyaxislabel="false" 
			showtooltip="true"
			 > 
		</line-chart>
	 */
	/**
	 *LineChart 
	 */
	angular.module(appCon.appName).directive('lineChart', ["$state", function($state) {
		return {
			restrict: 'E',
			scope: {
				data: "=",
				rootnode: "@",
				id: "@",
				height: "@",
				width: "@",
				xaxisfield: "@",
				yaxisfields: "@",
				yaxisfieldlabel: "@",
				xaxisparser: "@",
				showlegend: "@",
				showxaxislabel: "@",
				showyaxislabel: "@",
				showtooltip: "@",
				clickEvent:"@",
				legendContainer:"@"
			},
			link: function(scope, element) {
				var parseDate = d3.time.format("%Y%m%d").parse;
				// Render graph based on 'data'
				scope.render = function(data) {
					element.empty();
					var chartData = data;
					var lineChartWidth = scope.width;
					var lineChartHeight = scope.height;
					var xAxisField = scope.xaxisfield;
					var yAxisLabel = scope.yaxisfieldlabel;
					var yAxisFields = scope.yaxisfields;
					var yAxisFieldsArray = yAxisFields.split(',');
					var showLegend = scope.showlegend ? scope.showlegend : false;
					if (showLegend == true || showLegend == 'true') {
						var margin = {
							top: 10,
							right: 0,
							bottom: 100,
							left: 100
						};
					} else {
						var margin = {
							top: 0,
							right: 0,
							bottom: 0,
							left: 0
						};
					}
					var width = lineChartWidth - margin.left - margin.right,
						height = lineChartHeight - margin.top - margin.bottom;
					var showxaxislabel = (scope.showxaxislabel && (scope.showxaxislabel == true || scope.showxaxislabel == "true")) ? chartData.length : 0;
					var showyaxislabel = (scope.showyaxislabel && (scope.showyaxislabel == true || scope.showyaxislabel == "true")) ? 5 : 0;

					if (!document.getElementById('d3LineChartTooltipDiv')) {
						$('body').prepend('<div class="tooltip_d3linechart" id="d3LineChartTooltipDiv" style="opacity: 0;z-index:1000;"></div>');
					}

					var div = d3.select('#d3LineChartTooltipDiv');

					var x = d3.scale.ordinal().rangeRoundBands([0, width]);

					var y = d3.scale.linear()
						.range([height, 0]);

					var color = d3.scale.category10();

					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(showxaxislabel);

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.ticks(showyaxislabel);


					var line = d3.svg.line()
						.defined(function(d) {
							return d.value != '';
						})
						.interpolate("linear")
						.x(function(d, i) {
							return x(d.chartKey) + x.rangeBand() / 2
						})
						.y(function(d) {
							return y(d.chartValue);
						});

					var svg = d3.select(element[0]).append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					color.domain(yAxisFieldsArray);

					chartData.forEach(function(d) {
						try {
							if (scope.xaxisparser == 'date') {
								d[xAxisField] = parseDate(d[xAxisField]);
							} else if (scope.xaxisparser == 'number') {
								d[xAxisField] = Number(d[xAxisField]);
							} else {
								d[xAxisField] = d[xAxisField];
							}
							d.chartKey = d[xAxisField];
						} catch (e) {

						}
					});

					var yAxisFields = color.domain().map(function(name) {
						if (yAxisFieldsArray.indexOf(name) != -1) {
							return {
								name: name,
								values: chartData.map(function(d) {
									return {
										chartKey: d[xAxisField],
										chartValue: +d[name]
									};
								})
							};
						}
					});
					// function for the x grid lines
					function make_x_axis() {
						return d3.svg.axis()
							.scale(x)
							.orient("bottom")
							.ticks(chartData.length)
					}

					// function for the y grid lines
					function make_y_axis() {
						return d3.svg.axis()
							.scale(y)
							.orient("left")
							.ticks(5)
					}

					if (scope.xaxisparser == 'date') {
						x.domain(d3.extent(chartData, function(d) {
							return d.chartKey;
						}));
					} else if (scope.xaxisparser == 'number') {
						x.domain([
							d3.min(chartData, function(d) {
								return Number(d.chartKey);
							}),
							d3.max(chartData, function(d) {
								return Number(d.chartKey);
							})
						]);

					} else {
						x.domain(chartData.map(function(d) {
							return d.chartKey;
						}));
					}

					var minY = d3.min(yAxisFields, function(kv) {
						return d3.min(kv.values, function(d) {
							return d.chartValue;
						})
					});
					var maxY = d3.max(yAxisFields, function(kv) {
						return d3.max(kv.values, function(d) {
							return d.chartValue;
						})
					});
					//console.log(minY+'--'+maxY);
					y.domain([minY, maxY]);

					//var div = d3.select("#d3LinechartTooltip");

					if (showLegend == true || showLegend == 'true') {
						$('#'+scope.legendContainer).empty();
						 var legendRectSize = 18;                                  
		                 var legendSpacing = 4;  
		            	 if(angular.isDefined(scope.legendContainer)){
		            		 var legend = d3.select('#'+scope.legendContainer)
		                  		.append('svg')
		                  		.attr('height',yAxisFields.length*23)
		                  		.selectAll('.legend')                     
		                  		.data(yAxisFields)                                   
		                  		.enter()                                                
		                  		.append('g')                                            
		                  		.attr('class', 'legend')                                
		                  		.attr('transform', function(d, i) {                     
		                  			var height = legendRectSize + legendSpacing;         
		                  			var offset =  height * color.domain().length / 2;     
		                  			var horz = -2 * legendRectSize;                       
		                  			var vert = i * height;	                   
		                  			return 'translate(0,' + vert + ')';        
		                  		}); 
		            	 }else{
			            	  var legend = svg.selectAll(".legend")
			                  	.data(yAxisFields)
			                	.enter().append("g")
			                	.attr("class", "legend")
			                	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
		            	 }
		            	  
						/*var legend = d3.select(element[0]).append("svg")
							.attr("class", "legend")
							.attr("width", "100%")
							.attr("height", "95%")
							.style("float", "right")
							.style("padding", "15px 0 0 20px")
							.selectAll("g")
							.data(yAxisFields)
							.enter().append("g")
							.attr("transform", function(d, i) {
								return "translate(0," + (i * 25) + ")";
							});*/

						legend.append("rect")
							.attr("width", legendRectSize)
							.attr("height", legendRectSize)
							.style("fill", function(d) {
								return color(d.name);
							});

						legend.append("text")
							.attr("x", legendRectSize + legendSpacing)
							.attr("y", legendRectSize - legendSpacing)							
							.text(function(d) {
								return d.name;
							});
						
						 if (typeof scope.clickEvent !== 'undefined') {	                	
							 legend.on('click', function(d, i) {	                    	
		                      return eval("scope."+scope.clickEvent+"(d, i)");
		                     });
		                 }
					}

					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.selectAll("text")
						.style("text-anchor", "end")
						.attr("dx", "-.8em")
						.attr("dy", ".15em")
						.attr("transform", function(d) {
							return "rotate(-65)"
						});
					
					if (typeof scope.clickEvent !== 'undefined') {	   
						 svg.selectAll(".x.axis g.tick").on('click', function(d, i) {	                    	
		            		  return eval("scope."+scope.clickEvent+"(d, i)");
		                  });
					}
					svg.append("g")
						.attr("class", "y axis")
						.call(yAxis)
						.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
						.text(yAxisLabel);

					// Draw the x Grid lines
					svg.append("g")
						.attr("class", "grid")
						.attr("transform", "translate(0," + height + ")")
						.call(make_x_axis()
							.tickSize(-height, 0, 0)
							.tickFormat("")
						)

					// Draw the y Grid lines
					svg.append("g")
						.attr("class", "grid")
						.call(make_y_axis()
							.tickSize(-width, 0, 0)
							.tickFormat("")
						)

					var yAxisField = svg.selectAll(".yAxisField")
						.data(yAxisFields)
						.enter().append("g")
						.attr("class", "yAxisField");

					yAxisField.append("path")
						.attr("class", "line")
						.attr("d", function(d) {
							return line(d.values);
						})
						.style("stroke", function(d) {
							return color(d.name);
						});
					
					if (typeof scope.clickEvent !== 'undefined') {	                	
						yAxisField.on('click', function(d, i) {	                    	
		            		  return eval("scope."+scope.clickEvent+"(d, i)");
		                  });
		            	  
		            	 
		            	  
		              }
					
					if (scope.showtooltip == true || scope.showtooltip == 'true') {
						var tooltip = svg.selectAll("g.dot").data(yAxisFields).enter().append("g").attr("class", "dot").selectAll("circle").data(function(d) {
								return d.values;
							}).enter().append("circle").attr("r", 3)
							.attr("cx", function(d, i) {
								return x(d.chartKey) + x.rangeBand() / 2
							})
							.attr("cy", function(d, i) {
								return y(d.chartValue);
							})
							.on("mouseover", function(d) { // when the mouse goes over a circle, do the following
								div.transition() // declare the transition properties to bring fade-in div
									.duration(200) // it shall take 200ms
									.style("opacity", .9) // and go all the way to an opacity of .9
									.style("z-index", 10000); // and go all the way to an opacity of .9
								div.html(d.chartKey + "<br/>" + d.chartValue) // add the text of the tooltip as html 
									.style("left", (d3.event.pageX) + "px") // move it in the x direction 
									.style("top", (d3.event.pageY - 28) + "px"); // move it in the y direction
							}) // 
							.on("mouseout", function(d) { // when the mouse leaves a circle, do the following
								div.transition() // declare the transition properties to fade-out the div
									.duration(500) // it shall take 500ms
									.style("opacity", 0); // and go all the way to an opacity of nil
							});
					}
				};

				scope.$watchCollection('data', function(newx, oldx) {
					if (scope.data != undefined) {
						var results = eval("scope.data." + scope.rootnode);
						if (angular.isArray(results)) {
							scope.render(results)
						}
					}
				}, true);
			}
		};
	}]);
	
	/**
	<multi-bar-chart
	    data="data"
	    width="600"
	    height="300"
	    xaxisfield="State"
	    yaxisfields="Under 5 Years,5 to 13 Years,14 to 17 Years,18 to 24 Years,25 to 44 Years,45 to 64 Years,65 Years and Over"
	    yaxisfieldlabel="Population"
	    rootnode="VisionResponse.chartRootNode"
	    showlegend="false"
		>
	</multi-bar-chart>
		    
	** MultiBarChart **
	**/
	angular.module(appCon.appName).directive('multiBarChart', ["$state", function($state) {
		return {
		    restrict: 'E',
		    scope: {
		        data: "=",
		        rootnode: "@",
		        id: "@",
		        height: "@",
		        width: "@",
		        xaxisfield: "@",
		        yaxisfields: "@",
		        yaxisfieldlabel: "@",
		        xaxisparser: "@",
		        showlegend:"@",
	            clickEvent:"@",
	            legendContainer:"@"
		    },
		    link: function(scope, element) {
		    	var parseDate = d3.time.format("%Y%m%d").parse;
		        // Render graph based on 'data'
		        scope.render = function(data) {
		        	element.empty();
		        	var chartData = data;            	
		        	var multiBarChartWidth = scope.width;
		        	var multiBarChartHeight = scope.height;
		        	var xAxisField = scope.xaxisfield;
		        	var yAxisFields = scope.yaxisfields.split(',');
		        	var yAxisLabel = scope.yaxisfieldlabel;            	
		        	
		        	var showLegend = scope.showlegend?scope.showlegend:false;
		        	var margin = {top: 20, right: 80, bottom: 60, left: 50},
		        	    width = multiBarChartWidth - margin.left - margin.right,
		        	    height = multiBarChartHeight - margin.top - margin.bottom;
		        	
		        	var x0 = d3.scale.ordinal()
		            .rangeRoundBands([0, width], .1);
		
		        	var x1 = d3.scale.ordinal();
		
		        	var y = d3.scale.linear()
		            .range([height, 0]);
		
		            var color = d3.scale.category10();
		
		            var xAxis = d3.svg.axis()
		                .scale(x0)
		                .orient("bottom");
		
		            var yAxis = d3.svg.axis()
		                .scale(y)
		                .orient("left")
		               // .tickFormat(d3.format(".2s"));
		            
		            var tip = d3.tip()
			            .attr('class', 'd3-tip')
			            .offset([30, 0])
			            .html(function(d) {
			            	return "<strong>"+d.name+":</strong> <span style='color:red'>" + d.value + "</span>";
			            });
		            
		            var svg = d3.select(element[0]).append("svg")
		                .attr("width", width + margin.left + margin.right)
		                .attr("height", height + margin.top + margin.bottom)
		              .append("g")
		                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	     
		
		              data.forEach(function(d) {
		                d.yaxisfieldKey = yAxisFields.map(function(name) { return {name: name, value: +d[name]}; });
		              });
		
		              x0.domain(data.map(function(d) { return d[xAxisField]; }));
		              x1.domain(yAxisFields).rangeRoundBands([0, x0.rangeBand()]);
		              y.domain([0, d3.max(data, function(d) { return d3.max(d.yaxisfieldKey, function(d) { return d.value; }); })]);
		
		              svg.append("g")
		                  .attr("class", "x axis")
		                  .attr("transform", "translate(0," + height + ")")
		                  .call(xAxis);
		              
		              
		              svg.append("g")
		                  .attr("class", "y axis")
		                  .call(yAxis)
		                .append("text")
		                  .attr("transform", "rotate(-90)")
		                  .attr("y", 6)
		                  .attr("dy", ".71em")
		                  .style("text-anchor", "end")
		                  .text(scope.yaxisfieldlabel);
		              
		              svg.call(tip);
		              
		              var state = svg.selectAll(".state")
		                  .data(data)
		                .enter().append("g")
		                  .attr("class", "g")
		                  .attr("transform", function(d) { return "translate(" + x0(d[xAxisField]) + ",0)"; });
		
		              state.selectAll("rect")
		                  .data(function(d) { return d.yaxisfieldKey; })
		                .enter().append("rect")
		                  .attr("width", x1.rangeBand())
		                  .attr("x", function(d) { return x1(d.name); })
		                  .attr("y", function(d) { return y(d.value); })
		                  .attr("height", function(d) { return height - y(d.value); })
		                  .style("fill", function(d) { return color(d.name); })
		                  .on('mouseover', tip.show)
		                  .on('mouseout', tip.hide);
		              
		              if (typeof scope.clickEvent !== 'undefined') {	                	
		            	  state.selectAll("rect").on('click', function(d, i) {	                    	
		            		  return eval("scope."+scope.clickEvent+"(d, i)");
		                  });
		            	  
		            	  svg.selectAll(".x.axis g.tick").on('click', function(d, i) {	                    	
		            		  return eval("scope."+scope.clickEvent+"(d, i)");
		                  });
		              }
		              
		              if(showLegend == true || showLegend == 'true'){
		            	  $('#'+scope.legendContainer).empty();
		            	  var legendRectSize = 18;                                  
		                  var legendSpacing = 4;  
		            	  if(angular.isDefined(scope.legendContainer)){
		            		  var legend = d3.select('#'+scope.legendContainer)
		                  		.append('svg')
		                  		.attr('height',yAxisFields.length*23)
		                  		.selectAll('.legend')                     
		                  		.data(yAxisFields.slice().reverse())                                   
		                  		.enter()                                                
		                  		.append('g')                                            
		                  		.attr('class', 'legend')                                
		                  		.attr('transform', function(d, i) {                     
		                  			var height = legendRectSize + legendSpacing;         
		                  			var offset =  height * color.domain().length / 2;     
		                  			var horz = -2 * legendRectSize;                       
		                  			var vert = i * height;	                   
		                  			return 'translate(0,' + vert + ')';        
		                  		}); 
		            	  }else{
			            	  var legend = svg.selectAll(".legend")
			                  	.data(yAxisFields.slice().reverse())
			                	.enter().append("g")
			                	.attr("class", "legend")
			                	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
		            	  }
			
		            	  legend.append('rect')                                    
			                  .attr('width', legendRectSize)                        
			                  .attr('height', legendRectSize)                        
			                  .style('fill', color)                                   
			                  .style('stroke', color);                               
		                  
		            	  legend.append('text')                                     
			                  .attr('x', legendRectSize + legendSpacing)             
			                  .attr('y', legendRectSize - legendSpacing)              
			                  .text(function(d) { return d; });
			              
			              if (typeof scope.clickEvent !== 'undefined') {	                	
			            	  legend.on('click', function(d, i) {	                    	
			            		  return eval("scope."+scope.clickEvent+"(d, i)");
			                  });
			              }
			            	
			          	}	
		            };
		
		        //Watch 'data' and run scope.render(newVal) whenever it changes
		        //Use true for 'objectEquality' property so comparisons are done on equality and not reference
		            
		        scope.$watchCollection('data', function(newx, oldx) {
		        	if (scope.data != undefined) {
		                var results = eval("scope.data." + scope.rootnode);
		                if (angular.isArray(results)) {
		                    scope.render(results);
		                }
		            }
		        }, true);
		    }
		};	
	}]);
	
	angular.module(appCon.appName).directive("vmCarousel", function($injector, $timeout) {
		  return {
		    restrict: "AEC",
		    scope: {
		      initOnload: "@",
		      data: "=",
		      currentIndex: "=",
		      accessibility: "@",
		      adaptiveHeight: "@",
		      arrows: "@",
		      asNavFor: "@",
		      appendArrows: "@",
		      appendDots: "@",
		      autoplay: "@",
		      autoplaySpeed: "@",
		      centerMode: "@",
		      centerPadding: "@",
		      cssEase: "@",
		      customPaging: "&",
		      dots: "@",
		      draggable: "@",
		      easing: "@",
		      fade: "@",
		      focusOnSelect: "@",
		      infinite: "@",
		      initialSlide: "@",
		      lazyLoad: "@",
		      onBeforeChange: "&",
		      onAfterChange: "&",
		      onInit: "&",
		      onReInit: "&",
		      onSetPosition: "&",
		      pauseOnHover: "@",
		      pauseOnDotsHover: "@",
		      responsive: "=",
		      rtl: "@",
		      slide: "@",
		      slidesToShow: "@",
		      slidesToScroll: "@",
		      speed: "@",
		      swipe: "@",
		      swipeToSlide: "@",
		      touchMove: "@",
		      touchThreshold: "@",
		      useCSS: "@",
		      variableWidth: "@",
		      vertical: "@",
		      prevArrow: "@",
		      nextArrow: "@"
			  
		    },
		    link: function(scope, element, attrs) {
		      var destroySlick, initializeSlick, isInitialized;
		      destroySlick = function() {
		        return $timeout(function() {
		          var slider;
		          slider = $(element);
		          slider.slick('unslick');
		          slider.find('.slick-list').remove();
		          return slider;
		        });
		      };
		      initializeSlick = function() {
		        return $timeout(function() {
		          var currentIndex, customPaging, slider;
		          slider = $(element);
		          if (scope.currentIndex != null) {
		            currentIndex = scope.currentIndex;
		          }
		          customPaging = function(slick, index) {
		            return scope.customPaging({
		              slick: slick,
		              index: index
		            });
		          };
		          slider.slick({
		            accessibility: scope.accessibility !== "false",
		            adaptiveHeight: scope.adaptiveHeight === "true",
		            arrows: scope.arrows !== "false",
		            asNavFor: scope.asNavFor ? scope.asNavFor : void 0,
		            appendArrows: scope.appendArrows ? $(scope.appendArrows) : $(element),
		            appendDots: scope.appendDots ? $(scope.appendDots) : $(element),
		            autoplay: scope.autoplay === "true",
		            autoplaySpeed: scope.autoplaySpeed != null ? parseInt(scope.autoplaySpeed, 10) : 3000,
		            centerMode: scope.centerMode === "true",
		            centerPadding: scope.centerPadding || "50px",
		            cssEase: scope.cssEase || "ease",
		            customPaging: attrs.customPaging ? customPaging : void 0,
		            dots: scope.dots === "true",
		            draggable: scope.draggable !== "false",
		            easing: scope.easing || "linear",
		            fade: scope.fade === "true",
		            focusOnSelect: scope.focusOnSelect === "true",
		            infinite: scope.infinite !== "false",
		            initialSlide: scope.initialSlide || 0,
		            lazyLoad: scope.lazyLoad || "ondemand",
		            beforeChange: attrs.onBeforeChange ? scope.onBeforeChange : void 0,
		            onReInit: attrs.onReInit ? scope.onReInit : void 0,
		            onSetPosition: attrs.onSetPosition ? scope.onSetPosition : void 0,
		            pauseOnHover: scope.pauseOnHover !== "false",
		            responsive: scope.responsive || void 0,
		            rtl: scope.rtl === "true",
		            slide: scope.slide || "div",
		            slidesToShow: scope.slidesToShow != null ? parseInt(scope.slidesToShow, 10) : 1,
		            slidesToScroll: scope.slidesToScroll != null ? parseInt(scope.slidesToScroll, 10) : 1,
		            speed: scope.speed != null ? parseInt(scope.speed, 10) : 300,
		            swipe: scope.swipe !== "false",
		            swipeToSlide: scope.swipeToSlide === "true",
		            touchMove: scope.touchMove !== "false",
		            touchThreshold: scope.touchThreshold ? parseInt(scope.touchThreshold, 10) : 5,
		            useCSS: scope.useCSS !== "false",
		            variableWidth: scope.variableWidth === "true",
		            vertical: scope.vertical === "true",
		            prevArrow: scope.prevArrow ? $(scope.prevArrow) : void 0,
		            nextArrow: scope.nextArrow ? $(scope.nextArrow) : void 0
		          });
		          slider.on('init', function(sl) {
		            if (attrs.onInit) {
		              scope.onInit();
		            }
		            if (currentIndex != null) {
		              return sl.slideHandler(currentIndex);
		            }
		          });
		          slider.on('afterChange', function(event, slick, currentSlide, nextSlide) {
		            if (scope.onAfterChange) {
		              scope.onAfterChange();
		            }
		            if (currentIndex != null) {
		              return scope.$apply(function() {
		                currentIndex = currentSlide;
		                return scope.currentIndex = currentSlide;
		              });
		            }
		          });
		          return scope.$watch("currentIndex", function(newVal, oldVal) {
		            if ((currentIndex != null) && (newVal != null) && newVal !== currentIndex) {
		              return slider.slick('slickGoTo', newVal);
		            }
		          });
		        });
		      };
		      if (scope.initOnload) {
		        isInitialized = false;
		        return scope.$watch("data", function(newVal, oldVal) {
		          if (newVal != null) {
		            if (isInitialized) {
		              destroySlick();
		            }
		            initializeSlick();
		            return isInitialized = true;
		          }
		        });
		      } else {
		        return initializeSlick();
		      }
		    }
		  };
		});
	

	/**** Error Message display ****/
	/**  <error-message data="data.errorData.ResponseError"></error-message> **/
	angular.module(appCon.appName).directive('errorMessage', function() {
	    var directive = {};
	    directive.restrict = 'E';
	    directive.scope = {
	        data: '='
	    };
	    
	    directive.template = [
	                          	'<div class="table-responsive" ng-if="data">',
								'<div class="text-danger" ng-repeat="error in data">',
								'<span class="fa fa-warning" aria-hidden="true">&nbsp;</span>',
								'{{error.longMessage}}',
								'</div>',
								'</div>'
							].join('');

	    return directive;
	});
	
	//Check All directive
	angular.module(appCon.appName).directive('vmCheckAll', ['$timeout', '$filter', function ($timeout, $filter) {
		return {
			scope: {
				checkModel: '=',
				checkedEntities: '=',
				data: '='
			},
			link: function (scope, element, attrs) {

				/**
				 * @property checkAll
				 * @property checkContainer
				 * @property checkContainerClosest
				 * @property checkReselect
				 */

				var $container,
					all, $all;

				if (attrs.checkContainer) {
					$container = angular.element(attrs.checkContainer);
				}
				else if (attrs.checkContainerClosest) {
					$container = element.closest(attrs.checkContainerClosest);
				}

				function reinitAll() {
					if ($container[0]) {
						all = $container[0].querySelectorAll(attrs.vmCheckAll);
						$all = angular.element(all);
					}
				}

				$timeout(reinitAll);

				var tableScope = element.closest('table').scope();
				tableScope.$on('ngTableAfterReloadData', function () {
					$timeout(function () {
						if (!all.length || attrs.checkReselect) {
							reinitAll();
						}

						element[0].checked  = Array.prototype.slice.call($all).every(function (el) {
							return el.checked;
						});
					});
				});

				// check-all checkbox
				element.on('change', function () {

					if (!all.length || attrs.checkReselect) {
						reinitAll();
					}

					for (var i = 0; i < all.length; i++) {
						all[i].checked = this.checked;
						toggle(scope.checkModel, all[i].value, this.checked);
						if (scope.checkedEntities) {
							toggle(scope.checkedEntities, $filter('filter')(scope.data, {id: all[i].value})[0], this.checked);
						}
					}
					scope.$apply();
				});

				// individual checkboxes
				$container.on('change', attrs.vmCheckAll, function () {

					if (!all.length || attrs.checkReselect) {
						reinitAll();
					}

					if (!this.checked) {
						element[0].checked = false;
					}
					else if ($all.filter(':checked').length === $all.length) {
						element[0].checked = true;
					}
					toggle(scope.checkModel, this.value, this.checked);
					if (scope.checkedEntities) {
						toggle(scope.checkedEntities, $filter('filter')(scope.data, {id: this.value})[0], this.checked);
					}
					scope.$apply();
				});

				scope.$parent.$watch(attrs.checkModel, function (newVal, oldVal) {
					if (newVal !== oldVal) {
						var allChecked = true;
						for (var i = 0; i < all.length; i++) {
							var status = newVal.indexOf(all[i].value) !== -1;
							all[i].checked = status;
							if (!status) {
								allChecked = false;
							}
						}
						element[0].checked = allChecked;
					}
				}, true);

				function toggle(model, value, state) {
					var idx = model.indexOf(value);
					if (state) {
						if (idx === -1) {
							model.push(value);
						}
					}
					else if (idx !== -1) {
						model.splice(idx, 1);
					}
				}
			}
		};
	}]);
	
	/**
	 * @Component loading-container = "$scope promises" whether true / false
	 * @Usage <div loading-container="loading"></div>
	 */
	angular.module(appCon.appName).directive('loadingContainer', ["$http", function ($http) {
		return {
			restrict: 'A',
			scope: false,
			link: function (scope, element, attrs) {
				var loadingLayer = angular.element('<div class="loading"></div>');
				element.append(loadingLayer);
				element.addClass('loading-container');
				scope.isLoading = function () {
					return $http.pendingRequests.length > 0;
                };
                
				scope.$watch(scope.isLoading, function (value) {
					loadingLayer.toggleClass('ng-hide', !value);
				});
			}
		};
	}]);
	
	//image cropper
	angular.module(appCon.appName).directive('imageCropper', function($parse,$timeout) {

		return {
			restrict : 'E',
			replace : true,
			scope : {
				src : '@'
			},
			templateUrl: 'imagecropper.html',
			link : function(scope, element, attr) {
				scope.selected_data = {};
				var imageTag, jcrop_api, boundx, boundy, rx, ry,
				showPreview = attr.showPreview?attr.showPreview:true;	
				formNode = attr.formNode?attr.formNode:'';
				idField = attr.idField?attr.idField:'id';
				// Grab some information about the preview pane
				$preview = $('#preview-pane'), $pcnt = $('#preview-pane .preview-container'), $pimg = $('#preview-pane .preview-container img'),
				xsize = $pcnt.width(), ysize = $pcnt.height();
				
				scope.$watch('src', function(image_source) {
					//get the download image path
					var requestParam = 'id='+image_source;
	            	if(appCon.globalCon.request)
	            		requestParam = appCon.globalCon.request.param+"={\""+appCon.globalCon.request.value+"\":{\"id\":\""+image_source+"\"}}";
	            	else if(requestType ==='json')
	            		requestParam = "{\"id\":\""+image_source+"\"}";
	            	
	            	var downloadFilePath = appCon.globalCon.serviceBaseURL+appCon.globalCon.file.downloadURL;
	            	if(downloadFilePath.indexOf(":")>=0){
	            		downloadFilePath = downloadFilePath.replace(':id',image_source);
	            	}
	            	else{	
		            	if(appCon.globalCon.file.downloadURL.indexOf("?") >=0 )
		            		downloadFilePath +='&'+requestParam;
		            	else 
		            		downloadFilePath += '?'+requestParam;
	            	}
	            	
					if (image_source) {
						scope.$parent.cropImageFilePath=downloadFilePath;
						// dynamically create a image tag and assign source
						element.after('<img />');
						imageTag = element.next();
						imageTag.attr('width', '50%');
						imageTag.attr('src', downloadFilePath);
					}
					jQuery(imageTag).Jcrop({
						onChange : updatePreview,
						onSelect : updatePreview,
						aspectRatio : xsize / ysize,
						setSelect: [ 50, xsize, ysize, 50 ]
					}, function() {
						if(showPreview != 'false'){
							// Use the API to get the real image size
							var bounds = this.getBounds();
							boundx = bounds[0];
							boundy = bounds[1];
							// Store the API in the jcrop_api variable
							jcrop_api = this;
							var c = jcrop_api.tellSelect();
							rx = xsize / c.w;
							ry = ysize / c.h;
	
							$pimg.css({
								width : Math.round(rx * boundx) + 'px',
								height : Math.round(ry * boundy) + 'px',
								marginLeft : '-' + Math.round(rx * c.x) + 'px',
								marginTop : '-' + Math.round(ry * c.y) + 'px'
							});
							// Move the preview into the jcrop container for css positioning
							$preview.appendTo(jcrop_api.ui.holder);
						}
					});				
				});
				
				//show preview image
				function updatePreview(c) {	
					if(scope.src){
						$timeout(function() {
							scope.cropInfo = {
									height: c.h,
									width: c.w,
									leftPosition: c.x,
									topPosition: c.y
							};
							if(scope.$parent.imagecropper)
								scope.cropInfo[idField] = scope.$parent.imagecropper;
							$parse(formNode).assign(scope,scope.cropInfo);
						});
						if(showPreview != 'false'){
							if (parseInt(c.w) > 0) {
								rx = xsize / c.w;
								ry = ysize / c.h;

								$pimg.css({
									width : Math.round(rx * boundx) + 'px',
									height : Math.round(ry * boundy) + 'px',
									marginLeft : '-' + Math.round(rx * c.x) + 'px',
									marginTop : '-' + Math.round(ry * c.y) + 'px'
								});
							}
						}
					}else{
						angular.element('.jcrop-holder').remove();
						$parse(formNode).assign(scope,{});
					}										
				}
				 
				var clear = function() {
		        if (imageTag) {
		        	imageTag.next().remove();
		        	imageTag.remove();
		        	imageTag = undefined;
		        }
				};
				scope.$on('$destroy', clear);
			}
		};	
	});
	
	/**** Jvector Map 
	<jvector-map 
		container-id="uniqueId" 
		class-name="jvectorclass" 
		data="data" 
		markers="true" 
		marker-click="$parent.testmarkerclick" 
		marker-tooltip="$parent.testmarkertooltip"
		background="#F5F1C8"
		marker-fill="#34A6E7"
		marker-hover="#E7E260"
		region-fill="#00AF1B"
		region-hover="#6D6B78"					
	>
	</jvector-map> */
	angular.module(appCon.appName).directive('jvectorMap', function() {
	    var directive = {};
	    directive.restrict = 'E';
	    directive.scope = {
	        data: '=',
	        markerClick : '@',
	        markerTooltip : '@',
	        containerId : "@",
	        className : "@"	        
	    };
	    
	    directive.template = '<div id="{{containerId}}" class="{{className}}"></div>';
	    
	    directive.compile = function(element, attributes) {
	    	var mapObject = {
	    			map : 'us_aea_en',
	    			series : {},
	    			backgroundColor : attributes.background ? attributes.background : "#FFFFFF",
	    			
	    			markerStyle : {
    					initial: {
    						fill: attributes.markerFill ? attributes.markerFill : "#F99F21",
    						stroke : attributes.markerFill ? attributes.markerFill : "#F99F21",
    						r : 7,
    					},
    		    	    hover: {
    		    	    	stroke : attributes.markerHover ? attributes.markerHover : "#F99F21",
    		    	    	fill : attributes.markerHover ? attributes.markerHover : "#F99F21"
    		    	    }
    				},
    				regionStyle : {
			    		initial: {
			    			fill: attributes.regionFill ? attributes.regionFill : "#8FCE08"
			    		},
			    	    hover: {
			    	    	stroke : attributes.regionHover ? attributes.regionHover : "#F99F21",
			    	    	fill : attributes.regionHover ? attributes.regionHover : "#A5D839"
			    	    }	
			    	},
			    	
					onMarkerClick: function(event, index){
						
					}
	    	};
			
			
	        var linkFunction = function($scope, element, attributes) {
	        	$scope.$watch('data', function() {
	        		if (angular.isDefined($scope.data)) {
	        			
	        			mapObject.markers = (attributes.markers && attributes.markers === "true") ? $scope.data : {};  
	        			
	        			mapObject.onMarkerLabelShow = function(event, label, index){
	        				if($scope.markerTooltip){
	        					return eval("$scope."+$scope.markerTooltip+'(event, label, index)');
	        				}else{
	        					return false;
	        				}
						}
	        			
	        			mapObject.onMarkerClick = function(event, index){
	        				if($scope.markerClick){
	        					return eval("$scope."+$scope.markerClick+'(event, index)');
	        				}else{
	        					return false;
	        				}
						}
						$("#"+attributes.containerId).empty();
	        			$("#"+attributes.containerId).vectorMap(mapObject);	        			
	        		}
	        	});
	        }
	
	        return linkFunction;
	    };	
	    return directive;
	});
	
	
})();