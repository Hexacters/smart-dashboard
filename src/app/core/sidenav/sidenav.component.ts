import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router'
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidenavComponent implements OnInit {

  public isOpen: boolean;
  public isSubMenu: boolean;
  public menus: any[] = [
    {
      name: 'Payment Options',
      icon: 'payment',
    },
    {
      name: 'Payment Receipts',
      icon: 'payments',
    },
    {
      name: 'Share My Credentials',
      icon: 'compass_calibration',
    },
    {
      name: 'View Access Status',
      icon: 'receipt',
    },
    {
      name: 'Print Badge',
      icon: 'print',
    },
    {
      name: 'Request Appoinment',
      icon: 'rate_review',
    },
    {
      name: 'View Request',
      icon: 'speaker_notes',
    },
    {
      name: 'Tire change Request',
      icon: 'poll',
    },
  ];
  constructor(private commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
    this.commonService.sideNav.subscribe((data) => {
      this.isOpen = data;
    });
  }

  public toggleMenu() {
    this.isSubMenu = !this.isSubMenu;
  }

  public ng1BootstrapCallMenu() {
    this.router.navigate(['/vdb/documents']);
  }

}
