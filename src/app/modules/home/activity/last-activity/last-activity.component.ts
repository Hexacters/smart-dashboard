import { Component, ViewChild } from "@angular/core";
import {
  ApexChart,
  ApexAxisChartSeries,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid
} from "ng-apexcharts";

type ApexXAxis = {
  type?: "category" | "datetime" | "numeric";
  categories?: any;
  title: any;
  labels?: {
    show: boolean;
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
  tooltip: any;
};

@Component({
  selector: 'app-last-activity',
  templateUrl: './last-activity.component.html',
  styleUrls: ['./last-activity.component.scss']
})
export class LastActivityComponent {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      tooltip: {
        // custom: function({ series, seriesIndex, dataPointIndex, w }) {
        //   return (
        //     '<div class="container">' +
        //     "<span>" +
        //     w.globals.labels[dataPointIndex] +
        //     ": " +
        //     series[seriesIndex][dataPointIndex] +
        //     "</span>" +
        //     "</div>"
        //   );
        // },
        x: {
          show: true,
          formatter: (data) => `Johns Hospital - ${data}`,
        },
        y: {
          formatter: (data) => `${data}-09-2020`,
          title: {
            formatter: (seriesName) => seriesName,
          },
        }
      },
      series: [
        {
          name: "Last Visited",
          data:  [35, 40, 49, 51, 61, 73, 89, 95, 123]
        }
      ],
      chart: {
        toolbar: {
          show: false
        },
        height: 200,
        type: "bar",
        events: {
          click: function (chart, w, e) {
            // console.log(chart, w, e)
          }
        }
      },
      colors: [
        "#008FFB",
        "#00E396",
        "#FEB019",
        "#FF4560",
        "#775DD0",
        "#546E7A",
        "#26a69a",
      ],
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      grid: {
        show: true
      },
      xaxis: {
        categories: [
          'Lose Angel',
          'Chicago',
          'Houston',
          ['San Diego'],
          ['Dallas'],
          "San Jose",
          "Chicago",
          "Lose Angel",
        ],
        labels: {
          show: false,
          style: {
            fontSize: '12px',
          }
        },
        title: {
          text: 'Accounts',
          offsetY: 10,
          style: {
            color: undefined,
            fontSize: '14px',
            fontWeight: 'bold',
          },
        }
      },
      yaxis: {
        show: true,
        title: {
          text: 'Sum of days Since Last Visit',
          style: {
            color: undefined,
            fontSize: '10px',
            fontWeight: '500',
          },
        },
        forceNiceScale: true,
        max: 150,
      },
    };
  }
}
