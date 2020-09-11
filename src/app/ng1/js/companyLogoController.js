'use strict';
angular.module(appCon.appName).controller('companyLogoController', ['$scope','$window', '$timeout','$modal','$filter','$injector','$rootScope','$location','$state','$cookieStore','Analytics', function($scope,$window, $timeout,$modal,$filter,$injector,$rootScope,$location,$state,$cookieStore,Analytics){
	$scope.getRandomSpan = function(){
		return Math.floor((Math.random()*6)+1);
	}
	$scope.initialLoadImage = false;
	$scope.enableSaveLoading = false;
	var	companyLogoServices = $injector.get("companyProfileServices"),serviceRequest,companyLogoRequestParams,getCompanyLogoRequestParams;;
	$scope.noCompanyLog = false;
	$scope.getImageSource = function () {
		getCompanyLogoRequestParams ={"returnContentType":"xml"};
		getCompanyLogoRequestParams.vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
		serviceRequest = companyLogoServices['getCompanyLogo'](getCompanyLogoRequestParams);
		if( appCon.globalCon.mock == true || appCon.globalCon.mock == 'true' ){
		   $scope.getCompanyLogoFilePath  = "img/download.jpg" ;
		}else{
		   $scope.getCompanyLogoFilePath = serviceRequest.url + "&rnd="+new Date().getTime();
		}
		companyLogoRequestParams ={"docType":"LOGO","returnContentType":"json"};
		companyLogoRequestParams.vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
		companyLogoServices['getVendorDocument'](companyLogoRequestParams).then(function(result){
			if(result.data && result.data.status==='success'){
				$scope.oid = result.data.successData.VendorDoc.oid;
				$scope.mimeType = result.data.successData.VendorDoc.theFileMimeType;
				$scope.logoSrc = result.data.successData.docFileContent;
				if(result.data.successData.docFileContent){
					$scope.noCompanyLog = false;
					$scope.disableDelete = false;
					$scope.initialLoadImage = true;
				}
				else{
					$scope.noCompanyLog = true;
					$scope.disableDelete = true;
					$scope.initialLoadImage = true;
				}
			} else{
					$scope.noCompanyLog = true;
					$scope.disableDelete = true;
					$scope.initialLoadImage = true;
			}
		});
	};
	$scope.editCompanyLogo = function(){
		angular.element("#cancelCroper").focus();
		$scope.showEditLogo = $scope.disableEdit = true;
	};
	$scope.newImageUploaded = false;
	$scope.uploadedFileResponce = function(params){
		var fileFromMongo = $injector.get("myProfileServices").downloadFileFromMongo({"mongoKey":params.successData.mongoKey,"uploadFileId":"companyLogo"});
		if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true'){
			$scope.getCompanyLogoFilePath = "img/ghx_logo.jpg";
		} else {
			$scope.getCompanyLogoFilePath =  fileFromMongo.url;
		}
		$scope.startUplod = false;
		$scope.noCompanyLog = false;
		$scope.newImageUploaded = true;
		return params;
	};
	$scope.logoUploadCallBack = function(){
		$scope.startUplod = true;
	};

	$scope.companyLogoDelete = function (){
		var deleteParams = {"CompanyLogo":{"oid":$scope.oid,"theFileMimeType":"",
			"name":"","fileContent":"","theFile":""}};
		$scope.enableSaveLoading = true;
		companyLogoServices['saveCompanyLogo'](deleteParams).then(function(result){
			if(result.data && result.data.status==='success'){
				$scope.enableSaveLoading = false;
				if(!$cookieStore.get('restrictCompanyDoc')){
					$scope.openDeleteCompanyLogo.close();
				}
				if($rootScope.isFromManageReps)	{
					$state.go('manage.repAccountDetails.companyProfile.companyLogo',{'random':$scope.getRandomSpan()});
				} else{
					$state.go('companyProfile.companyLogo',{},{reload : true});
				}
			}else{
				$scope.enableSaveLoading = false;
				$scope.deleteLogoError	= result.data;
				$scope.deleteLogoLoading = false;
			}
		});
	};
	$scope.deleteCompanyLogoModal = function () {
		var restrictCompanyDocuments = $cookieStore.get('restrictCompanyDoc');
		if(!(angular.isDefined(restrictCompanyDocuments))){		
			$scope.openDeleteCompanyLogo = $modal.open({
				templateUrl : 'views/companyProfile/deleteCompamyLogo.html?rnd='+appCon.globalCon.deployDate,
				keyboard: false,
				backdrop: 'static',
				scope : $scope,
				controller: function($scope, $modalInstance,$state) {
					$scope.cancelDelete = function() {
						$modalInstance.close();
					};
					$scope.deleteLogo = function(rememberDeleteLogo) {
						if(rememberDeleteLogo){
							$cookieStore.put('restrictCompanyDoc','true');
						}
						$scope.deleteLogoLoading = false;
						$scope.companyLogoDelete();
					};
				}
			});
		}else{
			$scope.companyLogoDelete();
		}
	};
	$scope.saveCompanyLogoRequest = function (){
		var savePhotoParams = {"CompanyLogo":{"theFileMimeType":$scope.mimeType,
			"height":"0","topPosition":"0","width": "0","leftPosition": "0",
			"oid":$scope.oid,"fileContent":$scope.logoSrc}};
			savePhotoParams.CompanyLogo.vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
		if($scope.uploadedLogoImages){
			savePhotoParams['CompanyLogo']['theFileMimeType'] = $scope.uploadedLogoImages.fileMimeType;
			savePhotoParams['CompanyLogo']['name'] = $scope.uploadedLogoImages.fileName;
			savePhotoParams['CompanyLogo']['mongoKey'] = $scope.uploadedLogoImages.mongoKey;
			savePhotoParams['vendorOid'] = savePhotoParams.CompanyLogo.vendorOid = $rootScope.isFromManageReps ? appCon.data.userDetail.vendorOid : $scope.userProfile.detail.vendorOid;
			delete(savePhotoParams['CompanyLogo']['fileContent']);
		}
		if($scope.logoSrc || $scope.uploadedLogoImages){
			$scope.enableSaveLoading = true;
			companyLogoServices.saveCompanyLogo(savePhotoParams).then(function(result){
				if(result.data && result.data.status==='success'){
					$scope.enableSaveLoading = false;
					if($rootScope.isFromManageReps)	{
						$state.go('manage.repAccountDetails.companyProfile.companyLogo',{'random':$scope.getRandomSpan()});

					} else{
						$state.go('companyProfile.companyLogo',{},{reload : true});
					}
				}
				else{
					$scope.enableSaveLoading = false;
					$scope.saveCompanyLogoError	= result.data;
				}
			});
		}
		else{
			if($rootScope.isFromManageReps){
				$state.go('manage.repAccountDetails.companyProfile.companyLogo',{'random':$scope.getRandomSpan()});

			} else{
				$state.go('companyProfile.companyLogo',{},{reload : true});
			}
		}
	};
	
	//google analytics page track
	$scope.callGAPageTrack = function(pageName){
		Analytics.trackPage("/"+$rootScope.path+"/"+pageName+"/");
	};
}]);