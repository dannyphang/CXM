import { NgModule } from "@angular/core";
import { imports } from "./app-imports.module";
import { providers } from "./app-provides.module";
import { AppComponent } from "./app.component";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports,
  providers,
  bootstrap: [AppComponent],
})
export class AppModule { }
