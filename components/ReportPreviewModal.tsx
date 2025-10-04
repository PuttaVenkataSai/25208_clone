import React, { FC, useEffect } from 'react';
import { Sailboat, Printer, X } from 'lucide-react';

interface ReportPreviewModalProps {
  title: string;
  filtersUsed: { [key: string]: string };
  columns: string[];
  rows: (string | number)[][];
  summary: { [key: string]: string | number };
  onClose: () => void;
}

const ReportPreviewModal: FC<ReportPreviewModalProps> = ({ title, filtersUsed, columns, rows, summary, onClose }) => {

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('is-printing');
    };
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.classList.remove('is-printing'); // Cleanup on unmount
    };
  }, []);

  const handlePrint = () => {
    document.body.classList.add('is-printing');
    window.print();
  };

  return (
    // The wrapper is now the primary scroll container for tall modals
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 p-4 overflow-y-auto" id="modal-wrapper">
      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 1.5cm;
            }

            body.is-printing {
              background: #fff !important;
            }

            /* Hide all application chrome */
            body.is-printing header,
            body.is-printing footer,
            body.is-printing .fixed.lg\\:relative, /* Sidebar container */
            body.is-printing .report-controls {
              display: none !important;
            }

            /* Reset the entire DOM tree up to the modal */
            body.is-printing,
            body.is-printing #root,
            body.is-printing #root > div,
            body.is-printing main,
            body.is-printing #modal-wrapper {
              display: block !important;
              position: static !important;
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
              background: transparent !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            
            /* Make the modal content the only visible element */
            body.is-printing .printable-modal-box {
              display: block !important;
              width: 100% !important;
              max-width: none !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              border-radius: 0 !important;
            }
            
            body.is-printing #printable-area,
            body.is-printing #printable-area .overflow-x-auto {
                overflow: visible !important;
            }
            
            /* Fine-tune table for printing */
            .is-printing table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9pt;
            }
            .is-printing thead {
              display: table-header-group; /* Repeat header on each page */
            }
            .is-printing tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            .is-printing th, .is-printing td {
              border: 1px solid #ccc !important;
              padding: 6px;
              white-space: normal;
              word-wrap: break-word;
            }
            
            .is-printing * {
              color: #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* The modal box no longer has a fixed height. It will grow with content. */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-auto my-8 printable-modal-box">
        
        {/* Action Buttons - These will be hidden on print */}
        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 z-10 report-controls">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h2>
            <div className="flex items-center gap-3">
                 <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-sail-blue text-white rounded-md hover:bg-blue-800 transition-colors">
                    <Printer size={16} className="mr-2"/>
                    Print
                </button>
                 <button onClick={onClose} className="flex items-center p-2 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500">
                    <X size={20}/>
                </button>
            </div>
        </div>
        
        {/* The printable area no longer scrolls. */}
        <div id="printable-area" className="p-8">
          {/* Report Header */}
          <header className="border-b-2 border-gray-800 dark:border-gray-400 pb-4 mb-6 text-gray-800 dark:text-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sailboat size={40} className="text-sail-orange" />
                <div>
                  <h1 className="text-2xl font-bold text-sail-blue">RakeNet</h1>
                  <p className="text-sm">Logistics Decision Support System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{title}</p>
                <p className="text-xs">Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>
             <div className="text-xs mt-4 text-gray-500 dark:text-gray-400">
              <strong>Filters Applied:</strong> {Object.entries(filtersUsed).map(([key, value]) => `${key}: ${value}`).join(' | ')}
            </div>
          </header>

          {/* Report Body (Table) */}
          <main>
            {rows.length > 0 ? (
                // This div handles wide tables on-screen without breaking the layout
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {columns.map(header => (
                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{cell}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400">No data available for the selected filters.</p>
                </div>
            )}
          </main>
          
          {/* Report Footer (Summary) */}
          {Object.keys(summary).length > 0 && (
             <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {Object.entries(summary).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-gray-500 dark:text-gray-400">{key}</p>
                      <p className="font-bold text-lg text-sail-blue dark:text-sail-orange">{value}</p>
                    </div>
                  ))}
                </div>
              </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
