import React, { useEffect } from 'react';
import Sheet from './components/Sheet';
import FunctionHelp from './components/FunctionHelp';
import { useSheetStore } from './store/sheetStore';

function App() {
  const { setCellValue } = useSheetStore();
  
  // Initialize with some example data
  useEffect(() => {
    // Add some sample data for demonstration
    setCellValue(0, 0, 'Name', undefined);
    setCellValue(0, 1, 'Age', undefined);
    setCellValue(0, 2, 'City', undefined);
    setCellValue(0, 3, 'Score', undefined);
    
    setCellValue(1, 0, 'John Doe', undefined);
    setCellValue(1, 1, 28, undefined);
    setCellValue(1, 2, 'New York', undefined);
    setCellValue(1, 3, 85, undefined);
    
    setCellValue(2, 0, 'Jane Smith', undefined);
    setCellValue(2, 1, 32, undefined);
    setCellValue(2, 2, 'Los Angeles', undefined);
    setCellValue(2, 3, 92, undefined);
    
    setCellValue(3, 0, 'Bob Johnson', undefined);
    setCellValue(3, 1, 45, undefined);
    setCellValue(3, 2, 'Chicago', undefined);
    setCellValue(3, 3, 78, undefined);
    
    setCellValue(4, 0, 'Alice Brown', undefined);
    setCellValue(4, 1, 24, undefined);
    setCellValue(4, 2, 'Miami', undefined);
    setCellValue(4, 3, 88, undefined);
    
    // Add some formulas
    setCellValue(6, 0, 'Sum:', undefined);
    setCellValue(6, 3, null, '=SUM(D2:D5)');
    
    setCellValue(7, 0, 'Average:', undefined);
    setCellValue(7, 3, null, '=AVERAGE(D2:D5)');
    
    setCellValue(8, 0, 'Max:', undefined);
    setCellValue(8, 3, null, '=MAX(D2:D5)');
    
    setCellValue(8, 0, 'Min:', undefined);
    setCellValue(8, 3, null, '=MIN(D2:D5)');
    
    setCellValue(9, 0, 'Count:', undefined);
    setCellValue(9, 3, null, '=COUNT(D2:D5)');
    
    // Data quality function examples
    setCellValue(11, 0, 'Original Text:', undefined);
    setCellValue(11, 1, '  Trimmed Text  ', undefined);
    
    setCellValue(12, 0, 'Trimmed:', undefined);
    setCellValue(12, 1, null, '=TRIM(B12)');
    
    setCellValue(13, 0, 'Uppercase:', undefined);
    setCellValue(13, 1, null, '=UPPER(B12)');
    
    setCellValue(14, 0, 'Lowercase:', undefined);
    setCellValue(14, 1, null, '=LOWER(B12)');
  }, [setCellValue]);
  
  return (
    <div className="App">
      <Sheet />
      <FunctionHelp />
    </div>
  );
}

export default App;