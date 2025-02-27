import React, { useEffect, useRef } from 'react';
import Cell from './Cell';
import RowHeader from './RowHeader';
import ColumnHeader from './ColumnHeader';
import CornerHeader from './CornerHeader';
import { useSheetStore } from '../store/sheetStore';

const Grid: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  
  const { 
    dimensions, 
    columnWidths, 
    rowHeights, 
    dragState, 
    setDragState, 
    setSelection 
  } = useSheetStore();
  
  // Handle mouse up to end drag operations
  useEffect(() => {
    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState({ isDragging: false, type: 'none' });
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, setDragState]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if we're editing a cell or if modifier keys are pressed
      if (e.target instanceof HTMLInputElement || e.ctrlKey || e.metaKey) {
        return;
      }
      
      if (e.key === 'Escape') {
        setSelection(null);
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setSelection]);
  
  // Render grid cells
  const renderCells = () => {
    const cells = [];
    
    // Render corner header
    cells.push(<CornerHeader key="corner" />);
    
    // Render column headers
    for (let col = 0; col < dimensions.cols; col++) {
      cells.push(
        <ColumnHeader 
          key={`col-${col}`} 
          index={col} 
          width={columnWidths[col]} 
        />
      );
    }
    
    // Render rows
    for (let row = 0; row < dimensions.rows; row++) {
      // Render row header
      cells.push(
        <RowHeader 
          key={`row-${row}`} 
          index={row} 
          height={rowHeights[row]} 
        />
      );
      
      // Render cells in this row
      for (let col = 0; col < dimensions.cols; col++) {
        cells.push(
          <Cell 
            key={`cell-${row}-${col}`} 
            row={row} 
            col={col} 
            width={columnWidths[col]} 
            height={rowHeights[row]} 
          />
        );
      }
    }
    
    return cells;
  };
  
  return (
    <div 
      ref={gridRef}
      className="flex-1 overflow-auto"
    >
      <div 
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `50px ${Array(dimensions.cols)
            .fill(0)
            .map((_, i) => `${columnWidths[i] || 100}px`)
            .join(' ')}`,
          gridAutoRows: 'min-content'
        }}
      >
        {renderCells()}
      </div>
    </div>
  );
};

export default Grid;