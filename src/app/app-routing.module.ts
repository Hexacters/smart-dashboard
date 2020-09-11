import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
//import { AngularJSComponent } from './angular-js/angular-js.component';
// Match any URL that starts with `users`
export function isAngularJSUrl(url: UrlSegment[]) {
  console.log(url[0].path);
  return url.length > 0 && url[0].path.startsWith('users') ? ({consumed: url}) : null;
}

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
