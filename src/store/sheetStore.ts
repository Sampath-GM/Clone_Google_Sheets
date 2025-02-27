import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  SheetData, 
  SheetDimensions, 
  Selection, 
  DragState, 
  ColumnResize, 
  RowResize,
  Cell
} from '../types';
import { 
  cellCoordToId, 
  updateCellDependencies, 
  findDependentCells,
  getCellValue,
  removeDuplicates,
  findAndReplace
} from '../utils/cellUtils';

interface SheetState {
  data: SheetData;
  dimensions: SheetDimensions;
  selection: Selection | null;
  activeCell: { row: number; col: number } | null;
  editingCell: { row: number; col: number } | null;
  dragState: DragState;
  columnWidths: { [key: number]: number };
  rowHeights: { [key: number]: number };
  undoStack: SheetData[];
  redoStack: SheetData[];
  
  // Actions
  setCellValue: (row: number, col: number, value: string | number | null, formula?: string) => void;
  setCellStyle: (row: number, col: number, style: Partial<Cell['style']>) => void;
  setSelection: (selection: Selection | null) => void;
  setActiveCell: (row: number, col: number) => void;
  setEditingCell: (row: number, col: number) => void;
  clearEditingCell: () => void;
  setDragState: (dragState: Partial<DragState>) => void;
  resizeColumn: (index: number, width: number) => void;
  resizeRow: (index: number, height: number) => void;
  addRow: (index: number) => void;
  deleteRow: (index: number) => void;
  addColumn: (index: number) => void;
  deleteColumn: (index: number) => void;
  applyRemoveDuplicates: (rangeStr: string) => void;
  applyFindAndReplace: (rangeStr: string, findText: string, replaceText: string) => void;
  undo: () => void;
  redo: () => void;
  saveState: () => void;
}

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;
const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 25;

