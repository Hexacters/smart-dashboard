import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';

import { Routes, RouterModule } from '@angular/router';
import { InformationComponent } from './information/information.component';
import { TrandsComponent } from './trands/trands.component';
import { CalendarComponent } from './calendar/calendar.component';
import { UpcomingComponent } from './upcoming/upcoming.component';
import { DonutChartComponent } from './upcoming/donut-chart/donut-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AccountSearchComponent } from './account-search/account-search.component';
import { AccountsComponent } from './accounts/accounts.component';
import { ActivityComponent } from './activity/activity.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/@cpm/shared/shared.module';
import { SettingsComponent } from './settings/settings.component';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { LastActivityComponent } from './activity/last-activity/last-activity.component';

const routes: Routes = [
    {
        path: '**',
        component: HomeComponent,
        children: [],
    },
];

@NgModule({
    declarations: [HomeComponent, InformationComponent, TrandsComponent, CalendarComponent, UpcomingComponent, DonutChartComponent, AccountSearchComponent, AccountsComponent, ActivityComponent, RecentActivityComponent, SettingsComponent, LastActivityComponent],
    imports: [
        RouterModule.forChild(routes),
        MatCarouselModule.forRoot(),
        CommonModule,
        SharedModule,
        NgbDatepickerModule,
        NgApexchartsModule
    ]
})
export class HomeModule { }
