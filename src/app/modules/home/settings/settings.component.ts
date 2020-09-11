import { Component, OnInit, Input } from '@angular/core';
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  isClose: boolean;
  isFullScreen: boolean;
  @Input() public setting: any;
  @Input() public fullscreen: boolean;
  constructor() { }

  ngOnInit(): void {
  }

  toggle() {
    this.isClose = !this.isClose;
    this.setting.toggle();
  }

  fullScreen() {
    if (this.fullscreen) {
      this.isFullScreen = !this.isFullScreen;
      this.setting.fullscreen();
    }
  }

}
