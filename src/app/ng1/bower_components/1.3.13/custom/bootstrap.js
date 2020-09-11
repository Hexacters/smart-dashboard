(function () {
	'use strict';
	
	angular.module(appCon.appName, appCon.modules);
	
	angular.element(document).ready(function() {
		var $injector = angular.injector(['ng']), 
			$http = $injector.get('$http'),
			$q = $injector.get('$q'),
			routersAndServicesFilePaths = [];
		
		$http.get('app/ng1/config/config.json?rnd='+new Date().getTime()).success(function(config){
			appCon.globalCon = config;
			//Added deploy date/random number to fix the cache issue
			if(angular.isUndefined(appCon.globalCon.deployDate) || appCon.globalCon.deployDate ==''){
				appCon.globalCon.deployDate = new Date().getTime();
			}
			if(angular.isDefined(appCon.globalCon.initModule) && angular.isDefined(appCon.globalCon.initModule.file)){
				if(angular.isArray(appCon.globalCon.initModule.file)){
					angular.forEach(appCon.globalCon.initModule.file, function(routersAndServicesFilePath) {
						//Added deploy date/random number to fix the cache issue
						routersAndServicesFilePath = routersAndServicesFilePath +'?rnd='+appCon.globalCon.deployDate;
						routersAndServicesFilePaths.push($http.get(routersAndServicesFilePath, {'cache': false}));	
					});
				}else{
					routersAndServicesFilePaths.push($http.get(appCon.globalCon.initModule.file +'?rnd='+appCon.globalCon.deployDate, {'cache': false}));
				}
				$q.all(routersAndServicesFilePaths).then(function(routersAndServices) {
					if(routersAndServices) {
						console.log('routersAndServices', routersAndServices);
						appCon.registerRouterAndFactories(routersAndServices);
						angular.bootstrap(document, [appCon.appName]);
						return;
					}
				});
			}
		});
	});
})();