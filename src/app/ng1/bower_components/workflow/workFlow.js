// Work Flow Diagram Start here

var widthValue;
var heightValue;
var leftValue,left_origin;
var topvalue,top_origin;
var length_b_nodes;
var vert_line_height;
var line_thickness;
var displayStatusName='';
var total_users,count,one_two_left,one_two_left_temp;
var sequenceId,name,statusName,divId,tableId,old_id,lineId,tooltip_divId,tooltip_tableId;
var line_width;
var line_height;
var line_left,line_left_origin;
var line_top,line_top_origin;
var seqFlag,seqFlagCount,prev_seqId_count,one_two;
var offsetWidth,temp_left,temp_seqId,logDesc,approvedTime,deniedTime,next_sequenceId,assignedContractGroups,assignedContractGroupsVal;
var hlineCnt = 1;
var contextURL = 'bower_components/workflow/';
var containerId = "";
var totalHeightValue = 0;

//$.getJSON("json/scenerio10.json",function(result){
//$.getJSON("json/approval_flow_latest.json",function(result){
var workFlowDiagram = function(result, mainContainerId, containerIdVal, marginTop){
	totalHeightValue = 0;
	widthValue = 130;
	heightValue = 70;
	leftValue = 60; 
	left_origin = 60;
	topvalue = 10;
	if (marginTop){
		topvalue = parseInt(marginTop);
	}
	top_origin = 20;
	length_b_nodes = 30;
	vert_line_height = 25;
	line_thickness = 1;
	total_users = 0; 
	count = 0;
	one_two_left = 0;
	one_two_left_temp = 0;
	sequenceId = "";
	name = "";
	statusName = "";
	divId = "";
	tableId = "";
	old_id = "";
	lineId = "";
	tooltip_divId = "";
	tooltip_tableId = '';
	line_width = 3;
	line_height = 30;
	line_left = leftValue + (widthValue / 2);
	line_left_origin = leftValue + (widthValue / 2);
	line_top = topvalue + heightValue;
	line_top_origin = topvalue + heightValue;
	seqFlag = 0;
	seqFlagCount = 0;
	prev_seqId_count = 0;
	one_two = 0;
	offsetWidth = "";
	temp_left = "";
	temp_seqId = "";
	logDesc = "";
	approvedTime = "";
	next_sequenceId = "";
	assignedContractGroups = "";
	assignedContractGroupsVal = '';
	hlineCnt = 1;
	containerId = containerIdVal;
	
	var tbl_col = "";
	var json_data = [];
	var contractName= "";
	var	approvalName= "";
	var approvalCreator="";
	var documentName="";
	var firstName="";
	var lastName="";
	var	workFlowDetails="";					
	var contractNameVal="";
	var approvalNameVal="";
	var approvalCreatorVal="";
	var documentNameVal="";
	
	//Get the last set of instance data from Json File and passed it as argument to getData
	//$.each(result,function(x,y){ alert(x);
		$.each(result,function(a,b){
			var count = 0;
			var arrKey = ""
			deniedTime = '';
			var temp = [];
			if(a == 'workFlowSummary'){
				$.each(b, function(o,p){
					if(o == 'contractName'){
						contractName = p;
					}
					if(o == 'name'){
						approvalName = p;
					}
					if(o == 'firstName'){
						firstName = p;										
					}
					if(o == 'lastName'){
						lastName = p;										
					}
					if(firstName != "" || lastName != ""){								
						approvalCreator = firstName+" "+lastName;
					}
					if(o == 'documents'){
						$.each(p, function(q,r){
							$.each(r, function(s,t){
								if(s == 'name'){
									documentName = t+", "+documentName;												
								}
							})
						})
						documentName = documentName.substring(0,documentName.length-2);
					}
				})								
			}
			workFlowDetails = '<div class="workFlowDetailTdFirst">';
			workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdLeft" style="border-radius:5px 0px 0px 0px;"><b>Contract Name</b> </div>';
			//alert(contractName);
			if(contractName.length > 30){
				contractNameVal = contractName.substring(0,30) + "...";
				workFlowDetails = workFlowDetails + "<div onmouseout='UnTip();' onmouseover='Tip(\""+escape(contractName)+"\",WIDTH,-750)' style='overflow: min-height:20px; hidden;cursor:cell;' class='workFlowDetailTdRight toolTipDesc'>"+contractNameVal+"</div>";
			}else{
				contractName = contractName;
				workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdRight" style="min-height:20px;">'+contractName+'</div>';
			}							
			workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdLeft"><b>Approval Name</b></div>';
			if(approvalName.length > 30){
				approvalNameVal = approvalName.substring(0,30) + "...";
				workFlowDetails = workFlowDetails + "<div onmouseout='UnTip();' onmouseover='Tip(\""+escape(approvalName)+"\",WIDTH,-750)' style='overflow: min-height:20px; hidden;cursor:cell; min-height:20px;' class='workFlowDetailTdRight toolTipDesc'>"+approvalNameVal+"</div>";
			}else{
				approvalName = approvalName;
				workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdRight" style="min-height:20px;">'+approvalName+'</div>';
			}							
			//workFlowDetails = workFlowDetails + '</div>';
			//workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdSecond">';
			workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdLeft"><b>Approval Creator</b> </div>';
			if(approvalCreator.length > 30){
				approvalCreatorVal = approvalCreator.substring(0,30) + "...";
				workFlowDetails = workFlowDetails + "<div onmouseout='UnTip();' onmouseover='Tip(\""+escape(approvalCreator)+"\",WIDTH,-750)' style='overflow: hidden;cursor:cell; min-height:20px;' class='workFlowDetailTdRight toolTipDesc'>"+approvalCreatorVal+"</div>";
			}else{
				approvalCreator = approvalCreator;
				workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdRight" style="min-height:20px;">'+approvalCreator+'</div>';
			}
			workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdLeft" style="border-radius:0px 0px 0px 5px;"><b>Document Name</b> </div>';
			if(documentName.length > 30){
				documentNameVal = documentName.substring(0,30) + "...";
				workFlowDetails = workFlowDetails + "<div onmouseout='UnTip();' onmouseover='Tip(\""+escape(documentName)+"\",WIDTH,-750)' style='overflow: hidden;cursor:cell; min-height:20px; border-radius:0px 0px 5px 0px;' class='workFlowDetailTdRight toolTipDesc'>"+documentNameVal+"</div>";
			}else{
				documentName = documentName;
				workFlowDetails = workFlowDetails + '<div class="workFlowDetailTdRight" style="min-height:20px; border-radius:0px 0px 5px 0px;">'+documentName+'</div>';
			}
			workFlowDetails = workFlowDetails + '</div>';
			//workFlowDetails = workFlowDetails + '</td></tr></table>';
			//document.getElementById("workFlowDetails").innerHTML = workFlowDetails;
			
			if(a == 'workFlowAuditLogs'){
				$.each(b, function(c,d){
					if(c == 'eventTime'){
						deniedTime = d //dateFormat(d, "mm/dd/yyyy hh:MM tt");
					}
					if(c == 'workFlowTasksLogList'){
						temp = d;
						$.each(d, function(k,l){
							//temp = l;
						})
					}
				})
			}
			getData(temp,deniedTime,mainContainerId);
		})
	//})
}

