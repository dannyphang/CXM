import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ContactSettingComponent } from './setting/setting.component';
import { PrimeNgModule } from '../../../core/shared/modules/primeng.module';
import { MaterialModule } from '../../../core/shared/modules/material.module';
import { ComponentsModule } from '../../../core/shared/components/components.module';
import { CommonSharedModule } from '../../../core/shared/modules/common-shared.module';
import { ProfileComponent } from './profile.component';


@NgModule({
  declarations: [
    ContactSettingComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    MaterialModule,
    PrimeNgModule,
    ComponentsModule,
    CommonSharedModule,
  ]
})
export class ProfileModule { }
