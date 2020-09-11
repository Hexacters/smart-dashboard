'use strict';
/*
 * Popover functionality
 * Hide the popover if click out of en element 
 * eg: <a interapp-popover  placement="bottom" template="mulitiApp.html"></a>
 */
angular.module(appCon.appName).directive('interappPopover', function ($compile,$document,$templateCache,$timeout) {
    return {
        restrict: 'A',		      
        link: function (scope, element, attrs) {
        element.data('multiApp',true);
        var templateUrl = $templateCache.get(attrs.template); 
        var options = {
        		trigger: 'click',
                html: true,
                container : 'body',
                placement: attrs.placement,
                content: function(){
    					 return $compile($(templateUrl))(scope);	
    			}               
        };
        $timeout(function(){
            $(element).popover(options);
        },0);        			
		angular.element($document[0].body).bind('click',function(e) {
               var currentElement =  angular.element(e.target).inheritedData('multiApp');			   			   
				if (angular.isUndefined(currentElement) || currentElement===false) {
					if(angular.element(e.target).parents('.popover').length===0 && !(angular.isDefined(e.target.id) && e.target.id ==='scrollDown' || angular.isDefined(e.target.id) && e.target.id ==='scrollUp')){
						$(element).popover('hide');
					}else{
						if(angular.element(e.target).hasClass('myAppLink'))
							$(element).popover('hide');
					}
				}else{
					$timeout(function(){
			            $(element).popover(options);
			        },0);
				}
            });
        }		
    };
});