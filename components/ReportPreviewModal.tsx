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
    // This effect adds an event listener to clean up after printing is done.
    const handleAfterPrint = () => {
      document.body.classList.remove('is-printing');
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // The cleanup function runs if the component is unmounted.
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.classList.remove('is-printing'); // Ensure cleanup on close
    };
  }, []);

  const handlePrint = () => {
    // Add a class to the body to trigger our print-specific CSS rules.
    document.body.classList.add('is-printing');
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" id="modal-wrapper">
        <style>
        {`
          @media print {
            /* 1. Use the body class for reliable control */
            body.is-printing {
              background: white !important;
            }

            /* 2. Hide specific application UI elements. These selectors target the main layout components. */
            body.is-printing header,
            body.is-printing footer,
            body.is-printing .lg\\:relative, /* Targets the Sidebar container */
            body.is-printing .report-controls {
              display: none !important;
            }

            /* 3. Reset the entire ancestor tree of the modal to be a simple block element */
            body.is-printing,
            body.is-printing #root,
            body.is-printing #root > div, /* Layout div */
            body.is-printing main,
            body.is-printing #modal-wrapper,
            body.is-printing .printable-modal-box,
            body.is-printing #printable-area {
              display: block !important;
              position: static !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
            }
            
            /* 4. Fine-tune table and text for printing */
            .is-printing table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: auto;
            }
            .is-printing thead {
              display: table-header-group; /* Ensures header repeats on each page */
            }
            .is-printing tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            .is-printing th, .is-printing td {
              border: 1px solid #ddd !important;
              padding: 8px;
            }
            
            /* Ensure all text is black for readability */
            .is-printing * {
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .is-printing .text-sail-blue {
                color: #003366 !important;
            }
            .is-printing .text-sail-orange {
                color: #FF6600 !important;
            }

            /* Define the page layout */
            @page {
              size: A4;
              margin: 2cm;
            }
          }
        `}
        </style>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl flex flex-col h-[90vh] printable-modal-box">
        <div id="printable-area" className="flex-grow p-8 overflow-y-auto">
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

        {/* Action Buttons */}
        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end items-center gap-3 report-controls">
            <button onClick={onClose} className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                <X size={16} className="mr-2"/>
                Close
            </button>
            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-sail-blue text-white rounded-md hover:bg-blue-800 transition-colors">
                <Printer size={16} className="mr-2"/>
                Print
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
