import { Component, OnInit } from '@angular/core';
import { MockData } from './mock-data';
import { ASettings } from '../settings/settings.service';

@Component({
    selector: 'app-upcoming',
    templateUrl: './upcoming.component.html',
    styleUrls: ['./upcoming.component.scss']
})
export class UpcomingComponent extends ASettings implements OnInit {

    public viewData: number[] = [];
    public mockData = MockData;
    index: any;
    constructor() {
        super();
        this.title = 'Upcoming';
    }

    ngOnInit(): void {
        //  this.viewData = [10, 20, 30, 20];
        this.onSelectedUpcomingChart(0);
    }

    public onSelectedUpcomingChart(index): void {
        // console.log(data);
        this.index = index;
        //    this.viewData = data;

    }
}
