'use strict';
/*Bar Chart*/
angular.module(appCon.appName).directive('barChart', ["$state", "$parse", function($state, $parse) {
    return {
        restrict: 'E',
        scope: {
            data: "=",
            xaxisfield: "@",
            yaxisfield: "@",
            rootnode: "@",
            height: "@",
            width: "@",
            marginBottom: "@",
            marginLeft: "@",
            xaxisrotate: "@",
            xaxistextlength: "@",
            xaxistickslength: "@",
            redirect: "@",
            showtooltip: "@",
            clickEvent:"@",
            tooltipFormatter:"@",
            defaultLabel:"@",
            defaultLabelColor:"@"
        },
        link: function(scope, element) {
            scope.width = typeof(scope.width) != undefined ? scope.width : 450;
            scope.height = typeof(scope.height) != undefined ? scope.height : 350;
            scope.xaxisrotate = typeof(scope.xaxisrotate) != undefined ? scope.xaxisrotate : 0;
            scope.xaxistextlength = typeof(scope.xaxistextlength) != undefined ? scope.xaxistextlength : 250;
            scope.xaxistickslength = typeof(scope.xaxistickslength) != undefined ? scope.xaxistextlength : 5;
            scope.defaultLabel = typeof(scope.defaultLabel) != undefined ? scope.defaultLabel : "";
            scope.defaultLabelColor = typeof(scope.defaultLabelColor) != undefined ? scope.defaultLabelColor : "";
            var showtooltip = typeof(scope.showtooltip) != undefined ? scope.showtooltip : "false";
            var redirect = typeof(scope.redirect) != undefined ? scope.redirect : "";

            var margin = {
                    top: 40,
                    right: 20,
                    bottom: typeof(scope.marginBottom) != undefined ? scope.marginBottom : 30,
                    left: scope.marginLeft != undefined ? scope.marginLeft : 40
                },
                width = Number(scope.width) - Number(margin.left) - Number(margin.right),
                height = Number(scope.height) - Number(margin.top) - Number(margin.bottom);
            
            var barWidth;
            
            // Render graph based on 'data'
            scope.render = function(data) {
            	element.empty();
            	if(data.length < 11){
        			barWidth = 35;
        			width = (barWidth + 10) * data.length;
        		}else{
        			barWidth = 25;
        			width = (barWidth + 10) * data.length;
        		}
        		if(data.length == 1){
        			width = '35';
        		}
        		
        		//var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        		var x = d3.scale.ordinal()
        	    .domain([0,1])
        	    .rangeRoundBands([0, width], 0.1, 0);

                var y = d3.scale.linear().range([height, 0]);

                var xAxis = d3.svg.axis().scale(x).orient("bottom");

                var yAxis = d3.svg.axis().scale(y).orient("left").ticks(6);

                var color = d3.scale.category20();

                var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
                	if (typeof scope.tooltipFormatter !== 'undefined') {              	
                    		var fn = $parse(scope.tooltipFormatter)(scope);
    	        			return fn(d);
                    } else {        
                    	return "<strong>" + d[scope.xaxisfield] + ":</strong> <span>" + d[scope.yaxisfield] + "</span>";
                	}
                });
                
                if (!document.getElementById('d3LineChartTooltipDiv')) {
					$('body').prepend('<div class="tooltip_d3linechart" id="d3LineChartTooltipDiv" style="opacity: 0;z-index:1000;"></div>');
				}

				var div = d3.select('#d3LineChartTooltipDiv');
				
        		var svg = d3.select(element[0]).append("svg")
                .attr("width", Number(width) + Number(margin.left) + Number(margin.right))
                .attr("height", Number(height) + Number(margin.top) + Number(margin.bottom))
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        		svg.call(tip);
        		
        		
                x.domain(data.map(function(d) {
                    return d[scope.xaxisfield];
                }));
                y.domain([0, d3.max(data, function(d) {
                	if(typeof d[scope.yaxisfield] === 'number'){
                		return d[scope.yaxisfield];
                	}else{
                		return Number(d[scope.yaxisfield]);
                	} 
                    
                })]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
                
                if (typeof scope.clickEvent !== 'undefined') {
                	svg.selectAll("g .x.axis").selectAll("text").on('click', function(d, i) {
                		tip.hide();
                		div.style("opacity", 0); 
                		return eval("scope."+scope.clickEvent+"(d, i, \'xaxisClick\', scope.data)");
                    });
                 }
                
                if (scope.xaxisrotate && scope.xaxisrotate != "0") {
                    svg.selectAll("g .x.axis")
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .style("fill", function(name){
                        	if(scope.defaultLabel && scope.defaultLabelColor && name == scope.defaultLabel){
                        		return scope.defaultLabelColor;
                        	}else{
                        		return "#21759b";
                        	}
                        })
                        .style("font", "13px verdana")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(" + scope.xaxisrotate + ")"
                        })
                        .on("mouseover",function(d){
                        	if (scope.xaxistextlength && d.length > Number(scope.xaxistextlength)) {
                        		div.transition()
	            					.duration(500)	
	            					.style("opacity", 0);
                        		div.transition()
	            					.duration(200)	
	            					.style("opacity", .9);	
                        		div.html(d)	 
	            					.style("left", (d3.event.pageX) + "px")			 
	            					.style("top", (d3.event.pageY - 28) + "px")
	                    			.style("width", 'auto')
	                    			.style("height", 'auto')
	                    			.style("padding",'5px');
	                    			
                            }         	
                        	
                        })
                        .on("mouseout",function(d){
                        	div.transition() 
								.duration(500)
								.style("opacity", 0)
								.style("top", 0)
	                    		.style("width", 0);
                        })                       
                        .text(
                            function(t) {
                                if (t) {
                                    if (scope.xaxistextlength && t.length > Number(scope.xaxistextlength)) {
                                        return t.substring(0, scope.xaxistextlength) + "...";
                                    } else {
                                        return t;
                                    }
                                }
                            }
                        );
                }
                svg.append("g")
                    .attr("class", "y axis")
                    .style("font", "13px Arial")
                    .style("fill", "grey")
                    .call(yAxis);
                
                var rect = svg.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .style("opacity","0")
                	.style("fill", "white");         
			    
			    
                rect.transition()
			     .duration(function(d,i){
			    	 return 300 * i;
			     }).ease("linear")
                
                	.attr("class", "bar")

                    .attr("x", function(d) {
                        return x(d[scope.xaxisfield]);
                    })
                    .attr("width", x.rangeBand())
                    .style("fill", function(d, i) {
                        return color(i);
                    })
                    .style("opacity",'.75')
                    .attr("y", function(d) {
                        return y(d[scope.yaxisfield]);
                    })
                    .attr("height", function(d) {
                        return height - y(d[scope.yaxisfield]);
                    });
                
                svg.append("g")
	                .attr("transform", "translate(-10,-10)")
	                .selectAll(".textlabel")
	                .data(data)
	                .enter()
	                .append("text")
	                .attr("class", "textlabel")
	                .attr("x", function(d){return  x(d[scope.xaxisfield]) + (x.rangeBand()/2); })
	                .attr("y", function(d){  return y(d[scope.yaxisfield]) - 2; })
	                .text(function(d){ return d[scope.yaxisfield]; });
                
                if (showtooltip == "true") {                	             	
	                	rect.on('mouseover', tip.show)
	                    	.on('mouseout', tip.hide);                	
                }	               
                
                if (typeof redirect !='undefined' &&  redirect != "") {
                    rect.on('click', function(d) {
                        return $state.go(redirect);
                    });
                }
                
                if (typeof scope.clickEvent !== 'undefined') {	                	
                     rect.on('click', function(d, i) {
                    	 tip.hide();
                    	 return eval("scope."+scope.clickEvent+"(d, i, \'barClick\', scope.data)");
                     });
                 }

            };

            //Watch 'data' and run scope.render(newVal) whenever it changes
            //Use true for 'objectEquality' property so comparisons are done on equality and not reference
            scope.$watch('data', function() {
                if (scope.data != undefined) {
                    var results = eval("scope.data." + scope.rootnode);
                    if (angular.isArray(results) && results.length > 0) {
                        scope.render(results)
                    }
                }
            }, true);
        }
    };
}]);

