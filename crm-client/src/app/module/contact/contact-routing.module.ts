import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact.component';
import { ProfileComponent } from './profile/profile.component';
import { ContactSettingComponent } from './profile/setting/setting.component';

const routes: Routes = [
  {
    path: '',
    component: ContactComponent,
    children: [
      {
        path: 'profile/:id',
        pathMatch: 'full',
        redirectTo: 'profile',
      }
    ]
  },
  {
    path: 'profile/:id',
    data: { breadcrumb: 'Profile', title: 'Profile' },
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
