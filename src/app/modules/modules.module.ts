import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
      path: 'home',
      loadChildren: () =>
          import('./home/home.module').then(
              (m) => m.HomeModule
          ),
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class ModulesModule { }
