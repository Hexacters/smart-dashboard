//Template for file upload component
angular.module(appCon.appName).run(["$templateCache", function ($templateCache) {
	  $templateCache.put('fileupload.html',
			'<div class="" ng-show="screenMode!=\'view\' && uploadedItems.length < maxUploadFileCount">\
				<input type="file" nv-file-select="" uploader="uploader"/>\
				<span class="validation-invalid">{{fileError}}</span>\
			</div>\
			<div ng-show="(uploadedItems && uploadedItems.length < maxUploadFileCount)">\
				<div>\
					<div class="progress" style="">\
						<div class="progress-bar" role="progressbar" ng-style="{ \'width\': uploader.progress + \'%\' }"></div>\
					</div>\
				</div>\
			</div>\
			<div class="row" style="margin:0px;" ng-show="screenMode!=\'view\'">\
				<table class="table table-striped">\
			  		<tbody>\
						<tr ng-repeat="item in uploadedItems">\
							<td><strong><a href="javascript:;" ng-click="downloadFile(item.successData.id)">{{ item.successData.name }}{{item.successData.fileName}}</a></strong></td>\
							<td nowrap class="col-sm-1">\
								<button type="button" class="btn btn-danger btn-xs" ng-click="removeFile(item)">\
									<span class="fa fa-times"></span>\
								</button>\
							</td>\
						</tr>\
					</tbody>\
				</table>\
			</div>'
	  );
	}
]);

