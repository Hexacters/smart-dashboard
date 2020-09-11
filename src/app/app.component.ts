import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { UpgradeModule } from '@angular/upgrade/static';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'Vendor Dashboard';
  public mobileQuery: MediaQueryList;

  constructor (private upgrade: UpgradeModule, private router: Router, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  ngOnInit (): void {
    this.upgrade.bootstrap(document.body, ['vendordash']);
  }

  public ng1BootstrapCallMenu() {
    this.router.navigateByUrl('vdb/documents/');
  }
  showFiller: boolean = false
}
