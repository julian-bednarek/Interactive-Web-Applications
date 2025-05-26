export interface TableColumn {
  key: string;
  header: string;
  displayFn?: (item: any) => string | number;
  isSortable?: boolean;
  filterValue?: string;
  type: 'string' | 'number';
};