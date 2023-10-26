import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DocumentData, DocumentReference } from 'firebase/firestore';
import { camelCase, sortBy } from 'lodash';
import { SelectItem } from 'primeng/api/selectitem';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubSink } from 'subsink';
import { AuthService } from '../../auth/auth.service';
import { Category, Task } from '../tasks.beans';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
})
export class TaskModalComponent implements OnInit, OnDestroy {

  item!: Task;
  tasks!: Task[];
  categories!: Category[];
  categoryOptions!: SelectItem[];

  isError: boolean = false;

  modalForm: FormGroup | undefined;
  public Editor = ClassicEditor;

  private subs = new SubSink();

  @ViewChild('ckNotes') ckNotes!: CKEditorComponent;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig,
    private tasksService: TasksService, private authService: AuthService) { }

  ngOnInit(): void {
    this.item = Object.assign({}, this.config.data.item);
    this.tasks = this.config.data.tasks;
    this.categories = this.config.data.categories;

    this.categoryOptions = sortBy(this.categories.filter((cat: Category) => cat.label !== 'Unassigned').map((cat: Category) => ({ label: cat.label, value: cat.category })), ['label']);

    this.modalForm = new FormGroup({
      control: new FormControl(this.item!.control, null),
      category: new FormControl(this.item!.category, [Validators.required]),
      dueDate: new FormControl(this.item!.dueDate > 0 ? new Date(this.item!.dueDate) : null, null),
      label: new FormControl(this.item!.label, [Validators.required]),
      lastCompletedDate: new FormControl(this.item!.lastCompletedDate > 0 ? new Date(this.item!.lastCompletedDate) : null, null),
      notes: new FormControl(this.item!.notes, null),
    });
  }

  updateItem(): void {
    let tempDate: Date = this.modalForm!.get('lastCompletedDate')!.value;
    const lastCompletedDate = !!tempDate ? tempDate.getTime() : 0;
    tempDate = this.modalForm!.get('dueDate')!.value;
    const dueDate = !!tempDate ? tempDate.getTime() : 0;

    // For new items, generate a control name
    const currentControl = this.modalForm!.get('control')!.value as string;
    if (currentControl.length === 0) {
      this.modalForm!.get('control')!.setValue(camelCase(this.modalForm!.get('label')!.value));
    }

    const item: Task = Object.assign({ ...this.item }, this.modalForm?.value, { notes: this.ckNotes.editorInstance?.data.get(), lastCompletedDate, dueDate });
    // Calculate sortOrder based on how many tasks are currently in the category
    if (item.sortOrder === -1) {
      item.sortOrder = this.tasks.filter((arrayItem: Task) => arrayItem.category === item.category).length + 1;
    }

    item.sharedWith = item.category !== 'personal' ? this.authService.getSharedWith() : [this.authService.user!.uid];

    this.tasksService.saveTask(item).subscribe({
      next: (resp: DocumentReference<DocumentData> | void) => {
        if (resp?.id) {
          item.id = resp.id;
        }
        this.ref.close(item);
      },
      error: (err: any) => {
        console.error(err);
        this.isError = true;
        setTimeout(() => {
          this.isError = false;
        }, 1500);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