var getData = function(temp,deniedTime,mainContainerId){
	mainDiv = document.getElementById(mainContainerId);					
	offsetWidth = mainDiv.offsetWidth;	
	var seqCount = sArrCnt = oldId = 0;
	
	var seqIdArr = [];
	var cnt_pos = sq_count = 0;
	
	//For taking the count of same sequence Ids in Json.
	$.each(temp, function(x,y){
		$.each(y, function(key,value){
			if(key == 'name'){
				total_users = total_users + 1;
			}
			if(key == 'sequenceId'){
				if(oldId == value){
					sq_count = sq_count + 1;
					seqIdArr[value] = sq_count;
				} else if(oldId != value){
					sq_count = 1;
					seqIdArr[value] = sq_count;
				}
				oldId = value;
			}
		})
	})
	
	//setting the new offset value while the parallel nodes are exceeding 5
	if(seqIdArr){
		max = 0;
		$.each(seqIdArr, function(a,b){
			if(max < b){
				max = b;
			}
		})
		if(max > 5){
			offsetWidth =  (max * widthValue) + (max * length_b_nodes) + 50;
		} 
	}
	
	//Getting the required field values from json (name,statusName, etc...)
	$.each(temp, function(x,y){
		count = count + 1;
		$.each(y, function(key,value){
			if(key == 'sequenceId'){
				if(value && value != undefined){
					sequenceId = value;
				}else{
					sequenceId = '';
				}
			}
			if(key == 'name'){
				if(value && value != undefined){
					name = value;
				}else{
					name = '';
				}
			} 
			if(key == 'newStatus'){ 
				if(value && value != undefined){ 
					statusName = value;									
				}else{
					statusName = '';
				}							
			}
			if(key == 'logDescription'){
				if(value && value != undefined){
					logDesc = value;
				}else{
					logDesc = '';
				}
			}
			if(key == 'assignedContractGroups'){
				if(value && value != undefined){
					assignedContractGroups = value;
				}else{
					assignedContractGroups = '';
				}
			}
			if(key == 'endTime'){
				//approvedTime = value;
				if(value && value != undefined){
					approvedTime = value //dateFormat(value, "mm/dd/yyyy hh:MM tt");
				}else{
					approvedTime = '';
				}
			}
			assignedContractGroupsVal = "";
			var assignCount = 0;
			var assignFlag = false;
			$.each(assignedContractGroups, function(a,b){
				$.each(b, function(assignkey,assignvalue){
					if(assignkey == 'name'){
						if(assignvalue && assignvalue != undefined){
							assignedContractGroupsVal += assignvalue+", ";
							assignCount++;
							assignFlag = false;
							if(assignCount == 2){
								assignedContractGroupsVal += "<br>";
								assignCount = 0;
								assignFlag = true;
							}
						}else{
							assignedContractGroupsVal = '';
						}										
					}
				})								
				//alert(assignedContractGroupsVal);
			})
			if(assignFlag){
				assignedContractGroupsVal = assignedContractGroupsVal.substring(0,assignedContractGroupsVal.length-6);
			} else {
				assignedContractGroupsVal = assignedContractGroupsVal.substring(0,assignedContractGroupsVal.length-2);
			}
			/* if(statusName == 'ONHOLD'){
				if(key == 'startTime'){ 
					deniedTime = value;
				}else{
					deniedTime = '';
				}								
			} */
		})
		
		//Taking the count of same sequence Id for current sequence Id
		if(seqIdArr){
			sArrCnt = seqIdArr[sequenceId];
		}
		
		divId = 'user_' + count;
		tableId = 'table_'+ count;
		
		if(count > 1){
			if(old_id == sequenceId){
				leftValue = leftValue + (length_b_nodes + widthValue);
			}else{
				topvalue = topvalue + (heightValue + vert_line_height);
			}
		}
		
		//parallel node (sequence id is same)
		if(old_id == sequenceId){	
			parallelDiv = '';
			
			 if(sArrCnt){
				if(cnt_pos > 0){
					temp_left = temp_left + (length_b_nodes + widthValue);									
				} 
			}
			
			createDiv(divId,widthValue,heightValue,temp_left,topvalue);
			parallelDiv = document.getElementById(divId);
			displayTickIcons(count,statusName,widthValue,temp_left,topvalue,logDesc);
			//for displaying right tick for approved and wrong tick for onhold status.
			/*if(statusName == 'ONHOLD'){
				//if(logDesc && logDesc != undefined){
					displayTickIcons(count,statusName,widthValue,temp_left,topvalue,logDesc);
				//}
			}else if(statusName == 'APPROVED'){
				displayTickIcons(count,statusName,widthValue,temp_left,topvalue);
			}else if(statusName == 'PENDING'){
				displayTickIcons(count,statusName,widthValue,temp_left,topvalue);
			}else if(statusName == 'NOT_STARTED'){
				displayTickIcons(count,statusName,widthValue,temp_left,topvalue);
			}*/
			
			
			//Displyaing tooltip for nodes.
			if(parallelDiv){
				if(statusName=='ONHOLD'){
					displayStatusName='ON HOLD';
				}else if(statusName=='NOT_STARTED'){
					displayStatusName='NOT STARTED';
				}else{
					displayStatusName=statusName;
				}
				tooltip_divId = 'tooltip_' + count;
				tooltip_tableId = 'tipTable_' + count;
				
				var tooltip_content = "<table class='table-workflow'><tr><td class='text-left'> Status: </td>" + "<td class='text-left'>"+ displayStatusName +"</td></tr>";
				tooltip_content += "<tr><td class='text-left'> Name: </td>" + "<td class='text-left'>"+ name +"</td></tr></table>";
				
				parallelDiv.setAttribute('data-toggle', "tooltip");
				parallelDiv.setAttribute('data-html', "true");
				parallelDiv.setAttribute('data-title', tooltip_content);
				$("#"+divId).tooltip();
			} 
			
			// for parallel nodes more than one
			if(old_id){ 
				line_left = temp_left;
				line_top = topvalue;
				
				if(count == 1){
					temp_seqId = sequenceId;
				}
			
				//To not display the top and bottom lines for top and bottom nodes.
				if(temp_seqId != sequenceId)
					lineDiv(lineId,line_thickness,vert_line_height,line_left + (widthValue / 2),(line_top - vert_line_height));
					
				var a = seqIdArr.length  - 1;
				if(a != sequenceId)
					lineDiv(lineId,line_thickness,vert_line_height,line_left+(widthValue / 2),(line_top + heightValue));
					
				seqFlag = 1;
				seqFlagCount = seqFlagCount + 1;
				
				//To display the top horizontal line between the levels for scenario (top one node and bottom multiple nodes)
				if(one_two > 0){
					var hWidth = (((widthValue * (sArrCnt - 1)) + ((sArrCnt - 1) * length_b_nodes) + line_thickness));
					//var hline_left = temp_left-(((sArrCnt) * length_b_nodes) + (((sArrCnt - 1) * widthValue) - ((widthValue / 2) + vert_line_height)));
					one_two_left_temp = one_two_left;
					lineDiv(lineId,hWidth,line_thickness,one_two_left_temp,topvalue - (vert_line_height + line_thickness));
					hlineCnt = 1;
					
					one_two = 0;
				}
				
				hlineCnt = hlineCnt + 1;
				var a = seqIdArr.length  - 1;
				if(a != sequenceId){
					if (seqIdArr[sequenceId] == hlineCnt) {
						next_sequenceId = sequenceId;
						do{
							next_sequenceId = next_sequenceId + 1;
						}while(seqIdArr[next_sequenceId] == undefined);
						
						var next_count = seqIdArr[next_sequenceId];
						
						// For displaying the correct horizontal line for scenario (top nodes is less than bottom nodes (top - 3, bottom - 4))
						// if(seqIdArr[sequenceId] > next_count){
							var hWidth = (((widthValue * (sArrCnt - 1)) + ((sArrCnt - 1) * length_b_nodes) + line_thickness));
							var hline_left = temp_left-(((sArrCnt) * length_b_nodes) + (((sArrCnt - 1) * widthValue) - ((widthValue / 2) + length_b_nodes)));
							lineDiv(lineId,hWidth,line_thickness,hline_left,(topvalue + heightValue + vert_line_height));
							var center_point = (offsetWidth / 2);
							if(next_count != 1){
								topvalue = topvalue + line_thickness;
								lineDiv(lineId,line_thickness,vert_line_height,center_point,(topvalue + heightValue + vert_line_height));
								topvalue = topvalue + vert_line_height;
							}
						//}else{
							//if(next_count != 1){
								//alert('next_count ' + next_count);
								var hWidth = (((widthValue * (next_count - 1)) + ((next_count - 1) * length_b_nodes) + line_thickness));
								var hline_left = temp_left-(((sArrCnt) * length_b_nodes) + (((sArrCnt - 1) * widthValue) - ((widthValue / 2) + length_b_nodes)));
								var difference = next_count - seqIdArr[sequenceId];
								var toLess = ((difference * widthValue) + (difference * length_b_nodes)) / 2; 
								hline_left = hline_left - toLess;
							/* }else{
								alert('next_count ' + next_count);
								var hWidth = (((widthValue * (sArrCnt - 1)) + ((sArrCnt - 1) * length_b_nodes) + 3));
								var hline_left = temp_left-(((sArrCnt) * length_b_nodes) + (((sArrCnt - 1) * widthValue) - ((widthValue / 2) + length_b_nodes)));											
							} */
							lineDiv(lineId,hWidth,line_thickness,hline_left,(topvalue + heightValue + vert_line_height));
							hlineCnt = 1;
						//}
					}
				}
			}
		}else{   // sequential Node
			cnt_pos = 0;
			if(sArrCnt){
				temp_left = centreWidth(sArrCnt,offsetWidth,widthValue,length_b_nodes);
				cnt_pos = 1;
			}
			
			//To check whether top node is 1 and bottom is multiple
			if(seqIdArr[old_id] != undefined){
				if((seqIdArr[old_id] == 1) && (seqIdArr[sequenceId] > 1))
				{
					topvalue = topvalue + (vert_line_height + line_thickness);	
					one_two = 1;
				}
			}
			
			// for setting the vertical bottom line of node.
			if(seqFlag > 0){
				topvalue = topvalue + (vert_line_height + line_thickness);
				line_top = line_top + (vert_line_height + line_thickness);							
				hor_lineId = 'hor_line ' + count;
				seqFlagCount = seqFlagCount + 1; 
				Hor_line_width = ((seqFlagCount * widthValue) + (seqFlagCount * vert_line_height));								
				seqFlag = 0;
				seqFlagCount = 0;
			}
			sequenceDiv = '';
			createDiv(divId,widthValue,heightValue,temp_left,topvalue);
			displayTickIcons(count,statusName,widthValue,temp_left,topvalue,logDesc);
			
			sequenceDiv = document.getElementById(divId);
			if(sequenceDiv){
				if(statusName=='ONHOLD'){
					displayStatusName='ON HOLD';
				}else if(statusName=='NOT_STARTED'){
					displayStatusName='NOT STARTED';
				}else{
					displayStatusName=statusName;
				}
				var tooltip_content = "<table class='table-workflow'><tr><td class='text-left'> Status: </td>" + "<td class='text-left'>"+ displayStatusName +"</td></tr>";
				tooltip_content += "<tr><td class='text-left'> Name: </td>" + "<td class='text-left'>"+ name +"</td></tr></table>";
				
				sequenceDiv.setAttribute('data-toggle', "tooltip");
				sequenceDiv.setAttribute('data-html', "true");
				sequenceDiv.setAttribute('data-title', tooltip_content);
				$("#"+divId).tooltip();
			} 			

			line_left = temp_left;
			line_top = topvalue;
		
			var a = seqIdArr.length  - 1;														
			
			if(count == 1){
				temp_seqId = sequenceId;
			}
			
			//displaying vertical line for top and bottom nodes
			if(temp_seqId != sequenceId){
				one_two_left = line_left + (widthValue / 2);								
				lineDiv(lineId,line_thickness,vert_line_height,line_left + (widthValue / 2),line_top - vert_line_height);
			}
				
			if(a != sequenceId)
				lineDiv(lineId,line_thickness,vert_line_height,line_left+(widthValue / 2),line_top + heightValue);
				
			if(old_id){
				line_top = line_top + 100;
			}
		}
		
		//Adding the status for the node.
		if(document.getElementById(divId)){
			table = createTable(tableId,name,statusName);
			document.getElementById(divId).appendChild(table);
		}
		
		old_id = sequenceId;
		
		totalHeightValue = Number(totalHeightValue)+Number(heightValue);
	})
	//set total height for parent div	
	mainDiv.style.height= Number(Number(totalHeightValue)+150)+"px";
};

