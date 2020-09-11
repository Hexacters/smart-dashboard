'use strict';
/**
 * Multiselect Directive with/without drag&drop and sortable
 * 
 * @description
 * 
 * This component can be used to select single/multiple data from a list
 * 
 * @params - {object} - To specify if search from outer scope of this directive to reload the data
 * @returnType - {string} - return type to be single field  or object
 * @returnFields - {object} - what are the fields to be needed for form scope 
 * @rootNode - {string} - specify to took data from response for which object(i.e from scope data)
 * @parentDataField - {string} - update selected data to form scope.
 * @initialDataLoad - {boolean} - data to be loaded by rendering component or not.
 *  
 * It can be called as follows:
 
 <multi-select mode='1-1'
	params='{"param1":"param1value"}'
	return-type='object'
	return-fields='id, name'
	service='serviceName'
	operation='operationName'
	root-node='rootNode'
	parent-data-field='formScopeNode'
	initial-data-load='false'>
	
	<lpanel draggable='true' id='availableSubscriptions' label='Available' size='7' order-by='name' filter='' value='xsblId' text='name'></lpanel>
	<cpanel id='cpanelAssignedSubscriptions'></cpanel>
	<rpanel draggable='true' id='assignedSubscriptions' label='Selected' size='7' order-by='name' filter='orgId={{$parent.data.organizationId}}' value='xsblId' text='name'></rpanel>
 </multi-select>
 *
 */