//Custom template for Multiselect, CPanel, LPanel, RPanel, LPanelDraggable, RPanelDraggable
angular.module(appCon.appName).run(["$templateCache", function ($templateCache) {
	$templateCache.put('cpanel.html',
		'<div class="cpanel">\
			<span><input type="button" class="btn btnMultiselect btn-primary cpanelButton" value="&gt;" ng-click="btnRight(lpanel,rpanel)" ></span>\
			<span><input type="button" class="btn btnMultiselect btn-primary cpanelButton" value="&lt;" ng-click="btnLeft(lpanel,rpanel)" ></span>\
			<span><input type="button" class="btn btnMultiselect btn-primary cpanelButton" value="&gt;&gt;" ng-click="btnAllRight(lpanel,rpanel)" ></span>\
			<span><input type="button" class="btn btnMultiselect btn-primary cpanelButton" value="&lt;&lt;" ng-click="btnAllLeft(lpanel,rpanel)" ></span>\
		</div>'
	);
	
	$templateCache.put('cpanel2.html',
			'<div class="cpanel">\
				<span><input type="button" class="cpanelButton" value="&gt;" ng-click="btnRight(lpanel,rpanel2)" ></span>\
				<span><input type="button" class="cpanelButton" value="&lt;" ng-click="btnLeft(lpanel,rpanel2)" ></span>\
				<span><input type="button" class="cpanelButton" value="&gt;&gt;" ng-click="btnAllRight(lpanel,rpanel2)" ></span>\
				<span><input type="button" class="cpanelButton" value="&lt;&lt;" ng-click="btnAllLeft(lpanel,rpanel2)" ></span>\
			</div>'
		);

	$templateCache.put('lpanel.html',
		'<div class="lpanel">\
			<label for="{{lpanel.label}}">{{lpanel.label}}</label>\
			<select tabindex="5000" class="form-control" style="width:100%;" size="{{lpanel.size}}" id="{{lpanel.id}}" ng-model="lpanel.selectedData" name="{{lpanel.id}}" multiple="multiple">\
				<option ng-repeat="item in lpanel.data | orderBy: lpanel.orderBy" value="{{item[lpanel.value]}}">{{item[lpanel.text]}}</option>\
			</select>\
		</div>'
	);
	
	$templateCache.put('lpanelDraggable.html',
		'<div class="lpanel">\
			<label for="{{lpanel.label}}">{{lpanel.label}}</label>\
			<div style="height:160px; overflow:auto; border:1px solid #d0d0d0;">\
				<ul ng-model="$parent.lpanel.data" as-sortable="lpanel.lpanelSortableOptions" class="list-unstyled">\
					<li as-sortable-item="" ng-repeat="item in lpanel.data">\
						<div as-sortable-item-handle="" ng-click="updateSelectedData(item[lpanel.value], lpanel, $event)">\
							{{item[lpanel.text]}}\
						</div>\
					</li>\
				</ul>\
			</div>\
		</div>'
	);

	$templateCache.put('rpanel.html',
		'<div class="rpanel">\
			<label for="{{rpanel.label}}">{{rpanel.label}}</label>\
			<select tabindex="5005" class="form-control" style="width:100%;" size="{{rpanel.size}}" id="{{rpanel.id}}" ng-model="rpanel.selectedData"  multiple="multiple">\
				<option ng-repeat="item in rpanel.data | orderBy: [\'-rpanel.disabledData\', \'rpanel.orderBy\']" ng-disabled="{{item[\'disabledData\']==true}}" value="{{item[rpanel.value]}}">{{item[rpanel.text]}}</option>\
			</select>\
			</div>'
	);
	
	$templateCache.put('rpanelDraggable.html',
		'<div class="rpanel">\
			<label for="{{rpanel.label}}">{{rpanel.label}}</label>\
			<div class="draggableDiv">\
				<ul ng-model="$parent.rpanel.data" as-sortable="rpanel.rpanelSortableOptions" class="list-unstyled">\
					<li as-sortable-item="" ng-repeat="item in rpanel.data">\
						<div as-sortable-item-handle="" ng-click="updateSelectedData(item[rpanel.value], rpanel, $event)">\
							{{item[rpanel.text]}}\
						</div>\
					</li>\
				</ul>\
			</div>\
		</div>'
	);
	
	$templateCache.put('rpanel2.html',
		'<div class="rpanel">\
			<label for="{{rpanel2.label}}">{{rpanel2.label}}</label>\
			<select tabindex="5005" style="width:100%;" size="{{rpanel2.size}}" id="{{rpanel2.id}}" ng-model="rpanel2.selectedData" name="{{rpanel2.id}}" multiple="multiple">\
				<option ng-repeat="item in rpanel2.data | orderBy: [\'-rpanel2.disabledData\', \'rpanel2.orderBy\']" value="{{item[rpanel2.value]}}">{{item[rpanel2.text]}}</option>\
			</select>\
		</div>'
	);
	
	$templateCache.put('comboInput.html',
		'<select ng-model="selectedModel" ng-options="item[nameField] for item in comboData" class="form-control" name="{{name}}">\
			<option value="">Select {{name}}</option>\
		</select>'
	);
}])

