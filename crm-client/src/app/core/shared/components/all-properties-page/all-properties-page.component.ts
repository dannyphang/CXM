import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService, CompanyDto, ContactDto, PropertiesDto, PropertyDataDto, PropertyGroupDto, PropertyLookupDto, StateDto, UpdateCompanyDto, UpdateContactDto, UserDto } from '../../services/common.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CONTROL_TYPE, CONTROL_TYPE_CODE, FormConfig, OptionsModel } from '../../services/components.service';
import { debounceTime, distinctUntilChanged, map, Observable, ObservableLike, of } from 'rxjs';
import { BasePropertyAbstract } from '../../base/base-property.abstract';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-all-properties-page',
  templateUrl: './all-properties-page.component.html',
  styleUrl: './all-properties-page.component.scss'
})
export class AllPropertiesPageComponent extends BasePropertyAbstract implements OnChanges {
  @Input() module: 'CONT' | 'COMP' = 'CONT';
  @Input() propertyList: PropertyGroupDto[] = [];
  @Input() contactProfile: ContactDto = new ContactDto();
  @Input() companyProfile: CompanyDto = new CompanyDto();

  searchControl: FormControl = new FormControl('');
  hideEmptySearchCheckbox = [{ label: 'Hide blank properties', value: true }];

  hideCheckFormControl: FormControl = new FormControl();

  constructor(
    protected override formBuilder: FormBuilder,
    protected override commonService: CommonService,
    protected override messageService: MessageService,
    protected override authService: AuthService,
    protected override translateService: TranslateService
  ) {
    super(formBuilder, commonService, messageService, authService, translateService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertyList'] && changes['propertyList'].currentValue && changes['module'] && changes['module'].currentValue) {
      this.propertyList = changes['propertyList'].currentValue;
      this.commonService.getAllCountry().subscribe(res => {
        if (res.isSuccess) {
          this.countryOptionList = res.data.map(c => {
            return {
              label: c.name,
              value: c.uid
            }
          });
          this.initProfileFormConfig(this.propertyList, this.module, this.contactProfile, this.companyProfile);
          this.checkFormValueChange(this.propertyList);
        }
        else {
          this.popMessage(res.responseMessage, "Error", "error");
        }

      });
    }
  }

  ngOnInit() {
    this.hideCheckFormControl.valueChanges.subscribe(item => {
      if (item[0] === true) {
        this.propertyList.forEach(group => {
          group.propertiesList.forEach(prop => {
            if (this.profileFormGroup.controls[prop.propertyCode].value) {
              console.log(this.profileFormGroup.controls[prop.propertyCode])
              this.propertyDisplayList.find(item => (item.property as PropertiesDto).uid === prop.uid).isNull = false;
            }
            else {
              this.propertyDisplayList.find(item => (item.property as PropertiesDto).uid === prop.uid).isNull = true;
            }
          })
        })
      }
      else {
        this.propertyList.forEach(group => {
          group.propertiesList.forEach(prop => {
            this.propertyDisplayList.find(item => (item.property as PropertiesDto).uid === prop.uid).isNull = false;
          })
        })
      }

      this.setVisibilityToProperty();
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.propertyConfig.forEach(item => {
        item.list.forEach((prop: FormConfig) => {
          if (value.length === 0) {
            this.propertyDisplayList.find(item => (item.property as PropertiesDto).uid === prop.id).isSearch = true;
          }
          else {
            if (document.getElementById(prop.id!)) {
              if (prop.label!.toString().toLowerCase().includes(value.toLowerCase())) {
                this.propertyDisplayList.find(item => (item.property as PropertiesDto).uid === prop.id).isSearch = true;
              }
              else {
                this.propertyDisplayList.find(item => (item.property as PropertiesDto).uid === prop.id).isSearch = false;
              }
            }
            else {
              console.error({
                property: prop.name,
                error: `Can't find the element id: ${prop.id}`
              });
            }
          }
        })
      });

      this.setVisibilityToProperty();
    });
  }

  setVisibilityToProperty() {
    this.tempPropertyConfigNumber = {};

    this.propertyDisplayList.forEach(item => {
      if (!item.isNull && item.isSearch) {
        this.tempPropertyConfigNumber[(item.property as PropertiesDto).moduleCat] = 1;
        document.getElementById(item.property.uid)!.style.display = 'block';
      }
      else {
        document.getElementById(item.property.uid)!.style.display = 'none';
      }
    });
  }

  isShowModulePanel(moduleCode: string): boolean {
    // console.log(this.propertyList.length)
    return this.tempPropertyConfigNumber[moduleCode] > 0;
  }
}