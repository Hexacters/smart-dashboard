/**
 * Full Calendar - Directive
 * 
 * <fullcalendar 
	service="organizationServices" 
	operation="getEvents"
	root-node="data.successData.eventsList"
	
	search-type="searchRequestWithPagination"
	params='{"repoUserId":"2550a484-228b-4153-aeff-c9ab8bbdecfe", "filter":{"param1":"value1",""}, sorting:{"firstName":"asc"}}'
		
	tooltip-title-container="eventTooltipTitle"
	tooltip-content-container="eventTooltipContent"
	height="500"
	
	title-node="title"
	start-date-node="eventDate"
	end-date-node="eventDate"
	
	request-callback=""
	response-callback=""
	
	event-click ="eventClicked"
	event-limit-click = "eventLimitClick"
	event-limit-tooltip ="Click to view more events"
	event-limit=3>
</fullcalendar>

<div id="eventTooltipTitle" class="ng-hide">
	<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa-calendar"></i></label><div class="col-lg-10">{title}</div></div>
</div>

<div id="eventTooltipContent" class="ng-hide">
	<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa-calendar"></i></label><div class="col-lg-10">{eventDate}</div></div>
	<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa-map-marker"></i></label><div class="col-lg-10">{eventPlace}</div></div>
	<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa-sort-amount-asc"></i></label><div class="col-lg-10"><strong>{attendees}</strong></div></div>
	<div class="row"><label class="col-lg-1 control-label text-right"><i class="fa fa fa-list"></i></label><div class="col-lg-10">{description}</div></div>
</div>
 */

'use strict';

angular.module(appCon.appName).directive('fullcalendar', function () {
	return {
		restrict : 'E',
		controller : 'calendarController',
		scope : {
			height : '@',
			service : '@',
			operation : '@',
			eventLimit : '@',
			rootNode : '@',
			tooltipTitleContainer : '@',
			tooltipContentContainer : '@',
			titleNode : '@',
			startDateNode : '@',
			endDateNode : '@',
			eventClick:'@',
			eventLimitClick:'@',
			eventLimitTooltip:'@',
			requestCallback:'@',
			responseCallback:'@'
		},

		template : '<div ng-class="{dNone:!loading}" class="text-right" style="margin-bottom:10px;"><img src="bower_components/images/ajax-loader-autocomplete.gif" align="absmiddle"/>&nbsp;loading...</div>' +
		'<div class="form-group table-responsive" ng-show="data.status==\'error\'">' +
		'<div class="text-danger"><span class="fa fa-warning" aria-hidden="true"></span>&nbsp;{{data.errorData.ResponseError[0].errorCode | translate}}</div>' +
		'</div>' +
		'<div class="calendar" ng-model="eventSources" calendar="myCalendar" ui-calendar="uiConfig.calendar"></div>'
	};
});

