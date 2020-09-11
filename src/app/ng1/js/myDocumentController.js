'use strict';
var commonObj = {};
angular.module(appCon.appName).config(function ($provide) {
	$provide.decorator('datepickerPopupDirective', function ($delegate) {
		var directive = $delegate[0];
		var link = directive.link;

		directive.compile = function () {
			return function (scope, element, attrs) {
				link.apply(this, arguments);
				element.mask("99/99/9999");
			};
		};

		return $delegate;
	});

})
	.controller("myDocumentController", ["$scope", "$window", "$rootScope", "$state", "$modal", "$location", "$injector", "$filter", "$uibModalStack", "$timeout", "$templateCache", function ($scope, $window, $rootScope, $state, $modal, $location, $injector, $filter, $uibModalStack, $timeout, $templateCache) {
		/* multiple document checkbox checked & unchecked */

		// Base url configuration 
		var urlIndex = ($location.absUrl()).indexOf('/#/'), baseUrl, showDeleteDocumentsTimeout, getRepComplianceStatusTimeout, userComplianceStatusTimeout;
		if (urlIndex !== -1) {
			baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
		} else {
			var contextPath = ($location.absUrl()).split('/')[3];
			baseUrl = ($location.absUrl()).split("/" + contextPath + "/");
			baseUrl = baseUrl[0] + "/" + contextPath;
		}

		$scope.checkDocumentType = function () {
			$scope.blockElement = appCon.globalCon.providerTemplate;
		};
		$scope.vendormateMobileURL = 'http://www.vendormate.com/mobile';
		$scope.credentialingPlansURL = 'http://www.vendormate.com/services/plans/index.html';
		$scope.trainingCertificationURL = 'http://www.vendormate.com/hospital/training/';
		$scope.backgroundChecksURL = 'http://www.vendormate.com/services/background/index.html';
		$scope.contactPreferencesURL = 'http://www.pages05.net/vendormate/preference/';
		$scope.IsChecked = false;
		$scope.selectedDoc = [];
		$scope.deleteDocumentError = '';
		$scope.documentUpdateError = '';
		$scope.setDocumentValues = function () {
			$rootScope.multiUploadDocDefKey = [];
			$rootScope.multiUploadDocKeyCount = 0;
			$rootScope.multiUploadDocPopup = false;
		};
		$scope.todayDate = new Date();
		$scope.numLimit = '50';
		/* $scope.data ={};
		$scope.data.DocumentDetail ={};
		var docExpirationDateValueCheck = $scope.$watch('data.DocumentDetail.docExpirationDate', function(){
			$scope.data.DocumentDetail.docExpirationDate=$filter('date')(new Date($scope.data.DocumentDetail.docExpirationDate), 'MM/dd/yyyy');
			docExpirationDateValueCheck();
		}); */
		$scope.checkboxCheckUncheck = function (IsChecked, data) {
			if (IsChecked) {
				$scope.selectedDoc.push(data);
			} else {
				var docIndex = $scope.selectedDoc.indexOf(data);
				$scope.selectedDoc.splice(docIndex, 1);
			}
		};
		/*$scope.multipleUplaodDoc = function(selectedDoc) {
			$rootScope.selectedCheckbox = selectedDoc;
			if (selectedDoc.length >= 1) {
				$rootScope.selectedArr = 0;
				$state.go('documents.commonDocuments.commonDialog.documentAlertSteps');
			}
		};
		$scope.multipleUplaodDocSteps = function(select) {
			$rootScope.selectedArr = select + 1;
		};*/

		$scope.commonDocumentsUpdateGetDocValue = function (param) {
			if (param.status === 'success') {
				param.successData.DocumentDetailSummary.docMinimumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMinimumValue, '$', 2);
				param.successData.DocumentDetailSummary.docMaximumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMaximumValue, '$', 2);
			}
			return param;
		};

		$scope.documensUpdateGetDocValue = function (param) {
			if (param.status === 'success') {
				param.successData.DocumentDetailSummary.docMinimumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMinimumValue, '$', 2);
				param.successData.DocumentDetailSummary.docMaximumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMaximumValue, '$', 2);
			}
			return param;
		};

		$scope.documentCautionGetDocValue = function (param) {
			if (param.status === 'success') {
				param.successData.DocumentDetailSummary.docMinimumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMinimumValue, '$', 2);
				param.successData.DocumentDetailSummary.docMaximumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMaximumValue, '$', 2);
			}
			return param;
		};

		$scope.commonDocumentCautionUpdateGetDocValue = function (param) {
			if (param.status === 'success') {
				param.successData.DocumentDetailSummary.docMinimumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMinimumValue, '$', 2);
				param.successData.DocumentDetailSummary.docMaximumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMaximumValue, '$', 2);
			}
			return param;
		};

		$scope.multipleUploadDocUpdateGetDocValue = function (param) {
			if (param.status === 'success') {
				param.successData.DocumentDetailSummary.docMinimumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMinimumValue, '$', 2);
				param.successData.DocumentDetailSummary.docMaximumValue = $filter('currency')(param.successData.DocumentDetailSummary.docMaximumValue, '$', 2);
			}
			return param;
		};
		$scope.convertDollerToNumber = function (value) {
			if (angular.isDefined(value) && value !== '') {
				var amount = angular.copy(value.toString());
				amount = amount.replace(/[$]/g, "");
				amount = amount.replace(/[,]/g, "");
				if (amount.indexOf("(") !== -1) {
					if (amount.indexOf(")") !== -1) {
						amount = amount.replace(/[(]/g, "-");
					}
				}
				amount = amount.replace(/[)]/g, "");
				var dot = amount.indexOf(".");
				if (dot !== -1) {
					var dotArr = amount.split(".");
					if (dotArr.length >= 3) {
						amount = dotArr[0] + "." + dotArr[1];
					}
				}
				value = Number(amount);
			}
			return value;
		};
		$scope.convertNumberToDoller = function (value) {
			if (angular.isDefined(value) && value !== '') {
				var amount = angular.copy(Number(value));
				value = $filter('currency')(amount, '$', 2);
			}
			return value;
		};

		$scope.multipleUplaodDoc = function () {
			var docDefOid, templateName, docType, fromTab;
			$uibModalStack.dismissAll();
			if ($rootScope.multiUploadDocDefKey.length >= 1 && $rootScope.multiUploadDocDefKey.length !== $rootScope.multiUploadDocKeyCount) {
				$rootScope.multiUploadDocDefKey = _.sortBy($rootScope.multiUploadDocDefKey, function (o) { return o.templateName; });
				docDefOid = $rootScope.multiUploadDocDefKey[$rootScope.multiUploadDocKeyCount].docDefOid;
				templateName = $rootScope.multiUploadDocDefKey[$rootScope.multiUploadDocKeyCount].templateName;
				docType = "sharable";
				fromTab = angular.copy(appCon.data['document']['fromTab']);
				appCon.data['document'] = new Array();
				appCon.data['document']['docDefOid'] = docDefOid;
				appCon.data['document']['docType'] = docType;
				appCon.data['document']['fromTab'] = fromTab;
				$rootScope.multiUploadDocKeyCount++;
				$rootScope.multiUploadDocPopup = true;
				$scope.multipleUplaodDoc = $modal.open({
					templateUrl: 'app/ng1/views/myDocuments/multipleUploadDocUpdate.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					keyboard: false,
					windowClass: 'commonDialogW50',
					controller: function ($scope, $modalInstance, $state) {
						if ($rootScope.multiUploadDocKeyCount === $rootScope.multiUploadDocDefKey.length) {
							$scope.saveAndContinue = false
						} else {
							$scope.saveAndContinue = true;
						}
						$scope.hideMultiUploadForm = function () {
							if ($rootScope.isFrom === 'commonDoc') {
								$modalInstance.close();
							} else {
								$uibModalStack.dismissAll();
							}
						}
					}
				});
			} else {
				if ($rootScope.isFrom === 'commonDoc') {
					$state.go('home.documentAlert.commonDocument', { id: 'commonDoc', 'random': $scope.getRandomSpan() }, { 'reload': true });
				} else if (($rootScope.isFromManageReps && $rootScope.isFromAccountDetails) || (!$rootScope.isFromManageReps && $rootScope.isFromAccountDetails)) {
					$uibModalStack.dismissAll();
					$scope.reloadAccDetailInfoAndStateChange();
					$scope.getRepComplianceStatus();
				} else if ($rootScope.isFromManageReps && !$rootScope.isFromAccountDetails) {
					$uibModalStack.dismissAll();
					$scope.reloadAccDetailInfoAndStateChange();
					$scope.documentStatus();
				} else {
					$uibModalStack.dismissAll();
					if (appCon.data['document']['fromTab'] === 'commonDocument') {
						$state.go('documents.commonDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
					} else if (appCon.data['document']['fromTab'] === 'optionalDocument') {
						$state.go('documents.optionalDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
					}
					$scope.documentStatus();
				}
			}
		};

		$scope.returnToList = function () {
			if ($rootScope.isFrom === 'commonDoc') {
				$state.go('home.documentAlert.commonDocument', { id: 'commonDoc' }, { 'reload': true });
			} else if (($rootScope.isFromManageReps && $rootScope.isFromAccountDetails) || (!$rootScope.isFromManageReps && $rootScope.isFromAccountDetails)) {
				$uibModalStack.dismissAll();
				$scope.reloadAccDetailInfoAndStateChange();
				$scope.getRepComplianceStatus();
			} else if ($rootScope.isFromManageReps && !$rootScope.isFromAccountDetails) {
				$uibModalStack.dismissAll();
				$scope.reloadAccDetailInfoAndStateChange();
				$scope.documentStatus();
			} else {
				$uibModalStack.dismissAll();
				if (appCon.data['document']['fromTab'] === 'commonDocument') {
					$state.go('documents.commonDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
				} else if (appCon.data['document']['fromTab'] === 'optionalDocument') {
					$state.go('documents.optionalDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
				}
				$scope.documentStatus();
			}
		};

		$scope.skipDocumentUpdate = function () {
			$scope.multipleUplaodDoc();
		};

		$scope.openWindow = function (url, id) {
			if (!window.focus) return;
			var theWin = window.open(url, id, "left=20,top=20,height=650,width=900,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
			theWin.focus();
		};
		$scope.openWindowSplChar = function (url, id) {
			var contactPreferences = url;
			var firstName = $rootScope.userProfile.firstName;
			var lastName = $rootScope.userProfile.lastName;
			var email = $rootScope.userProfile.userId;
			var legalName = $rootScope.userProfile.detail.legalName;
			var accessurl = contactPreferences + '?email=' + email + '&firstName=' + firstName + '&lastName=' + lastName + '&legalName=' + legalName;
			if (!window.focus) return;
			var theWin = window.open(accessurl, id, "left=20,top=20,height=650,width=900,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
			theWin.focus();
		};
		$scope.viewAccountsDocument = function (templateOid, requiredDocs) {
			if (templateOid) {
				appCon.data['viewAccounts'] = new Array();
				appCon.data['viewAccounts']['templateOid'] = templateOid;
				appCon.data['viewAccounts']['requiredDoc'] = requiredDocs;
				var modalInstance = $modal.open({
					templateUrl: 'app/ng1/views/myDocuments/commonDocumentsAccounts.html?rnd=' + appCon.globalCon.deployDate,
					keyboard: false,
					backdrop: 'static',
					scope: $scope
				});
			}
		};
		$scope.viewComplianceDocument = function (docOid) {
			if (docOid !== '' && docOid !== undefined) {
				if (!window.focus) return;
				if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
					var url = baseUrl + "/img/download.jpg";
				} else {
					var params = "{\"VisionRequest\":{\"docOid\":\"" + docOid + "\"}}";
					var url = baseUrl + "/VMClientProxyServlet?service=common&operation=getDocumentFileView&visionRequest=" + encodeURIComponent(params);
				}
				var viewDocWin = window.open(url, 'View', "height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
				viewDocWin.focus();
			}
		};
		$scope.downloadComplianceDocument = function (docOid) {
			if (docOid !== '' && docOid !== undefined) {
				if (!window.focus) return;
				if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
					var url = baseUrl + "/img/download.jpg";
				} else {
					var params = "{\"VisionRequest\":{\"docOid\":\"" + unescape(docOid) + "\"}}";
					var url = baseUrl + "/VMClientProxyServlet?service=common&operation=getDocumentFileDownload&visionRequest=" + encodeURIComponent(params);
				}
				var downloadDocWin = window.open(url, 'Download', "height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
				downloadDocWin.focus();
			}
		};
		$scope.opencAccountSpecViewAccount = function (accountName, verticalcode) {
			$scope.name = accountName;
			$scope.customerVerticalCode = verticalcode;
			$modal.open({
				templateUrl: 'app/ng1/views/myDocuments/accountSpecificDocumentsAccounts.html?rnd=' + appCon.globalCon.deployDate,
				windowClass: 'commonDialogW30',
				keyboard: false,
				backdrop: 'static',
				scope: $scope,
				controller: function ($scope) {
				}
			});
		};
		$scope.showDeleteDocuments = function (templateName, documentOid, isFrom, type) {
			$scope.companyDocumentEditPermission = '';
			$scope.deleteTempalteName = templateName;
			$scope.deletedocumentOid = documentOid;
			$scope.isFrom = isFrom;
			if ($scope.deletedocumentOid !== '' && $scope.deletedocumentOid !== undefined) {
				if (type === 'OPVC') {
					$injector.get('myDocumentServices')['checkCompanyDocumentEditPermission']().then(function (result) {
						if (result.data.status === 'success') {
							$scope.companyDocumentEditPermission = result.data;
						} else {
							$scope.companyDocumentEditPermission = result.data;
						}
					});
				};
				showDeleteDocumentsTimeout = $timeout(function () {
					$modal.open({
						templateUrl: 'app/ng1/views/myDocuments/commonDocumentsDelete.html?rnd=' + appCon.globalCon.deployDate,
						windowClass: 'commonDialogW60',
						keyboard: false,
						backdrop: 'static',
						scope: $scope,
						controller: function ($scope, $modalInstance, $state) {
							$scope.deleteDocuments = function (documentOid, redirectUrl) {
								var params = {};
								$scope.deleteDocumentLoading = true;
								if (documentOid !== '' && documentOid !== undefined) {
									params['documentOid'] = documentOid;
									params['userOid'] = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
									params['vendorOid'] = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
									$injector.get('myDocumentServices')['deleteDocument'](params).then(function (result) {
										if (result.data.status === 'success') {
											$scope.data = result.data;
											$uibModalStack.dismissAll();
											if ($rootScope.isFromManageReps && !$rootScope.isFromAccountDetails) {
												$scope.reloadAccDetailInfoAndStateChange();
												$scope.documentStatus();
											} else if (($rootScope.isFromManageReps && $rootScope.isFromAccountDetails) || (!$rootScope.isFromManageReps && $rootScope.isFromAccountDetails)) {
												$scope.reloadAccDetailInfoAndStateChange();
												$scope.getRepComplianceStatus();
											} else {
												$uibModalStack.dismissAll();
												$scope.$parent.searchTable();
												$scope.documentStatus();
											}
											$scope.deleteDocumentLoading = false;
										} else {
											$scope.deleteDocumentError = result.data;
											$scope.deleteDocumentLoading = false;
										}
									}, function (error) {
										$scope.data = JSON.parse(handleError(error));
										$scope.deleteDocumentLoading = false;
									});
								}
							};
						}
					});
				}, 500);
			}
		};
		$scope.viewTemplateDocument = function (ownerOid) {
			if (ownerOid !== '' && ownerOid !== undefined) {
				var params = "{\"VisionRequest\":{\"ownerOid\":\"" + ownerOid + "\",\"docType\":\"DTMPL\",\"returnContentType\":\"xml\"}}", url;
				if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
					url = baseUrl + "/img/download.jpg";
				} else {
					url = baseUrl + "/VMClientProxyServlet?service=customers&operation=getCustomerConfigDocByOwnerOid&visionRequest=" + encodeURIComponent(params);
				}
				var downloadDocWin = window.open(url, "fileWindow", "height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
				downloadDocWin.focus();
			}
		};

		$scope.showPolicyAcknowledgementDialog = function (modalHead, modelInfo, redirectState, serviceURL, operationURL, policyParams, modelInfo1) {
			var policy = {};
			$scope.policyDocument = '';
			policy['templateOid'] = policyParams['templateOid'];
			policy['isAcknowledge'] = policyParams['isAcknowledge'];
			policy['docDefOid'] = policyParams['docDefOid'];
			policy['DocumentDetail'] = {};
			policy['DocumentDetail'].userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
			policy['DocumentDetail'].vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
			$modal.open({
				template: commonObj.prepareAppCommonConfirmationDialogContainer,
				keyboard: false,
				backdrop: 'static',
				scope: $scope,
				controller: function ($scope, $modalInstance, $state) {
					$scope.ok = function () {
						$injector.get('myDocumentServices')['savePolicyAcknowlegment'](policy).then(function (result) {
							if (result.data.status === 'success') {
								$scope.data = result.data;
								$modalInstance.close();
								if ($rootScope.isFromAccountDetails) {
									$scope.reloadAccDetailInfoAndStateChange();
								} else {
									$scope.$parent.searchTable();
								}
							}
						}, function (error) {
							$scope.data = JSON.parse(handleError(error));
						});
					};
					$scope.cancel = function () {
						$modalInstance.close();
					};
					$scope.commonConfirmationDialogTitle = modalHead;
					$scope.commonConfirmationDialogContent = modelInfo;
					if (modelInfo1 && modelInfo1 !== '') {
						$scope.commonConfirmationDialogContent1 = modelInfo1;
					}
				}
			});
		};
		commonObj.prepareAppCommonConfirmationDialogContainer = function () {
			var popuDivHtmlContent = '';
			popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-header">';
			popuDivHtmlContent = popuDivHtmlContent + '<button id="complianceCautionCloseIcon" type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="$close()">&times;</button>';
			popuDivHtmlContent = popuDivHtmlContent + '<h3 class="modal-title"><b>{{commonConfirmationDialogTitle}}</b></h3>';
			popuDivHtmlContent = popuDivHtmlContent + '</div>';
			popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-body"><div class="bd"><div style="float:none;">';
			popuDivHtmlContent = popuDivHtmlContent + '<p class="whiteSpacePre" ng-bind-html="commonConfirmationDialogErrorContent | trustAsHtml"></p>';
			popuDivHtmlContent = popuDivHtmlContent + '<p class="marginB2 whiteSpacePre" ng-bind-html="commonConfirmationDialogContent1 | trustAsHtml"></p>';
			popuDivHtmlContent = popuDivHtmlContent + '{{commonConfirmationDialogContent}}';
			popuDivHtmlContent = popuDivHtmlContent + '</div></div>';
			popuDivHtmlContent = popuDivHtmlContent + '<div class="col-lg-12 col-md-12 col-sm-12 text-center">';
			popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-info marginR2" ng-click="ok()">{{"common.yes" | translate}}</button>';
			popuDivHtmlContent = popuDivHtmlContent + '<button class="btn btn-warning marginR1" ng-click="cancel()">{{"common.no" | translate}}</button>';
			popuDivHtmlContent = popuDivHtmlContent + '</div></div>';
			return popuDivHtmlContent;
		};

		//Dynamic load popup content
		$scope.showCautionPopup = function (templateOid, docDefOid, autoAssign, categoryCode, modelHeading, fromTab) {
			var autoAssignable;
			$rootScope.isFrom = '';
			$scope.modelDialogHead = modelHeading;
			$rootScope.multiUploadModelHeading = '';
			if (docDefOid !== '' && docDefOid !== undefined) {
				if (autoAssign === true) {
					autoAssignable = 'sharable';
				} else {
					autoAssignable = 'nonSharable';
				}
				appCon.data['document'] = new Array();
				appCon.data['document']['docDefOid'] = docDefOid;
				appCon.data['document']['templateOid'] = templateOid;
				appCon.data['document']['docType'] = autoAssignable;
				appCon.data['document']['requiredDoc'] = autoAssign;
				appCon.data['document']['categoryCode'] = categoryCode;
				appCon.data['document']['modelHeading'] = modelHeading;
				// Prepare parameter for open multiple upload template to show OPVC sharable missing documents.
				if (angular.isDefined(fromTab)
						&& fromTab !== ''
						&& categoryCode === 'OPVC'
						&& ($rootScope.isFromAccountDetails || $rootScope.isFromManageReps)) {
					appCon.data['document']['fromTab'] = fromTab;
					appCon.data['document']['requiredDoc'] = (fromTab .toLowerCase() === 'commondocument') ? true : false;
				}
				$modal.open({
					templateUrl: 'app/ng1/views/myDocuments/showCautionPopup.html?rnd=' + appCon.globalCon.deployDate,
					keyboard: false,
					backdrop: 'static',
					scope: $scope,
					controller: function ($scope, $modalInstance, $state) {
						$scope.hideCaution = function () {
							$modalInstance.close();
							$scope.uploadDocuments($scope);
						};
						$scope.cancel = function () {
							$modalInstance.close();
						};
					}
				});
			}
		};

		$scope.documentGridReload = function (result) {
			if (result.data && result.data.status === 'success') {
				if ($rootScope.multiUploadDocPopup === true) {
					$scope.multipleUplaodDoc();
				} else {
					if ((appCon.data['document']['fromTab'] === 'commonDocument' || appCon.data['document']['fromTab'] === 'optionalDocument') && (appCon.data['document']['categoryCode'] === 'OPREP'
						 || (appCon.data['document']['categoryCode'] === 'OPVC' && ($rootScope.isFromAccountDetails || $rootScope.isFromManageReps)))) {
							$scope.multiUploadGrid();
					} else {
						if ($rootScope.isFromManageReps && !$rootScope.isFromAccountDetails) {
							$uibModalStack.dismissAll();
							$scope.reloadAccDetailInfoAndStateChange();
							$scope.documentStatus();
						} else if (($rootScope.isFromManageReps && $rootScope.isFromAccountDetails) || (!$rootScope.isFromManageReps && $rootScope.isFromAccountDetails)) {
							$uibModalStack.dismissAll();
							$scope.reloadAccDetailInfoAndStateChange();
							$scope.getRepComplianceStatus();
						} else {
							$uibModalStack.dismissAll();
							$scope.$parent.searchTable();
							$scope.documentStatus();
						}
					}
				}
			}
			else {
				$scope.documentUpdateError = result.data;
			}
			return true;
		};

		//Dynamic load rejected reason details
		$scope.docRejectedReasonDialog = function (title, reason, notes) {
			reason = $filter('escapeSingleQuote')(reason);
			$scope.modal = {};
			$scope.modal.modalHeading = title;
			$scope.modal.modalBodyContent = reason + (notes !== '' ? $filter('translate')("myDocuments.documentsRejectedAdditionalNotes") + notes : '');
			$modal.open({
				templateUrl: 'app/ng1/views/common/moreDialog.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope
			});
		};

		$scope.afterSaveCommonDocumentUpdate = function (result) {
			if ($rootScope.multiUploadDocPopup === true) {
				$scope.multipleUplaodDoc();
			} else {
				if (result.data && result.data.status === 'success') {
					if (appCon.data['document']['requiredDoc'] === true && appCon.data['document']['categoryCode'] === 'OPREP') {
						$scope.multiUploadGrid();
					} else {
						if (appCon.data['document']['isFrom'] === 'commonDocument') {
							if (appCon.data['document']['noOfDocument'] === '1') {
								$uibModalStack.dismissAll();
								$state.go('home', {}, { 'reload': true });
							} else {
								$state.go('home.documentAlert.commonDocument', { id: 'commonDoc', 'random': $scope.getRandomSpan() });
								$scope.documentStatus();
							}
						} else {
							if (appCon.data['document']['noOfDocument'] === '1') {
								$uibModalStack.dismissAll();
								$state.go('home', {}, { 'reload': true });
							} else {
								$state.go('home.documentAlert.specific', { id: 'specificDoc', 'random': $scope.getRandomSpan() });
								$scope.documentStatus();
							}
						}
					}
				} else {
					$scope.documentUpdateError = result.data;
				}
				return true;
			}
		};

		$scope.hideAndReloadMultiUploadPopup = function () {
			if ($rootScope.isFrom === 'commonDoc') {
				$state.go('home.documentAlert.commonDocument', { id: 'commonDoc', 'random': $scope.getRandomSpan() }, { 'reload': true });
			} else if (($rootScope.isFromManageReps && $rootScope.isFromAccountDetails) || (!$rootScope.isFromManageReps && $rootScope.isFromAccountDetails)) {
				$scope.reloadAccDetailInfoAndStateChange();
				$scope.getRepComplianceStatus();
			} else if ($rootScope.isFromManageReps && !$rootScope.isFromAccountDetails) {
				$scope.reloadAccDetailInfoAndStateChange();
				$scope.documentStatus();
			} else {
				if (appCon.data['document']['fromTab'] === 'commonDocument') {
					$state.go('documents.commonDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
				} else if (appCon.data['document']['fromTab'] === 'optionalDocument') {
					$state.go('documents.optionalDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
				}
				$scope.documentStatus();
			}
		};

		$scope.multiUploadGrid = function () {
			$uibModalStack.dismissAll();
			$rootScope.multiUploadModelHeading = appCon.data['document']['modelHeading'];
			$modal.open({
				templateUrl: 'app/ng1/views/myDocuments/multipleUploadDocGrid.html?rnd=' + appCon.globalCon.deployDate,
				keyboard: false,
				backdrop: 'static',
				windowClass: 'commonDialogW60',
				controller: function ($scope, $modalInstance, $state) {
					$scope.hideMultiUploadGrid = function () {
						if ($rootScope.isFrom === 'commonDoc') {
							$modalInstance.close();
						} else {
							$uibModalStack.dismissAll();
						}
					}
				}
			});
		};

		$scope.retainMultiUploadDocument = function (param) {
			if (param.status === 'success') {
				if (angular.isDefined($rootScope.multiUploadDocDefKey)) {
					angular.forEach(param.successData.UserMissingDocumentList, function (value, key) {
						var index = $rootScope.multiUploadDocDefKey.length !== 0 ?
							_.findIndex($rootScope.multiUploadDocDefKey, function (o) { return o.docDefOid === value.docDefOid }) : -1;
						var checked = index !== -1 ? true : false;
						param.successData.UserMissingDocumentList[key].missingDocDefList = checked;
					});
				}
			}
			return param;
		};

		$scope.multiUploadMissingDocument = function (value, docDefOid, templateName) {
			if (value === true) {
				var addDocDef = {
					'docDefOid': docDefOid,
					'templateName': templateName,
				};
				$rootScope.multiUploadDocDefKey.push(addDocDef);
			} else {
				for (var i = 0; i < $rootScope.multiUploadDocDefKey.length; i++) {
					if ($rootScope.multiUploadDocDefKey[i]) {
						if ($rootScope.multiUploadDocDefKey[i].docDefOid === docDefOid) {
							$rootScope.multiUploadDocDefKey.splice(i, 1);
						}
					}
				}
			}
		};

		$scope.loadUploadDocumentForm = function (templateOid, docDefOid, autoAssign, categoryCode, modelHeading, fromTab) {
			var autoAssignable;
			$rootScope.multiUploadDocPopup = false;
			$rootScope.multiUploadModelHeading = '';
			$rootScope.isFrom = '';
			$scope.modelDialogHeading = modelHeading;
			if (docDefOid !== '' && docDefOid !== undefined) {
				if (autoAssign === true) {
					autoAssignable = 'sharable';
				} else {
					autoAssignable = 'nonSharable';
				}
				appCon.data['document'] = new Array();
				appCon.data['document']['docDefOid'] = docDefOid;
				appCon.data['document']['templateOid'] = templateOid;
				appCon.data['document']['docType'] = autoAssignable;
				appCon.data['document']['categoryCode'] = categoryCode;
				appCon.data['document']['modelHeading'] = modelHeading;
				appCon.data['document']['fromTab'] = fromTab;
				if (appCon.data['document']['fromTab'] === 'optionalDocument') {
					appCon.data['document']['requiredDoc'] = false;
				} else {
					appCon.data['document']['requiredDoc'] = autoAssign;
				}
				$scope.loadUploadDocument = $modal.open({
					templateUrl: 'app/ng1/views/myDocuments/commonDocumentsUpdate.html?rnd=' + appCon.globalCon.deployDate,
					backdrop: 'static',
					windowClass: 'commonDialogW50',
					keyboard: false,
					scope: $scope,
					controller: function ($scope, $modalInstance, $state) {
						$scope.cancelmodelDialog = function () {
							$modalInstance.dismiss('cancelmodelDialog');
						};
					}
				});
			}
		};
		$scope.uploadDocuments = function (documentScope) {
			$scope.value = documentScope;
			$rootScope.multiUploadDocPopup = false;
			$scope.modelDialogHeading = $scope.value.modelDialogHead;
			var uploadDocument = $modal.open({
				templateUrl: 'app/ng1/views/myDocuments/commonDocumentsCautionUpdate.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				windowClass: 'commonDialogW50',
				keyboard: false,
				scope: $scope,
				controller: function ($scope, $modalInstance, $state) {
					$scope.cancelmodelDialog = function () {
						$modalInstance.dismiss('cancelmodelDialog');
					};
				}

			});
		};

		$scope.removeDollarFromString = function (value) {
			if (value !== '') {
				value = value.replace(/[$]/g, '');
				value = value.replace(/[,]/g, "");
				if (value.indexOf("(") !== -1) {
					if (value.indexOf(")") !== -1) {
						value = value.replace(/[(]/g, "-");
					}
				}
				value = value.replace(/[)]/g, "");
				var dot = value.indexOf(".");
				if (dot !== -1) {
					var dotArr = value.split(".");
					if (dotArr.length >= 3) {
						value = dotArr[0] + "." + dotArr[1];
					}
				}
				value = value.replace(/[$]/g, '');
				value = value.replace(/[,]/g, "");
				if (value.indexOf("(") !== -1) {
					if (value.indexOf(")") !== -1) {
						value = value.replace(/[(]/g, "-");
					}
				}
				value = value.replace(/[)]/g, "");
				var dot = value.indexOf(".");
				if (dot !== -1) {
					var dotArr = value.split(".");
					if (dotArr.length >= 3) {
						value = dotArr[0] + "." + dotArr[1];
					}
				}
				if (value.length > 15 && value.indexOf(".") >= 13) {
					value = value.substring(0, value.indexOf("."));
				}
			}
			return value;
		};

		$scope.saveCompanyDocumentsFormatter = function (data) {
			var params = {};
			var name = {};
			params['DocumentDetail'] = data.DocumentDetailSummary;
			if (angular.isDefined(params['DocumentDetail'].docMinimumValue)) {
				params['DocumentDetail'].docMinimumValue = $scope.removeDollarFromString(params['DocumentDetail'].docMinimumValue);
			}
			if (angular.isDefined(params['DocumentDetail'].docMaximumValue)) {
				params['DocumentDetail'].docMaximumValue = $scope.removeDollarFromString(params['DocumentDetail'].docMaximumValue);
			}
			params['DocumentDetail'].userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
			params['DocumentDetail'].vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
			if (params['DocumentDetail'].docMongoKey !== '' && params['DocumentDetail'].docMongoKey !== undefined) {
				params['DocumentDetail'].docMongoKey = params['DocumentDetail'].docMongoKey;
			} else {
				if (data.docMongoKey && data.docMongoKey !== undefined && data.docMongoKey.mongoKey && data.docMongoKey.mongoKey !== undefined) {
					params['DocumentDetail'].docMongoKey = data.docMongoKey.mongoKey;
				}
			}
			appCon.data['multiUpload'] = new Array();
			appCon.data['multiUpload']['parentMongoKey'] = params['DocumentDetail'].docMongoKey;
			if (params['DocumentDetail'].docName && params['DocumentDetail'].docName !== '' && params['DocumentDetail'].docName !== undefined) {
				params['name'] = params['DocumentDetail'].docName;
			} else {
				params['name'] = params['DocumentDetail'].templateName;
			}
			params['DocumentDetail'].docEffectiveDate = params['DocumentDetail'].docEffectiveDateString;
			params['DocumentDetail'].docExpirationDate = params['DocumentDetail'].docExpirationDateString;
			params['DocumentDetail'].docDate = params['DocumentDetail'].docDateString;
			params['DocumentDetail'].docSigDate = params['DocumentDetail'].docSigDateString;
			params['DocumentDetail'].docNotorizedDate = params['DocumentDetail'].docNotorizedDateString;
			params['DocumentDetail'].docOutClauseDate = params['DocumentDetail'].docOutClauseDateString;
			delete params['DocumentDetail'].docName;
			delete params['DocumentDetail'].templateName;
			delete params['DocumentDetail'].docEffectiveDateString;
			delete params['DocumentDetail'].docExpirationDateString;
			delete params['DocumentDetail'].docDateString;
			delete params['DocumentDetail'].docSigDateString;
			delete params['DocumentDetail'].docNotorizedDateString;
			delete params['DocumentDetail'].docOutClauseDateString;
			return params;
		};
		$scope.saveMultiUploadDocumentFormatter = function (data) {
			var params = {};
			var name = {};
			params['DocumentDetail'] = data.DocumentDetailSummary;
			if (angular.isDefined(params['DocumentDetail'].docMinimumValue)) {
				params['DocumentDetail'].docMinimumValue = $scope.removeDollarFromString(params['DocumentDetail'].docMinimumValue);
			}
			if (angular.isDefined(params['DocumentDetail'].docMaximumValue)) {
				params['DocumentDetail'].docMaximumValue = $scope.removeDollarFromString(params['DocumentDetail'].docMaximumValue);
			}
			params['DocumentDetail'].userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
			params['DocumentDetail'].vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
			//params['DocumentDetail'].docMongoKey = appCon.data['multiUpload']['parentMongoKey'];
			params['DocumentDetail'].parentMongoKey = appCon.data['multiUpload']['parentMongoKey'];
			if (params['DocumentDetail'].docName && params['DocumentDetail'].docName !== '' && params['DocumentDetail'].docName !== undefined) {
				params['name'] = params['DocumentDetail'].docName;
			} else {
				params['name'] = params['DocumentDetail'].templateName;
			}
			params['DocumentDetail'].docEffectiveDate = params['DocumentDetail'].docEffectiveDateString;
			params['DocumentDetail'].docExpirationDate = params['DocumentDetail'].docExpirationDateString;
			params['DocumentDetail'].docDate = params['DocumentDetail'].docDateString;
			params['DocumentDetail'].docSigDate = params['DocumentDetail'].docSigDateString;
			params['DocumentDetail'].docNotorizedDate = params['DocumentDetail'].docNotorizedDateString;
			params['DocumentDetail'].docOutClauseDate = params['DocumentDetail'].docOutClauseDateString;
			delete params['DocumentDetail'].docName;
			delete params['DocumentDetail'].templateName;
			delete params['DocumentDetail'].docEffectiveDateString;
			delete params['DocumentDetail'].docExpirationDateString;
			delete params['DocumentDetail'].docDateString;
			delete params['DocumentDetail'].docSigDateString;
			delete params['DocumentDetail'].docNotorizedDateString;
			delete params['DocumentDetail'].docOutClauseDateString;
			return params;
		};
		$scope.documentStatus = function () {
			var userComplianceStatusTimeout = $timeout(function () {
				var param = {};
				param.userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
				$injector.get('complianceServices')['getUserComplianceStatus'](param).then(function (result) {
					if (result.data.status === 'success') {
						$rootScope.documentStatusData = result.data;
						$scope.setGlobalDocumentPassed(result.data.successData);
					}
				}, function (error) {
					$scope.data = JSON.parse(handleError(error));
				});
			}, 1000);
		};
		$scope.getRandomSpan = function () {
			return Math.floor((Math.random() * 6) + 1);
		}
		$scope.setStateParmasId = function (id) {
			$rootScope.isFrom = id;
		};
		$scope.multiUploadDocumentCount = function () {
			$uibModalStack.dismissAll();
			if ($rootScope.isFrom === 'commonDoc') {
				if (appCon.data['document']['noOfDocument'] === '1') {
					$uibModalStack.dismissAll();
					$state.go('home', {}, { 'reload': true });
				} else {
					$state.go('home.documentAlert.commonDocument', { id: 'commonDoc', 'random': $scope.getRandomSpan() }, { 'reload': true });
					$scope.documentStatus();
				}
			} else if (($rootScope.isFromManageReps && $rootScope.isFromAccountDetails) || (!$rootScope.isFromManageReps && $rootScope.isFromAccountDetails)) {
				$scope.reloadAccDetailInfoAndStateChange();
				$scope.getRepComplianceStatus();
			} else if ($rootScope.isFromManageReps && !$rootScope.isFromAccountDetails) {
				$scope.reloadAccDetailInfoAndStateChange();
				$scope.documentStatus();
			} else {
				if (appCon.data['document']['fromTab'] === 'commonDocument') {
					$state.go('documents.commonDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
				} else if (appCon.data['document']['fromTab'] === 'optionalDocument') {
					$state.go('documents.optionalDocuments', { 'random': $scope.getRandomSpan() }, { 'reload': true });
				}
				$scope.documentStatus();
			}
		};

		$scope.policyAlertFromHome = function () {
			$state.go('documents');
			$scope.policyisFromHome = true;
		};
		$templateCache.put('myDocumentWhat.html',
			'<span uib-tooltip="What is this credential?" tooltip-append-to-body="true">What?</span>'
		);
		$templateCache.put('myDocumentWhy.html',
			'<span uib-tooltip="Why do I need this credential?" tooltip-append-to-body="true">Why?</span>'
		);
		$templateCache.put('myDocumentHow.html',
			'<span uib-tooltip="How do I fulfill this credential?" tooltip-append-to-body="true">How?</span>'
		);
		$templateCache.put('myDocumentWhere.html',
			'<span uib-tooltip="Where is this credential required?" tooltip-append-to-body="true">Where?</span>'
		);

		// Redirect Nsor registration and renewal detail URL.
		$scope.goToBackgroundCheck = function (nsorObject) {
			if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
				$window.open("https://www.backgroundchecks.com/solutions/vendormate");
			} else {
				var userOid, mail, bcUrl, bcExpired, bcStatus;
				if ((angular.isDefined(nsorObject.nsorDetail.isNsorExpired) && nsorObject.nsorDetail.isNsorExpired !== '') || (angular.isDefined(nsorObject.nsorDetail.isCbcExpired) && nsorObject.nsorDetail.isCbcExpired !== '')) {
					userOid = appCon.data.userDetail.userOid;
					mail = encodeURIComponent(appCon.data.userDetail.userId);
					if (nsorObject.nsorDetail.typeCode === 'CBC') {
						bcExpired = nsorObject.nsorDetail.isCbcExpired;
						bcStatus = angular.lowercase(nsorObject.nsorDetail.cbcStatus);
						bcUrl = (bcExpired || bcStatus === 'pass' || bcStatus === 'fail') ? appCon.globalCon.background.checks.cbcRenewal : appCon.globalCon.background.checks.cbcRegistration;
					} else {
						bcExpired = nsorObject.nsorDetail.isNsorExpired;
						bcStatus = angular.lowercase(nsorObject.nsorDetail.nsorStatus);
						bcUrl = (bcExpired || bcStatus === 'pass' || bcStatus === 'fail') ? appCon.globalCon.background.checks.renewal : appCon.globalCon.background.checks.registration;
					}
					bcUrl += "email=" + mail + "&ReferenceID=" + userOid;
					if (angular.isDefined(nsorObject.isFrom) && nsorObject.isFrom !== '') {
						var isFromGA = '', adminRepEmail = '';
						if (angular.lowercase(nsorObject.isFrom) === 'homealertpopup') {
							$state.go('home');
							$scope.$parent.$close();
							isFromGA = '#isFrom:Home';
						} else if (angular.lowercase(nsorObject.isFrom) === 'accountdetails') {
							isFromGA = '#isFrom:AccountDetails';
						} else {
							isFromGA = '#isFrom:MyDocuments';
						}
						if ($rootScope.isFromManageReps) {
							adminRepEmail = "#adminRep:" + $rootScope.userProfile.userId;
							isFromGA = '#isFrom:ManageRep';
						}
						if (angular.isDefined(bcStatus) && angular.isDefined(bcExpired)) {
							var eventObject = {
								"category": "Documents",
								"action": nsorObject.nsorDetail.typeCode === 'CBC' ? 'CBC' : 'NSOR',
								"label": "repEmail:" + appCon.data.userDetail.userId + "#userOid:" + appCon.data.userDetail.userOid + "#legalName:" + $rootScope.userProfile.detail.legalName + "#fein:" + $rootScope.userProfile.detail.fein + '#customerName:' + nsorObject.nsorDetail.customerNames,
								"value": 1
							};
							if (nsorObject.nsorDetail.typeCode === 'CBC') {
								eventObject.label += '#cbcStatus:' + bcStatus + '#cbcExpired:' + bcExpired;
							} else {
								eventObject.label += '#nsorStatus:' + bcStatus + '#nsorExpired:' + bcExpired;
							}
							eventObject.label += isFromGA + adminRepEmail;
							$rootScope.$emit("callAnalyticsEventTrack", eventObject);
						}
					}
					$window.open(bcUrl);
				}
			}
		};

		var sorDocumentUploadPopup;
		//open uploadSOR Popup
		$scope.uploadSorDocument = function (object, isFrom) {
			if (isFrom === 'accountdetails' && object && object.typeCode === 'NSOR') {
				object.nsorStatus = object.userSORStatus;
				object.isNsorExpired = object.userSORExpired;
			} else if (isFrom === 'accountdetails' && object && object.typeCode === 'CBC') {
				object.isCbcExpired = object.cbcExpired;
			}
			var bcStatus;
			if (object.typeCode === 'CBC') {
				bcStatus = object.cbcStatus;
			} else {
				bcStatus = object.nsorStatus;
			}
			$scope.nsorObject = {
				"nsorDetail": object,
				"isFrom": isFrom,
				"userOid": appCon.data.userDetail.userOid,
				"bcStatus": bcStatus,
				"typeCode": object.typeCode
			};
			if (angular.lowercase(isFrom) === 'homealertpopup') {
				$state.go('home.documentAlert.backgroundCheck.uploadDocument', { 'updateDocument': 'backgroundCheckDoc' });
			} else {
				if ((angular.lowercase(object.typeCode) === 'nsor' && ((angular.lowercase(object.nsorStatus) === 'pass' && !object.isNsorExpired) || (angular.lowercase(object.nsorStatus) === 'fail')))
					|| (angular.lowercase(object.typeCode) === 'cbc' && ((angular.lowercase(object.cbcStatus) === 'pass' && !object.isCbcExpired) || (angular.lowercase(object.cbcStatus) === 'fail')))) {
					$scope.goToBackgroundCheck($scope.nsorObject);
				} else {
					sorDocumentUploadPopup = $modal.open({
						templateUrl: 'app/ng1/views/common/sorDocumentsUpdate.html?rnd=' + appCon.globalCon.deployDate,
						backdrop: 'static',
						keyboard: false,
						scope: $scope
					});
				}
			}
		};

		var cbcInternationalUserCheckPopup;
		var getUserAndRepComplianceStatusTimeout;
		$scope.isCBCInternationalUser = false;
		$scope.enableCBCInternationalUserLoading = false;
		$scope.updateIntlCbcDetailsErrorData = '';
		$rootScope.isInternationalUserPassed = false;
		$scope.enableCBCInternationalUser = function () {
			$scope.enableCBCInternationalUserLoading = true;
			var params = {};
			params['userOid'] = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $rootScope.userProfile.id;
			params['intlRep'] = true;
			params['cbcStatus'] = 'PASS';
			$injector.get('complianceServices')['updateIntlRepDeclaration'](params).then(function (result) {
				$scope.enableCBCInternationalUserLoading = false;
				if (result.data.status === 'success') {
					$scope.isCBCInternationalUser = true;
				}
				if (result.data.errorData) {
					$scope.updateIntlCbcDetailsErrorData = result.data;
				}
			}, function (error) {
				$scope.enableCBCInternationalUserLoading = false;
				$scope.updateIntlCbcDetailsErrorData = JSON.parse(handleError(error));
			});
		};
		$scope.closeCBCInternationalPopup = function (nsorObject) {
			var isFrom = nsorObject.isFrom;
			$scope.enableCBCInternationalUserLoading = true;
			if (angular.lowercase(isFrom) === 'homealertpopup') {
				$state.go('home', {}, {'reload': true});
				$scope.$parent.$close();
				cbcInternationalUserCheckPopup.close();
			} else {
				getUserAndRepComplianceStatusTimeout = $timeout(function () {
					var params = {};
					var getUserComplianceStatusFunctionName = 'getUserComplianceStatus';
					var serviceName = 'complianceServices';
					if ($rootScope.isFromManageReps) {
						getUserComplianceStatusFunctionName = 'getRepComplianceStatus';
						serviceName = 'myDocumentServices';
						params['userOid'] = appCon.data.userDetail.userOid;
						params['actorOid'] = appCon.data.userDetail.repOid || appCon.data.userDetail.accountsDetailsObj.vendorRepOid;
						params['customerOid'] = appCon.data.userDetail.customerOid || appCon.data.userDetail.accountsDetailsObj.customerOid;
					} else {
						params['userOid'] = $rootScope.userProfile.id;
					}
					$injector.get(serviceName)[getUserComplianceStatusFunctionName](params).then(function (result) {
						$scope.enableCBCInternationalUserLoading = false;
						$rootScope.isInternationalUserPassed = true;
						if (result.data.status === 'success') {
							$scope.setGlobalDocumentPassed(result.data.successData);
						}
						sorDocumentUploadPopup.close();
						cbcInternationalUserCheckPopup.close();
					}, function (error) {
						$scope.enableCBCInternationalUserLoading = false;
						$scope.updateIntlCbcDetailsErrorData = JSON.parse(handleError(error));
					});
				}, 500);
			}
		};
		$scope.setGlobalDocumentPassed = function (complianceResponse) {
			var bcStatus = complianceResponse.bcStatus.toLowerCase();
			if (bcStatus.toLowerCase() === 'pass' && !complianceResponse.bcExpired) {
				$rootScope.globalDocumentPassed = true;
			}
			if (bcStatus === 'incomplete' || bcStatus === 'fail' || (bcStatus === 'pass' && complianceResponse.bcExpired)) {
				$rootScope.globalDocumentPassed = false;
			}
		};
		$scope.showCbcInternationalUserCheckPopup = function (nsorObject) {
			var isFrom = nsorObject.isFrom;
			if (nsorObject.typeCode === 'NSOR') {
				$scope.showSORAcknowlegePopup(nsorObject);
				return;
			}
			$scope.updateIntlCbcDetailsErrorData = '';
			$scope.isCBCInternationalUser = false;
			$scope.enableCBCInternationalUserLoading = false;
			$rootScope.isInternationalUserPassed = false;
			cbcInternationalUserCheckPopup = $modal.open({
				templateUrl: 'app/ng1/views/common/cbcInternationalUser.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope,
				size: 'lg',
				controller: function ($scope, $modalInstance, $state) {
					$scope.goToSorCheck = function () {
						$scope.goToBackgroundCheck(nsorObject);
						$scope.$close();
						//Close parent popup
						if (angular.lowercase(isFrom) === 'homealertpopup') {
							$state.go('home');
							$scope.$parent.$close();
						} else {
							sorDocumentUploadPopup.close();
						}
					};
				}
			});
		};

		// Acknowldge Popup function
		$scope.showSORAcknowlegePopup = function (nsorObject) {
			var isFrom = nsorObject.isFrom;
			var uploadDocument = $modal.open({
				templateUrl: 'app/ng1/views/common/sorAcknowledgDialog.html?rnd=' + appCon.globalCon.deployDate,
				backdrop: 'static',
				keyboard: false,
				scope: $scope,
				size: 'lg',
				controller: function ($scope, $modalInstance, $state) {
					$scope.goToSorCheck = function () {
						$scope.goToBackgroundCheck(nsorObject);
						$scope.$close();
						//Close parent popup
						if (angular.lowercase(isFrom) === 'homealertpopup') {
							$state.go('home');
							$scope.$parent.$close();
							if (cbcInternationalUserCheckPopup) {
								cbcInternationalUserCheckPopup.close();
							}
						} else {
							sorDocumentUploadPopup.close();
							if (cbcInternationalUserCheckPopup) {
								cbcInternationalUserCheckPopup.close();
							}
						}
					};
				}
			});
		};
		// Nsor Detail for ManageReps Request formatter.
		$scope.getBackgroundCheckDetailsFormatter = function (param) {
			var object = { "userOid": appCon.data.userDetail.userOid };
			return object;
		};

		// Open Nsor Accounts popup
		$scope.viewNsorAccountsDocument = function (nsorDetail) {
			if (angular.isDefined(nsorDetail)) {
				var customerArray = nsorDetail.split(',');
				$scope.nsorCustomerNames = [];
				for (var n in customerArray) {
					($scope.nsorCustomerNames).push({ "name": customerArray[n] });
				}
				$scope.nsorCustomerNames['totalRecords'] = customerArray.length;
				var modalInstance = $modal.open({
					templateUrl: 'app/ng1/views/myDocuments/nsorCustomersPopup.html?rnd=' + appCon.globalCon.deployDate,
					keyboard: false,
					backdrop: 'static',
					scope: $scope
				});
			};
		};
		//doc service integration implementation code starts
		$scope.getBackGroundCheck = function (result) {
			if (result && result.successData && result.successData.Status === 'Ok') {
				$rootScope.backgroundCheckList = result.successData.BCDetails;
			} else {
				$rootScope.backgroundCheckList = [];
			}
		};

		$scope.getRepComplianceStatus = function () {
			getRepComplianceStatusTimeout = $timeout(function () {
				$injector.get('myDocumentServices')['getRepComplianceStatus']().then(function (result) {
					if (result.data.status === 'success') {
						$rootScope.repDocumentStatusData = result.data;
						$scope.setGlobalDocumentPassed(result.data.successData);
					}
				}, function (error) {
					$scope.data = JSON.parse(handleError(error));
				});
			}, 1000);
		};

		$scope.checkDownloadAll = function () {
			$scope.customerPolicies = [];
			$injector.get('myDocumentServices')['getCustomerPolicies']().then(function (result) {
				if (result.data.status === 'success') {
					$scope.customerPolicies = result.data;
				} else {
					$scope.customerPolicies = [];
				}
			});
		};

		$scope.downloadPolicies = function (policyOid) {
			if (policyOid && policyOid !== '' && policyOid !== undefined) {
				if (!window.focus) return;
				if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
					var downloadPath = 'data/download.zip';
					$window.open(downloadPath, 'Policy', 'width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');
				} else {
					var params = "{\"VisionRequest\":{\"configDocOid\":\"" + unescape(policyOid) + "\"}}";
					var url = baseUrl + "/VMClientProxyServlet?service=customers&operation=getCustomerConfigDoc&visionRequest=" + encodeURIComponent(params);
					if (document.getElementById('downloadPolicy')) {
						document.getElementById('downloadPolicy').src = url;
					}
				}
			}
		};

		$scope.$on('$destroy', function () {
			$timeout.cancel(showDeleteDocumentsTimeout);
			$timeout.cancel(getRepComplianceStatusTimeout);
			$timeout.cancel(userComplianceStatusTimeout);
			$timeout.cancel(getUserAndRepComplianceStatusTimeout);
		});

	$scope.reloadAccDetailInfoAndStateChange = function () {
		$rootScope.generalInfoRandom = Math.random();
		$state.go($state.current.name, { 'random': $rootScope.generalInfoRandom }, { 'reload': true });
	}

	}]);
angular.module(appCon.appName).filter('escapeSingleQuote', function () {
	return function (text) {
		return text.replace(/'/g, '&#39;');
	};
});
