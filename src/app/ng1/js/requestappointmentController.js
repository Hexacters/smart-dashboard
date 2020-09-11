'use strict';
//Appointments Controller
angular.module(appCon.appName).controller("requestappoinmentController", ["$timeout", "$scope", "$window", "$filter", "$rootScope", "$injector", "$state", "$modal", function ($timeout, $scope, $window, $filter, $rootScope, $injector, $state, $modal) {
	var appointmentServices = $injector.get("repRequestAppointmentServices");

	$scope.mailTo = function (mailId) {
		return window.encodeURIComponent(mailId);
	};

	$rootScope.appointmentServerDateTime = angular.copy($rootScope.serverTime.serverDateTime);
	$scope.initialResponseLoading = true;
	$scope.appointment = {};
	$scope.appointment.recurring = 'oneTime';
	var appointmentStartDate, minDate, maxDate, endDate, maxStartDate, selectedRepet, selectedStartDate, selectedEndDate;
	minDate = new Date($rootScope.appointmentServerDateTime);
	minDate.setDate(minDate.getDate());
	$scope.minDate = minDate;
	maxDate = new Date($rootScope.appointmentServerDateTime);
	maxDate.setYear(maxDate.getFullYear() + 1);
	maxDate.setDate(maxDate.getDate() - 1);
	$scope.maxDate = maxDate;
	$scope.appointmentFailure = '';
	appointmentStartDate = new Date($rootScope.appointmentServerDateTime);
	appointmentStartDate.setDate(appointmentStartDate.getDate());
	appointmentStartDate = $filter('date')(appointmentStartDate, 'MM/dd/yyyy');
	$scope.appointmentStartDate = appointmentStartDate;
	$scope.appointmentEndDate = appointmentStartDate;

	var maxStartDate = new Date($rootScope.appointmentServerDateTime);
	maxStartDate.setDate(maxStartDate.getYear() + 1);
	$scope.maxStartDate = maxStartDate;
	var startTimeObjList = [], endTimeObjList = [], recurringStartTimeObjList = [], recurringEndTimeObjList = [], recurringAppt = {};
	$scope.defaultDays = [0, 1, 2, 3, 4, 5, 6];
	if (angular.isDefined($rootScope.recurringAppt) && angular.isDefined($rootScope.recurringAppt.summaryStr)) {
		delete $rootScope.recurringAppt.summaryStr;
	}

	$scope.setAppointmentStartTimeByTimeZone = function (timeZoneId) {
		$scope.enableLoading = true;
		appointmentServices.getTimeZoneDateAndTime().then(function (result) {
			if (result.data && result.data.status === 'success' && result.data.successData.currentTimeZoneDateTime) {
				$scope.enableLoading = false;
				var currentTimeZoneDateTimeValue;
				currentTimeZoneDateTimeValue = result.data.successData.currentTimeZoneDateTime;
				var timezoneOffset, serverDateTime, newServerDateTime;
				if (timeZoneId === 'TZ001') {
					timezoneOffset = $rootScope.serverTime.TZ001;
				} else if (timeZoneId === 'TZ002') {
					timezoneOffset = $rootScope.serverTime.TZ002;
				} else if (timeZoneId === 'TZ003') {
					timezoneOffset = $rootScope.serverTime.TZ003;
				} else if (timeZoneId === 'TZ004') {
					timezoneOffset = $rootScope.serverTime.TZ004;
				} else if (timeZoneId === 'TZ009') {
					timezoneOffset = $rootScope.serverTime.TZ009;
				} else if (timeZoneId === 'TZ013') {
					timezoneOffset = $rootScope.serverTime.TZ013;
				}
				serverDateTime = new Date(currentTimeZoneDateTimeValue);
				serverDateTime = $filter('date')(serverDateTime, 'MM/dd/yyyy HH:mm');
				newServerDateTime = calcTime(serverDateTime, result.data.successData.currentTimezoneOffet, timezoneOffset);
				$rootScope.appointmentServerDateTime = newServerDateTime;
				$scope.minDate = $filter('date')(newServerDateTime, 'MM/dd/yyyy');
				$timeout(function () { $scope.appointment.timeZone = timeZoneId; }, 300);
				if ($scope.appointment.recurring === 'recurring') {
					$scope.setRecurringAppointmentStartTime();
				} else {
					$scope.loadAppointmentStartDateTime($scope.appointment.startDate, $scope.appointment.endDate);
				}
			} else {
				$scope.enableLoading = false;
			}
		});
	};

	//Get Server timeZone Value
	$scope.setDefaultTimeZone = function () {
		var timeZone, timezoneOffset, newServerDateTime;
		var localTimezoneDate = new Date();
		var localTimezoneOffset = -(localTimezoneDate.getTimezoneOffset());
		if ($rootScope.serverTime.TZ001 === localTimezoneOffset) {
			timeZone = "TZ001";
			//timezoneOffset = $rootScope.serverTime.TZ001; 
		} else if ($rootScope.serverTime.TZ002 === localTimezoneOffset) {
			timeZone = "TZ002";
			//timezoneOffset = $rootScope.serverTime.TZ002;
		} else if ($rootScope.serverTime.TZ003 === localTimezoneOffset) {
			timeZone = "TZ003";
			//timezoneOffset = $rootScope.serverTime.TZ003;
		} else if ($rootScope.serverTime.TZ004 === localTimezoneOffset) {
			timeZone = "TZ004";
		} else if ($rootScope.serverTime.TZ009 === localTimezoneOffset) {
			timeZone = "TZ009";
			//timezoneOffset = $rootScope.serverTime.TZ009
		} else if ($rootScope.serverTime.TZ0013 === localTimezoneOffset) {
			timeZone = "TZ013";
			//timezoneOffset = $rootScope.serverTime.TZ0013; 
		} else {
			timeZone = "TZ004";
		}
		/*if(timeZone !== 'TZ004'){
			var serverDateTime = new Date($rootScope.appointmentServerDateTime);
			serverDateTime = $filter('date')(new Date(serverDateTime), 'MM/dd/yyyy HH:mm');
			newServerDateTime = calcTime(serverDateTime, $rootScope.serverTime.serverTimezoneOffet, timezoneOffset);
			$rootScope.appointmentServerDateTime = newServerDateTime;
		}
		$timeout(function(){$scope.appointment.timeZone = timeZone;}, 300);*/
		$scope.setAppointmentStartTimeByTimeZone(timeZone);
	};
	if ($state.current.name === 'requestAppointAccordion.request') {
		$scope.setDefaultTimeZone();
		//$scope.setAppointmentStartTimeByTimeZone('TZ004');
		$scope.getriaResponseError = false;
		$scope.appointmentLocation = $scope.appointmentDepartment = '';
	}

	//GetAllRia Account initially loaded.
	$scope.getRiaAccounts = function () {
		appointmentServices.getAllRiaAccounts().then(function (result) {
			if (result.data && result.data.status === 'success') {
				$scope.initialResponseLoading = false;
				if (result.data.successData.apptReqEnabled === true) {
					$scope.isApptReqEnabled = true;
					$scope.RepRiaAccountsSummaryList = {};
					$scope.RepRiaAccountsSummaryList.availableOptions = result.data.successData.RepRiaAccountsSummaryList;
					$scope.RepRiaAccountsSummaryList.selectedOption = '';
					if ($state.params.requestFrom === 'accounts' || $state.params.requestFrom === 'accountDetail') {
						for (var j = 0; j < result.data.successData.RepRiaAccountsSummaryList.length; j++) {
							if (result.data.successData.RepRiaAccountsSummaryList[j].customerOid === $rootScope.accountSelected.customerOid) {
								$scope.RepRiaAccountsSummaryList.selectedOption = result.data.successData.RepRiaAccountsSummaryList[j];
								$scope.getriaCustomerDetails(result.data.successData.RepRiaAccountsSummaryList[j]);
							}
						}
					}
					$scope.contactPhone = result.data.successData.workPhone;
				} else {
					$scope.isApptReqEnabled = false;
				}
			} else {
				$scope.initialResponseLoading = true;
				$scope.isApptReqEnabled = false;
			}
		});
	};

	//Recurring Monthly radio button set InitialValue
	var now_date = new Date(), monthFirstDay, ongoingDay, ongoingDate, ongoingWeekNumber, weekNumberArray;
	monthFirstDay = new Date(now_date.getFullYear(), now_date.getMonth(), 1).getDay();
	ongoingDay = new Date(now_date).getDay();
	ongoingDate = now_date.getDate();
	ongoingWeekNumber = Math.ceil((ongoingDate + monthFirstDay) / 7);
	if ((monthFirstDay - ongoingDay) > 0) {
		ongoingWeekNumber = ongoingWeekNumber - 1;
	}
	weekNumberArray = { "1": "FIRST", "2": "SECOND", "3": "THIRD", "4": "FOURTH", "5": "LAST" };

	//Get getRIARepRequestCustomerDetailsProcess Based on user Selected account value.
	$scope.getriaCustomerDetails = function (param) {
		var accountObject = param !== '' && angular.isDefined ? angular.fromJson(param) : '', customerOid, requestParams, response;
		$scope.appointmentFailure = false;
		if (accountObject && $scope.isApptReqEnabled === true) {
			customerOid = accountObject.customerOid;
			$scope.getriaResponseError = false;
			$scope.enableLoading = true; // enable loading and disable drop down
			//$scope.appointmentRegustedStaff = $scope.appointmentLocationOid = $scope.appointmentDepartmentOid = '';
			requestParams = { "customerOid": customerOid };
			appointmentServices.getRIARepRequestCustomerDetailsProcess(requestParams).then(function (result) {
				if (result.data && result.data.status === 'success') {
					response = result.data.successData;
				} else {
					response = result.data.errorData;
				}
				$scope.DepartmentSummaryList = response.DepartmentSummaryList ? response.DepartmentSummaryList : [];
				$scope.LocationSummaryList = response.LocationSummaryList ? response.LocationSummaryList : [];
				if (response.RepRiaBuyersSummaryList) {
					$scope.RepRiaBuyersSummaryList = response.RepRiaBuyersSummaryList;
				}
				else {
					$scope.getriaResponseError = response.ResponseError[0];
				}
				$scope.enableLoading = false;
			});
		}
		else {
			$scope.RepRiaBuyersSummaryList = [];
			$scope.DepartmentSummaryList = [];
			$scope.LocationSummaryList = [];
		}
		$scope.appointmentLocation = '';
		$scope.appointmentDepartment = '';
		$scope.appointmentRequestedStaff = '';
		$timeout(function () {
			angular.element('.validation-invalid').remove();
		});
	};

	//Get Server time Value
	$scope.getCurrentDate = function () {
		var currentDate = new Date($rootScope.appointmentServerDateTime);
		currentDate = $filter('date')(currentDate, 'MM/dd/yyyy');
		return currentDate;
	};

	$scope.openRecurring = function () {
		$scope.isRecurringOpen = $modal.open({
			templateUrl: 'views/repRequestAppointment/recurringAppointment.html?rnd=' + appCon.globalCon.deployDate,
			scope: $scope,
			keyboard: false,
			backdrop: 'static',
			controller: function ($scope, $modalInstance, $state) {
				$scope.closeRecurringPopup = function () {
					$scope.recurringAppt.startDate = selectedStartDate;
					$scope.recurringAppt.endDate = selectedEndDate;
					if (angular.isDefined(selectedRepet) && angular.isDefined($scope.recurringAppt.repeats) && selectedRepet !== '' && selectedRepet !== $scope.recurringAppt.repeats) {
						$scope.recurringAppt.repeats = selectedRepet;
					}
					if ($rootScope.appointmentIsRecurring !== true && !angular.isDefined($rootScope.recurringAppt.summaryStr)) {
						$scope.appointment.recurring = 'oneTime';
					}
					$modalInstance.close();
				}
			}
		});
	};

	$scope.setIncreasedSummery = function (value) {
		var increadedDate = new Date(value);
		increadedDate = increadedDate.setDate(increadedDate.getDate() + 1)
		return ($filter('date')(increadedDate, 'MMM dd, yyyy'));
	};

	//Open Recurring appointmentPopup
	$scope.openRecurringPopup = function (isFrom) {
		if (isFrom === 'new' && (!angular.isDefined($rootScope.recurringAppt) || !angular.isDefined($rootScope.recurringAppt.summaryStr))) {
			var recurringAppointmentStartDate;
			recurringAppointmentStartDate = new Date($scope.appointment.startDate);
			recurringAppointmentStartDate.setDate(recurringAppointmentStartDate.getDate());
			recurringAppointmentStartDate = $filter('date')(recurringAppointmentStartDate, 'MM/dd/yyyy');
			$scope.recurringAppointmentStartDate = recurringAppointmentStartDate;
			$scope.recurringAppointmentEndDate = recurringAppointmentStartDate;
			$scope.recurringStartDate = $filter('date')(new Date($scope.recurringAppointmentStartDate), "MMM dd, yyyy");
			$scope.recurringEndDate = $filter('date')(new Date($scope.recurringAppointmentEndDate), "MMM dd, yyyy");
			$rootScope.setRecurringEndDateSummaryStr = $scope.recurringEndDate;
			$scope.setRecurringAppointmentStartTime();
			$scope.openRecurring();
			$rootScope.recurringAppt = [];
			$scope.recurringAppt.every = 1;
			$scope.recurringAppt.repeats = 'DAILY';
			$scope.recurringAppt.startDate = $scope.recurringAppointmentStartDate;
			$scope.recurringAppt.endDate = $scope.recurringAppointmentEndDate;
			selectedStartDate = $scope.recurringAppointmentStartDate;
			selectedEndDate = $scope.recurringAppointmentEndDate;
		} else if (isFrom === 'edit') {
			$scope.openRecurring();
			if ($scope.recurringAppt.repeats && $scope.recurringAppt.repeats === 'DAILY') {
			} else if ($scope.recurringAppt.repeats && $scope.recurringAppt.repeats === 'WEEKDAYSONLY') {
				$scope.recurringAppt.every = $rootScope.recurringAppt.every;
				$scope.recurringAppt.repeats = $rootScope.recurringAppt.repeats;
				var weekByDay = $rootScope.recurringAppt.byDay.split(",");
				for (var i = 0; i < weekByDay.length; i++) {
					if (weekByDay[i] === 'Monday') {
						$rootScope.recurringAppt.weekdaysMonday = true;
					}
					if (weekByDay[i] === 'Tuesday') {
						$rootScope.recurringAppt.weekdaysTuesday = true;
					}
					if (weekByDay[i] === 'Wednesday') {
						$rootScope.recurringAppt.weekdaysWednesday = true;
					}
					if (weekByDay[i] === 'Thursday') {
						$rootScope.recurringAppt.weekdaysThursday = true;
					}
					if (weekByDay[i] === 'Friday') {
						$rootScope.recurringAppt.weekdaysFriday = true;
					}
				}
			} else if ($scope.recurringAppt.repeats && $scope.recurringAppt.repeats === 'WEEKLY') {
				$scope.recurringAppt.every = $rootScope.recurringAppt.every;
				$scope.recurringAppt.repeats = $rootScope.recurringAppt.repeats;
				var weekByDay = $rootScope.recurringAppt.byDay.split(",");
				for (var i = 0; i < weekByDay.length; i++) {
					if (weekByDay[i] === 'Sunday') {
						$rootScope.recurringAppt.weeklySunday = true;
					}
					if (weekByDay[i] === 'Monday') {
						$rootScope.recurringAppt.weeklyMonday = true;
					}
					if (weekByDay[i] === 'Tuesday') {
						$rootScope.recurringAppt.weeklyTuesday = true;
					}
					if (weekByDay[i] === 'Wednesday') {
						$rootScope.recurringAppt.weeklyWednesday = true;
					}
					if (weekByDay[i] === 'Thursday') {
						$rootScope.recurringAppt.weeklyThursday = true;
					}
					if (weekByDay[i] === 'Friday') {
						$rootScope.recurringAppt.weeklyFriday = true;
					}
					if (weekByDay[i] === 'Saturday') {
						$rootScope.recurringAppt.weeklySaturday = true;
					}
				}
			} else if ($scope.recurringAppt.repeats && $scope.recurringAppt.repeats === 'MONTHLY') {
				$scope.recurringAppt.monthByWeekAndDate = $rootScope.recurringAppt.monthByWeekAndDateSelected;
				if ($rootScope.recurringAppt.monthByWeekAndDateSelected === 'dm') {
					$scope.recurringAppt.everyMonth = now_date.format("dddd");
					$scope.recurringAppt.monthDays = weekNumberArray[ongoingWeekNumber]
					$scope.recurringAppt.monthOnDays = $rootScope.recurringAppt.byMonthDayStr;
				} else if ($rootScope.recurringAppt.monthByWeekAndDateSelected === 'dw') {
					$scope.recurringAppt.everyMonth = $rootScope.recurringAppt.byDay;
					$scope.recurringAppt.monthDays = $rootScope.recurringAppt.byDayNumberStr;
					$scope.recurringAppt.monthOnDays = ongoingDate;
				}
			}
			$scope.recurringAppt.every = $rootScope.recurringAppt.every;
			$scope.recurringAppt.repeats = $rootScope.recurringAppt.repeats;
			var startDate = new Date($rootScope.recurringAppt.recurringStartDate);
			$scope.recurringStartDate = $filter('date')(new Date($rootScope.recurringAppt.recurringStartDate), "MMM dd, yyyy");
			if (($scope.appointment.recurringEndTime).indexOf("N") !== -1) {
				$scope.recurringEndDate = $scope.setIncreasedSummery(selectedEndDate);
			} else {
				$scope.recurringEndDate = $filter('date')(new Date(selectedEndDate), "MMM dd, yyyy");
			}
			$scope.recurringAppt.startDate = selectedStartDate;
			$scope.recurringAppt.endDate = selectedEndDate;
		}
	};

	$scope.loadInitDetails = function (isFrom) {
		var isFrom = angular.isDefined(isFrom) ? isFrom : '';
		var recurringAppointmentStartDate;
		recurringAppointmentStartDate = new Date($rootScope.appointmentServerDateTime);
		recurringAppointmentStartDate.setDate(recurringAppointmentStartDate.getDate());
		recurringAppointmentStartDate = $filter('date')(new Date(recurringAppointmentStartDate), 'MM/dd/yyyy');
		$scope.recurringAppointmentStartDate = recurringAppointmentStartDate;
		$scope.recurringAppointmentEndDate = recurringAppointmentStartDate;
		$scope.recurringAppt.startDate = $scope.recurringAppointmentStartDate;
		$scope.recurringAppt.endDate = $scope.recurringAppointmentEndDate;
		$scope.recurringStartDate = $filter('date')(new Date($scope.recurringAppointmentStartDate), 'MMM dd, yyyy');
		if (($scope.appointment.recurringEndTime).indexOf("N") !== -1) {
			$rootScope.setRecurringEndDateSummaryStr = $scope.setIncreasedSummery($scope.recurringAppointmentEndDate);
			$scope.recurringEndDate = $scope.setIncreasedSummery($scope.recurringAppointmentEndDate);
		} else {
			$scope.recurringEndDate = $filter('date')(new Date($scope.recurringAppointmentEndDate), 'MMM dd, yyyy');
		}
		var maxDate = new Date();
		maxDate.setYear(maxDate.getFullYear() + 1);
		maxDate.setDate(maxDate.getDate() - 1)
		$scope.maxDate = maxDate;
		if (isFrom === 'DAILY') {
		} else if (isFrom === 'WEEKDAYSONLY') {
			$scope.defaultDays = [1, 2, 3, 4, 5];
			$scope.recurringAppt.weekdaysMonday = true;
			$scope.recurringAppt.weekdaysTuesday = true;
			$scope.recurringAppt.weekdaysWednesday = true;
			$scope.recurringAppt.weekdaysThursday = true;
			$scope.recurringAppt.weekdaysFriday = true;
		} else if (isFrom === 'WEEKLY') {
			var maxDate = new Date($rootScope.appointmentServerDateTime);
			var getDay = maxDate.getDay()
			$scope.defaultDays = [getDay];
			if (getDay === 0) {
				$scope.recurringAppt.weeklySunday = true;
			} else if (getDay === 1) {
				$scope.recurringAppt.weeklyMonday = true;
			} else if (getDay === 2) {
				$scope.recurringAppt.weeklyTuesday = true;
			} else if (getDay === 3) {
				$scope.recurringAppt.weeklyWednesday = true;
			} else if (getDay === 4) {
				$scope.recurringAppt.weeklyThursday = true;
			} else if (getDay === 5) {
				$scope.recurringAppt.weeklyFriday = true;
			} else if (getDay === 6) {
				$scope.recurringAppt.weeklySaturday = true;
			}
		} else if (isFrom === 'MONTHLY') {
			if (!angular.isDefined($rootScope.recurringAppt.summaryStr) || !angular.isDefined($rootScope.recurringAppt.monthByWeekAndDateSelected)) {
				$scope.recurringAppt.everyMonth = now_date.format("dddd");
				$scope.recurringAppt.monthOnDays = ongoingDate;
				$scope.recurringAppt.monthDays = weekNumberArray[ongoingWeekNumber];
				$scope.recurringAppt.monthByWeekAndDate = 'dm';
				$scope.setMonthOnDays(ongoingDate);
			} else {
				$scope.recurringAppt.monthByWeekAndDate = $rootScope.recurringAppt.monthByWeekAndDateSelected;
				if ($rootScope.recurringAppt.monthByWeekAndDateSelected === 'dm') {
					$scope.recurringAppt.everyMonth = now_date.format("dddd");
					$scope.recurringAppt.monthDays = weekNumberArray[ongoingWeekNumber];
					$scope.recurringAppt.monthOnDays = $rootScope.recurringAppt.byMonthDayStr;
					$scope.setMonthOnDays($rootScope.recurringAppt.byMonthDayStr);
				} else if ($rootScope.recurringAppt.monthByWeekAndDateSelected === 'dw') {
					$scope.recurringAppt.everyMonth = $rootScope.recurringAppt.byDay;
					$scope.recurringAppt.monthDays = $rootScope.recurringAppt.byDayNumberStr;
					$scope.recurringAppt.monthOnDays = ongoingDate;
					$scope.setMonthOnDays(ongoingDate);
				}
			}
		} else if (isFrom === 'YEARLY') {
			maxDate.setYear(maxDate.getFullYear() + 1);
			$scope.recurringAppointmentYearStartDate = $filter('date')(new Date($scope.recurringAppointmentStartDate), "MMMM dd");
			$scope.maxDate = maxDate;
		}
	};
	$scope.resetAppointmentStartDateTime = function () {
		var addOneDay;
		addOneDay = new Date($rootScope.appointmentServerDateTime);
		addOneDay.setDate(addOneDay.getDate() + 1);
		addOneDay = dateFormat(addOneDay, "mm/dd/yyyy");
		if (angular.isUndefined($rootScope.apptTimeIsLoaded) || $rootScope.apptTimeIsLoaded === false) {
			$scope.appointment.startDate = addOneDay;
			$scope.loadAppointmentStartDateTime(addOneDay, $scope.appointment.endDate);
			$rootScope.apptTimeIsLoaded = true;
		}
	};

	$scope.loadAppointmentStartDateTime = function (selectDate, endDateObj) {
		$rootScope.apptTimeIsLoaded = false;
		var amPm = "AM", time = "", hours = "", currentHour = 0, serverTime = 0, hour, addOneDay;
		/*var currentDate = new Date($rootScope.appointmentServerDateTime);
		var selectDate = new Date(selectDate);*/
		//currentHour = $filter('date')(new Date(currentDate), 'HH:mm');
		var serverTime = $filter('date')(new Date($rootScope.appointmentServerDateTime), 'HH:mm');

		var currentDate = $filter('date')(new Date($rootScope.appointmentServerDateTime), 'MM/dd/yyyy');
		var selectDate = $filter('date')(new Date(selectDate), 'MM/dd/yyyy');
		if (currentDate === selectDate && serverTime >= "23:45" && (angular.isUndefined($rootScope.apptTimeIsLoaded) || $rootScope.apptTimeIsLoaded !== true)) {
			$scope.resetAppointmentStartDateTime()
			return;
		}
		if (currentDate === selectDate && serverTime >= "23:45") {
			var addOneDay;
			addOneDay = new Date($rootScope.appointmentServerDateTime);
			addOneDay.setDate(addOneDay.getDate() + 1);
			addOneDay = dateFormat(addOneDay, "mm/dd/yyyy");
			$scope.minDate = addOneDay
		}
		if (currentDate === selectDate) {
			currentHour = serverTime.substring(0, 2);
		}
		currentDate = new Date(currentDate);
		selectDate = new Date(selectDate);
		var i = 0;
		for (hour = currentHour; hour < 24; hour++) {
			amPm = (hour >= 12) ? "PM" : "AM";
			hours = (hour > 12) ? Number(Number(hour) - 12) : (hour === 0) ? "12" : hour;
			var j = i;
			for (var min = 0; min < 60; min += 15) {
				var hoursValue = ((Number(hours) < 10) ? "0" : "") + Number(hours) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min) + " " + amPm;
				var timeValue = ((Number(hour) < 10) ? "0" : "") + Number(hour) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min);
				if ((selectDate <= currentDate) && (serverTime < timeValue)) {
					//startTimeObj.add(new Option(hoursValue, timeValue,false,false));
					if (timeValue) {
						startTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j }
					};
					j++;
				} else if (selectDate > currentDate) {
					//startTimeObj.add(new Option(hoursValue, timeValue,false,false));
					if (timeValue) {
						startTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j }
					};
					j++;
				}
			}
			i = j;
		}
		if (angular.isUndefined(endDateObj)) {
			endDateObj = $scope.appointmentEndDate;
		}
		if (angular.isDefined(endDateObj) && new Date(selectDate).valueOf() > new Date(endDateObj).valueOf()) {
			endDateObj = selectDate;
		}
		$scope.appointment.startTime = startTimeObjList[0].timeValue;
		selectDate = $filter('date')(new Date(selectDate), 'MM/dd/yyyy');
		endDateObj = $filter('date')(new Date(endDateObj), 'MM/dd/yyyy');
		$scope.loadAppointmentEndDateTime(selectDate, startTimeObjList[0].timeValue, endDateObj);
		$scope.startTimeObjList = startTimeObjList;
	};

	$scope.loadAppointmentEndDateTime = function (startDateObj, startTimeObj, endDateObj) {
		/*if($scope.appointmentEndDate){
			var endDate = new Date(startDateObj+" "+startTimeObj.timeValue);
			endDate = endDate.Add("h",23);
			endDate = endDate.Add("m",59);
			$scope.appointmentEndDate = endDate;
		}*/
		if (startTimeObj === "23:45" && new Date(endDateObj).valueOf() === new Date(startDateObj).valueOf()) {
			var endDate = new Date(startDateObj);
			endDate = endDate.Add("D", 1);
			endDate = endDate.format("mm/dd/yyyy");
			endDateObj = endDate;
		}
		/*if ($rootScope.actionType === 'thisInstance' || startTimeObj=="00:00" || dateDiff("d",startDateObj,endDateObj)>1 ){*/
		/*if ($rootScope.actionType === 'thisInstance'){
			endDateObj = startDateObj;
		}*/
		$timeout(function () { $scope.appointment.endDate = endDateObj; }, 300);
		if (new Date(endDateObj).valueOf() === new Date(startDateObj).valueOf()) {
			$scope.setAppointmentTime('equal', startTimeObj);// equal date
		} else {
			$scope.setAppointmentTime('greater', startTimeObj);// greater date
		}
	};

	$scope.setAppointmentTime = function (dateStatus, startTimeObj) {
		endTimeObjList = [];
		var hourLimit = "24";
		var currentHour = "";
		var startTime = "";
		var i, j;
		/*var isRecurringAppointment = Dom.get('recurring.addAppointmentForm.recurringStatus');
		var isParentOid = Dom.get('recurring.addAppointmentForm.parentAppointmentOid');*/
		if (startTimeObj) {
			startTime = startTimeObj;
			currentHour = startTime.split(":")[0];
			//endTimeObj.options.length=0;
		}

		if (dateStatus === "greater") {
			currentHour = "0";
			hourLimit = "24"
		}
		i = 0;
		for (var hour = currentHour; hour < hourLimit; hour++) {
			var amPm = (hour >= 12) ? "PM" : "AM";
			var hours = (hour > 12) ? Number(Number(hour) - 12) : (hour === 0) ? "12" : hour;
			j = i;
			for (var min = 0; min < 60; min += 15) {
				var hoursValue = ((Number(hours) < 10) ? "0" : "") + Number(hours) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min) + " " + amPm;
				var timeValue = ((Number(hour) < 10) ? "0" : "") + Number(hour) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min);
				if (dateStatus === "greater") {// && (timeValue<startTime || timeValue === "00:00"))
					//var appointmentActionTypeObj = Dom.get('recurring.addAppointmentForm.appointmentActionType');
					//if (((appointmentActionTypeObj && appointmentActionTypeObj.value === "thisInstance") || (isParentOid && isParentOid.value !== '' && isRecurringAppointment && isRecurringAppointment.value === 'false')) && timeValue<startTime ){
					if (timeValue < startTime) {
						//endTimeObj.add(new Option(hoursValue, timeValue));
						endTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j };
						j++;
						//}else if (appointmentActionTypeObj && appointmentActionTypeObj.value !== "thisInstance" && isParentOid && isParentOid.value === ''){
					} else {
						//endTimeObj.add(new Option(hoursValue, timeValue));
						endTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j };
						j++;
					}
				} else if (dateStatus === "equal" && timeValue > startTime) {
					//endTimeObj.add(new Option(hoursValue, timeValue));
					endTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j };
					j++;
				}
				i = j;
			}
		}
		$scope.endTimeObjList = endTimeObjList;
		$scope.appointment.endTime = endTimeObjList[0].timeValue;
	};

	$scope.setRecurringAppointmentStartTime = function () {
		var timeFormat = "24", amPm = "", hour, hours = "", i = 0, j, k, hoursValue, timeValue, min;
		for (hour = 0; hour < timeFormat; hour++) {
			amPm = (hour >= 12) ? "PM" : "AM";
			hours = (hour > 12) ? Number(Number(hour) - 12) : (hour === 0) ? "12" : hour;
			j = i;
			for (min = 0; min < 60; min += 15) {
				hoursValue = ((Number(hours) < 10) ? "0" : "") + Number(hours) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min) + " " + amPm;
				timeValue = ((Number(hour) < 10) ? "0" : "") + Number(hour) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min);
				//timeObj.add(new Option(hoursValue, timeValue));
				recurringStartTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j };
				j++;
			}
			i = j;
		}
		var currentDate = new Date($rootScope.appointmentServerDateTime);
		var currentHour = $filter('date')(new Date(currentDate), 'HH:mm');
		$timeout(function () {
			for (k = 0; k < recurringStartTimeObjList.length; k++) {
				if (recurringStartTimeObjList[k].timeValue > currentHour) {
					$scope.appointment.recurringStartTime = recurringStartTimeObjList[k].timeValue;
					$scope.setRecurringAppointmentEndTime(recurringStartTimeObjList[k].timeValue);
					break;
				} else if (currentHour >= "23:45") {
					$scope.appointment.recurringStartTime = "00:00";
					$scope.setRecurringAppointmentEndTime($scope.appointment.recurringStartTime);
					break;
				}
			}
		}, 100);
		$scope.recurringStartTimeObjList = recurringStartTimeObjList;
	};

	$scope.setRecurringAppointmentEndTime = function (currentTime) {
		var amPm = "AM", time = "", hours = "", currentHour = 0, hour, i = 0, j, k = 0, l, todayObj = [], nextDatObj = [], min;
		currentHour = currentTime.substring(0, 2);
		for (hour = currentHour; hour < 24; hour++) {
			amPm = (hour >= 12) ? "PM" : "AM";
			hours = (hour > 12) ? Number(Number(hour) - 12) : (hour === 0) ? "12" : hour;
			j = i;
			for (min = 0; min < 60; min += 15) {
				var hoursValue = ((Number(hours) < 10) ? "0" : "") + Number(hours) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min) + " " + amPm;
				var timeValue = ((Number(hour) < 10) ? "0" : "") + Number(hour) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min);
				if ((currentTime < timeValue)) {
					//recurringEndTime.add(new Option(hoursValue, timeValue));
					todayObj[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j };
					j++;
				}
			}
			i = j;
		}
		for (hour = 0; hour <= currentHour; hour++) {
			amPm = (hour >= 12) ? "PM" : "AM";
			hours = (hour > 12) ? Number(Number(hour) - 12) : (hour === 0) ? "12" : hour;
			l = k;
			for (min = 0; min < 60; min += 15) {
				var hoursValue = ((Number(hours) < 10) ? "0" : "") + Number(hours) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min) + " " + amPm;
				var timeValue = ((Number(hour) < 10) ? "0" : "") + Number(hour) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min);
				if ((currentTime > timeValue)) {
					//recurringEndTime.add(new Option(hoursValue+" (Next Day)", timeValue+"N"));
					nextDatObj[l] = { "hoursValue": hoursValue + " (Next Day)", "timeValue": timeValue + "N", "id": j };
					l++
				}
			}
			k = l
		}
		recurringEndTimeObjList = todayObj.concat(nextDatObj);
		$scope.recurringEndTimeObjList = recurringEndTimeObjList;
		$scope.appointment.recurringEndTime = $scope.recurringEndTimeObjList[0].timeValue;
	};

	$scope.setRecurringEndDate = function (recurringEndTimeValue) {
		if (recurringEndTimeValue.indexOf("N") !== -1) {
			$rootScope.setRecurringEndDateSummaryStr = $scope.setIncreasedSummery($rootScope.recurringAppt.endDate);
			$scope.recurringEndDate = $scope.setIncreasedSummery($rootScope.recurringAppt.endDate);
		} else {
			$scope.recurringEndDate = $filter('date')(new Date($rootScope.recurringAppt.endDate), 'MMM dd, yyyy');
			$rootScope.setRecurringEndDateSummaryStr = $filter('date')(new Date($rootScope.recurringAppt.endDate), 'MMM dd, yyyy');
		}
	};

	$scope.gotoaddAppointment = function () {
		if ($state.params.requestFrom === 'accounts') {
			$state.go('requestAppointAccordion.request', { 'requestFrom': 'accounts' }, { 'reload': true });
		} else if ($state.params.requestFrom === 'accountDetail') {
			$state.go('requestAppointAccordion.request', { 'requestFrom': 'accountDetail' }, { 'reload': true });
		} else {
			$state.go('requestAppointAccordion.request', { 'requestFrom': 'actions' }, { 'reload': true });
		}
	};

	$scope.changeMonthlyDate = function (value) {
		if ($scope.recurringAppt.monthByWeekAndDate !== value || value === 'true') {
			$scope.recurringAppt.startDate = '';
			$scope.recurringAppt.endDate = '';
		}
	};

	$scope.setMonthOnDays = function (value) {
		var dyOfMth = value;
		dyOfMth = ((dyOfMth % 10 === 1 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "st" : ((dyOfMth % 10 === 2 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "nd" : ((dyOfMth % 10 === 3 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "rd" : dyOfMth + "th")));
		$scope.monthOnDays = dyOfMth;
	};

	$scope.saveAppointmentRequest = false;
	$scope.saveAppointment = function () {
		var getAppointmentValues = angular.copy($scope.appointment);
		var params = { "appointmentRequest": getAppointmentValues }, location, department, account;
		//CREDMGR-26373
		//location = $scope.appointmentLocation!== 'other'? angular.fromJson($scope.appointmentLocation) : {'id':'Other Location','oid':'other'};
		location = angular.fromJson($scope.appointmentLocation);
		department = angular.fromJson($scope.appointmentDepartment);
		account = angular.fromJson($scope.RepRiaAccountsSummaryList.selectedOption);
		params['appointmentRequest']['customerName'] = account.customerCompanyName;
		params['appointmentRequest']['customerOid'] = account.customerOid;
		// Vendor rep oid gets from "Requested Staff" Dropdown instead of UserProfile
		params['appointmentRequest']['vendorRepOid'] = account.vendorRepOid;
		params['appointmentRequest']['locationName'] = location.id;
		params['appointmentRequest']['locationOid'] = location.oid;
		params['appointmentRequest']['departmentName'] = department.id;
		params['appointmentRequest']['departmentOid'] = department.oid;
		params['appointmentRequest']['contactPhone'] = $scope.contactPhone;
		//params['appointmentRequest']['timeZone'] = $scope.appointment.timeZone;
		//params['appointmentRequest']['syncCalendar'] 	= "";		
		//params['appointmentRequest']['requestStatus'] = "";
		//params['appointmentRequest']['endDate'] 	= $scope.appointmentEndDate;
		//params['appointmentRequest']['selectDate'] = $scope.appointmentStartDate;
		$scope.saveRequest = $scope.enableSaveReqLoading = true;
		if ($scope.appointment.recurring === "oneTime") {
			params['appointmentRequest']['isReccurAppointment'] = "false";
			params['appointmentRequest']['endTime'] = dateFormat($scope.appointment.endDate + ' ' + $scope.appointment.endTime + ':00', "yyyy-mm-dd HH:MM:00");
			params['appointmentRequest']['startTime'] = dateFormat($scope.appointment.startDate + ' ' + $scope.appointment.startTime + ':00', "yyyy-mm-dd HH:MM:00");
		}
		else if ($scope.appointment.recurring === "recurring") {
			params['appointmentRequest']['isReccurAppointment'] = "true";
			params['appointmentRequest']['interval'] = $scope.recurringAppt.every;
			params['appointmentRequest']['until'] = $scope.recurringAppt.untilStr;
			params['appointmentRequest']['freq'] = $scope.recurringAppt.repeats;
			params['appointmentRequest']['byMonthDay'] = $scope.recurringAppt.byMonthDayStr;
			params['appointmentRequest']['byDay'] = $scope.recurringAppt.byDay;
			params['appointmentRequest']['byDayNumber'] = $scope.recurringAppt.byDayNumberStr;
			if (params['appointmentRequest']["recurringEndTime"].indexOf("N") !== -1) {
				var recurringEndDate = new Date($rootScope.recurringAppt.recurringStartDate);
				recurringEndDate = recurringEndDate.Add("D", 1);
				recurringEndDate = $filter('date')(new Date(recurringEndDate), "MMM dd, yyyy");
				var recurringEndTime = params['appointmentRequest']["recurringEndTime"].substring(0, 5);
			} else {
				var recurringEndDate = $rootScope.recurringAppt.recurringStartDate;
				var recurringEndTime = params['appointmentRequest']["recurringEndTime"];
			}
			var startTimeStr = new Date($rootScope.recurringAppt.recurringStartDate + " " + params['appointmentRequest']["recurringStartTime"]);
			var endTimeStr = new Date(recurringEndDate + " " + recurringEndTime);
			params['appointmentRequest']['startTime'] = $filter('date')(new Date(startTimeStr), "yyyy-MM-dd HH:mm:ss");
			params['appointmentRequest']['endTime'] = $filter('date')(new Date(endTimeStr), "yyyy-MM-dd HH:mm:ss");
		}
		delete (params['appointmentRequest']['recurring']);
		delete (params['appointmentRequest']['endDate']);
		delete (params['appointmentRequest']['startDate']);
		delete (params['appointmentRequest']['recurringStartTime']);
		delete (params['appointmentRequest']['recurringEndTime']);
		appointmentServices.saveAppointmentRequest(params).then(function (result) {
			if (result.data && result.data.status === 'success') {
				$scope.enableSaveReqLoading = false;
				$modal.open({
					templateUrl: 'views/repRequestAppointment/requestAppointmentSuccess.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					scope: $scope
				});
			} else {
				$scope.appointmentFailure = result.data;
				$scope.saveRequest = $scope.enableSaveReqLoading = false;
			}
		});
	};

	$scope.getAppointmentRequestDetails = function (requestId) {
		appCon.data.appointMentDetail = { "requestOid": requestId };
		$state.go('requestAppointAccordion.viewRequest.requestDetails');
	};

	$scope.setAppointmentDetailSummery = function (param) {
		if (param.status === 'success') {
			var detail = angular.copy(param.successData.ApptRequestDetail), summery;
			if (detail.isReccurAppointment === true) {
				var selectedweeklyDays = [];
				var interval = Number(detail.interval);
				var startDate = detail.startTime.split(" ")[0];
				startDate = new Date(startDate.split("-")[1] + "/" + startDate.split("-")[2] + "/" + startDate.split("-")[0]);
				startDate = $filter('date')(startDate, "MMM dd, yyyy");
				var endDate = detail.until.split(" ")[0];
				endDate = new Date(endDate.split("-")[1] + "/" + endDate.split("-")[2] + "/" + endDate.split("-")[0]);
				endDate = $filter('date')(endDate, "MMM dd, yyyy");
				if (detail.freq === "DAILY") {
					if (interval === 1) {
						summery = "Daily, Starts on " + startDate + ", Until " + endDate;
					} else {
						summery = "Every " + interval + " days, Starts on " + startDate + ", Until " + endDate;
					}
				} else if (detail.freq === "WEEKDAYSONLY") {
					selectedweeklyDays = detail.byDay.split(',');
					if (interval === 1 && selectedweeklyDays.length === 5) {
						summery = "Weekly on weekdays Starts on " + startDate + ", Until " + endDate;
					} else if (interval === 1 && selectedweeklyDays.length !== 5) {
						summery = "Weekly on " + detail.byDay + ", Starts on " + startDate + ", Until " + endDate;
					} else if (interval !== 1 && selectedweeklyDays.length === 5) {
						summery = "Every " + interval + " weeks on weekdays Starts on " + startDate + ", Until " + endDate;
					} else if (interval !== 1 && selectedweeklyDays.length !== 5) {
						summery = "Every " + interval + " weeks on " + detail.byDay + " Starts on " + startDate + ", Until " + endDate;
					}
				} else if (detail.freq === "WEEKLY") {
					selectedweeklyDays = detail.byDay.split(',');
					if (interval === 1 && selectedweeklyDays.length === 7) {
						summery = "Weekly on all days, Starts on " + startDate + ", Until " + endDate;
					} else if (interval === 1 && selectedweeklyDays.length !== 7) {
						summery = "Weekly on " + detail.byDay + ", Starts on " + startDate + ", Until " + endDate;
					} else if (interval !== 1 && selectedweeklyDays.length === 7) {
						summery = "Every " + interval + " weeks on all days, Starts on " + startDate + ", Until " + endDate;
					} else if (interval !== 1 && selectedweeklyDays.length !== 7) {
						summery = "Every " + interval + " weeks on " + detail.byDay + ", Starts on " + startDate + ", Until " + endDate;
					}
				} else if (detail.freq === "MONTHLY") {
					if (interval === 1) {
						summery = "Monthly on the ";
					} else {
						summery = "Every " + interval + " months on the ";
					}
					if (detail.byDayNumber) {
						summery += detail.byDayNumber.toLowerCase() + " " + detail.byDay + ", Starts on " + startDate + ", Until " + endDate;
					} else if (detail.byMonthDay) {
						var dyOfMth = detail.byMonthDay;
						dyOfMth = ((dyOfMth % 10 === 1 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "st" : ((dyOfMth % 10 === 2 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "nd" : ((dyOfMth % 10 === 3 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "rd" : dyOfMth + "th")));
						summery += dyOfMth + ", Starts on " + startDate + ", Until " + endDate;
					}
				} else if (detail.freq === "YEARLY") {
					if (interval > 1) {
						summery = "Every " + interval + "years on " + startDate + endDate + " Until " + endDate;
					} else {
						summery = "Annually on, " + startDate + " Starts on " + startDate + " Until " + endDate;
					}
				}
				param.successData.ApptRequestDetail.summery = summery;
			}
		}
		return param;
	};

	$scope.setRecurringDate = function (dateFrom, dateVal, repeats) {
		if (dateFrom === 'startDate') {
			$scope.recurringAppt.endDate = $scope.recurringAppt.endDate !== '' ? new Date($scope.recurringAppt.endDate) : new Date(dateVal);
			$scope.recurringStartDate = $filter('date')(new Date(dateVal), "MMM dd, yyyy");
			if (dateDiff("d", dateVal, $scope.recurringAppt.endDate) < 1 || $scope.recurringAppt.endDate === '') {
				$scope.recurringAppt.endDate = $filter('date')(new Date(dateVal), 'MM/dd/yyyy');
				if (($scope.appointment.recurringEndTime).indexOf("N") !== -1) {
					$scope.recurringEndDate = $scope.setIncreasedSummery($scope.recurringAppt.endDate);
				} else {
					$scope.recurringEndDate = $filter('date')(new Date(dateVal), "MMM dd, yyyy");
				}
			}
			if (repeats === "YEARLY") {
				$scope.recurringAppointmentYearStartDate = $filter('date')(new Date(dateVal), "MMM dd");
			}
		} else if (dateFrom === 'endDate') {
			if (($scope.appointment.recurringEndTime).indexOf("N") !== -1) {
				$scope.recurringEndDate = $scope.setIncreasedSummery(dateVal);
			} else {
				$scope.recurringEndDate = $filter('date')(new Date(dateVal), "MMM dd, yyyy");
			}
		}
	};

	$scope.getAllRecurringAppt = function (recurringAppt, isFrom) {
		selectedStartDate = recurringAppt.startDate;
		selectedEndDate = recurringAppt.endDate;
		selectedRepet = $scope.recurringAppt.repeats;
		if (isFrom === 'popup') {
			$scope.isRecurringOpen.close();
		} else {
			if ($rootScope.actionType === 'following') {
				var startDate = new Date($rootScope.instanceDate.split(" ")[0]);
				var endDate = new Date($rootScope.recurringAppt.untilStr.split(" ")[0]);
				startDate.setDate(startDate.getDate() + 1);
				endDate.setDate(endDate.getDate() + 1);
			} else if ($rootScope.actionType === 'future') {
				var startDate = new Date($rootScope.appointmentStartDate.split(" ")[0]);
				var endDate = new Date($rootScope.recurringAppt.untilStr.split(" ")[0]);
				startDate.setDate(startDate.getDate() + 1);
				endDate.setDate(endDate.getDate() + 1);
			}
			if (recurringAppt.repeats === 'YEARLY') {
				$rootScope.recurringAppointmentYearStartDate = $filter('date')(new Date(startDate), "MMMM dd");
			}
			startDate = $filter('date')(startDate, 'MMM dd, yyyy');
			endDate = $filter('date')(endDate, 'MMM dd, yyyy');
			$scope.recurringStartDate = startDate;
			$scope.recurringEndDate = endDate;
			$rootScope.setRecurringEndDateSummaryStr = endDate;
		}
		$rootScope.recurringAppt = [];
		$rootScope.recurringAppt.summaryStr;
		$rootScope.recurringAppt.every = recurringAppt.every;
		$rootScope.recurringAppt.repeats = recurringAppt.repeats;
		$rootScope.recurringAppt.untilStr = $filter('date')(new Date(recurringAppt.endDate), 'yyyy-MM-dd') + " 00:00:00";
		$rootScope.recurringAppt.recurringStartDate = $scope.recurringStartDate;
		$rootScope.recurringAppt.recurringEndDate = $scope.recurringEndDate;
		$rootScope.recurringAppt.endDate = recurringAppt.endDate;
		$rootScope.recurringAppt.startDate = recurringAppt.startDate;
		if (($scope.appointment.recurringEndTime).indexOf("N") !== -1) {
			$rootScope.setRecurringEndDateSummaryStr = $scope.setIncreasedSummery(recurringAppt.endDate);
			$scope.recurringEndDate = $scope.setIncreasedSummery(recurringAppt.endDate);
		} else {
			$scope.recurringEndDate = $filter('date')(new Date(recurringAppt.endDate), "MMM dd, yyyy");
			$rootScope.setRecurringEndDateSummaryStr = $scope.recurringEndDate;
		}
		if (recurringAppt.repeats && recurringAppt.repeats === 'DAILY') {
			if (recurringAppt.every === 1) {
				$rootScope.recurringAppt.summaryStr = "Daily Starts on " + $scope.recurringStartDate + ", Until ";
			} else {
				$rootScope.recurringAppt.summaryStr = "Every " + recurringAppt.every + " days, Starts on " + $scope.recurringStartDate + ", Until ";
			}
		} else if (recurringAppt.repeats && recurringAppt.repeats === 'WEEKDAYSONLY') {
			if (recurringAppt.every === 1) {
				$rootScope.recurringAppt.summaryStr = "Weekly ";
			} else {
				$rootScope.recurringAppt.summaryStr = "Every " + recurringAppt.every + " weeks ";
			}
			if (recurringAppt.weekdaysMonday === true && recurringAppt.weekdaysTuesday === true && recurringAppt.weekdaysWednesday === true && recurringAppt.weekdaysThursday === true && recurringAppt.weekdaysFriday === true) {
				$rootScope.recurringAppt.summaryStr += "on weekdays,";
				$rootScope.recurringAppt.byDay = "Monday,Tuesday,Wednesday,Thursday,Friday";
				$rootScope.recurringAppt.weekdaysMonday = true;
				$rootScope.recurringAppt.weekdaysTuesday = true;
				$rootScope.recurringAppt.weekdaysWednesday = true;
				$rootScope.recurringAppt.weekdaysThursday = true;
				$rootScope.recurringAppt.weekdaysFriday = true;
			} else if (recurringAppt.weekdaysMonday !== true || recurringAppt.weekdaysTuesday !== true || recurringAppt.weekdaysWednesday !== true || recurringAppt.weekdaysThursday !== true || recurringAppt.weekdaysFriday !== true) {
				$rootScope.recurringAppt.summaryStr += "on, ";
				var weekDayArray = [];
				if (recurringAppt.weekdaysMonday === true) {
					$rootScope.recurringAppt.summaryStr += "Monday, ";
					weekDayArray.push('Monday');
					$rootScope.recurringAppt.weekdaysMonday = true;
				}
				if (recurringAppt.weekdaysTuesday === true) {
					$rootScope.recurringAppt.summaryStr += "Tuesday, ";
					weekDayArray.push('Tuesday');
					$rootScope.recurringAppt.weekdaysTuesday = true;
				}
				if (recurringAppt.weekdaysWednesday === true) {
					$rootScope.recurringAppt.summaryStr += "Wednesday, ";
					weekDayArray.push('Wednesday');
					$rootScope.recurringAppt.weekdaysWednesday = true;
				}
				if (recurringAppt.weekdaysThursday === true) {
					$rootScope.recurringAppt.summaryStr += "Thursday, ";
					weekDayArray.push('Thursday');
					$rootScope.recurringAppt.weekdaysThursday = true;
				}
				if (recurringAppt.weekdaysFriday === true) {
					$rootScope.recurringAppt.summaryStr += "Friday, ";
					weekDayArray.push('Friday');
					$rootScope.recurringAppt.weekdaysFriday = true;
				}
				$rootScope.recurringAppt.byDay = weekDayArray.toString();
			}
			$rootScope.recurringAppt.summaryStr += " Starts on " + $scope.recurringStartDate + ", Until ";
		} else if (recurringAppt.repeats && recurringAppt.repeats === 'WEEKLY') {
			if (recurringAppt.every === 1) {
				$rootScope.recurringAppt.summaryStr = "Weekly ";
			} else {
				$rootScope.recurringAppt.summaryStr = "Every " + recurringAppt.every + " weeks ";
			}
			if (recurringAppt.weeklySunday === true && recurringAppt.weeklyMonday === true && recurringAppt.weeklyTuesday === true && recurringAppt.weeklyWednesday === true && recurringAppt.weeklyThursday === true && recurringAppt.weeklyFriday === true && recurringAppt.weeklySaturday === true) {
				$rootScope.recurringAppt.summaryStr += "on all days,";
				$rootScope.recurringAppt.byDay = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
				$rootScope.recurringAppt.weeklySunday = true;
				$rootScope.recurringAppt.weeklyMonday = true;
				$rootScope.recurringAppt.weeklyTuesday = true;
				$rootScope.recurringAppt.weeklyWednesday = true;
				$rootScope.recurringAppt.weeklyThursday = true;
				$rootScope.recurringAppt.weeklyFriday = true;
				$rootScope.recurringAppt.weeklySaturday = true;
			} else if (recurringAppt.weeklySunday !== true || recurringAppt.weeklyMonday !== true || recurringAppt.weeklyTuesday !== true || recurringAppt.weeklyWednesday !== true || recurringAppt.weeklyThursday !== true || recurringAppt.weeklyFriday !== true || recurringAppt.weeklySaturday !== true) {
				$rootScope.recurringAppt.summaryStr += "on, ";
				var weekDayArray = [];
				if (recurringAppt.weeklySunday === true) {
					$rootScope.recurringAppt.summaryStr += "Sunday, ";
					weekDayArray.push('Sunday');
					$rootScope.recurringAppt.weeklySunday = true;
				}
				if (recurringAppt.weeklyMonday === true) {
					$rootScope.recurringAppt.summaryStr += "Monday, ";
					weekDayArray.push('Monday');
					$rootScope.recurringAppt.weeklyMonday = true;
				}
				if (recurringAppt.weeklyTuesday === true) {
					$rootScope.recurringAppt.summaryStr += "Tuesday, ";
					weekDayArray.push('Tuesday');
					$rootScope.recurringAppt.weeklyTuesday = true;
				}
				if (recurringAppt.weeklyWednesday === true) {
					$rootScope.recurringAppt.summaryStr += "Wednesday, ";
					weekDayArray.push('Wednesday');
					$rootScope.recurringAppt.weeklyWednesday = true;
				}
				if (recurringAppt.weeklyThursday === true) {
					$rootScope.recurringAppt.summaryStr += "Thursday, ";
					weekDayArray.push('Thursday');
					$rootScope.recurringAppt.weeklyThursday = true;
				}
				if (recurringAppt.weeklyFriday === true) {
					$rootScope.recurringAppt.summaryStr += "Friday, ";
					weekDayArray.push('Friday');
					$rootScope.recurringAppt.weeklyFriday = true;
				}
				if (recurringAppt.weeklySaturday === true) {
					$rootScope.recurringAppt.summaryStr += "Saturday, ";
					weekDayArray.push('Saturday');
					$rootScope.recurringAppt.weeklySaturday = true;
				}
				$rootScope.recurringAppt.byDay = weekDayArray.toString();
			}
			$rootScope.recurringAppt.summaryStr += " Starts on " + $scope.recurringStartDate + ", Until ";
		} else if (recurringAppt.repeats && recurringAppt.repeats === 'MONTHLY') {
			if (recurringAppt.every === 1) {
				$rootScope.recurringAppt.summaryStr = "Monthly on the ";
			} else {
				$rootScope.recurringAppt.summaryStr = "Every " + $scope.recurringAppt.every + " months on the ";
			}
			$rootScope.recurringAppt.monthByWeekAndDateSelected = recurringAppt.monthByWeekAndDate;
			if (recurringAppt.monthByWeekAndDate === 'dw') {
				$rootScope.recurringAppt.summaryStr += $filter('lowercase')(recurringAppt.monthDays) + " ";
				$rootScope.recurringAppt.summaryStr += recurringAppt.everyMonth + ", Starts on " + $scope.recurringStartDate + ", Until ";
				$rootScope.recurringAppt.byDayNumberStr = recurringAppt.monthDays;
				$rootScope.recurringAppt.byDay = recurringAppt.everyMonth;
			} else if (recurringAppt.monthByWeekAndDate === 'dm') {
				var dyOfMth = recurringAppt.monthOnDays;
				dyOfMth = ((dyOfMth % 10 === 1 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "st" : ((dyOfMth % 10 === 2 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "nd" : ((dyOfMth % 10 === 3 && (dyOfMth < 4 || dyOfMth > 13)) ? dyOfMth + "rd" : dyOfMth + "th")));
				$rootScope.recurringAppt.summaryStr += dyOfMth + ", Starts on " + $scope.recurringStartDate + ", Until ";
				$rootScope.recurringAppt.byMonthDayStr = recurringAppt.monthOnDays;
			}
		} else if (recurringAppt.repeats && recurringAppt.repeats === 'YEARLY') {
			if (recurringAppt.every > 1) {
				$rootScope.recurringAppt.summaryStr = "Every " + $scope.recurringAppt.every + "years on " + $scope.recurringAppointmentYearStartDate + $scope.recurringStartDate + " Until ";
			} else {
				$rootScope.recurringAppt.summaryStr = "Annually on, " + $scope.recurringAppointmentYearStartDate + " Starts on " + $scope.recurringStartDate + " Until ";
			}
		}
	};

	//Date Picker disable Based on user cheked day value.
	$scope.changePickerDisable = function (param, recurringAppt) {
		$scope.defaultDays = [];
		var dateArray = [];
		$scope.recurringStartDate = '';
		$scope.recurringEndDate = '';
		if (param === 'WEEKLY') {
			if (recurringAppt.weeklySunday) {
				dateArray.push(0);
			}
			if (recurringAppt.weeklyMonday) {
				dateArray.push(1);
			}
			if (recurringAppt.weeklyTuesday) {
				dateArray.push(2);
			}
			if (recurringAppt.weeklyWednesday) {
				dateArray.push(3);
			}
			if (recurringAppt.weeklyThursday) {
				dateArray.push(4);
			}
			if (recurringAppt.weeklyFriday) {
				dateArray.push(5);
			}
			if (recurringAppt.weeklySaturday) {
				dateArray.push(6);
			}
			$scope.defaultDays = dateArray;
		}
		if (param === 'WEEKDAYSONLY') {
			if (recurringAppt.weekdaysMonday) {
				dateArray.push(1);
			}
			if (recurringAppt.weekdaysTuesday) {
				dateArray.push(2);
			}
			if (recurringAppt.weekdaysWednesday) {
				dateArray.push(3);
			}
			if (recurringAppt.weekdaysThursday) {
				dateArray.push(4);
			}
			if (recurringAppt.weekdaysFriday) {
				dateArray.push(5);
			}
			$scope.defaultDays = dateArray;
		}
		$scope.recurringAppt.startDate = '';
		$scope.recurringAppt.endDate = '';
	};
	$scope.disabled = function (date, mode) {
		switch ($scope.recurringAppt.repeats) {
			case 'WEEKLY':
				return mode === 'day' && (($scope.defaultDays.indexOf(date.getDay()) === -1));
				break;

			case 'WEEKDAYSONLY':
				return mode === 'day' && (($scope.defaultDays.indexOf(date.getDay()) === -1));
				break;

			case 'MONTHLY':
				if ($scope.recurringAppt.monthByWeekAndDate === 'dw') {
					var dayOfWeek = $scope.recurringAppt.everyMonth;
					var weekNumberList = { "FIRST": "1", "SECOND": "2", "THIRD": "3", "FOURTH": "4", "LAST": "5" };
					var weekNumber = parseInt(weekNumberList[$scope.recurringAppt.monthDays]);
					var weekDayName = date.format("dddd");
					var firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
					var currentDay = new Date(date).getDay();
					var currentWeekNumber = Math.ceil((date.getDate() + firstDay) / 7);
					var lastWeekNumber = Math.ceil((new Date(date.getFullYear(), date.getMonth(), 0).getDate() + firstDay) / 7);
					if ((firstDay - currentDay) > 0) {
						currentWeekNumber = currentWeekNumber - 1;
					}
					if (weekNumber === currentWeekNumber && weekDayName.toUpperCase() === dayOfWeek.toUpperCase()) {
						var enabledDate = date.getDate();
					}
					if (currentWeekNumber === 4 && weekNumber === 5 && weekDayName.toUpperCase() === dayOfWeek.toUpperCase()) {
						var numberOfDaysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
						var currentDate = Number(date.getDate() + 7);
						if (numberOfDaysInMonth < currentDate) {
							var enabledDate = date.getDate();
						}
					}
					return (mode === 'day' && (date.getDate() !== Number(enabledDate)));
				} else if ($scope.recurringAppt.monthByWeekAndDate === 'dm') {
					return (mode === 'day' && (date.getDate() !== Number($scope.recurringAppt.monthOnDays)));
				} else {
					return (mode === 'day');
				}
				break;

			default:
				return false;
				break;
		}
	};
	$scope.enableStartDatePopup = function () {
		$scope.startDatePopup.opened = true;
	};
	$scope.enableEndDatePopup = function () {
		$scope.endDatePopup.opened = true;
	};
	$scope.startDatePopup = {
		opened: false
	};
	$scope.endDatePopup = {
		opened: false
	};
	$scope.viewApptRequest = function (param) {
		param['requestStatus'] = $scope.appointmentReq.requestStatus;
		return param;
	};

	$scope.appointmentGridResponseFormatter = function (result) {
		return esGridMaxPaginationCount(result, 'totalRecords');
	};

}]);

var dateFormat = function () {
	var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) === "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d: d,
				dd: pad(d),
				ddd: dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m: m + 1,
				mm: pad(m + 1),
				mmm: dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy: String(y).slice(2),
				yyyy: y,
				h: H % 12 || 12,
				hh: pad(H % 12 || 12),
				H: H,
				HH: pad(H),
				M: M,
				MM: pad(M),
				s: s,
				ss: pad(s),
				l: pad(L, 3),
				L: pad(L > 99 ? Math.round(L / 10) : L),
				t: H < 12 ? "a" : "p",
				tt: H < 12 ? "am" : "pm",
				T: H < 12 ? "A" : "P",
				TT: H < 12 ? "AM" : "PM",
				Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};

}();

//Some common format strings
dateFormat.masks = {
	"default": "ddd mmm dd yyyy HH:MM:ss",
	shortDate: "m/d/yy",
	mediumDate: "mmm d, yyyy",
	longDate: "mmmm d, yyyy",
	fullDate: "dddd, mmmm d, yyyy",
	shortTime: "h:MM TT",
	mediumTime: "h:MM:ss TT",
	longTime: "h:MM:ss TT Z",
	isoDate: "yyyy-mm-dd",
	isoTime: "HH:MM:ss",
	isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

//Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

//For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

Date.prototype.Add = function (strInterval, intIncrement) {
	if (
		strInterval !== "M"
		&& strInterval !== "D"
		&& strInterval !== "Y"
		&& strInterval !== "h"
		&& strInterval !== "m"
		&& strInterval !== "uM"
		&& strInterval !== "uD"
		&& strInterval !== "uY"
		&& strInterval !== "uh"
		&& strInterval !== "um"
		&& strInterval !== "us"
	) {
		throw ("DateAdd: Second parameter must be M, D, Y, h, m, uM, uD, uY, uh, um or us");
	}

	if (typeof (intIncrement) !== "number") {
		throw ("DateAdd: Third parameter must be a number");
	}

	switch (strInterval) {
		case "M":
			this.setMonth(parseInt(this.getMonth()) + parseInt(intIncrement));
			break;

		case "D":
			this.setDate(parseInt(this.getDate()) + parseInt(intIncrement));
			break;

		case "Y":
			this.setYear(parseInt(this.getYear()) + parseInt(intIncrement));
			break;

		case "h":
			this.setHours(parseInt(this.getHours()) + parseInt(intIncrement));
			break;

		case "m":
			this.setMinutes(parseInt(this.getMinutes()) + parseInt(intIncrement));
			break;

		case "s":
			this.setSeconds(parseInt(this.getSeconds()) + parseInt(intIncrement));
			break;

		case "uM":
			this.setUTCMonth(parseInt(this.getUTCMonth()) + parseInt(intIncrement));
			break;

		case "uD":
			this.setUTCDate(parseInt(this.getUTCDate()) + parseInt(intIncrement));
			break;

		case "uY":
			this.setUTCFullYear(parseInt(this.getUTCFullYear()) + parseInt(intIncrement));
			break;

		case "uh":
			this.setUTCHours(parseInt(this.getUTCHours()) + parseInt(intIncrement));
			break;

		case "um":
			this.setUTCMinutes(parseInt(this.getUTCMinutes()) + parseInt(intIncrement));
			break;

		case "us":
			this.setUTCSeconds(parseInt(this.getUTCSeconds()) + parseInt(intIncrement));
			break;
	}
	return this;
};

var dateDiff = function (p_Interval, p_Date1, p_Date2, p_FirstDayOfWeek) {
	var vbSunday;
	p_FirstDayOfWeek = (isNaN(p_FirstDayOfWeek) || p_FirstDayOfWeek === 0) ? vbSunday : parseInt(p_FirstDayOfWeek);

	var dt1 = new Date(p_Date1);
	var dt2 = new Date(p_Date2);

	//correct Daylight Savings Ttime (DST)-affected intervals ("d" & bigger)
	if ("h,n,s,ms".indexOf(p_Interval.toLowerCase()) === -1) {
		if (p_Date1.toString().indexOf(":") === -1) { dt1.setUTCHours(0, 0, 0, 0) };	// no time, assume 12am
		if (p_Date2.toString().indexOf(":") === -1) { dt2.setUTCHours(0, 0, 0, 0) };	// no time, assume 12am
	}


	// get ms between UTC dates and make into "difference" date
	var iDiffMS = dt2.valueOf() - dt1.valueOf();
	var dtDiff = new Date(iDiffMS);

	// calc various diffs
	var nYears = dt2.getUTCFullYear() - dt1.getUTCFullYear();
	var nMonths = dt2.getUTCMonth() - dt1.getUTCMonth() + (nYears !== 0 ? nYears * 12 : 0);
	var nQuarters = parseInt(nMonths / 3);

	var nMilliseconds = iDiffMS;
	var nSeconds = parseInt(iDiffMS / 1000);
	var nMinutes = parseInt(nSeconds / 60);
	var nHours = parseInt(nMinutes / 60);
	var nDays = parseInt(nHours / 24);	//now fixed for DST switch days
	var nWeeks = parseInt(nDays / 7);

	/*if(p_Interval.toLowerCase()=='ww'){
			// set dates to 1st & last FirstDayOfWeek
			var offset = Date.DatePart("w", dt1, p_FirstDayOfWeek)-1;
			if(offset){	dt1.setDate(dt1.getDate() +7 -offset);	}
			var offset = Date.DatePart("w", dt2, p_FirstDayOfWeek)-1;
			if(offset){	dt2.setDate(dt2.getDate() -offset);	}
			// recurse to "w" with adjusted dates
			var nCalWeeks = dateDiff("w", dt1, dt2) + 1;
	}*/

	// return difference
	switch (p_Interval.toLowerCase()) {
		case "yyyy": return nYears;
		case "q": return nQuarters;
		case "m": return nMonths;
		case "y": // day of year
		case "d": return nDays;
		case "w": return nWeeks;
		//case "ww":return nCalWeeks; // week of year	
		case "h": return nHours;
		case "n": return nMinutes;
		case "s": return nSeconds;
		case "ms": return nMilliseconds;
		default: return "invalid interval: '" + p_Interval + "'";
	}
};
var calcTime = function (serverDate, serverTimezoneOffset, offset) {
	var d, utc, nd;
	if (offset === undefined) {
		var offset = "0";
	} else {
		offset = Number(offset / 60);
	}
	// create Date object for current location
	d = new Date(serverDate);
	// convert to msec
	// add local time zone offset
	// get UTC time in msec
	utc = d.getTime() + (serverTimezoneOffset * 60000);

	// create new Date object for different city
	// using supplied offset
	nd = new Date(utc + (3600000 * offset));

	// return time as a string
	return nd;
}