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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ModalComponent } from '../../../modal/modal.component';

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
    email: string;
    selectedCategories;
    selectedSeries;
    VisitedDate;
    selectedSeriesName;
    activtyDaysList;
  
 // subtract one day from current time                           
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
            name: 'Activity By Health System',
            title: 'ACTIVITY BY HEALTH SYSTEM',
            filters: [
                /* {
                    name: 'Today',
                    active: false,
                }, */
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
            name: 'Account Last Visit Activity Report',
            title: 'ACCOUNT LAST VISIT ACTIVITY REPORT',
            filters: [],
            isCustome: true,
        }
    ];

    slides = [{ 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }, { 'image': 'https://gsr.dev/material2-carousel/assets/demo.png' }];
    constructor(public dialog: MatDialog) {
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
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                      console.log('barClick' + event + chartContext + config);
                      console.log('series' + config.w.config.series[config.seriesIndex].data[config.dataPointIndex]);
                      console.log('categories' + config.w.config.xaxis.categories[config.dataPointIndex]);
                      console.log('seriesName' + config.w.config.series[config.seriesIndex].name);
                      let dateObj = new Date(); 
                      this.selectedSeries = config.w.config.series[config.seriesIndex].data[config.dataPointIndex];
                      this.selectedSeriesName = config.w.config.series[config.seriesIndex].name
                      this.selectedCategories = config.w.config.xaxis.categories[config.dataPointIndex];
                      this.VisitedDate=dateObj.setDate(dateObj.getDate() - this.selectedSeries);
                      this.VisitedDate=new Date(this.VisitedDate);
                      this.VisitedDate = this.VisitedDate.getDate() + "-" + (this.VisitedDate.getMonth() + 1) + "-" + this.VisitedDate.getFullYear()
                      this.openDialog(config);
                    }
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

    ngOnInit(): void { 
        this.activtyDaysList = [
            {value: '30', viewValue: '30'},
            {value: '60', viewValue: '60'},
            {value: '90', viewValue: '90'},
            {value: '120', viewValue: '120'},
            {value: '150', viewValue: '150'}
        ];
    }

    openDialog(props) {
        const dialogRef = this.dialog.open(ModalComponent, {
          width: '65%',
            data: {
                'Properties': props,
                'selectedSeries': this.selectedSeries,
                'selectedCategories': this.selectedCategories,
                'VisitedDate': this.VisitedDate,
                'selectedSeriesName' : this.selectedSeriesName
            }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          this.email = result;
        });
      }
}
