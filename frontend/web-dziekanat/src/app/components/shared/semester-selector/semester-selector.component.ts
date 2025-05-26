import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-semester-selector',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule
    ],
    templateUrl: './semester-selector.component.html',
    styleUrls: ['./semester-selector.component.scss']
})
export class SemesterSelectorComponent implements OnChanges {
    @Input() availableSemesters: number[] = [];
    @Input() initialSemester: number | null = null;
    @Input() label: string = 'Select Semester';
    @Input() appearance: 'fill' | 'outline' = 'outline';

    @Output() selectionChange = new EventEmitter<number>();

    selectedSemester: number | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['availableSemesters'] || changes['initialSemester']) {
            this.initializeSelection();
        }
    }

    private initializeSelection(): void {
        if (this.availableSemesters && this.availableSemesters.length > 0) {
            if (this.initialSemester !== null && this.availableSemesters.includes(this.initialSemester)) {
                this.selectedSemester = this.initialSemester;
            } else {
                this.selectedSemester = this.availableSemesters[0];
            }
        } else {
            this.selectedSemester = null;
        }
    }
    onSelectionChangeInternal(): void {
        if (this.selectedSemester !== null) {
            this.selectionChange.emit(this.selectedSemester);
        }
    }
} 