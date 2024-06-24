import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { ComponentsModule } from '../../core/shared/components/components.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';


@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    HomeRoutingModule,
    ComponentsModule,
    MaterialModule,
    PrimeNgModule
  ],
})
export class HomeModule { }
