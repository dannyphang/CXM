import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseInputComponent } from './input/input.component';
import { CommonSharedModule } from '../modules/common-shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../modules/material.module';
import { PrimeNgModule } from '../modules/primeng.module';
import { BaseLabelComponent } from './label/label.component';
import { FormArrayComponent } from './form/form-array.component';
import { FormArrayItemComponent } from './form/form-array-item.component';
import { FormItemComponent } from './form/form-item.component';
import { BaseFormComponent } from './form/form.component';
import { BaseButtonComponent } from './button/button.component';
import { BaseCheckboxComponent } from './checkbox/checkbox.component';
import { BaseDatepickerComponent } from './datepicker/datepicker.component';
import { BaseMultiselectComponent } from './multiselect/multiselect.component';
import { BaseRadioComponent } from './radio/radio.component';
import { BaseTextareaComponent } from './textarea/textarea.component';
import { BaseDropdownComponent } from './dropdown/dropdown.component';
import { ToggleThemeComponent } from './toggle-theme/toggle-theme.component';
import { ToastComponent } from './toast/toast.component';
import { OverlayPanelComponent } from './panel/overlay-panel/overlay-panel.component';
import { PanelComponent } from './panel/panel/panel.component';
import { AccordionPanelComponent } from './panel/accordion-panel/accordion-panel.component';
import { ChipComponent } from './chip/chip.component';
import { TerminalComponent } from './terminal/terminal.component';
import { TabMenuComponent } from './tab-menu/tab-menu.component';
import { SidePanelComponent } from './panel/side-panel/side-panel.component';
import { TagComponent } from './tag/tag.component';
import { ContactCompanyPageComponent } from './contact-company-page/contact-company-page.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AllPropertiesPageComponent } from './all-properties-page/all-properties-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { LeftPanelComponent } from './profile-page/left-panel/left-panel.component';
import { MiddlePanelComponent } from './profile-page/middle-panel/middle-panel.component';
import { RightPanelComponent } from './profile-page/right-panel/right-panel.component';
import { ActivityDialogComponent } from './activity-dialog/activity-dialog.component';
import { InputSwitchComponent } from './input-switch/input-switch.component';
import { ActivityBlockComponent } from './activity-block/activity-block.component';
import { EditorComponent } from './editor/editor.component';
import { AssociationBlockComponent } from './association-block/association-block.component';
import { OnlyNumberDirective } from '../directives/only-number.directive';
import { PasswordValidator } from '../directives/password.directive';
import { ActivityCreateDialogComponent } from './activity-create-dialog/activity-create-dialog.component';
import { EmailComponent } from './activity-create-dialog/components/email/email.component';
import { TabPanelPageComponent } from './contact-company-page/tab-panel-page/tab-panel-page.component';
import { AssociationComponent } from './profile-page/right-panel/association/association.component';
import { AttachmentComponent } from './profile-page/right-panel/attachment/attachment.component';
import { NoteComponent } from './activity-create-dialog/components/note/note.component';
import { PreviewDirective, PreviewListComponent } from '@eternalheart/ngx-file-preview';
import { AttachmentChipComponent } from "./attachment-chip/attachment-chip.component";
import { PreviewModalComponent } from '@eternalheart/ngx-file-preview/lib/components';

const components = [
  BaseInputComponent,
  BaseLabelComponent,
  FormItemComponent,
  BaseFormComponent,
  FormArrayComponent,
  FormArrayItemComponent,
  BaseButtonComponent,
  BaseCheckboxComponent,
  BaseDatepickerComponent,
  BaseDropdownComponent,
  BaseMultiselectComponent,
  BaseRadioComponent,
  BaseTextareaComponent,
  ToggleThemeComponent,
  ToastComponent,
  OverlayPanelComponent,
  PanelComponent,
  AccordionPanelComponent,
  ChipComponent,
  TerminalComponent,
  TabMenuComponent,
  SidePanelComponent,
  TagComponent,
  ContactCompanyPageComponent,
  BreadcrumbComponent,
  AllPropertiesPageComponent,
  ProfilePageComponent,
  LeftPanelComponent,
  MiddlePanelComponent,
  RightPanelComponent,
  ActivityDialogComponent,
  InputSwitchComponent,
  ActivityBlockComponent,
  EditorComponent,
  AssociationBlockComponent,
  ActivityCreateDialogComponent,
  EmailComponent,
  TabPanelPageComponent,
  AssociationComponent,
  AttachmentComponent,
  NoteComponent,
  AttachmentChipComponent
];

@NgModule({
  declarations: [
    components,
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    MaterialModule,
    PrimeNgModule,
    ReactiveFormsModule,
    TranslateModule,
    OnlyNumberDirective,
    PasswordValidator,
    PreviewListComponent,
    PreviewDirective,
  ],
  exports: [
    components
  ]
})
export class ComponentsModule { }
