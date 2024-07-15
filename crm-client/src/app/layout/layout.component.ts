import { Component, OnInit } from '@angular/core';
import Blobity from 'blobity';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  constructor() { }

  ngOnInit() {
    const options = {
      color: "rgb(180, 180, 180)",
      zIndex: 1,
      dotColor: "rgb(50, 200, 200)",
      opacity: 0.2,
      size: 20,
      kineticMorphing: false
    };
    new Blobity(options);
  }


}
