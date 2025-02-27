import React, { useRef } from 'react';
import { useSheetStore } from '../store/sheetStore';
import { colIndexToLabel } from '../utils/cellUtils';

interface ColumnHeaderProps {
  index: number;
  width?: number;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ index, width }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  const { 
    selection, 
    setSelection, 
    resizeColumn,
    addColumn,
    deleteColumn
  } = useSheetStore();
  
  // Check if this column is selected
  const isSelected = selection && 
    index >= Math.min(selection.start.col, selection.end.col) && 
    index <= Math.max(selection.start.col, selection.end.col);
  
  // Handle column selection
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey && selection) {
      // Extend selection
      setSelection({
        ...selection,
        end: { ...selection.end, col: index }
      });
    } else {
      // Select entire column
      setSelection({
        start: { row: 0, col: index },
        end: { row: 999, col: index }
      });
    }
  };
  
  // Handle column resize
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const startX = e.clientX;
    const startWidth = width || 100;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      resizeColumn(index, newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'absolute bg-white shadow-lg rounded-md z-50 py-1';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    
    // Add menu items
    const insertBefore = document.createElement('div');
    insertBefore.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    insertBefore.textContent = 'Insert column before';
    insertBefore.onclick = () => {
      addColumn(index);
      document.body.removeChild(menu);
    };
    
    const insertAfter = document.createElement('div');
    insertAfter.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    insertAfter.textContent = 'Insert column after';
    insertAfter.onclick = () => {
      addColumn(index + 1);
      document.body.removeChild(menu);
    };
    
    const deleteCol = document.createElement('div');
    deleteCol.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    deleteCol.textContent = 'Delete column';
    deleteCol.onclick = () => {
      deleteColumn(index);
      document.body.removeChild(menu);
    };
    
    menu.appendChild(insertBefore);
    menu.appendChild(insertAfter);
    menu.appendChild(deleteCol);
    
    // Add menu to body
    document.body.appendChild(menu);
    
    // Remove menu when clicking outside
    const handleClickOutside = () => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      document.removeEventListener('click', handleClickOutside);
    };
    
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  };
  
  return (
    <div
      ref={headerRef}
      className={`border-r border-b border-gray-300 bg-gray-100 flex items-center justify-center select-none relative ${
        isSelected ? 'bg-blue-100' : ''
      }`}
      style={{
        width: width || 100,
        height: 25,
        minWidth: width || 100
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {colIndexToLabel(index)}
      
      {/* Column resizer */}
      <div
        ref={resizerRef}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
};

export default ColumnHeader;