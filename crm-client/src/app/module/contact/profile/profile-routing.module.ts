import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ContactAllPropertiesComponent } from './all-properties/all-properties.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: 'allProperties',
        pathMatch: 'full',
        redirectTo: 'allProperties',
      }
    ]
  },
  {
    path: 'allProperties',
    component: ContactAllPropertiesComponent,
    data: { breadcrumb: 'All Properties', title: 'All Properties' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
