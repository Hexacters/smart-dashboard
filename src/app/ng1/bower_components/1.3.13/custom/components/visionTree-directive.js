'use strict';
/*
 * 
<vision-tree 
	root-label="Root Name" 
	parent-list-node="folderList" 
	child-list-node="reportList" 
	parent-list-name="folder" 
	child-list-name="report" 
	service="organizationServices" 
	operation="getTreeNodes"
	param='{"paramId" : "20"}'
	child-template="tree_item_renderer.html"
	> 
</vision-tree>

<script type="text/ng-template"  id="tree_item_renderer.html">
    <i ng-show="!d.$expand && d.hasChild" class="fa fa-plus-square" ng-click="d.$expand = !d.$expand; loadData(d.id,{id:d.id});"></i>	
    <i ng-show="d.$expand && d.hasChild" class="fa fa-minus-square" ng-click="d.$expand = !d.$expand"></i>
    <span ng-show="!d.hasChild" style="margin-left:16px"></span>
    {{d.label}}
    <ul>
        <li style="list-style:none;"  ng-repeat="d in getChildren(d.id)" ng-include="'tree_item_renderer.html'"></li>
    </ul>
</script>
 *
 */
angular.module(appCon.appName).directive('visionTree', function() {	
	return {
        restrict : 'EA',
        link : function(scope, elem, attr){
        	scope.childTemplate = attr.childTemplate;
        },
        replace: true,
        controller : "visionTreeController",
        template :'<ul class="tree-container"><li style="margin: 5px; list-style: none;" ng-repeat="d in getChildren()" ng-include="childTemplate"></li></ul>'
	};
});

angular.module(appCon.appName).controller('visionTreeController', ['$injector', '$scope', '$rootScope','$attrs', function($injector, $scope, $rootScope, $attrs) {
	var parentListRootNode = $attrs.parentListNode,
	parentListName = $attrs.parentListName,
	childListRootNode = $attrs.childListNode,
	childListName = $attrs.childListName,
	serviceName = $attrs.service,
	operationName = $attrs.operation,
	rootLabel = $attrs.rootLabel ? $attrs.rootLabel : 'root',
	paramAttr = $attrs.param ? JSON.parse($attrs.param) : {};
	
	$scope.initialTreeLoad = true;
	$scope.treeLoading = false;
	$scope.scopeTreeData = [];
	
	$scope.hasChildren = function(id) {
		if(!id) {
			return (_($scope.scopeTreeData).where({parentId: $scope.scopeTreeData[0].id}).value().length !== 0);
		}	    
		return (_($scope.scopeTreeData).where({parentId: id}).value().length !== 0);
	};
  
	$scope.loadData = function(id,param){
		id = id || '0';	
		param = param || {};
		angular.extend(param, paramAttr);		
		var treeData = [],resultData=[], type;
		if(!$scope.hasChildren(id)){
			$scope.treeLoading = true;
			$injector.get(serviceName)[operationName](param).then(function(result) {				
				if (result.data.status === 'success') {
					if(result.data.successData[parentListRootNode]){
						type = 'parent';
						resultData = result.data.successData[parentListRootNode][parentListName];						
					}else if(result.data.successData[childListRootNode]){
						type = 'child';
						resultData = result.data.successData[childListRootNode][childListName];	        		 
					}
					
					treeData = $scope.prepareJsonForTree(resultData,type,id);
					$scope.scopeTreeData = angular.extend([], treeData,$scope.scopeTreeData);
					
				} else {
		    	  
				}
				$scope.treeLoading = false;
			});
		}
	};
  
  $scope.loadData();
  
  $scope.prepareJsonForTree = function(resultData,type,id){
	  var expand,hasChild,finalTreeData=[];
	  if(type == 'parent'){
		  expand = false;
		  hasChild = true;
	  }else{
		  expand = true;  // Need to check this at real time.
		  hasChild = false;
	  }
	  
	 finalTreeData = resultData.map(function(name) {
		  	name.id = new Date().getTime();
		  	name.parentId = id;
		  	name.$expand = expand;
		  	name.hasChild = hasChild;
			return name;
	  });
	  
	  finalTreeData.sort(function(a, b){
		  return Number(a.order)-Number(b.order);
	  });
	  
	  if($scope.initialTreeLoad){
		  finalTreeData.unshift({id: '0', label: rootLabel, parentId: 'null', $expand: true, hasChild:true});
	  }
	  $scope.initialTreeLoad = false;
	  return finalTreeData;
  	};
  	
  	$scope.$watchCollection('scopeTreeData', function(newx, oldx) {
		if ($scope.scopeTreeData !== 'undefined' && $scope.scopeTreeData.length > 0) {
			$scope.getChildren = function(parentId) {
				if(!parentId) {
					return [$scope.scopeTreeData[0]];
				}
				if(!_($scope.scopeTreeData).where({id: parentId}).value()[0]['$expand']) {
					return [];
				}
				return _($scope.scopeTreeData).where({parentId: parentId}).value();
			 };			
		}
  	});
}]);