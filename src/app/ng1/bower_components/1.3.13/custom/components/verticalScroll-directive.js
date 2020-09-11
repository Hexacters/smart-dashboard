'use strict';
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

angular.module(appCon.appName).controller("verticalScrollController", ["$scope", "$http", "$attrs", "$injector", "$parse","$state","$rootScope", "$element", function($scope, $http, $attrs, $injector, $parse, $state, $rootScope, $element) {
    $scope.results = [];
    $scope.totalRecords = 0;

    var counter = 0,
        service = $attrs.service,
        operation = $attrs.operation,
        rootNode = $attrs.rootNode,
        startIndex,
        totalRecordsNode = $attrs.totalRecordsNode ? $attrs.totalRecordsNode : 'data.successData.totalRecords';
    
    //observe attr change
    $scope.$watch(function() {return $element.attr('params'); }, function(newParams, oldParams){
    	if (newParams != "" && typeof oldParams != undefined && !angular.equals(newParams, oldParams)) {
    		$scope.results = [];
    	    $scope.totalRecords = 0;
    	    counter = 0;
    	    startIndex = 0;
    	    $scope.newParams = newParams;
    	    $scope.loadData();
    	}
    });
    
    $scope.loadData = function() {
    	$scope.verticalScrollProcessCompleted = false;
    	if (!startIndex){
    		startIndex = 0;
    	}
    	if (counter < $scope.totalRecords || counter == 0) {
        	var params = {
        		"startIndex" : startIndex * $attrs.limit,
        		"limit" : $attrs.limit		
        	}
        	if(angular.isDefined($scope.newParams)){
        		if(angular.isString($scope.newParams)){
        			$scope.newParams = JSON.parse($scope.newParams);
        		}
        		params = angular.extend(params, $scope.newParams);
        	}
        	$scope.loading = true;
        	$rootScope.loading = true;
        	
        	var requestFormatter = $attrs.requestFormatter; 
            if(angular.isDefined(requestFormatter)){                	
            	var requestFormatterFunc = $parse(requestFormatter)($scope);
            	params = requestFormatterFunc(params, $scope);
            	if(typeof(params) === 'boolean'){                	
            		return;
            	}
            }
            
            $injector.get(service)[operation](params).then(function(result) {
            	if(result.data.status==='success'){
            		$scope.data = result.data;
            		var items = $parse(rootNode)($scope);
            		$scope.totalRecords = $parse(totalRecordsNode)($scope);
	            	
            		for (var i = 0; i < items.length; i++) {
	                    $scope.results.push(items[i]);
	                    counter += 1;
	                }
            	}
            	$scope.verticalScrollProcessCompleted = true;
            	$scope.loading = false;
            	$rootScope.loading = false;
            	   		
        		if(angular.isDefined($attrs.callback)){
    				var callbackFunc = $parse($attrs.callback)($scope);
        			return callbackFunc(result);
    			}
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