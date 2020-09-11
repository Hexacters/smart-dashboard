import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ChartComponent, ApexDataLabels, ApexPlotOptions, ApexLegend } from 'ng-apexcharts';

import {
    ApexNonAxisChartSeries,
    ApexResponsive,
    ApexChart
} from 'ng-apexcharts';

export interface IChartOptions {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
    fill?: any;
    colors: string[];
    legend: ApexLegend;
}

@Component({
    selector: 'app-donut-chart',
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit {

    chartData: any[] = [];
    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<IChartOptions>;

    @Input() data = [];
    @Input() labels = [];
    @Input() centerLabels = 'Sep 1';
    @Input() height = 'auto';
    @Input() isView = false;
    @Input() color = ['#44a95e', '#eaa706', '#0c1d42', '#41A0FC', '#2d57b9'];
    @Input() legend = false;
    @Input() legendPosition: 'bottom' | 'top' | 'right' | 'left' = 'bottom';
    constructor() { }

    ngOnInit(): void {
        this.chartOptions = {
            series: this.data,
            chart: {
                height: this.height,
                type: 'donut'
            },
            fill: {
                colors: this.color
            },
            legend: {
                position: this.legendPosition,
                show: this.legend
            },
            dataLabels: {
                enabled: false
            },
            labels: this.labels.length ? this.labels : ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
            colors: this.color,
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        },
                        stroke: {
                            show: true,
                            curve: 'smooth',
                            lineCap: 'butt',
                            colors: undefined,
                            width: 10,
                            dashArray: 0,
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ],
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            name: {
                                offsetY: 5,
                                fontSize: '10px',
                                color: '#000000',
                                formatter: (val: string): string => {
                                    return this.centerLabels;
                                },
                            },
                            value: {
                                fontSize: '10px',
                                show: this.isView
                            },
                            total: {
                                show: true
                            }
                        }
                    }
                }
            }
        };
    }
}

