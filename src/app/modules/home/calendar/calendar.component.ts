import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbDateStruct, NgbDatepicker, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { ASettings } from '../settings/settings.service';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CalendarComponent extends ASettings implements OnInit {

    @ViewChild(NgbDatepicker, { static: true }) datepicker: NgbDatepicker;

    model: NgbDateStruct;
    date: { year: number, month: number };

    navigate(number: number) {
        const { state, calendar } = this.datepicker;
        this.datepicker.navigateTo(calendar.getNext(state.firstDate, 'm', number));
    }

    today() {
        const { calendar } = this.datepicker;
        this.datepicker.navigateTo(calendar.getToday());
    }

    constructor(public i18n: NgbDatepickerI18n) {
        super();
        this.title = 'Calender';
    }


    ngOnInit(): void {
    }

}