/*PieChart*/
angular.module(appCon.appName).directive('pieChart', ["$state", "$parse", function($state, $parse) {
    return {
        restrict: 'E',
        scope: {
            data: "=",
            xaxisfield: "@",
            yaxisfield: "@",
            rootnode: "@",
            height: "@",
            width: "@",
            radius: "@",
            redirect: "@",
            showtooltip: "@",
            showlegend:"@",
            showText:"@",
            clickEvent:"@",
            legendContainer:"@",
            pieColor:"@",
            tooltipFormatter:"@"
            
        },
        link: function(scope, element) {
            scope.width = typeof(scope.width) != undefined ? scope.width : 250;
            scope.height = typeof(scope.height) != undefined ? scope.height : 250;
            var outerRadius = typeof(scope.radius) != undefined ? scope.radius : 120;
            var showtooltip = typeof(scope.showtooltip) != undefined ? scope.showtooltip : "false";
            var redirect = typeof(scope.redirect) != undefined ? scope.redirect : "";
           // var color = d3.scale.category10();
            var showLegend = scope.showlegend?scope.showlegend:false;
            var showText = scope.showText?scope.showText:false;
            
            //Custom Pie Chart Color
            var color;
            if(scope.pieColor){
            	color =  d3.scale.ordinal().range(scope.pieColor.split(','));
            }else{
            	color =  d3.scale.category20();
            }
            
            var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
            	if (typeof scope.tooltipFormatter !== 'undefined') {              	
                		var fn = $parse(scope.tooltipFormatter)(scope);
	        			return fn(d);
                } else {        
            		return "<strong>" + d.data[scope.xaxisfield] + ":</strong> <span>" + d.data[scope.yaxisfield] + "</span>";
            	}
            });

            // Render graph based on 'data'
            scope.render = function(data) {
            	element.empty();
                var vis = d3.select(element[0]).append("svg:svg")
                    .data([data])
                    .attr("width", Number(scope.width))
                    .attr("height", Number(scope.height))
                    .style("float", "left")
                    .append("svg:g")
                    .attr("transform", "translate(" + 1.1 * Number(outerRadius) + "," + 1.1 * Number(outerRadius) + ")");

                vis.call(tip);

                var arc = d3.svg.arc().outerRadius(Number(outerRadius));

                var pie = d3.layout.pie()
                    .value(function(d) {
                        return d[scope.yaxisfield];
                    })
                    .sort(function(d) {
                        return null;
                    });

                var arcs = vis.selectAll("g.slice")
                    .data(pie)
                    .enter()
                    .append("svg:g")
                    .attr("class", "slice");

                var path = arcs.append("svg:path").style("opacity","0");

                path.attr("fill", function(d, i) {
                    return color(i);
                }).attr("d", arc)
                .transition().delay(function(d, i) { return i * 0; })
                .duration(1000)
				.attrTween('d', function(d) {
			       var i = d3.interpolate(d.startAngle, d.endAngle);
			       return function(t) {
			           d.endAngle = i(t);
			         return arc(d);
			       }
				  })
				  .style("opacity","1");

                if (showtooltip == "true") {
                    path.on('mouseover', tip.show)
                        .on('mouseout', tip.hide);
                }
                if (typeof redirect !='undefined' &&  redirect != "") {
                    path.on('click', function(d) {
                        return $state.go(redirect);
                    });
                }
                
                if (typeof scope.clickEvent !== 'undefined') {	                	
                	path.on('click', function(d, i) {
                		tip.hide();
                		return eval("scope."+scope.clickEvent+"(d, i)");
                     });
                 }

                /*arcs.append("svg:text")
	                .attr("transform", function(d) { //set the label's origin to the center of the arc
	                	d.radius = Number(outerRadius) + 50; // Set Outer Coordinate
	                	d.innerRadius = Number(outerRadius) + 45; // Set Inner Coordinate
	                	return "translate(" + arc.centroid(d) + ")";
	                })
	                .attr("text-anchor", "middle") //center the text on it's origin
	                .text(function(d, i) { return data[i][scope.xaxisfield]; }); //get the label from our original data array*/
                if(showText == true || showText == 'true'){
	                arcs.filter(function(d) {
	                        return d.endAngle - d.startAngle > .2;
	                    }).append("svg:text")
	                    .attr("dy", ".35em")
	                    .attr("text-anchor", "middle")
	                    .style("fill","white")
	                    .attr("transform", function(d) { //set the label's origin to the center of the arc
	                        //d.radius = Number(outerRadius); // Set Outer Coordinate
	                        //d.innerRadius = Number(outerRadius) + 20; // Set Inner Coordinate
	                    	d.innerRadius = 0;
	                    	d.outerRadius = Number(outerRadius) + 20;
	                        return "translate(" + arc.centroid(d) + ")"; })
	                    .text(function(d) {
	                        return d.data[scope.yaxisfield];
	                    });
                }
                var radius = 84,
                    padding = 0;
                if(showLegend == true || showLegend == 'true'){
                	$('#'+scope.legendContainer).empty();
                	var legendRectSize = 18;                                  
	                var legendSpacing = 4;
	                if(angular.isDefined(scope.legendContainer)){
	            		  var legend = d3.select('#'+scope.legendContainer)
	                  		.append('svg')
	                  		.attr('height', data.length*23)
	                  		.selectAll('.legend')                     
	                  		.data(data)                                   
	                  		.enter()                                                
	                  		.append('g')                                            
	                  		.attr('class', 'legend')                                
	                  		.attr('transform', function(d, i) {                     
	                  			var height = legendRectSize + legendSpacing;         
	                  			var offset =  height * color.domain().length / 2;     
	                  			var horz = -2 * legendRectSize;                       
	                  			var vert = i * height;	                   
	                  			return 'translate(0,' + vert + ')';        
	                  		}); 
	            	  }else{
		                var legend = d3.select(element[0]).append("svg")
		                    .attr("class", "legend")
		                    .attr("width", "30%")
		                    .attr("height", outerRadius * 2.5)
		                    .style("float", "right")
		                    .style("padding", "15px 0 0 20px")
		                    .selectAll("g")
		                    .data(data)
		                    .enter().append("g")
		                    .attr("transform", function(d, i) {
		                        return "translate(0," + (i * 25) + ")";
		                    });
	            	  }
	
	                legend.append("rect")
	                    .attr("width", legendRectSize)
	                    .attr("height", legendRectSize)
	                    .style("fill", function(d, i) {
	                        return color(i);
	                    });
	
	                legend.append("text")
	                    .attr("x", legendRectSize + legendSpacing)
	                    .attr("y", legendRectSize - legendSpacing)		                    
	                    .text(function(d) {
	                        return d[scope.xaxisfield];
	                    });
	                if (typeof scope.clickEvent !== 'undefined') {	                	
	                	legend.on('click', function(d, i) {	                    	
	                      return eval("scope."+scope.clickEvent+"(d, i)");
	                     });
	                 }
                }
                function angle(d) {
                    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
                    return a > 90 ? a - 180 : a;
                }
            };

            //Watch 'data' and run scope.render(newVal) whenever it changes
            //Use true for 'objectEquality' property so comparisons are done on equality and not reference
            scope.$watch('data', function() {
                if (scope.data != undefined) {
                    var results = eval("scope.data." + scope.rootnode);
                    if (angular.isArray(results)) {
                        scope.render(results)
                    }
                }
            }, true);
        }
    };
}]);
/**
 *LineChart
 *
 * <line-chart 
   		data="data" 
   		rootnode="VisionResponse.temperatureDetails" 
   		width="250" 
   		height="150" 
   		xaxisfield="xaxis" 
   		xaxisparser="number" 
   		showxaxislabel="false" 
   		yaxisfields="yaxis1,yaxis2,yaxis3" 
		yaxisfieldlabel=""
		showyaxislabel="false" 
		showtooltip="true"
		margin="{top:10,right:0,bottom:100,left:100}"
		 > 
	</line-chart>
 */
