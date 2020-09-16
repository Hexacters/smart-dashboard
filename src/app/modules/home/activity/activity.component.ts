import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexYAxis,
    ApexLegend,
    ApexStroke,
    ApexXAxis,
    ApexFill,
    ApexTooltip
} from 'ng-apexcharts';
import { MatCarousel, MatCarouselComponent } from '@ngmodule/material-carousel';

import { ASettings } from '../settings/settings.service';

export interface IChartOptions {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    fill: ApexFill;
    colors: string[];
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    legend: ApexLegend;
}

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ActivityComponent extends ASettings implements OnInit {
    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<IChartOptions>;
    public charts: any[] = [
        {
            name: 'Badge Activity',
            title: 'BADGE ACTIVITY',
            filters: [
                {
                    name: '7d',
                    active: true,
                },
                {
                    name: '15d',
                    active: false,
                },
                {
                    name: '1m',
                    active: false,
                },
            ]
        },
        {
            name: 'Location Activity',
            title: 'LOCATION ACTIVITY',
            filters: [
                {
                    name: 'Today',
                    active: false,
                },
                {
                    name: '7d',
                    active: true,
                },
                {
                    name: '15d',
                    active: false,
                },
                {
                    name: '1m',
                    active: false,
                },
            ]
        },
        {
            name: 'Last Activity',
            title: 'LAST ACTIVITY',
            filters: [
                {
                    name: 'More then 30 Days',
                    active: true,
                },
                {
                    name: 'More then 60 Days',
                    active: false,
                },
            ]
        }
    ];

    slides = [{ 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }];
    constructor() {
        super();
        this.title = 'Branding Activity';
        this.chartOptions = {
            series: [
                {
                    name: 'Success',
                    data: [76, 55, 101, 56, 61, 20, 33]
                },
                {
                    name: 'Warning',
                    data: [10, 85, 20, 98, 87, 40, 23]
                },
                {
                    name: 'Denied',
                    data: [35, 41, 36, 26, 45, 30, 13]
                }
            ],
            legend: {
                show: true,
                position: 'right'
            },
            colors: ['#44a95e', '#eaa706', '#DB2A30'],
            chart: {
                toolbar: {
                    show: false
                },
                type: 'bar',
                stacked: true,
                height: '200px'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: [
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                    'Sun',
                ]
            },
            yaxis: {
                show: false,
            },
            fill: {
                opacity: 1,
                colors: ['#44a95e', '#eaa706', '#DB2A30']
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return '' + val + ' count';
                    }
                }
            }
        };
    }

    ngOnInit(): void { }
}
