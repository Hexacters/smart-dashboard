'use strict';
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
        				$('.jvectormap-label').hide();
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