/**
 *LineChart 
 */
angular.module(appCon.appName).directive('lineChart', ["$state", function($state) {
	return {
		restrict: 'E',
		scope: {
			data: "=",
			rootnode: "@",
			id: "@",
			height: "@",
			width: "@",
			xaxisfield: "@",
			yaxisfields: "@",
			yaxisfieldlabel: "@",
			xaxisparser: "@",
			showlegend: "@",
			showxaxislabel: "@",
			showyaxislabel: "@",
			showtooltip: "@",
			clickEvent:"@",
			legendContainer:"@",
			marginAttr:"=margin"
		},
		link: function(scope, element) {
			var parseDate = d3.time.format("%Y%m%d").parse;
			// Render graph based on 'data'
			scope.render = function(data) {
				element.empty();
				var chartData = data;
				var lineChartWidth = scope.width;
				var lineChartHeight = scope.height;
				var xAxisField = scope.xaxisfield;
				var yAxisLabel = scope.yaxisfieldlabel;
				var yAxisFields = scope.yaxisfields;
				var yAxisFieldsArray = yAxisFields.split(',');
				var showLegend = scope.showlegend ? scope.showlegend : false;
				var marginAttr = scope.marginAttr ? scope.marginAttr : {};
				/*if (showLegend == true || showLegend == 'true') {
					var margin = {
						top: 10,
						right: 0,
						bottom: 100,
						left: 100
					};
				} else {
					var margin = {
						top: 10,
						right: 10,
						bottom: 10,
						left: 10
					};
				}*/
				var defaultMargin = {top:0,right:0,bottom:0,left:0};
				var margin = angular.extend(defaultMargin, marginAttr);
				var width = lineChartWidth - margin.left - margin.right,
					height = lineChartHeight - margin.top - margin.bottom;
				var showxaxislabel = (scope.showxaxislabel && (scope.showxaxislabel == true || scope.showxaxislabel == "true")) ? chartData.length : 0;
				var showyaxislabel = (scope.showyaxislabel && (scope.showyaxislabel == true || scope.showyaxislabel == "true")) ? 5 : 0;

				if (!document.getElementById('d3LineChartTooltipDiv')) {
					$('body').prepend('<div class="tooltip_d3linechart" id="d3LineChartTooltipDiv" style="opacity: 0;z-index:1000;"></div>');
				}

				var div = d3.select('#d3LineChartTooltipDiv');

				var x = d3.scale.ordinal().rangeRoundBands([0, width]);

				var y = d3.scale.linear()
					.range([height, 0]);

				var color = d3.scale.category20();

				var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.ticks(showxaxislabel);

				var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.ticks(showyaxislabel);


				var line = d3.svg.line()
					.defined(function(d) {
						return d.value != '';
					})
					.interpolate("linear")
					.x(function(d, i) {
						return x(d.chartKey) + x.rangeBand() / 2
					})
					.y(function(d) {
						return y(d.chartValue);
					});

				var svg = d3.select(element[0]).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				color.domain(yAxisFieldsArray);

				chartData.forEach(function(d) {
					try {
						if (scope.xaxisparser == 'date') {
							d[xAxisField] = parseDate(d[xAxisField]);
						} else if (scope.xaxisparser == 'number') {
							d[xAxisField] = Number(d[xAxisField]);
						} else {
							d[xAxisField] = d[xAxisField];
						}
						d.chartKey = d[xAxisField];
					} catch (e) {

					}
				});

				var yAxisFields = color.domain().map(function(name) {
					if (yAxisFieldsArray.indexOf(name) != -1) {
						return {
							name: name,
							values: chartData.map(function(d) {
								return {
									chartKey: d[xAxisField],
									chartValue: +d[name],
									name: name
								};
							})
						};
					}
				});
				// function for the x grid lines
				function make_x_axis() {
					return d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(chartData.length)
				}

				// function for the y grid lines
				function make_y_axis() {
					return d3.svg.axis()
						.scale(y)
						.orient("left")
						.ticks(5)
				}

				if (scope.xaxisparser == 'date') {
					x.domain(d3.extent(chartData, function(d) {
						return d.chartKey;
					}));
				} else if (scope.xaxisparser == 'number') {
					x.domain([
						d3.min(chartData, function(d) {
							return Number(d.chartKey);
						}),
						d3.max(chartData, function(d) {
							return Number(d.chartKey);
						})
					]);

				} else {
					x.domain(chartData.map(function(d) {
						return d.chartKey;
					}));
				}

				var minY = d3.min(yAxisFields, function(kv) {
					return d3.min(kv.values, function(d) {
						return d.chartValue;
					})
				});
				var maxY = d3.max(yAxisFields, function(kv) {
					return d3.max(kv.values, function(d) {
						return d.chartValue;
					})
				});
				//console.log(minY+'--'+maxY);
				y.domain([minY, maxY]);

				//var div = d3.select("#d3LinechartTooltip");

				if (showLegend == true || showLegend == 'true') {
					$('#'+scope.legendContainer).empty();
					 var legendRectSize = 18;                                  
	                 var legendSpacing = 4;  
	            	 if(angular.isDefined(scope.legendContainer)){
	            		 var legend = d3.select('#'+scope.legendContainer)
	                  		.append('svg')
	                  		.attr('height',yAxisFields.length*23)
	                  		.selectAll('.legend')                     
	                  		.data(yAxisFields)                                   
	                  		.enter()                                                
	                  		.append('g')                                            
	                  		.attr('class', 'legend')                                
	                  		.attr('transform', function(d, i) {                     
	                  			var height = legendRectSize + legendSpacing;         
	                  			var offset =  height * color.domain().length / 2;     
	                  			var horz = -2 * legendRectSize;                       
	                  			var vert = i * height;	                   
	                  			return 'translate(0,' + vert + ')';        
	                  		}); 
	            	 }else{
		            	  var legend = svg.selectAll(".legend")
		                  	.data(yAxisFields)
		                	.enter().append("g")
		                	.attr("class", "legend")
		                	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
	            	 }
	            	  
					/*var legend = d3.select(element[0]).append("svg")
						.attr("class", "legend")
						.attr("width", "100%")
						.attr("height", "95%")
						.style("float", "right")
						.style("padding", "15px 0 0 20px")
						.selectAll("g")
						.data(yAxisFields)
						.enter().append("g")
						.attr("transform", function(d, i) {
							return "translate(0," + (i * 25) + ")";
						});*/

					legend.append("rect")
						.attr("width", legendRectSize)
						.attr("height", legendRectSize)
						.style("fill", function(d) {
							return color(d.name);
						});

					legend.append("text")
						.attr("x", legendRectSize + legendSpacing)
						.attr("y", legendRectSize - legendSpacing)							
						.text(function(d) {
							return d.name;
						});
					
					 if (typeof scope.clickEvent !== 'undefined') {	                	
						 legend.on('click', function(d, i) {	                    	
	                      return eval("scope."+scope.clickEvent+"(d, i)");
	                     });
	                 }
				}

				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function(d) {
						return "rotate(-65)"
					});
				
				if (typeof scope.clickEvent !== 'undefined') {	   
					 svg.selectAll(".x.axis g.tick").on('click', function(d, i) {
	            		 return eval("scope."+scope.clickEvent+"(d, i)");
	                  });
				}
				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)
					.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(yAxisLabel);

				// Draw the x Grid lines
				svg.append("g")
					.attr("class", "grid")
					.attr("transform", "translate(0," + height + ")")
					.call(make_x_axis()
						.tickSize(-height, 0, 0)
						.tickFormat("")
					)

				// Draw the y Grid lines
				svg.append("g")
					.attr("class", "grid")
					.call(make_y_axis()
						.tickSize(-width, 0, 0)
						.tickFormat("")
					)

				var yAxisField = svg.selectAll(".yAxisField")
					.data(yAxisFields)
					.enter().append("g")
					.attr("class", "yAxisField");

				yAxisField.append("path")
					.attr("class", "line")
					.attr("d", function(d) {
						return line(d.values);
					})
					.style("stroke", function(d) {
						return color(d.name);
					});
				
				if (typeof scope.clickEvent !== 'undefined') {	                	
					yAxisField.on('click', function(d, i) {	                    	
						return eval("scope."+scope.clickEvent+"(d, i)");
				});
	            	  
	            	 
	            	  
	              }
				
				if (scope.showtooltip == true || scope.showtooltip == 'true') {
					var tooltip = svg.selectAll("g.dot").data(yAxisFields).enter().append("g").attr("class", "dot").selectAll("circle").data(function(d) {
							return d.values;
						}).enter().append("circle").attr("r", 3)
						.attr("cx", function(d, i) {
							return x(d.chartKey) + x.rangeBand() / 2
						})
						.attr("cy", function(d, i) {
							return y(d.chartValue);
						})
						.style("fill", function(d) { return color(d.name); })
						.on("mouseover", function(d) { // when the mouse goes over a circle, do the following
							div.transition() // declare the transition properties to bring fade-in div
								.duration(200) // it shall take 200ms
								.style("opacity", .9) // and go all the way to an opacity of .9
								.style("z-index", 10000); // and go all the way to an opacity of .9
							div.html(d.chartKey + "<br/>" + d.chartValue) // add the text of the tooltip as html 
								.style("left", (d3.event.pageX) + "px") // move it in the x direction 
								.style("top", (d3.event.pageY - 28) + "px"); // move it in the y direction
						}) // 
						.on("mouseout", function(d) { // when the mouse leaves a circle, do the following
							div.transition() // declare the transition properties to fade-out the div
								.duration(500) // it shall take 500ms
								.style("opacity", 0); // and go all the way to an opacity of nil
						});
				}
			};

			scope.$watchCollection('data', function(newx, oldx) {
				if (scope.data != undefined) {
					var results = eval("scope.data." + scope.rootnode);
					if (angular.isArray(results)) {
						scope.render(results)
					}
				}
			}, true);
		}
	};
}]);

