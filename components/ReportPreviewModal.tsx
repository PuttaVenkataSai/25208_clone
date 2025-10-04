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
      document.body.classList.remove('is-printing');
    };
  }, []);

  const handlePrint = () => {
    document.body.classList.add('is-printing');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 p-4 overflow-y-auto" id="modal-wrapper">
      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 1.5cm;
            }

            body {
              background: white !important;
            }

            .report-controls {
              display: none !important;
            }

            #modal-wrapper {
              position: static !important;
              background: white !important;
              padding: 0 !important;
            }

            .printable-modal-box {
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            #printable-area .overflow-x-auto {
              overflow: visible !important;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9pt;
              page-break-inside: auto;
            }

            thead {
              display: table-header-group;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 6px;
            }
          }
        `}
      </style>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-auto my-8 printable-modal-box">

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

        <div id="printable-area" className="p-8">
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