angular.module(appCon.appName).directive('multiSelect', function($parse, $translate) {
    return {
        restrict: 'E',
        controller: 'multiSelectController',
        scope: true,
        link: function($scope, element, attributes) {
        	$( '.rpanelDraggable' ).disableSelection();
            var lpanelDir = element.find('lpanel'), 
            	rpanelDir = element.find('rpanel'), 
            	data,
                mode = attributes.mode,
                hasSearch = attributes.hasSearch;
			
			$scope.isExternalSearch= angular.isDefined(attributes.hasSearch) ? true : false;
			
            $scope.lpanel = {
        		id : lpanelDir.attr('id'),
        		name :lpanelDir.attr('id'),
        		text : lpanelDir.attr('text'),
        		value : lpanelDir.attr('value'),
        		draggable : lpanelDir.attr('draggable'),
        		sortable : lpanelDir.attr('sortable'),
        		label : $translate.instant(lpanelDir.attr('label')),
        		tooltipText : lpanelDir.attr('tooltip-text'),
        		tooltipPlacement : lpanelDir.attr('tooltip-placement') ? lpanelDir.attr('tooltip-placement') : 'top',
        		size : lpanelDir.attr('size') ?  lpanelDir.attr('size') : '7',
        		orderBy : lpanelDir.attr('order-by'),
        		checkbox : lpanelDir.attr('checkbox'),
        		checkboxModel :  lpanelDir.attr('checkbox-model'),
        		selectedData : [],
        		className :  lpanelDir.attr('class-name') ? ' '+lpanelDir.attr('class-name') : '',
        		lpanelSortableOptions :{
        			//restrict move across columns. move only within column.
        		    accept: function (sourceItemHandleScope, destSortableScope) {
        		    	return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
        		    },
        		    itemMoved: function (event) {
        		    	return true;//event.source.itemScope.modelValue.status = event.dest.sortableScope.$parent.column.name;
        		    }
        		}
            };

            $scope.rpanel = {
        		id : rpanelDir.attr('id'),
        		name :rpanelDir.attr('id'),
        		text : rpanelDir.attr('text'),
        		value : rpanelDir.attr('value'),
        		draggable : rpanelDir.attr('draggable'),
        		sortable : rpanelDir.attr('sortable'),
        		label : $translate.instant(rpanelDir.attr('label')),
        		tooltipText : rpanelDir.attr('tooltip-text'),
        		tooltipPlacement : rpanelDir.attr('tooltip-placement') ? rpanelDir.attr('tooltip-placement') : 'top',
        		size : rpanelDir.attr('size') ?  rpanelDir.attr('size') : '7',
        		orderBy : rpanelDir.attr('order-by'),
        		checkbox : rpanelDir.attr('checkbox'),
        		checkboxModel :  rpanelDir.attr('checkbox-model'),
        		selectedData : [],
        		className :  rpanelDir.attr('class-name') ? ' '+rpanelDir.attr('class-name') : '',
        		rpanelSortableOptions :{
        			//restrict move across columns. move only within column.					
        			accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
						if(sourceItemHandleScope.$parent.item.disabledData == true){
							return false;
						}else if(destItemScope && destItemScope.item && destItemScope.item.disabledData == true){
							return false;
						}else{
							return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
						}
					},
        		    dragStart : function (event) {
						if(event.source.itemScope.item.disabledData == true){
							event.source.isDisabled = true;
							return false;
						}else{
							return true;
						}
        		    },					
        		    itemMoved: function (event) {
        		    	//return true;//event.source.itemScope.modelValue.status = event.dest.sortableScope.$parent.column.name;
        		    }
        		}
            };

            var rpanel2Dir = element.find('rpanel2');
            if (mode === '1-2') {
            	$scope.rpanel2 = {
            		id : rpanel2Dir.attr('id'),
            		name :rpanel2Dir.attr('id'),
            		text : rpanel2Dir.attr('text'),
            		value : rpanel2Dir.attr('value'),
            		draggable : rpanel2Dir.attr('draggable'),
            		sortable : rpanel2Dir.attr('sortable'),
            		label : $translate.instant(rpanel2Dir.attr('label')),
            		tooltipText : rpanel2Dir.attr('tooltip-text'),
            		tooltipPlacement : rpanel2Dir.attr('tooltip-placement') ? rpanel2Dir.attr('tooltip-placement') : 'top',
            		size : rpanel2Dir.attr('size') ? rpanel2Dir.attr('size') : '7',
            		orderBy : rpanel2Dir.attr('order-by'),
            		selectedData : [],
            		className :  rpanel2Dir.attr('class-name') ? ' '+rpanel2Dir.attr('class-name') : '',
            		rpanel2SortableOptions : {
    	                accept: function() {
    	                    return true;
    	                }
            		}
                };
            }
            
            /**pre populate data in edit mode - need to check again*/
            $scope.dataPrepopulated = false;
            $scope.$watch(attributes.parentDataField, function (){
        		data = [];
            	var rpanelData = $parse(attributes.parentDataField)($scope);
            	if($scope.lpanel.data && $scope.lpanel.data.length> 0  && rpanelData){
            		for (var i = $scope.lpanel.data.length - 1; i >= 0; i--) {
            			for (var j = rpanelData.length - 1; j >= 0; j--) {
            				if ($scope.lpanel.data[i] && ($scope.lpanel.data[i][$scope.lpanel.value] === rpanelData[j][$scope.lpanel.value])) {
            					data.push($scope.lpanel.data[i]);
            					$scope.lpanel.data.splice(i, 1);
            				}
                		}
            		}
            		$scope.dataPrepopulated = true;
					$scope.rpanel.data = rpanelData;
            	}
            });
            
            if (mode === '1-2') {
            	$scope.$watch(attributes.parentDataFieldOptional, function (){
            		data = [];
                	var rpanel2Data = $parse(attributes.parentDataFieldOptional)($scope);
                	if($scope.lpanel.data && $scope.lpanel.data.length> 0  && rpanel2Data){
                		for (var i = $scope.lpanel.data.length - 1; i >= 0; i--) {
                			for (var j = rpanel2Data.length - 1; j >= 0; j--) {
                				if ($scope.lpanel.data[i] && ($scope.lpanel.data[i][$scope.lpanel.value] === rpanel2Data[j][$scope.lpanel.value])) {
                					data.push($scope.lpanel.data[i]);
                					$scope.lpanel.data.splice(i, 1);
                				}
                    		}
                		}
                		$scope.dataPrepopulated = true;
						$scope.rpanel2.data = rpanel2Data;
                	}
            	});
            }
        }
    };
});

angular.module(appCon.appName).directive('lpanel', function() {
    return {
        restrict: 'E',
        templateUrl: function(elem, attrs) {
        	if (attrs.templateUrl) {
        		return attrs.templateUrl;
        	} else if (attrs.draggable || attrs.sortable) {
                return 'lpanelDraggable.html';
            } else {
                return 'lpanel.html';
            }
        },
        require: '^multiSelect'
    };
});

