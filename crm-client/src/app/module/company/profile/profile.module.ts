import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ComponentsModule } from '../../../core/shared/components/components.module';
import { CommonSharedModule } from '../../../core/shared/modules/common-shared.module';
import { MaterialModule } from '../../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../../core/shared/modules/primeng.module';
import { CompanyAllPropertiesComponent } from './all-properties/all-properties.component';


@NgModule({
  declarations: [
    CompanyAllPropertiesComponent
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
