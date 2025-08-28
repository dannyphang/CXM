import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BingoRoutingModule } from './bingo-routing.module';
import { BingoComponent } from './bingo.component';
import { ComponentsModule } from '../../core/shared/components/components.module';
import { CommonSharedModule } from '../../core/shared/modules/common-shared.module';
import { MaterialModule } from '../../core/shared/modules/material.module';
import { PrimeNgModule } from '../../core/shared/modules/primeng.module';
import { BingoListComponent } from './bingo-list/bingo-list.component';


@NgModule({
  declarations: [
    BingoComponent,
    BingoListComponent,
  ],
  imports: [
    CommonModule,
    BingoRoutingModule,
    CommonSharedModule,
    ComponentsModule,
    MaterialModule,
    PrimeNgModule
  ]
})
export class BingoModule { }
