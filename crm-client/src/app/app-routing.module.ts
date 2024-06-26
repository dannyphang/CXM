import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { SettingComponent } from './module/contact/profile/setting/setting.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./module/home/home.module').then(m => m.HomeModule),
        data: { breadcrumb: 'Home', title: 'Home' }
      },
      {
        path: 'contact',
        loadChildren: () => import('./module/contact/contact.module').then(m => m.ContactModule),
        data: { breadcrumb: 'Contact', title: 'Contact' },

      },
      {
        path: 'company',
        loadChildren: () => import('./module/company/company.module').then(m => m.CompanyModule),
        data: { breadcrumb: 'Company', title: 'Company' }
      },
    ]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
