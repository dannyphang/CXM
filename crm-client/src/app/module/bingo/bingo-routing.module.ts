import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BingoComponent } from './bingo.component';
import { BingoListComponent } from './bingo-list/bingo-list.component';

const routes: Routes = [
  {
    path: '',
    component: BingoComponent
  },
  {
    path: 'list',
    component: BingoListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BingoRoutingModule { }
