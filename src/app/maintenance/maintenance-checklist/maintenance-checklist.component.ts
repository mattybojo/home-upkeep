import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { add, isBefore, isSameDay, set } from 'date-fns';
import { filter, sortBy } from 'lodash';
import { MessageService } from 'primeng/api';
import { zip } from 'rxjs';
import { SubSink } from 'subsink';
import { DropdownChangeEvent } from '../../app.beans';
import { MaintenanceItem, MaintenanceSortOption, ReactiveFormControls } from '../maintenance.beans';
import { MaintenanceService } from '../maintenance.service';
import { ValidateCompletedDate } from '../shared/date.validator';
import { Category } from './../maintenance.beans';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaintenanceItemModalComponent } from '../maintenance-item-modal/maintenance-item-modal.component';

@Component({
  selector: 'app-maintenance-checklist',
  templateUrl: './maintenance-checklist.component.html',
  styleUrls: ['./maintenance-checklist.component.scss'],
  providers: [MessageService, DialogService]
})
export class MaintenanceChecklistComponent implements OnInit, OnDestroy {
  mainForm: FormGroup | undefined = undefined;
  maintItems: MaintenanceItem[] = [];
  categories: Category[] = [];
  dateCategories: Category[] = [];
  selectedCategories: Category[] = [];
  filterValue: string = '';

  ref: DynamicDialogRef | undefined;
  isViewMode: boolean = true;

  initialFormValues: any = [];

  sortOptions: MaintenanceSortOption[] = [{
    label: 'Category',
    icon: 'fa-solid fa-list fa-fw'
  }, {
    label: 'Due Date',
    icon: 'fa-regular fa-square-check fa-fw'
  }];
  selectedSort: MaintenanceSortOption = this.sortOptions[0];

  private subs = new SubSink();