angular.module(appCon.appName).directive('cpanel', function() {
    return {
        restrict: 'E',
        templateUrl: function(elem, attrs) {
            if (attrs.templateUrl) {
                return attrs.templateUrl;
            } else {
                return 'cpanel.html';
            }
        },
        require: '^multiSelect',
        link :function(scope, element, attributes){
        	scope.className = attributes.className ? ' '+attributes.className : '';
        }
    };
});

angular.module(appCon.appName).directive('rpanel', function() {
    return {
        restrict: 'E',
        templateUrl: function(elem, attrs) {
        	if (attrs.templateUrl) {
        		return attrs.templateUrl;
        	} else if (attrs.draggable || attrs.sortable) {
                return 'rpanelDraggable.html';
            } else {
                return 'rpanel.html';
            }
        },
        require: '^multiSelect'
    };
});

angular.module(appCon.appName).directive('cpanel2', function() {
    return {
        restrict: 'E',
        templateUrl: function(elem, attrs) {
            if (attrs.templateUrl) {
                return attrs.templateUrl;
            } else {
                return 'cpanel2.html';
            }
        },
        require: '^multiSelect',
        link :function(scope, element, attributes){
        	scope.className = attributes.className ? ' '+attributes.className : '';
        }
    };
});

angular.module(appCon.appName).directive('rpanel2', function() {
    return {
        restrict: 'E',
        templateUrl: function(elem, attrs) {
            if (attrs.templateUrl) {
                return attrs.templateUrl;
            } else {
                return 'rpanel2.html';
            }
        },
        require: '^multiSelect'
    };
});

