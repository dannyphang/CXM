import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as Blobity from 'blobity';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {


  constructor(
    private translateService: TranslateService
  ) {
    this.translateService.use('en');
  }

  ngOnInit() {
    this.initBlobity(false)
  }

  initBlobity(isOn: boolean) {
    if (isOn) {
      const options = {
        color: "rgb(180, 180, 180)",
        zIndex: 1,
        dotColor: "rgb(50, 200, 200)",
        opacity: 0.2,
        size: 20,
        kineticMorphing: false
      };
      new Blobity.default(options);
    }
    else {

    }
  }

  blobityFunc(isOn: boolean) {
    this.initBlobity(isOn);
  }
}
