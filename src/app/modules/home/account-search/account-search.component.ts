import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ASettings } from '../settings/settings.service';

@Component({
  selector: 'app-account-search',
  templateUrl: './account-search.component.html',
  styleUrls: ['./account-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountSearchComponent extends ASettings implements OnInit {

  constructor() {
    super();
    this.title = 'Account Search';
  }

  ngOnInit(): void {
  }

}
