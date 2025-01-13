import { Component, HostListener, OnChanges, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { MenuItem, MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, map, Observable, of } from 'rxjs';
import { AuthService, CreateUserDto } from '../../../services/auth.service';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, UserCommonDto, WindowSizeDto } from '../../../services/common.service';
import { BaseDataSourceActionEvent, CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../services/components.service';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST, EMPTY_VALUE_STRING, NUMBER_OF_EXCEL_INSERT_ROW, DOWNLOAD_IMPORT_PROFILE_TEMPLATE_FILE_NAME_XLSX } from '../../constants/common.constants';
import * as XLSX from 'xlsx';
import { BaseCoreAbstract } from '../../base/base-core.abstract';
import { ToastService } from '../../../services/toast.service';
import { CoreHttpService, SettingDto, TableColumnFilterDto, TableDataFilterDto, TableFilterDto, UserDto } from '../../../services/core-http.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-contact-company-page',
  templateUrl: './contact-company-page.component.html',
  styleUrl: './contact-company-page.component.scss'
})
export class ContactCompanyPageComponent implements OnChanges {
  //#region variable
  @ViewChild('dt') pageTable?: Table;
  @ViewChild('uploader') uploader?: HTMLInputElement;
  ROW_PER_PAGE_DEFAULT = ROW_PER_PAGE_DEFAULT;
  ROW_PER_PAGE_DEFAULT_LIST = ROW_PER_PAGE_DEFAULT_LIST;
  EMPTY_VALUE_STRING = EMPTY_VALUE_STRING;
  NUMBER_OF_EXCEL_INSERT_ROW = NUMBER_OF_EXCEL_INSERT_ROW;
  DOWNLOAD_IMPORT_PROFILE_TEMPLATE_FILE_NAME_XLSX = DOWNLOAD_IMPORT_PROFILE_TEMPLATE_FILE_NAME_XLSX;
  module: 'CONT' | 'COMP' = 'CONT';
  contactList: ContactDto[][] = [];
  companyList: CompanyDto[][] = [];
  modulePropertyList: PropertyGroupDto[] = [];

  windowSize: WindowSizeDto = new WindowSizeDto();
  CONTROL_TYPE_CODE = CONTROL_TYPE_CODE;
  propertiesList: PropertiesDto[] = [];
  propertiesList2: PropertiesDto[] = [];
  activeTabPanel: string = '';
  tableLoading: boolean[] = [];
  panelList: Panel[] = [];
  countryOptionList: OptionsModel[] = [];
  tabLabelArr: FormArray = this.formBuilder.array([]);