//Draw DIV for Node
var createDiv = function(divId,widthValue,heightValue,leftValue,topvalue){
	var div = document.createElement("div");
	div.id = divId;
	div.setAttribute("class"," node ui-draggable ui-resizable ui-resizable-autohide");
	div.style.width = widthValue+'px';
	div.style.height = heightValue+'px';
	div.style.left = leftValue+'px';
	div.style.top = topvalue+'px';
	if(document.getElementById(containerId)){
		work_div = document.getElementById(containerId);
		work_div.appendChild(div);
	}
};

// Draw Node
var createTable = function(tableId,content,statusName){
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	var row = document.createElement('tr');
	var col = document.createElement('td');			
	table.id = tableId;
	table.className = 'myTable';
	table.setAttribute('cellpadding','0');
	table.setAttribute('cellspacing','0');			
	if(statusName == 'APPROVED'){
		col.setAttribute("class","approvedClass");
		col.setAttribute("onmouseover","this.style.border='2px solid #68BE76'");
		col.setAttribute("onmouseout","this.style.border='1px solid #68BE76'");
	}
	if(statusName == 'PENDING'){
		col.setAttribute("class","pendingClass");
		col.setAttribute("onmouseover","this.style.border='2px solid #F9E82D'");
		col.setAttribute("onmouseout","this.style.border='1px solid #F9E82D'");
	}
	if(statusName == 'ONHOLD'){
		col.setAttribute("class","onholdClass");
		col.setAttribute("onmouseover","this.style.border='2px solid #FFAA00'");
		col.setAttribute("onmouseout","this.style.border='1px solid #FFAA00'");
	}
	if(statusName == 'NOT_STARTED'){
		col.setAttribute("class","notStartedClass");
		col.setAttribute("onmouseover","this.style.border='2px solid #AAAAAA'");
		col.setAttribute("onmouseout","this.style.border='1px solid #AAAAAA'");
	}
	
	if(content.length > 13){
		content = content.substring(0,13);
		content = content + '...';
	}
	col.appendChild(document.createTextNode(content));
	row.appendChild(col);
	tbody.appendChild(row);
	table.appendChild(tbody);
	
	return table;
};

