'use strict';

angular.module(appCon.appName).controller('paymentReceiptController', ['$scope', '$location', '$injector', '$rootScope', '$window', '$filter', '$state', function ($scope, $location, $injector, $rootScope, $window, $filter, $state) {
	var $translate = $filter('translate');
	$scope.loading = false;

	// Base url configuration 
	var urlIndex = ($location.absUrl()).indexOf('/#/'), baseUrl;
	if (urlIndex !== -1) {
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	} else {
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/" + contextPath + "/");
		baseUrl = baseUrl[0] + "/" + contextPath;
	}

	/* Common Functionality*/
	$scope.currentDate = new Date();
	$scope.refreshBtn = function () {
		$scope.currentDate = new Date();
	};

	$scope.showPaymentReceipt = function(oid) {
		if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
			var url = baseUrl + "/docs/paymentReceipt.htm";
			var viewDocWin = $window.open(url, 'View', 'height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes');
			viewDocWin.focus();
		} else {
			var userOid = $rootScope.isFromManageReps ? appCon.data.accountsDetails.userOid : $scope.userProfile.id ;
			var eventObject = {
				'category': 'PAYMENT_RECEIPT',
				'action': 'DOWNLOAD_PAYMENT_RECEIPT',
				'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#userOid:' +userOid + '#paymentReceiptOid:'+ oid,
				'value': 1
			}
			eventObject.label += '#isFrom:'+$state.current.name;
			$scope.loading = true;
			$injector.get('paymentReceiptServices').getPaymentReceiptContent({ oid: oid }).then(function(result) {
				if (result.data.status === 'success') {
					var paymentReceiptBiteArray = new Uint8Array(result.data.successData.paymentReceipt),
						paymentReceiptBlob, paymentReceiptUrl, paymentReceiptWindow;
					paymentReceiptBlob = new Blob([paymentReceiptBiteArray], {
						type: result.data.successData.contentType
					});
					if ($window.navigator && $window.navigator.msSaveOrOpenBlob) {
						$window.navigator.msSaveOrOpenBlob(paymentReceiptBlob, 'PaymentReceipt.html');
					} else {
						paymentReceiptUrl = $window.URL.createObjectURL(paymentReceiptBlob);
						paymentReceiptWindow = $window.open(paymentReceiptUrl, 'View', 'height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes');
						paymentReceiptWindow.document.title = $translate('paymentReceipt.header.paymentReceiptContent');
						paymentReceiptWindow.focus();
					}
				} else {
					$scope.serviceResponseError = result.data.errorData.ResponseError[0].longMessage;
					eventObject.value = 0;
					eventObject.label += '#errorMessage:'+ $scope.serviceResponseError;
				}
				$rootScope.$emit("callAnalyticsController", eventObject);
				$scope.loading = false;
			});
		}
	};
	
	$scope.formatRequest = function(request) {
		request.userOid = $rootScope.isFromManageReps ? appCon.data.accountsDetails.userOid : $scope.userProfile.id ;
		var eventObject = {
			'category': 'PAYMENT_RECEIPT',
			'action': 'GET_PAYMENT_RECEIPT_LANDING',
			'label': 'email:' + $rootScope.userProfile.userId + '#fein:' + $rootScope.userProfile.detail.fein + '#userOid:' + request.userOid,
			'value': 1
		}
		eventObject.label += '#isFrom:'+$state.current.name;
		$rootScope.$emit("callAnalyticsController", eventObject);
		return request;
	};

}]);