import { Cell, CellValue, SheetData } from '../types';

// Convert column index to letter (0 -> A, 1 -> B, etc.)
export const colIndexToLabel = (index: number): string => {
  let label = '';
  let i = index;
  
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  
  return label;
};

// Convert cell coordinates to cell ID (e.g., A1, B2)
export const cellCoordToId = (row: number, col: number): string => {
  return `${colIndexToLabel(col)}${row + 1}`;
};

// Parse cell ID to coordinates (e.g., A1 -> {row: 0, col: 0})
export const parseCellId = (cellId: string): { row: number; col: number } | null => {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  
  const colStr = match[1];
  const rowStr = match[2];
  
  let colIndex = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
  }
  
  return {
    row: parseInt(rowStr, 10) - 1,
    col: colIndex - 1
  };
};

// Check if a string is a valid cell reference
export const isCellReference = (str: string): boolean => {
  return /^[A-Z]+\d+$/.test(str);
};

// Extract cell references from a formula
export const extractCellReferences = (formula: string): string[] => {
  const cellRefs: string[] = [];
  const regex = /[A-Z]+\d+/g;
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    cellRefs.push(match[0]);
  }
  
  return cellRefs;
};

// Get cell value (resolving formulas if needed)
export const getCellValue = (cellId: string, data: SheetData, visited = new Set<string>()): CellValue => {
  if (visited.has(cellId)) {
    return '#CIRCULAR!';
  }
  
  const cell = data[cellId];
  if (!cell) return null;
  
  if (!cell.formula) return cell.value;
  
  visited.add(cellId);
  try {
    return evaluateFormula(cell.formula, data, visited);
  } catch (error) {
    return '#ERROR!';
  } finally {
    visited.delete(cellId);
  }
};

// Evaluate a formula
export const evaluateFormula = (formula: string, data: SheetData, visited = new Set<string>()): CellValue => {
  if (!formula.startsWith('=')) return formula;
  
  const expression = formula.substring(1).trim();
  
  // Handle built-in functions
  if (expression.startsWith('SUM(')) {
    return evaluateSum(expression, data, visited);
  } else if (expression.startsWith('AVERAGE(')) {
    return evaluateAverage(expression, data, visited);
  } else if (expression.startsWith('MAX(')) {
    return evaluateMax(expression, data, visited);
  } else if (expression.startsWith('MIN(')) {
    return evaluateMin(expression, data, visited);
  } else if (expression.startsWith('COUNT(')) {
    return evaluateCount(expression, data, visited);
  } else if (expression.startsWith('TRIM(')) {
    return evaluateTrim(expression, data, visited);
  } else if (expression.startsWith('UPPER(')) {
    return evaluateUpper(expression, data, visited);
  } else if (expression.startsWith('LOWER(')) {
    return evaluateLower(expression, data, visited);
  }
  
  // Handle basic arithmetic expressions
  return evaluateArithmeticExpression(expression, data, visited);
};

// Parse a range of cells (e.g., A1:B3)
export const parseRange = (rangeStr: string): string[] => {
  const [start, end] = rangeStr.split(':');
  if (!start || !end) return [rangeStr];
  
  const startCoord = parseCellId(start);
  const endCoord = parseCellId(end);
  
  if (!startCoord || !endCoord) return [rangeStr];
  
  const cells: string[] = [];
  for (let row = startCoord.row; row <= endCoord.row; row++) {
    for (let col = startCoord.col; col <= endCoord.col; col++) {
      cells.push(cellCoordToId(row, col));
    }
  }
  
  return cells;
};

// Extract range from function argument
export const extractRange = (funcExpr: string): string => {
  const match = funcExpr.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
};

// Evaluate SUM function
export const evaluateSum = (expression: string, data: SheetData, visited: Set<string>): number => {
  const rangeStr = extractRange(expression);
  const cells = parseRange(rangeStr);
  
  let sum = 0;
  for (const cellId of cells) {
    const value = getCellValue(cellId, data, visited);
    if (typeof value === 'number') {
      sum += value;
    }
  }
  
  return sum;
};

// Evaluate AVERAGE function
export const evaluateAverage = (expression: string, data: SheetData, visited: Set<string>): number => {
  const rangeStr = extractRange(expression);
  const cells = parseRange(rangeStr);
  
  let sum = 0;
  let count = 0;
  
  for (const cellId of cells) {
    const value = getCellValue(cellId, data, visited);
    if (typeof value === 'number') {
      sum += value;
      count++;
    }
  }
  
  return count > 0 ? sum / count : 0;
};

// Evaluate MAX function
export const evaluateMax = (expression: string, data: SheetData, visited: Set<string>): number => {
  const rangeStr = extractRange(expression);
  const cells = parseRange(rangeStr);
  
  let max = Number.NEGATIVE_INFINITY;
  let hasValue = false;
  
  for (const cellId of cells) {
    const value = getCellValue(cellId, data, visited);
    if (typeof value === 'number') {
      max = Math.max(max, value);
      hasValue = true;
    }
  }
  
  return hasValue ? max : 0;
};

// Evaluate MIN function
export const evaluateMin = (expression: string, data: SheetData, visited: Set<string>): number => {
  const rangeStr = extractRange(expression);
  const cells = parseRange(rangeStr);
  
  let min = Number.POSITIVE_INFINITY;
  let hasValue = false;
  
  for (const cellId of cells) {
    const value = getCellValue(cellId, data, visited);
    if (typeof value === 'number') {
      min = Math.min(min, value);
      hasValue = true;
    }
  }
  
  return hasValue ? min : 0;
};

