import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamRoutingModule } from './team-routing.module';
import { ComponentsModule } from '../../core/shared/components/components.module';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';
import { TeamComponent } from './team.component';


@NgModule({
  declarations: [
    TeamComponent
  ],
  imports: [
    CommonModule,
    TeamRoutingModule,
    CommonModule,
    CommonSharedModule,
    MaterialModule,
    PrimeNgModule,
    ComponentsModule
  ]
})
export class TeamModule { }
