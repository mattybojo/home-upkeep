import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { add, isBefore, isSameDay, set } from 'date-fns';
import { filter, sortBy } from 'lodash';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { zip } from 'rxjs';
import { SubSink } from 'subsink';
import { DropdownChangeEvent, ReactiveFormControls } from '../../app.beans';
import { AuthService } from '../../auth/auth.service';
import { CategoryModalComponent } from '../category-modal/category-modal.component';
import { MaintenanceItemModalComponent } from '../maintenance-item-modal/maintenance-item-modal.component';
import { AccordionAction, Category, MaintenanceItem, MaintenanceSortOption } from '../maintenance.beans';
import { MaintenanceService } from '../maintenance.service';
import { ValidateCompletedDate } from '../shared/date.validator';

@Component({
  selector: 'app-maintenance-checklist',
  templateUrl: './maintenance-checklist.component.html',
  styleUrls: ['./maintenance-checklist.component.scss'],
  providers: [MessageService, DialogService, ConfirmationService]
})
export class MaintenanceChecklistComponent implements OnInit, OnDestroy {
  maintForm: FormGroup | undefined = undefined;
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
    private confirmationService: ConfirmationService, private authService: AuthService) { }

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

        // Adjust the sort order of the items
        const foundIndex = this.categories.findIndex((cat: Category) => cat.category === 'personal');
        this.categories[foundIndex].sortOrder = this.categories.length;
        this.categories = sortBy(this.categories, 'sortOrder');
        this.categories.forEach((cat: Category, index: number) => {
          if (index > 0) {
            if (this.categories[index].sortOrder - 1 !== this.categories[index - 1].sortOrder) {
              this.categories[index].sortOrder = this.categories[index - 1].sortOrder + 1;
            }
          }
        });

        this.maintenanceService.saveCategories(this.categories);

        this.categories.push({
          category: 'unassigned',
          label: 'Unassigned',
          sharedWith: [],
          sortOrder: this.categories.length + 1,
          type: 'category'
        });

        const formControls = this.prepareFormControls(maintItems);
        if (!!formControls) {
          this.maintForm = new FormGroup(formControls);
          this.initialFormValues = this.maintForm.value;
        }

        this.sortItemsIntoCategories();

        // Filter items based on any existing filter
        this.filterMaintItems();

        // Set the correct view based on what is selected
        this.selectedCategories = this.selectedSort.label === 'Category' ? this.categories : this.dateCategories;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to retrieve task data' });
      }
    });
  }

  updateDueDate(controlName: string, duration: Duration) {
    const theControl = this.maintForm!.controls[`${controlName}DueDate`];
    if (!!theControl.value) {
      theControl.setValue(add(theControl.value, duration));
    }
  }

  resetForm(): void {
    this.maintForm?.reset(this.initialFormValues);
  }

  saveForm(): void {
    const request = this.prepareRequest(this.maintForm!.controls);
    this.maintenanceService.saveMaintenanceItems(request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved all task data' });
        this.initialFormValues = this.maintForm!.value;
        this.maintForm!.reset(this.initialFormValues);
        let control: AbstractControl<any, any> | null;
        this.maintItems.forEach((item: MaintenanceItem) => {
          control = this.maintForm!.get(`${item.control}Date`);
          item.lastCompletedDate = !!control && !!control.value ? control.value.getTime() : 0;
          control = this.maintForm!.get(`${item.control}DueDate`);
          item.dueDate = !!control && !!control.value ? control.value.getTime() : 0;
        });
        this.sortItemsIntoCategories();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save task data' });
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

  addNewCategory(): void {
    this.onClickEditCategory(undefined, {
      category: '',
      label: '',
      sortOrder: -1,
      type: 'category',
      sharedWith: []
    });
  }

  onClickEditCategory(event: PointerEvent | undefined, item: Category): void {
    event?.stopPropagation();
    this.ref = this.dialogService.open(CategoryModalComponent, {
      header: item.label || 'New Category',
      maximizable: true,
      data: {
        item: item,
        categories: this.categories
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (category: Category) => {
        if (!!category) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved category data' });
          let foundIndex = this.categories.findIndex((element: Category) => element.id === category.id);
          if (foundIndex === -1) {
            // This is a new item
            // Move 'Personal' & 'Unassigned' to be the last category
            foundIndex = this.categories.findIndex((element: Category) => element.label === 'Personal');
            this.categories[foundIndex].sortOrder = this.categories[foundIndex].sortOrder + 1;
            foundIndex = this.categories.findIndex((element: Category) => element.label === 'Unassigned');
            this.categories[foundIndex].sortOrder = this.categories[foundIndex].sortOrder + 1;

            this.maintenanceService.saveCategories(this.categories.filter((cat: Category) => cat.label !== 'Unassigned')).subscribe(() => {
              // Insert at the correct index, then sort
              foundIndex = this.categories.findIndex((cat: Category) => cat.sortOrder === category.sortOrder);
              this.categories.splice(foundIndex, 0, category);
              this.sortItemsIntoCategories();
            });
          } else {
            // This is an existing item
            this.categories[foundIndex] = category;
            this.sortItemsIntoCategories();
          }
        }
      }
    });
  }

  onClickDeleteCategory(event: Event, id: string): void {
    event?.stopPropagation();
    this.confirmationService.confirm({
      target: (event.currentTarget || event.target) as EventTarget,
      message: 'Are you sure that you want to delete?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.subs.sink = this.maintenanceService.deleteCategory(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Task deleted successfully' });

            const deleteIndex = this.categories.findIndex((item: Category) => item.id === id);
            const categoryToDelete = this.categories[deleteIndex];

            // Change the category of all items in this deleted category to "unassigned"
            this.maintItems.filter((item: MaintenanceItem) => item.category === categoryToDelete.category).forEach((item: MaintenanceItem) => {
              item.category = 'unassigned';
            });

            // Update sort order of other items in the same category
            this.categories.filter((item: Category) => item.sortOrder > categoryToDelete.sortOrder).forEach((item: Category) => {
              item.sortOrder = item.sortOrder - 1;
            });

            this.categories.splice(deleteIndex, 1);

            this.subs.sink = this.maintenanceService.saveCategories(this.categories.filter((cat: Category) => cat.label !== 'Unassigned')).subscribe(() => {
              this.sortItemsIntoCategories();
            });
          }, error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete task' });
          }
        });
      },
      reject: () => { }
    });
  }

  addNewMaintenanceItem(): void {
    this.onClickEditItem({
      category: 'backyard',
      control: '',
      dueDate: 0,
      label: '',
      lastCompletedDate: 0,
      notes: '',
      sortOrder: -1,
      sharedWith: []
    });
  }

  onClickEditItem(item: MaintenanceItem): void {
    this.ref = this.dialogService.open(MaintenanceItemModalComponent, {
      header: item.label || 'New Item',
      maximizable: true,
      data: {
        item: item,
        maintItems: this.maintItems,
        categories: this.categories
      }
    });

    this.subs.sink = this.ref.onClose.subscribe({
      next: (maintItem: MaintenanceItem) => {
        if (!!maintItem) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved task data' });

          const dateControlValue: Date | undefined = maintItem.lastCompletedDate === 0 ? undefined : new Date(maintItem.lastCompletedDate);
          const dueDateControlValue: Date | undefined = maintItem.dueDate === 0 ? undefined : new Date(maintItem.dueDate);

          const foundIndex = this.maintItems.findIndex((element: MaintenanceItem) => element.id === maintItem.id);
          if (foundIndex === -1) {
            // This is a new item
            this.maintItems.push(maintItem);
            this.sortItemsIntoCategories();

            // Create new controls in the form
            this.maintForm!.addControl(`${maintItem.control}Date`, new FormControl(dateControlValue, null));
            this.maintForm!.addControl(`${maintItem.control}DueDate`, new FormControl(dueDateControlValue, null));
          } else {
            // This is an existing item
            // Update category.items here
            this.maintItems[foundIndex] = maintItem;
            this.sortItemsIntoCategories();

            // Update maintForm
            this.maintForm!.controls[`${maintItem.control}Date`]!.setValue(dateControlValue);
            this.maintForm!.controls[`${maintItem.control}DueDate`]!.setValue(dueDateControlValue);
          }
        }
      }
    });
  }

  onClickDeleteItem(event: Event, id: string): void {
    this.confirmationService.confirm({
      target: (event.currentTarget || event.target) as EventTarget,
      message: 'Are you sure that you want to delete?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.subs.sink = this.maintenanceService.deleteMaintenanceItem(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Task deleted successfully' });
            const deleteIndex = this.maintItems.findIndex((item: MaintenanceItem) => item.id === id);
            const itemToDelete = this.maintItems[deleteIndex];

            // Update sort order of other items in the same category
            this.maintItems.filter((item: MaintenanceItem) => item.category === itemToDelete.category && item.sortOrder > itemToDelete.sortOrder).forEach((item: MaintenanceItem) => {
              item.sortOrder = item.sortOrder - 1;
            });

            // Delete the item
            this.maintItems.splice(deleteIndex, 1);

            this.subs.sink = this.maintenanceService.saveMaintenanceItems(this.maintItems).subscribe(() => {
              this.sortItemsIntoCategories();
            });
          }, error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete task' });
          }
        });
      },
      reject: () => { }
    });
  }

  onAccordionAction(action: AccordionAction): void {
    this.categories.forEach((cat: Category) => cat.isExpanded = (action === 'expand'));
    this.dateCategories.forEach((cat: Category) => cat.isExpanded = (action === 'expand'));
  }

  private sortItemsIntoCategories(): void {
    // Initialize the arrays which will hold the maintenance items
    this.categories.forEach((category: Category) => {
      category.items = [];
      category.filteredItems = [];
    });

    this.dateCategories.forEach((category: Category) => {
      category.items = [];
      category.filteredItems = [];
    });

    // Sort items into categories
    let foundIndex: number;
    this.maintItems.forEach((item: MaintenanceItem) => {
      foundIndex = this.categories.findIndex((category: Category) => category.category === item.category);
      if (foundIndex === -1) {
        // Category not found, assign to unassigned
        item.category = 'unassigned';
        foundIndex = this.categories.findIndex((cat: Category) => cat.category === 'unassigned');
      }

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
      } else if (isBefore(new Date(item.dueDate), today)) {
        categoryType = 'pastDue';
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
