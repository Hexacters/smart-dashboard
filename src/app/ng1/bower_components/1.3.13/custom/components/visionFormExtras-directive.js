'use strict';
//TODO : Custom form events are binded here - review and cleanup
angular.module(appCon.appName).directive('visionFormExtras', function($rootScope) {
	return {
        restrict : 'A',
        scope : true,
        controller : "visionFormExtrasController"
	};
});

angular.module(appCon.appName).controller("visionFormExtrasController", [ "$injector", "$scope", "$parse", "$modal", "$state", "$translate", "$rootScope", function($injector, $scope, $parse, $modal, $state, $translate, $rootScope){
	/**Add row*/
    $scope.addRowItem = function(arrayDataObj, dataObj) {
    	var dataModel; 
    	if(angular.isDefined(arrayDataObj) && angular.isString(arrayDataObj)){
    		dataModel = $parse(arrayDataObj)($scope);
    	}else{
    		dataModel = arrayDataObj;
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