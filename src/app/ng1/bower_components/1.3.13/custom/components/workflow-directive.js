'use strict';
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