angular.module(appCon.appName).controller('multiSelectController', ['$scope', '$attrs', '$parse', '$injector', '$element', '$rootScope','$translate', '$filter', function($scope, $attrs, $parse, $injector, $element, $rootScope, $translate, $filter) {
    /*Multiselect mode : 1-1, 1-2 events*/
	
	/**
	 * Data load from remote url or from local
	 */
	var lpanelDir = $element.find('lpanel'),
    	rpanelDir = $element.find('rpanel'),
		rpanel2Dir = $element.find('rpanel2');
    
	$scope.initialDataLoad = $attrs.initialDataLoad ? $attrs.initialDataLoad : false;
	
	//Populate the data if dataset is available.
	var assignDataToMultiSelect = function(){
		var data = [], filter, baseField,
        mode = $attrs.mode, response,
        parentFieldData = $parse($attrs.parentDataField)($scope),
        parentFieldOptionalData = $parse($attrs.parentDataFieldOptional)($scope);
		
		if($attrs.rootNode){
			response = $parse($attrs.rootNode)($scope);
		}else{
			response = $scope.data;
		}
		
		if (angular.isDefined(response)) {
		    if (angular.isArray(response)) {
		    	
		    	filter = (lpanelDir.attr('filter') && lpanelDir.attr('filter') !== '') ? lpanelDir.attr('filter').split('=') : undefined;
		    	baseField = (lpanelDir.attr('base-field') && lpanelDir.attr('base-field') !== '') ? lpanelDir.attr('base-field').split('=') : undefined;
		    	
		    	data = [];
		    	
		    	if(baseField || filter){
	            	angular.forEach(response, function(value) {
	            		if (angular.isDefined(baseField) &&  angular.isDefined(value[baseField[0]]) && angular.isDefined(baseField[1]) && value[baseField[0]].toString() === baseField[1].toString()) {	            			
	            			value.disabledData = true;
	                    } else {
	                    	value.disabledData = false;
	                    }
	            		if (angular.isDefined(filter) && angular.isDefined(value[filter[0]]) && angular.isDefined(filter[1]) && value[filter[0]].toString() === filter[1].toString()) {
	                        data.push(value);
	                    }
	                });
		    	}else{
		    		data = response;
		    	}
                $scope.lpanel.data = data;
                
                data = (parentFieldData && parentFieldData.length > 0) ? parentFieldData : [];
                filter = (rpanelDir.attr('filter') && rpanelDir.attr('filter') !== '') ? rpanelDir.attr('filter').split('=') : undefined;
		    	baseField = (rpanelDir.attr('base-field') && rpanelDir.attr('base-field') !== '') ? rpanelDir.attr('base-field').split('=') : undefined;
                
                angular.forEach(response, function(value) {
            		if (angular.isDefined(baseField) &&  angular.isDefined(value[baseField[0]]) && angular.isDefined(baseField[1]) && value[baseField[0]].toString() === baseField[1].toString() ) {            			
            			value.disabledData = true;
                    } else {
                    	value.disabledData = false;
                    }
            		if (angular.isDefined(filter) && angular.isDefined(value[filter[0]]) && angular.isDefined(filter[1]) && value[filter[0]].toString() === filter[1].toString()) {
            			if(angular.isUndefined(_.result(_.find(data, rpanelDir.attr('value'), value[rpanelDir.attr('value')]), rpanelDir.attr('value')))){ // if duplicate value is coming do not push the value
            				data.push(value);
            			}
                    }
                });
                
                if($scope.rpanel.draggable && $scope.rpanel.draggable === 'true'){
                	var rdata = _.sortByOrder(data, ['disabledData',$scope.rpanel.orderBy], ['desc','asc']);		
                	$scope.rpanel.data = rdata;
                }else{
                	 $scope.rpanel.data = data;
                }                	
               
                $scope.$evalAsync(function(){
                	setDataToParentDataField($scope.rpanel); 
                });
                
                if (mode === '1-2') {                	
                	data = (parentFieldOptionalData && parentFieldOptionalData.length > 0) ? parentFieldOptionalData : [];
                    filter = (rpanel2Dir.attr('filter') && rpanel2Dir.attr('filter') !== '') ? rpanel2Dir.attr('filter').split('=') : undefined;
    		    	baseField = (rpanel2Dir.attr('base-field') && rpanel2Dir.attr('base-field') !== '') ? rpanel2Dir.attr('base-field').split('=') : undefined;
                    
                    angular.forEach(response, function(value) {
	            		if (angular.isDefined(baseField) &&  angular.isDefined(value[baseField[0]]) && angular.isDefined(baseField[1]) && value[baseField[0]].toString() === baseField[1].toString() ) {
	            			value.disabledData = true;
	                    } else {
	                    	value.disabledData = false;
	                    }
	            		if (angular.isDefined(filter) && angular.isDefined(value[filter[0]]) && angular.isDefined(filter[1]) && value[filter[0]].toString() === filter[1].toString()) {
	                        data.push(value);
	                    }
	                });
                    $scope.rpanel2.data = data;                    
                    $scope.$evalAsync(function(){
                    	setDataToParentDataField($scope.rpanel2,'cpanel2'); 
                    });
                }
            }
        }
	};
	
	var loadDataToMultiSelect = function(){
		var service = $attrs.service,
			operation = $attrs.operation,
			params = $attrs.params;
		
		if(angular.isDefined(params) && angular.isString(params) && params !== ""){
			params = JSON.parse(params.replace(/'/g, '"'));
		}
		
		$injector.get(service)[operation](params).then(
			function(success){
				$scope.data = success.data;
				assignDataToMultiSelect();
			}, function(){
				$scope.data = {};
			}
		);
	};
	
	if($attrs.localData){
		$scope.$watch($attrs.localData, function(){
			$scope.data = $parse($attrs.localData)($scope);
			if(angular.isDefined($scope.data)){
				assignDataToMultiSelect();	
			}
		});
	}else{
		if(!$attrs.params){
			loadDataToMultiSelect();
		}
	}
	
	//Watch param attribute if has any changes happen, dataset can be fetch from local/remote url
	$attrs.$observe('params', function(){
		if($attrs.params && $scope.initialDataLoad){
			loadDataToMultiSelect();
		}else{
			$scope.initialDataLoad = true;
		}
	});
	
	$attrs.$observe('hasSearch', function(newValue, oldValue){
		$scope.hasSearch = newValue;
	});
	
	var setDataToParentDataField = function(rpanel,cpanel2){
		var returnType = $attrs.returnType,
		returnFields = $attrs.returnFields,
		returnFieldsObj = {},
		returnData = [],
		rpanelDataLength, i;
		if(rpanel.data.length){
			rpanelDataLength = rpanel.data.length;
			if(returnType === 'string'){
				for (i = rpanelDataLength - 1; i >= 0; i--) {
					returnData.push(rpanel.data[i][returnFields]);
	            }
			}else if (returnType === 'object'){
				returnFields = returnFields.split(',');
				for (i = rpanelDataLength - 1; i >= 0; i--) {
					returnFieldsObj = {};
					for(var j=0; j<returnFields.length;j++){
						returnFieldsObj[returnFields[j]] = rpanel.data[i][returnFields[j]];
					}
					returnData.push(returnFieldsObj);
	            }
			}else{
				returnData = rpanel.data;
			}
		}
		if(cpanel2 && cpanel2 == 'cpanel2'){
			if(angular.isDefined($attrs.parentDataFieldOptional)){
				$parse($attrs.parentDataFieldOptional).assign($scope,returnData.length>0 ? returnData : []);	
			}
		}else{
			if(angular.isDefined($attrs.parentDataField)){
				$parse($attrs.parentDataField).assign($scope,returnData.length>0 ? returnData : []);	
			}
		}
	};
	
	
	//set parent scope data
	$scope.btnRight = function(lpanel, rpanel,cpanel2) {
		var isMaxLimitValidate = maxLimitValidation(lpanel, rpanel, cpanel2, 'btnRight');
		if(isMaxLimitValidate){
			angular.forEach(lpanel.selectedData, function(value) {
	            for (var i = lpanel.data.length - 1; i >= 0; i--) {
	                if (lpanel.data[i][lpanel.value] == value) {
	                    rpanel.data.push(lpanel.data[i]);
	                    lpanel.data.splice(i, 1);
	                }
	            }
	        });
	      			  
	        $scope.$evalAsync(function(){
	        	setDataToParentDataField(rpanel,cpanel2);
	        });
	        
	        lpanel.selectedData = [];
		}		
    };

    $scope.btnLeft = function(lpanel, rpanel,cpanel2) {
    	angular.forEach(rpanel.selectedData, function(value) {
            for (var i = rpanel.data.length - 1; i >= 0; i--) {
                if (rpanel.data[i][rpanel.value] == value) {
                    lpanel.data.push(rpanel.data[i]);
                    rpanel.data.splice(i, 1);
                }
            }
        });
        $scope.$evalAsync(function(){
        	setDataToParentDataField(rpanel,cpanel2);
        });
        rpanel.selectedData = [];
    };

    $scope.btnAllRight = function(lpanel, rpanel,cpanel2) {
    	var isMaxLimitValidate = maxLimitValidation(lpanel, rpanel,cpanel2, 'btnAllRight');
		if(isMaxLimitValidate){
			if($scope.rpanel.sortable === 'true' && lpanel.data && lpanel.data.length > 1 && $scope.rpanel.orderBy){
				lpanel.data = _.sortByOrder(lpanel.data, $scope.lpanel.orderBy,'desc');
			}
			var originalLpanelData = lpanel.data;			
			if($scope.isExternalSearch && angular.isDefined($scope.hasSearch) && $scope.hasSearch.length>0){
				lpanel.data = $filter('filter')(lpanel.data, $scope.hasSearch);
			}
	    	var lpanelDisabledData;
	    	for (var i = lpanel.data.length - 1; i >= 0; i--) {
	    		lpanelDisabledData = angular.isUndefined(lpanel.data[i].disabledData) ? false : lpanel.data[i].disabledData;
	            if (lpanelDisabledData.toString() !== 'true') {
	                rpanel.data.push(lpanel.data[i]);
	                lpanel.data.splice(i, 1);
	            }
	        }
	    	if($scope.isExternalSearch && angular.isDefined($scope.hasSearch) && $scope.hasSearch.length>0){				
				lpanel.data = $filter('filter')(originalLpanelData, '!'+$scope.hasSearch);
			}
	        $scope.$evalAsync(function(){
	        	setDataToParentDataField(rpanel,cpanel2);
	        });
	        lpanel.selectedData = [];
		}
    };

    $scope.btnAllLeft = function(lpanel, rpanel,cpanel2) {
    	var rpanelDisabledData;
    	for (var i = rpanel.data.length - 1; i >= 0; i--) {
    		rpanelDisabledData = angular.isUndefined(rpanel.data[i].disabledData) ? false : rpanel.data[i].disabledData;
            if (rpanelDisabledData.toString() !== 'true') {
                lpanel.data.push(rpanel.data[i]);
                rpanel.data.splice(i, 1);
            }
        }
        $scope.$evalAsync(function(){
        	setDataToParentDataField(rpanel,cpanel2);
        });
        rpanel.selectedData = [];
    };
    
    var maxLimitValidation = function(lpanel, rpanel,cpanel2,btn) {
    	var maxLimit = $attrs.maxLimit ? Number($attrs.maxLimit) : '',
    		total = (btn === 'btnRight' ? lpanel.selectedData.length : lpanel.data.length) + rpanel.data.length;
		if(maxLimit && total > maxLimit){
			 var maxLimitErrorMessage = $attrs.maxLimitErrorMessage ? $translate.instant($attrs.maxLimitErrorMessage) : 'Maximum selection is reached.';
			 $rootScope.commonAlertDialogTitle = 'Alert';
			 $rootScope.commonAlertDialogContent = maxLimitErrorMessage;
			 $rootScope.commonAlertDialog();
			 return false;
		}else{
			return true;
		}
    };
    $scope.updateSelectedData = function(item, panel, event) {
    	/* var itemAvailable = false;
        if(angular.isDefined(item.disabledData) && item.disabledData.toString() === 'false'){
        	for (var i = 0; i < panel.selectedData.length; i++) {
                if (panel.selectedData[i] === item[panel.value]) {
                    itemAvailable = true;
                    $(event.target).removeClass('vision-multiselect-item-selected');
                    panel.selectedData.splice(i, 1);
                }
            }
            if (itemAvailable === false) {
                $(event.target).addClass('vision-multiselect-item-selected');
                panel.selectedData.push(item[panel.value]);
            }
        }*/
    	    	
		if((angular.isUndefined(item.disabledData)) || (angular.isDefined(item.disabledData) && item.disabledData.toString() === 'false')){
			var rpanelValue = $scope.rpanel.value,
			data = panel.data,					
			currentSelection = item[panel.value];
			if(event.shiftKey){	
				if(panel.selectedData.length >= 1){				
					var prevSelection = panel.selectedData[panel.selectedData.length - 1],
						currentSelectionIndex = _.findIndex(data, rpanelValue, currentSelection),
						prevSelectionIndex = _.findIndex(data, rpanelValue, prevSelection);
						
					if(currentSelectionIndex > prevSelectionIndex){
						currentSelectionIndex = [prevSelectionIndex, prevSelectionIndex = currentSelectionIndex][0]; // swapping the variables
					}
					for (var j = currentSelectionIndex; j <= prevSelectionIndex; j++) {
						if((angular.isUndefined(data[j].disabledData) || data[j].disabledData.toString() === 'false') && (jQuery.inArray( data[j][rpanelValue], panel.selectedData ) == -1)){
							$('#multiselectDraggable_'+data[j][rpanelValue]).addClass('vision-multiselect-item-selected');
							panel.selectedData.push(data[j][rpanelValue]);
						}
					}				
				}else{
					if(jQuery.inArray( item[panel.value], panel.selectedData ) == -1){
						panel.selectedData.push(item[panel.value]);
						$('#multiselectDraggable_'+item[panel.value]).addClass('vision-multiselect-item-selected');
					}
				}
			} else if(event.ctrlKey){
				var itemAvailable = false;				
				for (var i = 0; i < panel.selectedData.length; i++) {
					if (panel.selectedData[i] === item[panel.value]) {
						itemAvailable = true;
						$(event.target).removeClass('vision-multiselect-item-selected');
						panel.selectedData.splice(i, 1);
					}
				}
				if (itemAvailable === false) {
					$(event.target).addClass('vision-multiselect-item-selected');
					panel.selectedData.push(item[panel.value]);
				}
			}else{
				for (var i = 0; i < panel.selectedData.length; i++) {					
					$('#multiselectDraggable_'+panel.selectedData[i]).removeClass('vision-multiselect-item-selected');					
				}
				panel.selectedData = [];				
				$(event.target).addClass('vision-multiselect-item-selected');
				panel.selectedData.push(item[panel.value]);
				
			}
		}
                    
    };
    
    $scope.myValueFunction = function(item) {
    	if(item.disabledData){
    		return item.name;
    	}
    };
    
    $scope.myValueFunction1 = function(item) {
    	if(!item.disabledData){
    		return item.name;
    	}
    };
       
}]);

/**
 * Template definition 
 */
angular.module(appCon.appName).run(['$templateCache', function ($templateCache) {
	$templateCache.put('lpanel.html',
			'<div class="col-sm-5 vision-padding-0">'+
			'	<label for="{{lpanel.label}}">{{lpanel.label}}</label>'+
			'   <span ng-if="lpanel.tooltipText" uib-tooltip-html="lpanel.tooltipText" tooltip-class="vision-multiselect-tooltip" tooltip-placement="{{lpanel.tooltipPlacement}}"><i class="fa fa-question-circle"></i></span>'+
			'	<select tabindex="5000" ng-style="{\'width\': \'100%\'}" class="form-control {{lpanel.className}}" size="{{lpanel.size}}" id="{{lpanel.id}}" ng-model="lpanel.selectedData" name="{{lpanel.id}}" multiple="multiple">'+
			'		<option ng-repeat="item in filteredItems = (lpanel.data | filter:hasSearch | orderBy: lpanel.orderBy)" value="{{item[lpanel.value]}}">{{item[lpanel.text]}}</option>'+
			'		<option ng-if="filteredItems.length == 0 && isExternalSearch==true" value="">No records found</option>'+
			'	</select>'+
			'</div>'
		);
		
		$templateCache.put('lpanelDraggable.html',
			'<div class="col-sm-5 vision-padding-0">'+
			'	<label for="{{lpanel.label}}">{{lpanel.label}}</label>'+
			'   <span ng-if="lpanel.tooltipText" uib-tooltip-html="lpanel.tooltipText" tooltip-class="vision-multiselect-tooltip" tooltip-placement="{{lpanel.tooltipPlacement}}"><i class="fa fa-question-circle"></i></span>'+
			'	<div class="lpanelDraggable">'+
			'		<ul ng-model="lpanel.data" as-sortable="lpanel.lpanelSortableOptions" class="col-sm-12 vision-list-unstyled {{lpanel.className}}">'+
			'			<li as-sortable-item="" ng-repeat="item in lpanel.data">'+
			'				<div as-sortable-item-handle="" ng-click="updateSelectedData(item, lpanel, $event)">'+
			'					{{item[lpanel.text]}}'+
			'				</div>'+
			'			</li>'+
			'		</ul>'+
			'	</div>'+
			'</div>'
		);
		
		$templateCache.put('cpanel.html',
			'<div class="col-sm-2 vision-margin-top-30 {{className}}">'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&nbsp;&gt;&nbsp;&nbsp;" ng-disabled="lpanel.selectedData.length<=0 || (lpanel.selectedData.length>0 && filteredItems.length == 0)" ng-click="btnRight(lpanel,rpanel)" ></div>'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&nbsp;&lt;&nbsp;&nbsp;" ng-disabled="rpanel.selectedData.length<=0" ng-click="btnLeft(lpanel,rpanel)" ></div>'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&gt;&gt;&nbsp;" ng-disabled="filteredItems.length<=0" ng-click="btnAllRight(lpanel,rpanel)" ></div>'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&lt;&lt;&nbsp;" ng-disabled="rpanel.data.length<=0 || rpanel.data.length==(rpanel.data | filter: { disabledData : true }).length" ng-click="btnAllLeft(lpanel,rpanel)" ></div>'+
			'</div>'
		);
		
		$templateCache.put('cpanel2.html',
			'<div class="col-sm-2 vision-margin-top-30 {{className}}">'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&nbsp;&gt;&nbsp;&nbsp;" ng-disabled="lpanel.selectedData.length<=0 || (lpanel.selectedData.length>0 && filteredItems.length == 0)" ng-click="btnRight(lpanel,rpanel2,\'cpanel2\')" ></div>'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&nbsp;&lt;&nbsp;&nbsp;" ng-disabled="rpanel2.selectedData.length<=0" ng-click="btnLeft(lpanel,rpanel2,\'cpanel2\')" ></div>'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&gt;&gt;&nbsp;" ng-disabled="filteredItems.length<=0" ng-click="btnAllRight(lpanel,rpanel2,\'cpanel2\')" ></div>'+
			'	<div class="text-center"><input type="button" class="btn btnMultiselect btn-primary" value="&nbsp;&lt;&lt;&nbsp;" ng-disabled="rpanel2.data.length<=0 || rpanel2.data.length==(rpanel2.data | filter: { disabledData : true }).length" ng-click="btnAllLeft(lpanel,rpanel2,\'cpanel2\')" ></div>'+
			'</div>'
		);

		$templateCache.put('rpanel.html',
			'<div class="col-sm-5 vision-padding-0">'+
			'	<label for="{{rpanel.label}}">{{rpanel.label}}</label>'+
			'   <span ng-if="rpanel.tooltipText" uib-tooltip-html="rpanel.tooltipText" tooltip-class="vision-multiselect-tooltip" tooltip-placement="{{rpanel.tooltipPlacement}}"><i class="fa fa-question-circle"></i></span>'+
			'	<select tabindex="5005" ng-style="{\'width\': \'100%\'}" class="form-control {{rpanel.className}}" size="{{rpanel.size}}" id="{{rpanel.id}}" ng-model="rpanel.selectedData" name="{{rpanel.id}}" multiple="multiple">'+
			'		<option ng-class="{disableOption: item.disabledData==true}" ng-repeat="item in (rpanel.data | orderBy: rpanel.orderBy | sortBaseFieldWithOption:\'disabledData\')"  ng-disabled="{{item[\'disabledData\']==true}}" value="{{item[rpanel.value]}}">{{item[rpanel.text]}}</option>'+
			'	</select>'+
			'</div>'
		);
		
		$templateCache.put('rpanelDraggable.html',
			'<div class="col-sm-5 vision-padding-0">'+
			'	<label for="{{rpanel.label}}">{{rpanel.label}}</label>'+
			'   <span ng-if="rpanel.tooltipText" uib-tooltip-html="rpanel.tooltipText" tooltip-class="vision-multiselect-tooltip" tooltip-placement="{{rpanel.tooltipPlacement}}"><i class="fa fa-question-circle"></i></span>'+
			'	<div class="rpanelDraggable">'+
			'		<ul ng-model="rpanel.data" as-sortable="rpanel.rpanelSortableOptions" class="col-sm-12 vision-list-unstyled {{rpanel.className}}">'+
			'			<li as-sortable-item="" ng-repeat="item in rpanel.data">'+
			'				<div id="multiselectDraggable_{{item[rpanel.value]}}" as-sortable-item-handle="" ng-class="{disableOption: item.disabledData==true}" ng-click="updateSelectedData(item, rpanel, $event)">'+
			'					<span ng-if="rpanel.checkbox===\'true\'"><input type="checkbox" name="{{rpanel.id}}{{$index}}" ng-model="item[rpanel.checkboxModel]" ng-checked="item[rpanel.checkboxModel] == \'true\' || item[rpanel.checkboxModel] === true"></span>'+
			'					{{item[rpanel.text]}}'+
			'				</div>'+
			'			</li>'+
			'		</ul>'+
			'	</div>'+
			'</div>'
		);
		
		$templateCache.put('rpanel2.html',
			'<div class="col-sm-5 vision-padding-0">'+
			'	<label for="{{rpanel2.label}}">{{rpanel2.label}}</label>'+
			'   <span ng-if="rpanel2.tooltipText" uib-tooltip-html="rpanel2.tooltipText" tooltip-class="vision-multiselect-tooltip" tooltip-placement="{{rpanel2.tooltipPlacement}}"><i class="fa fa-question-circle"></i></span>'+
			'	<select tabindex="5005" ng-style="{\'width\': \'100%\'}" class="form-control {{rpanel2.className}}" size="{{rpanel2.size}}" id="{{rpanel2.id}}" ng-model="rpanel2.selectedData" name="{{rpanel2.id}}" multiple="multiple">'+
			'		<option ng-class="{disableOption: item.disabledData==true}" ng-repeat="item in (rpanel2.data | orderBy: rpanel2.orderBy | sortBaseFieldWithOption:\'disabledData\')" ng-disabled="{{item[\'disabledData\']==true}}"  value="{{item[rpanel2.value]}}">{{item[rpanel2.text]}}</option>'+
			'	</select>'+
			'</div>'
		);
}]);

(function($){
    $.fn.disableSelection = function() {
        return this
        .attr('unselectable', 'on')
        .css('user-select', 'none')
        .css('-moz-user-select', 'none')
        .css('-khtml-user-select', 'none')
        .css('-webkit-user-select', 'none')
        .on('selectstart', false)
        .on('contextmenu', false)
        .on('keydown', false)
        .on('mousedown', false);
    };
 
    $.fn.enableSelection = function() {
        return this
        .attr('unselectable', '')
        .css('user-select', '')
        .css('-moz-user-select', '')
        .css('-khtml-user-select', '')
        .css('-webkit-user-select', '')
        .off('selectstart', false)
        .off('contextmenu', false)
        .off('keydown', false)
        .off('mousedown', false);
    };
 
})(jQuery);