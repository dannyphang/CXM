import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { ComponentsModule } from '../../core/shared/components/components.module';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';
import { CompanyComponent } from './company.component';
import { CompanyProfileComponent } from './profile/profile.component';


@NgModule({
  declarations: [
    CompanyComponent,
    CompanyProfileComponent
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    CompanyRoutingModule,
    ComponentsModule,
    MaterialModule,
    PrimeNgModule
  ]
})
export class CompanyModule { }
