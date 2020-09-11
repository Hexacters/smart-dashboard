/**
 * Image Cropper
 *
 *  @usage
 *  <div class="col-md-2 vision-padding-0">
		<div id="preview-pane">
			<div class="preview-container">
				<img ng-src="{{cropImageFilePath}}" class="jcrop-preview" alt="Preview" />
			</div>
		</div>
	</div>
	<div class="col-md-10 vision-padding-0 image-cropper">
		<image-cropper src="{{uploadedCropImages}}" id="badgePhoto" request-formatter="$parent.imageCropperRequestCallback" 
		form-node="$parent.data.cropdata" show-preview="true"></image-cropper>
		<file-upload
            max-upload-file-count="1"
            file-size="5"
            return-type="object"
            return-fields="id"

            upload-service="organizationServices"
            upload-operation="uploadFile"
            download-service="organizationServices"
            download-operation="downloadFile"

            upload-response-wrapper="response"
            download-request-wrapper="request"
            download-request-params="id:successData.id,directory:successData.directory"
            id="contracts"
            file-extensions="[jpg,jpeg,gif,png]"
            parent-data-field="$parent.uploadedCropImages">
	    </file-upload>
	</div>
 */
'use strict';
angular.module(appCon.appName).directive('imageCropper', function ($parse, $timeout) {

	return {
		restrict : 'E',
		scope : {
			src : '@',
			id : '@'
		},
		transclude : true,
		template : '<div><div ng-transclude></div></div>',
		link : function (scope, element, attr) {
			var imageTag,
				jcrop_api,
				boundx,
				boundy,
				rx,
				ry,
				showPreview = attr.showPreview ? attr.showPreview : true,
				formNode = attr.formNode ? attr.formNode : '',
				$preview = $('#preview-pane'),
				$pcnt = $('#preview-pane .preview-container'),
				$pimg = $('#preview-pane .preview-container img'),
				xsize = $pcnt.width(),
				ysize = $pcnt.height();

			scope.$watch('src', function (newValue, oldValue) {
				var image_source;
				
				if(newValue === '{}'){
					//clear();
					return;
				} 
				if(!angular.equals(newValue, oldValue) || angular.equals(newValue, oldValue)){
					var requestFormatter = attr.requestFormatter; 
					if(angular.isDefined(requestFormatter)){                	
	                	var requestFormatterFunc = $parse(requestFormatter)(scope);
	                	image_source = requestFormatterFunc(newValue);
	                	if(typeof(image_source) === 'boolean'){                	
	                		return;
	                	}else{
	                		if (image_source) {
	                			clear();
	        					scope.$parent.cropImageFilePath = image_source;
	        					// dynamically create a image tag and assign source
	        					element.after('<img />');
	        					imageTag = element.next();
	        					imageTag.attr('id', attr.id+'_cropperImage');
	        					//imageTag.attr('class', 'vision-padding-0 vision-image-cropper-image');
	        					imageTag.attr('src', image_source);
	        				}
	                		
	                		$('#'+attr.id+'_cropperImage').load(function() {
	                			var height = $('#'+attr.id+'_cropperImage').height(), 
	            				width = $('#'+attr.id+'_cropperImage').width(),
	            				cropHeight = 525, cropWidth = 700;
	            				
	                			if(height < cropHeight){
	                				cropHeight = height;
	                			}
	                			if(width < cropWidth){
	                				cropWidth = width;
	                			}
	                			/*$('#'+attr.id+'_cropperImage').height(cropHeight);
	                			$('#'+attr.id+'_cropperImage').width(cropWidth);*/
	                		$timeout(function () {		
	                			jQuery(imageTag).Jcrop({
		        					onChange : updatePreview,
		        					onSelect : updatePreview,
		        					onRelease : reloadCropper,
		        					aspectRatio : xsize / ysize,
		        					setSelect:   [0, 0, (width) + 70, (height) + 70 ],
		        					minSize: [92, 102],
		        					allowMove: true,
		        					allowResize: true,
		        					allowSelect: false
		        				}, function () {
		        					if (showPreview !== 'false') {
		        						// Use the API to get the real image size
		        						var bounds = this.getBounds();
		        						boundx = bounds[0];
		        						boundy = bounds[1];
		        						// Store the API in the jcrop_api variable
		        						jcrop_api = this;
		        						var c = jcrop_api.tellSelect();
		        						rx = xsize / c.w;
		        						ry = ysize / c.h;

		        						$pimg.css({
		        							width : Math.round(rx * boundx) + 'px',
		        							height : Math.round(ry * boundy) + 'px',
		        							marginLeft : '-' + Math.round(rx * c.x) + 'px',
		        							marginTop : '-' + Math.round(ry * c.y) + 'px'
		        						});
		        						// Move the preview into the jcrop container for css positioning
		        						// $preview.appendTo(jcrop_api.ui.holder);
		        					}
		        				});
	                		});
	                	    });
	                		
	                	}
	                }
				}
			}, true);

			//show preview image
			function updatePreview(c) {
				if (scope.src) {
					$timeout(function () {
						scope.cropInfo = {
							height : Math.round(c.h),
							width : Math.round(c.w),
							leftPosition : c.x,
							topPosition : c.y
						};
						/*if (scope.$parent.imagecropper){
							scope.cropInfo[idField] = scope.$parent.imagecropper;
						}*/
						$parse(formNode).assign(scope, scope.cropInfo);
					});
					if (showPreview != 'false') {
						if (parseInt(c.w) > 0) {
							rx = xsize / c.w;
							ry = ysize / c.h;

							$pimg.css({
								width : Math.round(rx * boundx) + 'px',
								height : Math.round(ry * boundy) + 'px',
								marginLeft : '-' + Math.round(rx * c.x) + 'px',
								marginTop : '-' + Math.round(ry * c.y) + 'px'
							});
						}
					}
				} else {
					angular.element('.jcrop-holder').remove();
					$parse(formNode).assign(scope, {});
				}
			}
			 //reload cropper image
			function reloadCropper(){
				$('#'+attr.id+'_cropperImage').load();
			}
			var clear = function () {
				if (imageTag) {
					imageTag.next().remove();
					imageTag.remove();
					imageTag = undefined;
				}
			};
			scope.$on('$destroy', clear);
		}
	};
});