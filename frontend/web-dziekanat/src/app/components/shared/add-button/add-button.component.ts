import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-button.component.html',
  styleUrl: './add-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AddButtonComponent {
  @Input() buttonText: string = 'Add New'; // Default text
  @Input() disabled: boolean = false;      // Default disabled state
  @Output() addClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.addClick.emit();
    }
  }
} 