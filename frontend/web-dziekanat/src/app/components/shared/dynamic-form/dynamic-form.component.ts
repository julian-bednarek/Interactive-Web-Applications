import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormConfig, FormField } from './form-config.interface';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() formConfig!: FormConfig;
  @Input() initialData: any | null = null;
  @Input() isLoading: boolean = false;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && !changes['formConfig'].firstChange) {
      this.buildForm();
    }
    if (changes['initialData'] && this.initialData && this.form) {
      this.form.patchValue(this.initialData);
    }
  }

  buildForm(): void {
    if (!this.formConfig) return;

    const group: { [key: string]: any } = {};
    this.formConfig.fields.forEach(field => {
      const validators = field.validators ? field.validators : [];
      const initialValue = this.initialData?.[field.name] ?? field.initialValue ?? (field.type === 'number' ? null : '');
      group[field.name] = [initialValue, validators];
    });
    this.form = this.fb.group(group);
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getControl(name: string) {
    return this.form.get(name);
  }

  isFieldVisible(field: FormField): boolean {
    return !field.hidden;
  }

  handleEnterCheckBox(event: Event, field: FormField): void {
    if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Enter') {
      event.preventDefault();
      this.form.get(field.name)?.setValue(!this.form.get(field.name)?.value);
    }
  }
} 