  constructor(private maintenanceService: MaintenanceService,
    private messageService: MessageService, private dialogService: DialogService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.subs.sink = zip(
      this.maintenanceService.getCategories(),
      this.maintenanceService.getMaintenanceItems()
    ).subscribe({
      next: ([categories, maintItems]) => {
        // Sort by sortOrder property
        this.categories = sortBy(filter(categories, ['type', 'category']), 'sortOrder');
        this.dateCategories = sortBy(filter(categories, ['type', 'date']), 'sortOrder');
        this.maintItems = sortBy(maintItems, 'sortOrder');

        const formControls = this.prepareFormControls(maintItems);
        if (!!formControls) {
          this.mainForm = new FormGroup(formControls);
          this.initialFormValues = this.mainForm.value;
        }

        this.sortItemsIntoCategories();

        // Filter items based on any existing filter
        this.filterMaintItems();

        // Set the correct view based on what is selected
        this.selectedCategories = this.selectedSort.label === 'Category' ? this.categories : this.dateCategories;
      },
      error: (err) => {
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

  resetForm(): void {
    this.mainForm?.reset(this.initialFormValues);
  }

  saveForm(): void {
    const request = this.prepareRequest(this.mainForm!.controls);
    this.maintenanceService.saveMaintenanceItems(request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved form data' });
        this.initialFormValues = this.mainForm!.value;
        this.mainForm!.reset(this.initialFormValues);
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save data' });
      }
    });
  }

  resetFilter(): void {
    this.filterValue = '';
    this.filterMaintItems();
  }

  filterMaintItems(): void {
    this.categories.forEach((category: Category) => {
      category.filteredItems = category.items?.filter((item: MaintenanceItem) => item.label.toLowerCase().includes(this.filterValue.toLowerCase()));
      category.isExpanded = (category.filteredItems!.length > 0) ? true : false;
    });
    this.dateCategories.forEach((category: Category) => {
      category.filteredItems = category.items?.filter((item: MaintenanceItem) => item.label.toLowerCase().includes(this.filterValue.toLowerCase()));
      category.isExpanded = (category.filteredItems!.length > 0) ? true : false;
    });
  }

  onChangeSortOption(event: DropdownChangeEvent<MaintenanceSortOption>) {
    switch (event.value.label) {
      case 'Category':
        this.selectedCategories = this.categories;
        break;
      case 'Due Date':
        this.selectedCategories = this.dateCategories;
        break;
      default: console.error(`Invalid sort option: ${event.value.label}`);
    }
  }

  addNewMaintenanceItem(): void {
    this.onClickEditItem({
      category: 'backyard',
      control: '',
      dueDate: 0,
      label: '',
      lastCompletedDate: 0,
      notes: '',
      sortOrder: -1
    });
  }

  onClickEditItem(item: MaintenanceItem): void {
    this.ref = this.dialogService.open(MaintenanceItemModalComponent, {
      header: item.label,
      maximizable: true,
      data: {
        item: item,
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (maintItem: MaintenanceItem) => {
        const dateControlValue: Date | undefined = maintItem.lastCompletedDate === 0 ? undefined : new Date(maintItem.lastCompletedDate);
        const dueDateControlValue: Date | undefined = maintItem.dueDate === 0 ? undefined : new Date(maintItem.dueDate);
        if (maintItem.sortOrder === -1) {
          // This is a new item
          // Calculate sortOrder based on category (items.length + 1 === new sort order)
          maintItem.sortOrder = this.categories.find((cat: Category) => maintItem.category === cat.category)!.items!.length + 1;

          this.maintItems.push(maintItem);
          this.sortItemsIntoCategories();

          // Create new controls in the form
          this.mainForm!.addControl(`${maintItem.control}Date`, new FormControl(dateControlValue, null));
          this.mainForm!.addControl(`${maintItem.control}DueDate`, new FormControl(dueDateControlValue, null));
        } else {
          // This is an existing item
          // Update category.items here
          let index = this.maintItems.findIndex((myItem: MaintenanceItem) => myItem.control === maintItem.control);
          this.maintItems[index] = maintItem;
          this.sortItemsIntoCategories();

          // Update mainForm
          this.mainForm!.controls[`${maintItem.control}Date`]!.setValue(dateControlValue);
          this.mainForm!.controls[`${maintItem.control}DueDate`]!.setValue(dueDateControlValue);
        }
      }
    });
  }

  identifyMaintItem(index: number, item: MaintenanceItem): string {
    return `${item.control}-${item.notes}`;
  }

  private sortItemsIntoCategories(): void {
    // Initialize the arrays which will hold the maintenance items
    this.categories.forEach((category: Category) => {
      category.items = [];
      category.filteredItems = [];
      category.isExpanded = true;
    });

    this.dateCategories.forEach((category: Category) => {
      category.items = [];
      category.filteredItems = [];
      category.isExpanded = true;
    });

    // Sort items into categories
    let foundIndex: number;
    this.maintItems.forEach((item: MaintenanceItem) => {
      foundIndex = this.categories.findIndex((category: Category) => category.category === item.category);
      this.categories[foundIndex].items?.push(item);
      this.categories[foundIndex].filteredItems?.push(item);
    });

    // Break down into date categories
    // Calculate the date to check against for each option
    const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    const nextWeek = add(today, { weeks: 1 });
    const nextMonth = add(today, { months: 1 });

    // Add items to the appropriate categories
    let categoryType: string;
    this.maintItems.forEach((item: MaintenanceItem) => {
      if (item.dueDate === 0) {
        categoryType = 'noDate';
      } else if (isSameDay(new Date(item.dueDate), today)) {
        categoryType = 'today';
      } else if (isBefore(new Date(item.dueDate), nextWeek)) {
        categoryType = 'week';
      } else if (isBefore(new Date(item.dueDate), nextMonth)) {
        categoryType = 'month';
      } else {
        categoryType = 'future';
      }
      foundIndex = this.dateCategories.findIndex((category: Category) => category.category === categoryType);
      this.dateCategories[foundIndex].items?.push(item);
      this.dateCategories[foundIndex].filteredItems?.push(item);
    });

    // Sort the date categories entries by due date
    this.dateCategories.forEach((category: Category) => {
      if (category.items?.length === 0) {
        category.isExpanded = false;
      } else {
        category.isExpanded = true;
        category.items = sortBy(category.items, 'dueDate');
        category.filteredItems = sortBy(category.filteredItems, 'dueDate');
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
    if (this.ref) {
      this.ref.close();
    }
  }
}
