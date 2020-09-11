/*Custom Template for ngTable filters, pagination styles*/
angular.module('ngTable').run(['$templateCache', function ($templateCache) {
	$templateCache.put('checkbox.html','<input ng-if="$data.status !== \'error\'" type="checkbox" ng-click="parentCKbox()" ng-model="checkAll.checked" id="checkAll" name="filter-checkbox" value="" />');
}]);

//Template for file upload component
angular.module(appCon.appName).run(["$templateCache", function ($templateCache) {
	  $templateCache.put('check-all.html',
			  '<input type="checkbox" vision-check-all="input.check"\
			  check-container-closest=".table"\
		            check-model="checkboxes"\
		            checked-entities="checkedEntities"\
		            check-reselect="true"\
		            data="params.data"/>'
	  );
	}
]);

//Template for VMFormExtras Directive
angular.module(appCon.appName).run(["$templateCache", function ($templateCache) {
	$templateCache.put('DeleteAlert.html',
			'<div class="modal-header">\
				<h4 class="modal-title" ng-bind-html="modalTitle"></h4>\
			</div>\
			<div class="modal-body">\
				<div>\
					<span ng-bind-html="requestMessage"></span>\
				</div>\
			</div>\
			<div class="modal-footer">\
				<button id="orgAlertsModalOk" type="button" class="btn btn-success" ng-click="$close(\'ok\')">Ok</button>\
				<button id="orgAlertsModalCancel" type="button" class="btn btn-danger" ng-click="$dismiss(\'cancel\')">Cancel</button>\
			</div>'
		);
	
	$templateCache.put('ErrorAlert.html',
			'<div class="modal-header">\
			<h4 class="modal-title" ng-bind-html="modalTitle"></h4>\
		</div>\
		<div class="modal-body">\
			<div class="table-responsive">\
				<div class="text-danger" ng-repeat="error in errorMessage.ResponseError">\
					<span class="fa fa-warning" aria-hidden="true">&nbsp;</span>\
					{{error.errorCode | translate}}\
				</div>\
			</div>\
		</div>\
		<div class="modal-footer">\
			<button id="orgAlertsModalCancel" type="button" class="btn btn-danger" ng-click="$dismiss(\'cancel\')">Cancel</button>\
		</div>'
		);
	}
]);
//Template for image cropper upload component
angular.module(appCon.appName).run(["$templateCache", function ($templateCache) {
	  $templateCache.put('imagecropper.html',
			'<div>\
			  <file-upload max-upload-file-count="1" file-size="5" file-extensions="[jpg,jpeg,gif,png]" parent-data-field="$parent.$parent.imagecropper"></file-upload>\
			</div>'
	  );
	}
]);