angular.module(appCon.appName).controller('calendarController', ['$scope', '$injector', '$compile', 'uiCalendarConfig', '$filter', '$parse', '$attrs', '$interpolate',
                                                                 function ($scope, $injector, $compile, uiCalendarConfig, $filter, $parse, $attrs, $interpolate) {

		/**Replace event data in popover tooltip template*/
		var popoverTooltip = function (content, event) {
			var matchResults,
			regEx = /{[^{]*(?:(?!<\/})^${]*)*}/gi;
			while ((matchResults = regEx.exec(content)) !== null) {
				if (matchResults.index === regEx.lastIndex) {
					regEx.lastIndex++;
				}
				var results = matchResults[0].toString();
				results = results.replace(/{/gi, '');
				results = results.replace(/}/gi, '');
				content = content.replace(matchResults[0], _.get(event, results));
			}
			return content;
		};

		$scope.eventsF = function (start, end, timezone, callback) {
			var param, additionalParams, fullCalendarData = {};
			
			var startDate = new Date(start);
			startDate = $filter('date')(startDate.getTime(), 'MM/dd/yyyy');
			
			var endDate = new Date(end);
			endDate.setDate(endDate.getDate()-1);
			endDate = $filter('date')(endDate.getTime(), 'MM/dd/yyyy');
			
			if(angular.isDefined($attrs.searchType)){
				param = {
					'filter':{
						'eventDate_DateRangeFilter' : startDate+"#vmsdr#"+endDate		
					}
				}
				if ($attrs.params !== undefined) {
	            	additionalParams = $interpolate($attrs.params)($scope);
	            	additionalParams = JSON.parse(additionalParams.replace(/'/g, '"'));
	            	if(angular.isDefined(additionalParams.filter)){
	            		additionalParams.filter['eventDate_DateRangeFilter'] = startDate+"#vmsdr#"+endDate;
	            	}
	            	param = additionalParams;
	            }
				param = populateSearchRequestParam(param, $attrs);
				
			}else{
				param = {
					'startDate' : startDate,
					'endDate' : endDate,
				};
				
				if ($attrs.params !== undefined) {
	            	additionalParams = $interpolate($attrs.params)($scope);
	            	additionalParams = JSON.parse(additionalParams.replace(/'/g, '"'));
	            }
				
	            param = angular.extend(param, additionalParams); 
	            
			}
			
			var requestCallback = $attrs.requestCallback; 
            if(angular.isDefined(requestCallback)){                	
            	var requestCallbackFunc = $parse(requestCallback)($scope);
            	param = requestCallbackFunc(param, $scope);
            }
            
			$scope.loading = true;
			$injector.get($scope.service)[$scope.operation](param).then(
				function (result) {
				$scope.loading = false;
				if (result.data.status === 'success') {
					$scope.data = result.data;
					fullCalendarData = $parse($scope.rootNode)($scope);
					
					var responseCallback = $attrs.responseCallback; 
		            if(angular.isDefined(responseCallback)){                	
		            	var responseCallbackFunc = $parse(responseCallback)($scope);
		            	fullCalendarData = responseCallbackFunc(result.data);
		            }
		            
					delete $scope.data;

					var events = [];
					for (var i = 0; i < fullCalendarData.length; i++) {
						events.push(angular.extend({
							title : fullCalendarData[i][$scope.titleNode] ? fullCalendarData[i][$scope.titleNode] : '',
							start : new Date(fullCalendarData[i][$scope.startDateNode] ? fullCalendarData[i][$scope.startDateNode] : null),
							end : new Date(fullCalendarData[i][$scope.endDateNode] ? fullCalendarData[i][$scope.endDateNode] : null),
							allDay : fullCalendarData[i].allDay ? fullCalendarData[i].allDay : false
						},
						fullCalendarData[i]));
					}
					callback(events);
				} else {
					$scope.loading = false;
				}
			}, function () {
				$scope.loading = false;
			});
		};

		/* Render Tooltip */
		$scope.eventRender = function (event, element) {
			element.popover({
				html : true,
				title : function () {
					return popoverTooltip($('#' + $scope.tooltipTitleContainer).html(), event);
				},
				placement : 'bottom',
				trigger : 'hover',
				container : 'body',
				content : function () {
					return popoverTooltip($('#' + $scope.tooltipContentContainer).html(), event);
				}
			});
			$compile(element)($scope);
		};
		/** config object */
		//if(typeof $scope.$eval($scope.eventLimit) === 'number')
			//$scope.eventLimit = parseInt($scope.eventLimit)+1;
		$scope.uiConfig = {
			calendar : {
				height : $scope.height ? $scope.height : 450,
				editable : false,
				eventLimit : $scope.eventLimit ? $scope.$eval($scope.eventLimit) : false,
				eventLimitTooltip : $scope.eventLimitTooltip ? $scope.eventLimitTooltip : false,		
				header : {
					left : 'title',
					center : '',
					right : 'today prev,next'
				},
				eventClick : function(calEvent, jsEvent, view) {
					if($scope.eventClick)
						return eval('$scope.$parent.'+$scope.eventClick+"(calEvent)");					
				},
				eventDrop : $scope.alertOnDrop,
				eventResize : $scope.alertOnResize,
				eventRender : $scope.eventRender,
				eventLimitClick: function(cellInfo,jsEvent ) {
					if($scope.eventLimitClick)
						return eval('$scope.$parent.'+$scope.eventLimitClick+"(cellInfo,jsEvent)");					
				}
			}
		};
		/* event sources array*/
		$scope.eventSources = [$scope.eventsF];
	}
]);
