import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { faCircleInfo, faCirclePlus, faCircleXmark, faEye, faFilter, faFloppyDisk, faFolderMinus, faFolderPlus, faList, faPenToSquare, faPlus, faRotate, faTrash } from '@fortawesome/free-solid-svg-icons';
import { add, isBefore, isSameDay, set } from 'date-fns';
import { filter, sortBy } from 'lodash';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown/dropdown.interface';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { zip } from 'rxjs';
import { SubSink } from 'subsink';
import { ReactiveFormControls } from '../../app.beans';
import { BREAKPOINTS } from '../../app.config';
import { AuthService } from '../../auth/auth.service';
import { CategoryModalComponent } from '../category-modal/category-modal.component';
import { ValidateCompletedDate } from '../shared/date.validator';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { AccordionAction, Category, Task, TaskSortOption } from '../tasks.beans';
import { TasksService } from '../tasks.service';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.scss'],
    providers: [MessageService, DialogService, ConfirmationService]
})
export class TaskListComponent implements OnInit, OnDestroy {
    maintForm: FormGroup | undefined = undefined;
    tasks: Task[] = [];
    categories: Category[] = [];
    dateCategories: Category[] = [];
    selectedCategories: Category[] = [];
    filterValue: string = '';

    ref: DynamicDialogRef | undefined;
    isViewMode: boolean = true;

    initialFormValues: any = [];

    sortOptions: TaskSortOption[] = [{
        label: 'Category',
        iconName: faList,
    }, {
        label: 'Due Date',
        iconName: faSquareCheck,
    }];
    selectedSort: TaskSortOption = this.sortOptions[0];

    private subs = new SubSink();

    // Icons
    faPenToSquare = faPenToSquare;
    faCirclePlus = faCirclePlus;
    faPlus = faPlus;
    faEye = faEye;
    faFloppyDisk = faFloppyDisk;
    faRotate = faRotate;
    faFolderPlus = faFolderPlus;
    faFolderMinus = faFolderMinus;
    faFilter = faFilter;
    faCircleXmark = faCircleXmark;
    faTrash = faTrash;
    faCircleInfo = faCircleInfo;

