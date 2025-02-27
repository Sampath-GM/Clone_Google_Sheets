import React from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';
import { useSheetStore } from '../store/sheetStore';

const Sheet: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <FormulaBar />
      <Grid />
    </div>
  );
};

export default Sheet;