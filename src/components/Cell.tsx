import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSheetStore } from '../store/sheetStore';
import { cellCoordToId, getCellValue } from '../utils/cellUtils';

interface CellProps {
  row: number;
  col: number;
  width?: number;
  height?: number;
}

const Cell: React.FC<CellProps> = ({ row, col, width, height }) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const cellId = cellCoordToId(row, col);
  const {
    data,
    selection,
    activeCell,
    editingCell,
    dragState,
    setCellValue,
    setSelection,
    setActiveCell,
    setEditingCell,
    clearEditingCell,
    setDragState
  } = useSheetStore();
  
  const cell = data[cellId];
  const cellValue = cell ? getCellValue(cellId, data) : null;
  const cellFormula = cell?.formula || '';
  const cellStyle = cell?.style || {};
  
  const [inputValue, setInputValue] = useState('');
  
  // Check if this cell is selected
  const isSelected = selection && 
    row >= Math.min(selection.start.row, selection.end.row) && 
    row <= Math.max(selection.start.row, selection.end.row) && 
    col >= Math.min(selection.start.col, selection.end.col) && 
    col <= Math.max(selection.start.col, selection.end.col);
  
  // Check if this cell is the active cell
  const isActive = activeCell && activeCell.row === row && activeCell.col === col;
  
  // Check if this cell is being edited
  const isEditing = editingCell && editingCell.row === row && editingCell.col === col;
  
  // Update input value when cell becomes editable
  useEffect(() => {
    if (isEditing) {
      setInputValue(cellFormula || (cellValue !== null ? String(cellValue) : ''));
      // Focus and select all text in the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isEditing, cellValue, cellFormula]);
  
  // Handle mouse down on cell
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Start cell selection
    if (!e.shiftKey) {
      setSelection({
        start: { row, col },
        end: { row, col },
        active: { row, col }
      });
      setActiveCell(row, col);
    } else if (selection) {
      // Extend selection with shift key
      setSelection({
        ...selection,
        end: { row, col }
      });
    }
    
    // Start drag operation
    setDragState({
      isDragging: true,
      startCell: { row, col },
      type: 'move'
    });
    
    // If double-clicked, enter edit mode
    if (e.detail === 2) {
      setEditingCell(row, col);
    }
  };
  
  // Handle mouse enter during drag
  const handleMouseEnter = () => {
    if (dragState.isDragging && dragState.type === 'move') {
      setDragState({
        ...dragState,
        endCell: { row, col }
      });
      
      if (selection) {
        setSelection({
          ...selection,
          end: { row, col }
        });
      }
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle key down in input
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      clearEditingCell();
    }
  };
  
  // Handle blur on input
  const handleInputBlur = () => {
    finishEditing();
  };
  
  // Finish editing and update cell value
  const finishEditing = () => {
    if (isEditing) {
      let value: string | number | null = inputValue;
      let formula: string | undefined;
      
      // Check if input is a formula
      if (inputValue.startsWith('=')) {
        formula = inputValue;
        // The actual value will be computed by the formula evaluator
      } else if (!isNaN(Number(inputValue)) && inputValue.trim() !== '') {
        // Convert to number if it's numeric
        value = Number(inputValue);
      } else if (inputValue.trim() === '') {
        value = null;
      }
      
      setCellValue(row, col, value, formula);
      clearEditingCell();
    }
  };
  
  // Render cell content
  const renderCellContent = () => {
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          className="w-full h-full outline-none border-none p-1"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
        />
      );
    }
    
    return (
      <div 
        className="w-full h-full overflow-hidden text-ellipsis whitespace-nowrap p-1"
        style={{
          fontWeight: cellStyle.bold ? 'bold' : 'normal',
          fontStyle: cellStyle.italic ? 'italic' : 'normal',
          fontSize: cellStyle.fontSize ? `${cellStyle.fontSize}px` : 'inherit',
          color: cellStyle.color || 'inherit',
          backgroundColor: cellStyle.backgroundColor || 'transparent',
          textAlign: cellStyle.textAlign || 'left'
        }}
      >
        {cellValue !== null ? String(cellValue) : ''}
      </div>
    );
  };
  
  return (
    <div
      ref={cellRef}
      className={classNames(
        'border-r border-b border-gray-300 select-none relative',
        {
          'bg-blue-100': isSelected && !isActive,
          'bg-blue-200': isActive,
          'z-10': isActive || isEditing
        }
      )}
      style={{
        width: width || 100,
        height: height || 25,
        minWidth: width || 100,
        minHeight: height || 25
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      {renderCellContent()}
      
      {/* Fill handle (bottom-right corner) */}
      {isActive && !isEditing && (
        <div 
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-crosshair"
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragState({
              isDragging: true,
              startCell: { row, col },
              type: 'fill'
            });
          }}
        />
      )}
    </div>
  );
};

export default Cell;