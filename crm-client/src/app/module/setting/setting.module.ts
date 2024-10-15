import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { PropertyComponent } from './property/property.component';
import { SettingComponent } from './setting.component';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';
import { ComponentsModule } from "../../core/shared/components/components.module";
import { GeneralComponent } from './general/general.component';


@NgModule({
  declarations: [
    SettingComponent,
    PropertyComponent,
    GeneralComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    CommonModule,
    CommonSharedModule,
    MaterialModule,
    PrimeNgModule,
    ComponentsModule
  ]
})
export class SettingModule { }
