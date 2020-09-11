'use strict';
angular.module(appCon.appName).controller('printBadgeController', ['$scope', '$window', '$timeout', '$modal', '$filter', '$injector', '$rootScope', '$location', '$state', '$stateParams', 'Analytics','$controller', function ($scope, $window, $timeout, $modal, $filter, $injector, $rootScope, $location, $state, $stateParams, Analytics, $controller) {

	// Base url configuration 
	var urlIndex = ($location.absUrl()).indexOf('/#/'), baseUrl;
	if (urlIndex !== -1) {
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	} else {
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/" + contextPath + "/");
		baseUrl = baseUrl[0] + "/" + contextPath;
	}

	var printBadgeServices = $injector.get("printBadgeServices");
	var userServices = $injector.get("users");
	var printBadge = [];
	$scope.serviceResponseError = '';
	$scope.reprintBadge = false;
	var startTimeObjList = [], availableAppointment;
	//get server today date

	$scope.setPrintBadgeServerTime = function () {
		var printBadgeForm = document.getElementById("printBadgeForm");
		disableAll(printBadgeForm);
		userServices.getServerDateAndTime().then(function (result) {
			if (result.data && result.data.status === 'success' && result.data.successData.currentTimeZoneDateTime) {
				var currentTimeZoneDateTimeValue, serverDateTime;
				currentTimeZoneDateTimeValue = result.data.successData.currentTimeZoneDateTime;
				serverDateTime = new Date(currentTimeZoneDateTimeValue);
				serverDateTime = $filter('date')(serverDateTime, 'MM/dd/yyyy HH:mm');
				$scope.todayDate = serverDateTime;
				enableAll(printBadgeForm);
			} else {
				enableAll(printBadgeForm);
				$scope.todayDate = new Date($rootScope.serverTime.serverDateTime);
			}
		});
	};
	$scope.setPrintBadgeServerTime();
	//$scope.todayDate = new Date($rootScope.serverTime.serverDateTime);
	//maximum future date 
	var nextday = angular.copy($rootScope.serverTime.serverDateTime);
	nextday.setDate(nextday.getDate() + 1);
	$scope.nextday = nextday;
	//Initial Load Account Drop down
	$scope.enableAppointmentLoad = true;
	printBadgeServices.getPrintBadgeAccountProcess().then(function (result) {
		$scope.enableAppointmentLoad = false;
		if (result.data && result.data.status === 'success') {
			availableAppointment = result.data.successData.RepAppointmentsIdsList ? result.data.successData.RepAppointmentsIdsList : [];
			$scope.appointmentSummaryList = availableAppointment;
			$scope.CustomerSummaryList = { "availableOptions": [], "selectedOption": "" };
			$scope.CustomerSummaryList.availableOptions = result.data.successData.CustomerSummaryList ? result.data.successData.CustomerSummaryList : [];
			$scope.needtoLoadLocation = $scope.needtoLoadDepartment = true;
			if ((angular.isDefined($rootScope.accountSelected) && $stateParams.printBadge === 'accounts' && $rootScope.accountSelected !== '')
				|| (angular.isDefined($rootScope.accountSelected) && $stateParams.printBadge === 'accountDetail' && $rootScope.accountSelected !== '')
				|| (angular.isDefined($rootScope.accountSelected) && $stateParams.clearForAccessFromReps === 'isfromRepDetail' && $rootScope.clearForAccessFromReps !== '')) {
				for (var s = 0, length = $scope.CustomerSummaryList.availableOptions.length; s < length; s++) {
					if ($scope.CustomerSummaryList.availableOptions[s].customerOid === $rootScope.accountSelected.customerOid) {
						$scope.CustomerSummaryList.selectedOption = $scope.CustomerSummaryList.availableOptions[s];
						$scope.printBadge.customerOid = $scope.CustomerSummaryList.availableOptions[s].customerOid;
						$scope.printBadge.companyName = $scope.CustomerSummaryList.availableOptions[s].companyName;
						//$scope.printBadgeAccounts = $scope.CustomerSummaryList.availableOptions[s];
						$scope.printBadge.remoteBadgePrint = $scope.CustomerSummaryList.availableOptions[s].remoteBadgePrint;
					}
				}
				$scope.showAppointMentSummaryList($rootScope.accountSelected.customerOid);
			}
		}
		else {
			$scope.serviceResponseError = result.data.errorData.ResponseError[0].errorCode;
			availableAppointment = [];
		}
	});
	$scope.clearContent = function (isFrom) {
		var printBadgeForm = document.getElementById("printBadgeForm");
		enableAll(printBadgeForm);
		$scope.serviceResponseError = false;
		var customerOid = $scope.printBadge.customerOid;
		$scope.printBadge = {};
		//CREDMGR-26373
		$scope.LocationSummaryList = [];
		$scope.DepartmentSummaryList = [];
		$scope.appointments = '';
		$timeout(function () {
			angular.element('.validation-invalid').remove();
		});
		$scope.startTimeObjList = [];
		if (isFrom === 'action') {
			$scope.reprintBadge = false;
			$scope.CustomerSummaryList.selectedOption = '';
			$scope.printBadge.customerOid = '';
			$scope.printBadge.locationOid = '';
			$scope.printBadge.departmentOid = '';
			$scope.appointmentSummaryList = availableAppointment;
		} else {
			$scope.printBadge.customerOid = customerOid;
			for (var s = 0, length = $scope.CustomerSummaryList.availableOptions.length; s < length; s++) {
				if ($scope.CustomerSummaryList.availableOptions[s].customerOid === $rootScope.accountSelected.customerOid) {
					$scope.printBadge.customerOid = $scope.CustomerSummaryList.availableOptions[s].customerOid;
					$scope.printBadge.companyName = $scope.CustomerSummaryList.availableOptions[s].companyName;
					//$scope.printBadgeAccounts = $scope.CustomerSummaryList.availableOptions[s];
					$scope.CustomerSummaryList.selectedOption = $scope.CustomerSummaryList.availableOptions[s];
					$scope.printBadge.remoteBadgePrint = $scope.CustomerSummaryList.availableOptions[s].remoteBadgePrint;
				}
			}
			var selectedAccounts = _.findIndex($scope.CustomerSummaryList.availableOptions, function (o) { return o.customerOid === $rootScope.accountSelected.customerOid; });
			if (selectedAccounts === -1) {
				$scope.CustomerSummaryList.selectedOption = '';
				$scope.printBadge.customerOid = '';
			}
		}
	};
	$scope.clearPage = function () {
		if ($state.params.printBadge === 'prepareVisit') {
			$state.go('printBadge.prepareForVisit', { 'printBadge': 'prepareVisit' }, { reload: true });
		}
		else if ($state.params.clearForAccess === 'isfromRepDetail') {
			delete ($scope.printBadgeAccounts);
			delete ($scope.appointments);
			delete ($scope.printBadge);
		}
		else {
			$state.go('printBadge.prepareForVisit', {}, { reload: true });
		}
	};
	//show Appointment Based on customerOid 
	$scope.showAppointMentSummaryList = function (customerOid) {
		if (angular.isDefined(availableAppointment) && availableAppointment.length > 0) {
			$scope.appointmentSummaryList = [];
			for (var s = 0, length = availableAppointment.length; s < length; s++) {
				if (availableAppointment[s].customerOid === customerOid) {
					$scope.appointmentSummaryList.push(availableAppointment[s]);
				}
			}
		}
	}
	//change Accounts Drop down
	$scope.changeCustomerOid = function (param) {
		var objParam = param !== null && param !== '' && angular.isDefined(param) ? angular.fromJson(param) : '';
		if (objParam !== '') {
			$scope.needtoLoadLocation = true;
			$scope.needtoLoadDepartment = true;
			$scope.printBadge.customerOid = objParam.customerOid;
			$scope.printBadge.companyName = objParam.companyName;
			$scope.printBadge.remoteBadgePrint = objParam.remoteBadgePrint;
			//Load Appointment depends on Account - CustomerOid
			$scope.showAppointMentSummaryList(objParam.customerOid);
		}
		else {
			$scope.needtoLoadLocation = false;
			$scope.needtoLoadDepartment = false;
			$scope.printBadge.remoteBadgePrint = $scope.printBadge.customerOid = $scope.printBadge.companyName = '';
			$scope.appointmentSummaryList = availableAppointment;
		}
		$scope.printBadge.locationOid = '';
		$scope.printBadge.departmentOid = '';
		$scope.printBadge.timeOfVisit = '';
		$scope.printBadge.buyerFirstName = '';
		$scope.printBadge.buyerTitle = '';
		$scope.printBadge.subject = '';
		$scope.printBadge.dateOfVisit = '';
		$scope.LocationSummaryList = [];
		$scope.DepartmentSummaryList = [];
		//CREDMGR-26373
		//$scope.printBadge.otherLocation = '';
		//$scope.printBadge.locationOtherText = '';
		$scope.serviceResponseError = false;
		$scope.appointments = '';
	};
	//Load location Drop down
	$scope.getCustomerLocationIds = function (param, locOid, locOther) {
		if ($scope.needtoLoadLocation === true) {
			if (param !== '' && angular.isDefined(param)) {
				$scope.enableLocationLoad = true;
				var customerOid = { "customerOid": param };
				printBadgeServices.getCustomerLocationIds(customerOid).then(function (result) {
					$scope.needtoLoadLocation = false;
					$scope.enableLocationLoad = false;
					if (result.data && result.data.status === 'success') {
						$scope.LocationSummaryList = result.data.successData.LocationSummaryList;
						//CREDMGR-26373
						//$scope.LocationSummaryList.push({"oid":"other","id":"Other Location"});
						if (locOid && locOid !== '' && locOid !== undefined) {
							/*if(locOid === 'other'){
								$scope.printBadge.locationOid = locOid;
								$scope.printBadge.locationOtherText = locOther;
							}else{*/
							var index = _.findIndex($scope.LocationSummaryList, function (o) { return o.oid === locOid; })
							$scope.printBadge.locationOid = index !== -1 ? locOid : '';
							//}
						}
					}
					else {
						$scope.LocationSummaryList = [];
						//CREDMGR-26373
						$scope.printBadge.locationOid = '';
						/*$scope.LocationSummaryList.push({"oid":"other","id":"Other Location"});
						if(locOid === 'other'){
							$scope.printBadge.locationOid = locOid;
							$scope.printBadge.locationOtherText = '';
						}else{
							$scope.printBadge.locationOid = '';
						}*/					}
				});
			}
			else {
				//check and assign printBadge.otherLocation
				//CREDMGR-26373
				/*if(angular.isDefined($scope.printBadge.locationOid) && $scope.printBadge.locationOid === 'other' ){
					$scope.printBadge.locationOid = 'other';
				}
				else{
					$scope.printBadge.locationOid = '';
				}*/
				$scope.printBadge.locationOid = '';
			}
		}
	};
	//Load Department Drop down
	$scope.getDepartmentIds = function (param, deptOid) {
		$scope.serviceResponseError = false;
		if ($scope.needtoLoadDepartment === true) {
			$scope.printBadge.departmentOid = '';
			if (param !== '' && angular.isDefined(param)) {
				$scope.enableDepartmentLoad = true;
				var customerOid = { "customerOid": param };
				printBadgeServices.getDepartmentIds(customerOid).then(function (result) {
					$scope.needtoLoadDepartment = false;
					$scope.enableDepartmentLoad = false;
					if (result.data && result.data.status === 'success') {
						$scope.DepartmentSummaryList = result.data.successData.DepartmentSummaryList;
						if (deptOid && deptOid !== '' && deptOid !== undefined) {
							if (deptOid !== 'other') {
								$scope.printBadge.departmentOid = deptOid;
								var index = _.findIndex($scope.DepartmentSummaryList, function (o) { return o.oid === deptOid; })
								$scope.printBadge.departmentOid = index !== -1 ? deptOid : '';
							}
						}
					} else {
						$scope.DepartmentSummaryList = [];
					}
				});
			}
		}
	};
	//Load the Visit Details Based on Appointment 
	$scope.loadAppointmentDetail = function (params) {
		$scope.serviceResponseError = false;
		//CREDMGR-26373
		//$scope.printBadge.locationOtherText = '';
		var appointmentSelect = params !== '' && angular.isDefined(params) ? params : '', request, amPm, startDate, startTimeStr;
		if (appointmentSelect) {
			$scope.enableAppointmentLoad = true;
			request = { 'appointmentOid': appointmentSelect };
			printBadgeServices.getAppointmentDetailsES(request).then(function (result) {
				if (result.data && result.data.status === 'success') {
					var appointment = result.data.successData.AppointmentDetails;
					var startTimeStr = appointment.startTime.split(" ");
					var currentDate = new Date($rootScope.serverTime.serverDateTime);
					var currentDate = $filter('date')(currentDate, 'MM/dd/yyyy');
					startDate = $filter('date')(startTimeStr[0], 'MM/dd/yyyy');
					$scope.LocationSummaryList = [];
					$scope.DepartmentSummaryList = [];
					if (appointment.departmentOid !== 'other') {
						$scope.DepartmentSummaryList.push({ "oid": appointment.departmentOid, "id": appointment.departmentName });
					}
					//CREDMGR-26373
					//$scope.LocationSummaryList.push({"oid":appointment.locationOid,"id":appointment.locationName},{"oid":"other","id":"Other Location"});
					$scope.LocationSummaryList.push({ "oid": appointment.locationOid, "id": appointment.locationName });
					var locationOid = appointment.locationOid;
					$scope.printBadge.buyerFirstName = appointment.buyerFirstName + ' ' + appointment.buyerLastName;;
					$scope.printBadge.buyerTitle = appointment.buyerTitle;
					$scope.printBadge.subject = appointment.subject;
					for (var s = 0, length = $scope.CustomerSummaryList.availableOptions.length; s < length; s++) {
						if ($scope.CustomerSummaryList.availableOptions[s].customerOid === appointment.customerOid) {
							if ($scope.printBadge.customerOid !== appointment.customerOid) {
								//$scope.printBadgeAccounts = $scope.CustomerSummaryList.availableOptions[s];
								$scope.CustomerSummaryList.selectedOption = $scope.CustomerSummaryList.availableOptions[s];
							}
							$scope.printBadge.remoteBadgePrint = $scope.CustomerSummaryList.availableOptions[s].remoteBadgePrint;
						}
					}
					$scope.showAppointMentSummaryList(appointment.customerOid);
					$scope.printBadge.customerOid = appointment.customerOid;
					$scope.printBadge.companyName = appointment.companyName;
					if (new Date(startDate).valueOf() <= new Date(currentDate).valueOf()) {
						$scope.printBadge.dateOfVisit = currentDate;
					} else {
						$scope.printBadge.dateOfVisit = startDate;
					}
					$scope.changeDateOfVisit($scope.printBadge.dateOfVisit, startTimeStr[1].replace(':00', ''), startDate);
					$scope.loadFromAppointment = true;
					$scope.printBadge.locationOid = appointment.locationOid;
					$scope.printBadge.departmentOid = appointment.departmentOid === 'other' ? '' : appointment.departmentOid;
					//CREDMGR-26373
					//$scope.printBadge.locationOtherText = appointment.locationOtherText;
					$scope.enableAppointmentLoad = false;
				}
				else {
					$scope.enableAppointmentLoad = false;
				}
			});
		}
		else {
			$scope.printBadge.timeOfVisit = '';
			$scope.printBadge.buyerFirstName = '';
			$scope.printBadge.buyerTitle = '';
			$scope.printBadge.subject = '';
			$scope.printBadge.dateOfVisit = '';
			$scope.printBadge.locationOid =
				$scope.printBadge.departmentOid = '';
			$scope.LocationSummaryList = [];
			$scope.DepartmentSummaryList = [];
			$scope.startTimeObjList = [];
		}
		$scope.needtoLoadLocation = true;
		$scope.needtoLoadDepartment = true;
	};
	//printBadge request
	$scope.blockingErrorMessage = '';
	$scope.printBadgeRemote = function (param, appointment, printBadgeAccounts) {
		if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
			var downloadPath = 'data/PrintBadge.pdf';
			$window.open(downloadPath, 'popup', 'width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');
			return;
		}
		$scope.serviceResponseError = false;
		$scope.enablePrintbadgeLoad = true;
		var params = {}, failureParams = {}, exportParams, exportUrl, droolsErr, preventPos, proposedTime;
		var objParam = printBadgeAccounts !== '' && angular.isDefined(printBadgeAccounts) ? angular.fromJson(printBadgeAccounts) : '';
		if (objParam !== '') {
			$scope.badgeAccount = objParam.companyName;
			$rootScope.accountDetailsTitleFromPrintBadge = 'Account details for ' + objParam.companyName;
		}
		params['customerOid'] = param['customerOid'];
		params['locationOid'] = param['locationOid'];
		params['departmentOid'] = param['departmentOid'];
		proposedTime = new Date(param['dateOfVisit'] + " " + param['timeOfVisit']);
		proposedTime = dateFormat(proposedTime, "yyyy-mm-dd HH:MM:00");
		params['proposedTime'] = proposedTime + ".000";
		params['visitingContact'] = param['buyerFirstName'];
		params['contactTitle'] = param['buyerTitle'];
		params['purpose'] = param['subject'];
		params['localTime'] = localTimeStamp();
		params['exportType'] = 'pdf';
		//CREDMGR-26373
		var locationOidGA = '#locationOid:' + params.locationOid;
        /*if(params['locationOid'] && params['locationOid'] === 'other'){
			params['locationOtherText'] = param['locationOtherText'];
			locationOidGA = '#locationOid:'+params.locationOid+'#locationOtherText:'+ param['locationOtherText'];
		}else{
			locationOidGA = '#locationOid:'+params.locationOid;
		}*/
		var printBadgeForm = document.getElementById("printBadgeForm");
		disableAll(printBadgeForm);
		var eventObject = {
			"category": "Remote Print Badge",
			"action": "Print Badge",
			"label": "userId:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#customerOid:" + params.customerOid + "#badgeAccount:" + $scope.badgeAccount + locationOidGA + "#departmentOid:" + params.departmentOid + "#proposedTime:" + params.proposedTime + "#visitingContact:" + params.visitingContact + "#contactTitle:" + params.contactTitle + "#purpose:" + params.purpose + "#localTime:" + params.localTime,
			"value": 1
		};
		printBadgeServices.printBadgeRemote(params).then(function (result) {
			var getPrintBadgeURL = document.getElementById('printBadge.iframeSource');
			var getPrintBadgeIframe = document.getElementById('printBadgeIFrame');
			var getPrintBadgeNumber = document.getElementById('printBadge.badgeNumber');
			if (result.data && result.data.status === 'success') {
				if (getPrintBadgeURL && getPrintBadgeIframe && result.data.successData.mimeType && result.data.successData.reportFileName) {
					exportParams = "mimeType=" + result.data.successData.mimetype + "&reportFileName=" + result.data.successData.reportFileName + "&rnd=";
					exportUrl = baseUrl + "/services/getPrintBadgeExport?service=common&operation=getPrintBadgeExport&" + exportParams;
					getPrintBadgeURL.value = exportUrl;
					getPrintBadgeIframe.src = exportUrl + Math.random();
				}
				if (result.data.successData.Message) {
					$scope.serviceResponseError = "<i class='text-danger fa fa-exclamation-triangle'></i>&nbsp;" + result.data.successData.Message;
					eventObject.label += "#badgeSuccessMsg:" + result.data.successData.Message;
				}
				if (getPrintBadgeNumber && result.data.successData.badgeNumber) {
					getPrintBadgeNumber.value = result.data.successData.badgeNumber;
					eventObject.label += "#printBadgeNumber:" + getPrintBadgeNumber.value;
				}
				$scope.reprintBadge = true;
				$scope.enablePrintbadgeLoad = false;
				eventObject.label += '#responseStatus:Success';
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
			} else if (result.data && result.data.status === "error") {
				$scope.blockingErrorMessage = '';
				enableAll(printBadgeForm);
				$scope.enablePrintbadgeLoad = false;
				failureParams['customerOid'] = param['customerOid'];
				var errorCode = result.data.errorData.ResponseError[0].errorCode;
				if (errorCode === '5132' || errorCode === '5142' || errorCode === '5143') {
					printBadgeServices.getVendorRepAccountAutoDocUrl(failureParams).then(function (resultSuccessError) {
						if (resultSuccessError.data && resultSuccessError.data.status === 'success') {
							if (errorCode === '5132') {
								$rootScope.printBadgeRepProfileUrl = resultSuccessError.data.successData.VendorRepAccount.repProfileLoginURL;
								$scope.showErrorMessageFrom = 'Unpaid';
							} else if (errorCode === '5142') {
								$rootScope.printBadgeRepProfileUrl = resultSuccessError.data.successData.VendorRepAccount.repLoginInCompleteRegistrationURL;
								$scope.showErrorMessageFrom = 'expressRegistration';
							} else if (errorCode === '5143') {
								$rootScope.printBadgeRepProfileUrl = resultSuccessError.data.successData.VendorRepAccount.repLoginInCompleteRegistrationURL;
								$scope.showErrorMessageFrom = 'yourRelationship';
							}
							eventObject.label += "#errorCode:" + errorCode + "#errorMessage:" + $scope.showErrorMessageFrom;
							$scope.showAttentionFailurePopup();
						}
					});
				} else if (errorCode === '5186') {
					$scope.serviceResponseError = errorCode.toString();
				} else if (errorCode === '5096') {
					enableAll(printBadgeForm);
					$scope.showErrorMessageFrom = 'droolsErrorMsg';
					droolsErr = result.data.errorData.ResponseError[0].longMessage;
					preventPos = droolsErr.toLowerCase().indexOf("prevent");
					if (preventPos !== -1) {
						droolsErr = droolsErr.substr(preventPos + 8, droolsErr.length);
					}
					$scope.droolsErr = droolsErr;
					eventObject.label += "#errorCode:" + errorCode + "#errorMessage:" + $scope.showErrorMessageFrom + "#droolsErr:" + $scope.droolsErr;
					$scope.showAttentionFailurePopup();
				} else if (errorCode === 'CM_7035') {
					$scope.serviceResponseError = errorCode.toString();
					$scope.blockingErrorMessage = result.data.errorData.ResponseError[0].longMessage;
				} else {
					enableAll(printBadgeForm);
					$scope.serviceResponseError = errorCode.toString();
					var errorMessages = '';
					if (result.data && result.data.errorData && result.data.errorData.ResponseError[0].longMessage) {
						errorMessages = result.data.errorData.ResponseError[0].longMessage;
					}
					eventObject.label += "#errorCode:" + $scope.serviceResponseError + '#errorMessage:' + errorMessages;
				}
				eventObject.value = 0;
				eventObject.label += '#responseStatus:Error';
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
			}
		});
	};
	
	//clearForAccess request
	$scope.clearedForAccess = function (param, appointment, printBadgeAccounts) {
		$scope.serviceResponseError = false;
		var objParam = printBadgeAccounts !== '' && angular.isDefined(printBadgeAccounts) ? angular.fromJson(printBadgeAccounts) : '';
		var params = {}, failureParams = {}, proposedTime;
		if (objParam !== '') {
			$scope.badgeAccount = objParam.companyName;
			$rootScope.accountDetailsTitleFromPrintBadge = 'Account details for ' + objParam.companyName;
		}
		params['customerOid'] = param['customerOid'];
		params['locationOid'] = param['locationOid'];
		params['departmentOid'] = param['departmentOid'];
		proposedTime = new Date(param['dateOfVisit'] + " " + param['timeOfVisit']);
		proposedTime = dateFormat(proposedTime, "yyyy-mm-dd HH:MM:00");
		params['proposedTime'] = proposedTime + ".000";
		params['visitingContact'] = param['buyerFirstName'];
		params['contactTitle'] = param['buyerTitle'];
		params['purpose'] = param['subject'];
		params['localTime'] = localTimeStamp();
		params['exportType'] = 'pdf';
		//CREDMGR-26373
		var locationOidGA = '#locationOid:' + params.locationOid;
		/*if(params['locationOid'] && params['locationOid'] === 'other'){
			params['locationOtherText'] = param['locationOtherText'];
			locationOidGA = '#locationOid:'+params.locationOid+'#locationOtherText:'+ param['locationOtherText'];
		}else{
			locationOidGA = '#locationOid:'+params.locationOid;
		}*/
		$scope.enablePrintbadgeLoad = true;
		var eventObject = {
			"category": "Remote Print Badge",
			"action": "View Access Status",
			"label": "userId:" + $rootScope.userProfile.userId + "#userOid:" + $rootScope.userProfile.id + "#fein:" + $rootScope.userProfile.detail.fein + "#customerOid:" + params.customerOid + "#badgeAccount:" + $scope.badgeAccount + locationOidGA + "#departmentOid:" + params.departmentOid + "#proposedTime:" + params.proposedTime + "#visitingContact:" + params.visitingContact + "#contactTitle:" + params.contactTitle + "#purpose:" + params.purpose,
			"value": 1
		};
		printBadgeServices.checkComplianceProcess(params).then(function (result) {
			if (result.data && result.data.status === 'success') {
				if (angular.isDefined(result.data.successData.VendorRepAccount)) {
					$scope.repAccountDetails = result.data.successData.VendorRepAccount;
				}
				if (result.data.successData && result.data.successData.ResponseError && result.data.successData.ResponseError[0].errorCode) {
					var errorCode = result.data.successData.ResponseError[0].errorCode;
					var droolsErr, preventPos;
					if (errorCode === '5132') {
						$rootScope.printBadgeRepProfileUrl = result.data.successData.VendorRepAccount.repLoginInCompleteRegistrationURL;
						$scope.showErrorMessageFrom = 'Unpaid';
						$scope.showAttentionFailurePopup();
						eventObject.label += '#errorCode:' + errorCode + '#errorMessage:' + $scope.showErrorMessageFrom;
					} else if (errorCode === '5142') {
						$rootScope.printBadgeRepProfileUrl = result.data.successData.VendorRepAccount.repLoginInCompleteRegistrationURL;
						$scope.showErrorMessageFrom = 'expressRegistration';
						$scope.showAttentionFailurePopup();
						eventObject.label += '#errorCode:' + errorCode + '#errorMessage:' + $scope.showErrorMessageFrom;
					} else if (errorCode === '5143') {
						$rootScope.printBadgeRepProfileUrl = result.data.successData.VendorRepAccount.repProfileLoginURL;
						$scope.showErrorMessageFrom = 'yourRelationship';
						$scope.showAttentionFailurePopup();
						eventObject.label += '#errorCode:' + errorCode + '#errorMessage:' + $scope.showErrorMessageFrom;
					} else if (errorCode === '5186') {
						$scope.serviceResponseError = errorCode.toString();
					} else if (errorCode === '5096') {
						$rootScope.printBadgeRepProfileUrl = result.data.successData.VendorRepAccount.autoDocIframeURL;
						$scope.showErrorMessageFrom = 'droolsErrorMsgCompliance';
						droolsErr = result.data.successData.ResponseError[0].longMessage;
						preventPos = droolsErr.toLowerCase().indexOf("prevent");
						if (preventPos !== -1) {
							droolsErr = droolsErr.substr(preventPos + 8, droolsErr.length);
						}
						$scope.droolsErr = droolsErr;
						eventObject.label += '#errorCode:' + errorCode + '#errorMessage:' + $scope.showErrorMessageFrom + '#droolsErr:' + $scope.droolsErr;
						$scope.showAttentionFailurePopup();
					} else {
						$scope.serviceResponseError = errorCode.toString();
						var errorMessages = '';
						if (result.data && result.data.errorData && result.data.errorData.ResponseError[0].longMessage) {
							errorMessages = result.data.errorData.ResponseError[0].longMessage;
						}
						eventObject.label += "#errorCode:" + $scope.serviceResponseError + '#errorMessage:' + errorMessages;
					}
				} else {
					$scope.successMessage = result.data.successData.Message;
					eventObject.label += "#successMessage:" + $scope.successMessage;
					$modal.open({
						templateUrl: 'views/printBadge/attentionPopup.html?rnd=' + appCon.globalCon.deployDate,
						backdrop: 'static',
						keyboard: false,
						scope: $scope
					});
				}
				$scope.enablePrintbadgeLoad = false;
				eventObject.label += '#responseStatus:Success';
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
			} else if (result.data && result.data.status === "error") {
				$scope.enablePrintbadgeLoad = false;
				failureParams['customerOid'] = param['customerOid'];
				var errorCode = result.data.errorData.ResponseError[0].errorCode;
				if (errorCode === '5132' || errorCode === '5142' || errorCode === '5143') {
					printBadgeServices.getVendorRepAccountAutoDocUrl(failureParams).then(function (resultSuccessError) {
						if (resultSuccessError.data && resultSuccessError.data.status === 'success') {
							if (errorCode === '5132') {
								$rootScope.printBadgeRepProfileUrl = resultSuccessError.data.successData.VendorRepAccount.autoLoginExpressRegistrationURL;
								$scope.showErrorMessageFrom = 'Unpaid';
							} else if (errorCode === '5142') {
								$rootScope.printBadgeRepProfileUrl = resultSuccessError.data.successData.VendorRepAccount.repLoginInCompleteRegistrationURL;
								$scope.showErrorMessageFrom = 'expressRegistration';
							} else if (errorCode === '5143') {
								$rootScope.printBadgeRepProfileUrl = resultSuccessError.data.successData.VendorRepAccount.repLoginInCompleteRegistrationURL;
								$scope.showErrorMessageFrom = 'yourRelationship';
							}
							eventObject.label += '#errorCode' + errorCode + '#errorMessage' + $scope.showErrorMessageFrom;
							$scope.showAttentionFailurePopup();
						}
					});
				} else if (errorCode === '5186') {
					$scope.serviceResponseError = errorCode.toString();
				} else if (errorCode === '5096') {
					$scope.showErrorMessageFrom = 'droolsErrorMsgCompliance';
					droolsErr = resultSucc.data.errorData.ResponseError[0].longMessage;
					preventPos = droolsErr.toLowerCase().indexOf("prevent");
					if (preventPos !== -1) {
						droolsErr = droolsErr.substr(preventPos + 8, droolsErr.length);
					}
					$scope.droolsErr = droolsErr;
					eventObject.label += '#errorCode' + errorCode + "#errorMessage:" + $scope.showErrorMessageFrom + '#droolsErr' + $scope.droolsErr;
					$scope.showAttentionFailurePopup();
				} else if (errorCode === 'CM_7035') {
					$scope.serviceResponseError = errorCode.toString();
					$scope.blockingErrorMessage = result.data.errorData.ResponseError[0].longMessage;
				} else {
					$scope.serviceResponseError = errorCode.toString();
					var errorMessages = '';
					if (result.data && result.data.errorData && result.data.errorData.ResponseError[0].longMessage) {
						errorMessages = result.data.errorData.ResponseError[0].longMessage;
					}
					eventObject.label += '#errorCode' + $scope.serviceResponseError + '#errorMessage' + errorMessages;
				}
				$scope.enablePrintbadgeLoad = false;
				eventObject.value = 0;
				eventObject.label += '#responseStatus:Error';
				$rootScope.$emit("callAnalyticsEventTrack", eventObject);
			}
		});
	};
	
	$scope.showAttentionFailurePopup = function () {
		$modal.open({
			templateUrl: 'views/printBadge/attentionFailurePopup.html?rnd=' + appCon.globalCon.deployDate,
			backdrop: 'static',
			keyboard: false,
			scope: $scope,
			controller: function($scope, $state) {
		        $scope.handleFailureNavigation = function() {
			        if(appCon.globalCon.iframe.enabled === 'true') {
			        	if($state.params.clearForAccessFromReps === 'isfromRepDetail'){
		            		$state.go('manage.repAccountDetails.repAccountsTab',({'iframeFrom':'manageAccount'}));
			            } else{
			            	$state.go('accounts.accountDetails',({'fromPrintBadge':'manageAccount'}));
			            }
			        } else{
			            if($state.params.clearForAccessFromReps === 'isfromRepDetail'){
			            	$controller('manageRepController',{$scope:$scope});
			            	$scope.showPendingRegistrationFlow($scope.repAccountDetails);
			            } else{
				            $controller('accountController',{$scope:$scope});
				            $scope.showPendingRegistrationFlow($scope.repAccountDetails);
			            }
			        }
		        };
		    }
		});
	};

	$scope.hideHelpLinkFromAccounts = function (isFrom) {
		if (isFrom === 'action' || isFrom === 'accounts' || isFrom === 'prepareVisit' || isFrom === 'accountDetail') {
			$rootScope.fromAccordion = '';
		}
	};

	$scope.appointmentDetails = function (appointment) {
		if (appointment !== '' && angular.isDefined(appointment)) {
			var appointmentOid = { "appointmentOid": appointment };
			printBadgeServices.getAppointmentDetailsES(appointmentOid).then(function (result) {
				if (result.data && result.data.status === 'success') {
					$scope.printBadge = result.data.successData.AppointmentDetails;
					$scope.printBadge.vistingContact = result.data.successData.AppointmentDetails.buyerFirstName + ' ' + result.data.successData.AppointmentDetails.buyerLastName;
				}
			});
		} else {
			$scope.printBadge = {};
		}
	};
	$scope.loadRePrintBadge = function () {
		var printBadgeIFrameSrc = document.getElementById('printBadge.iframeSource');
		var printBadgeIFrame = document.getElementById('printBadgeIFrame');
		if (printBadgeIFrame && printBadgeIFrameSrc) {
			printBadgeIFrame.src = printBadgeIFrameSrc.value + Math.random();
		}

	};
	$scope.goToDocAndPolicies = function () {
		$state.go('accounts.accountDetails', ({ 'iframeFrom': 'manageAccount' }));
	};
	$scope.changeDateOfVisit = function (dateOfVisit, startTimeStr, apptStartDate) {
		var currentDate = new Date($rootScope.serverTime.serverDateTime);
		var currentTime = new Date($rootScope.serverTime.serverDateTime);
		var currentDate = $filter('date')(currentDate, 'MM/dd/yyyy');
		var currentTime = $filter('date')(currentTime, 'HH:mm');
		var amPm = "AM", hour, time = "", hours = "", currentHour = 0, min;
		if (dateOfVisit === currentDate) {
			currentHour = currentTime.substring(0, 2);
		}
		var i = 0;
		for (hour = currentHour; hour < 24; hour++) {
			amPm = (hour >= 12) ? "PM" : "AM";
			hours = (hour > 12) ? Number(Number(hour) - 12) : (hour === 0) ? "12" : hour;
			var j = i;
			for (min = 0; min < 60; min += 15) {
				var hoursValue = ((Number(hours) < 10) ? "0" : "") + Number(hours) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min) + " " + amPm;
				var timeValue = ((Number(hour) < 10) ? "0" : "") + Number(hour) + ":" + ((Number(min) < 10) ? "0" : "") + Number(min);
				if ((dateOfVisit <= currentDate) && (currentTime <= timeValue)) {
					if (timeValue) {
						startTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j }
					}
					j++;
				} else if (dateOfVisit > currentDate) {
					if (timeValue) {
						startTimeObjList[j] = { "hoursValue": hoursValue, "timeValue": timeValue, "id": j }
					}
					j++;
				}
			}
			i = j;
		}
		$scope.startTimeObjList = startTimeObjList;
		$timeout(function () {
			if (startTimeStr !== '') {
				for (var k = 0, length = startTimeObjList.length; k < length; k++) {
					if (startTimeStr === startTimeObjList[k].timeValue && new Date(apptStartDate).valueOf() >= new Date(currentDate).valueOf()) {
						$scope.printBadge.timeOfVisit = startTimeObjList[k].timeValue;
						return;
					}
				}
				$scope.printBadge.timeOfVisit = startTimeObjList[0].timeValue;
			} else {
				$scope.printBadge.timeOfVisit = startTimeObjList[0].timeValue;
			}
		}, 100);
	};
	$scope.enabledateOfVisitPopup = function () {
		$scope.dateOfVisitPopup.opened = true;
	};
	$scope.dateOfVisitPopup = {
		opened: false
	};

	//google analytics page track
	$scope.callGAPageTrack = function (pageName) {
		Analytics.trackPage("/" + $rootScope.path + "/" + pageName + "/");
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