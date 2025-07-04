import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShortUrlComponent } from './short-url.component';

const routes: Routes = [
  {
    path: "",
    component: ShortUrlComponent
  },
  {
    path: ":id",
    component: ShortUrlComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShortUrlRoutingModule { }
