import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaintenanceItem, getCategoryTypes } from '../maintenance.beans';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api/selectitem';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import { EditorConfig } from '@ckeditor/ckeditor5-core';

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

  @ViewChild('editor') editorComponent!: CKEditorComponent;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.item = this.config.data.item;

    this.modalForm = new FormGroup({
      category: new FormControl(this.item!.category, null),
      dueDate: new FormControl(this.item!.dueDate > 0 ? new Date(this.item!.dueDate) : null, null),
      label: new FormControl(this.item!.label, null),
      lastCompletedDate: new FormControl(this.item!.lastCompletedDate > 0 ? new Date(this.item!.lastCompletedDate) : null, null),
      notes: new FormControl(this.item!.notes, null),
    });
  }

  updateItem(): void {
    let tempDate: Date = this.modalForm!.get('lastCompletedDate')!.value;
    const lastCompletedDate = !!tempDate ? tempDate.getTime() : 0;
    tempDate = this.modalForm!.get('dueDate')!.value;
    const dueDate = !!tempDate ? tempDate.getTime() : 0;
    this.ref.close(Object.assign({ ...this.item }, this.modalForm?.value, { notes: this.editorComponent.editorInstance?.data.get(), lastCompletedDate, dueDate }));
  }
}
