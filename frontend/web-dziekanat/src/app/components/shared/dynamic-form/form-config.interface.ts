import { ValidatorFn } from '@angular/forms';

export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'hidden' | 'checkbox';

export interface FormFieldOption {
  value: any;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  initialValue?: any;
  options?: FormFieldOption[];
  validators?: ValidatorFn | ValidatorFn[];
  placeholder?: string;
  hidden?: boolean;
}

export interface FormConfig {
  title: string;
  fields: FormField[];
  submitButtonText?: string;
  cancelButtonText?: string;
}
