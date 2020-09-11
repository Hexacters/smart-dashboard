(function() {
	'use strict';
	
    /**visionDataTable.
     *
     * <vision-data-table
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
			id="tableId"
		>
		
		<div class="clearfix vm-margin-10">
			<div class="input-group pull-left col-sm-3">
				<input type="text" class="form-control" placeholder="Search" ng-model="search.query" id="search_query">
	            <div class="input-group-btn">
	                <button class="btn" type="button" ng-click="searchTable(search)"><i class="fa fa-search"></i></button>
	            </div>
	        </div>
			<span class="pull-right">
			 	<button tooltip="Clear Filter" tooltip-placement="bottom" class="btn" type="button" ng-click="clearFilter()"><img src="bower_components/images/clear-filters-16.png"/></button>
				<button tooltip="Clear Sorting" tooltip-placement="bottom" class="btn" type="button" ng-click="clearSorting()"><i class="fa fa-sort"></i></button>
				<button tooltip="Refresh" tooltip-placement="bottom" class="btn" type="button" ng-click="refreshTable()"><i class="fa fa-refresh"></i></button>
			</span>
		</div>
		
     */
    angular.module(appCon.appName).directive('visionDataTable', function() {
    	return {
            restrict: 'E',
            scope: true,
            controller: 'visionDataTableController'
        };
    });

    angular.module(appCon.appName).controller('visionDataTableController', ['$scope', '$filter', 'ngTableParams', '$injector', '$element', '$attrs', '$parse', '$rootScope', '$interpolate','$window','$timeout',  
        function($scope, $filter, ngTableParams, $injector, $element, $attrs, $parse, $rootScope, $interpolate, $window, $timeout) {
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
                maxSelection = $attrs.maxSelection ? Number($attrs.maxSelection) : 100;
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
				type: $attrs.type,
				dateFilterReadOnly: $attrs.dateFilterReadOnly
            }, config);

            $scope.prevTotal = 0, $scope.prevParams;
            
            $scope[tableId] = new ngTableParams(config, {
            	groupBy: $attrs.groupBy,
                getData: function($defer, params) {
                    if (additionalParams !== undefined) {
                    	additionalParams = $interpolate($attrs.params)($scope);
                    	additionalParams = JSON.parse(additionalParams);
                    }
                    
                    param = populateSearchRequestParam($scope[tableId].$params, $attrs);
                    param = angular.extend(param, additionalParams);
                                     
                    if (type === 'server') {
                    	if ($scope.prevTotal === params.total() 
                    			&& (!angular.equals(JSON.stringify($scope[tableId].$params), $scope.prevParams)
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
								//console.log($scope[tableId].$params);
								if(($scope.prevParamsPage == '1' && $scope[tableId].$params.page === 1) || (JSON.stringify($scope[tableId].$params.count) !==  $scope.prevParamsCount)){
                    				$scope.checkAll.checked = false;
                                	$scope.checkAll.itemsChecked = {};
                	    			$scope.checkAll.itemsSelected = [];	
								}else{
									
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
                    		$scope.prevParamsPage= JSON.stringify($scope[tableId].$params.page);
							$scope.prevParamsCount= JSON.stringify($scope[tableId].$params.count);
                    		$scope.prevParams = JSON.stringify($scope[tableId].$params);
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
                            if(angular.isDefined($scope.checkAll)){
	            				$scope.checkAll.checked = false;
	                            $scope.checkAll.itemsChecked = {};
	            	    		$scope.checkAll.itemsSelected = [];
							}
                            if(angular.isDefined($attrs.callback)){
                				var callbackFunc = $parse($attrs.callback)($scope);
        	        			return callbackFunc(results);
                			}
                        } else if (!clientDataLoaded) {
                        	if (!angular.equals(JSON.stringify($scope[tableId].$params), $scope.prevParams)){
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
	                        	$scope.prevParams = JSON.stringify($scope[tableId].$params);
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
                $scope[tableId].$params.page = 1;
                $scope[tableId].reload();
            };

            /**Clear filter*/
            $scope.clearFilter = function() {
                $scope[tableId].$params.filter = {};
                $scope[tableId].$params.page = 1;
                $scope[tableId].reload();
            };

            /**Clear sorting*/
            $scope.clearSorting = function() {
                $scope[tableId].$params.sorting = {};
                $scope[tableId].$params.page = 1;
                $scope[tableId].reload();
            };
            
            /**Clear Filter with sorting Params*/
            $scope.clearFilterWithSortingParams = function(sortingParam, filterParam) {
                $scope[tableId].$params.filter = {};
				$scope[tableId].sorting(sortingParam);
				$scope[tableId].filter(filterParam);
                $scope[tableId].$params.page = 1;
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
                    angular.extend($scope[tableId].$params.filter, externalSearchParams);
                }
                $scope[tableId].$params.page = 1;
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
                	angular.extend($scope[tableId].$params.filter, searchString);
                	$scope[tableId].reload();
                }else if (value === ''){
                	angular.extend($scope[tableId].$params.filter, searchString);
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
    angular.module(appCon.appName).directive('visionDataTableExport', ['$injector','$http','$interpolate','$parse',
        function($injector, $http, $interpolate, $parse) {
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
                    	
                        var param = angular.extend({}, populateSearchRequestParam(scope.params.$params, attributes));
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
							var httpRequest = $injector.get(attributes.service)[attributes.operation](param);
	                        $.fileDownload(httpRequest.url, {
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