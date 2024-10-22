import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyComponent } from './company.component';

const routes: Routes = [
  {
    path: '',
    component: CompanyComponent,
    children: [
      {
        path: ':id',
        pathMatch: 'full',
        redirectTo: 'profile',
      }
    ]
  },
  {
    path: ':id',
    data: { breadcrumb: 'Profile', title: 'Profile' },
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
