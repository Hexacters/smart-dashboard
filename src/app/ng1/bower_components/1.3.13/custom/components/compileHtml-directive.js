(function() {
	'use strict';

	/**
	 * the compilehtml directive used to compile the HTML code
	 * from JS so as to bind in template
	 * Usage:
	 * <div compile-html="value"></div>
	 */
	angular.module(appCon.appName).directive('compileHtml',
			[ '$compile', function($compile) {
				return {
					restrict : 'A',
					link : function(scope, element, attrs) {
						scope.$watch(function() {
							return scope.$eval(attrs.compileHtml);
						}, function(newValue) {
								element.html(newValue);
								$compile(element.contents())(scope);
						}, true);
					}
				};
			} ]);
})();
