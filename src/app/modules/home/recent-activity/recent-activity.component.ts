import { Component, OnInit } from '@angular/core';
import { ASettings } from './../settings/settings.service';
@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent extends ASettings implements OnInit {

  constructor() {
    super();
    this.title = 'Recent Activity';
  }

  ngOnInit(): void {
  }

}
