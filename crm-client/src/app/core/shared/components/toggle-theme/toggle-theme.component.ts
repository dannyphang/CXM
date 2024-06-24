import { DOCUMENT } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { OverlayPanelComponent } from '../panel/overlay-panel/overlay-panel.component';

@Component({
  selector: 'app-toggle-theme',
  templateUrl: './toggle-theme.component.html',
  styleUrl: './toggle-theme.component.scss'
})
export class ToggleThemeComponent {
  @ViewChild(OverlayPanelComponent, { static: true }) child?: OverlayPanelComponent;
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
  ]

  constructor(
    private themeService: ThemeService,
  ) {

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
