import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LookupDataService } from '../../../../mock-data/lookup-data';

@Component({
  selector: 'app-select-category',
  imports: [ReactiveFormsModule],
  templateUrl: './select-category.html',
  styleUrl: './select-category.scss',
})
export class SelectCategory {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly categories = inject(LookupDataService).slotCategories;
  readonly form = this.fb.nonNullable.group({
    category: ['', Validators.required],
  });

  next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const category = this.form.controls.category.value;
    void this.router.navigate(['/provider/slots/details'], { queryParams: { category } });
  }
}