  canDownload: boolean = false;
  canExport: boolean = false;
  canDelete: boolean = false;
  canCreate: boolean = false;
  //#endregion

  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private authService: AuthService,
    private toastService: ToastService,
    private coreService: CoreHttpService
  ) {
    if (this.router.url === '/contact') {
      this.module = 'CONT';
    }
    else {
      this.module = 'COMP';
    }
    this.windowSize = this.commonService.windowSize;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.commonService.updateWindowSize();
    this.windowSize = this.commonService.windowSize;
  }

  async ngOnInit() {
    this.commonService.getAllCountry().subscribe(res => {
      if (res.isSuccess) {
        this.countryOptionList = res.data.map(c => {
          return {
            label: c.name,
            value: c.uid
          }
        });
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });

    // assign active tab panel from userC
    this.getPanelListFromSetting();

    Promise.all([]).then(_ => {
      this.canDownload = this.authService.returnPermission(this.coreService.userC.permission).find(p => p.module === this.module)?.permission.download ?? false;
      this.canExport = this.authService.returnPermission(this.coreService.userC.permission).find(p => p.module === this.module)?.permission.export ?? false;
      this.canDelete = this.authService.returnPermission(this.coreService.userC.permission).find(p => p.module === this.module)?.permission.remove ?? false;
      this.canCreate = this.authService.returnPermission(this.coreService.userC.permission).find(p => p.module === this.module)?.permission.create ?? false;

      // this.getTabLabelArr.valueChanges.subscribe((value: any) => {
      //   this.getTabLabelArr.controls.find((item: any) => item.value.index === this.activeTabPanel).valueChanges.subscribe((value: any) => {
      //     this.getTabLabelArr.controls.find((item: any) => item.value.index === this.activeTabPanel).setValue(value, { emitEvent: false });
      //     this.panelList.find(p => p.panelUid === this.activeTabPanel)!.headerLabel = value.tabLabel;
      //   });
      // });

    });
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  getPanelListFromSetting() {
    if (this.coreService.userC.setting.tableFilter) {
      this.coreService.userC.setting.tableFilter[this.module === 'CONT' ? 'contact' : 'company']?.propertyFilter.forEach((item: TableDataFilterDto) => {
        if (this.panelList.find(p => p.panelUid === item.tabUid) === undefined) {
          this.panelList.push({
            headerLabel: item.tabLabel,
            closable: true,
            panelUid: item.tabUid,
            edit: false
          });
        }
      });
    }

    if (this.panelList[0]) {
      this.activeTabPanel = this.panelList[0].panelUid;
    }
    else {
      this.addTab(true);
    }

    this.getProperties();
    console.log(this.panelList)
  }

  returnTabPanelByTabUid(panel: Panel): TableDataFilterDto[] {
    return this.coreService.userC.setting.tableFilter[this.module === 'CONT' ? 'contact' : 'company'].propertyFilter.filter(p => p.tabUid === panel.panelUid);
  }

  returnColumnFilterByTabUid(panel: Panel): TableColumnFilterDto {
    return this.coreService.userC.setting.tableFilter[this.module === 'CONT' ? 'contact' : 'company'].columnFilter.find(p => p.tabUid === panel.panelUid);
  }

  addTab(isNewTab: boolean = true) {
    let isBlock = false;
    this.tableLoading.forEach(item => {
      if (item) {
        isBlock = true;
      }
    });

    if (!isBlock && this.panelList.length < 5) {
      let newPanelUid: string = this.commonService.generateGUID(10);
      this.panelList.push({
        headerLabel: 'TEST__' + newPanelUid,
        closable: true,
        panelUid: newPanelUid,
        edit: false
      });

      this.activeTabPanel = newPanelUid;
      let newFilterList: TableDataFilterDto[] = [
        {
          tabLabel: this.panelList.find(p => p.panelUid === newPanelUid)!.headerLabel,
          tabUid: newPanelUid,
        }
      ]
      console.log(this.panelList)
      this.updateUserfilterSetting(newFilterList);
    }
    else {
      // TODO
      // this.messageService.add({
      //   severity: 'info',
      //   summary: this.translateService.instant('COMMON.DATA_LOADING'),
      //   detail: this.translateService.instant('COMMON.DATA_LOADING')
      // });
    }
  }

  getProperties() {
    this.toastService.addSingle({
      message: 'COMMON.LOADING',
      severity: 'info',
      messageData: [
        {
          key: 'module',
          value: 'COMMON.PROPERTY'
        }
      ],
      isLoading: true
    });
    this.commonService.getAllPropertiesByModule(this.module).subscribe(res => {
      if (res.isSuccess) {
        this.modulePropertyList = res.data;
        res.data.forEach((item) => {
          item.propertiesList?.forEach((prop) => {
            this.propertiesList.push(prop);
            this.propertiesList2.push(prop);
          });
        });

        this.toastService.clear();
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  tabViewOnChange(event: any) {
    this.activeTabPanel = this.panelList[event.index].panelUid;
  }

  tabViewOnClose(event: any) {
    this.updateUserfilterSetting([], true, this.panelList[event.index].panelUid);
    this.panelList = this.panelList.filter((p, index) => index !== event.index);
    this.activeTabPanel = this.panelList[0].panelUid;
  }

  updateUserfilterSetting(filterList: TableDataFilterDto[], isRemove: boolean = false, removeTabUid: string = '') {
    // this.panel.edit = false;
    let setting = this.coreService.userC.setting;
    if (!this.coreService.userC.setting.tableFilter || !this.coreService.userC.setting.tableFilter[this.module === "CONT" ? "contact" : "company"]?.propertyFilter) {
      setting.tableFilter = {
        contact: new TableFilterDto(),
        company: new TableFilterDto(),
      };
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter = [];
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].columnFilter = [];
    }

    // remove the current list in the setting then add the new list
    if (!isRemove) {
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter = setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter.filter((item) => item.tabUid !== filterList[0]?.tabUid);
      filterList.forEach((item) => {
        setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter.push(item);
      });
    }
    else {
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter = setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter.filter((item) => item.tabUid !== removeTabUid)
    }

    let updateUser: CreateUserDto = {
      uid: this.coreService.userC.uid,
      setting: setting
    };
    this.authService.updateUserFirestore([updateUser]).subscribe(res => {
      if (res.isSuccess) {
        this.toastService.addSingle({
          message: res.responseMessage
        });
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  updateUserColumnSetting(filterList: TableColumnFilterDto, isRemove: boolean = false, removeTabUid: string = '') {
    let setting = this.coreService.userC.setting;
    if (!this.coreService.userC.setting.tableFilter || !this.coreService.userC.setting.tableFilter[this.module === "CONT" ? "contact" : "company"]?.propertyFilter) {
      setting.tableFilter = {
        contact: new TableFilterDto(),
        company: new TableFilterDto(),
      };
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter = [];
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].columnFilter = [];
    }

    // remove the current list in the setting then add the new list
    if (!isRemove) {
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].columnFilter = setting.tableFilter[this.module === "CONT" ? "contact" : "company"].columnFilter.filter((item) => item.tabUid !== filterList?.tabUid);

      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].columnFilter.push(filterList);
    }
    else {
      setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter = setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter.filter((item) => item.tabUid !== removeTabUid)
    }

    let updateUser: CreateUserDto = {
      uid: this.coreService.userC.uid,
      setting: setting
    };

    this.authService.updateUserFirestore([updateUser]).subscribe(res => {
      if (res.isSuccess) {
        this.toastService.addSingle({
          message: res.responseMessage
        });
      }
      else {
        this.toastService.addSingle({
          message: res.responseMessage,
          severity: 'error'
        });
      }
    });
  }

  returnActiveIndexPanel(): number {
    return this.panelList.findIndex(p => p.panelUid === this.activeTabPanel);
  }

  editPanel(uid: string) {
    if (uid === this.activeTabPanel) {
      this.panelList.find(p => p.panelUid === uid)!.edit = true;
    }
  }
}

export class Filter {
  property: PropertiesDto;
  condition: OptionsModel[];
  options: ((event?: BaseDataSourceActionEvent) => Observable<any>);
  filterFieldControl: FormControl;
  conditionFieldControl: FormControl;
  mode: any;
}

export class Panel {
  headerLabel: string;
  closable: boolean;
  panelUid: string;
  edit: boolean;
}