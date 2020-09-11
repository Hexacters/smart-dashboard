(function() {
    angular.module('validation.rule', ['validation'])
        .config(['$validationProvider',
            function($validationProvider) {

                var expression = {
                    required: function(value) {
                    	value = _.trim(value);
                        return !!value;
                    },
                    url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                    email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                    number: /^\d+$/,
                    validateUrl: function(value, scope, element, attrs) {
						value = _.trim(value);
				        return value.length > 0 ? value.match(/^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i) : true;
				    },
					validateAlphaspecial: function(value, scope, element, attrs) {
						value = _.trim(value);
				        return value.length > 0 ? value.match(/^[a-zA-Z.,]+$/) : true;
				    },
				    validateEmail :function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[-a-zA-Z0-9!#$%&\'*\+\/=?^_\'|~]+(?:\.[-a-zA-Z0-9!#$%&\'*\+\/=?^_\'|~]+)*@([a-zA-Z0-9](?:[-a-zA-Z0-9]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-a-zA-Z0-9]*[a-zA-Z0-9])?)*(?:\.[a-zA-Z0-9]{2,})|\[(?:\d{1,3}(?:\.\d{1,3}){3}|IPv6:[0-9A-Fa-f:]{4,39})\])+$/i) : true;
				    },
					validateAlphanumSpecial: function(value, scope, element, attrs) {
						value = _.trim(value);
				        return value.length > 0 ? value.match(/^[a-zA-Z0-9\s-*&()!@#$%^|\\/\:;?_+=.,`~'"]+$/) : true;
				    },
				    validateAlphanum: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[a-zA-Z0-9]+$/) : true;
				    },				    
				    validateAlphanumSpecialWithoutPipe :function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[a-zA-Z0-9\s-*&()!@#$%^\\/\:;?_+=.,`~'"]+$/) : true;
				    },				    
				    validateLowerCase: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[a-z0-9]+$/) : true;
				    },	
				    validateAlpha: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[a-zA-Z]+$/) : true;
				    },
				    validateAlphaWithSpaceAndPunctuation:function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[-\s\'a-zA-Z]+$/) : true;
				    },
				    validateAlphaWithSpaceHyphen:function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[-\sa-zA-Z]+$/) : true;
				    },
				    validateAlphaNumWithSpaceHyphen: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[-\sa-zA-Z0-9]+$/) : true;
				    },
				    validateAlphaNumWithSpace: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[\sa-zA-Z0-9]+$/) : true;
				    },
				    validateAlphaWithoutSpaceAndPunctuation: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/^[a-zA-Z-\']+$/) : true;
				    },
				    validateAlphaWithOneSpaceAndPunctuation: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? !validateAlphaWithOneSpaceAndPunctuation(value) : true;
				    },
				    validateAlphaWithOneSpaceWithoutPunctuation : function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? !validateAlphaWithOneSpaceWithoutPunctuation(value) : true;
				    },
				    validateNumber : function(value, scope, element, attrs) {
				    	value = _.trim(value);
				    	return value.length > 0 ? !(isNaN(value) && value.match(/[^\d]/)) : true;
				    },
				    validateMinMaxValue : function(text, scope, element, attrs) {
				    	text = _.trim(text);
				    	if(text.length === 0){
				    		return true;
				    	}
				    	if(attrs.minValue && attrs.maxValue){
							if(text.length < parseInt(attrs.minValue,10)){
								return false;
							}else{
								if(text.length > parseInt(attrs.maxValue,10)){
									return false;
								}else{
									return true;
								}
							}
						}else if(attrs.minValue){
							if(text.length < parseInt(attrs.minValue,10)){
								return false;
							}else{
								return true;
							}
						}else if(attrs.maxValue){
							if(text.length > parseInt(attrs.maxValue,10)){
								return false;
							}else{
								return true;
							}
						}
				    },
				    validateEditorMaxLength : function(text, scope, element, attrs) {
				    	text = _.trim(text);
				    	if(text.length === 0){
				    		return true;
				    	}
				    	if(attrs.maxValue){
							text = text.replace(/<(\/)*(\\?xml:|meta|link|del|ins|st1:|[ovwxp]:)((.|\s)*?)>/gi, ''); // Unwanted tags
							text = text.replace(/(type|start|class)=("(.*?)"|(\w*))/gi, ''); // Unwanted sttributes
							text = text.replace(/<style(.*?)style>/gi, '');   // Style tags
							text = text.replace(/<script(.*?)script>/gi, ''); // Script tags
							text = text.replace(/<!--(.*?)-->/gi, '');        // HTML comments
							text = text.replace(/<object ([^>]*)\/>/gi, '');
							text = text.replace(/<object ([^>]*)>/gi, '');
							text = text.replace(/<video ([^>]*)\/>/gi, '');
							text = text.replace(/<video ([^>]*)>/gi, '');
							text = text.replace(/<embed ([^>]*)\/>/gi, '');
							text = text.replace(/<embed ([^>]*)>/gi, '');
							text = text.replace(/<audio ([^>]*)\/>/gi, '');
							text = text.replace(/<audio ([^>]*)>/gi, '');
							text = text.replace(/>/gi, '>');
							text = text.replace(/^\s+/, '').replace(/\s+$/, '');
							text = $(text).text();
				    		//var plainText =_.trim($(text).text());
							if(text.length > parseInt(attrs.maxValue)){
								return false;
							}else{
								return true;
							}
						}
				    },
					validateNotEmpty: function(value){
						if(value.length==0){
							return false;
						}else{
							return true;
						}
					},
					validateNumberWithDollar:function(value, scope, element, attrs) {
				    	value = _.trim(value);
				        return value.length > 0 ? value.match(/(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{1,3})*)|[0-9]+)?(\.[0-9]{1,2})?$/) : true;
				    },
				    validateNotEmptyObject: function(value){						
						if(angular.isObject(value)){
							if(value.$$hashKey){
								delete value.$$hashKey;
							}
							if(_.isEmpty(value)){								
								return false;
							}else{
								return true;
							}
						}else{
							return false;
						}
					},
					validateCheckRadio: function(value, scope, element, attrs) {
						if(angular.isDefined(value) && value.toString() === 'true'){
							return true;
						}else{
							return false;
						}
					},
					validateCreditCard: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				    	var cardType = angular.isDefined(attrs.cardType) ? attrs.cardType : true;
				        return (value.length > 0 && cardType) ? checkCreditCard(value, cardType) : true;
				    },
				    validateAuthorizationCode: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				    	var cardType = angular.isDefined(attrs.cardType) ? attrs.cardType : '';
				    	if(value !== '' && (value.length !== 3 && cardType !== 'AX') || (value.length !== 4 && cardType == 'AX')){
				    		return false;
				    	}else{
				    		return true;
				    	}
				    },
				    validateCardExpirationMonth: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				    	var expMonth = value;
				    	value =  angular.isDefined(attrs.expYear) ? attrs.expYear : '';
				    	var currentDate = new Date();
				    	var currentYear = currentDate.getFullYear();
				    	var currentMonth = padout(currentDate.getMonth() + 1);				    	
				    	if(expMonth && expMonth !== '' && value && value !== '' ){
				    		if(value >= currentYear){
				    			if((expMonth >= currentMonth && value == currentYear) || (value > currentYear)){
				    				return true;
				    			}
				    		}
				    	}
				    	return false;				    	
				    },
				    validateCardExpirationYear: function(value, scope, element, attrs) {
				    	value = _.trim(value);
				    	var expMonth = angular.isDefined(attrs.expMonth) ? attrs.expMonth : '';
				    	var currentDate = new Date();
				    	var currentYear = currentDate.getFullYear();
				    	var currentMonth = padout(currentDate.getMonth() + 1);				    	
				    	if(expMonth && expMonth !== '' && value && value !== '' ){
				    		if(value >= currentYear){
				    			if((expMonth >= currentMonth && value == currentYear) || (value > currentYear)){
				    				return true;
				    			}
				    		}
				    	}
				    	return false;				    	
				    }
                };

                var defaultMsg = {
                    required: {
                        error: 'This should be Required!!',
                        success: 'It\'s Required'
                    },
                    url: {
                        error: 'This should be Url',
                        success: 'It\'s Url'
                    },
                    email: {
                        error: 'This should be Email',
                        success: 'It\'s Email'
                    },
                    number: {
                        error: 'This should be Number',
                        success: 'It\'s Number'
                    },
                    validateAlphanumSpecial: {
                        error: 'Special characters are not allowed.',
                        success: 'Thanks!'
                    },
                    validateAlphaspecial:{
                    	 error: 'This should be Alpha only!',
                         success: 'It\'s Alpha'
                    },
                    validateAlphanumSpecialWithoutPipe:{
                    	error: 'This should be Alphanumeric with spl chars only without pipe!',
                        success: 'It\'s Alphanumeric with spl chars'
                    },
                    validateAlphanum: {
                    	error: 'This should be Alphanumeric only!',
                        success: 'Thanks!'
                    },
                    validateLowerCase:{
                    	error: 'This should be Lowercase of Alphanumeric only!',
                        success: 'Thanks!'
                    },
                    validateAlpha : {
                    	error: 'This should be Alphabets only!',
                        success: 'Thanks!'
                    },
                    validateAlphaWithSpaceAndPunctuation :{
                    	error: 'This should be Alpha with Space and Puntuation only!',
                        success: 'Thanks!'
                    },
                    validateAlphaWithSpaceHyphen :{
                    	error: 'This should be Alpha with Space and Hyphen!',
                        success: 'Thanks!'
                    },
                    validateAlphaNumWithSpaceHyphen :{
                    	error: 'This should be Alphanumeric with Space and Hyphen!',
                        success: 'Thanks!'
                    },
                    validateAlphaNumWithSpace:{
                    	error: 'This should be Alphanumeric with Space only!',
                        success: 'Thanks!'
                    },
                    validateAlphaWithoutSpaceAndPunctuation :{
                    	error: 'This should be Alphanumeric without Space and Puntuation!',
                        success: 'Thanks!'
                    },
                    validateAlphaWithOneSpaceAndPunctuation:{
                    	error: 'This should be Alpha with one Space and Puntuation!',
                        success: 'Thanks!'
                    },
                    validateAlphaWithOneSpaceWithoutPunctuation:{
                    	error: 'This should be Alpha with one Space without Puntuation!',
                        success: 'Thanks!'
                    },
                    validateEmail:{
                    	error: 'Invalid email',
                        success: 'Thanks!'
                    },
                    validateUrl:{
                    	error: 'Invalid url',
                        success: 'Thanks!'
                    },
                    validateNumber:{
                    	error: 'Invalid Number',
                        success: 'Thanks!'
                    },
                    validateMinMaxValue:{
                    	error: 'Invalid Min Max value',
                        success: 'Thanks!'
                    },
                    validateNotEmptyObject:{
                    	error: 'Object is empty',
                        success: 'Thanks!'
                    },
                    validateNumberWithDollar:{
                    	error: 'Invalid Number',
                        success: 'Thanks!'
                    },
                    validateEditorMaxLength:{
                    	error: 'Invalid Maxlength',
                        success: 'Thanks!'
                    },
                    validateCreditCard:{
                    	error: 'Invalid Creditcard no',
                        success: 'Thanks!'
                    },
                    validateAuthorizationCode:{
                    	error: 'Invalid Authorization Code',
                        success: 'Thanks!'
                    },
                    validateCardExpirationMonth:{
                    	error: 'Credit card expired',
                        success: 'Thanks!'
                    },
                    validateCardExpirationYear:{
                    	error: 'Credit card expired',
                        success: 'Thanks!'
                    }
                };

                $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
				
				$validationProvider.showSuccessMessage = false; // or true(default)
			    $validationProvider.showErrorMessage = true; // or true(default)
				

            }
        ]);

}).call(this);