/**
<multi-bar-chart
    data="data"
    width="600"
    height="300"
    xaxisfield="State"
    yaxisfields="Under 5 Years,5 to 13 Years,14 to 17 Years,18 to 24 Years,25 to 44 Years,45 to 64 Years,65 Years and Over"
    yaxisfieldlabel="Population"
    rootnode="VisionResponse.chartRootNode"
    showlegend="false"
	>
</multi-bar-chart>
	    
** MultiBarChart **
**/
angular.module(appCon.appName).directive('multiBarChart', ["$state", function($state) {
	return {
	    restrict: 'E',
	    scope: {
	        data: "=",
	        rootnode: "@",
	        id: "@",
	        height: "@",
	        width: "@",
	        xaxisfield: "@",
	        yaxisfields: "@",
	        yaxisfieldlabel: "@",
	        xaxisparser: "@",
	        showlegend:"@",
            clickEvent:"@",
            legendContainer:"@"
	    },
	    link: function(scope, element) {
	    	var parseDate = d3.time.format("%Y%m%d").parse;
	        // Render graph based on 'data'
	        scope.render = function(data) {
	        	element.empty();
	        	var chartData = data;            	
	        	var multiBarChartWidth = scope.width;
	        	var multiBarChartHeight = scope.height;
	        	var xAxisField = scope.xaxisfield;
	        	var yAxisFields = scope.yaxisfields.split(',');
	        	var yAxisLabel = scope.yaxisfieldlabel;            	
	        	
	        	var showLegend = scope.showlegend?scope.showlegend:false;
	        	var margin = {top: 20, right: 80, bottom: 60, left: 50},
	        	    width = multiBarChartWidth - margin.left - margin.right,
	        	    height = multiBarChartHeight - margin.top - margin.bottom;
	        	
	        	var x0 = d3.scale.ordinal()
	            .rangeRoundBands([0, width], .1);
	
	        	var x1 = d3.scale.ordinal();
	
	        	var y = d3.scale.linear()
	            .range([height, 0]);
	
	            var color = d3.scale.category20();
	
	            var xAxis = d3.svg.axis()
	                .scale(x0)
	                .orient("bottom");
	
	            var yAxis = d3.svg.axis()
	                .scale(y)
	                .orient("left")
	               // .tickFormat(d3.format(".2s"));
	            
	            var tip = d3.tip()
		            .attr('class', 'd3-tip')
		            .offset([-10, 0])
		            .html(function(d) {
		            	return "<strong>"+d.name+":</strong> <span style='color:red'>" + d.value + "</span>";
		            });
	            
	            var svg = d3.select(element[0]).append("svg")
	                .attr("width", width + margin.left + margin.right)
	                .attr("height", height + margin.top + margin.bottom)
	              .append("g")
	                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	     
	
	              data.forEach(function(d) {
	                d.yaxisfieldKey = yAxisFields.map(function(name) { return {name: name, value: +d[name]}; });
	              });
	
	              x0.domain(data.map(function(d) { return d[xAxisField]; }));
	              x1.domain(yAxisFields).rangeRoundBands([0, x0.rangeBand()]);
	              y.domain([0, d3.max(data, function(d) { return d3.max(d.yaxisfieldKey, function(d) { return d.value; }); })]);
	
	              svg.append("g")
	                  .attr("class", "x axis")
	                  .attr("transform", "translate(0," + height + ")")
	                  .call(xAxis);
	              
	              
	              svg.append("g")
	                  .attr("class", "y axis")
	                  .call(yAxis)
	                .append("text")
	                  .attr("transform", "rotate(-90)")
	                  .attr("y", 6)
	                  .attr("dy", ".71em")
	                  .style("text-anchor", "end")
	                  .text(scope.yaxisfieldlabel);
	              
	              svg.call(tip);
	              
	              var state = svg.selectAll(".state")
	                  .data(data)
	                .enter().append("g")
	                  .attr("class", "g")
	                  .attr("transform", function(d) { return "translate(" + x0(d[xAxisField]) + ",0)"; });
	
	              state.selectAll("rect")
	                  .data(function(d) { return d.yaxisfieldKey; })
	                .enter().append("rect")
	                  .attr("width", x1.rangeBand())
	                  .attr("x", function(d) { return x1(d.name); })
	                  .attr("y", function(d) { return y(d.value); })
	                  .attr("height", function(d) { return height - y(d.value); })
	                  .style("fill", function(d) { return color(d.name); })
	                  .on('mouseover', tip.show)
	                  .on('mouseout', tip.hide);
	              
	              if (typeof scope.clickEvent !== 'undefined') {	                	
	            	  state.selectAll("rect").on('click', function(d, i) {
	            		  tip.hide();
	            		  return eval("scope."+scope.clickEvent+"(d, i)");
	                  });
	            	  
	            	  svg.selectAll(".x.axis g.tick").on('click', function(d, i) {
	            		  tip.hide();
	            		  return eval("scope."+scope.clickEvent+"(d, i)");
	                  });
	              }
	              
	              if(showLegend == true || showLegend == 'true'){
	            	  $('#'+scope.legendContainer).empty();
	            	  var legendRectSize = 18;                                  
	                  var legendSpacing = 4;  
	            	  if(angular.isDefined(scope.legendContainer)){
	            		  var legend = d3.select('#'+scope.legendContainer)
	                  		.append('svg')
	                  		.attr('height',yAxisFields.length*23)
	                  		.selectAll('.legend')                     
	                  		.data(yAxisFields.slice().reverse())                                   
	                  		.enter()                                                
	                  		.append('g')                                            
	                  		.attr('class', 'legend')                                
	                  		.attr('transform', function(d, i) {                     
	                  			var height = legendRectSize + legendSpacing;         
	                  			var offset =  height * color.domain().length / 2;     
	                  			var horz = -2 * legendRectSize;                       
	                  			var vert = i * height;	                   
	                  			return 'translate(0,' + vert + ')';        
	                  		}); 
	            	  }else{
		            	  var legend = svg.selectAll(".legend")
		                  	.data(yAxisFields.slice().reverse())
		                	.enter().append("g")
		                	.attr("class", "legend")
		                	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
	            	  }
		
	            	  legend.append('rect')                                    
		                  .attr('width', legendRectSize)                        
		                  .attr('height', legendRectSize)                        
		                  .style('fill', color)                                   
		                  .style('stroke', color);                               
	                  
	            	  legend.append('text')                                     
		                  .attr('x', legendRectSize + legendSpacing)             
		                  .attr('y', legendRectSize - legendSpacing)              
		                  .text(function(d) { return d; });
		              
		              if (typeof scope.clickEvent !== 'undefined') {	                	
		            	  legend.on('click', function(d, i) {	                    	
		            		  return eval("scope."+scope.clickEvent+"(d, i)");
		                  });
		              }
		            	
		          	}	
	            };
	
	        //Watch 'data' and run scope.render(newVal) whenever it changes
	        //Use true for 'objectEquality' property so comparisons are done on equality and not reference
	            
	        scope.$watchCollection('data', function(newx, oldx) {
	        	if (scope.data != undefined) {
	                var results = eval("scope.data." + scope.rootnode);
	                if (angular.isArray(results)) {
	                    scope.render(results);
	                }
	            }
	        }, true);
	    }
	};	
}]);

