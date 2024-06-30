import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ContactSettingComponent } from './setting/setting.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: 'setting',
        pathMatch: 'full',
        redirectTo: 'setting',
      }
    ]
  },
  {
    path: 'setting',
    component: ContactSettingComponent,
    data: { breadcrumb: 'Setting', title: 'Setting' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
