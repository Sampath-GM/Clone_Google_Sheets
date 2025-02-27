import React, { useState } from 'react';
import { useSheetStore } from '../store/sheetStore';
import { cellCoordToId } from '../utils/cellUtils';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Undo,
  Redo,
  Search,
  Trash2,
  Plus
} from 'lucide-react';

const Toolbar: React.FC = () => {
  const { 
    selection, 
    activeCell, 
    data, 
    setCellStyle,
    undo,
    redo,
    applyRemoveDuplicates,
    applyFindAndReplace
  } = useSheetStore();
  
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  // Get the style of the active cell
  const getActiveCellStyle = () => {
    if (!activeCell) return {};
    
    const cellId = cellCoordToId(activeCell.row, activeCell.col);
    const cell = data[cellId];
    
    return cell?.style || {};
  };
  
  // Apply style to selected cells
  const applyStyle = (style: Partial<{ bold: boolean; italic: boolean; textAlign: 'left' | 'center' | 'right' }>) => {
    if (!selection) return;
    
    const startRow = Math.min(selection.start.row, selection.end.row);
    const endRow = Math.max(selection.start.row, selection.end.row);
    const startCol = Math.min(selection.start.col, selection.end.col);
    const endCol = Math.max(selection.start.col, selection.end.col);
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        setCellStyle(row, col, style);
      }
    }
  };
  
  // Toggle bold style
  const toggleBold = () => {
    const currentStyle = getActiveCellStyle();
    applyStyle({ bold: !currentStyle.bold });
  };
  
  // Toggle italic style
  const toggleItalic = () => {
    const currentStyle = getActiveCellStyle();
    applyStyle({ italic: !currentStyle.italic });
  };
  
  // Set text alignment
  const setTextAlign = (align: 'left' | 'center' | 'right') => {
    applyStyle({ textAlign: align });
  };
  
  // Handle find and replace
  const handleFindReplace = () => {
    if (!selection || !findText) return;
    
    const startRow = Math.min(selection.start.row, selection.end.row);
    const endRow = Math.max(selection.start.row, selection.end.row);
    const startCol = Math.min(selection.start.col, selection.end.col);
    const endCol = Math.max(selection.start.col, selection.end.col);
    
    const startCell = cellCoordToId(startRow, startCol);
    const endCell = cellCoordToId(endRow, endCol);
    
    applyFindAndReplace(`${startCell}:${endCell}`, findText, replaceText);
    setShowFindReplace(false);
  };
  
  // Handle remove duplicates
  const handleRemoveDuplicates = () => {
    if (!selection) return;
    
    const startRow = Math.min(selection.start.row, selection.end.row);
    const endRow = Math.max(selection.start.row, selection.end.row);
    const startCol = Math.min(selection.start.col, selection.end.col);
    const endCol = Math.max(selection.start.col, selection.end.col);
    
    const startCell = cellCoordToId(startRow, startCol);
    const endCell = cellCoordToId(endRow, endCol);
    
    applyRemoveDuplicates(`${startCell}:${endCell}`);
  };
  
  // Get current style for UI state
  const currentStyle = getActiveCellStyle();
  
  return (
    <div className="flex items-center border-b border-gray-300 bg-gray-100 p-1 h-10">
      <div className="flex space-x-1 mr-4">
        <button
          className={`p-1 rounded ${currentStyle.bold ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          onClick={toggleBold}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          className={`p-1 rounded ${currentStyle.italic ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          onClick={toggleItalic}
          title="Italic"
        >
          <Italic size={16} />
        </button>
      </div>
      
      <div className="flex space-x-1 mr-4">
        <button
          className={`p-1 rounded ${currentStyle.textAlign === 'left' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          onClick={() => setTextAlign('left')}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          className={`p-1 rounded ${currentStyle.textAlign === 'center' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          onClick={() => setTextAlign('center')}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          className={`p-1 rounded ${currentStyle.textAlign === 'right' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          onClick={() => setTextAlign('right')}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>
      
      <div className="flex space-x-1 mr-4">
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={undo}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={redo}
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
      
      <div className="flex space-x-1 mr-4">
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => setShowFindReplace(!showFindReplace)}
          title="Find and Replace"
        >
          <Search size={16} />
        </button>
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={handleRemoveDuplicates}
          title="Remove Duplicates"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {showFindReplace && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded w-32"
            placeholder="Find"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded w-32"
            placeholder="Replace"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleFindReplace}
          >
            Replace
          </button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;