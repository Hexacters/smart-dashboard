(function (angular, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define(['bower_components/angular/angular'], function (angular) {
			return factory(angular);
		});
	} else {
		return factory(angular);
	}
}(angular || null, function (angular) {
	'use strict';
	/**
	 * ngTable: Table + Angular JS
	 *
	 * @author Vitalii Savchuk <esvit666@gmail.com>
	 * @url https://github.com/esvit/ng-table/
	 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
	 */

	/*** @ngdoc module
	 * @name ngTable
	 * @description ngTable: Table + Angular JS
	 * @example
	 <doc:example>
	 <doc:source>
	 <script>
	 var app = angular.module('myApp', ['ngTable']);
	 app.controller('MyCtrl', function($scope) {
                    $scope.users = [
                        {name: "Moroni", age: 50},
                        {name: "Tiancum", age: 43},
                        {name: "Jacob", age: 27},
                        {name: "Nephi", age: 29},
                        {name: "Enos", age: 34}
                    ];
                });
	 </script>
	 <table ng-table class="table">
	 <tr ng-repeat="user in users">
	 <td data-title="'Name'">{{user.name}}</td>
	 <td data-title="'Age'">{{user.age}}</td>
	 </tr>
	 </table>
	 </doc:source>
	 </doc:example>
	 */
	var app = angular.module('ngTable', []);
	/**
	 * ngTable: Table + Angular JS
	 *
	 * @author Vitalii Savchuk <esvit666@gmail.com>
	 * @url https://github.com/esvit/ng-table/
	 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
	 */

	/**
	 * @ngdoc service
	 * @name ngTable.factory:ngTableParams
	 * @description Parameters manager for ngTable
	 */
	app.factory('ngTableParams', ['$q', '$log', function ($q, $log) {
		var isNumber = function (n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};
		var ngTableParams = function (baseParameters, baseSettings) {
			var self = this,
				log = function () {
					if (settings.debugMode && $log.debug) {
						$log.debug.apply(this, arguments);
					}
				};

			this.data = [];

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#parameters
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Set new parameters or get current parameters
			 *
			 * @param {string} newParameters      New parameters
			 * @param {string} parseParamsFromUrl Flag if parse parameters like in url
			 * @returns {Object} Current parameters or `this`
			 */
			this.parameters = function (newParameters, parseParamsFromUrl) {
				parseParamsFromUrl = parseParamsFromUrl || false;
				if (angular.isDefined(newParameters)) {
					for (var key in newParameters) {
						var value = newParameters[key];
						if (parseParamsFromUrl && key.indexOf('[') >= 0) {
							var keys = key.split(/\[(.*)\]/).reverse()
							var lastKey = '';
							for (var i = 0, len = keys.length; i < len; i++) {
								var name = keys[i];
								if (name !== '') {
									var v = value;
									value = {};
									value[lastKey = name] = (isNumber(v) ? parseFloat(v) : v);
								}
							}
							if (lastKey === 'sorting') {
								params[lastKey] = {};
							}
							params[lastKey] = angular.extend(params[lastKey] || {}, value[lastKey]);
						} else {
							params[key] = (isNumber(newParameters[key]) ? parseFloat(newParameters[key]) : newParameters[key]);
						}
					}
					log('ngTable: set parameters', params);
					return this;
				}
				return params;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#settings
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Set new settings for table
			 *
			 * @param {string} newSettings New settings or undefined
			 * @returns {Object} Current settings or `this`
			 */
			this.settings = function (newSettings) {
				if (angular.isDefined(newSettings)) {
					if (angular.isArray(newSettings.data)) {
						//auto-set the total from passed in data
						newSettings.total = newSettings.data.length;
					}
					settings = angular.extend(settings, newSettings);
					log('ngTable: set settings', settings);
					return this;
				}
				return settings;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#page
			 * @methodOf ngTable.factory:ngTableParams
			 * @description If parameter page not set return current page else set current page
			 *
			 * @param {string} page Page number
			 * @returns {Object|Number} Current page or `this`
			 */
			this.page = function (page) {
				return angular.isDefined(page) ? this.parameters({'page': page}) : params.page;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#total
			 * @methodOf ngTable.factory:ngTableParams
			 * @description If parameter total not set return current quantity else set quantity
			 *
			 * @param {string} total Total quantity of items
			 * @returns {Object|Number} Current page or `this`
			 */
			this.total = function (total) {
				return angular.isDefined(total) ? this.settings({'total': total}) : settings.total;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#count
			 * @methodOf ngTable.factory:ngTableParams
			 * @description If parameter count not set return current count per page else set count per page
			 *
			 * @param {string} count Count per number
			 * @returns {Object|Number} Count per page or `this`
			 */
			this.count = function (count) {
				// reset to first page because can be blank page
				return angular.isDefined(count) ? this.parameters({'count': count, 'page': 1}) : params.count;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#filter
			 * @methodOf ngTable.factory:ngTableParams
			 * @description If parameter page not set return current filter else set current filter
			 *
			 * @param {string} filter New filter
			 * @returns {Object} Current filter or `this`
			 */
			this.filter = function (filter) {
				return angular.isDefined(filter) ? this.parameters({'filter': filter}) : params.filter;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#sorting
			 * @methodOf ngTable.factory:ngTableParams
			 * @description If 'sorting' parameter is not set, return current sorting. Otherwise set current sorting.
			 *
			 * @param {string} sorting New sorting
			 * @returns {Object} Current sorting or `this`
			 */
			this.sorting = function (sorting) {
				if (arguments.length == 2) {
					var sortArray = {};
					sortArray[sorting] = arguments[1];
					this.parameters({'sorting': sortArray});
					return this;
				}
				return angular.isDefined(sorting) ? this.parameters({'sorting': sorting}) : params.sorting;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#isSortBy
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Checks sort field
			 *
			 * @param {string} field     Field name
			 * @param {string} direction Direction of sorting 'asc' or 'desc'
			 * @returns {Array} Return true if field sorted by direction
			 */
			this.isSortBy = function (field, direction) {
				return angular.isDefined(params.sorting[field]) && params.sorting[field] == direction;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#orderBy
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Return object of sorting parameters for angular filter
			 *
			 * @returns {Array} Array like: [ '-name', '+age' ]
			 */
			this.orderBy = function () {
				var sorting = [];
				for (var column in params.sorting) {
					sorting.push((params.sorting[column] === "asc" ? "+" : "-") + column);
				}
				return sorting;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#getData
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Called when updated some of parameters for get new data
			 *
			 * @param {Object} $defer promise object
			 * @param {Object} params New parameters
			 */
			this.getData = function ($defer, params) {
				if (angular.isArray(this.data) && angular.isObject(params)) {
					$defer.resolve(this.data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				} else {
					$defer.resolve([]);
				}
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#getGroups
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Return groups for table grouping
			 */
			this.getGroups = function ($defer, column) {
				var defer = $q.defer();

				defer.promise.then(function (data) {
					var groups = {};
					angular.forEach(data, function (item) {
						var groupName = angular.isFunction(column) ? column(item) : item[column];

						groups[groupName] = groups[groupName] || {
							data: []
						};
						groups[groupName]['value'] = groupName;
						groups[groupName].data.push(item);
					});
					var result = [];
					for (var i in groups) {
						result.push(groups[i]);
					}
					log('ngTable: refresh groups', result);
					$defer.resolve(result);
				});
				this.getData(defer, self);
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#generatePagesArray
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Generate array of pages
			 *
			 * @param {boolean} currentPage which page must be active
			 * @param {boolean} totalItems  Total quantity of items
			 * @param {boolean} pageSize    Quantity of items on page
			 * @returns {Array} Array of pages
			 */
			this.generatePagesArray = function (currentPage, totalItems, pageSize) {
				var maxBlocks, maxPage, maxPivotPages, minPage, numPages, pages;
				maxBlocks = 11;
				pages = [];
				numPages = Math.ceil(totalItems / pageSize);
				if (numPages > 1) {
					pages.push({
						type: 'prev',
						number: Math.max(1, currentPage - 1),
						active: currentPage > 1
					});
					pages.push({
						type: 'first',
						number: 1,
						active: currentPage > 1
					});
					maxPivotPages = Math.round((maxBlocks - 5) / 2);
					minPage = Math.max(2, currentPage - maxPivotPages);
					maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
					minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
					var i = minPage;
					while (i <= maxPage) {
						if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
							pages.push({
								type: 'more',
								active: false
							});
						} else {
							pages.push({
								type: 'page',
								number: i,
								active: currentPage !== i
							});
						}
						i++;
					}
					pages.push({
						type: 'last',
						number: numPages,
						active: currentPage !== numPages
					});
					pages.push({
						type: 'next',
						number: Math.min(numPages, currentPage + 1),
						active: currentPage < numPages
					});
				}
				return pages;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#url
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Return groups for table grouping
			 *
			 * @param {boolean} asString flag indicates return array of string or object
			 * @returns {Array} If asString = true will be return array of url string parameters else key-value object
			 */
			this.url = function (asString) {
				asString = asString || false;
				var pairs = (asString ? [] : {});
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						var item = params[key],
							name = encodeURIComponent(key);
						if (typeof item === "object") {
							for (var subkey in item) {
								if (!angular.isUndefined(item[subkey]) && item[subkey] !== "") {
									var pname = name + "[" + encodeURIComponent(subkey) + "]";
									if (asString) {
										pairs.push(pname + "=" + item[subkey]);
									} else {
										pairs[pname] = item[subkey];
									}
								}
							}
						} else if (!angular.isFunction(item) && !angular.isUndefined(item) && item !== "") {
							if (asString) {
								pairs.push(name + "=" + encodeURIComponent(item));
							} else {
								pairs[name] = encodeURIComponent(item);
							}
						}
					}
				}
				return pairs;
			};

			/**
			 * @ngdoc method
			 * @name ngTable.factory:ngTableParams#reload
			 * @methodOf ngTable.factory:ngTableParams
			 * @description Reload table data
			 */
			this.reload = function () {
				var $defer = $q.defer(),
					self = this;

				settings.$loading = true;
				if (settings.groupBy) {
					settings.getGroups($defer, settings.groupBy, this);
				} else {
					settings.getData($defer, this);
				}
				log('ngTable: reload data');
				$defer.promise.then(function (data) {
					log('ngTable: current scope', settings.$scope);
					if (settings.groupBy) {
						self.data = settings.$scope.$groups = data;
					} else {
						self.data = settings.$scope.$data = data;
					}
					settings.$scope.pages = self.generatePagesArray(self.page(), self.total(), self.count());
				}).catch(function (error) {
					self.data = [];
					settings.$scope.pages = [];
				}).finally(function () {
					settings.$loading = false;
					settings.$scope.$emit('ngTableAfterReloadData');
				});
			};

			this.reloadPages = function () {
				var self = this;
				settings.$scope.pages = self.generatePagesArray(self.page(), self.total(), self.count());
			};

			var params = this.$params = {
				page: 1,
				count: 1,
				filter: {},
				sorting: {},
				group: {},
				groupBy: null
			};
			var settings = {
				$scope: null, // set by ngTable controller
				$loading: false,
				data: null, //allows data to be set when table is initialized
				total: 0,
				defaultSort: 'desc',
				allowUnsort: false,
				filterDelay: 750,
				counts: [10, 25, 50, 100],
				getGroups: this.getGroups,
				getData: this.getData
			};

			this.settings(baseSettings);
			this.parameters(baseParameters, true);
			return this;
		};
		return ngTableParams;
	}]);

	/**
	 * ngTable: Table + Angular JS
	 *
	 * @author Vitalii Savchuk <esvit666@gmail.com>
	 * @url https://github.com/esvit/ng-table/
	 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
	 */

	/**
	 * @ngdoc object
	 * @name ngTable.directive:ngTable.ngTableController
	 *
	 * @description
	 * Each {@link ngTable.directive:ngTable ngTable} directive creates an instance of `ngTableController`
	 */
	var ngTableController = ['$scope', 'ngTableParams', '$timeout', function ($scope, ngTableParams, $timeout) {
		$scope.$loading = false;

		if (!$scope.params) {
			$scope.params = new ngTableParams();
		}
		$scope.params.settings().$scope = $scope;

		var delayFilter = (function () {
			var timer = 0;
			return function (callback, ms) {
				$timeout.cancel(timer);
				timer = $timeout(callback, ms);
			};
		})();

		$scope.$watch('params.$params', function (newParams, oldParams) {
			$scope.params.settings().$scope = $scope;

			if (!angular.equals(newParams.filter, oldParams.filter)) {
				delayFilter(function () {
					$scope.params.$params.page = 1;
					$scope.params.reload();
				}, $scope.params.settings().filterDelay);
			} else {
				$scope.params.reload();
			}
		}, true);

		$scope.sortBy = function (column, event) {
			var parsedSortable = $scope.parse(column.sortable);
			if (!parsedSortable) {
				return;
			}
			var settings = $scope.params.settings();
			var defaultSort = settings.defaultSort;
			var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
			var multipleSort = (event.ctrlKey || event.metaKey);

			var sorting = $scope.params.sorting(), newSort = defaultSort;
			if (sorting && sorting[parsedSortable]) {

				if (settings.allowUnsort) {
					if (sorting[parsedSortable] === defaultSort) {
						newSort = inverseSort;
					} else if (sorting[parsedSortable] === inverseSort) {
						newSort = false;
					} else {
						newSort = defaultSort;
					}
				} else {
					newSort = sorting[parsedSortable] === defaultSort ? inverseSort : defaultSort;
				}
			}
			var sortingParams = multipleSort ? $scope.params.sorting() : {};
			if (newSort) {
				sortingParams[parsedSortable] = newSort;
			} else {
				delete sortingParams[parsedSortable];
			}

			$scope.params.parameters({
				sorting: sortingParams
			});
		};
		
		$scope.doTextSubmit = function(keyEvent) {
	    	if (keyEvent.which === 13){
	    		$scope.params.reload();
	    	}
	    };
	    
	    //VM Changes - Multiselect Dropdown Event
	    $scope.doMultiSelectFilter = function(keyEvent, column) {
	    	// Get param value.
	    	/*var selectedValues = $scope.params.filter()[Object.keys(column.filter)[0]];
	    	var checkedValues = [];
	    	
	    	// Iterate the param value by key 'id'.
	    	for (var key in selectedValues) {
	    		checkedValues.push(selectedValues[key]['id']);
	    	};
	    	// Update param value from object array to comma seperated.
	    	$scope.params.filter()[Object.keys(column.filter)[0]] = checkedValues.join(",");*/
	    	$scope.params.reload();
	    	//$scope.params.filter()[Object.keys(column.filter)[0]] = selectedValues;
	    };
	    
	    $scope.doDropDownChange = function(keyEvent) {
	    	$scope.params.reload();
	    };
	    
	    $scope.doDateFilter = function(startDateName, endDateName) {
	    	var startDate = $scope.params.filter()[startDateName];
	    	var endDate = $scope.params.filter()[endDateName];
	    	if(startDate){
	    		startDate = new Date(startDate);
	    	}
	    	if(endDate){
	    		endDate = new Date(endDate);
	    	}
	    	if(startDate === undefined){
	    		$rootScope.commonAlertDialogTitle = 'Alert';
	    		$rootScope.commonAlertDialogContent = 'Please enter Start date.';
	    		$rootScope.commonAlertDialog();
	    	}else if(endDate === undefined){
	    		$rootScope.commonAlertDialogTitle = 'Alert';
	    		$rootScope.commonAlertDialogContent = 'Please enter End date.';
	    		$rootScope.commonAlertDialog();
	    	}else if(startDate.getTime() > endDate.getTime()){
	    		$rootScope.commonAlertDialogTitle = 'Alert';
	    		$rootScope.commonAlertDialogContent = 'From date must be less than or equal to To date.';
	    		$rootScope.commonAlertDialog();
	    	}else{
	    		$scope.params.filter()[startDateName.split('_')[0]] = $filter('date')($scope.params.filter()[startDateName], "MM/dd/yyyy") +'#vmsdr#'+ $filter('date')($scope.params.filter()[endDateName], "MM/dd/yyyy");
	    		$scope.params.reload();
	    	}
	    };
	    
	    $scope.clearDateFilter = function(startDateName, endDateName) {
	    	var startDate = $scope.params.filter()[startDateName];
	    	var endDate = $scope.params.filter()[endDateName];
	    	if(startDate !== undefined  && endDate !== undefined ){
	    	  $scope.params.filter()[startDateName.split('_')[0]] = '';
	    	  $scope.params.filter()[startDateName] = undefined;
	    	  $scope.params.filter()[endDateName] = undefined;
			  $scope.params.reload();
	    	}
	    };
	    
	    
	    //Number Filter
	    $scope.doNumberFilter = function(optionsVal, startVal, endVal) {
	    	var testNumber = /^\d*$/;
	    	var numberOption = ($scope.params.filter()[optionsVal]) ? $scope.params.filter()[optionsVal].id : '?';
	    	var numberStart = $scope.params.filter()[startVal];
	    	var numberEnd = $scope.params.filter()[endVal];
	    	
	    	if(numberOption == '?'){
	    		$rootScope.commonAlertDialogTitle = 'Alert';
	    		$rootScope.commonAlertDialogContent = 'Please select any one of the filter option.';
	    		$rootScope.commonAlertDialog();
	    	}else{
		    	switch(numberOption){
		    		case 'btn':
		    				if(!testNumber.test(numberStart)){
		    					$rootScope.commonAlertDialogTitle = 'Alert';
		    		    		$rootScope.commonAlertDialogContent = 'Please enter start value as number.';
		    		    		$rootScope.commonAlertDialog();
		    				}else if(!testNumber.test(numberEnd)){
		    					$rootScope.commonAlertDialogTitle = 'Alert';
		    		    		$rootScope.commonAlertDialogContent = 'Please enter end value as number.';
		    		    		$rootScope.commonAlertDialog();
		    		    	}else{
		    					$scope.params.filter()[optionsVal.split('_')[0]] = $scope.params.filter()[startVal] +'#btn#'+ $scope.params.filter()[endVal];
		    					$scope.params.reload(); //reload
		    				}
		    			break;
		    		default:
		    			if(!testNumber.test(numberEnd)){
							$rootScope.commonAlertDialogTitle = 'Alert';
				    		$rootScope.commonAlertDialogContent = 'Please enter value as number.';
				    		$rootScope.commonAlertDialog();
						}else{
							
							if(numberOption == 'eq'){
								$scope.params.filter()[optionsVal.split('_')[0]] = $scope.params.filter()[endVal];
							}else{
								$scope.params.filter()[optionsVal.split('_')[0]] = '#' +numberOption+ '#'+ $scope.params.filter()[endVal];
							}
							
							$scope.params.reload(); //reload
						}
		    			
		    			break;    	
		    	}    	   
	    	}
	    };
		
	}];
	
	
    
	/**
	 * ngTable: Table + Angular JS
	 *
	 * @author Vitalii Savchuk <esvit666@gmail.com>
	 * @url https://github.com/esvit/ng-table/
	 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
	 */

	/**
	 * @ngdoc directive
	 * @name ngTable.directive:ngTable
	 * @restrict A
	 *
	 * @description
	 * Directive that instantiates {@link ngTable.directive:ngTable.ngTableController ngTableController}.
	 */
	app.directive('ngTable', ['$compile', '$q', '$parse',
		function ($compile, $q, $parse) {
			'use strict';

			return {
				restrict: 'A',
				priority: 1001,
				scope: true,
				controller: ngTableController,
				compile: function (element) {
					var columns = [], i = 0, row = null;

					// custom header
					var thead = element.find('thead');

					// IE 8 fix :not(.ng-table-group) selector
					angular.forEach(angular.element(element.find('tr')), function (tr) {
						tr = angular.element(tr);
						if (!tr.hasClass('ng-table-group') && !row) {
							row = tr;
						}
					});
					if (!row) {
						return;
					}
					angular.forEach(row.find('td'), function (item) {
						var el = angular.element(item);
						if (el.attr('ignore-cell') && 'true' === el.attr('ignore-cell')) {
							return;
						}
						var parsedAttribute = function (attr, defaultValue) {
							return function (scope) {
								return $parse(el.attr('x-data-' + attr) || el.attr('data-' + attr) || el.attr(attr))(scope, {
										$columns: columns
									}) || defaultValue;
							};
						};

						var parsedTitle = parsedAttribute('title', ' '),
							headerTemplateURL = parsedAttribute('header', false),
							filter = parsedAttribute('filter', false)(),
							filterTemplateURL = false,
							filterName = false;

						if (filter && filter.$$name) {
							filterName = filter.$$name;
							delete filter.$$name;
						}
						if (filter && filter.templateURL) {
							filterTemplateURL = filter.templateURL;
							delete filter.templateURL;
						}

						el.attr('data-title-text', parsedTitle()); // this used in responsive table
						columns.push({
							id: i++,
							title: parsedTitle,
							sortable: parsedAttribute('sortable', false),
							'class': el.attr('x-data-header-class') || el.attr('data-header-class') || el.attr('header-class'),
							filter: filter,
							filterTemplateURL: filterTemplateURL,
							filterName: filterName,
							headerTemplateURL: headerTemplateURL,
                            data: parsedAttribute('options', null)(),
							filterData: (el.attr("filter-data") ? el.attr("filter-data") : null),
							show: (el.attr("ng-show") ? function (scope) {
								return $parse(el.attr("ng-show"))(scope);
							} : function () {
								return true;
							})
						});
					});
					return function (scope, element, attrs) {
						scope.$loading = false;
						scope.$columns = columns;

						scope.$watch(attrs.ngTable, (function (params) {
							if (angular.isUndefined(params)) {
								return;
							}
							scope.paramsModel = $parse(attrs.ngTable);
							scope.params = params;
						}), true);
						scope.parse = function (text) {
							return angular.isDefined(text) ? text(scope) : '';
						};
						if (attrs.showFilter) {
							scope.$parent.$watch(attrs.showFilter, function (value) {
								scope.show_filter = value;
							});
						}
						angular.forEach(columns, function (column) {
	                        var def;
	                        if (!column.filterData) {
	                            return;
	                        }
	                        
	                        //VM Changes- Commented the following lines which is not really needed now
	                        /*
	                        def = $parse(column.filterData)(scope, {
	                            $column: column
	                        });
	                        if (!(angular.isObject(def) && angular.isObject(def.promise))) {
	                            throw new Error('Function ' + column.filterData + ' must be instance of $q.defer()');
	                        }
	                        delete column.filterData;
	                        return def.promise.then(function (data) {
	                            if (!angular.isArray(data)) {
	                                data = [];
	                            }
	                            data.unshift({
	                                title: '-',
	                                id: ''
	                            });
	                            
	                            console.log(data);
	                            column.data = data;
	                        });
	                        */
	                        
	                        //VM Changes- Fixed dropdown filter data by applying from attribute
	                        var data = $parse(column.filterData)(scope, {
	                            $column: column
	                        });
	                        /*data.unshift({
	                            title: '-',
	                            id: ''
	                        });*/
	                        column.data = data;
	                    });
						if (!element.hasClass('ng-table')) {
							scope.templates = {
								header: function() {
									if(attrs.filterPosition === 'top') {
										return (attrs.templateHeader ? attrs.templateHeader : 'ng-table/headerFilterTop.html');
									}
									return (attrs.templateHeader ? attrs.templateHeader : 'ng-table/header.html');
								}(),
								pagination: (attrs.templatePagination ? attrs.templatePagination : 'ng-table/pager.html')
							};
							var headerTemplate = thead.length > 0 ? thead : angular.element(document.createElement('thead')).attr('ng-include', 'templates.header');

							if (element.hasClass('has-pager')) {
								var paginationRow = angular.element(document.createElement('tr'))
										.append(angular.element(document.createElement('td'))
											.attr({
												'ng-table-pagination': 'params',
												'template-url': 'templates.pagination',
												'colspan': columns.length
											})),
									paginationTemplate = angular.element(document.createElement('tfoot')).append(paginationRow);

								element.append(paginationTemplate);
								$compile(paginationTemplate)(scope);
							}

							element.find('thead').remove();
							element.addClass('ng-table').prepend(headerTemplate)

							$compile(headerTemplate)(scope);
						}
					};
				}
			}
		}
	]);

	/**
	 * ngTable: Table + Angular JS
	 *
	 * @author Vitalii Savchuk <esvit666@gmail.com>
	 * @url https://github.com/esvit/ng-table/
	 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
	 */

	/**
	 * @ngdoc directive
	 * @name ngTable.directive:ngTablePagination
	 * @restrict A
	 */
	app.directive('ngTablePagination', ['$compile',
		function ($compile) {
			'use strict';

			return {
				restrict: 'A',
				scope: {
					params: '=ngTablePagination',
					templateUrl: '='
				},
				replace: false,
				link: function (scope, element, attrs) {
					var getPages = function () {
						return scope.params.generatePagesArray(scope.params.page(), scope.params.total(), scope.params.count());
					};
					scope.$watch("params", function(params){
						if (angular.isUndefined(params)) {
							return;
						}
						scope.params.settings().$scope && scope.params.settings().$scope.$on('ngTableAfterReloadData', function () {
							scope.pages = getPages();
						}, true);
						
						scope.$watch(function () {
							return '' + scope.params.total() + scope.params.page() + scope.params.count();
						}, function (newVal, oldVal) {
							if (newVal !== oldVal) {
								scope.pages = getPages();
							}
						});
					});
					
					scope.$watch('templateUrl', function (templateUrl) {
						if (angular.isUndefined(templateUrl)) {
							return;
						}
						var template = angular.element(document.createElement('div'))
						template.attr({
							'ng-include': 'templateUrl'
						});
						element.append(template);
						$compile(template)(scope);
					});
				}
			};
		}
	]);

	angular.module('ngTable').run(['$templateCache', 
    function ($templateCache) {
		$templateCache.put('ng-table/filters/select.html', '<select ng-options="data.id as data.title for data in column.data" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control" name="{{column.filterName}}" ng-change="doDropDownChange($event)"> </select>');
		$templateCache.put('ng-table/filters/text.html', '<input type="text" data-ng-init="textFilterMaxLength=column.maxLength();" name="{{column.filterName}}" ng-model="params.filter()[name]" maxlength="{{::textFilterMaxLength?textFilterMaxLength:100}}" ng-keypress="doTextSubmit($event)" ng-if="filter==\'text\'" class="input-filter form-control"/>');
		$templateCache.put('ng-table/header.html', '<tr> <th ng-repeat="column in $columns" ng-class="{ \'sortable\': parse(column.sortable), \'sort-asc\': params.sorting()[parse(column.sortable)]==\'asc\', \'sort-desc\': params.sorting()[parse(column.sortable)]==\'desc\' }" ng-click="sortBy(column, $event)" ng-show="column.show(this)" ng-init="template=column.headerTemplateURL(this)" class="header {{column.class}}"> <div ng-if="!template" ng-show="!template" ng-bind="parse(column.title)" style="width:{{column.width}}px;"></div> <div ng-if="template" ng-show="template"><div ng-include="template"></div></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th ng-repeat="column in $columns" ng-show="column.show(this)" class="filter"> <div ng-repeat="(name, filter) in column.filter"> <div ng-if="column.filterTemplateURL" ng-show="column.filterTemplateURL"> <div ng-include="column.filterTemplateURL"></div> </div> <div ng-if="!column.filterTemplateURL" ng-show="!column.filterTemplateURL"> <div ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </div> </th> </tr>');
		$templateCache.put('ng-table/pager.html', '<div class="ng-cloak ng-table-pager"> <div ng-if="params.settings().counts.length" class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default"> <span ng-bind="count"></span> </button> </div> <ul class="pagination ng-table-pagination pull-left" ng-show="pages.length"> <li ng-class="{\'disabled\': !page.active}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> <ul class="pagination ng-table-pagination pull-left" ng-show="!pages.length && params.settings().total>0"><li ng-class="{\'disabled\': true}"><a href=""><span class="fa fa-chevron-left"></span>&nbsp;</a><a href="" class="disabledPaginationItem"><span>1</span></a><a href="">&nbsp;<span class="fa fa-chevron-right"></span></a></li></ul> <div class="pull-left tableTotalRecords" ng-show="params.settings().total>0">{{((params.page()*params.count())-params.count())+1}} - {{(params.page()*params.count())-(params.count()-params.data.length)}} of {{params.settings().total}}</div> </div> ');
		
		$templateCache.put('ng-table/filters/dateRange.html', '<div class="form-inline" ng-init="startDateName = name+\'_startDate\'; endDateName = name+\'_endDate\';"><input class="input-filter form-control pull-left" style="background-color:#fff;min-width:90px;width:35%;float:left;" type="text" datepicker-options="{showWeeks:false}" enable-time=false datetime-picker="MM/dd/yyyy" datepicker-append-to-body="true" close-on-date-selection="true" ng-keypress="doDateFilter(startDateName, endDateName)" ng-model="params.filter()[startDateName]" close-text="Close" show-weeks="false" ng-click="openCalendar($event, \'id1\')" is-open="open.id1" readonly /><input class="input-filter form-control pull-left" style="background-color:#fff;min-width:90px;width:35%;float:left;" type="text" datepicker-append-to-body="true" close-on-date-selection="true" ng-keypress="doDateFilter(startDateName, endDateName)" datetime-picker="MM/dd/yyyy" ng-model="params.filter()[endDateName]" close-text="Close" show-weeks="false" datepicker-options="{showWeeks:false}" enable-time=false ng-click="openCalendar($event, \'id2\')" is-open="open.id2" readonly/><button type="button" class="btn btn-primary btn-filter pull-left" ng-click="clearDateFilter(startDateName, endDateName)">Clear</button></div>');
		
		$templateCache.put('ng-table/filters/dateTimeRange.html', '<div class="form-inline" ng-init="startDateName = name+\'_startDate\'; endDateName = name+\'_endDate\';"><input class="input-filter form-control pull-left" style="background-color:#fff;min-width:90px;width:35%;float:left;" type="text" datepicker-options="{showWeeks:false}" datetime-picker="MM/dd/yyyy HH:mm" datepicker-append-to-body="true" close-on-date-selection="true" ng-keypress="doDateFilter(startDateName, endDateName)" ng-model="params.filter()[startDateName]" close-text="Close" show-weeks="false" ng-click="openCalendar($event, \'id1\')" is-open="open.id1" readonly /><input class="input-filter form-control pull-left" style="background-color:#fff;min-width:90px;width:35%;float:left;" type="text" datepicker-append-to-body="true" close-on-date-selection="true" ng-keypress="doDateFilter(startDateName, endDateName)" datetime-picker="MM/dd/yyyy HH:mm" ng-model="params.filter()[endDateName]" close-text="Close" show-weeks="false" datepicker-options="{showWeeks:false}"  ng-click="openCalendar($event, \'id2\')" is-open="open.id2" readonly/><button type="button" class="btn btn-primary btn-filter pull-left" ng-click="clearDateFilter(startDateName, endDateName)">Clear</button></div>');
		
		$templateCache.put('ng-table/filters/number.html','<div class="form-inline" ng-init="optionsValName = name+\'_options\'; startValName = name+\'_start\'; endValName = name+\'_end\'; showStartVal = false;numberFilterMaxLength=column.maxLength();">'+
			   '<input class="input-filter form-control pull-left" maxlength="{{::numberFilterMaxLength?numberFilterMaxLength:13}}" style="background-color:#fff;width:50px;float:left;" type="text" ng-model="params.filter()[startValName]" ng-show="showStartVal" />'+
			   '<select class="filter filter-select form-control pull-left" style="float:left;" ng-style="{ \'width\' : (showStartVal) ? \'60px\':\'60px\'}" ng-options="data.title for data in column.data track by data.id" ng-model="params.filter()[optionsValName]" ng-change="showStartVal=(params.filter()[optionsValName].id == \'btn\') ? true:false;"></select>'+		
			   '<input class="input-filter form-control pull-left" maxlength="{{::numberFilterMaxLength?numberFilterMaxLength:13}}" style="width:50px;float:left;" type="text" ng-model="params.filter()[endValName]" />'+
			   '<button type="button" class="btn btn-primary pull-left btn-filter" ng-click="doNumberFilter(optionsValName, startValName, endValName)">Go</button>'+
			   '</div>');
		$templateCache.put('ng-table/filters/multiselect.html','<div class="form-inline pull-left"><div ng-dropdown-multiselect options="column.data" style="float:left;" selected-model="params.filter()[name]"></div><button type="button" class="btn btn-primary btn-filter" style="float:left;" ng-click="doMultiSelectFilter($event, column)">Go</button></div>');
	}]);
    return app;
}));