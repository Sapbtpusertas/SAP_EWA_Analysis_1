
import React from 'react';

interface HeaderProps {
  onUpload: () => void;
  onAnalyse: () => void;
  onDownload: () => void;
  onReset: () => void;
  onGenerateSummary: () => void;
  isFileLoaded: boolean;
  isAnalyzed: boolean;
  overallStatus?: 'Green' | 'Yellow' | 'Red';
}

const Header: React.FC<HeaderProps> = ({ onUpload, onAnalyse, onDownload, onReset, onGenerateSummary, isFileLoaded, isAnalyzed, overallStatus }) => {
  
  const getStatusClass = () => {
    switch (overallStatus) {
      case 'Red': return 'bg-red-100 text-red-800';
      case 'Yellow': return 'bg-yellow-100 text-yellow-800';
      case 'Green': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-10 border-b-4 border-ewa-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ewa-purple">PRISM: Tech Arch: SAP EWA Analysis</h1>
          <p className="text-sm text-text-light">Interactive Analysis & AI Recommendations</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button onClick={onUpload} className="bg-ewa-blue text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
            Upload Report
          </button>
          <button onClick={onAnalyse} disabled={!isFileLoaded || isAnalyzed} className="bg-ewa-teal text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            Analyse
          </button>
          <button onClick={onReset} disabled={!isFileLoaded} className="bg-ewa-orange text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            Reset
          </button>
           <button onClick={onDownload} disabled={!isAnalyzed} className="bg-gray-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            Download HTML
          </button>
          <button onClick={onGenerateSummary} disabled={!isAnalyzed} className="bg-ewa-purple text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            ✨ Gen. Summary
          </button>
          {isAnalyzed && overallStatus && (
            <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${getStatusClass()}`}>
              Overall Status: {overallStatus}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;