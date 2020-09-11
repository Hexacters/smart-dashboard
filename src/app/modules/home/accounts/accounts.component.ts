import { Component, OnInit } from '@angular/core';
import { ASettings } from '../settings/settings.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent extends ASettings implements OnInit {

  constructor() {
    super();
    this.title = 'Accounts';
  }

  ngOnInit(): void {
  }

}
