import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import {MatSidenavModule} from '@angular/material/sidenav';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule, MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table'
    import { from } from 'rxjs';


@NgModule({
    imports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatSidenavModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatTableModule,
    ],
    exports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTooltipModule,
        MatButtonModule,
        MatFormFieldModule,
        MatRippleModule,
        MatTooltipModule,
        MatSidenavModule,
        MatOptionModule,
        MatSelectModule,
        NgxSkeletonLoaderModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatToolbarModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatProgressBarModule,
        MatInputModule,
        MatSnackBarModule,
        FlexLayoutModule,
        MatIconModule,
        MatDialogModule,
        MatTableModule,
    ]
})
export class SharedModule { }
