import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { add } from 'date-fns';
import { sortBy } from 'lodash';
import { MessageService } from 'primeng/api';
import { SubSink } from 'subsink';
import { MaintenanceItem, ReactiveFormControls } from '../maintenance.beans';
import { MaintenanceService } from '../maintenance.service';

@Component({
  selector: 'app-maintenance-checklist',
  templateUrl: './maintenance-checklist.component.html',
  styleUrls: ['./maintenance-checklist.component.scss'],
  providers: [MessageService]
})
export class MaintenanceChecklistComponent implements OnInit, OnDestroy {
  mainForm: FormGroup | undefined = undefined;
  maintItems: MaintenanceItem[] = [];

  generalItems: MaintenanceItem[] = [];
  petItems: MaintenanceItem[] = [];
  carItems: MaintenanceItem[] = [];
  kitchenItems: MaintenanceItem[] = [];
  frontYardItems: MaintenanceItem[] = [];
  backyardItems: MaintenanceItem[] = [];
  bedroomItems: MaintenanceItem[] = [];
  personalItems: MaintenanceItem[] = [];

  isExpanded: boolean = true;

  private subs = new SubSink();

  constructor(private fb: FormBuilder, private maintenanceService: MaintenanceService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.subs.sink = this.maintenanceService.getMaintenanceItems().subscribe({
      next: (resp: MaintenanceItem[]) => {
        this.maintItems = resp;
        if (resp.length > 0) {
          this.generalItems = [];
          this.petItems = [];
          this.carItems = [];
          this.kitchenItems = [];
          this.frontYardItems = [];
          this.backyardItems = [];
          this.bedroomItems = [];
          this.personalItems = [];
          resp.forEach((item: MaintenanceItem) => {
            switch (item.category) {
              case 'general': this.generalItems.push(item); break;
              case 'pet': this.petItems.push(item); break;
              case 'car': this.carItems.push(item); break;
              case 'kitchen': this.kitchenItems.push(item); break;
              case 'frontYard': this.frontYardItems.push(item); break;
              case 'backyard': this.backyardItems.push(item); break;
              case 'bedroom': this.bedroomItems.push(item); break;
              case 'personal': this.personalItems.push(item); break;
            }
          });
          const sortFunction = (item: MaintenanceItem) => item.sortOrder;
          this.generalItems = sortBy(this.generalItems, sortFunction);
          this.petItems = sortBy(this.petItems, sortFunction);
          this.carItems = sortBy(this.carItems, sortFunction);
          this.kitchenItems = sortBy(this.kitchenItems, sortFunction);
          this.frontYardItems = sortBy(this.frontYardItems, sortFunction);
          this.backyardItems = sortBy(this.backyardItems, sortFunction);
          this.bedroomItems = sortBy(this.bedroomItems, sortFunction);
          this.personalItems = sortBy(this.generalItems, sortFunction);

          const formControls = this.prepareFormControls(resp);
          if (!!formControls) {
            this.mainForm = new FormGroup(formControls)
          }
        }
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to retrieve data' });
      }
    });
  }

  updateDueDate(controlName: string, duration: Duration) {
    const theControl = this.mainForm!.controls[`${controlName}DueDate`];
    if (!!theControl.value) {
      theControl.setValue(add(theControl.value, duration));
    }
  }

  saveForm(): void {
    const request = this.prepareRequest(this.mainForm!.controls);
    this.maintenanceService.saveMaintenanceItems(request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved form data' });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save data' });
      }
    });
  }

  private prepareFormControls(items: MaintenanceItem[]): ReactiveFormControls {
    const formControls: ReactiveFormControls = {};
    let dueDate: Date | undefined;
    let lastDate: Date | undefined;
    items.forEach((item: MaintenanceItem) => {
      lastDate = !!item.lastCompletedDate ? new Date(item.lastCompletedDate) : undefined;
      dueDate = !!item.dueDate ? new Date(item.dueDate) : undefined;
      formControls[`${item.control}Date`] = new FormControl(lastDate, null);
      formControls[`${item.control}DueDate`] = new FormControl(dueDate, null);
    });
    return formControls;
  }

  private prepareRequest(controls: ReactiveFormControls): MaintenanceItem[] {
    const items: MaintenanceItem[] = JSON.parse(JSON.stringify(this.maintItems));
    let keyLength: number;
    let keyName: string = '';
    let objProp: string;
    let foundIndex: number;
    let newValue: any;
    for (const [key, value] of Object.entries(controls)) {
      if (key.includes('DueDate')) {
        keyLength = key.length - 7;
        objProp = 'dueDate';
      } else {
        // Includes "Date"
        keyLength = key.length - 4;
        objProp = 'lastCompletedDate';
      }
      keyName = key.substring(0, keyLength);

      foundIndex = items.findIndex((item: MaintenanceItem) => item.control === keyName);
      newValue = !!value.value ? value.value.getTime() : 0;
      (items[foundIndex] as any)[objProp as keyof MaintenanceItem] = newValue;
    }
    return items;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
