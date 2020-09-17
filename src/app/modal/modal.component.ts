import { Component, OnInit,Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

interface DialogData {
  Properties:any;
  selectedSeries;
  selectedCategories;
  VisitedDate;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit {
  displayedColumns: string[] = ['Rep Information', 'Department', 'Sign-In Location', 'Sign-In By'];
  selectedCar;
   ELEMENTDATA = [
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Accounting', sighInLoc: 'Avon', signInBy: 'amala@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'EP Lab', sighInLoc: 'Avon', signInBy: 'ravi@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Administration', sighInLoc: 'Avon', signInBy: 'subburaj@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Administration', sighInLoc: 'Avon', signInBy: 'saravanan@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Administration', sighInLoc: 'Avon', signInBy: 'pandi@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'EP Lab', sighInLoc: 'Avon', signInBy: 'vasanth@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Accounting', sighInLoc: 'Avon', signInBy: 'venkat@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Accounting', sighInLoc: 'Avon', signInBy: 'poormnima@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Administration', sighInLoc: 'Avon', signInBy: 'venkat@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'EP Lab', sighInLoc: 'Avon', signInBy: 'ravi@mookambikainfo.com'},
    {'RepInformation': 'AmalaPandian@mookambikainfo.com 80822', Department: 'Administration', sighInLoc: 'Avon', signInBy: 'ravi@mookambikainfo.com'},
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
