import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingComponent } from './profile/setting/setting.component';

const routes: Routes = [
  {
    path: '',
    component: ContactComponent
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    data: { breadcrumb: 'Profile', title: 'Profile' },
    children: [
      {
        path: 'setting',
        component: SettingComponent,
        data: { breadcrumb: 'Setting', title: 'Setting' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
