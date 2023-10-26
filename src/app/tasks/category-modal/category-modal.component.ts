import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DocumentData, DocumentReference } from 'firebase/firestore';
import { camelCase, isEmpty } from 'lodash';
import { SelectItem } from 'primeng/api/selectitem';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubSink } from 'subsink';
import { AuthService } from '../../auth/auth.service';
import { Category } from '../tasks.beans';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent implements OnInit, OnDestroy {

  item!: Category;
  categories!: Category[];

  isError: boolean = false;
  modalForm: FormGroup | undefined;

  privacyOptions: SelectItem[] = [{
    label: 'Friends',
    value: 'friends'
  }, {
    label: 'Only Me',
    value: 'onlyMe'
  }];

  private subs = new SubSink();

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig,
    private tasksService: TasksService, private authService: AuthService) { }

  ngOnInit(): void {
    this.item = Object.assign({}, this.config.data.item);
    this.categories = this.config.data.categories;

    this.modalForm = new FormGroup({
      label: new FormControl(this.item!.label, [Validators.required]),
      privacy: new FormControl({ value: this.item.sharedWith.length === 1 ? 'onlyMe' : 'friends', disabled: true }, [Validators.required]),
    });
  }

  updateItem(): void {
    let foundIndex: number;
    const item: Category = Object.assign({ ...this.item }, this.modalForm?.value);
    // Calculate sortOrder based on how many tasks are currently in the category
    if (item.sortOrder === -1) {
      if (isEmpty(item.category)) {
        item.category = camelCase(item.label);
      }
      foundIndex = this.categories.findIndex((cat: Category) => cat.category === item.category);
      // Category not found, append to end of array
      if (foundIndex === -1) {
        item.sortOrder = this.categories.length - 1;
      }
    }

    item.sharedWith = this.modalForm?.get('privacy')!.value === 'friends' ? this.authService.getSharedWith() : [this.authService.user!.uid];

    this.tasksService.saveCategory(item).subscribe({
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
