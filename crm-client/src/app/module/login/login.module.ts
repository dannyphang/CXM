import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { ComponentsModule } from '../../core/shared/components/components.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';
import { LoginComponent } from './login.component';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    CommonSharedModule,
    ComponentsModule,
    MaterialModule,
    PrimeNgModule,
  ]
})
export class LoginModule { }
