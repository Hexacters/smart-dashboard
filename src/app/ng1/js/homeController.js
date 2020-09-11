'use strict';
angular.module(appCon.appName).controller('homeController', ['$scope', '$window', '$state', '$modal', '$rootScope', '$injector','$cookieStore','$uibModalStack','$location', function($scope, $window, $state, $modal, $rootScope, $injector ,$cookieStore,$uibModalStack,$location) {
	// Multiple Document upload
    $scope.multipleUplaodDoc = function(selectedDoc) {
        $rootScope.selectedCheckbox = selectedDoc;
        if (selectedDoc.length >= 1) {
            $rootScope.selectedArr = 0;
            $state.go('home.documentAlert.common.commonDocument.information.multipleUploadDocGrid.multipleUplaodDocForm', ({
                'docDefOid': selectedDoc[$scope.selectedArr].docDefOid
            }));
            $injector.get('complianceServices')['multipleUplaodDocFormSubmit']().then(function(result) {});
        }
	};

	$scope.getUserComplainceData = function (overAllCriticalStatus) {
		$rootScope.criticalAlterStatus = overAllCriticalStatus;
	};

    $scope.multipleUplaodDocSteps = function(select) {
        $rootScope.selectedArr = select + 1;
        if ($scope.selectedCheckbox.length > $rootScope.selectedArr) {
            $state.go('home.documentAlert.common.commonDocument.information.multipleUploadDocGrid.multipleUplaodDocForm', ({
                'docDefOid': $scope.selectedCheckbox[$scope.selectedArr].docDefOid
            }));
        }
    };
    $scope.setProviderTemplate = function (documentType){
		appCon.globalCon.providerTemplate = documentType;
	};
    $scope.welcomePage = function(select) {
        //welcomePage	
        var isHideSysMessage = true,newCookie;
        $scope.showWelcomPage = false;
        var updateCookies = function() {
            newCookie = $rootScope.userProfile;
            newCookie.detail.isHideSysMessage = true;
            /*appCon.cookie.removeItem('userProfile');
			appCon.cookie.setItem('userProfile', JSON.stringify(newCookie));*/
            $cookieStore.remove('userProfile');
            $cookieStore.put('userProfile', JSON.stringify(newCookie));
            $scope.showWelcomeMsg = '';
            $scope.userProfile.detail.isHideSysMessage = true;
        };
        /**
		* Redirect to home/default or welcome page
		* If user comes from autologin either local or sso mode.
		*/
        var goToDestination = function () {
        	var destination = '';
        	if(angular.isDefined($location.search().destination)) {
        		destination = $location.search().destination;
        	} else if (angular.isDefined($location.search().dest)) {
        		destination = $location.search().dest;
        	}
        	if (angular.isDefined(destination) && destination !== '') {
        		$rootScope.showHome=false;
        		$scope.showWelcomPage=false;
        		$state.go(destination);
        		updateCookies();
        	} else {
				updateCookies();
        	}
        };

        $injector.get('users')['getSystemMessage']().then(function(result) {
            if (result.data && result.data.status === 'success') {
                if (result.data.successData.systemMessage !== '') {
                    $scope.showWelcomeMsg = result.data.successData.systemMessage;
					$scope.showWelcomPage = true;
                } else {
                    //updateCookies();
                    goToDestination();
                }
            } else {
                //updateCookies();
                goToDestination();
            }
        });
        $scope.messageHide = function(isChecked) {
            isChecked = isChecked;
            if (isChecked && isChecked === true) {
                $scope.sysMsg = {};
                $scope.params = {};
                $scope.params.userOid = $scope.userProfile.id;
                $scope.params.userTypeCode = $scope.userProfile.detail.actorType;
                $scope.sysMsg.HideSystemMessage = $scope.params;
                $injector.get('users')['saveHideSystemMessage']($scope.sysMsg).then(function(result) {
                   // updateCookies();
                    if (result.data && result.data.status === 'success') {
                        $scope.showWelcomePageError = false;
                        $scope.disabledBtn = true;
                        goToDestination();
                    }
                });
            } else {
                //updateCookies();
                goToDestination();
            }
        };
    };
	$scope.getNonCompliancePolicies = function (customerOid) {
		var params ={};
		$rootScope.customerData = {};
		params['customerOid'] = customerOid;
		$rootScope.policyAckloading = true;
		$injector.get('complianceServices').getNonCompliancePoliciesDetails(params).then(function (result) {
			if(result.data.status == "success"){
				$rootScope.customerData = result.data;
				$rootScope.policyAckloading = false;
			}else{
				$rootScope.customerData = result.data;
				$rootScope.policyAckloading = false;
			}
		}, function(error) {
			$scope.data = JSON.parse(handleError(error));
		});
	};

	$scope.getRandomSpan = function () {
        return Math.floor((Math.random() * 6) + 1);
    }

	$scope.getEmergencyNonCompliancePolicies = function (customerOid, repoid, cusName) {
		var params = {};
		$scope.globalPolicy = '';
		$scope.policyAccept = false;
		params.customerOid = customerOid;
		params.repOid = repoid;
		params.credTempTypeCode = 'ACK';
		$scope.repsOid = repoid;
		$scope.showCriticalAck = true;
		$scope.policyAckloading = true;
		$scope.showLoader = true;
		$injector.get('complianceServices').getGlobalPolicies(params).then(function (result) {
			$state.go('home.criticalPolicy.criticalPolicyGrid.acknowledge');
			if (result.data.status === 'success') {
				$scope.globalPolicy = result.data;
				$scope.globalPolicy.cusName = cusName;
				$scope.policyAckloading = false;
				$scope.showCriticalAck = true;
				$scope.showLoader = false;
			} else {
				$scope.customerData = result.data;
				$scope.policyAckloading = false;
				$scope.showLoader = false;
			}
		}, function (error) {
			$scope.data = JSON.parse(handleError(error));
		});
	};

	$scope.saveEmergencyPolicyAcknowledge = function (credentialingDefinitionOid) {
		var param = {CredentialingUserDefinition: {}};
		$scope.showLoader = true;
		$scope.policyAccept = true;
		param.CredentialingUserDefinition.parentOid = $scope.repsOid;
		param.CredentialingUserDefinition.credentialingDefinitionOid = credentialingDefinitionOid;
		param.CredentialingUserDefinition.userType = 'SUPPLIER';
		param.CredentialingUserDefinition.statusCode = '1';
		$injector.get('complianceServices').saveCredentialingUserDefinition(param).then(function (result) {
			if (result.data.status === 'success') {
				$scope.policyAckloading = false;
				$scope.showLoader = false;
				$state.go('home.criticalPolicy.criticalPolicyGrid', {'random': $scope.getRandomSpan() });
			} else {
				$scope.policyAckloading = false;
				$scope.showLoader = false;
				$scope.policyAccept = false;
			}
		}, function (error) {
			$scope.data = JSON.parse(handleError(error));
		});
	};

	$scope.policyAcknowledge = function(customerOid, docDefOid, templateOid, userOid){
		var customerId = '';
		customerId = customerOid;
		appCon.data["Acknowledge"] = new Array();
		appCon.data["Acknowledge"]["docDefOid"] = docDefOid;
		appCon.data["Acknowledge"]["templateOid"] = templateOid;
		appCon.data["Acknowledge"]["isAcknowledge"] = 'true';
		appCon.data["Acknowledge"]['userOid'] = userOid;
		var param ={"DocumentDetail":{}};
		param["DocumentDetail"].userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
		param["DocumentDetail"].vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
		$rootScope.policyAckloading = true;
		$injector.get('complianceServices')['savePolicyAcknowlegment'](param).then(function(result){
			if(result.data.status == "success"){
				//$scope.customerData = result.data;
				$scope.getNonCompliancePolicies(customerId);
				$rootScope.policyAckloading = false;
			}else{
				$rootScope.policyAckloading = false;
			}
		}, function(error) {
			$scope.data = JSON.parse(handleError(error));
		});
	};

	$scope.showCautionPopup = function (templateOid, docDefOid,autoAssign,val,soft,isFrom) {
		$scope.showDocumentDetails = true;
		var autoAssignable;
		$scope.isFrom = isFrom;
		if (docDefOid != '' && docDefOid != undefined) {
			$rootScope.updateSoftKey = soft;
			if(autoAssign == true){
				autoAssignable = 'sharable';
			}else{
				autoAssignable = 'nonSharable';
			}
			appCon.data["document"] = new Array();
			appCon.data["document"]["docDefOid"] = docDefOid;
			appCon.data["document"]["templateOid"] = templateOid;
			appCon.data["document"]["docType"] = autoAssignable;
			appCon.data["document"]["isFrom"] = isFrom;
			$modal.open({
				templateUrl : 'views/myDocuments/showCautionPopup.html?rnd='+appCon.globalCon.deployDate,
				keyboard: false,
				backdrop: 'static',
				scope : $scope,
				controller: function($scope, $modalInstance,$state) {
					$scope.hideCaution = function() {
						$modalInstance.close();
						if($scope.isFrom == 'commonDocument'){
							$state.go('home.documentAlert.commonDocument.information',{'softKey':val});
						}else{
							$state.go('home.documentAlert.specific.information',{'softKey':val});
						}
					};
					$scope.cancel = function() {
						if($scope.isFrom == 'commonDocument'){
							$modalInstance.close();
							$state.go('home.documentAlert.commonDocument');
						}else{
							$modalInstance.close();
							$state.go('home.documentAlert.specific');
						}
					};					
				}
			});			
		}
	};

	$scope.loadUploadDocumentForm = function (templateOid, docDefOid,autoAssign,val,soft,isFrom,categoryCode) {
		$scope.showDocumentDetails = true;
		var autoAssignable;
		$rootScope.multiUploadDocPopup = false;
		if (docDefOid != '' && docDefOid != undefined) {
			$rootScope.updateSoftKey = soft;
			if(autoAssign == true){
				autoAssignable = 'sharable';
			}else{
				autoAssignable = 'nonSharable';
			}
			appCon.data["document"] = new Array();
			appCon.data["document"]["docDefOid"] = docDefOid;
			appCon.data["document"]["templateOid"] = templateOid;
			appCon.data["document"]["docType"] = autoAssignable;
			appCon.data["document"]["isFrom"] = isFrom;
			appCon.data["document"]["requiredDoc"] = autoAssign;
			appCon.data["document"]["categoryCode"] = categoryCode;
			if(isFrom == 'commonDocument'){
				$state.go('home.documentAlert.commonDocument.updateDocument',{'updateDocument':val});
			}else{
				$state.go('home.documentAlert.specific.updateDocument',{'updateDocument':val});
			}
		}
	};
	$scope.openBadgePhotoFromHome = function(){
		$scope.showDocumentDetails = true;
		$state.go('home.documentAlert.commonDocument.badgePhoto');
	};
	
	$scope.noDocumentCloseDialog = function (documentCount) {
		appCon.data["document"]["noOfDocument"] = documentCount;		
	};
	$scope.reloadHomeTab = function () {
		$uibModalStack.dismissAll();
		$state.go('home',{},{'reload':true});
	};
	$scope.notFromHome = function () {
		$rootScope.isFromeHome =false;
		$rootScope.policyIsFromeHome =false;
		$rootScope.hidePolicyAccordion =false;
		$rootScope.hideDocumentsAccordion =false;
	};
	$rootScope.hideDocumentsAccordion =false;
	$scope.policyIsFromHome = function () {
		$rootScope.isFromeHome =false;
		$rootScope.hideDocumentsAccordion =true;
		$rootScope.hidePolicyAccordion =false;
		$rootScope.policyIsFromeHome =true;
	};
	$rootScope.hidePolicyAccordion =true;
	$scope.mydocumentsIsFromHome = function () {
		$rootScope.isFromeHome=true;
		$rootScope.hideDocumentsAccordion =false;
		$rootScope.hidePolicyAccordion =true;
	};
	$scope.documentDetailAction = function () {
		$scope.showDocumentDetails = false;
	};
	$scope.criticalPolicies = function () {
		$scope.showCriticalAck = false;
	};
	// Hide and show the "upload container" in home popup.
	$scope.showDocumentState= function (value) {
		$scope.showDocumentDetails = value;
	};
}]);