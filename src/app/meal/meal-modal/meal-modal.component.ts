import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Meal } from '../meal.beans';

@Component({
  selector: 'app-meal-modal',
  templateUrl: './meal-modal.component.html',
  styleUrls: ['./meal-modal.component.scss']
})
export class MealModalComponent implements OnInit {
  item: Meal | undefined;

  modalForm: FormGroup | undefined;
  public Editor = ClassicEditor;

  @ViewChild('ckNotes') ckNotes!: CKEditorComponent;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.item = Object.assign({}, this.config.data.item);

    this.modalForm = new FormGroup({
      notes: new FormControl(this.item!.notes, null),
    });
  }

  updateItem(): void {
    this.ref.close(Object.assign({ ...this.item }, { notes: this.ckNotes.editorInstance?.data.get() }));
  }
}
