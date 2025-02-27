import React, { useState, useEffect } from 'react';
import { useSheetStore } from '../store/sheetStore';
import { cellCoordToId } from '../utils/cellUtils';

const FormulaBar: React.FC = () => {
  const { 
    data, 
    activeCell, 
    setCellValue 
  } = useSheetStore();
  
  const [formulaValue, setFormulaValue] = useState('');
  
  // Update formula bar when active cell changes
  useEffect(() => {
    if (activeCell) {
      const cellId = cellCoordToId(activeCell.row, activeCell.col);
      const cell = data[cellId];
      
      if (cell && cell.formula) {
        setFormulaValue(cell.formula);
      } else if (cell && cell.value !== null) {
        setFormulaValue(String(cell.value));
      } else {
        setFormulaValue('');
      }
    } else {
      setFormulaValue('');
    }
  }, [activeCell, data]);
  
  // Handle formula input change
  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulaValue(e.target.value);
  };
  
  // Handle formula submission
  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeCell) {
      let value: string | number | null = formulaValue;
      let formula: string | undefined;
      
      // Check if input is a formula
      if (formulaValue.startsWith('=')) {
        formula = formulaValue;
        // The actual value will be computed by the formula evaluator
      } else if (!isNaN(Number(formulaValue)) && formulaValue.trim() !== '') {
        // Convert to number if it's numeric
        value = Number(formulaValue);
      } else if (formulaValue.trim() === '') {
        value = null;
      }
      
      setCellValue(activeCell.row, activeCell.col, value, formula);
    }
  };
  
  // Get active cell label (e.g., A1)
  const getActiveCellLabel = () => {
    if (!activeCell) return '';
    return cellCoordToId(activeCell.row, activeCell.col);
  };
  
  return (
    <div className="flex items-center border-b border-gray-300 bg-white p-1 h-10">
      <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded px-2 mr-2 w-16 h-8">
        {getActiveCellLabel()}
      </div>
      <form className="flex-1" onSubmit={handleFormulaSubmit}>
        <input
          type="text"
          className="w-full h-8 px-2 border border-gray-300 rounded"
          value={formulaValue}
          onChange={handleFormulaChange}
          placeholder="Enter value or formula (start with =)"
        />
      </form>
    </div>
  );
};

export default FormulaBar;