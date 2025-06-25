import { Component, HostListener, OnChanges, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { MenuItem, MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, map, Observable, of } from 'rxjs';
import { AuthService, CreateUserDto, UpdateUserDto } from '../../../services/auth.service';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, UserCommonDto, WindowSizeDto } from '../../../services/common.service';
import { BaseDataSourceActionEvent, CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../../services/components.service';
import { ROW_PER_PAGE_DEFAULT, ROW_PER_PAGE_DEFAULT_LIST, EMPTY_VALUE_STRING, NUMBER_OF_EXCEL_INSERT_ROW, DOWNLOAD_IMPORT_PROFILE_TEMPLATE_FILE_NAME_XLSX, MAX_PANEL_LIST } from '../../constants/common.constants';
import * as XLSX from 'xlsx';
import { BaseCoreAbstract } from '../../base/base-core.abstract';
import { ToastService } from '../../../services/toast.service';
import { CoreHttpService } from '../../../services/core-http.service';
import { Table } from 'primeng/table';
import { TableDataFilterDto, TableColumnFilterDto, SettingDto, TableFilterDto, CoreAuthService } from '../../../services/core-auth.service';

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
  MAX_PANEL_LIST = MAX_PANEL_LIST;
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
  closeDialogVisible: boolean = false;
  selectedPanel: number = -1;

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
    private coreService: CoreHttpService,
    private coreAuthService: CoreAuthService,
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
      this.canDownload = this.authService.returnPermission(this.coreAuthService.userC.permission).find(p => p.module === this.module)?.permission.download ?? false;
      this.canExport = this.authService.returnPermission(this.coreAuthService.userC.permission).find(p => p.module === this.module)?.permission.export ?? false;
      this.canDelete = this.authService.returnPermission(this.coreAuthService.userC.permission).find(p => p.module === this.module)?.permission.remove ?? false;
      this.canCreate = this.authService.returnPermission(this.coreAuthService.userC.permission).find(p => p.module === this.module)?.permission.create ?? false;

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
    if (this.coreAuthService.userC.setting.tableFilter) {
      this.coreAuthService.userC.setting.tableFilter[this.module === 'CONT' ? 'contact' : 'company']?.propertyFilter?.forEach((item: TableDataFilterDto) => {
        if (this.panelList.find(p => p.panelUid === item.tabUid) === undefined) {
          this.panelList.push({
            headerLabel: item.tabLabel,
            closable: true,
            panelUid: item.tabUid,
            edit: false,
            loading: []
          });
          this.addTabLabelFormArray(item.tabUid);
        }
      });
    }

    if (this.panelList[0]) {
      this.activeTabPanel = this.panelList[0].panelUid;
    }
    else {
      this.addTab();
    }

    this.getProperties();
  }

  returnTabPanelByTabUid(panel: Panel): TableDataFilterDto[] {
    return this.coreAuthService.userC.setting.tableFilter[this.module === 'CONT' ? 'contact' : 'company'].propertyFilter.filter(p => p.tabUid === panel.panelUid);
  }

  returnColumnFilterByTabUid(panel: Panel): TableColumnFilterDto {
    return this.coreAuthService.userC.setting.tableFilter[this.module === 'CONT' ? 'contact' : 'company'].columnFilter.find(p => p.tabUid === panel.panelUid);
  }

  addTab() {
    let isBlock = false;
    this.tableLoading.forEach(item => {
      if (item) {
        isBlock = true;
      }
    });

    if (!isBlock && this.panelList.length < 5) {
      let newPanelUid: string = this.commonService.generateGUID(10);
      let date = `${String(new Date().getHours()).padStart(2, '0')}_${String(new Date().getMinutes()).padStart(2, '0')}_${String(new Date().getSeconds()).padStart(2, '0')}`;
      this.panelList.push({
        headerLabel: "Tab_" + date,
        closable: true,
        panelUid: newPanelUid,
        edit: false,
        loading: []
      });

      this.activeTabPanel = newPanelUid;
      let newFilterList: TableDataFilterDto[] = [
        {
          tabLabel: this.panelList.find(p => p.panelUid === newPanelUid)!.headerLabel,
          tabUid: newPanelUid,
        }
      ];

      this.updateUserfilterSetting(newFilterList);
      this.addTabLabelFormArray(newPanelUid);
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

  get getTabLabelArr(): FormArray {
    return this.tabLabelArr as FormArray;
  }

  addTabLabelFormArray(newPanelUid: string) {
    let newForm = this.formBuilder.group({
      index: new FormControl(newPanelUid),
      tabLabel: new FormControl(this.panelList.find(p => p.panelUid === newPanelUid)?.headerLabel)
    });
    this.getTabLabelArr.push(newForm);
  }

  returnTranslate(text: string): string {
    return this.commonService.translate(text);
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
    this.panelList.forEach(p => {
      p.loading.push("property");
    })
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
        this.panelList.forEach(p => {
          p.loading = p.loading.filter(pl => pl !== "property");
        })
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

  tabViewOnClose() {
    if (this.authService.returnPermissionObj(this.module, 'update')) {
      this.updateUserfilterSetting([], true, this.panelList[this.selectedPanel].panelUid);
      this.updateUserColumnSetting(null, true, this.panelList[this.selectedPanel].panelUid);
      this.panelList = this.panelList.filter((p, index) => index !== this.selectedPanel);
      this.activeTabPanel = this.panelList[0].panelUid;
      this.closeDialogVisible = false;
    }
    else {
      // TODO
    }
  }

  showCloseConfirmDialog(event: any) {
    this.closeDialogVisible = true;
    this.selectedPanel = event.index;
  }

  updateUserSetting(setting: SettingDto) {
    if (this.authService.returnPermissionObj(this.module, 'update')) {
      let updateUser: UpdateUserDto = {
        uid: this.coreAuthService.userC.uid,
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
    else {
      // TODO
    }
  }

  updateUserfilterSetting(filterList: TableDataFilterDto[], isRemove: boolean = false, removeTabUid: string = '') {
    // this.panel.edit = false;
    let setting = this.coreAuthService.userC.setting;
    if (!this.coreAuthService.userC.setting.tableFilter) {
      setting.tableFilter = {
        contact: new TableFilterDto(),
        company: new TableFilterDto(),
      }
    }
    if (!this.coreAuthService.userC.setting.tableFilter[this.module === "CONT" ? "contact" : "company"]?.propertyFilter) {
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

    this.updateUserSetting(setting);
  }

  updateUserFilterRemoveSetting(panel: Panel) {
    let setting = this.coreAuthService.userC.setting;
    setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter = setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter.filter((item) => item.tabUid !== panel.panelUid);
    setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter.push({
      tabUid: panel.panelUid,
      tabLabel: panel.headerLabel
    });

    this.updateUserSetting(setting);
  }

  updateUserColumnSetting(filterList: TableColumnFilterDto, isRemove: boolean = false, removeTabUid: string = '') {
    let setting = this.coreAuthService.userC.setting;
    if (!this.coreAuthService.userC.setting.tableFilter || !this.coreAuthService.userC.setting.tableFilter[this.module === "CONT" ? "contact" : "company"]?.propertyFilter) {
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

    let updateUser: UpdateUserDto = {
      uid: this.coreAuthService.userC.uid,
      setting: setting
    };

    if (this.authService.returnPermissionObj(this.module, 'create')) {
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
    else {
      // TODO
    }
  }

  updateUserPanelSetting(panel: Panel) {
    this.panelList.find(p => p.panelUid === panel.panelUid).edit = false;
    this.panelList.find(p => p.panelUid === panel.panelUid).headerLabel = (this.getTabLabelArr.controls.find((item: any) => item.value.index === panel.panelUid)?.get('tabLabel') as FormControl).value;

    let setting = this.coreAuthService.userC.setting;
    setting.tableFilter[this.module === "CONT" ? "contact" : "company"].propertyFilter.forEach(pf => {
      if (pf.tabUid === panel.panelUid) {
        pf.tabLabel = this.panelList.find(p => p.panelUid === panel.panelUid).headerLabel;
      }
    });

    this.updateUserSetting(setting);
  }

  returnActiveIndexPanel(): number {
    return this.panelList.findIndex(p => p.panelUid === this.activeTabPanel);
  }

  editPanel(uid: string) {
    if (uid === this.activeTabPanel && this.authService.returnPermissionObj(this.module, 'update')) {
      this.panelList.find(p => p.panelUid === uid)!.edit = true;
    }
    else {
      // TODO
    }
  }

  getIsPanelLoading(): boolean {
    let isLoading = false;
    this.panelList.forEach(p => {
      p.loading.forEach(pl => {
        if (pl.length > 0) {
          isLoading = true;
        }
      })
    })
    return isLoading;
  }

  updatePanelLoading(panel: Panel) {
    this.panelList.find(p => p.panelUid === panel.panelUid).loading = panel.loading;
  }

  returnTabLabelFormControl(panel: Panel): FormControl {
    return this.getTabLabelArr.controls.find((item: any) => item.value.index === panel.panelUid)?.get('tabLabel') as FormControl;
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

export class FilterDto {
  property: PropertiesDto;
  filter: any | any[];
  condition: string;
}

export class Panel {
  headerLabel: string;
  closable: boolean;
  panelUid: string;
  edit: boolean;
  loading: string[];
}