import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { camelCase } from 'lodash';
import { SelectItem } from 'primeng/api/selectitem';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaintenanceItem, getCategoryTypes } from '../maintenance.beans';

@Component({
  selector: 'app-maintenance-item-modal',
  templateUrl: './maintenance-item-modal.component.html',
  styleUrls: ['./maintenance-item-modal.component.scss']
})
export class MaintenanceItemModalComponent implements OnInit {

  item: MaintenanceItem | undefined;

  modalForm: FormGroup | undefined;
  categoryOptions: SelectItem[] = getCategoryTypes();
  public Editor = ClassicEditor;

  @ViewChild('ckNotes') ckNotes!: CKEditorComponent;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.item = Object.assign({}, this.config.data.item);

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

    this.ref.close(Object.assign({ ...this.item }, this.modalForm?.value, { notes: this.ckNotes.editorInstance?.data.get(), lastCompletedDate, dueDate }));
  }
}
