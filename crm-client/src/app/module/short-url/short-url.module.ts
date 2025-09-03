import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShortUrlRoutingModule } from './short-url-routing.module';
import { ShortUrlComponent } from './short-url.component';
import { ComponentsModule } from '../../core/shared/components/components.module';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    ShortUrlComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    ShortUrlRoutingModule,
    CommonSharedModule,
    MaterialModule,
    PrimeNgModule,
    ComponentsModule
  ]
})
export class ShortUrlModule { }
