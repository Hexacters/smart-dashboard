'use strict';
/**
 * File upload - Component
 * 
 * @classes used in templateUrl
 * .file-upload-progress
 * .file-upload-progress-bar
 * .file-upload-items
 * .file-upload-remove
 *  
 * @attr: upload-response-wrapper
 * Read the response data by wrapper object from json and assign into fileUpload scope object.
 * 
 * @attr: download-request-params 
 * For scope values, please use ":" delimiter, For ex: download-request-params = 'id:successData.blobVO.id,directory:successData.blobVO.directory'
 * For static values, please use '=' delimiter, For ex: download-request-params = 'id=12345,directory=images'
 *  
 * @usage
 * <file-upload 
		max-upload-file-count="1" 
		files-list="data.organizationVO.logo" //In edit form, this attributes is needed.
		screen-mode='view/cropper' //Only view screen, this attributes is needed.
		file-size="5" 
		return-type="string" 
		return-fields="successData.blobVO.id"
		
		upload-service="organizationServices"
		upload-operation="uploadContractFile"
        download-service="organizationServices"
        download-operation="downloadContractFile"
		 
		upload-response-wrapper="response" //Response wrapper object definition to read response after file uploaded, if needed.
		download-request-params="id:successData.blobVO.id,directory:successData.blobVO.directory" //list here, what are the parameters need to send as request for download 
		file-extensions="[jpg,jpeg,gif,png]" 
		parent-data-field="$parent.data.organizationVO.logo.id"
		id="uploaderId"
		responseCallback="$parent.responseCallback"
		on-after-adding-file-callback=""
		>
	</file-upload>
 * 
 */   
