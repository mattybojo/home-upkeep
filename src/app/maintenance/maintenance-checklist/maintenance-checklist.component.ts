import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { add } from 'date-fns';
import { sortBy } from 'lodash';
import { MessageService } from 'primeng/api';
import { zip } from 'rxjs';
import { SubSink } from 'subsink';
import { MaintenanceItem, ReactiveFormControls } from '../maintenance.beans';
import { MaintenanceService } from '../maintenance.service';
import { ValidateCompletedDate } from '../shared/date.validator';
import { Category } from './../maintenance.beans';

@Component({
  selector: 'app-maintenance-checklist',
  templateUrl: './maintenance-checklist.component.html',
  styleUrls: ['./maintenance-checklist.component.scss'],
  providers: [MessageService]
})
export class MaintenanceChecklistComponent implements OnInit, OnDestroy {
  mainForm: FormGroup | undefined = undefined;
  maintItems: MaintenanceItem[] = [];
  categories: Category[] = [];

  isExpanded: boolean = true;
  initialFormValues: any = [];

  private subs = new SubSink();

  constructor(private maintenanceService: MaintenanceService,
    private messageService: MessageService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.subs.sink = zip(
      this.maintenanceService.getCategories(),
      this.maintenanceService.getMaintenanceItems()
    ).subscribe(([categories, maintItems]) => {

      // Sort by sortOrder property
      this.categories = sortBy(categories, 'sortOrder');
      this.maintItems = sortBy(maintItems, 'sortOrder');

      // Initialize the arrays which will hold the maintenance items
      this.categories.forEach((category: Category) => {
        category.items = [];
        category.filteredItems = [];
      });

      // Sort items into categories
      let foundIndex: number;
      this.maintItems.forEach((item: MaintenanceItem) => {
        foundIndex = this.categories.findIndex((category: Category) => category.category === item.category);
        this.categories[foundIndex].items?.push(item);
        this.categories[foundIndex].filteredItems?.push(item);
      });

      const formControls = this.prepareFormControls(maintItems);
      if (!!formControls) {
        this.mainForm = new FormGroup(formControls)
        this.subs.sink = this.mainForm.valueChanges.subscribe({
          next: (resp) => this.cdr.detectChanges(),
          error: (err) => console.error('Error detecting form changes')
        });
        this.initialFormValues = this.mainForm.value;
      }
    }, (err) => {
      console.error(err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to retrieve data' });
    });
  }

  updateDueDate(controlName: string, duration: Duration) {
    const theControl = this.mainForm!.controls[`${controlName}DueDate`];
    if (!!theControl.value) {
      theControl.setValue(add(theControl.value, duration));
    }
  }

  resetForm(): void {
    this.mainForm?.reset(this.initialFormValues);
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
      formControls[`${item.control}Date`] = new FormControl(lastDate, [ValidateCompletedDate]);
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
