import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingComponent } from './setting.component';
import { PropertyComponent } from './property/property.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  {
    path: "",
    component: SettingComponent
  },
  // {
  //   path: "profile",
  //   component: CreateComponent,
  //   data: { breadcrumb: 'Profile', title: 'Profile' }
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