angular.module(appCon.appName).directive('fileUpload', ['FileUploader','$injector','$rootScope','$state', '$parse', '$window', '$translate', '$location',
                                                        function(FileUploader, $injector, $rootScope, $state, $parse, $window, $translate, $location) {
	var maxUploadFileCount = 1, 
    allowedExtensions = '', 
    isMockEnabled = false, 
    autoUpload=appCon.globalCon.file.autoUpload ? appCon.globalCon.file.autoUpload : false, 
    allowedFileSize = appCon.globalCon.file.maxFileSize ? appCon.globalCon.file.maxFileSize : 1,
    maxFileSize = (allowedFileSize) * 1024 * 1024,
    uploader;
	
    return {
        restrict: 'EAC',
        templateUrl: function(elem,attrs) {
			return attrs.templateUrl || 'fileupload.html'
		},
        scope: {
            maxFiles: '@',
            fileSize: '@',
            fileExtensions: '@',
            filesList: '=',
            returnType: '@',
            returnFields: '@',
            uploadResponseWrapper: '@',
            downloadRequestParams: '@',
            screenMode: '@',
			id:'@',
			thumbnailType:'@',
			rootNode:'@',
			responseCallback:'@',
			onAfterAddingFileCallback:'@',
			requiredMessageId:'@'
				
        },
        controller: function($scope, $element, $attrs) {
        	
        	$scope.uploadedItemFromFile = false;
        	
        	$scope.returnType = angular.isDefined($scope.returnType) ? $scope.returnType : 'string'; 
        	$scope.returnFields = angular.isDefined($scope.returnFields) ? $scope.returnFields : 'id';
        	$scope.thumbnailType = angular.isDefined($scope.thumbnailType) ? '&'+$scope.thumbnailType : ''; 
        	maxUploadFileCount = $attrs.maxUploadFileCount ? $attrs.maxUploadFileCount : 1; 
    	    allowedExtensions = $attrs.fileExtensions ? $attrs.fileExtensions : '*';
    	    $scope.maxUploadFileCount = maxUploadFileCount;
    	    
            if (angular.isDefined($attrs.fileSize)) {
               allowedFileSize = $attrs.fileSize;
               maxFileSize = (allowedFileSize) * 1024 * 1024;
            }
            
            allowedExtensions = allowedExtensions.replace(/,/g, '|');
            allowedExtensions = allowedExtensions.replace('[', '|');
            allowedExtensions = allowedExtensions.replace(']', '|');
            
            /**Set uploadeded items in global scope variable either list of object(s)/string or single object*/
            $scope.uploadedItems = [];
            
            /**Upload object initialization*/
            var httpUploadRequest = $injector.get($attrs.uploadService)[$attrs.uploadOperation]();
            uploader = $scope.uploader = new FileUploader({
            	url: httpUploadRequest.url + $scope.thumbnailType,
                autoUpload : autoUpload
            });

			/**Filter - file type*/
            uploader.filters.push({
                name: 'typeFilter',
                fn: function(item /*{File|FileLikeObject}*/) {
                    var fileExtension = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';
                    return allowedExtensions.toLowerCase().indexOf(fileExtension.toLowerCase()) !== -1;
                }
            });
            
            /**Filter - file size*/
            uploader.filters.push({
                name: 'sizeFilter',
                fn: function(item /*{File|FileLikeObject}*/) {
                    return item.size <= maxFileSize;
                }
            });
            
            /**Filter - file count*/
            uploader.filters.push({
                name: 'customFilter',
                fn: function() {
                    return $scope.uploadedItems.length <= maxUploadFileCount;
                }
            });
            
            /**Filter - file name length*/
            uploader.filters.push({
                name: 'fileNameLengthFilter',
                fn: function(item /*{File|FileLikeObject}*/) {
                    return item.name.length <= 100;
                }
            });
            
            /**Filter - valid file name*/
            uploader.filters.push({
                name: 'fileNameCharacterFilter',
                fn: function(item /*{File|FileLikeObject}*/) {
                    return item.name.match(/^[a-zA-Z0-9\s-*&()!@#$%^|\\/\:;?_+=.,`~'"]+$/)=== null ? false : true;
                }
            });
            
            /**Update uploaded items, if template is in edit mode*/	            
            $scope.$watch('filesList', function() {
            	var filesList = $scope.filesList;
            	if($scope.uploadedItemFromFile === false){
            		$scope.uploadedItems = [];
	            	if (angular.isDefined(filesList)) {
	                	if(angular.isArray(filesList)) {
		            		angular.forEach(filesList, function(file) {
		            			if(angular.isObject(file) && !(_.isEmpty(file))) {
		            				$scope.uploadedItems.push({'successData':file});
		            			}
			            	});
		            	}else{
		            		if(angular.isObject(filesList) && !(_.isEmpty(filesList))) {
		            			$scope.uploadedItems.push({'successData':filesList});
		            		}
		            	}
	            	}
                	//updateFileuploadedDataToScope();
                }
            });
            
            /**Validate uploaded file*/
            uploader.onWhenAddingFileFailed = function(item, filter) {
                var filterName = filter.name;
                switch (filterName) { 
                    case 'typeFilter':
                    	if(angular.isDefined($attrs.fileFormatErrorMsg)){
                    		$scope.fileError = $translate.instant($attrs.fileFormatErrorMsg);
                    	}else{
                    		$scope.fileError = $translate.instant('common.invalidFileFormat');
                    	}                      
                        break;
                    case 'sizeFilter':
                    	if(angular.isDefined($attrs.fileSizeErrorMsg)){
                    		$scope.fileError = $translate.instant($attrs.fileSizeErrorMsg);
                    	}else{
                    		$scope.fileError = $translate.instant('common.invalidFileSize'+allowedFileSize+'MB');
                    	}                    	
                        break;
                    case 'customFilter':
                    	if(angular.isDefined($attrs.fileMaximumErrorMsg)){
                    		$scope.fileError = $translate.instant($attrs.fileMaximumErrorMsg);
                    	}else{
                    		$scope.fileError = $translate.instant('common.maxFilesUploaded');
                    	}                        
                        break;
                    case 'fileNameLengthFilter':
                    	if(angular.isDefined($attrs.fileNameLengthErrorMsg)){
                    		$scope.fileError = $translate.instant($attrs.fileNameLengthErrorMsg);
                    	}else{
                    		$scope.fileError =  $translate.instant('common.fileMaxLength');
                    	}                    	
                        break;
                    case 'fileNameCharacterFilter':
                    	if(angular.isDefined($attrs.fileNameCharErrorMsg)){
                    		$scope.fileError = $translate.instant($attrs.fileNameCharErrorMsg);
                    	}else{
                    		$scope.fileError = $translate.instant('common.invalidFileName');
                    	}                    	
                        break;    
                    default:
                        $scope.fileError = '';
                }
            };
            uploader.onAfterAddingFile = function() {
            	if(angular.isDefined($scope.onAfterAddingFileCallback)){
                	var onAfterAddingFileCallbackFunc = $parse($scope.onAfterAddingFileCallback)($scope);
                	onAfterAddingFileCallbackFunc($scope);
                }
                $scope.fileError = '';
            };
            uploader.onAfterAddingAll = function() {
                $scope.fileError = '';
            };
            
            /**Update uploaded files into form scope*/
            var updateFileuploadedDataToScope = function(){
            	var uploadedItemsArr = [], fileUploadObj={}, returnType, returnFields, getFileResponse;
            	
            	for (var i = $scope.uploadedItems.length - 1; i >= 0; i--) {
            		if($scope.returnType === 'list'){
            			var returnFields = $scope.returnFields;
            			returnFields = returnFields.split(',');
            			fileUploadObj={};
            			for (var j = 0; j < returnFields.length; j++){
            				var splitedPair;
            				if(returnFields[j].indexOf(':')>=0){
            					splitedPair = returnFields[j].split(':'); 
            					getFileResponse = _.get($scope.uploadedItems[i], splitedPair[1]);
	            				_.set(fileUploadObj, splitedPair[0], getFileResponse);
            				}else{
            					getFileResponse = _.get($scope.uploadedItems[i], returnFields[j]);
            					_.set(fileUploadObj, returnFields[j], getFileResponse);
            				}
            				
            			}
            			uploadedItemsArr.push(fileUploadObj);
            		} else {
            			uploadedItemsArr.push(_.get($scope.uploadedItems[i],returnFields));
            		}
            	}
              	if($scope.returnType === 'object'){
              		if($scope.rootNode && $scope.uploadedItems[0] && $scope.uploadedItems[0].successData){
              			uploadedItemsArr = _.get( $scope.uploadedItems[0], $scope.rootNode);
              		}else{
              			uploadedItemsArr = $scope.uploadedItems[0];
              		}
        			
        		}
            	
                $scope.$evalAsync(function(){
                	if($scope.returnType !== 'list' && $scope.returnType !== 'object'){
                		uploadedItemsArr = uploadedItemsArr.join(',');
                	}
                	if(angular.isDefined($attrs.parentDataField)){
                		$parse($attrs.parentDataField).assign($scope, uploadedItemsArr ? uploadedItemsArr : {});
                	}
                });
            };
            
            uploader.onCompleteItem = function(item, response, status, headers) {
            	$scope.uploadedItemFromFile = true;
            	var wrapperObject = {};
				if(angular.isDefined($scope.uploadResponseWrapper)){
            		wrapperObject._responseWrapper = $scope.uploadResponseWrapper; 
            	}
            	response = _transformResponse(response, headers, wrapperObject);
            	
            	if($scope.uploadedItems && response && status === 200){
					$scope.uploader.progress = 0;
					if(response.status === 'success'){
						$scope.uploadedItems.push(response);
						updateFileuploadedDataToScope();
					}else{
						 $scope.fileError = response.errorData.ResponseError[0].errorCode;
					}					
            	}
            	uploader.clearQueue();

            	if(angular.isDefined($scope.responseCallback)){
                	var requestFormatterFunc = $parse($scope.responseCallback)($scope);
                	var params = requestFormatterFunc(response, $scope);
                	if(typeof(params) === 'boolean'){
                		return;
                	}
                }
            	
            	if($scope.screenMode === 'cropper'){
            		$scope.uploadedItems = [];
            	}
            };
            
            $scope.downloadFileUrl = function(downloadObj){
				var downloadUrlParams = {}, wrapperObject= {}, downloadRequestParamsObj, splitedParamObj;
            	if(angular.isUndefined($scope.downloadRequestParams)){
            		$scope.downloadRequestParams = 'id';
            	}
            	if(_.indexOf($scope.downloadRequestParams,',')>=0){
            		downloadRequestParamsObj = $scope.downloadRequestParams.split(',');
            		for (var k=0; k < downloadRequestParamsObj.length; k++){
            			splitedParamObj = {};
            			if(downloadRequestParamsObj[k] && _.indexOf(downloadRequestParamsObj[k], '=') >=0 ){
            				splitedParamObj = downloadRequestParamsObj[k].split('=');
            				downloadUrlParams[splitedParamObj[0]] = splitedParamObj[1]; 
            			}else if(downloadRequestParamsObj[k] && _.indexOf(downloadRequestParamsObj[k], ':') >=0 ){
            				splitedParamObj = downloadRequestParamsObj[k].split(':');
            				downloadUrlParams[splitedParamObj[0]] = _.get(downloadObj, splitedParamObj[1]);
            			}
            		}
            	}else{
            		downloadRequestParamsObj = $scope.downloadRequestParams;
            		if(downloadRequestParamsObj){
            			if(_.indexOf(downloadRequestParamsObj, '=') >=0 ){
            				splitedParamObj = downloadRequestParamsObj.split('=');
            				downloadUrlParams[splitedParamObj[0]] = splitedParamObj[1]; 
            			}else if(_.indexOf(downloadRequestParamsObj, ':') >=0 ){
            				splitedParamObj = downloadRequestParamsObj.split(':');
            				downloadUrlParams[splitedParamObj[0]] = _.get(downloadObj, splitedParamObj[1]);
            			}else{
            				downloadUrlParams[downloadRequestParamsObj] = _.get(downloadObj, downloadRequestParamsObj);
            			}
            		}
            	}
            	
            	var httpDownloadRequest = $injector.get($attrs.downloadService)[$attrs.downloadOperation](downloadUrlParams);
            	var downloadFilePath = httpDownloadRequest.url;
            	
				if(downloadFilePath.indexOf('?') >=0 ){
					downloadFilePath += '&'+httpDownloadRequest.data;
				}else{
					downloadFilePath += '?'+httpDownloadRequest.data;
				}
				var exporturl = '';
				var urlIndex = ($location.absUrl()).indexOf('/#/');
				if(urlIndex !== -1){
					exporturl = $location.absUrl().substr(0, $location.absUrl().lastIndexOf("/#/"));
				}else{
					var contextPath = ($location.absUrl()).split('/')[3];
					exporturl = ($location.absUrl()).split("/"+contextPath+"/");
					exporturl = exporturl[0]+"/"+ contextPath;
				}
            	$window.open(exporturl +"/"+ downloadFilePath, 'popup','width=1000,height=500,scrollbars=1,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0');            	
            };
            
            $scope.deleteFile = function(item){
            	delete $scope[item];
            };
            
            $scope.removeFile = function(item){
            	reset_form_element( $('#'+$scope.id) );
				$scope.uploader.progress = 0;
				if($scope.imagecropper){
            		delete $scope.imagecropper;
            	}
				if ($scope.uploadedItems){
	            	//var uploadedId = [];
	            	for (var i = $scope.uploadedItems.length - 1; i >= 0; i--) {
	            		if (item.successData.id === $scope.uploadedItems[i].successData.id){
	            			$scope.uploadedItems.splice(i,1);
	            		}/*else{
	            			uploadedId.push($scope.uploadedItems[i].successData.id);
	            		}*/
	            	}
	            	updateFileuploadedDataToScope();
	            	/*$scope.$evalAsync(function(){
	                	if($scope.returnType === 'list'){
							$parse($attrs.parentDataField).assign($scope, uploadedId.length > 0 ? uploadedId : []);
						}else{
							uploadedId = uploadedId.join(',');
							$parse($attrs.parentDataField).assign($scope, uploadedId > 0 ? uploadedId : {});
						}
	                });*/
            	}
            };
        }
    };
}]);

angular.module(appCon.appName).run(['$templateCache', function ($templateCache) {
	$templateCache.put('fileupload.html',
		'<div class="" ng-show="screenMode!=\'view\' && uploadedItems.length < maxUploadFileCount">'+
		'	<input type="file" nv-file-select="" id="{{id}}" ng-disabled="uploader.progress > 0 && uploader.progress != \'NaN\'" uploader="uploader"/>'+
		'	<span class="validation-invalid">{{fileError | translate}}</span><span ng-if="requiredMessageId" ng-show="!fileError" id="{{requiredMessageId}}" class="validation-invalid"></span>'+
		'</div>'+
		'<div ng-show="(uploadedItems && uploadedItems.length < maxUploadFileCount) && uploader.progress">'+
		'	<div>'+
		'		<div class="progress file-upload-progress" style="">'+
		'			<div class="progress-bar file-upload-progress-bar" role="progressbar" ng-style="{ \'width\': uploader.progress + \'%\' }"></div>'+
		'		</div>'+
		'	</div>'+
		'</div>'+
		'<div class="row" style="margin:0px;" ng-show="screenMode!=\'view\'">'+
		'	<table class="table file-upload-items">'+
		'  		<tbody>'+
		'			<tr ng-repeat="item in uploadedItems">'+
		'				<td>' +
		'					<strong>' +
		'						<a href="javascript:;" ng-click="downloadFileUrl(item)">' +
		'							{{ item.successData.name }}{{item.successData.fileName}}'+
		'						</a>' +
		'					</strong>' +
		'				</td>' +
		'				<td nowrap class="col-sm-1">'+
		'					<button type="button" class="btn file-upload-remove text-primary" ng-click="downloadFileUrl(item)">'+
		'						<span class="material-icons">remove_red_eye</span>'+
		'					</button>'+
		'				</td>'+
		'				<td nowrap class="col-sm-1">'+
		'					<button type="button" class="btn file-upload-remove text-danger" ng-click="removeFile(item)">'+
		'						<span class="material-icons">cancel</span>'+
		'					</button>'+
		'				</td>'+
		'			</tr>'+
		'		</tbody>'+
		'	</table>'+
		'</div>'
	  );
	}
]);