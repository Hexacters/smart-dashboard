import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { CommonService } from './../../service/common.service';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  @Input() public drawer: MatDrawer;

  public mobileQuery: MediaQueryList;
  public isOpen: boolean;

  constructor(private commonService: CommonService, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  ngOnInit(): void {
    this.isOpen = false;
    this.updateNav();
  }

  updateNav() {
    this.isOpen = !this.isOpen;
    this.commonService.updateNav(this.isOpen);
  }

}
