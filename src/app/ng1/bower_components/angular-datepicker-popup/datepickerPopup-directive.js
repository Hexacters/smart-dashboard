'use strict';

angular.module(appCon.appName).directive('datepickerPopup', ['$filter', '$timeout', '$compile', '$document', '$parse', '$uibPosition', function ($filter, $timeout, $compile, $document, $parse, $uibPosition) {
		function populate(max, step, start) {
			var arr = [], i;
			for (i = start || 0; i < max; i = i + step) {
				arr.push({value: i, label: i < 10 ? '0' + i : '' + i});
			}
			return arr;
		}

		function formatTimeRange(t) {
			var formatted = t.fromHour.label + ':' + t.fromMinute.label + (t.fromSecond ? ':' + t.fromSecond.label : '') + ' ' + t.fromMeridian.label;
			if (t.toHour && t.toMinute) {
				formatted += ' - ' + t.toHour.label + ':' + t.toMinute.label + (t.toSecond ? ':' + t.toSecond.label : '') + ' ' + t.toMeridian.label;
			}
			return formatted;
		}

		var template =
				'<div class="datetime-range dropdown-menu" ng-click="$event.stopPropagation()">' +
				'<div class="datetime-range-panel">' +
				'<uib-datepicker ng-model="date" show-weeks="false" starting-day="1" max-date="maxDate" min-date="minDate"></uib-datepicker>' +
				'<div class="timerange ng-hide" ng-show="timerangeControl">' +
				'<div class="timerange-row">' +
				'<span>From </span>' +
				'<span class="select">' +
				'<select class="form-control input-sm" ng-model="time.fromHour" ng-options="hour.label for hour in hours"></select>' +
				'</span>' +
				'<span>:</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm" ng-model="time.fromMinute" ng-options="minute.label for minute in minutes"></select>' +
				'</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm" ng-model="time.fromMeridian" ng-options="meridian.label for meridian in meridians"></select>' +
				'</span>' +
				'</div>' +
				'<div class="timerange-row">' +
				'<span>To</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm to-hour" ng-model="time.toHour" ng-options="hour.label for hour in hours"></select>' +
				'</span>' +
				'<span>:</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm to-minute" ng-model="time.toMinute" ng-options="minute.label for minute in minutes"></select>' +
				'</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm to-meridian" ng-model="time.toMeridian" ng-options="meridian.label for meridian in meridians"></select>' +
				'</span>' +
				'</div>' +
				'<button class="btn btn-primary btn-apply" ng-disabled="!date">Apply</button>' +
				'</div>' +
				'<div class="timerange ng-hide" ng-show="timeControl">' +
				'<span>Time:</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm" ng-model="time.fromHour" ng-options="hour.label for hour in hours track by hour.value"></select>' +
				'</span>' +
				'<span>:</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm" ng-model="time.fromMinute" ng-options="minute.label for minute in minutes track by minute.value"></select>' +
				'</span>' +
				'<span>:</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm" ng-model="time.fromSecond" ng-options="second.label for second in seconds track by second.value"></select>' +
				'</span>' +
				'<span class="select">' +
				'<select class="form-control input-sm" ng-model="time.fromMeridian" ng-options="meridian.label for meridian in meridians track by meridian.value"></select>' +
				'</span>' +
				'<button class="btn btn-primary btn-apply" ng-disabled="!date">Apply</button>' +
				'</div>' +
				'</div>' +
				'</div>',

			dateFilter = $filter('date'),

			currentDropdown = null,

			modelValueFormat = 'MM/dd/yyyy HH:mm:ss',
			defaultDateFormat = 'MM/dd/yyyy',

			HOURS = [{value: 0, label: '12'}].concat(populate(12, 1, 1)),
			MINUTES = populate(60, 1),
			SECONDS = populate(60, 1),
			MERIDIEM = [
				{value: 0, label: 'AM'},
				{value: 12, label: 'PM'}
			];

		return {
			require: 'ngModel',
			scope: {
				model: '=ngModel',
				relatedMinDate: '=minDate',
				relatedMaxDate: '=maxDate'
			},
			link: function (scope, element, attrs, ngModel) {
				/** @property datepickerPopup */

				var dropdown,
					toHourSelect,
					toMinuteSelect,
					toMeridianSelect,
					options = angular.extend({
						format: null,
						timerange: false,
						time: false,
						separator: ';',
						appendToElement: false
					}, $parse(attrs.datepickerPopup || '{}')(scope)),
					initialized = false,
					toReinitialize;
				options.focusDisabled = true;
				element.removeAttr('datepickerPopup');
				
				if(angular.isDefined(options.readonly) && options.readonly === 'false'){
					element.prop('readonly', false);	
				}else{
					element.prop('readonly', true);
				}

				// Time range data
				scope.timerangeControl = options.timerange;
				scope.timeControl = options.time;

				// ui.bootstrap.datepicker default attrs
				scope.maxDate = options.maxDate;
				scope.minDate = options.minDate;
				if (scope.minDate === 'today') {
					scope.minDate = new Date().getTime();
				}

				if (options.timerange) {
					scope.hours = HOURS;
					scope.minutes = MINUTES;
					scope.meridians = MERIDIEM;
					scope.time = {
						fromHour: HOURS[0],
						fromMinute: MINUTES[0],
						fromMeridian: MERIDIEM[0],
						toHour: HOURS[HOURS.length - 1],
						toMinute: MINUTES[MINUTES.length - 1],
						toMeridian: MERIDIEM[1]
					};
				}

				// Time select data
				else if (options.time) {
					scope.hours = HOURS;
					scope.minutes = MINUTES;
					scope.seconds = SECONDS;
					scope.meridians = MERIDIEM;
					scope.time = {
						fromHour: HOURS[0],
						fromMinute: MINUTES[0],
						fromSecond: SECONDS[0],
						fromMeridian: MERIDIEM[0]
					};
				}
				
				if (scope.model && scope.model) {
					var dt = scope.model.match(/(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)[ ](\w+)/);
					if(dt === null){
						scope.date = scope.model;
					}else{
						if (+dt[4] >= 12) {
							dt[4] = (+dt[4] - 12) + '';
						} else if (dt[4] === '00') {
							dt[4] = '12';
						}
						scope.date = new Date(+dt[1], +dt[2] - 1, +dt[3], 0, 0, 0);
						scope.time = {
							fromHour: HOURS[+dt[4]] || HOURS[0],
							fromMinute: MINUTES[+dt[5]],
							fromSecond: SECONDS[+dt[6]],
							fromMeridian: (dt[7] === 'AM') ? MERIDIEM[0] : MERIDIEM[1]
						};
					}
					$timeout(updateView);
				}

				function hideDropdown() {
					if (dropdown) {
						$( "div" ).remove( ".datetime-range" )
						//dropdown.hide();
					}
					$document.off('click', hideDropdown);
				}


				element.on('click', function (e) {
					e.stopPropagation();

					// set false if manually click on date input
					options.focusDisabled = false;
					
					if (scope.relatedMinDate && scope.minDate != scope.relatedMinDate) {
						scope.minDate = scope.relatedMinDate;
						toReinitialize = true;
					}
					if (scope.relatedMaxDate && scope.maxDate != scope.relatedMaxDate) {
						scope.maxDate = scope.relatedMaxDate;
						toReinitialize = true;
					}
					//if (!initialized || toReinitialize) {
						var parentElement = element.parent();
						if(options.appendToElement) {
							dropdown = $compile(angular.element(template))(scope).appendTo(parentElement);
						} else {
							dropdown = $compile(angular.element(template))(scope).appendTo('body');
						}
						// Set variables
						if (options.timerange) {
							toHourSelect = dropdown.find('.to-hour');
							toMinuteSelect = dropdown.find('.to-minute');
							toMeridianSelect = dropdown.find('.to-meridian');
						}

						if (options.time || options.timerange) {
							dropdown.find('.btn-apply').on('click', function () {
								updateView();
							});
						}

						initialized = true;
						toReinitialize = false;
					//}

					// Position dropdown
					if (currentDropdown) {
						currentDropdown.hide();
					}
					var currentDropdownPosition = $uibPosition.positionElements(element, dropdown, 'bottom-left', true);
					if (options.appendToElement) {
						var parentElementPosition = $uibPosition.positionElements(parentElement, dropdown, 'top-left', true);
						var xPosition = currentDropdownPosition.left - parentElementPosition.left,
							yPosition = currentDropdownPosition.top - parentElementPosition.top,
							appendElementPosition  = {top : yPosition, left : xPosition};
						currentDropdown = dropdown.css(appendElementPosition).show();
					}
					else {
						// Prevent dropdown initialize outside viewport
						if (currentDropdownPosition && currentDropdownPosition.left > angular.element('body').width() - dropdown.width()) {
							currentDropdownPosition.left = angular.element('body').width() - dropdown.width();
						}
						currentDropdown = dropdown.css(currentDropdownPosition).show();
					}
					$document.on('click', hideDropdown);
				})
				element.on('keydown', function(e){
					if (e.which === 9 || e.which === 13){
						hideDropdown();
					};
				})
				// Toggle drop down. On the very first focus compile date picker
				.on('focus', function () {
					hideDropdown();
					// Hide dropdown on doc click
					$document.on('click', hideDropdown);
				});

				if (options.timerange) {
					scope.$watch(function () {
						var t = scope.time;
						return t.fromHour.value + t.fromMinute.value + t.fromMeridian.value + t.toHour.value + t.toMinute.value + t.toMeridian.value;
					}, function (newVal, oldVal) {
						if (newVal !== oldVal) {
							$timeout(hideOptions, 100);
						}
					});
				}
				else if (!options.time) {
					scope.$watch('date', function (newVal, oldVal) {
						if (/*+newVal !== +oldVal && */newVal !== undefined) {
							$timeout(updateView, 100);
						}
					});
				}

				// Format model to include range
				ngModel.$parsers.unshift(function (value) {

					/*if ((value.value || value.value === 0) && value.viewValue) {
						return value;
					}*/

					var from = new Date(scope.date), to;

					if (options.timerange || options.time) {
						from.setHours(scope.time.fromHour.value == 0 ? (scope.time.fromMeridian.label == 'AM' ? 0 : 12) : scope.time.fromHour.value + scope.time.fromMeridian.value);
						from.setMinutes(scope.time.fromMinute.value);
						if (scope.time.fromSecond) {
							from.setSeconds(scope.time.fromSecond.value);
						}
					}

					if (options.timerange) {
						to = new Date(scope.date);
						to.setHours(scope.time.toHour.value == 0 ? (scope.time.toMeridian.label == 'AM' ? 0 : 12) : scope.time.toHour.value + scope.time.toMeridian.value);
						to.setMinutes(scope.time.toMinute.value);
					}

					return value;
					/*{
						value: formatModelValue(from.getTime(), to ? to.getTime() : null),
						viewValue: value
					};*/

				});

				ngModel.$formatters.unshift(function (obj) {
					if (obj && obj.hasOwnProperty('viewValue')) {
						return obj.viewValue;
					}
				});

				scope.$watch('model', function (model, oldModel) {
					if (!model) {
						scope.date = undefined;
						return;
					}

					if (JSON.stringify(model) === JSON.stringify(oldModel)) {
						element.val(model);
						//TODO: temporary solution
						ngModel.$setViewValue(model);
						return;
					}

					// check IE Based watch function on UiMask
					if(window.navigator.userAgent.indexOf("MSIE") >= 0 || window.navigator.userAgent.indexOf("Trident/") >= 0){
						var result = /^\d{2}\/\d{2}\/\d{4}$/g.test(model);
						if(result){
							updateModelview(model)
						}
					}else{
						updateModelview(model);
					}
				});

				// check the Proper date before update
				function updateModelview(modelValue) {
					var date = new Date(modelValue),
						isValid = !isNaN(date); 
					if(isValid){
						updateView(modelValue);
					}else{
						$timeout(updateView, 100);
					}
				}
				
				scope.$watch('relatedMinDate', function (newVal) {
					if (scope.relatedMinDate && newVal > scope.model) {
						scope.date = new Date(scope.relatedMinDate);
						updateView();
					}
				});

				scope.$watch('relatedMaxDate', function (newVal) {
					if (scope.relatedMaxDate && newVal < scope.model) {
						scope.date = new Date(scope.relatedMaxDate);
						updateView();
					}
				});

				function formatModelValue(fromVal, toVal) {

					// timestamp is some special format
					if (options.format === 'timestamp') {
						// In case when 'toValue' are not presented return directly 'fromValue' without any changes
						return toVal ? fromVal + options.separator + toVal : fromVal;
					}

					var value = dateFilter(fromVal, options.format || modelValueFormat);
					if (toVal) {
						value += options.separator + dateFilter(toVal, options.format || modelValueFormat);
					}
					return value;
				}

				function updateView(modelValue) {
					var time = {}, range;
					
					if (!modelValue) {
						var format = options.format && (options.format !== 'timestamp') ? options.format : defaultDateFormat,
							value = dateFilter(scope.date, format) +
								(options.timerange || options.time ? ' ' + formatTimeRange(scope.time) : '' );

						if (options.timerange) {
							hideOptions();
						}

						element.val(value);
						ngModel.$setViewValue(value);
						
						if(options.focusDisabled === false){
							element.focus();
						}
						
						$timeout(function(){
							hideDropdown();	
						})
						
						// close dropdown
						//hideDropdown();

						return;
					}

					if (options.timerange) {
						range = modelValue.split(';');
						time.from = moment(range[0]).format(options.time || options.timerange.fromSecond || options.timerange.toSecond ? 'h m s A' : 'h m A').split(' ');
						time.to = moment(range[1]).format(options.time || options.timerange.fromSecond || options.timerange.toSecond ? 'h m s A' : 'h m A').split(' ');
					} else {
						time.from = moment(modelValue).format(options.time || options.timerange.fromSecond || options.timerange.toSecond ? 'h m s A' : 'h m A').split(' ');
					}

					scope.date = new Date(range ? range[0] : modelValue);

					scope.time = {
						fromHour: HOURS[+time.from[0]] || HOURS[0],
						fromMinute: MINUTES[time.from[1]],
						fromSecond: SECONDS[time.from[2]],
						fromMeridian: time.from[3] === 'AM' ? MERIDIEM[0] : MERIDIEM[1],
						toHour: time.to ? HOURS[+time.to[0]] || HOURS[0] : undefined,
						toMinute: time.to ? MINUTES[time.to[1]] : undefined,
						toSecond: time.to ? SECONDS[time.to[2]] : undefined,
						toMeridian: time.to ? time.to[3] === 'AM' ? MERIDIEM[0] : MERIDIEM[1] : undefined
					};

					element.val(modelValue);
					ngModel.$setViewValue(modelValue);

				}

				// Hide options in the form selectboxes
				function hideOptions() {

					var i, c;

					// Show/hide hour options
					if (scope.time.toMeridian.value == scope.time.fromMeridian.value) {
						for (i = 0, c = toHourSelect[0].children; i < c.length; i++) {
							c[i].hidden = c[i].value < scope.time.fromHour.value;
						}
						if (scope.time.fromHour.value >= scope.time.toHour.value) {
							scope.time.toHour = scope.time.fromHour;
						}
					}

					// Show/hide meridian options
					for (i = 0, c = toMeridianSelect[0].children; i < c.length; i++) {
						c[i].hidden = c[i].value == 0 && scope.time.fromMeridian.value == 12;
					}

					if (scope.time.fromMeridian.value >= scope.time.toMeridian.value) {
						scope.time.toMeridian = scope.time.fromMeridian;
					}

					// Show/hide minute options
					for (i = 0, c = toMinuteSelect[0].children; i < c.length; i++) {
						if (scope.time.fromHour.value < scope.time.toHour.value) {
							c[i].hidden = false;
						} else {
							c[i].hidden = +c[i].text <= scope.time.fromMinute.value;
						}
					}
				}
			}
		};
	}]);

	/*angular.module(appCon.appName).config(function ($provide) {
		$provide.decorator('datepickerPopupDirective', function ($delegate) {
			var directive = $delegate[0];
			var link = directive.link;
	
			directive.compile = function () {
				return function (scope, element, attrs) {
					link.apply(this, arguments);
					element.mask("99/99/9999", {placeholder: "__/__/____"});
				};
			};
			return $delegate;
		});
	});*/