export const useSheetStore = create<SheetState>()(
  immer((set, get) => ({
    data: {},
    dimensions: { rows: DEFAULT_ROWS, cols: DEFAULT_COLS },
    selection: null,
    activeCell: null,
    editingCell: null,
    dragState: { isDragging: false, type: 'none' },
    columnWidths: {},
    rowHeights: {},
    undoStack: [],
    redoStack: [],
    
    setCellValue: (row, col, value, formula) => {
      set((state) => {
        const cellId = cellCoordToId(row, col);
        
        // Update the cell value
        if (!state.data[cellId]) {
          state.data[cellId] = { value };
        } else {
          state.data[cellId].value = value;
        }
        
        // Update formula if provided
        if (formula !== undefined) {
          state.data[cellId].formula = formula;
          
          // Update dependencies
          state.data = updateCellDependencies(cellId, formula, state.data);
        }
        
        // Update dependent cells
        const dependentCells = findDependentCells(cellId, state.data);
        for (const depCellId of dependentCells) {
          const cell = state.data[depCellId];
          if (cell && cell.formula) {
            const newValue = getCellValue(depCellId, state.data);
            state.data[depCellId].value = newValue;
          }
        }
      });
      
      // Save state for undo
      get().saveState();
    },
    
    setCellStyle: (row, col, style) => {
      set((state) => {
        const cellId = cellCoordToId(row, col);
        
        if (!state.data[cellId]) {
          state.data[cellId] = { value: null, style };
        } else {
          state.data[cellId].style = { ...state.data[cellId].style, ...style };
        }
      });
      
      // Save state for undo
      get().saveState();
    },
    
    setSelection: (selection) => {
      set({ selection });
    },
    
    setActiveCell: (row, col) => {
      set({ activeCell: { row, col } });
    },
    
    setEditingCell: (row, col) => {
      set({ editingCell: { row, col } });
    },
    
    clearEditingCell: () => {
      set({ editingCell: null });
    },
    
    setDragState: (dragState) => {
      set((state) => {
        state.dragState = { ...state.dragState, ...dragState };
      });
    },
    
    resizeColumn: (index, width) => {
      set((state) => {
        state.columnWidths[index] = width;
      });
    },
    
    resizeRow: (index, height) => {
      set((state) => {
        state.rowHeights[index] = height;
      });
    },
    
    addRow: (index) => {
      set((state) => {
        // Shift all rows down
        const newData: SheetData = {};
        
        for (const [cellId, cell] of Object.entries(state.data)) {
          const coords = cellId.match(/^([A-Z]+)(\d+)$/);
          if (!coords) continue;
          
          const col = coords[1];
          const row = parseInt(coords[2], 10);
          
          if (row > index) {
            newData[`${col}${row + 1}`] = cell;
          } else {
            newData[cellId] = cell;
          }
        }
        
        state.data = newData;
        state.dimensions.rows += 1;
        
        // Shift row heights
        const newRowHeights: { [key: number]: number } = {};
        for (const [rowIdx, height] of Object.entries(state.rowHeights)) {
          const idx = parseInt(rowIdx, 10);
          if (idx >= index) {
            newRowHeights[idx + 1] = height;
          } else {
            newRowHeights[idx] = height;
          }
        }
        state.rowHeights = newRowHeights;
      });
      
      // Save state for undo
      get().saveState();
    },
    
    deleteRow: (index) => {
      set((state) => {
        // Shift all rows up
        const newData: SheetData = {};
        
        for (const [cellId, cell] of Object.entries(state.data)) {
          const coords = cellId.match(/^([A-Z]+)(\d+)$/);
          if (!coords) continue;
          
          const col = coords[1];
          const row = parseInt(coords[2], 10);
          
          if (row === index) {
            // Skip this row
            continue;
          } else if (row > index) {
            newData[`${col}${row - 1}`] = cell;
          } else {
            newData[cellId] = cell;
          }
        }
        
        state.data = newData;
        state.dimensions.rows -= 1;
        
        // Shift row heights
        const newRowHeights: { [key: number]: number } = {};
        for (const [rowIdx, height] of Object.entries(state.rowHeights)) {
          const idx = parseInt(rowIdx, 10);
          if (idx === index) {
            // Skip this row
            continue;
          } else if (idx > index) {
            newRowHeights[idx - 1] = height;
          } else {
            newRowHeights[idx] = height;
          }
        }
        state.rowHeights = newRowHeights;
      });
      
      // Save state for undo
      get().saveState();
    },
    
    addColumn: (index) => {
      set((state) => {
        // Shift all columns right
        const newData: SheetData = {};
        
        for (const [cellId, cell] of Object.entries(state.data)) {
          const coords = cellId.match(/^([A-Z]+)(\d+)$/);
          if (!coords) continue;
          
          const colStr = coords[1];
          const row = coords[2];
          
          // Convert column string to index
          let colIndex = 0;
          for (let i = 0; i < colStr.length; i++) {
            colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
          }
          colIndex -= 1; // 0-based index
          
          if (colIndex >= index) {
            // Convert new index back to column string
            let newColIndex = colIndex + 1;
            let newColStr = '';
            
            while (newColIndex >= 0) {
              newColStr = String.fromCharCode(65 + (newColIndex % 26)) + newColStr;
              newColIndex = Math.floor(newColIndex / 26) - 1;
            }
            
            newData[`${newColStr}${row}`] = cell;
          } else {
            newData[cellId] = cell;
          }
        }
        
        state.data = newData;
        state.dimensions.cols += 1;
        
        // Shift column widths
        const newColumnWidths: { [key: number]: number } = {};
        for (const [colIdx, width] of Object.entries(state.columnWidths)) {
          const idx = parseInt(colIdx, 10);
          if (idx >= index) {
            newColumnWidths[idx + 1] = width;
          } else {
            newColumnWidths[idx] = width;
          }
        }
        state.columnWidths = newColumnWidths;
      });
      
      // Save state for undo
      get().saveState();
    },
    
    deleteColumn: (index) => {
      set((state) => {
        // Shift all columns left
        const newData: SheetData = {};
        
        for (const [cellId, cell] of Object.entries(state.data)) {
          const coords = cellId.match(/^([A-Z]+)(\d+)$/);
          if (!coords) continue;
          
          const colStr = coords[1];
          const row = coords[2];
          
          // Convert column string to index
          let colIndex = 0;
          for (let i = 0; i < colStr.length; i++) {
            colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
          }
          colIndex -= 1; // 0-based index
          
          if (colIndex === index) {
            // Skip this column
            continue;
          } else if (colIndex > index) {
            // Convert new index back to column string
            let newColIndex = colIndex - 1;
            let newColStr = '';
            
            while (newColIndex >= 0) {
              newColStr = String.fromCharCode(65 + (newColIndex % 26)) + newColStr;
              newColIndex = Math.floor(newColIndex / 26) - 1;
            }
            
            newData[`${newColStr}${row}`] = cell;
          } else {
            newData[cellId] = cell;
          }
        }
        
        state.data = newData;
        state.dimensions.cols -= 1;
        
        // Shift column widths
        const newColumnWidths: { [key: number]: number } = {};
        for (const [colIdx, width] of Object.entries(state.columnWidths)) {
          const idx = parseInt(colIdx, 10);
          if (idx === index) {
            // Skip this column
            continue;
          } else if (idx > index) {
            newColumnWidths[idx - 1] = width;
          } else {
            newColumnWidths[idx] = width;
          }
        }
        state.columnWidths = newColumnWidths;
      });
      
      // Save state for undo
      get().saveState();
    },
    
    applyRemoveDuplicates: (rangeStr) => {
      set((state) => {
        state.data = removeDuplicates(rangeStr, state.data);
      });
      
      // Save state for undo
      get().saveState();
    },
    
    applyFindAndReplace: (rangeStr, findText, replaceText) => {
      set((state) => {
        state.data = findAndReplace(rangeStr, findText, replaceText, state.data);
      });
      
      // Save state for undo
      get().saveState();
    },
    
    saveState: () => {
      set((state) => {
        state.undoStack.push(JSON.parse(JSON.stringify(state.data)));
        state.redoStack = [];
      });
    },
    
    undo: () => {
      set((state) => {
        if (state.undoStack.length > 0) {
          const prevState = state.undoStack.pop();
          if (prevState) {
            state.redoStack.push(JSON.parse(JSON.stringify(state.data)));
            state.data = prevState;
          }
        }
      });
    },
    
    redo: () => {
      set((state) => {
        if (state.redoStack.length > 0) {
          const nextState = state.redoStack.pop();
          if (nextState) {
            state.undoStack.push(JSON.parse(JSON.stringify(state.data)));
            state.data = nextState;
          }
        }
      });
    }
  }))
);