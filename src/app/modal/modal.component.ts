import { Component, OnInit,Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

interface DialogData {
  Properties:any;
  selectedSeries;
  selectedCategories;
  VisitedDate;
  selectedSeriesName;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit {
  displayedColumns: string[] = ['Sign-In','Sign-Out','Event-Type', 'Department', 'Sign-In-Location', 'Sign-Out-Location','Purpose-of-visit','Override-Guest-Pass-Reason','Badge-Printed'];
  selectedCar = 'Success';
   ELEMENTDATA = [
    {signIn: 'Aug 29, 2020 01:02 AM', signOut:'Aug 29, 2020 04:45 PM', Department: 'Accounting', sighInLoc: 'Apollo-chennai', signOutLoc: 'Apollo-chennai', eventType:'Printed on site', signInBy: 'amala@mookambikainfo.com',poVisit:'Long Appt Test',guestPassReason:'Long Appt Test',badgePrinted:'true'},
    {signIn: 'Aug 28, 2020 07:40 AM', signOut:'Aug 28, 2020 04:45 PM', Department: 'Administration', sighInLoc: 'KMC-chennai', signOutLoc: 'KMC-chennai', eventType:'Print Remotely', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
    {signIn: 'Aug 25, 2020 05:56 PM', signOut:'Aug 25, 2020 06:59 PM', Department: 'Cath Lab', sighInLoc: 'Global-chennai', signOutLoc: 'Global-chennai', eventType:'Guest pass', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
    {signIn: 'Aug 29, 2020 01:02 AM', signOut:'Aug 29, 2020 04:45 PM', Department: 'Accounting', sighInLoc: 'Apollo-chennai', signOutLoc: 'Apollo-chennai', eventType:'Printed on site', signInBy: 'amala@mookambikainfo.com',poVisit:'Long Appt Test',guestPassReason:'Long Appt Test',badgePrinted:'true'},
    {signIn: 'Aug 28, 2020 07:40 AM', signOut:'Aug 28, 2020 04:45 PM', Department: 'Administration', sighInLoc: 'KMC-chennai', signOutLoc: 'KMC-chennai', eventType:'Print Remotely', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
    {signIn: 'Aug 25, 2020 05:56 PM', signOut:'Aug 25, 2020 06:59 PM', Department: 'Cath Lab', sighInLoc: 'Global-chennai', signOutLoc: 'Global-chennai', eventType:'Guest pass', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
    {signIn: 'Aug 29, 2020 01:02 AM', signOut:'Aug 29, 2020 04:45 PM', Department: 'Accounting', sighInLoc: 'Apollo-chennai', signOutLoc: 'Apollo-chennai', eventType:'Printed on site', signInBy: 'amala@mookambikainfo.com',poVisit:'Long Appt Test',guestPassReason:'Long Appt Test',badgePrinted:'true'},
    {signIn: 'Aug 28, 2020 07:40 AM', signOut:'Aug 28, 2020 04:45 PM', Department: 'Administration', sighInLoc: 'KMC-chennai', signOutLoc: 'KMC-chennai', eventType:'Print Remotely', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
    {signIn: 'Aug 25, 2020 05:56 PM', signOut:'Aug 25, 2020 06:59 PM', Department: 'Cath Lab', sighInLoc: 'Global-chennai', signOutLoc: 'Global-chennai', eventType:'Guest pass', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
    {signIn: 'Aug 29, 2020 01:02 AM', signOut:'Aug 29, 2020 04:45 PM', Department: 'Accounting', sighInLoc: 'Apollo-chennai', signOutLoc: 'Apollo-chennai', eventType:'Printed on site', signInBy: 'amala@mookambikainfo.com',poVisit:'Long Appt Test',guestPassReason:'Long Appt Test',badgePrinted:'true'},
    {signIn: 'Aug 28, 2020 07:40 AM', signOut:'Aug 28, 2020 04:45 PM', Department: 'Administration', sighInLoc: 'KMC-chennai', signOutLoc: 'KMC-chennai', eventType:'Print Remotely', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
    {signIn: 'Aug 25, 2020 05:56 PM', signOut:'Aug 25, 2020 06:59 PM', Department: 'Cath Lab', sighInLoc: 'Global-chennai', signOutLoc: 'Global-chennai', eventType:'Guest pass', signInBy: 'amala@mookambikainfo.com',poVisit:'Test',guestPassReason:'Test',badgePrinted:'false'},
  ];
  cars = [
    {value: 'Success', viewValue: 'Success'},
    {value: 'Warning', viewValue: 'Warning'},
    {value: 'Denied', viewValue: 'Denied'}
  ];
  dataSource = this.ELEMENTDATA;
  constructor(public dialogRef: MatDialogRef<ModalComponent>, @Inject(MAT_DIALOG_DATA) public dialogdata: DialogData) {
      console.log('dialogdata' + dialogdata);
   }

   onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
