import { NgModule } from '@angular/core';
import { imports } from './app-imports.module';
import { providers } from './app-provides.module';
import { AppComponent } from './app.component';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ...imports, // Spread imports array here
  ],
  providers: [
    ...providers, // Spread the providers array here
    MessageService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
