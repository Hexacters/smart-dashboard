'use strict';
angular.module(appCon.appName).controller('badgePhotoController', ['$scope', '$window', '$timeout', '$modal', '$filter', '$injector', '$rootScope', '$location', '$state', '$stateParams', 'Analytics', '$uibModalStack', function ($scope, $window, $timeout, $modal, $filter, $injector, $rootScope, $location, $state, $stateParams, Analytics, $uibModalStack) {
	var badgePhotoServices = $injector.get('myProfileServices'), badgePhotoDocRequestParams = { 'thumbnail': 'true', 'returnContentType': 'json' }, enableSaveLoadingTimeOut, getBadgePhotoDocTimeOut, imageCropperRequestTimeout;
	badgePhotoDocRequestParams.userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
	$scope.noImageFound = false;
	$scope.getImageSource = function () {
		$scope.enableSaveLoading = true;
		if (appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') {
			$scope.cropImageFilePath = 'img/badgePhoto.jpeg';
		} else {
			var badgePhotoRequestParams = { 'thumbnail': 'true', 'returnContentType': 'xml' };
			badgePhotoRequestParams.userOid = $rootScope.isFromManageReps ? appCon.data.userDetail.userOid : $scope.userProfile.id;
			var serviceRequest = badgePhotoServices['getBadgePhoto'](badgePhotoRequestParams);
			$scope.cropImageFilePath = serviceRequest.url + '&rnd=' + new Date().getTime();
			enableSaveLoadingTimeOut = $timeout(function () {
				$scope.enableSaveLoading = false;
			}, 3000);
		}
	};
	$scope.cropperLoading = false;
	$scope.getImageFromMongo = function () {
		$scope.initiateCropper = false;
		$scope.enableSaveLoading = true;
		$scope.badgePhotoSubmitError = '';
		badgePhotoServices.getBadgePhotoDoc(badgePhotoDocRequestParams).then(function (result) {
			if (result.data && result.data.status === 'success') {
				if (result.data.successData.BadgePhoto.mongoKey) {
					$scope.noImageFound = false;
					$scope.uploadedCropImages = { 'successData': { 'mongoKey': result.data.successData.BadgePhoto.mongoKey, 'rnd': new Date().getTime() } };
					$scope.docDefOid = result.data.successData.BadgePhoto.docDefOid;
					$scope.docFileMimeType = result.data.successData.BadgePhoto.docFileMimeType;
					$scope.oid = result.data.successData.BadgePhoto.oid;
					$rootScope.deleteBadgePhotoOid = $scope.oid;
					$scope.docFileContent = result.data.successData.BadgePhoto.docFileContent;
					$scope.enableSaveLoading = false;
					$scope.cropperLoading = true;
					getBadgePhotoDocTimeOut = $timeout(function () {
						$scope.initiateCropper = true;
						$scope.cropperLoading = false;
					}, 3000);
				} else {
					$scope.noImageFound = true;
					$scope.uploadedCropImages = '';
					$scope.docDefOid = '';
					delete ($scope.oid);
					$scope.initiateCropper = true;
					$scope.enableSaveLoading = false;
				}
				if (result.data.successData.BadgePhoto.oid) {
					$scope.disableDelete = false;
				} else {
					$scope.disableDelete = true;
				}
			} else {
				$scope.badgePhotoSubmitError = result.data;
				$scope.disableEdit = false;
				$scope.enableSaveLoading = false;
			}
		});
	};
	$scope.badgePhotoUploadCallBack = function () {
		$scope.startUplodImage = true;
	};
	$scope.imageCropperRequestCallback = function (params) {
		if ($scope.uploadedCropImages === '') {
			$scope.noImageFound = true;
		} else {
			$scope.noImageFound = false;
		}
		if (params) {
			if (angular.isString(params)) {
				params = JSON.parse(params);
			}
			$scope.startUplodImage = false;
			$scope.initiateCropper = false;
			$scope.cropperLoading = true;
			var fileFromMongo = $injector.get('myProfileServices').downloadFileFromMongo({ 'mongoKey': params.successData.mongoKey, 'uploadFileId': 'badgePhoto' });
			imageCropperRequestTimeout = $timeout(function () {
				$scope.initiateCropper = true;
				$scope.cropperLoading = false;
			}, 1000);
			return (fileFromMongo.url + '&rnd=' + new Date().getTime());
		}
		return false;
	};
	$scope.editImageCropper = function () {
		$scope.disableDelete = true;
		angular.element('#cancelCroper').focus();
		$scope.showImageCropper = $scope.disableEdit = true;
		$scope.getImageFromMongo();
	};
	$scope.cancelBadgePhoto = function () {
		$scope.badgePhotoSubmitError = {};
		if ($rootScope.isFromManageReps) {
			if ($state.current.name === 'manage.repAccountDetails.manageRepProfile.badgePhoto') {
				$state.go('manage.repAccountDetails.manageRepProfile.badgePhoto', { 'random': $scope.getRandomSpan() });
			} else if ($state.current.name === 'manage.repAccountDetails.documents.optionalDocuments' ||
				$state.current.name === 'manage.repAccountDetails.documents.commonDocuments' ||
				$state.current.name === 'manage.repAccountDetails.repAccountsTab.documents.commonDocuments' ||
				$state.current.name === 'manage.repAccountDetails.repAccountsTab.documents.optionalDocuments') {
				$scope.showImageCropper = $scope.disableEdit = false;
				$('#badgePhoto_cropperImage').next().remove();
				$('#badgePhoto_cropperImage').remove();
				$('#badgePhoto_previewImage').removeAttr('style');
				if ($scope.uploadedCropImages === '') {
					$scope.noImageFound = true;
				} else {
					$scope.noImageFound = false;
				}
				$scope.getImageSource();
			}
		} else {
			if ($state.params.tabsState === 'optionalDoc' || $state.params.tabsState === 'commonDoc') {
				$scope.showImageCropper = $scope.disableEdit = false;
				$('#badgePhoto_cropperImage').next().remove();
				$('#badgePhoto_cropperImage').remove();
				$('#badgePhoto_previewImage').removeAttr('style');
				if ($scope.uploadedCropImages === '') {
					$scope.noImageFound = true;
				} else {
					$scope.noImageFound = false;
				}
				$scope.getImageSource();
			} else if ($state.params.id === 'commonDoc') {
				$state.go('home.documentAlert.commonDocument', { 'id': 'commonDoc' });
			} else {
				$state.go('myProfile.badgePhoto', {}, { reload: true });
			}
		}
	};
	$scope.getRandomSpan = function () {
		return Math.floor((Math.random() * 6) + 1);
	}
	$scope.saveBadgePhotoProcess = function (cropValue) {
		$rootScope.cropImageFilePath = $scope.cropImageFilePath;
		var savePhotoParams = {
			'docDefOid': $scope.docDefOid,
			'DocumentDetail': { 'oid': $scope.oid },
			'docMongoKey': $scope.uploadedCropImages.successData.mongoKey
		};
		savePhotoParams['badgePhoto.height'] = Math.round(cropValue.height) === 0 ? 102 : Math.round(cropValue.height);
		savePhotoParams['badgePhoto.leftPosition'] = Math.round(cropValue.height) === 0 ? 0 : Math.round(cropValue.leftPosition);
		savePhotoParams['badgePhoto.oid'] = cropValue.oid;
		savePhotoParams['badgePhoto.topPosition'] = Math.round(cropValue.height) === 0 ? 0 : Math.round(cropValue.topPosition);
		savePhotoParams['badgePhoto.width'] = Math.round(cropValue.width) === 0 ? 92 : Math.round(cropValue.width);
		$scope.enableSaveLoading = true;
		badgePhotoServices.saveBadgePhotoProcess(savePhotoParams).then(function (result) {
			$scope.badgePhotoSubmitError = {};
			if (result.data && result.data.status === 'success') {
				$scope.enableDelete = true;
				$scope.noImageFound = false;
				$scope.enableSaveLoading = false;
				$scope.getImageSource();
				if ($rootScope.isFromManageReps) {
					if ($state.current.name === 'manage.repAccountDetails.manageRepProfile.badgePhoto') {
						$state.go('manage.repAccountDetails.manageRepProfile.badgePhoto', { 'random': $scope.getRandomSpan() });
					} else if ($state.current.name === 'manage.repAccountDetails.documents.commonDocuments' ||
						$state.current.name === 'manage.repAccountDetails.documents.optionalDocuments' ||
						$state.current.name === 'manage.repAccountDetails.repAccountsTab.documents.commonDocuments' ||
						$state.current.name === 'manage.repAccountDetails.repAccountsTab.documents.optionalDocuments') {
						$uibModalStack.dismissAll();
						$scope.showImageCropper = $scope.disableEdit = false;
						$state.go($state.current.name, { 'random': $scope.getRandomSpan() });
					}
				} else if ($state.params.tabsState === 'optionalDoc') {
					$scope.showImageCropper = $scope.disableEdit = false;
					$scope.optionalDocBadge.close();
					if($rootScope.isFromAccountDetails) {
						$rootScope.generalInfoRandom = Math.random();
						$state.go($state.current.name, { 'random': $rootScope.generalInfoRandom }, { 'reload': false });
					} else {
						$state.reload();
					}
				} else if ($state.params.tabsState === 'commonDoc') {
					$scope.showImageCropper = $scope.disableEdit = false;
					if($rootScope.isFromAccountDetails) {
						$rootScope.generalInfoRandom = Math.random();
						$state.go($state.current.name, { 'random': $rootScope.generalInfoRandom }, { 'reload': false });
					} else {
						$state.reload();
					}
				} else if ($state.params.id === 'commonDoc') {
					// CREDMGR-35039 - Added Random number for refresh the grid after badge photo update
					$state.go('home.documentAlert.commonDocument', { 'id': 'commonDoc', 'random': Math.random()});
				}
				else {
					$state.go('myProfile.badgePhoto', {}, { reload: true });
				}
			} else {
				$scope.badgePhotoSubmitError = result.data;
				$scope.enableSaveLoading = false;
			}
		});
	};
	$scope.showHelpFromMyDocument = function () {
		$modal.open({
			templateUrl: 'views/myProfile/badgePhotoHelp.html?rnd=' + appCon.globalCon.deployDate,
			windowClass: 'commonDialogW60',
			keyboard: false,
			backdrop: 'static',
			controller: function ($scope, $modalInstance, $state) {
				$scope.closeBadgePhotoHelp = function () {
					$modalInstance.close();
				}
			}
		});
	}
	$scope.deleteBadgePhotoProcess = function () {
		$modal.open({
			templateUrl: 'views/myProfile/badgePhotoDelete.html?rnd=' + appCon.globalCon.deployDate,
			windowClass: 'commonDialogW60',
			keyboard: false,
			backdrop: 'static',
			scope: $scope,
			controller: function ($scope, $modalInstance, $state, $modal) {
				$scope.deleteDocuments = function (documentOid) {
					var params = {};
					$scope.deleteDocumentLoading = true;
					if (documentOid !== '' && documentOid !== undefined) {
						params['documentOid'] = documentOid;
						$injector.get('myDocumentServices')['deleteDocument'](params).then(function (result) {
							if (result.data.status === 'success') {
								$scope.enableDelete = false;
								if ($rootScope.isFromManageReps) {
									if ($state.current.name === 'manage.repAccountDetails.manageRepProfile.badgePhoto') {
										$modalInstance.close();
										$state.go('manage.repAccountDetails.manageRepProfile.badgePhoto', { 'random': $scope.getRandomSpan() });
									} else if ($state.current.name === 'manage.repAccountDetails.documents.commonDocuments' ||
										$state.current.name === 'manage.repAccountDetails.documents.optionalDocuments' ||
										$state.current.name === 'manage.repAccountDetails.repAccountsTab.documents.commonDocuments' ||
										$state.current.name === 'manage.repAccountDetails.repAccountsTab.documents.optionalDocuments') {
										$modalInstance.close();
										$scope.getImageFromMongo();
										$scope.cancelBadgePhoto();
										// CREDMGR-35039 - Added condition for modal dialog from optional documents grid
										if ($scope.optionalDocBadge) {
											$scope.optionalDocBadge.close();
										}
										$state.go($state.current.name, { 'random': $scope.getRandomSpan() });
									}
								} else {
									if ($state.params.tabsState === 'optionalDoc' || $state.params.tabsState === 'commonDoc') {
										$modalInstance.close();
										$scope.getImageFromMongo();
										$scope.cancelBadgePhoto();
										// CREDMGR-35039 - Added condition for modal dialog from optional documents grid
										if ($scope.optionalDocBadge) {
											$scope.optionalDocBadge.close();
										}
										$state.reload();
									} else if ($state.params.id === 'commonDoc') {
										$state.go('home.documentAlert.commonDocument', { 'id': 'commonDoc' });
									}
									else {
										$modalInstance.close();
										$state.go('myProfile.badgePhoto', {}, { reload: true });
									}
								}
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
	};
	$scope.openBadgePhotoOptionalDocument = function (headingParams) {
		$scope.optionalDocHeading = headingParams;
		$scope.optionalDocBadge = $modal.open({
			templateUrl: 'views/myDocuments/optionalDocumentsBadgePhoto.html?rnd=' + appCon.globalCon.deployDate,
			windowClass: 'commonDialogW70',
			keyboard: false,
			backdrop: 'static',
			scope: $scope,
			controller: function ($scope, $modalInstance, $state, $modal) {
				$scope.colseBadgePhoto = function () {
					$modalInstance.dismiss();
				}
			}
		});
	};
	$scope.openBadgeCommomDocument = function (headingParams) {
		$scope.commomDocHeading = headingParams;
		$scope.commonDocBadge = $modal.open({
			templateUrl: 'views/myDocuments/commonDocumentsBadgePhoto.html?rnd=' + appCon.globalCon.deployDate,
			windowClass: 'commonDialogW70',
			keyboard: false,
			backdrop: 'static',
			scope: $scope,
			controller: function ($scope, $modalInstance, $state, $modal) {
				$scope.colseCommonDocBadgePhoto = function () {
					$modalInstance.dismiss();
				}
			}
		});
	};

	//google analytics page track
	$scope.callGAPageTrack = function (pageName) {
		Analytics.trackPage('/' + $rootScope.path + '/' + pageName + '/');
	};

	$scope.$on('$destroy', function(){
		$timeout.cancel(enableSaveLoadingTimeOut);
		$timeout.cancel(getBadgePhotoDocTimeOut);
		$timeout.cancel(imageCropperRequestTimeout);
	});

}]);