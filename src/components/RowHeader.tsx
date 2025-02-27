import React, { useRef } from 'react';
import { useSheetStore } from '../store/sheetStore';

interface RowHeaderProps {
  index: number;
  height?: number;
}

const RowHeader: React.FC<RowHeaderProps> = ({ index, height }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  const { 
    selection, 
    setSelection, 
    resizeRow,
    addRow,
    deleteRow
  } = useSheetStore();
  
  // Check if this row is selected
  const isSelected = selection && 
    index >= Math.min(selection.start.row, selection.end.row) && 
    index <= Math.max(selection.start.row, selection.end.row);
  
  // Handle row selection
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey && selection) {
      // Extend selection
      setSelection({
        ...selection,
        end: { ...selection.end, row: index }
      });
    } else {
      // Select entire row
      setSelection({
        start: { row: index, col: 0 },
        end: { row: index, col: 999 }
      });
    }
  };
  
  // Handle row resize
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const startY = e.clientY;
    const startHeight = height || 25;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(20, startHeight + (moveEvent.clientY - startY));
      resizeRow(index, newHeight);
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
    const insertAbove = document.createElement('div');
    insertAbove.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    insertAbove.textContent = 'Insert row above';
    insertAbove.onclick = () => {
      addRow(index);
      document.body.removeChild(menu);
    };
    
    const insertBelow = document.createElement('div');
    insertBelow.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    insertBelow.textContent = 'Insert row below';
    insertBelow.onclick = () => {
      addRow(index + 1);
      document.body.removeChild(menu);
    };
    
    const deleteRowItem = document.createElement('div');
    deleteRowItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    deleteRowItem.textContent = 'Delete row';
    deleteRowItem.onclick = () => {
      deleteRow(index);
      document.body.removeChild(menu);
    };
    
    menu.appendChild(insertAbove);
    menu.appendChild(insertBelow);
    menu.appendChild(deleteRowItem);
    
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
        width: 50,
        height: height || 25,
        minHeight: height || 25
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {index + 1}
      
      {/* Row resizer */}
      <div
        ref={resizerRef}
        className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-500"
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
};

export default RowHeader;