/**
 *DualLineChart
 *
 *<dual-line-chart data="data" rootnode="successData.linechart" width="300" height="150" xaxisfield="date" yaxisfields="close,open">
 * 
 */

angular.module(appCon.appName).directive('dualLineChart', ["$state", function($state) {
	return {
		restrict: 'E',
		scope: {
			data: "=",
			rootnode: "@",
			height: "@",
			width: "@",
			xaxisfield: "@",
			yaxisfields: "@",
			yaxisfieldlabel: "@",
			xaxisparser: "@"
		},
		link: function(scope, element) {
			// Render graph based on 'data'
			scope.render = function(data) {
				element.empty();
				var chartData = data;
				var lineChartWidth = scope.width;
				var lineChartHeight = scope.height;
				var xAxisField = scope.xaxisfield;
				var yAxisFields = scope.yaxisfields;
				var yAxisFieldsArray = yAxisFields.split(',');
				var yAxisFieldLeft = yAxisFieldsArray[0];
				var yAxisFieldRight = yAxisFieldsArray[1];
				var margin = {top: 30, right: 40, bottom: 30, left: 50};
				var width = lineChartWidth - margin.left - margin.right,
					height = lineChartHeight - margin.top - margin.bottom;

				var x = d3.scale.ordinal().rangeRoundBands([0, width]);

				var y0 = d3.scale.linear().range([height, 0]);
				var y1 = d3.scale.linear().range([height, 0]);

				var xAxis = d3.svg.axis().scale(x)
				    .orient("bottom").ticks(5);

				var yAxisLeft = d3.svg.axis().scale(y0)
				    .orient("left").ticks(5);

				var yAxisRight = d3.svg.axis().scale(y1)
				    .orient("right").ticks(5);			
				
				var valueline = d3.svg.line()					
				    .x(function(d) { return x(d[xAxisField]) + x.rangeBand() / 2; })
				    .y(function(d) { return y0(d[yAxisFieldLeft]); });
			    
				var valueline2 = d3.svg.line()
				    .x(function(d) { return x(d[xAxisField]) + x.rangeBand() / 2; })
				    .y(function(d) { return y1(d[yAxisFieldRight]); });
			
				
				var svg = d3.select(element[0]).append("svg")
				        .attr("width", width + margin.left + margin.right)
				        .attr("height", height + margin.top + margin.bottom)
				        .attr("class", "vmd3duallinechart")
				        .append("g")
				        .attr("transform", 
				              "translate(" + margin.left + "," + margin.top + ")");

				
				if (scope.xaxisparser == 'date') {
					x.domain(d3.extent(chartData, function(d) {
						return d[xAxisField];
					}));
				} else if (scope.xaxisparser == 'number') {
					x.domain([
						d3.min(chartData, function(d) {
							return Number(d[xAxisField]);
						}),
						d3.max(chartData, function(d) {
							return Number(d[xAxisField]);
						})
					]);

				} else {
					x.domain(chartData.map(function(d) {
						return d[xAxisField];
					}));
				}				
				
				y0.domain([
				           d3.min(chartData, function(d) { return Math.min(d[yAxisFieldLeft]); }), 
				           d3.max(chartData, function(d) { return Math.max(d[yAxisFieldLeft]); })
				         ]);
				
				y1.domain([
				           d3.min(chartData, function(d) { return Math.min(d[yAxisFieldRight]); }), 
				           d3.max(chartData, function(d) { return Math.max(d[yAxisFieldRight]); })
				         ]);
			    
				svg.append("path")        // Add the valueline path.
		        	.attr("d", valueline(chartData));

			    svg.append("path")        // Add the valueline2 path.
			        .style("stroke", "red")
			        .attr("d", valueline2(chartData));
	
			    svg.append("g")            // Add the X Axis
			        .attr("class", "x axis")
			        .attr("transform", "translate(0," + height + ")")
			        .call(xAxis);
	
			    svg.append("g")
			        .attr("class", "y axis")
			        .style("fill", "steelblue")
			        .call(yAxisLeft);	
	
			    svg.append("g")				
			        .attr("class", "y axis")	
			        .attr("transform", "translate(" + width + " ,0)")	
			        .style("fill", "red")		
			        .call(yAxisRight);
			    
			 // function for the x grid lines
				function make_x_axis() {
					return d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(5)
				}

				// function for the y0 grid lines
				function make_y0_axis() {
					return d3.svg.axis()
						.scale(y0)
						.orient("left")
						.ticks(5)
				}
				
				// function for the y1 grid lines
				function make_y1_axis() {
					return d3.svg.axis()
						.scale(y1)
						.orient("right")
						.ticks(5)
				}
				
				// Draw the x Grid lines
				svg.append("g")
					.attr("class", "grid")
					.attr("transform", "translate(0," + height + ")")
					.call(make_x_axis()
						.tickSize(-height, 0, 0)
						.tickFormat("")
					)

				// Draw the y Grid lines
				svg.append("g")
					.attr("class", "grid")
					.call(make_y0_axis()
						.tickSize(-width, 0, 0)
						.tickFormat("")
					)
				
			    
				
			};

			scope.$watchCollection('data', function(newx, oldx) {
				if (scope.data != undefined) {
					var results = eval("scope.data." + scope.rootnode);
					if (angular.isArray(results)) {
						scope.render(results)
					}
				}
			}, true);
		}
	};
}]);