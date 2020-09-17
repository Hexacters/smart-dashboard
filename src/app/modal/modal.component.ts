import { Component, OnInit,Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

interface DialogData {
  Properties:any;
  selectedSeries;
  selectedCategories;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
 
   ELEMENTDATA = [
    {STATUS:  'Rejected', HOW: 'RC-templete_certificate', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Rejected', HOW: 'Secretary_of_State_Filing', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Expired', HOW: 'Secretary_of_State_Filing', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Rejected', HOW: 'Edit_Doc_temp', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Expired', HOW: 'RC-templete_certificate', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Rejected', HOW: 'Secretary_of_State_Filing', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Expired', HOW: 'RC-templete_certificate', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Expired', HOW: 'RC-templete_certificate', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Expired', HOW: 'Edit_Doc_temp', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Rejected', HOW: 'RC-templete_certificate', WHAT: 'how', WHERE: 'View Accounts'},
    {STATUS: 'Expired', HOW: 'Edit_Doc_temp', WHAT: 'how', WHERE: 'View Accounts'},
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
