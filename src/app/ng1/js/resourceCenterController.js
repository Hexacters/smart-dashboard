'use strict';
angular.module(appCon.appName).controller('resourceCenterController', ['$scope', '$window', '$state', '$modal', '$rootScope', '$injector','$location', function($scope, $window, $state, $modal, $rootScope, $injector,$location) {
	// Base url configuration 
	var urlIndex = ($location.absUrl()).indexOf('/#/'),baseUrl;
	if(urlIndex !== -1){
		baseUrl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
	}else{
		var contextPath = ($location.absUrl()).split('/')[3];
		baseUrl = ($location.absUrl()).split("/"+contextPath+"/");
		baseUrl = baseUrl[0]+"/"+ contextPath;
	}
	$rootScope.feinAdminResourceName = '';
	$rootScope.feinRepResourceName = '';
	$scope.getFeinAdminRepResource = function (userOid,Category) { 
		$scope.resourceLoading = true;
		$scope.user={};
		$scope.user.userOid = userOid;
		$injector.get('resourceCenterServices')['getAssociatedCompanies']($scope.user).then(function(result){	
			if (result.data && result.data.status === 'success') {
				$scope.data = result.data;
				var params ={};
				$scope.feinAdminResource = {};
				$scope.feinAdminResource.associatedCompany = $rootScope.userProfile.detail.legalName+'#@#'+$rootScope.userProfile.detail.vendorOid;
				$scope.feinAdminResource.companyName = $rootScope.userProfile.detail.legalName;
				if(Category =='FA'){
					$rootScope.feinAdminResourceName = $rootScope.userProfile.detail.legalName;
				}else{
					$rootScope.feinRepResourceName = $rootScope.userProfile.detail.legalName;
				}
				params['vendorOid'] = $rootScope.userProfile.detail.vendorOid;
				params['resourceCategory'] = Category;
				$injector.get('resourceCenterServices')['getFeinAdminRepResourceMetaData'](params).then(function(result){	
					if (result.data.status === 'success') {
						$scope.feinAdmin = result.data;
					}else{
						$scope.feinAdmin = result.data;
					}
					$scope.resourceLoading = false;
				}, function(error) {
					$scope.feinAdmin = JSON.parse(handleError(error));
				});
			}else{
				$scope.feinAdmin = result.data;
				$scope.resourceLoading = false;	
			}
		}, function(error) {
			$scope.data = JSON.parse(handleError(error));
			$scope.resourceLoading = false;
		});
	};
	$scope.changeFeinResourceCenter = function (legal,Category) { 
		$scope.resourceLoading = true;
		$scope.feinResource = legal.split('#@#');
		var params ={};
		if($scope.feinResource && $scope.feinResource !== undefined){
			$scope.feinAdminResource.companyName = $scope.feinResource[0];
			if(Category =='FA'){
				$rootScope.feinAdminResourceName = $scope.feinResource[0];
			}else{
				$rootScope.feinRepResourceName = $scope.feinResource[0];
			}
			params['vendorOid'] = $scope.feinResource[1];
			params['resourceCategory'] = Category;
			$injector.get('resourceCenterServices')['getFeinAdminRepResourceMetaData'](params).then(function(result){	
				if (result.data.status === 'success') {
					$scope.feinAdmin = result.data;
				}else{
					$scope.feinAdmin = result.data;
				}
				$scope.resourceLoading = false;
			}, function(error) {
				$scope.resourceLoading = false;
				$scope.feinAdmin = JSON.parse(handleError(error));
			});
		}	
	};
	$scope.getSinglePolicy = function (customerOid) {
		$scope.SinglePolicy = {};
		$scope.SinglePolicy.customerOid = customerOid;
		$scope.SinglePolicy.configDocType = "POLF";
		if(customerOid && customerOid !=''){
		$scope.resourceLoading = true;
		$injector.get('resourceCenterServices')['getCustomerPolicies']($scope.SinglePolicy).then(function(result){	
			if (result.data.status === 'success') {
				$scope.systemPolicies = result.data;
			}else{
				$scope.systemPolicies = result.data;
			}
			$scope.resourceLoading = false;
		}, function(error) {
			$scope.data = JSON.parse(handleError(error));
		});
		}
	};
	$scope.loadURLVendorResource = function(url) {
		/*var newUrl = String.prototype.startsWith(url);
		if(newUrl){
			$window.open(url, '_blank');
		}else{
			var newUrl = "http://"+ url;
			$window.open(newUrl, '_blank');
		}*/
		if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true'){
			var url = baseUrl+"/img/download.jpg";
			var viewDocWin=window.open(url,'View',"height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
			viewDocWin.focus();
		} else{
			var newUrl ='';
			if (!/^(f|ht)tps?:\/\//i.test(url)) {
				newUrl = "http://" + url;
				$window.open(newUrl, '_blank');
		    }else{
				$window.open(url, '_blank');
		    }
		}
	};
	String.prototype.startsWith = function(url) 
		{return (this.match("http"+url)==url)}
	$scope.viewResourceCenterDocument = function(mongoKey) {
		if(mongoKey !=='' && mongoKey !==undefined){
			if(appCon.globalCon.mock === true || appCon.globalCon.mock === 'true' ){
				var url = baseUrl+"/img/download.jpg";
			} else {
				var url = baseUrl+"/services/getResourceDocument?service=common&operation=getResourceDocument&mongoKey="+mongoKey;
			}
			var viewDocWin=window.open(url,'View',"height=800,width=618,dependent=yes,menubar=yes,scrollbars=yes,resizable=yes");
			viewDocWin.focus();
		}
	};
	$scope.getSinglePolicies = function (policyOid,type) {
		if(type === 'single'){
			if(!window.focus)return;
			if(appCon.globalCon.mock == true || appCon.globalCon.mock === 'true'){
		  	    var downloadPath = 'img/download.jpg';
				$window.open(downloadPath, 'Policy','width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');
			}else{
				var params = "{\"VisionRequest\":{\"docDefOid\":\""+unescape(policyOid)+"\"}}";	
				var url = baseUrl + "/VMClientProxyServlet?service=customers&operation=getCustomerPolicyDocument&visionRequest="+encodeURIComponent(params);
				if(document.getElementById('downloadPolicy')){
					document.getElementById('downloadPolicy').src = url;
				}
			}
		}else if(type === 'all') {
			if(policyOid && policyOid !=='' && policyOid !== undefined){
				if(!window.focus)return;
				if(appCon.globalCon.mock == true || appCon.globalCon.mock === 'true'){
			        var downloadPath = 'data/download.zip';
					$window.open(downloadPath, 'Policy','width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');
				}else{
					var params = "{\"VisionRequest\":{\"configDocOid\":\""+unescape(policyOid)+"\"}}";	
					var url = baseUrl + "/VMClientProxyServlet?service=customers&operation=getCustomerConfigDoc&visionRequest="+encodeURIComponent(params);
					if(document.getElementById('downloadPolicy')){
						document.getElementById('downloadPolicy').src = url;
					}
				}
			}
		}		
	};
	
	$scope.supportWindow = function(){
		var url, params;
		if(! window.focus)return;
		url = "https://www.vendormate.com/content/supplier-request-app?";
		params = "first_name="+$rootScope.userProfile.firstName+"&last_name="+$rootScope.userProfile.lastName+"&00N700000029Wo9="+$rootScope.userProfile.detail.fein+"&company="+$rootScope.userProfile.detail.legalName+"&phone="+$rootScope.userProfile.detail.phone+"&email="+$rootScope.userProfile.userId+"&name="+$rootScope.userProfile.name+"&00N70000002O8hw="+"&"
		var target = url+params;
		var scWin=window.open(target,"SupportCenter","width=525,height=610,resizable=yes,scrollbars=yes");
		scWin.focus();
	};
	
}]);