import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyProfileComponent } from './profile.component';
import { CompanyAllPropertiesComponent } from './all-properties/all-properties.component';

const routes: Routes = [
  {
    path: '',
    component: CompanyProfileComponent,
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
    component: CompanyAllPropertiesComponent,
    data: { breadcrumb: 'All Properties', title: 'All Properties' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
