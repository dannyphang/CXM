import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { Error404Component } from './layout/error-404/error-404.component';
import { PermissionGuard } from './core/shared/guard/permission.guard';
import { AuthGuard } from './core/shared/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./module/home/home.module').then(m => m.HomeModule),
        data: { breadcrumb: '', title: 'Home' }
      },
      {
        path: 'contact',
        loadChildren: () => import('./module/contact/contact.module').then(m => m.ContactModule),
        canActivate: [AuthGuard, PermissionGuard],
        data: {
          breadcrumb: 'Contact',
          title: 'Contact',
          action: 'display',
          module: 'CONT'
        },
      },
      {
        path: 'company',
        loadChildren: () => import('./module/company/company.module').then(m => m.CompanyModule),
        canActivate: [AuthGuard, PermissionGuard],
        data: {
          breadcrumb: 'Company',
          title: 'Company',
          action: 'display',
          module: 'COMP'
        }
      },
      {
        path: 'setting',
        loadChildren: () => import('./module/setting/setting.module').then(m => m.SettingModule),
        canActivate: [AuthGuard, PermissionGuard],
        data: {
          breadcrumb: 'Setting', title: 'Setting',
          action: 'display',
          module: 'SETTING'
        }
      }
    ]
  },
  {
    path: 'signin',
    loadChildren: () => import('./module/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'callback',
    loadChildren: () => import('./module/callback/callback.module').then(m => m.CallbackModule),
  },
  {
    path: 'pagenotfound',
    component: Error404Component
  },
  {
    path: '**',
    redirectTo: '/pagenotfound',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
