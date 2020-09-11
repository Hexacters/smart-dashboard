'use strict';
angular.module(appCon.appName).controller('shareMyCredentialController', ['$scope','$window', '$timeout','$modal','$filter','$injector','$rootScope','$state','$location','Analytics', function($scope,$window, $timeout,$modal,$filter,$injector,$rootScope,$state,$location,Analytics){
	
	// Base url configuration 
	var urlIndex = ($location.absUrl()).indexOf('/#/'),baseUrl;
	if(urlIndex !== -1){
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	}else{
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/"+contextPath+"/");
		baseUrl = baseUrl[0]+"/"+ contextPath;
	}
	
	$scope.showShareCredential = true;
	$scope.getDateTime =Math.random();
	$scope.mailTo = function(mailId){
		return  window.encodeURIComponent(mailId);
	};
	$scope.getBadgePhotoSrc = function () {
		var param ={"thumbnail":"true","returnContentType":"xml"};
		param.userOid = $rootScope.isFromManageReps ?
			$rootScope.ShareMyCredentialUserOid :
			$scope.userProfile.id;
		var request = $injector.get("myProfileServices").getBadgePhoto(param);
		if( appCon.globalCon.mock === true || appCon.globalCon.mock === 'true' ){
	  		$scope.badgePhotoFilePath = "img/badgePhoto.jpeg";
	  	} else {
	  		$scope.badgePhotoFilePath = request.url + "&rnd="+new Date().getTime();
	  	}
	};
	$scope.shareCredentialReportError = '';
	$rootScope.path = ($location.absUrl()).split('/')[3];
	//Get Initial request from state bases
	$scope.getInitialReguest = function(){
		if($state.params.isFrom === "manageRepsDocuments"){
			Analytics.trackPage("/"+$rootScope.path+"/shareCredentialsFromRepDocuments/");return true;
		} else if($state.params.isFrom === "action" || $state.params.isFrom === "myDocument" || $state.params.isFrom === "isfromRepDetail"){
			if($state.params.isFrom === "myDocument"){
				Analytics.trackPage("/"+$rootScope.path+"/shareCredentialsFromMyDocuments/");return true;
			}else if($state.params.isFrom === "action"){
				Analytics.trackPage("/"+$rootScope.path+"/shareMyCredentials/");return true;
			}
		}
	};

	$scope.CredentialDocumentList = function(param){
		param.successData.CredentialDetailList = _.sortByAll(param.successData.CredentialDetailList, ['documentName', 'docOid']);
		return param;
	};

	$scope.shareMyCredential = function() {
		if($state.params.isFrom === ''){
			$scope.shareMyCredentialShow = false;
		}else{
			$scope.shareMyCredentialShow = true;
		}
    };
	
	$scope.checkSelectAllCredential = function (totalCount,selected) {
		if(totalCount.length === selected.length){
			$scope.selectAllCredential = true;
		}else{
			$scope.selectAllCredential = false;
		}
	};
	
	$scope.getUserSharableDocumentsParams = function(param){
		var param = {};
		if($state.params.isFrom === "manageRep"){
			param.userOid = $rootScope.ShareMyCredentialUserOid;
			param.vendorOid = $rootScope.ShareMyCredentialVendorOid;
		} else if($state.params.isFrom === "manageRepsDocuments"){
			param.userOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialUserOid : $scope.userProfile.id;
			param.vendorOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialVendorOid : $scope.userProfile.detail.vendorOid;
		} else if($state.params.isFrom === "action" || $state.params.isFrom === "myDocument" || $state.params.isFrom === "isfromRepDetail"){
			param.userOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialUserOid : $scope.userProfile.id;
			param.vendorOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialVendorOid : $scope.userProfile.detail.vendorOid;
		}
		return param;
	};
	
	$scope.downLoadAndShareSelection = function (documents,isFrom) {
		if((appCon.globalCon.mock === true || appCon.globalCon.mock === 'true') && isFrom != 'share'){
	    	var downloadPath = baseUrl+'/data/download.zip';
	    	$window.open(downloadPath, 'popup','width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');
	    	return;
		}
		$scope.getDateTime =   Math.random();
		$scope.shareCredentialReportError = '';
		if(documents.length <= 25){
			var docOids = '';
			for(var j=0;j<documents.length;j++){
				if(j === 0){ docOids = documents[j]['docOid'];  }
				else{ docOids = docOids+','+documents[j]['docOid']}
			}
			$scope.shareCredentialReportLoading = true;
			var requestParams = {'docOids':docOids};
			if($state.params.isFrom === "manageRep"){
				requestParams.userOid = $rootScope.ShareMyCredentialUserOid;
				requestParams.vendorOid = $rootScope.ShareMyCredentialVendorOid;
			} else if($state.params.isFrom === "manageRepsDocuments"){
				var requestParams = {'docOids':docOids};
				requestParams.userOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialUserOid : $scope.userProfile.id;
				requestParams.vendorOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialVendorOid : $scope.userProfile.detail.vendorOid;
			} else if($state.params.isFrom === "action" || $state.params.isFrom === "myDocument" || $state.params.isFrom === "isfromRepDetail"){
				var requestParams = {'docOids':docOids};
				requestParams.userOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialUserOid : $scope.userProfile.id;
				requestParams.vendorOid = $rootScope.isFromManageReps ? $rootScope.ShareMyCredentialVendorOid : $scope.userProfile.detail.vendorOid;
			}
			$scope.requestParams = requestParams;
			var shareCredentialsServices = $injector.get("shareCredentialsServices");
			if(isFrom=="download"){
				$scope.downloadDocumentAsZip();
			}else{
				$scope.showShareCredential = false;
				shareCredentialsServices.getShareCredentialsForPreview($scope.requestParams).then(function(result){
					if(result.data.status == "success"){
						$rootScope.shareMyCredentialData = result.data;
						$scope.webUrl = $rootScope.shareMyCredentialData.successData.ShareCredentialsSummary.webURL
						if(angular.isDefined($scope.webUrl)){
							$scope.formateWebsiteUrl($scope.webUrl);
						}
						$scope.shareCredentialReportLoading = false;
					}else{
						$rootScope.shareMyCredentialData = result.data;
						$scope.shareCredentialReportLoading = false;
					}
				});
			}
		}
	};

	$scope.downloadDocumentAsZip = function(){
		if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true'){
	    	var downloadPath = baseUrl+'/data/download.zip';
	    	$window.open(downloadPath, 'popup','width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');
	    	return;
		}
		var shareCredentialsServices = $injector.get("shareCredentialsServices");
		shareCredentialsServices.getUserSharableDocuments($scope.requestParams).then(function(result){
			if(result.data && result.data.successData.Status==='Ok'){
				if(result.data.successData.firstName && result.data.successData.lastName && result.data.successData.mongoKeys){ 
					var url = baseUrl + "/services/downloadDocumentAsZip?service=common&operation=downloadDocumentAsZip&mongoKeys="+result.data.successData.mongoKeys+"&firstName="+result.data.successData.firstName+"&lastName="+result.data.successData.lastName+"&isFromAJS=ajs";
					if(document.getElementById('downloadDocumentAsZip')){
						document.getElementById('downloadDocumentAsZip').src = url;
					}
				}
				$scope.shareCredentialReportLoading = false;
			}else{
				$scope.shareCredentialReportLoading = false;
			}
		});
	};
	
	$scope.backToSelectCredentials = function () {
		$scope.showShareCredential = true;
	};
	
	$scope.credentialDetailPreviewView = function (docOid) {
		if(docOid !='' && docOid !=undefined){
			if(!window.focus)return;
			if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true' ){
				var url = baseUrl+"/img/download.jpg";
			} else {
				var params = "{\"VisionRequest\":{\"docOid\":\""+docOid+"\"}}";
				var url = baseUrl+"/VMClientProxyServlet?service=common&operation=getDocumentFileView&visionRequest="+encodeURIComponent(params);
			}
			var viewDocWin=window.open(url ,"fileWindow","height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
		}
	};
	
	$scope.credentialDetailPreviewPrint = function (docOid) {
		if(docOid !='' && docOid !=undefined){
			if(!window.focus)return;
			if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true' ){
				var url = baseUrl+"/img/download.jpg";
			}else {
					var params = "{\"VisionRequest\":{\"docOid\":\""+docOid+"\"}}";
				var url = baseUrl+"/VMClientProxyServlet?service=common&operation=getDocumentFilePrint&visionRequest="+encodeURIComponent(params);
			}
			var viewDocWin=window.open(url ,"fileWindow","height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
		}
	};
	
	$scope.credentialDetailPreviewDownload = function (docOid) {
		if(docOid !='' && docOid !=undefined){
			if(!window.focus)return;
			var params = "{\"VisionRequest\":{\"docOid\":\""+docOid+"\"}}";
			if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true' ){
				var url = baseUrl+"/img/download.jpg";
			} else {
				var url = baseUrl+"/VMClientProxyServlet?service=common&operation=getDocumentFileDownload&visionRequest="+encodeURIComponent(params);
			}
			var viewDocWin=window.open(url ,"fileWindow","height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
		}
	};
	
	$scope.credentialRecipient = function (recipient,share,isFromAction) {
		var docOids = '';
		for(var j=0;j<share.length;j++){
			if(j === 0){ docOids = share[j]['docOid'];  }
			else{ docOids = docOids+','+share[j]['docOid']}
		}
		$scope.shareCredentialReportLoading = true;
		var param ={};
		param["SharedCredentialsHistory"] = {};
		param["SharedCredentialsHistory"]["shareToken"] ='';
		param["SharedCredentialsHistory"]["docOids"] = docOids;
		param["SharedCredentialsHistory"]["inviteeFirstName"] = recipient.inviteeFirstName;
		param["SharedCredentialsHistory"]["inviteeLastName"] = recipient.inviteeLastName;
		param["SharedCredentialsHistory"]["inviteeEmailId"] = recipient.inviteeEmailId;
		if(isFromAction === "manageRep"){
			param["SharedCredentialsHistory"]["isFromAdmin"] = 'true';
		} else if(isFromAction === "manageRepsDocuments"){
			param["SharedCredentialsHistory"]["isFromAdmin"] = 'true';
		} else if(isFromAction === "action" || isFromAction === "myDocument" || isFromAction === "isfromRepDetail"){
			param["SharedCredentialsHistory"]["isFromAdmin"] = 'false';
		}
		if($state.params.isFrom === "manageRepsDocuments" || $state.params.isFrom === "manageRep"){
			param["SharedCredentialsHistory"]["userOid"] = $rootScope.ShareMyCredentialUserOid;
		}else{
			param["SharedCredentialsHistory"]["userOid"] = $scope.userProfile.id;
		}
		param["SharedCredentialsHistory"]["sharedBy"] = $scope.userProfile.id;
		$scope.inviteeFirstName = recipient.inviteeFirstName;
		$scope.inviteeLastName  = recipient.inviteeLastName;
		$scope.inviteeEmailId  = recipient.inviteeEmailId;
		var shareCredentialsServices = $injector.get("shareCredentialsServices");
		shareCredentialsServices.shareCredentialsProcess(param).then(function(result){
			if(result.data && result.data.status==='success'){
				$scope.expireOn = result.data.successData.expiredOn;
				$modal.open({
					templateUrl : 'views/sharecredentials/credentialsSendPopup.html?rnd='+appCon.globalCon.deployDate,
					keyboard: false,
					backdrop: 'static',
					scope : $scope
				});
				$scope.shareCredentialReportLoading = false;
			}else{
				if(result.data.errorData.ResponseError[0].errorCode =='5026'){
					$scope.registrationRequired = result.data.errorData.ResponseError[0].longMessage;
					$modal.open({
						templateUrl : 'views/sharecredentials/credentialsSendFaliurePopup.html?rnd='+appCon.globalCon.deployDate,
						keyboard: false,
						backdrop: 'static',
						scope : $scope					
					});
				}else{
					$scope.shareCredentialReportError = result.data;
				}
				$scope.shareCredentialReportLoading = false;
			}
		});
	};
	
	$scope.hidePublicSymbol = false;
	
	$scope.publicSymbol = function (publicSymbol) {
		$scope.publicSymbolFinLink = appCon.globalCon.publicSymbolFinLink;
		if(angular.isDefined($scope.publicSymbolFinLink)){
			var oldString = appCon.globalCon.publicSymbolFinLink;
			$scope.newPublicSymbol = oldString.replace("PUBLIC_SYMBOL",publicSymbol);
		}else{
			$scope.hidePublicSymbol = true;
		}
	};
	
	$scope.formateWebsiteUrl = function (url) {
	   if (!/^(f|ht)tps?:\/\//i.test(url)) {
			$scope.newWesiteUrl = "http://" + url;
	   }else{
			$scope.newWesiteUrl = url;
	   }
	};
	
	$scope.openLinkNewWindow = function(urlDiv){
		var url = urlDiv;
		if(url.match('@')){
			alert("Invalid URL");
		}else{
			try{
				window.open(url,'link');
			}catch(e){
				alert("Invalid URL");
			}
		}
	};
	
	$scope.governmentSactionStatus = function(){
		$modal.open({
				template: commonObj.prepareAppCommonConfirmationDialogContainer,
				backdrop: 'static',
				keyboard: false,
				controller: function($scope, $modalInstance,$state) {
					$scope.cancel = function() {
						$modalInstance.close();
					};
				}				
			});
	};
	
	commonObj.prepareAppCommonConfirmationDialogContainer = function() {
		var popuDivHtmlContent = '';
		popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-content">';
		popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-header">';
		popuDivHtmlContent = popuDivHtmlContent + '<button id="complianceCautionCloseIcon" id="viewAccountCloseIcon" type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="$close()">&times;</button>';
		popuDivHtmlContent = popuDivHtmlContent + '<h3 class="modal-title"><b>Sanction List Failure</b></h3>';
		popuDivHtmlContent = popuDivHtmlContent + '</div>';
		popuDivHtmlContent = popuDivHtmlContent + '<div class="modal-body modelDialogScroll">';
		popuDivHtmlContent = popuDivHtmlContent + '<div class="col-lg-12 col-md-12 col-sm-12 padding0">';
		popuDivHtmlContent = popuDivHtmlContent + '<p>Please contact Vendormate at 888.476.0377 or via email at <a href="mailto:support@vendormate.com">support@vendormate.com</a> to get the details of this sanction list failure.</p>';
		popuDivHtmlContent = popuDivHtmlContent + '<div class="text-center"><button class="btn btn-info text-center" type="button" id="ok" data-ng-click="$close();">{{"common.ok" | translate}}</button></div>';
		popuDivHtmlContent = popuDivHtmlContent + '</div></div></div>';	
		return popuDivHtmlContent;
	};
}]);