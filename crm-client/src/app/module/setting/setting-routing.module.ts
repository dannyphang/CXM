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
  {
    path: "create",
    component: CreateComponent,
    data: { breadcrumb: 'Create Profile', title: 'Create Profile' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
