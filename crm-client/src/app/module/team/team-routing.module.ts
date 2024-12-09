import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamModuleComponent } from './team.component';

const routes: Routes = [
  {
    path: "",
    component: TeamModuleComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamRoutingModule { }
