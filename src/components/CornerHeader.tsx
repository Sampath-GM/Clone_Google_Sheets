import React from 'react';
import { useSheetStore } from '../store/sheetStore';

const CornerHeader: React.FC = () => {
  const { setSelection } = useSheetStore();
  
  // Handle click to select all cells
  const handleClick = () => {
    setSelection({
      start: { row: 0, col: 0 },
      end: { row: 999, col: 999 }
    });
  };
  
  return (
    <div
      className="border-r border-b border-gray-300 bg-gray-200 flex items-center justify-center select-none"
      style={{ width: 50, height: 25 }}
      onClick={handleClick}
    />
  );
};

export default CornerHeader;