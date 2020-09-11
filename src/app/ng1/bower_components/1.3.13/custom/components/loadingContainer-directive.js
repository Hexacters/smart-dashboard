'use strict';
/**
 * @Component loading-container = "$scope promises" whether true / false
 * @Usage <div loading-container="loading"></div>
 */
angular.module(appCon.appName).directive('loadingContainer', ["$http", function ($http) {
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, element, attrs) {
			var loadingLayer = angular.element('<div class="loading"></div>');
			element.append(loadingLayer);
			element.addClass('loading-container');
			scope.isLoading = function () {
				return $http.pendingRequests.length > 0;
            };
            
			scope.$watch(scope.isLoading, function (value) {
				loadingLayer.toggleClass('ng-hide', !value);
			});
		}
	};
}]);


/**
 * @Component State-switch loading indicator
 * @Usage <state-loading-indicator></state-loading-indicator>
 */
angular.module(appCon.appName).directive('stateLoadingIndicator', function($rootScope,ngProgressFactory) {
  return {
    restrict: 'E',
    replace: true,
    link: function(scope, elem, attrs) {
      scope.isStateLoading = ngProgressFactory.createInstance();

      $rootScope.$on('$stateChangeStart', function() {
        scope.isStateLoading.start();
      });
      $rootScope.$on('$stateChangeSuccess', function() {
        scope.isStateLoading.complete();
      });
      $rootScope.$on('$stateChangeError', function() {
    	  scope.isStateLoading.complete();
      });
    }
  };
});

/* angular.module(appCon.appName).directive('stateLoadingIndicator', function($rootScope) {
  return {
    restrict: 'E',
	template: "<div ng-show='isStateLoading'><img align='absmiddle' data-ng-src='img/partial-loading.gif' />&nbsp;loading...</div>",
    replace: true,
    link: function(scope, elem, attrs) {
      scope.isStateLoading = false;

      $rootScope.$on('$stateChangeStart', function() {
        scope.isStateLoading = true;
      });
      $rootScope.$on('$stateChangeSuccess', function() {
        scope.isStateLoading = false;
      });
    }
  };
}); */

/**
 * @Component loading-container = "$scope promises" whether true / false
 * @Usage <div section-loading-container="loading"></div>
 */
angular.module(appCon.appName).directive('sectionLoadingContainer', function () {
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, element, attrs) {
			var loadingLayer = angular.element('<div class="loading"></div>');
			element.append(loadingLayer);
			element.addClass('section-loading-container');
			scope.$watch(attrs.sectionLoadingContainer, function (value) {
				loadingLayer.toggleClass('ng-hide', !value);
			});
		}
	};
});