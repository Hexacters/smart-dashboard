//For this directive height of element is mandatory
'use strict';
angular.module(appCon.appName).directive('visionChart', ['$state','$parse', function($state, $parse) {
	return {
	    restrict: 'E',
	    scope: {
	        data: '=',
	        rootnode: '@',
	        containerId: '@',
	        type:'@',
	        barType:'@',
	        xaxisfield: '@',
	        scatterGroupFields:'@',
	        scatterChartFields:'@',
	        barchartFields: '@',
	        linechartFields: '@',
	        piechartFields: '@',
	        treemapFields: '@',
	        yaxisLeftLabel: '@',
	        yaxisRightLabel: '@',
	        showlegend:'@',
	        xpositionLegend:'@',
	        ypositionLegend:'@',
	        tooltipFormatter:'@',
	        legendFormatter:'@',
	        xaxisFormatter: '@',
	        yaxisFormatter: '@',
	        yaxisRightFormatter: '@',
	        gridLine: '@',
	        clickEvent: '@',
	        yaxisRightDisable: '@',
	        symbolSize: '@'
	    },
	   
	    link: function(scope, element) {	    	
	        // Render chart based on 'data'
	        scope.render = function(data) {
	        	var xaxisFieldsArray = [],
	        		type = scope.type ? scope.type.split(',') : [],
		        	barchartFields = scope.barchartFields ? scope.barchartFields.split(',') : [],
		        	linechartFields = scope.linechartFields ? scope.linechartFields.split(',') : [],
		        	treemapFields = scope.treemapFields ? scope.treemapFields.split(',') : [],
		        	totalChartFields = barchartFields.concat(linechartFields),
		        	yaxisLeftLabel = scope.yaxisLeftLabel ? scope.yaxisLeftLabel : '',
		        	yaxisRightLabel = scope.yaxisRightLabel ? scope.yaxisRightLabel : '',
		        	showlegend = (scope.showlegend && scope.showlegend === 'true') ? true : false,
		        	xpositionLegend = (scope.xpositionLegend) ? scope.xpositionLegend : 'center',
		        	ypositionLegend = (scope.ypositionLegend) ? scope.ypositionLegend : 'top',
		        	gridLine = (scope.gridLine && scope.gridLine === 'true') ? true : false,
		        	chart = echarts.init(document.getElementById(scope.containerId)),
		        	yaxisRightDisable = (scope.yaxisRightDisable && scope.yaxisRightDisable === 'true') ? false : true,
		        	symbolSize = (scope.symbolSize) ? scope.symbolSize : false,
		        	chartSeries = [];
	            window.onresize = chart.resize;
	            
	            // get x axis fields from data
	        	angular.forEach(data, function(value) {
	        		if(value[scope.xaxisfield]){
	        			xaxisFieldsArray.push(value[scope.xaxisfield]);
	        		}	        		
	            });
	        	
	        	// echart basic configurations
	        	var chartOptions = {
		            tooltip : {
		                trigger: 'axis'
		            },
		            toolbox: {
		                show : false,
		                feature : {
		                    mark : {show: true},
		                    dataView : {show: true, readOnly: false},
		                    magicType: {show: true, type: type},
		                    restore : {show: true},
		                    saveAsImage : {show: true}
		                }
		            },
		            calculable : false,
		            legend: {
		            	show : showlegend,
		            	x : xpositionLegend,
		            	y : ypositionLegend
		            },
		            noDataLoadingOption:{
		            	text: 'loading...'
		            }	           
	        	}; 
	        	
	        	if(typeof scope.tooltipFormatter !== 'undefined') {	
	        		chartOptions.tooltip.formatter = function(obj){     			
	        			var fn = $parse(scope.tooltipFormatter)(scope);
	        			return fn(obj,scope.data);
	        		};
                }
	        	
	        	if(typeof scope.legendFormatter !== 'undefined') {	
	        		chartOptions.legend.formatter = function(name){
	        			var fn = $parse(scope.legendFormatter)(scope);
	        			return fn(name,scope.data);
	        		};
                }
	        	
	        	if(scope.type === 'pie'){
	        		chartOptions.tooltip.trigger = 'item';
	        		//set legend data
	        		chartOptions.legend.data = xaxisFieldsArray;
	        		var piechartObj = { 
	        			   				type:'pie',
	        	              			radius : '75%',
	        	              			center: ['50%', '50%']
	        	   					};
	        	   
	        		var piechartData = [];
	        		angular.forEach(data, function(value1) {
	        			if(value1[scope.xaxisfield]){
	   						var obj = {};
		   					obj.name = value1[scope.xaxisfield];
		   					obj.value = value1[scope.piechartFields];
		   					piechartData.push(obj);
		           		}
	        		});
	        		piechartObj.data = piechartData;
	        		chartSeries.push(piechartObj);
	        	} else if(scope.type === 'treemap'){
	        		chartOptions.tooltip.trigger = 'item';
	        		delete chartOptions.legend;
	        		var treemapObj = { 
	        							name : '',
	        			   				type:'treemap',
	        			   				itemStyle: {
	        			   	                normal: {
	        			   	                    label: {
	        			   	                        show: true,
	        			   	                        formatter:  function(value){		        	 		                        	
		        	 		                        	if(typeof scope.xaxisFormatter !== 'undefined') {	        	 		   	        			     			
				        	 		   	        			var fn = $parse(scope.xaxisFormatter)(scope);
				        	 		   	        			return fn(value,scope.data);
		        	 		                        	}else{
		        	 		                        		return value;
		        	 		                        	}
		        	 		                        }
	        			   	                    },
	        			   	                    borderWidth: 1
	        			   	                },
	        			   	                emphasis: {
	        			   	                    label: {
	        			   	                        show: true
	        			   	                    }
	        			   	                }
	        			   	            }
	        	   					};
	        	   
	        		var treemapData = [];
	        		angular.forEach(data, function(value1) {
	        			if(value1[scope.xaxisfield]){
	   						var obj = {};
		   					obj.name = value1[scope.xaxisfield];
		   					obj.value = value1[scope.treemapFields];
		   					treemapData.push(obj);
		           		}
	        		});
	        		treemapObj.data = treemapData;
	        		chartSeries.push(treemapObj);
	        	}else if(scope.type === 'scatter'){
	        		//set legend data	        		
	        		var legendData = [];
					var k,groupfield = scope.scatterGroupFields,xaxisfield = scope.xaxisfield,yaxisfield = scope.scatterChartFields;
					for(k = 0; k< data.length; k++){    
						if(legendData.indexOf(data[k][groupfield]) === -1){
							legendData.push(data[k][groupfield]);        
						}        
					}
					chartOptions.legend.data = legendData;
					//series data
					var i;
					for(i in legendData){
						var constructRecord={};
						constructRecord.name=legendData[i];
						constructRecord.type='scatter';
						if(symbolSize){
							constructRecord.symbolSize= Math.round(symbolSize);
						}
						constructRecord.data=[];					
						
						var j;
						for(j in data){
							if(legendData[i] == data[j][groupfield]){
								var coOrdinate= [data[j][xaxisfield], data[j][yaxisfield]];
								constructRecord.data.push(coOrdinate);
							}
						}						
						chartSeries.push(constructRecord);
					}
					chartOptions.xAxis = [
					          {
					              type : 'value',
					              scale:true,
					              axisLabel : {
					            	  formatter: function(value){		        	 		                        	
  	 		                        	if(typeof scope.xaxisFormatter !== 'undefined') {	        	 		   	        			     			
	        	 		   	        			var fn = $parse(scope.xaxisFormatter)(scope);
	        	 		   	        			return fn(value,scope.data);
  	 		                        	}else{
  	 		                        		return value;
  	 		                        	}
  	 		                        }
					              }
					          }
					      ],
			      chartOptions.yAxis = [
			          {
			              type : 'value',
			              scale:true,
			              axisLabel : {
			            	  formatter: function(value){		        	 		                        	
	                        	if(typeof scope.yaxisFormatter !== 'undefined') {	        	 		   	        			     			
    	 		   	        			var fn = $parse(scope.yaxisFormatter)(scope);
    	 		   	        			return fn(value,scope.data);
	                        	}else{
	                        		return value;
	                        	}
	                        }
			              }
			          }
			      ];
					
	        	}else {	        	   
	        		var xaxis = [
	     	 		                {
	    	 		                    type : 'category',
	    	 		                    data : xaxisFieldsArray,
	    	 		                    axisLabel : {
	    	 		                        formatter: function(value){		        	 		                        	
	    	 		                        	if(typeof scope.xaxisFormatter !== 'undefined') {	        	 		   	        			     			
		        	 		   	        			var fn = $parse(scope.xaxisFormatter)(scope);
		        	 		   	        			return fn(value,scope.data);
	    	 		                        	}else{
	    	 		                        		return value;
	    	 		                        	}
	    	 		                        }
	    	 		                    },
	    	 		                    splitLine : {
	    	 		                		show : gridLine
	    	 		                	}
	    	 		                }
	    	 		            ];
		        		var yaxis = [
	     	 		                {
	    	 		                    type : 'value',
	    	 		                    name : yaxisLeftLabel,
	    	 		                    axisLabel : {
	    	 		                        formatter: function(value){		        	 		                        	
	    	 		                        	if(typeof scope.yaxisFormatter !== 'undefined') {	        	 		   	        			     			
		        	 		   	        			var fn = $parse(scope.yaxisFormatter)(scope);
		        	 		   	        			return fn(value,scope.data);
	    	 		                        	}else{
	    	 		                        		return value;
	    	 		                        	}
	    	 		                        }
	    	 		                    },
	    	 		                    splitLine : {
	    	 		                		show : gridLine
	    	 		                	}
	    	 		                }
	    	 		            ];
		        		if(scope.type === 'bar' && scope.barType && scope.barType === 'horizontal'){
			        		chartOptions.xAxis = yaxis;
			        		chartOptions.yAxis = xaxis;
		        		}else{
		        			chartOptions.xAxis = xaxis;
			        		chartOptions.yAxis = yaxis;
		        		}
	        		            
	        		if(scope.type === 'bar'){
	        			chartOptions.legend.data = barchartFields;
	        			chartSeries = getChartSeriesFromObj(barchartFields,data,scope.type);
	        		}else if(scope.type === 'line'){
	        			chartOptions.legend.data = linechartFields;
	        			chartSeries = getChartSeriesFromObj(linechartFields,data,scope.type);
	        		}else if(scope.type === 'bar,line'){
	        			chartOptions.legend.data = totalChartFields;
	        			if(yaxisRightDisable){
	        				chartOptions.yAxis.push({
		                    	type : 'value',
		                    	show : true,
	 		                    name : yaxisRightLabel,
	 		                    axisLabel : {
	 		                    	formatter: function(value){		        	 		                        	
	 		                        	if(typeof scope.yaxisRightFormatter !== 'undefined') {	        	 		   	        			     			
	    	 		   	        			var fn = $parse(scope.yaxisRightFormatter)(scope);
	    	 		   	        			return fn(value,scope.data);
	 		                        	}else{
	 		                        		return value;
	 		                        	}
	 		                        }
	 		                    },
	 		                    splitLine : {
			                		show : gridLine
			                	}
	 		                });
	        			}	        			
	        			var barchartSeries = getChartSeriesFromObj(barchartFields,data,"bar");
	        			var linechartSeries = getChartSeriesFromObj(linechartFields,data,scope.type,yaxisRightDisable);
	        			chartSeries = barchartSeries.concat(linechartSeries);
	        	   }     	   
	        	   
	        	}
	        	chartOptions.series = chartSeries;
	        	chart.setOption(chartOptions, true);
	        	
	        	if (typeof scope.clickEvent !== 'undefined') {	        		
	        		chart.on('click', function(param) {
	        			var fn = $parse(scope.clickEvent)(scope);
	        			return fn(param, scope.data);
                    });
                }
	        };    
	         
	        scope.$watchCollection('data', function() {
	        	if (scope.data !== 'undefined') {
	        		var results = $parse(scope.rootnode)(scope);	           
	                if (angular.isArray(results)) {
	                    scope.render(results);
	                }
	            }
	        }, true);
	    }
	};	
}]);
