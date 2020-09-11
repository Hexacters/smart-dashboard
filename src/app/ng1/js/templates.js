angular.module(appCon.appName).run(["$templateCache", function ($templateCache) {
	$templateCache.put('pagination1.html',
		'<div class="bottom">'+
				'	<div ng-if="params.settings().counts.length" id="allocateCargoTable_length" class="dataTables_length">'+
				'		<div class="dataTables_paginate paging_bs_normal">'+
				'			<ul class="pagination ng-table-pagination pull-left">'+
				'				<li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type">'+
				'       			<a ng-switch-when="prev" ng-click="params.page(page.number)" href=""><span class="fa fa-chevron-left"></span>&nbsp;</a>'+
				'            		<a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>'+
				'            		<a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>'+
				'		            <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a>'+
				'		            <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>'+
				'		            <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&nbsp;<span class="fa fa-chevron-right"></span></a>'+
				'		        </li>'+
				'			</ul>'+
				'			<ul class="pagination ng-table-pagination pull-left" ng-show="!pages.length && params.settings().total>0">'+
				'				<li ng-class="{\'disabled\': true}">'+
				'       			<a href=""><span class="fa fa-chevron-left"></span>&nbsp;</a>'+
				'            		<a href=""><span>1</span></a>'+
				'		            <a href="">&nbsp;<span class="fa fa-chevron-right"></span></a>'+
				'		        </li>'+
				'			</ul>'+
				'			<div class="pull-left tableTotalRecords" ng-show="params.settings().total>0">{{((params.page()*params.count())-params.count())+1}} - {{(params.page()*params.count())-(params.count()-params.data.length)}} of {{params.settings().total}}'+
				'		    </div>'+
				'		</div>'+
				'	<div>'+
				'</div>');	

	$templateCache.put('paginationCount1.html',
		'<div class="bottom">'+
				'	<div ng-if="params.settings().counts.length" id="allocateCargoTable_length" class="dataTables_length">'+
				'		<div class="dataTables_paginate paging_bs_normal">'+
				'			<div class="pull-right">'+
				'				<div class="btn-group" ng-show="params.settings().total>0">'+
				'					<button type="button" ng-class="{\'active\':params.count() == 5}" ng-click="params.count(5)" class="btn btn-default">5</button>'+
				'					<button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>'+
				'					<button type="button" ng-class="{\'active\':params.count() == 25}" ng-click="params.count(25)" class="btn btn-default">25</button>'+
				'					<button type="button" ng-class="{\'active\':params.count() == 50}" ng-click="params.count(50)" class="btn btn-default">50</button>'+
				'					<button type="button" ng-class="{\'active\':params.count() == 100}" ng-click="params.count(100)" class="btn btn-default">100</button>'+
				'				</div>'+
				'			</div>'+
				'		</div>'+
				'	<div>'+
				'</div>');
				
	$templateCache.put('pagination3.html',
		'<div class="bottom">'+
				'	<div ng-if="params.settings().counts.length" id="allocateCargoTable_length" class="dataTables_length">'+
				'		<div class="dataTables_paginate paging_bs_normal">'+
				'			<ul class="pagination ng-table-pagination pull-left">'+
				'				<li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch="page.type">'+
				'       			<a ng-switch-when="prev" ng-click="params.page(page.number)" href=""><span class="fa fa-chevron-left"></span>&nbsp;</a>'+
				'            		<a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>'+
				'            		<a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>'+
				'		            <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a>'+
				'		            <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a>'+
				'		            <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&nbsp;<span class="fa fa-chevron-right"></span></a>'+
				'		        </li>'+
				'			</ul>'+
				'			<ul class="pagination ng-table-pagination pull-left" ng-show="!pages.length && params.settings().total>0">'+
				'				<li ng-class="{\'disabled\': true}">'+
				'       			<a href=""><span class="fa fa-chevron-left"></span>&nbsp;</a>'+
				'            		<a href=""><span>1</span></a>'+
				'		            <a href="">&nbsp;<span class="fa fa-chevron-right"></span></a>'+
				'		        </li>'+
				'			</ul>'+
				'			<div class="pull-left tableTotalRecords" ng-show="params.settings().total>0">{{((params.page()*params.count())-params.count())+1}} - {{(params.page()*params.count())-(params.count()-params.data.length)}} of {{params.settings().total}}'+
				'		    </div>'+
				'		</div>'+
				'	<div>'+
				'</div>');	

	$templateCache.put('paginationCount3.html',
		'<div class="bottom">'+
				'	<div ng-if="params.settings().counts.length" id="allocateCargoTable_length" class="dataTables_length">'+
				'		<div class="dataTables_paginate paging_bs_normal">'+
				'			<div class="pull-right">'+
				'				<div class="btn-group pull-right" ng-show="params.settings().total>0">'+
				'					<button type="button" ng-class="{\'active\':params.count() == 5}" ng-click="params.count(5)" class="btn btn-default">5</button>'+
				'					<button type="button" ng-class="{\'active\':params.count() == 10}" ng-click="params.count(10)" class="btn btn-default">10</button>'+
				'				</div>'+
				'			</div>'+
				'		</div>'+
				'	<div>'+
				'</div>');	
}]);