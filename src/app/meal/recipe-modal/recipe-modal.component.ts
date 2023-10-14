import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { SelectItem } from 'primeng/api/selectitem';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { getCategoryTypes } from '../../maintenance/maintenance.beans';
import { Recipe } from '../meal.beans';
import { MealService } from '../meal.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.scss']
})
export class RecipeModalComponent implements OnInit, OnDestroy {

  recipe!: Recipe;

  timeReqParts: string[] = ['', ''];
  isError: boolean = false;

  modalForm: FormGroup | undefined;
  categoryOptions: SelectItem[] = getCategoryTypes();
  public Editor = ClassicEditor;

  private subs = new SubSink();

  @ViewChild('ckIngredients') ckIngredients!: CKEditorComponent;
  @ViewChild('ckInstructions') ckInstructions!: CKEditorComponent;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig,
    private mealService: MealService) { }

  ngOnInit(): void {
    this.recipe = Object.assign({}, this.config.data.recipe);

    if (!!this.recipe?.timeRequired) {
      this.timeReqParts = this.recipe?.timeRequired.split('-')!;
    }

    this.modalForm = new FormGroup({
      name: new FormControl(this.recipe!.name, [Validators.required]),
      ingredients: new FormControl(this.recipe!.ingredients, null),
      instructions: new FormControl(this.recipe!.instructions, null),
      url: new FormControl(this.recipe!.url, null)
    });
  }

  updateItem(): void {
    this.recipe!.timeRequired = `${this.timeReqParts[0]}-${this.timeReqParts[1]}`;

    this.subs.sink = this.mealService.saveRecipe(this.recipe).subscribe({
      next: () => {
        this.ref.close(this.recipe);
      },
      error: (err: any) => {
        console.error(err);
        this.isError = true;
        setTimeout(() => {
          this.isError = false;
        }, 1500);
      }
    });

    this.ref.close(Object.assign({ ...this.recipe }, this.modalForm?.value, { ingredients: this.ckIngredients.editorInstance?.data.get(), instructions: this.ckInstructions.editorInstance?.data.get() }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
