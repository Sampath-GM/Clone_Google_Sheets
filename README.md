# Google Sheets Clone

A web application that mimics the user interface and core functionalities of Google Sheets, with a focus on mathematical and data quality functions, data entry, and key UI interactions.

## Data Structures and Tech Stack

### Tech Stack

- **React**: For building the user interface components
- **TypeScript**: For type safety and better developer experience
- **Zustand**: For state management with immer middleware for immutable updates
- **Tailwind CSS**: For styling the UI components
- **Lucide React**: For icons

### Data Structures

The application uses several key data structures to manage the spreadsheet:

1. **SheetData**: A key-value object where keys are cell IDs (e.g., "A1", "B2") and values are Cell objects.

2. **Cell**: Represents a single cell in the spreadsheet with the following properties:
   - `value`: The displayed value (string, number, or null)
   - `formula`: Optional formula string (e.g., "=SUM(A1:A5)")
   - `style`: Optional styling information
   - `dependencies`: Array of cell IDs that this cell depends on

3. **Selection**: Represents the currently selected range of cells:
   - `start`: The starting cell coordinates
   - `end`: The ending cell coordinates
   - `active`: The active cell within the selection

4. **DragState**: Tracks the current drag operation:
   - `isDragging`: Boolean indicating if a drag is in progress
   - `startCell`: The cell where the drag started
   - `endCell`: The current cell during the drag
   - `type`: The type of drag operation ('fill', 'move', 'resize', or 'none')

### Why This Approach

1. **Cell-Based Data Model**: The spreadsheet data is stored as a sparse object map rather than a 2D array. This approach:
   - Efficiently handles large spreadsheets with mostly empty cells
   - Makes it easier to track cell dependencies for formula evaluation
   - Simplifies operations like inserting/deleting rows and columns

2. **Formula Evaluation System**: The application uses a recursive evaluation system that:
   - Parses formulas to extract cell references
   - Builds a dependency graph between cells
   - Detects and handles circular references
   - Re-evaluates dependent cells when source cells change

3. **Immutable State Updates**: Using Zustand with immer middleware provides:
   - Predictable state updates
   - Easy implementation of undo/redo functionality
   - Better performance through selective re-rendering

4. **Component Architecture**: The UI is divided into specialized components:
   - `Grid`: Manages the overall grid layout
   - `Cell`: Handles individual cell rendering and interaction
   - `RowHeader`/`ColumnHeader`: Manage row/column operations
   - `FormulaBar`: Provides formula editing
   - `Toolbar`: Contains formatting and function controls

## Features

1. **Spreadsheet Interface**:
   - Google Sheets-like UI with toolbar, formula bar, and cell structure
   - Drag functionality for selections
   - Cell dependencies with automatic updates
   - Cell formatting (bold, italic, alignment)
   - Add, delete, and resize rows and columns

2. **Mathematical Functions**:
   - SUM: Calculates the sum of a range of cells
   - AVERAGE: Calculates the average of a range of cells
   - MAX: Returns the maximum value from a range of cells
   - MIN: Returns the minimum value from a range of cells
   - COUNT: Counts the number of cells containing numerical values

3. **Data Quality Functions**:
   - TRIM: Removes leading and trailing whitespace
   - UPPER: Converts text to uppercase
   - LOWER: Converts text to lowercase
   - REMOVE_DUPLICATES: Removes duplicate rows from a selected range
   - FIND_AND_REPLACE: Finds and replaces text within a range

4. **Data Entry and Validation**:
   - Support for various data types (numbers, text)
   - Basic data validation for numeric cells

5. **Additional Features**:
   - Undo/redo functionality
   - Cell reference support in formulas
   - Context menus for row and column operations
   - Function help panel