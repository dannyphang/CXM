import { Component, OnInit } from '@angular/core';
import { CONTROL_TYPE, FormConfig } from '../../core/services/components.service';
import { Observable, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonService } from '../../core/services/common.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  formConfig: FormConfig[] = []
  form2Config: FormConfig[] = []
  splitBtnList: any[] = [];
  showSidePanel: boolean = false;
  sidePanelPosition: 'left' | 'right' | 'top' | 'bottom' = 'right';
  formG: FormGroup = new FormGroup({
    one: new FormControl(''),
    two: new FormControl(''),
  });
  editorModel: string = 'testings';

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    this.initFormConfig();
  }

  initFormConfig() {
    this.formConfig = [
      {
        label: 'Name',
        type: CONTROL_TYPE.Textbox,
        fieldControl: this.formG.controls['one'],
        layoutDefine: {
          row: 0,
          column: 0,
        },
        autoFocus: true
      },
      {
        label: '22222',
        type: CONTROL_TYPE.Calendar,
        layoutDefine: {
          row: 1,
          column: 0,
        }
      },
      {
        label: '333333',
        type: CONTROL_TYPE.Checkbox,
        layoutDefine: {
          row: 1,
          column: 1,
        },
        dataSourceAction: (): Observable<any> => {
          return of([
            { label: 'Option 1', value: '4' },
            { label: 'Option 2', value: '5' },
            { label: 'Option 3', value: '6' },
          ]);
        }
      },
      {
        label: '444444',
        type: CONTROL_TYPE.Dropdown,
        layoutDefine: {
          row: 1,
          column: 2,
        },
        dataSourceAction: (): Observable<any> => {
          return of([
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' },
          ]);
        },
        searchable: true
      },
      {
        label: '5555555',
        type: CONTROL_TYPE.Multiselect,
        layoutDefine: {
          row: 2,
          column: 1,
          colSpan: 0
        },
        dataSourceAction: (): Observable<any> => {
          return of([
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' },
          ]);
        }
      },
      {
        label: '666666',
        type: CONTROL_TYPE.Radio,
        layoutDefine: {
          row: 2,
          column: 1,
          colSpan: 0
        },
        dataSourceAction: (): Observable<any> => {
          return of([
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' },
          ]);
        }
      },
      {
        label: '7777777',
        type: CONTROL_TYPE.Textarea,
        layoutDefine: {
          row: 2,
          column: 1,
          colSpan: 0
        },
        autoResize: true
      }
    ]

    this.form2Config = [
      {
        label: 'Name',
        type: CONTROL_TYPE.Textbox,
        layoutDefine: {
          row: 0,
          column: 0,
        }
      },
      {
        label: 'Textarea',
        type: CONTROL_TYPE.Textarea,
        layoutDefine: {
          row: 2,
          column: 0,
        }
      }
    ]

    this.splitBtnList = [
      {
        label: 'Update',
        command: () => {
          this.update();
        }
      },
      {
        label: 'Delete',
        command: () => {
          this.delete();
        }
      },
      { label: 'Angular Website', url: 'http://angular.io' },
      { separator: true },
      { label: 'Upload', routerLink: ['/fileupload'] }
    ]
  }

  update() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Updated' });
  }

  delete() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Deleted' });
  }

  show() {
    this.messageService.add({ severity: 'success', detail: 'Message Content', sticky: true, icon: 'pi pi-spin pi-spinner' });
    // console.log(this.formG.controls)
  }

  showSidePanelBtn(position: 'left' | 'right' | 'top' | 'bottom') {
    this.showSidePanel = true;
    this.sidePanelPosition = position;
    console.log('showSidePanel', this.showSidePanel)
  }

  getAllUser() {
    this.authService.getAllUser().subscribe(res => {
      console.log(res);
    })
  }
}
