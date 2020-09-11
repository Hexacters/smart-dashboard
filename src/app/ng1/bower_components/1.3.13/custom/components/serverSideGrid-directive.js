'use strict';
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