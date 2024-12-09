import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { Error404Component } from './layout/error-404/error-404.component';
import { LoginComponent } from './module/login/login.component';
import { CreateComponent } from './module/setting/create/create.component';
import { AuthGuard } from './core/shared/guard/auth.guard';
import { PermissionGuard } from './core/shared/guard/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./module/home/home.module').then(m => m.HomeModule),
        data: { breadcrumb: '', title: 'Home', module: 'HOME' }
      },
      {
        path: 'contact',
        loadChildren: () => import('./module/contact/contact.module').then(m => m.ContactModule),
        canActivate: [PermissionGuard],
        data: { breadcrumb: 'COMMON.CONTACT', title: 'COMMON.CONTACT', module: 'CONT', action: 'display' },
      },
      {
        path: 'company',
        loadChildren: () => import('./module/company/company.module').then(m => m.CompanyModule),
        canActivate: [PermissionGuard],
        data: { breadcrumb: 'COMMON.COMPANY', title: 'COMMON.COMPANY', module: 'COMP', action: 'display' }
      },
      {
        path: 'setting',
        loadChildren: () => import('./module/setting/setting.module').then(m => m.SettingModule),
        canActivate: [PermissionGuard],
        data: { breadcrumb: 'HEADER.SETTING', title: 'HEADER.SETTING', module: 'SETTING', action: 'display' }
      },
      {
        path: 'team',
        loadChildren: () => import('./module/team/team.module').then(m => m.TeamModule),
        canActivate: [PermissionGuard],
        data: { breadcrumb: 'HEADER.TEAM', title: 'HEADER.TEAM', module: 'TEAM', action: 'display' }
      },
    ]
  },
  {
    path: 'signin',
    loadChildren: () => import('./module/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'signup',
    loadChildren: () => import('./module/login/login.module').then(m => m.LoginModule),
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
