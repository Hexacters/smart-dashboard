'use strict';
/**
 * visionAction Directive
 * 
 * Get data from service using either GET or POST method
 * Submit the form to external service to save or update information given by user
 * 
 */
angular.module(appCon.appName).directive('visionAction', function($rootScope) {
	return {
        restrict : 'EA',
        scope : true,
        controller : "visionActionController" 
	};
});

angular.module(appCon.appName).controller("visionActionController", [ "$injector", "$element", "$scope", "$state", "$rootScope", function($injector, $element, $scope, $state, $rootScope){

	var $parse = $injector.get("$parse"),
		getData = $element.children('get-data'),
    	submitData = $element.children('submit-data'),
    	formTag = $element.find('form'),
    	getServiceName, 
    	getOperationName, 
    	submitServiceName,
    	submitOperationName,
    	submitFormNode,
    	params, 
    	rootNode, 
    	formNode,
    	responseModel,
    	redirectState,
    	redirectStateParams,
    	redirectStateType,
    	callback,
    	callbackFunc;
	
	var loadGetData = function(){
		$scope.getError = {};
		var requestFormatter = getData.attr('request-formatter'); 
        if(angular.isDefined(requestFormatter)){                	
        	var requestFormatterFunc = $parse(requestFormatter)($scope);
        	params = requestFormatterFunc(params);
        	if(typeof(params) === 'boolean'){                	
        		return;
        	}
        }
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
        		var responseFormatter = getData.attr('response-formatter'); 
        		if(angular.isDefined(responseFormatter)){                	
                	var responseFormatterFunc = $parse(responseFormatter)($scope);
                	$scope.data = responseFormatterFunc(result.data);                	
                }else {
                	$scope.data = result.data;
                }
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
        	
        	var getDataCallback = getData.attr('callback');    		
    		if(angular.isDefined(getDataCallback)){
				var getDataCallbackFunc = $parse(getDataCallback)($scope);
    			return getDataCallbackFunc(result);
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
    		$scope.submitError = {};
    		submitServiceName = submitData.attr('service');
        	submitOperationName = submitData.attr('operation');
        	submitFormNode = submitData.attr('form-node') ? submitData.attr('form-node') : "data";
        	
        	var removeKeys = submitData.attr('remove-keys') ? submitData.attr('remove-keys') : "";
        	
        	if ($scope[formTag.attr('name')].$valid) {
        		disableAll($element[0]);
        		$scope.formSubmitted = true;
                $scope.loading = true;
                $rootScope.loading = true;
                params = $parse(submitFormNode)($scope);
                
                if(removeKeys && removeKeys.length > 0){
                	if(removeKeys.indexOf(",")>=0){
                		removeKeys = removeKeys.split(",");
                	}
                	
                	params = deleteKeysFromObject(params, removeKeys);
                }
                var requestFormatter = submitData.attr('request-formatter'); 
                if(angular.isDefined(requestFormatter)){                	
                	var requestFormatterFunc = $parse(requestFormatter)($scope);
                	params = requestFormatterFunc(params);
                	if(typeof(params) === 'boolean'){                	
                		return;
                	}
                }
                $scope.promise = $injector.get(submitServiceName)[submitOperationName](params).then(
                	function(result) {
                		enableAll($element[0]);
                		$scope.formSubmitted = false;
                		$scope[formTag.attr('name')].$setPristine(true);
                		$scope.loading = false;
                		$rootScope.loading = false;
                		callback = submitData.attr('callback');

                		if(callback){
            				callbackFunc = $parse(callback)($scope);
    	        			return callbackFunc(result);
            			}else{
	                		if(result.data.status==='success'){
	                			redirectState = submitData.attr('redirectState');
	                			redirectStateParams = submitData.attr('redirectStateParams');
	                			redirectStateType = submitData.attr('redirectStateType');
	                			
	                			if (redirectState) {
		                			if( redirectStateType === 'dialog'){
		                				$scope.$dismiss(); 
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
            			}
	                },
	                function(error){
	                	enableAll($element[0]);
	                	$scope.formSubmitted = false;
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