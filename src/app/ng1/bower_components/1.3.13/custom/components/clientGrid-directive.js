'use strict';
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