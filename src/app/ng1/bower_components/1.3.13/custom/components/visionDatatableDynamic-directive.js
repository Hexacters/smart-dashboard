(function() {
	'use strict';
	
    /**visionDataTable.
     *
     * <div ng-init="checkAll.checked=false; checkAll.itemField='id'"
					class="table-responsive clearfix vision-margin-10 vision-overlay-table tableContainer"
					id="searchEmployee" data-double-scroll-bar-horizontal
					id="employeeSearchGrid">
		<vision-data-table
			service="organizationServices"
			operation="searchEmployeeWithFilters" 
			root-node="data.successData.employeeDetails"
			search-type="searchRequest"
			has-external-search="{{$parent.search}}"
			min-length="3"
			params='{"param1":"value1","param2":"value2"}'
			total-records-node="data.successData.TotalRecords"
			type="server"
			initial-request='{"page":1,"sorting":{"firstName":"asc"}}'
			fixed-header="true"
			height="200"
			id="employeeList"
			>
			<table data-ng-table-dynamic="employeeList with cols" data-show-filter="true" class="table table-bordered table-striped">
			    <tr data-ng-repeat="user in $data">
			    	<td data-ng-repeat="col in $columns">
			    		<input ng-if="col.field==='checkbox'" type="checkbox" id="checkAll_{{user['id']}}" name="checkAll" ng-model="checkAll.itemsChecked[user['id']]" ng-click="checkboxHandling(checkAll.itemsChecked[user['id']],user)"/>
			    		<span ng-if="col.field!=='checkbox'">{{user[col.field] | dynamicTableRowDataFilter : col}}</span>
			    	</td>
			    </tr>
			</table>
			<div class="clearfix" data-ng-table-pagination="employeeList" data-template-url="'ng-table/pager.html'"></div>
		</vision-data-table>
	</div>
     */
    angular.module(appCon.appName).directive('visionDataTable', function() {
    	return {
            restrict: 'E',
            scope: true,
            controller: 'visionDataTableController'
        };
    });

    angular.module(appCon.appName).controller('visionDataTableController', ['$scope', '$filter', 'NgTableParams', '$injector', '$element', '$attrs', '$parse', '$rootScope', '$interpolate','$window','$timeout','$modal',  
        function($scope, $filter, NgTableParams, $injector, $element, $attrs, $parse, $rootScope, $interpolate, $window, $timeout, $modal) {
            var service = $attrs.service,
                operation = $attrs.operation,
                rootNode = $attrs.rootNode,
                totalRecordsNode = $attrs.totalRecordsNode,
                initialRequest = $attrs.initialRequest,
                additionalParams = $attrs.params,
                type = $attrs.type,
                param,
                results,
                clientDataLoaded = false,
                config = {},
                tableId = $attrs.id ? $attrs.id : 'tableParams',
                minLength = $attrs.minLength,
                hasExternalSearch = $attrs.hasExternalSearch,
                searchString,
                fixedHeader = ($attrs.fixedHeader && $attrs.fixedHeader === 'true') ? true : false,
                maxSelection = $attrs.maxSelection ? Number($attrs.maxSelection) : 100,
                advancedSelectTemplate = $attrs.advancedSelectTemplate ? $attrs.advancedSelectTemplate : '';
            $scope.renderTable = false;
            if (initialRequest !== undefined) {
                initialRequest = $interpolate(initialRequest)($scope);
                config = JSON.parse(initialRequest);
            }
            config = angular.extend({
                page: 1,
                total: 1,
                count: 10,
                sorting: {},
                filter: {},
                type: $attrs.type
            }, config);
            $scope.prevTotal = 0, $scope.prevParams;
            
            $scope[tableId] = new NgTableParams(config, {
            	groupBy: $attrs.groupBy,
                getData: function($defer, params) {
                	
                	if (additionalParams !== undefined) {
                    	additionalParams = $interpolate($attrs.params)($scope);
                    	additionalParams = JSON.parse(additionalParams);
                    }
                	
                	if($attrs.initialRequest){
	                	initialRequest = $interpolate($attrs.initialRequest)($scope);
	                	if (!angular.equals(initialRequest, $scope.prevInitialRequest)) {
	                		$scope[tableId].parameters(JSON.parse(initialRequest));
	                		if($scope.checkAll){
		                		$scope.checkAll.checked = false;
	                        	$scope.checkAll.itemsChecked = {};
	        	    			$scope.checkAll.itemsSelected = [];
	                		}
	                    }
	                	$scope.prevInitialRequest = initialRequest;
                	}
                	
                	param = populateSearchRequestParam($scope[tableId].parameters(), $attrs);
                    param = angular.extend(param, additionalParams);
                    
                    if (type === 'server') {
                    	if ($scope.prevTotal === params.total() 
                    			&& (!angular.equals(JSON.stringify($scope[tableId].parameters()), $scope.prevParams)
                    					|| !angular.equals(JSON.stringify(additionalParams), $scope.prevAdditionalParams)
                    			)){
                    		$scope.loading = true;
                            $rootScope.loading = true;
                            var requestFormatter = $attrs.requestFormatter; 
                            if(angular.isDefined(requestFormatter)){                	
                            	var requestFormatterFunc = $parse(requestFormatter)($scope);
                            	param = requestFormatterFunc(param, $scope);
                            }
                    		$injector.get(service)[operation](param).then(
	                            function(result) {
	                            	if (result.data.status === 'success') {
	                            		var responseFormatter = $attrs.responseFormatter; 
	                            		if(angular.isDefined(responseFormatter)){                	
	                                    	var responseFormatterFunc = $parse(responseFormatter)($scope);
	                                    	$scope.data = responseFormatterFunc(result.data);                	
	                                    }else {
	                                    	$scope.data = result.data;
	                                    }
	                            		if(angular.isDefined($scope.checkAll)){
	                            			$timeout(function(){
		    									$scope.handleParentCheckbox($parse(rootNode)($scope));
		    								}, 0);
	    								}
	                                    params.total($parse(totalRecordsNode)($scope));
	                                    $defer.resolve($parse(rootNode)($scope));
	                                    //delete $scope.data;
	                                } else {
	                                	if(typeof result.data === 'object'){
	                                		 params.total(0); // hide pagination if no results found
	 	                                    $defer.resolve(result.data);
	 	                                    if(angular.isDefined($scope.checkAll)){
	 		                                    $scope.checkAll.checked = false;
	 		                                	$scope.checkAll.itemsChecked = {};
	 		                	    			$scope.checkAll.itemsSelected = [];
	 	                                    }
	                                	}	                                   
	                                }
	                            	$scope.loading = false;
	                                $rootScope.loading = false;
	                            	$scope.prevTotal = params.total();	                            	
	                            	if(angular.isDefined($attrs.callback)){
	                    				var callbackFunc = $parse($attrs.callback)($scope);
	            	        			return callbackFunc(result.data);
	                    			}
	                            },
	                            function(error) {
	                            	$scope.loading = false;
	                                $rootScope.loading = false;
	                                $defer.resolve(error);
	                            }
	                        );
                    		if(angular.isDefined($scope.checkAll)){
								if(($scope.prevParamsPage == '1' && $scope[tableId].parameters().page === 1) || (JSON.stringify($scope[tableId].parameters().count) !==  $scope.prevParamsCount)){
                    				$scope.checkAll.checked = false;
                                	$scope.checkAll.itemsChecked = {};
                	    			$scope.checkAll.itemsSelected = [];	
								}							
								/*$timeout(function(){						
									if(angular.isDefined($scope.checkAll)){						
										var getTrueValue = 0;
										angular.forEach($scope[tableId].data, function(item) {						
											if (angular.isDefined(item[$scope.checkAll.itemField])) {
												if($scope.checkAll.itemsChecked[item[$scope.checkAll.itemField]] && $scope.checkAll.itemsChecked[item[$scope.checkAll.itemField]] === true){
													getTrueValue++;
												}
											}
										});
										if(getTrueValue && $scope[tableId].data.length === getTrueValue){
											$scope.checkAll.checked = true;
											}else{
											$scope.checkAll.checked=false;
										}
									}
								}, 1000);*/
								
                            }
                    		$scope.prevParamsPage= JSON.stringify($scope[tableId].parameters().page);
							$scope.prevParamsCount= JSON.stringify($scope[tableId].parameters().count);
                    		$scope.prevParams = JSON.stringify($scope[tableId].parameters());
                    		$scope.prevAdditionalParams = JSON.stringify(additionalParams);
                    		
                    		if(fixedHeader && $window.innerWidth > 992){
    	                        $timeout(function(){
    								var table = '',
    									height = $attrs.height ? Number($attrs.height) : 200;
    								if ( $.fn.dataTable.isDataTable(  $element.find('table') ) ) {
    									table = $($element.find('table')).DataTable();
    								}else {
    									table = $($element.find('table')).DataTable( {
    										"scrollY": height,
    										"scrollX": true,
    										"ordering": false,
											"bPaginate": false,
											"paging":   false,
											"info":false,
											"bFilter": false
    									} );
    									 $scope.renderTable = true;
    								} 
    							}, 1000);
                            }else{
                            	$scope.renderTable = true;
                            }
                    		
                    	}
                    } else {
                        if ($attrs.localData) {
                            results = $parse($attrs.localData)($scope);
							if(angular.isArray(results)){
	                            var filteredData = results; //params.filter() ? $filter('filter')(results, params.filter()) : results;
	                            var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : results;
	                            var dateFieldsArray = $attrs.dateSortFields ? $attrs.dateSortFields.split(',') : [];
	            				var columnName = (params.orderBy() && params.orderBy().length) ? params.orderBy()[0].slice(1) : '';
	            				if(params.orderBy() && params.orderBy().length && dateFieldsArray.length && dateFieldsArray.indexOf(columnName) >= 0){
	            					 orderedData= dateSortingOnClientGrid(orderedData,params,columnName);
	            				}  
	                            params.total(orderedData.length); // set total for recalc pagination
	                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            }else{
								params.total(0);
								$defer.resolve($scope.data);
                            }
							if(angular.isDefined($attrs.callback)){
                				var callbackFunc = $parse($attrs.callback)($scope);
        	        			return callbackFunc(results);
                			}
                            if(angular.isDefined($scope.checkAll)){
	            				$scope.checkAll.checked = false;
	                            $scope.checkAll.itemsChecked = {};
	            	    		$scope.checkAll.itemsSelected = [];
							}
                        } else if (!clientDataLoaded) {
                        	if (!angular.equals(JSON.stringify($scope[tableId].parameters()), $scope.prevParams)){
                        		$scope.loading = true;
                                $rootScope.loading = true;
                        		$injector.get(service)[operation](param).then(
	                                function(result) {
	                                	if (result.data.status === 'success') {
	                                		var responseFormatter = $attrs.responseFormatter; 
		                            		if(angular.isDefined(responseFormatter)){                	
		                                    	var responseFormatterFunc = $parse(responseFormatter)($scope);
		                                    	$scope.data = responseFormatterFunc(result.data);                	
		                                    }else {
		                                    	$scope.data = result.data;
		                                    }
	                                        //$scope.data = result.data;
	                                        results = $parse(rootNode)($scope);
	                                        var filteredData = results; //params.filter() ? $filter('filter')(results, params.filter()) : results;
	    	                                var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : results;
	    	                                params.total(orderedData.length); // set total for recalc pagination
	    	                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	    	                                if(angular.isDefined($scope.checkAll)){
                            					$scope.checkAll.checked = false;
				                            	$scope.checkAll.itemsChecked = {};
				            	    			$scope.checkAll.itemsSelected = [];	
				                            }
	                                    } else {
	                                    	if(typeof result.data === 'object'){
		                                    	$defer.resolve(result.data);
		                                    	if(angular.isDefined($scope.checkAll)){
	                            					$scope.checkAll.checked = false;
					                            	$scope.checkAll.itemsChecked = {};
					            	    			$scope.checkAll.itemsSelected = [];	
					                            }
	                                    	}
	                                    }
	                                	clientDataLoaded = true;
	                                	$scope.loading = false;
	                                    $rootScope.loading = false;
	                                }
	                            );
	                        	$scope.prevParams = JSON.stringify($scope[tableId].parameters());
                        	}
                        }
                        if(clientDataLoaded === true){
                        	var filteredData = results; //params.filter() ? $filter('filter')(results, params.filter()) : results;
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : results;
                            
                            var dateFieldsArray = $attrs.dateSortFields ? $attrs.dateSortFields.split(',') : [];
							var columnName = (params.orderBy() && params.orderBy().length) ? params.orderBy()[0].slice(1) : '';
							if(params.orderBy() && params.orderBy().length && dateFieldsArray.length && dateFieldsArray.indexOf(columnName) >= 0){
            					 orderedData= dateSortingOnClientGrid(orderedData,params,columnName);
							}
							
                            params.total(orderedData.length); // set total for recalc pagination
                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            if(angular.isDefined($attrs.callback)){
                				var callbackFunc = $parse($attrs.callback)($scope);
        	        			return callbackFunc(results);
                			}
                            if(angular.isDefined($scope.checkAll)){
            					$scope.checkAll.checked = false;
                            	$scope.checkAll.itemsChecked = {};
            	    			$scope.checkAll.itemsSelected = [];	
                            }
                        }
                                                
                    }
                }
            });
            
            if(advancedSelectTemplate){
	            $scope.advancedSelectMultiselect = function($column,params){
	            	var columnData = _.cloneDeep($column.data); 
	            	$scope.advancedMultiselectData = columnData; // this data for using multiselect component
	            	$scope.advancedMultiselectDataSelectedData = []; // this model should be same in the template selected data in multiselect           	
	            	$scope.selectedColumnName = $column.field;
	            	$scope.selectedColumnTitle = $column.title();
	            	
	            	var advancedMultiselectSelectedFilter =  _.cloneDeep(params.filter()[$column.field]),            	
	            		advancedMultiselectDataSelectedData=[];
	            	if(advancedMultiselectSelectedFilter){
		            	angular.forEach(columnData, function(value, key) {
							//if(advancedMultiselectSelectedFilter && advancedMultiselectSelectedFilter.length > 0){
								angular.forEach(advancedMultiselectSelectedFilter, function(svalue, skey) {								
									if(value.id === svalue.id){
										advancedMultiselectDataSelectedData.push(value);
									}
								});
							//}
						});
	            	}else{
	            		
	            	}
	            	$scope.advancedMultiselectDataSelectedData = advancedMultiselectDataSelectedData;
	        		$scope.advancedSelectMultiselectDialog  = $modal.open({
	        			templateUrl: advancedSelectTemplate,
	        			backdrop: 'static',
	        			keyboard: false,
	        			windowClass:'commonDialogW50',
	        			scope:$scope,
	        			controller:function(){}
	        		});
	        	};
            }
        	
        	 $scope.advancedSelectMultiselectOk = function(multiselectData){
        		var submitData = [];
	    		if(multiselectData && multiselectData.length > 0){
	    			angular.forEach(multiselectData, function(value, key) {
	    				var empObj={};
	    				empObj.id = value.id;
	    				submitData.push(empObj);        				
	    			});
	    		}
	    		$scope[tableId].parameters().filter[$scope.selectedColumnName] = submitData;
	            $scope.$$childHead.doMultiSelectFilter();
	    		$scope.advancedSelectMultiselectDialog.close();
	    		$scope.selectedColumnName = '';
             	$scope.selectedColumnTitle = '';
         	};
         	
         	$scope.advancedSelectMultiselectCancel = function(){         		
         		$scope.advancedSelectMultiselectDialog.close();
         		$scope.selectedColumnName = '';
            	$scope.selectedColumnTitle = '';
        	}; 
        	           
            var dateSortingOnClientGrid= function(orderedData,params,columnName){				
				var ascOrDesc = params.orderBy()[0].charAt(0);															
				if(ascOrDesc === '+'){
					orderedData.sort(function (a, b) {									
						var dateA = new Date(_.get(a, columnName)), dateB = new Date(_.get(b, columnName));
						return dateA - dateB; //sort by date descending
					});									
				} else if(ascOrDesc === '-') {										
					orderedData.sort(function (a, b) {
						var dateA = new Date(_.get(a, columnName)), dateB = new Date(_.get(b, columnName));
						return dateB - dateA; //sort by date descending
					});								
				}						
				return orderedData;
			};

            /**Refresh data table*/
            $scope.refreshTable = function() {
            	clientDataLoaded = false;
            	$scope.prevParams = {};
                $scope[tableId].parameters().page = 1;
                $scope[tableId].reload();
            };

            /**Clear filter*/
            $scope.clearFilter = function() {
                $scope[tableId].parameters().filter = {};
                $scope[tableId].parameters().page = 1;
                $scope[tableId].reload();
            };

            /**Clear sorting*/
            $scope.clearSorting = function() {
                $scope[tableId].parameters().sorting = {};
                $scope[tableId].parameters().page = 1;
                $scope[tableId].reload();
            };
            
            /**Clear Filter with sorting Params*/
            $scope.clearFilterWithSortingParams = function(sortingParam, filterParam) {
                $scope[tableId].parameters().filter = {};
				$scope[tableId].sorting(sortingParam);
				$scope[tableId].filter(filterParam);
                $scope[tableId].parameters().page = 1;
                $scope[tableId].reload();
            };
            
            /**Search table*/
            $scope.searchTable = function(externalSearchParams) {
                clientDataLoaded = false;
                $scope.prevParams = {};
                if (externalSearchParams) {
                    if (angular.isDefined(externalSearchParams) && angular.isString(externalSearchParams)) {
                        externalSearchParams = JSON.parse(externalSearchParams);
                    }
                    angular.extend($scope[tableId].parameters().filter, externalSearchParams);
                }
                $scope[tableId].parameters().page = 1;
                $scope[tableId].reload();
            };

            $scope.autoCompleteClear = function(model, value){
            	searchString = $interpolate($attrs.hasExternalSearch)($scope);
            	if (angular.isDefined(searchString) && angular.isString(searchString)) {
                    searchString = JSON.parse(searchString);
                }
                /**getting value from json object*/
                angular.forEach(searchString, function(val, key){
                	if (angular.isDefined(value) && value===''){
                		$parse(model).assign($scope,'');
                		searchString[key] = '';
                	}
                	searchStringLength = val.length;
                });
                if (searchStringLength > minLength) {
                	angular.extend($scope[tableId].parameters().filter, searchString);
                	$scope[tableId].reload();
                }else if (value === ''){
                	angular.extend($scope[tableId].parameters().filter, searchString);
                	$scope[tableId].reload();
                }
            };
            
            if (hasExternalSearch) {
                $scope.hasExternalSearch = hasExternalSearch;
                var searchStringLength = 0;
                $attrs.$observe('hasExternalSearch', function() {
                	$scope.autoCompleteClear();
                }, true);
            }
            
            /**Watch data*/
            $scope.$watch('data', function() {
                if (typeof($scope.data) !== 'undefined') {
                    $scope[tableId].reload();
                }
            });
            
            $attrs.$observe('initialRequest', function(newParams, oldParams) {
            	if (!angular.equals(newParams, oldParams)){
            		$scope[tableId].reload();	
            	}
            }, true);
            
            /** 
             * watch for check all checkbox
             */
			$scope.parentCKbox = function(){				
				if(angular.isDefined($scope.checkAll)){
					var value = $scope.checkAll.checked;
	    			if(value === true){
						var itemCheckedLength = getCheckedIds($scope.checkAll.itemsChecked).length;						
						var currentPageData = $scope[tableId].data.length;
						angular.forEach($scope[tableId].data, function(item) {						
							if (angular.isDefined(item[$scope.checkAll.itemField]) && $('#checkAll_'+item[$scope.checkAll.itemField]).prop('disabled') === false) {
								if($scope.checkAll.itemsChecked[item[$scope.checkAll.itemField]] && $scope.checkAll.itemsChecked[item[$scope.checkAll.itemField]] === true){
									currentPageData--;
								}
							}
						});
						var totRecords = itemCheckedLength + currentPageData;
						
						if(totRecords <= maxSelection){							
							angular.forEach($scope[tableId].data, function(item) {
								if (angular.isDefined(item[$scope.checkAll.itemField]) && $('#checkAll_'+item[$scope.checkAll.itemField]).prop('disabled') === false) {
									$scope.checkAll.itemsChecked[item[$scope.checkAll.itemField]] = true;								
									var isExistFlag= isItemExistOnSelectedList($scope.checkAll.itemsSelected, item[$scope.checkAll.itemField]);									
									if(!isExistFlag){
										$scope.checkAll.itemsSelected.push(item);
									}
								}
							});	
						}else{							
							$scope.checkAll.checked = false;
							$rootScope.commonAlertDialogTitle = 'Alert';
							$rootScope.commonAlertDialogContent = 'You can select a maximum of '+maxSelection+' records at a time.';
							$rootScope.commonAlertDialog();							
						}
					} else{
							angular.forEach($scope[tableId].data, function(item) {
	    					if (angular.isDefined(item[$scope.checkAll.itemField]) && $('#checkAll_'+item[$scope.checkAll.itemField]).prop('disabled') === false) {
	        		            $scope.checkAll.itemsChecked[item[$scope.checkAll.itemField]] = false;
								var allSelectedItems = $scope.checkAll.itemsSelected;							
								allSelectedItems = _.filter(allSelectedItems, function(n) {								
									return n[$scope.checkAll.itemField] !== item[$scope.checkAll.itemField];
								});
								$scope.checkAll.itemsSelected = allSelectedItems;
	        		        }
	        		    });	
					}
    			}
			};
			
			var isItemExistOnSelectedList =  function(itemsSelectedObj, itemId){
				var isExistFlag= false;
				$.each( itemsSelectedObj, function( key, value ) {
					if(value.id === itemId){
						isExistFlag= true;
					}
				});
				return isExistFlag;
			};
			
			var getCheckedIds = function(myObj){
				var objKeys = [];
				$.each( myObj, function( key, value ) {
					if(value === true){
						objKeys.push( key );
					}
				});
				return objKeys;
			};
			
    		// Unchecked the parent if we uncheck the checkbox in table
			$scope.checkboxHandling = function(value,obj) {				
				if(value === false){
					$scope.checkAll.checked = false;
					var allSelectedItems = $scope.checkAll.itemsSelected;
					allSelectedItems = _.filter(allSelectedItems, function(n) {
						return n[$scope.checkAll.itemField] !== obj[$scope.checkAll.itemField];
					});
					$scope.checkAll.itemsSelected = allSelectedItems;
				}else{
					var itemCheckedLength = getCheckedIds($scope.checkAll.itemsChecked).length;
					if(itemCheckedLength <= maxSelection){
						$scope.checkAll.itemsSelected.push(obj);
						$scope.handleParentCheckbox();
					}else{
						$scope.checkAll.itemsChecked[obj[$scope.checkAll.itemField]] =false;
						$rootScope.commonAlertDialogTitle = 'Alert';
						$rootScope.commonAlertDialogContent = 'You can select a maximum of '+maxSelection+' records at a time.';
						$rootScope.commonAlertDialog();
						return false;	
					}
				}
            };
			//handle parent check
            $scope.handleParentCheckbox = function(tableData){
				var getTrueValue = 0;
				var getDisabledValue=0;
				if (angular.isUndefined(tableData)) {
					tableData = $scope[tableId].data;
				}
				angular.forEach(tableData, function(item) {						
					if (angular.isDefined(item[$scope.checkAll.itemField])) {
						if($scope.checkAll.itemsChecked[item[$scope.checkAll.itemField]]){
							getTrueValue++;
						}
					}
					if($('#checkAll_'+item[$scope.checkAll.itemField]).prop('disabled') === true) {
						getDisabledValue++;
					}
				});
				var TotalRecordAfterDisable = $scope[tableId].data.length - getDisabledValue;				
				if(getTrueValue && TotalRecordAfterDisable === getTrueValue){
					$scope.checkAll.checked = true;
				}else{
					$scope.checkAll.checked = false;
				}
			}
    		
        }
    ]);

    /** Data table export - Component 
     * <div class="clearfix" 
     *    vision-data-table-export="employeeList" 
     *    service="organizationServices" 
     *    operation="searchEmployeeWithFilters"
     *    params='{"param1":"value1","param2":"value2"}'
     *    search-type="searchRequest" 
     *    type="server"
     *    export-type="csv,xls,txt" 
     *    template-url="export.html">
     *  </div>
     */
    angular.module(appCon.appName).directive('visionDataTableExport', ['$injector','$http','$interpolate','$parse','$location',
        function($injector, $http, $interpolate, $parse, $location) {
            return {
                restrict: 'A',
                scope: {
                    params: '=?visionDataTableExport',
                    exportType: '@'
                },
                templateUrl: function(elem,attrs) {
        			return attrs.templateUrl || 'export.html'
        		},
                replace: false,

                link: function(scope, element, attributes) {
                    if (angular.isUndefined(scope.exportType)) {
                        return;
                    }
                    scope.types = scope.exportType.split(',');
                    
                    scope.exportFile = function(exportType) {
                    	var additionalParams = attributes.params;
                    	
                    	if (additionalParams !== undefined) {
                        	additionalParams = $interpolate(additionalParams)(scope);
                        	additionalParams = JSON.parse(additionalParams.replace(/'/g, '"'));
                        }
                    	
                        var param = angular.extend({}, populateSearchRequestParam(scope.params.parameters(), attributes));
                        param.exportType = exportType.type;
                        
                        param = angular.extend(param, additionalParams);
                        if(angular.isDefined(attributes.type) && attributes.type !== 'client'){
	                        if(attributes.searchType === 'searchRequestWithPagination'){
	                        	 param.searchRequest.results = scope.params.total();
	                        	 param.searchRequest.startIndex = 0;
	                        } else{
	                        	 param.results = scope.params.total();
	                        	 param.startIndex = 0;
	                        }
                        }
                     
						if(angular.isDefined(attributes.requestFormatter)){
							var requestFormatter = attributes.requestFormatter;
							var requestFormatterFunc = $parse(requestFormatter)(scope);
							param = requestFormatterFunc(param, scope);
						}
						
						if(typeof(param) !== 'boolean'){
							var httpRequest = $injector.get(attributes.service)[attributes.operation](param),
							exporturl = '';
							
							if(httpRequest.method.toLowerCase() === 'post' && !appCon.isIE(9) && $location.absUrl().indexOf(appCon.globalCon.extAppName) >= 0){
								exporturl = $location.absUrl().split(appCon.globalCon.extAppName)[0] + '/';
							}							
	                        $.fileDownload(exporturl + httpRequest.url, {	                        
	                        	httpMethod : httpRequest.method,
	                        	data : httpRequest.data
	                        });	
						}
                    }
                }
            };
        }
    ]);
})();

/**
 * Template definition 
 */
angular.module(appCon.appName).run(['$templateCache', function ($templateCache) {
	$templateCache.put('export.html',
			'<span class="dataTableExport pull-left">' +
            '<span class="col-md-0" >{{\'common.export\' | translate}}</span>' +
            '<span class="col-md-0 pointer dataTableExportButtons" ng-repeat = "type in types" ng-click="exportFile({type: type});">' +
            '<i class="fa fa-file-code-o fa-2" ng-if="type == \'xml\'"/>' +
            '<i class="fa fa-file-excel-o fa-2" ng-if="type == \'xls\'"/>' +
            '<i class="fa fa-file-pdf-o fa-2" ng-if="type == \'pdf\'"/>' +
            '<i class="fa fa-file-text-o fa-2" ng-if="type == \'csv\'"/>' +
            '<i class="fa fa-file-word-o fa-2" ng-if="type == \'rtf\'"/>' +
            '<i class="fa fa-file-word-o fa-2" ng-if="type == \'doc\'"/>' +
            '<i class="fa fa-file-text fa-2" ng-if="type == \'txt\'"/>' +
            '&nbsp;{{type}}</span>' +
            '</div>'
	  );
	}
]);