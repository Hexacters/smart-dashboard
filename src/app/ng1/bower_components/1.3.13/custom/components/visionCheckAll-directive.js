/**
<div class="col-sm-8 checkbox">
	<label class="marginR4" >
     <input type="checkbox" ng-controller="visionCheckAllController" ng-model="checkall" ng-checked="checkallmodel[$index]" name="checkall" ng-click="checkAllObject('department.titleVO','id','visionCheck[$index]')" />           
     All 
    </label>				
	<label class="marginR4" ng-repeat="deptTitle in department.titleVO | orderBy:'name'">
		<input type="checkbox" check-all-model="checkallmodel" check-all-model-index="$parent.$index" checklist-object="department.titleVO" vision-check-all="visionCheck[$parent.$index]" form-field="data.formfield[$parent.$index]" return-type="string" return-fields="id,isSelected" checklist-value="deptTitle.id">
		{{deptTitle.name}} 
	</label>
</div>
 */
'use strict';
angular.module(appCon.appName).directive('visionCheckAll', ['$parse', '$compile', function($parse, $compile) {
  // contains
  function contains(arr, item, comparator) {
    if (angular.isArray(arr)) {
      for (var i = arr.length; i--;) {
        if (comparator(arr[i], item)) {
          return true;
        }
      }
    }
    return false;
  }

  // add
  function add(arr, item, comparator) {
    arr = angular.isArray(arr) ? arr : [];
      if(!contains(arr, item, comparator)) {
          arr.push(item);
      }
    return arr;
  }  

  // remove
  function remove(arr, item, comparator) {
    if (angular.isArray(arr)) {
      for (var i = arr.length; i--;) {
        if (comparator(arr[i], item)) {
          arr.splice(i, 1);
          break;
        }
      }
    }
    return arr;
  }
  var index = 0;
  // http://stackoverflow.com/a/19228302/1458162
  function postLinkFn(scope, elem, attrs) {	  
    var visionCheckAll = attrs.visionCheckAll;
    attrs.$set("visionCheckAll", null);
    // compile with `ng-model` pointing to `checked`
    $compile(elem)(scope);
    attrs.$set("visionCheckAll", visionCheckAll);

    // getter / setter for original model
    var getter = $parse(visionCheckAll);
    var setter = getter.assign;
    var checklistChange = $parse(attrs.checklistChange);

    // value added to list
    var value = attrs.checklistValue ? $parse(attrs.checklistValue)(scope.$parent) : attrs.value;
    
    
    scope.checkAllModel = attrs.checkAllModel ? $parse(attrs.checkAllModel)(scope.$parent) : [];

    var comparator = angular.equals;

    if (attrs.hasOwnProperty('checklistComparator')){
      if (attrs.checklistComparator[0] == '.') {
        var comparatorExpression = attrs.checklistComparator.substring(1);
        comparator = function (a, b) {
          return a[comparatorExpression] === b[comparatorExpression];
        }
        
      } else {
        comparator = $parse(attrs.checklistComparator)(scope.$parent);
      }
    }

    // watch UI checked change
    scope.$watch(attrs.ngModel, function(newValue, oldValue) {
      if (newValue === oldValue) { 
        return;
      } 
      var current = getter(scope.$parent);
      if (angular.isFunction(setter)) {
        if (newValue === true) {
          setter(scope.$parent, add(current, value, comparator));
        } else {
          setter(scope.$parent, remove(current, value, comparator));
        }
        
        //Maintain the indexes of multiple check all exist in a signle page
        scope.checkAllModelIndex = (scope.checkAllModelIndex) ? scope.checkAllModelIndex : 0;
        //Check/Uncheck the check all checkbox
        if(angular.isDefined(scope.checklistObject) && angular.isDefined(scope.checkAllModel)){
        	if(scope.checklistObject.length == getter(scope.$parent).length){
        		scope.checkAllModel[scope.checkAllModelIndex] = true;
            }
            else{
            	scope.checkAllModel[scope.checkAllModelIndex] = false;
            }
        }
        
        //formatting the return data        
        var returnData = [];
        
        if(attrs.returnType =='string'){
        	$parse(attrs.formField).assign(scope.$parent,angular.copy(getter(scope.$parent).toString()));
        }else if (attrs.returnType == 'object'){
        	var returnFields = attrs.returnFields.split(','), 
			returnFieldsObj = {},
        	checklistLength =  getter(scope.$parent).length, 
        	i;
			for (i = checklistLength - 1; i >= 0; i--) {
				returnFieldsObj = {};
				for(var j=0; j<returnFields.length;j++){
					returnFieldsObj[returnFields[j]] = getter(scope.$parent)[i][returnFields[j]];
				}
				returnData.push(returnFieldsObj);
            }
			$parse(attrs.formField).assign(scope.$parent,returnData);
		}else{
			console.log('c')
			$parse(attrs.formField).assign(scope.$parent,angular.copy(getter(scope.$parent)));
		}
        	
      }

      if (checklistChange) {
        checklistChange(scope);
      }
    });
    
    // declare one function to be used for both $watch functions
    function setChecked(newArr, oldArr) {
        scope[attrs.ngModel] = contains(newArr, value, comparator);
    }

    // watch original model change
    // use the faster $watchCollection method if it's available
    if (angular.isFunction(scope.$parent.$watchCollection)) {
        scope.$parent.$watchCollection(visionCheckAll, setChecked);
    } else {
        scope.$parent.$watch(visionCheckAll, setChecked, true);
    }
  }

  return {
    restrict: 'A',
    priority: 1000,
    terminal: true,
    scope: {
    	checkAllModelIndex: '=?',
    	checklistObject: '=?'
    },
    compile: function(tElement, tAttrs) {
      if ((tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox')
          && (tElement[0].tagName !== 'MD-CHECKBOX')
          && (!tAttrs.btnCheckbox)) {
        throw 'checklist-model should be applied to `input[type="checkbox"]` or `md-checkbox`.';
      }

      if (!tAttrs.checklistValue && !tAttrs.value) {
        throw 'You should provide `value` or `checklist-value`.';
      }

      // by default ngModel is 'checked', so we set it if not specified
      if (!tAttrs.ngModel) {
        // local scope var storing individual checkbox model
        tAttrs.$set("ngModel", "checked");
      }

      return postLinkFn;
    }
  };
}]);
angular.module(appCon.appName).controller('visionCheckAllController', [ '$scope', '$parse', function($scope, $parse){
	$scope.checkAll = function(checkAllObject,checkedObject) {
	  	if($scope.checkall){
	  		$parse(checkedObject).assign($scope, angular.copy($parse(checkAllObject)($scope)));
	  	}else{
	  		$parse(checkedObject).assign($scope, []);
	  	} 		
	};	
	$scope.checkAllObject = function(checkAllObject,fieldName,checkedObject){
		if($scope.checkall){			
			var parsecheckAllObject = [];
			angular.forEach($parse(checkAllObject)($scope),function(value,key){
				parsecheckAllObject.push(_.get(value,fieldName));
			});
			$parse(checkedObject).assign($scope, parsecheckAllObject);
		}else{
			$parse(checkedObject).assign($scope, []);
		}
	};
}]);
