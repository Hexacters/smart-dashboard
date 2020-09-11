'use strict';
var appCon = {};
appCon.appName='vendorDash';
var app = angular.module(appCon.appName, ["pascalprecht.translate","ngSanitize"]);
app.config(function($translateProvider) {
	$translateProvider.preferredLanguage("en-US");
	$translateProvider.useStaticFilesLoader({
		prefix: 'app/ng1/locale/messages_properties_',
		suffix: '.json'
	});
})
.controller("errorController", ["$scope", "$rootScope", "$injector", "$location","$http", function($scope, $rootScope, $injector, $location,$http) {
	$scope.random = new Date().getTime();
	console.log("errro");
	$http.get('config/config.json?rnd='+new Date().getTime()).then(function(response) {
		appCon.globalCon = response.data;
		$scope.portalUrl = {url:appCon.globalCon.ghxPortalUrl};
	});
}]);