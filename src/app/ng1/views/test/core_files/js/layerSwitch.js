function swapLayerCheckbox(theCheckbox,theLayer,showType,checkedAction,uncheckedAction) {

	if (showType == 'display') {

		// showType = display: when hidden, page adjusts as if it weren't there
		// action options: inline / none

		if (document.getElementById(theCheckbox).checked) {
			document.getElementById(theLayer).style.display = checkedAction;
		} else {
			document.getElementById(theLayer).style.display = uncheckedAction;
		}

	} else {

		// showType = visibility: when hidden, page doesn't adjust, and a blank area is left
		// action options: visible / hidden
	
		if (document.getElementById(theCheckbox).checked) {
			document.getElementById(theLayer).style.visibility = checkedAction;
		} else {
			document.getElementById(theLayer).style.visibility = uncheckedAction;
		}

	}	

	return false;
}

function forceCheckbox(theCheckbox) {
	// Must be included on page after theCheckbox is defined or it doesn't work
	document.getElementById(theCheckbox).click();
	document.getElementById(theCheckbox).click();
	return false;
}

function swapLayerRadio(theLayer,showType,theAction) {

	if (showType == 'display') {
	
		document.getElementById(theLayer).style.display = theAction;
		
	} else {

		document.getElementById(theLayer).style.visibility = theAction;
	
	}
	
	return false;
}

function forceRadio(theRadio) {
	// Must be included on page after theRadio is defined or it doesn't work
	if (document.getElementById(theRadio).checked) {
		document.getElementById(theRadio).click();
	}
	return false;
}