/*Custom Template for ngTable filters, pagination styles*/
angular.module('ngTable').run(['$templateCache', function ($templateCache) {
	$templateCache.put('checkbox.html','<input type="checkbox" ng-model="checkAll.checked" id="checkAll" name="filter-checkbox" value="" />');
	
	$templateCache.put('style1',
			'<ul class="pager ng-cloak">\
				<li ng-repeat="page in pages"\
					ng-class="{\'disabled\': !page.active, \'previous\': page.type == \'prev\', \'next\': page.type == \'next\'}"\
					ng-show="page.type == \'prev\' || page.type == \'next\'" ng-switch="page.type">\
					<a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo; Previous</a>\
					<a ng-switch-when="next" ng-click="params.page(page.number)" href="">Next &raquo;</a>\
				</li>\
				<li>\
					<div class="btn-group" ng-show="params.settings().total>0">\
						<button type="button" ng-class="{\'active\':params.count() == 5}" ng-click="params.count(5)" class="btn btn-default">5</button>\
						<button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>\
						<button type="button" ng-class="{\'active\':params.count() == 25}" ng-click="params.count(25)" class="btn btn-default">25</button>\
						<button type="button" ng-class="{\'active\':params.count() == 50}" ng-click="params.count(50)" class="btn btn-default">50</button>\
					</div>\
				</li>\
			</ul>'
		);
		
		$templateCache.put('style2',
			'<ul class="pager ng-cloak">\
				<li ng-repeat="page in pages"\
					ng-class="{\'disabled\': !page.active, \'previous\': page.type == \'prev\', \'next\': page.type == \'next\'}"\
					ng-show="page.type == \'prev\' || page.type == \'next\'" ng-switch="page.type">\
					<a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo; Previous</a>\
					<a ng-switch-when="next" ng-click="params.page(page.number)" href="">Next &raquo;</a>\
				</li>\
				<li>\
					<div class="btn-group" ng-show="params.settings().total>0">\
						<button type="button" ng-class="{\'active\':params.count() == 5}" ng-click="params.count(5)" class="btn btn-default">5</button>\
						<button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>\
					</div>\
				</li>\
			</ul>'
		);
		
		$templateCache.put('style3',
			'<div class="bottom">\
				<div ng-if="params.settings().counts.length" id="allocateCargoTable_length" class="dataTables_length">\
					<div class="dataTables_paginate paging_bs_normal">\
						<ul class="pagination ng-table-pagination pull-left">\
							<li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type">\
			        			<a ng-switch-when="prev" ng-click="params.page(page.number)" href=""><span class="fa fa-chevron-left"></span>&nbsp;Previous</a>\
			            		<a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>\
			            		<a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>\
					            <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a>\
					            <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>\
					            <a ng-switch-when="next" ng-click="params.page(page.number)" href="">Next&nbsp;<span class="fa fa-chevron-right"></span></a>\
					        </li>\
						</ul>\
						<div class="btn-group pull-right" ng-show="params.settings().total>0">\
							<button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>\
							<button type="button" ng-class="{\'active\':params.count() == 25}" ng-click="params.count(25)" class="btn btn-default">25</button>\
							<button type="button" ng-class="{\'active\':params.count() == 50}" ng-click="params.count(50)" class="btn btn-default">50</button>\
							<button type="button" ng-class="{\'active\':params.count() == 100}" ng-click="params.count(100)" class="btn btn-default">100</button>\
						</div>\
					</div>\
				<div>\
			</div>'
		);
		
		$templateCache.put('style4',
				'<div class="bottom">\
					<div ng-if="params.settings().counts.length" id="allocateCargoTable_length" class="dataTables_length">\
						<div class="dataTables_paginate paging_bs_normal">\
							<ul class="pagination ng-table-pagination pull-left">\
								<li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type">\
				        			<a ng-switch-when="prev" ng-click="params.page(page.number)" href=""><span class="fa fa-chevron-left"></span>&nbsp;Previous</a>\
				            		<a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>\
				            		<a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>\
						            <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a>\
						            <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>\
						            <a ng-switch-when="next" ng-click="params.page(page.number)" href="">Next&nbsp;<span class="fa fa-chevron-right"></span></a>\
						        </li>\
							</ul>\
							<div class="btn-group pull-right" ng-show="params.settings().total>0">\
								<button type="button" ng-class="{\'active\':params.count() == 5}" ng-click="params.count(5)" class="btn btn-default">5</button>\
								<button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>\
								<button type="button" ng-class="{\'active\':params.count() == 50}" ng-click="params.count(50)" class="btn btn-default">50</button>\
								<button type="button" ng-class="{\'active\':params.count() == 100}" ng-click="params.count(100)" class="btn btn-default">100</button>\
							</div>\
						</div>\
					<div>\
				</div>'
			);		
		
}]);

//Template for file upload component
angular.module(appCon.appName).run(["$templateCache", function ($templateCache) {
	  $templateCache.put('check-all.html',
			'<input type="checkbox" vm-check-all="input.check"\
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
			'<div>ds</div>'
	  );
	}
]);