// Draw Line 
var lineDiv = function(divId,widthValue,heightValue,leftValue,topvalue){
	var div = document.createElement("div");
	div.id = divId;
	div.setAttribute("style","position:absolute;clip:rect(0," + widthValue + " ," + heightValue + ",91px,3px,0);background-color:#aa0000;overflow:hidden;");
	div.style.width = widthValue+'px';
	div.style.height = heightValue+'px';
	div.style.left = leftValue+'px';
	div.style.top = topvalue+'px';
	if(document.getElementById(containerId)){
		work_div = document.getElementById(containerId);
		work_div.appendChild(div);
	}
};

var centreWidth = function(seqUserCnt,w,widthValue,length_b_nodes){
	var returnWidth;
	if(seqUserCnt == 1){
		returnWidth = (w/2) - (widthValue/2);
	}else{
		returnWidth = (w/2) - (((widthValue * seqUserCnt) + ((seqUserCnt - 1) * length_b_nodes))/2);
	}
	return returnWidth;
};

var displayTickIcons = function(count,statusName,box_width,leftValue,topvalue,logDesc){
	usr_tbl_row = "";
	//if(statusName == 'APPROVED' || statusName == 'ONHOLD' || statusName == 'PENDING'){
		var tick_divId = 'tick_div_' + count;
		var tick_left = tick_top = tick_width = tick_height = 0;
		var imgElem = document.createElement("img");
		imgElem.id = 'tick_div_tooltip_' + count;
		
		if(statusName == 'ONHOLD' && logDesc && logDesc != undefined){
			imgElem.src = contextURL+'images/wf_wrong.png';
			if(deniedTime && deniedTime != undefined && logDesc && logDesc != undefined){
				var tooltip_content ="<table class='table-workflow'>";
				tooltip_content += "<tr><td style='white-space:nowrap' class='text-left'> Denied On: </td>" + "<td class='text-left'>"+ deniedTime +"</td></tr>"
				tooltip_content += "<tr><td class='text-left'> Notes: </td>" + "<td class='text-left'><p>"+ logDesc +"</p></td></tr>";
				tooltip_content +="</table>";
				
				imgElem.setAttribute('data-toggle', "tooltip");
				imgElem.setAttribute('data-html', "true");
				imgElem.setAttribute('data-title', tooltip_content);
			}
			
			tick_width = 20;
			tick_height = 20;
		}else if(statusName == 'ONHOLD'){
			imgElem.src = contextURL+'images/wf_hold.png';
			tick_width = 20;
			tick_height = 20;
		}else if(statusName == 'APPROVED'){
			imgElem.src = contextURL+'images/wf_right.png';
			var tooltip_content ="<table class='table-workflow'>";
			
			if(approvedTime && approvedTime != undefined){
				tooltip_content += "<tr><td style='white-space:nowrap' class='text-left'> Approved On: </td>" + "<td class='text-left'>"+ approvedTime +"</td></tr>"
			}
			if(logDesc && logDesc != undefined){
				tooltip_content += "<tr><td class='text-left'> Notes: </td>" + "<td class='text-left'><p >"+ logDesc +"</p></td></tr>";
			}
			tooltip_content +="</table>";
			
			imgElem.setAttribute('data-toggle', "tooltip");
			imgElem.setAttribute('data-html', "true");
			imgElem.setAttribute('data-title', tooltip_content);
			
			tick_width = 20;
			tick_height = 20;
		}else if(statusName == 'PENDING'){
			imgElem.src = contextURL+'images/wf_clock.png';
			tick_width = 20;
			tick_height = 20;
		}else if(statusName == 'NOT_STARTED'){
			imgElem.src = contextURL+'images/wf_stop.png';
			tick_width = 20;
			tick_height = 20;
		}
		tick_left = temp_left + box_width;
		tick_top = topvalue - 12;
		createDiv(tick_divId,tick_width,tick_height,tick_left,tick_top);
		tick_div = document.getElementById(tick_divId);
		
		if(tick_div){
			tick_div = document.getElementById(tick_divId);
			tick_div.appendChild(imgElem);
			$("#tick_div_tooltip_" + count).tooltip();
		}				
	//}			
};