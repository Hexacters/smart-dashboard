import { Component, OnInit } from '@angular/core';
import { ASettings } from '../settings/settings.service';

@Component({
    selector: 'app-information',
    templateUrl: './information.component.html',
    styleUrls: ['./information.component.scss']
})
export class InformationComponent extends ASettings implements OnInit {

    announcementBanner = [];

    constructor() {
        super();
        this.title = 'Notification';
        this.announcementBanner = [
            { 'title': 'COVID-19 Updates', 'description': 'Due to heightened concerns, routinely acknowledge new related policies and check in for updates.', 'actions': 'View Policy' },
            { 'title': 'New Health Systems', 'description': 'Providence St. Joseph Health locations have joined Vendormate: AK, CA, MT, OR, TX, WA.', 'actions': 'Register' },
            { 'title': 'Monthly Training Webinars', 'description': 'Looking for additional guidance and information on the Vendormate Credentialing process?.', 'actions': 'See Courses' }
        ];
    }

    ngOnInit(): void {
    }

    dismissAnnounce(val) {
        this.announcementBanner.splice(val, 1);
        console.log(this.announcementBanner);
    }

}