    constructor(private tasksService: TasksService,
        private messageService: MessageService, private dialogService: DialogService,
        private confirmationService: ConfirmationService, private authService: AuthService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.subs.sink = zip(
            this.tasksService.getCategories(),
            this.tasksService.getTasks()
        ).subscribe({
            next: ([categories, tasks]) => {

                // Sort by sortOrder property
                this.categories = sortBy(filter(categories, ['type', 'category']), 'sortOrder');
                this.dateCategories = sortBy(filter(categories, ['type', 'date']), 'sortOrder');
                this.tasks = sortBy(tasks, 'sortOrder');

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

                this.tasksService.saveCategories(this.categories);

                this.categories.push({
                    category: 'unassigned',
                    label: 'Unassigned',
                    sharedWith: [],
                    sortOrder: this.categories.length + 1,
                    type: 'category'
                });

                const formControls = this.prepareFormControls(tasks);
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
            error: (err: any) => {
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
        this.tasksService.saveTasks(request).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved all task data' });
                this.initialFormValues = this.maintForm!.value;
                this.maintForm!.reset(this.initialFormValues);
                let control: AbstractControl<any, any> | null;
                this.tasks.forEach((item: Task) => {
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
            category.filteredItems = category.items?.filter((item: Task) => item.label.toLowerCase().includes(this.filterValue.toLowerCase()));
            category.isExpanded = (category.filteredItems!.length > 0) ? true : false;
        });
        this.dateCategories.forEach((category: Category) => {
            category.filteredItems = category.items?.filter((item: Task) => item.label.toLowerCase().includes(this.filterValue.toLowerCase()));
            category.isExpanded = (category.filteredItems!.length > 0) ? true : false;
        });
    }

    onChangeSortOption(event: DropdownChangeEvent) {
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

    onClickEditCategory(event: MouseEvent | undefined, item: Category): void {
        event?.stopPropagation();
        this.ref = this.dialogService.open(CategoryModalComponent, {
            header: item.label || 'New Category',
            maximizable: true,
            data: {
                item: item,
                categories: this.categories
            },
            breakpoints: BREAKPOINTS
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

                        this.tasksService.saveCategories(this.categories.filter((cat: Category) => cat.label !== 'Unassigned')).subscribe(() => {
                            // Insert at the correct index, then sort
                            foundIndex = this.categories.findIndex((cat: Category) => cat.sortOrder === category.sortOrder);
                            this.categories.splice(foundIndex, 0, category);
                            this.sortItemsIntoCategories();
                        });
                    } else {
                        // This is an existing item
                        this.tasks.filter((item: Task) => item.category === this.categories[foundIndex].category).forEach((item: Task) => {
                            item.category = category.category;
                        });
                        // Udate the item
                        this.categories[foundIndex] = category;

                        this.subs.sink = this.tasksService.saveTasks(this.tasks).subscribe(() => {
                            this.sortItemsIntoCategories();
                        });
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
                this.subs.sink = this.tasksService.deleteCategory(id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Task deleted successfully' });

                        const deleteIndex = this.categories.findIndex((item: Category) => item.id === id);
                        const categoryToDelete = this.categories[deleteIndex];

                        // Change the category of all items in this deleted category to "unassigned"
                        this.tasks.filter((item: Task) => item.category === categoryToDelete.category).forEach((item: Task) => {
                            item.category = 'unassigned';
                        });

                        // Update sort order of other items in the same category
                        this.categories.filter((item: Category) => item.sortOrder > categoryToDelete.sortOrder).forEach((item: Category) => {
                            item.sortOrder = item.sortOrder - 1;
                        });

                        this.categories.splice(deleteIndex, 1);

                        this.subs.sink = this.tasksService.saveCategories(this.categories.filter((cat: Category) => cat.label !== 'Unassigned')).subscribe(() => {
                            this.sortItemsIntoCategories();
                        });
                    }, error: (err: any) => {
                        console.error(err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete task' });
                    }
                });
            },
            reject: () => { }
        });
    }

    addNewTask(): void {
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

    onClickEditItem(item: Task): void {
        this.ref = this.dialogService.open(TaskModalComponent, {
            header: item.label || 'New Item',
            maximizable: true,
            data: {
                item: item,
                tasks: this.tasks,
                categories: this.categories
            },
            breakpoints: BREAKPOINTS
        });

        this.subs.sink = this.ref.onClose.subscribe({
            next: (task: Task) => {
                if (!!task) {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved task data' });

                    const dateControlValue: Date | undefined = task.lastCompletedDate === 0 ? undefined : new Date(task.lastCompletedDate);
                    const dueDateControlValue: Date | undefined = task.dueDate === 0 ? undefined : new Date(task.dueDate);

                    const foundIndex = this.tasks.findIndex((element: Task) => element.id === task.id);
                    if (foundIndex === -1) {
                        // This is a new item
                        this.tasks.push(task);
                        this.sortItemsIntoCategories();

                        // Create new controls in the form
                        this.maintForm!.addControl(`${task.control}Date`, new FormControl(dateControlValue, null));
                        this.maintForm!.addControl(`${task.control}DueDate`, new FormControl(dueDateControlValue, null));
                    } else {
                        // This is an existing item
                        // Update category.items here
                        this.tasks[foundIndex] = task;
                        this.sortItemsIntoCategories();

                        // Update maintForm
                        this.maintForm!.controls[`${task.control}Date`]!.setValue(dateControlValue);
                        this.maintForm!.controls[`${task.control}DueDate`]!.setValue(dueDateControlValue);
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
                this.subs.sink = this.tasksService.deleteTask(id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Task deleted successfully' });
                        const deleteIndex = this.tasks.findIndex((item: Task) => item.id === id);
                        const itemToDelete = this.tasks[deleteIndex];

                        // Update sort order of other items in the same category
                        this.tasks.filter((item: Task) => item.category === itemToDelete.category && item.sortOrder > itemToDelete.sortOrder).forEach((item: Task) => {
                            item.sortOrder = item.sortOrder - 1;
                        });

                        // Delete the item
                        this.tasks.splice(deleteIndex, 1);

                        this.subs.sink = this.tasksService.saveTasks(this.tasks).subscribe(() => {
                            this.sortItemsIntoCategories();
                        });
                    }, error: (err: any) => {
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
        // Initialize the arrays which will hold the tasks
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
        this.tasks.forEach((item: Task) => {
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
        this.tasks.forEach((item: Task) => {
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

    private prepareFormControls(items: Task[]): ReactiveFormControls {
        const formControls: ReactiveFormControls = {};
        let dueDate: Date | undefined;
        let lastDate: Date | undefined;
        items.forEach((item: Task) => {
            lastDate = !!item.lastCompletedDate ? new Date(item.lastCompletedDate) : undefined;
            dueDate = !!item.dueDate ? new Date(item.dueDate) : undefined;
            formControls[`${item.control}Date`] = new FormControl(lastDate, [ValidateCompletedDate]);
            formControls[`${item.control}DueDate`] = new FormControl(dueDate, null);
        });
        return formControls;
    }

    private prepareRequest(controls: ReactiveFormControls): Task[] {
        const items: Task[] = JSON.parse(JSON.stringify(this.tasks));
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

            foundIndex = items.findIndex((item: Task) => item.control === keyName);
            newValue = !!value.value ? value.value.getTime() : 0;
            (items[foundIndex] as any)[objProp as keyof Task] = newValue;
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
