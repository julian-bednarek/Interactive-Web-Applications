import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, TrackByFunction, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn } from './table-column.interface';
import { TableAction } from './table-action.interface';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTableComponent<T> implements OnInit, OnChanges {
  @Input() data: any[] | null = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() idKey: string = 'id';
  @Input() isLoading: boolean = false;
  @Input() noDataMessage: string = 'No data available.';
  @Input() tableContainerClass: string = 'table-container';
  @Input() tableClass: string = 'table';

  @Output() actionClick = new EventEmitter<{ actionId: string; item: any; itemId: any }>();

  sortColumn: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  sortedData: any[] | null = [];
  filteredData: any[] | null = [];

  ngOnInit(): void {
    this.sortedData = [...(this.data || [])];
    this.filteredData = [...(this.data || [])];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.sortedData = [...(this.data || [])];
      this.filteredData = [...(this.data || [])];
      this.sortData();
      this.filterData();
    }
  }

  getDisplayValue(item: any, column: TableColumn): string | number {
    const value = item[column.key];
    return column.displayFn ? column.displayFn(item) : value;
  }

  onActionClick(actionId: string, item: any): void {
    const itemId = item[this.idKey];
    if (itemId === undefined) {
      console.error(`DynamicTableComponent: Item ID not found using idKey '${this.idKey}'. Please check configuration. Item:`, item);
    }
    this.actionClick.emit({ actionId, item, itemId: item });
  }

  trackByItemId: TrackByFunction<any> = (index: number, item: any) => {
    return item && item[this.idKey] !== undefined ? item[this.idKey] : index;
  };

  get displayActionsColumn(): boolean {
    return this.actions && this.actions.length > 0;
  }

  sortData(column?: TableColumn): void {
    if (!column?.key || !column?.isSortable) {
      return;
    }

    if (this.sortColumn === column.key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortOrder = 'asc';
    }

    if (this.filteredData) {
      this.filteredData.sort((a: any, b: any) => {
        const valueA = a[this.sortColumn!];
        const valueB = b[this.sortColumn!];

        if (valueA < valueB) {
          return this.sortOrder === 'asc' ? -1 : 1;
        } else if (valueA > valueB) {
          return this.sortOrder === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }
  }

  filterData(): void {
    if (this.data) {
      this.filteredData = this.data.filter((item: any) => {
        return this.columns.every((column: TableColumn) => {
          if (column.type === 'string' && column.filterValue) {
            const value = item[column.key];
            return String(value).toLowerCase().includes(column.filterValue.toLowerCase());
          }
          return true;
        });
      });
      this.sortData();
    }
  }
}
