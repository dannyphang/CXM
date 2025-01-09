import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { OverlayPanelComponent } from '../panel/overlay-panel/overlay-panel.component';
import Blobity from 'blobity';
import { FormControl } from '@angular/forms';
import { UserDto } from '../../../services/core-http.service';

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
  blobityFormControl: FormControl = new FormControl(true);

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


  ngOnInit() {
    this.blobityFormControl.valueChanges.subscribe(val => {
      this.isBlobityOn = val;
      // this.blobityFormControl.setValue(this.isBlobityOn, { emitEvent: false });
      this.blobityClick.emit(this.isBlobityOn);
    })
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
}
