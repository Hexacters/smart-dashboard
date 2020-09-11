'use strict';
angular.module(appCon.appName).controller('documentAlertController', ['$scope', '$window', '$state', '$modal', '$rootScope', '$injector', function($scope, $window, $state, $modal, $rootScope, $injector) {
    $scope.vendorCompanyNameLabel = 'Vendors';
    $scope.vendorLegalNameLabel = 'Vendor Reps';
    $scope.vendorCompanyName = '';
    $scope.vendorLegalName = '';
    $scope.flag = '';
    $scope.getAccountCompanyName = function(oId, CompanyName) {
        $scope.vendorCompanyName = CompanyName;
        $scope.vendorCompanyNameLabel = CompanyName + ' > Vendors';
        $scope.oId = oId;
    };

    $scope.getVendorLegalName = function(vOid, LegalName) {
        $scope.vendorLegalName = LegalName;
        $scope.vendorLegalNameLabel = LegalName + ' > Vendor Reps';
        $scope.vOid = vOid;
        $scope.flag = true;
    };
}]);