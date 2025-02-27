export type CellValue = string | number | null;

export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
};

export type Cell = {
  value: CellValue;
  formula?: string;
  style?: CellStyle;
  dependencies?: string[];
};

export type SheetData = {
  [key: string]: Cell;
};

export type SheetDimensions = {
  rows: number;
  cols: number;
};

export type Selection = {
  start: { row: number; col: number };
  end: { row: number; col: number };
  active?: { row: number; col: number };
};

export type DragState = {
  isDragging: boolean;
  startCell?: { row: number; col: number };
  endCell?: { row: number; col: number };
  type: 'fill' | 'move' | 'resize' | 'none';
};

export type ColumnResize = {
  index: number;
  width: number;
};

export type RowResize = {
  index: number;
  height: number;
};