import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactRoutingModule } from './contact-routing.module';
import { ComponentsModule } from '../../core/shared/components/components.module';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';
import { ContactComponent } from './contact.component';
import { ContactProfileComponent } from './profile/profile.component';


@NgModule({
  declarations: [
    ContactComponent,
    ContactProfileComponent
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    ContactRoutingModule,
    ComponentsModule,
    MaterialModule,
    PrimeNgModule
  ]
})
export class ContactModule { }