// Evaluate COUNT function
export const evaluateCount = (expression: string, data: SheetData, visited: Set<string>): number => {
  const rangeStr = extractRange(expression);
  const cells = parseRange(rangeStr);
  
  let count = 0;
  
  for (const cellId of cells) {
    const value = getCellValue(cellId, data, visited);
    if (typeof value === 'number') {
      count++;
    }
  }
  
  return count;
};

// Evaluate TRIM function
export const evaluateTrim = (expression: string, data: SheetData, visited: Set<string>): string => {
  const rangeStr = extractRange(expression);
  if (isCellReference(rangeStr)) {
    const value = getCellValue(rangeStr, data, visited);
    return value !== null ? String(value).trim() : '';
  }
  return rangeStr.trim();
};

// Evaluate UPPER function
export const evaluateUpper = (expression: string, data: SheetData, visited: Set<string>): string => {
  const rangeStr = extractRange(expression);
  if (isCellReference(rangeStr)) {
    const value = getCellValue(rangeStr, data, visited);
    return value !== null ? String(value).toUpperCase() : '';
  }
  return rangeStr.toUpperCase();
};

// Evaluate LOWER function
export const evaluateLower = (expression: string, data: SheetData, visited: Set<string>): string => {
  const rangeStr = extractRange(expression);
  if (isCellReference(rangeStr)) {
    const value = getCellValue(rangeStr, data, visited);
    return value !== null ? String(value).toLowerCase() : '';
  }
  return rangeStr.toLowerCase();
};

// Evaluate basic arithmetic expressions
export const evaluateArithmeticExpression = (expression: string, data: SheetData, visited: Set<string>): CellValue => {
  // Replace cell references with their values
  let processedExpr = expression;
  const cellRefs = extractCellReferences(expression);
  
  for (const cellRef of cellRefs) {
    const cellValue = getCellValue(cellRef, data, visited);
    if (cellValue === null) {
      processedExpr = processedExpr.replace(cellRef, '0');
    } else if (typeof cellValue === 'number') {
      processedExpr = processedExpr.replace(cellRef, cellValue.toString());
    } else {
      processedExpr = processedExpr.replace(cellRef, `"${cellValue}"`);
    }
  }
  
  try {
    // Use Function constructor to evaluate the expression
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${processedExpr})`)();
  } catch (error) {
    return '#ERROR!';
  }
};

// Find all cells that depend on the given cell
export const findDependentCells = (cellId: string, data: SheetData): string[] => {
  const dependents: string[] = [];
  
  for (const [id, cell] of Object.entries(data)) {
    if (cell.dependencies && cell.dependencies.includes(cellId)) {
      dependents.push(id);
    }
  }
  
  return dependents;
};

// Update cell dependencies
export const updateCellDependencies = (cellId: string, formula: string, data: SheetData): SheetData => {
  const newData = { ...data };
  
  if (!formula || !formula.startsWith('=')) {
    // If no formula, clear dependencies
    if (newData[cellId]) {
      newData[cellId] = { ...newData[cellId], dependencies: undefined };
    }
    return newData;
  }
  
  // Extract cell references from formula
  const dependencies = extractCellReferences(formula);
  
  // Update the cell's dependencies
  if (!newData[cellId]) {
    newData[cellId] = { value: null, formula, dependencies };
  } else {
    newData[cellId] = { ...newData[cellId], formula, dependencies };
  }
  
  return newData;
};

// Remove duplicates from a range of cells
export const removeDuplicates = (rangeStr: string, data: SheetData): SheetData => {
  const [start, end] = rangeStr.split(':');
  if (!start || !end) return data;
  
  const startCoord = parseCellId(start);
  const endCoord = parseCellId(end);
  
  if (!startCoord || !endCoord) return data;
  
  // Get all rows in the range
  const rows: { [key: number]: string[] } = {};
  for (let row = startCoord.row; row <= endCoord.row; row++) {
    rows[row] = [];
    for (let col = startCoord.col; col <= endCoord.col; col++) {
      const cellId = cellCoordToId(row, col);
      const value = data[cellId]?.value !== null ? String(data[cellId]?.value) : '';
      rows[row].push(value);
    }
  }
  
  // Find duplicate rows
  const uniqueRows = new Map<string, number>();
  const duplicateRows = new Set<number>();
  
  Object.entries(rows).forEach(([rowStr, values]) => {
    const row = parseInt(rowStr, 10);
    const rowKey = values.join('|');
    
    if (uniqueRows.has(rowKey)) {
      duplicateRows.add(row);
    } else {
      uniqueRows.set(rowKey, row);
    }
  });
  
  // Create new data without duplicate rows
  const newData = { ...data };
  
  for (const row of duplicateRows) {
    for (let col = startCoord.col; col <= endCoord.col; col++) {
      const cellId = cellCoordToId(row, col);
      delete newData[cellId];
    }
  }
  
  return newData;
};

// Find and replace text in a range of cells
export const findAndReplace = (
  rangeStr: string, 
  findText: string, 
  replaceText: string, 
  data: SheetData
): SheetData => {
  const cells = parseRange(rangeStr);
  const newData = { ...data };
  
  for (const cellId of cells) {
    const cell = data[cellId];
    if (cell && cell.value !== null) {
      const cellValue = String(cell.value);
      if (cellValue.includes(findText)) {
        const newValue = cellValue.replace(new RegExp(findText, 'g'), replaceText);
        newData[cellId] = { ...cell, value: newValue };
      }
    }
  }
  
  return newData;
};

// Validate if a value is numeric
export const isNumeric = (value: any): boolean => {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};