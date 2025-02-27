import React, { useState } from 'react';
import { X } from 'lucide-react';

const FunctionHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const functions = [
    {
      name: 'SUM',
      syntax: '=SUM(range)',
      description: 'Calculates the sum of values in the specified range.',
      example: '=SUM(A1:A5)'
    },
    {
      name: 'AVERAGE',
      syntax: '=AVERAGE(range)',
      description: 'Calculates the average of values in the specified range.',
      example: '=AVERAGE(B1:B10)'
    },
    {
      name: 'MAX',
      syntax: '=MAX(range)',
      description: 'Returns the maximum value in the specified range.',
      example: '=MAX(C1:C20)'
    },
    {
      name: 'MIN',
      syntax: '=MIN(range)',
      description: 'Returns the minimum value in the specified range.',
      example: '=MIN(D1:D20)'
    },
    {
      name: 'COUNT',
      syntax: '=COUNT(range)',
      description: 'Counts the number of cells containing numerical values in the specified range.',
      example: '=COUNT(A1:D10)'
    },
    {
      name: 'TRIM',
      syntax: '=TRIM(cell)',
      description: 'Removes leading and trailing whitespace from the specified cell.',
      example: '=TRIM(A1)'
    },
    {
      name: 'UPPER',
      syntax: '=UPPER(cell)',
      description: 'Converts the text in the specified cell to uppercase.',
      example: '=UPPER(B5)'
    },
    {
      name: 'LOWER',
      syntax: '=LOWER(cell)',
      description: 'Converts the text in the specified cell to lowercase.',
      example: '=LOWER(C3)'
    }
  ];
  
  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
        onClick={() => setIsOpen(true)}
      >
        Function Help
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold">Available Functions</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6">
                {functions.map((func) => (
                  <div key={func.name} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-600">{func.name}</h3>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-2">{func.syntax}</p>
                    <p className="mt-2 text-gray-700">{func.description}</p>
                    <p className="mt-2">
                      <span className="font-semibold">Example:</span>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded">{func.example}</code>
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800">Additional Features:</h3>
                <ul className="mt-2 space-y-2 text-blue-800">
                  <li>
                    <span className="font-semibold">Remove Duplicates:</span> Select a range and click the remove duplicates button in the toolbar.
                  </li>
                  <li>
                    <span className="font-semibold">Find and Replace:</span> Click the search icon in the toolbar to find and replace text in a selected range.
                  </li>
                  <li>
                    <span className="font-semibold">Cell Formatting:</span> Use the toolbar buttons to format selected cells (bold, italic, alignment).
                  </li>
                  <li>
                    <span className="font-semibold">Row/Column Operations:</span> Right-click on row or column headers to add or delete rows/columns.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FunctionHelp;