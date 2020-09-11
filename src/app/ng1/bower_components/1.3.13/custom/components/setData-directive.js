'use strict';
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

angular.module(appCon.appName).directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});