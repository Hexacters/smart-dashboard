'use strict';

angular.module('angularAcl', []);

angular.module('angularAcl').provider('aclService', [
  function () {

    /**
     * Polyfill for IE8
     *
     * http://stackoverflow.com/a/1181586
     */
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (needle) {
        var l = this.length;
        for (; l--;) {
          if (this[l] === needle) {
            return l;
          }
        }
        return -1;
      };
    }
    
    var permissionObject=[], permissionCommands=[];

    var config = {
      //storage: 'sessionStorage',
      storage: 'false',
      storageKey: 'aclService'
    };

    var data = {
      roles: [],
      abilities: {},
      permissions:{}    
    };

    /**
     * Does the given role have abilities granted to it?
     *
     * @param role
     * @returns {boolean}
     */
    var roleHasAbilities = function (role) {
      return (typeof data.abilities[role] === 'object');
    };

    /**
     * Retrieve the abilities array for the given role
     *
     * @param role
     * @returns {Array}
     */
    var getRoleAbilities = function (role) {
      return (roleHasAbilities(role)) ? data.abilities[role] : [];
    };

    /**
     * Persist data to storage based on config
     */
    var save = function () {    	
      switch (config.storage) {
        case 'sessionStorage':
          saveToStorage('sessionStorage');
          break;
        case 'localStorage':
          saveToStorage('localStorage');
          break;
        default:
          // Don't save
          return;
      }
    };

    /**
     * Persist data to web storage
     */
    var saveToStorage = function (storagetype) {
      window[storagetype].setItem(config.storageKey, JSON.stringify(data));
    };

    /**
     * Retrieve data from web storage
     */
    var fetchFromStorage = function (storagetype) {
      var data = window[storagetype].getItem(config.storageKey);
      return (data) ? JSON.parse(data) : false;
    };

    var aclService = {};


    /**
     * Restore data from web storage.
     *
     * Returns true if web storage exists and false if it doesn't.
     *
     * @returns {boolean}
     */
    aclService.resume = function () {
      var storedData;

      switch (config.storage) {
        case 'sessionStorage':
          storedData = fetchFromStorage('sessionStorage');
          break;
        case 'localStorage':
          storedData = fetchFromStorage('localStorage');
          break;
        default:
          storedData = null;
      }
      if (storedData) {
        angular.extend(data, storedData);
        return true;
      }

      return false;
    };

    /**
     * Attach a role to the current user
     *
     * @param role
     */
    aclService.attachRole = function (role) {
      if (data.roles.indexOf(role) === -1) {
        data.roles.push(role);
        save();
      }
    };

    /**
     * Remove role from current user
     *
     * @param role
     */
    aclService.detachRole = function (role) {
      var i = data.roles.indexOf(role);
      if (i > -1) {
        data.roles.splice(i, 1);
        save();
      }
    };

    /**
     * Remove all roles from current user
     */
    aclService.flushRoles = function () {
      data.roles = [];
      save();
    };

    /**
     * Check if the current user has role attached
     *
     * @param role
     * @returns {boolean}
     */
    aclService.hasRole = function (role) {
      return (data.roles.indexOf(role) > -1);
    };

    /**
     * Set the abilities object (overwriting previous abilities)
     *
     * Each property on the abilities object should be a role.
     * Each role should have a value of an array. The array should contain
     * a list of all of the roles abilities.
     *
     * Example:
     *
     *    {
     *        guest: ['login'],
     *        user: ['logout', 'view_content'],
     *        admin: ['logout', 'view_content', 'manage_users']
     *    }
     *
     * @param abilities
     */
    aclService.setAbilities = function (abilities) {
      data.abilities = abilities;
      save();
    };

    /**
     * Add an ability to a role
     *
     * @param role
     * @param ability
     */
    aclService.addAbility = function (role, ability) {
      if (!data.abilities[role]) {
        data.abilities[role] = [];
      }
      data.abilities[role].push(ability);
      save();
    };

    /**
     * Does current user have permission to do something?
     *
     * @param ability
     * @returns {boolean}
     */    
    aclService.can = function (ability) {    	
      var role, abilities;
      // Loop through roles
        var l = data.roles.length;
      for (; l--;) {
        // Grab the the current role
        role = data.roles[l];
        abilities = getRoleAbilities(role);     
        if (abilities.indexOf(ability) > -1) {
          // Ability is in role abilities
          return true;
        }
      }
      // We made it here, so the ability wasn't found in attached roles
      return false;
    };    

	aclService.setPermissions = function(permissions) {		
		permissionObject = permissions;
	};	
	
	aclService.removePermissions = function() {		
		permissionObject = null;
	};
	
	aclService.getPermissions = function() {		
		return permissionObject;
	};

	aclService.canAccess = function(aclType, currentResource, currentModule,elementId) {
		if (appCon.globalCon.authorization && appCon.globalCon.authorization.required && permissionObject) {
			var permissionObjectLength = permissionObject.length, i, permissionMask = '001',currentElement,elementObject,elementTagName,elementType;
			for (i = 0; i < permissionObjectLength; i++) {
				if (angular.isUndefined(aclType)) {
					if (permissionObject[i].resource === currentResource) {
						if (permissionObject[i].visibility === 'SHOW') {
							permissionCommands = permissionObject[i].commands;
							return true;
						}
					}
				} else {
					if(angular.isDefined(currentModule) && currentModule !== ''){
						if (permissionObject[i].resourceId === currentResource && permissionObject[i].moduleId === currentModule) {
							if(permissionMask < permissionObject[i].permissionMask){
								permissionMask = permissionObject[i].permissionMask;
							}
						}
					}else{
						if (permissionObject[i].resourceId === currentResource) {
							if(permissionMask < permissionObject[i].permissionMask){
								permissionMask = permissionObject[i].permissionMask;
							}
						}
					}
				}
			}
			if (permissionMask === '100' || permissionMask === '110') {
				// Set disabled attribute if an element has read only permission mode   
				if (permissionMask === '100'){					  
					if(angular.isDefined(elementId)){
						currentElement=angular.element(document.querySelector('#'+elementId));
						elementObject=currentElement[0];
						if(angular.isDefined(elementObject)){
							elementTagName=(elementObject.tagName).toLowerCase();
							elementType=(elementObject.type).toLowerCase();
							if(angular.isDefined(elementTagName)){
								if(elementTagName === 'input' || elementTagName === 'button'){
									if(elementType === 'radio' || elementType === 'checkbox' || elementTagName === 'button'){
										currentElement.attr('disabled','true');
									}else{
										currentElement.attr('readonly','true');
									}
								}else if(elementTagName === 'select'  || elementTagName === 'textarea'){
									currentElement.attr('disabled','true');	
								}else if(elementTagName === 'a'){
									var removeAttributesList=['href','ui-sref','onclick','ng-click','data-ng-click'];
									angular.forEach(removeAttributesList,function(removedValue,removedKey){
										currentElement.removeAttr(removedValue);
									});
									currentElement.attr('style', 'color:#808080;text-decoration:none;cursor:default');	
								}
							}
						}
					}
				}
				return true;
			}
			return false;
		}else{
			return true;
		}
	};
	aclService.canPerform = function(currentResource, currentAction) {
		if (appCon.globalCon.authorization && appCon.globalCon.authorization.required && permissionCommands) {
			if (aclService.canAccess(currentResource)) {
				if (permissionCommands.indexOf(currentAction) > -1) {
					return true;
				}
				return false;
			}
		}else{
			return true;
		}
	};
    return {
      config: function (userConfig) {
        angular.extend(config, userConfig);
      },
      $get: function () {
        return aclService;
      }
    };

  }
]);