import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { OverlayPanelComponent } from '../panel/overlay-panel/overlay-panel.component';
import Blobity from 'blobity';
import { UserDto } from '../../services/auth.service';

@Component({
  selector: 'app-toggle-theme',
  templateUrl: './toggle-theme.component.html',
  styleUrl: './toggle-theme.component.scss'
})
export class ToggleThemeComponent implements OnChanges {
  @Input() user: UserDto;
  @Output() blobityClick: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild(OverlayPanelComponent, { static: true }) child?: OverlayPanelComponent;

  darkThemeFile: string = "aura-dark-blue.css";
  lightThemeFile: string = "aura-light-blue.css";
  themeList = [
    {
      name: "Aura Light Blue",
      file: "aura-light-blue.css",
      icon: "pi pi-check",
    },
    {
      name: "Aura Dark Blue",
      file: "aura-dark-blue.css",
      icon: "",
    },
    {
      name: "Saga Blue",
      file: "saga-blue.css",
      icon: "",
    },
    {
      name: "Arya Blue",
      file: "arya-blue.css",
      icon: "",
    },
    {
      name: "Vela Blue",
      file: "vela-blue.css",
      icon: "",
    }
  ];
  isBlobityOn: boolean = true;
  userTheme: boolean = false;

  constructor(
    private themeService: ThemeService,
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].currentValue) {
      if (this.user.setting.darkMode) {
        this.changeTheme(this.darkThemeFile);
      }
      else {
        this.changeTheme(this.lightThemeFile);
      }
    }
  }

  updateTheme() {

  }

  togglePanel() {
    this.child?.togglePanel();
  }

  changeTheme(file: string) {
    this.themeService.switchTheme(file);
    this.themeList.forEach((theme) => {
      theme.file === file ? theme.icon = "pi pi-check" : theme.icon = "";
    });
  }

  inputSwitchUpdate() {
    this.isBlobityOn = !this.isBlobityOn;
    // let blobity = new Blobity();
    // if (!this.isBlobityOn) {
    //   blobity.updateOptions({ size: 0, dotSize: 0 })
    // }
    // else {
    //   const options = {
    //     color: "rgb(180, 180, 180)",
    //     zIndex: 1,
    //     dotColor: "rgb(50, 200, 200)",
    //     opacity: 0.2,
    //     size: 20,
    //     kineticMorphing: false
    //   };
    //   blobity.updateOptions(options);
    // }
    this.blobityClick.emit(this.isBlobityOn);
  }
}
