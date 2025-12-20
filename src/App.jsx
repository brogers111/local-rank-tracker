import React, { useState, useRef } from 'react';
import { ChevronDown, FileText, Trash2, Star, TrendingUp, Download, X, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import step1Img from './assets/1.png'
import step2Img from './assets/2.png'
import step3Img from './assets/3.png'
import step4Img from './assets/4.png'

// Amsive brand colors
const colors = [
  '#22D3EE', // Cyan
  '#A78BFA', // Violet
  '#F472B6', // Pink
  '#4ADE80', // Green
  '#FACC15', // Yellow
  '#FB923C', // Orange
  '#60A5FA', // Blue
  '#F87171', // Red
];

// Tooltip component for table headers
function HeaderTooltip({ text, tooltip }) {
  const [show, setShow] = useState(false);
  return (
    <th className="text-left px-3 py-3 text-purple-200 font-semibold relative">
      <span 
        className="flex items-center gap-1 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {text}
        <HelpCircle size={14} className="text-purple-400" />
      </span>
      {show && (
        <div className="absolute z-50 top-full left-0 mt-1 p-3 bg-purple-900 border border-purple-600 rounded-lg shadow-xl w-64 text-xs text-purple-100 font-normal">
          {tooltip}
        </div>
      )}
    </th>
  );
}

// Export Modal Component
function ExportModal({ isOpen, onClose, keywords, businesses, onExport }) {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [primaryClient, setPrimaryClient] = useState('');
  const [competitors, setCompetitors] = useState(['', '', '']);

  if (!isOpen) return null;

  const toggleKeyword = (kw) => {
    setSelectedKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const selectAllKeywords = () => setSelectedKeywords([...keywords]);
  const clearAllKeywords = () => setSelectedKeywords([]);

  const updateCompetitor = (index, value) => {
    const newComps = [...competitors];
    newComps[index] = value;
    setCompetitors(newComps);
  };

  const handleExport = () => {
    onExport({ selectedKeywords, selectedBusiness, primaryClient, competitors: competitors.filter(c => c) });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-950 border border-purple-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-purple-700">
          <h2 className="text-2xl font-bold text-white">Export Report</h2>
          <button onClick={onClose} className="text-purple-400 hover:text-white"><X size={24} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Keywords Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Keywords to Export</h3>
            <div className="flex gap-2 mb-3">
              <button onClick={selectAllKeywords} className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded">Select All</button>
              <button onClick={clearAllKeywords} className="text-xs bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded">Clear All</button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-purple-900/50 p-3 rounded-lg">
              {keywords.map(kw => (
                <label key={kw} className="flex items-center gap-2 text-sm text-purple-200 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedKeywords.includes(kw)}
                    onChange={() => toggleKeyword(kw)}
                    className="rounded border-purple-600"
                  />
                  <span className="truncate">{kw}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Business Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Business View</h3>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full bg-purple-900 border border-purple-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select a business...</option>
              {businesses.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Comparison Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Comparison View</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-purple-300 mb-1 block">Primary Client</label>
                <select
                  value={primaryClient}
                  onChange={(e) => setPrimaryClient(e.target.value)}
                  className="w-full bg-purple-900 border border-purple-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select primary client...</option>
                  {businesses.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {[0, 1, 2].map(i => (
                <div key={i}>
                  <label className="text-sm text-purple-300 mb-1 block">Competitor {i + 1}</label>
                  <select
                    value={competitors[i]}
                    onChange={(e) => updateCompetitor(i, e.target.value)}
                    className="w-full bg-purple-900 border border-purple-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select competitor...</option>
                    {businesses.filter(b => b !== primaryClient && !competitors.filter((_, idx) => idx !== i).includes(b)).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-purple-700">
          <button onClick={onClose} className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-lg">Cancel</button>
          <button onClick={handleExport} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-purple-950 font-semibold rounded-lg flex items-center gap-2">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Instructions Component
function StatInstructions() {
  const steps = [
    { img: step1Img, text: 'Navigate to "Reporting" under Site Tools in the left sidebar.' },
    { img: step2Img, text: 'Click "Create Report" to start a new report.' },
    { img: step3Img, text: 'Select "Local Pack" from the report type options.' },
    { img: step4Img, text: 'Configure your report: name it, select keywords, set the date range, and click "Create".' },
  ];

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-2">How to Export from STAT</h2>
      <p className="text-purple-300 text-center mb-8">Follow these steps to export a Local Pack report from STAT</p>
      
      <div className="flex flex-col gap-8 items-center">
        {steps.map((step, idx) => (
          <div key={idx} className="w-full max-w-5xl bg-purple-900/30 border border-purple-700 rounded-xl p-6">
            <div className="bg-purple-800/50 rounded-lg overflow-hidden mb-4 shadow-lg">
              <img
                src={step.img}
                alt={`Step ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-purple-200 text-lg"><span className="font-bold text-purple-400">Step {idx + 1}:</span> {step.text}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
        <p className="text-yellow-200 text-sm"><strong>Note:</strong> Do not edit your CSV file from the STAT report. Upload it directly to this tool.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [primaryClient, setPrimaryClient] = useState('');
  const [compareCompetitor, setCompareCompetitor] = useState('');
  const [viewMode, setViewMode] = useState('keyword');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, currentTask: '' });
  const fileInputRef = useRef(null);

  const updateKeywordsAndBusinesses = (allData) => {
    const uniqueKeywords = [...new Set(allData.map(d => d.keyword))].sort();
    const uniqueBusinesses = [...new Set(allData.map(d => d.businessName))].sort();
    setKeywords(uniqueKeywords);
    setBusinesses(uniqueBusinesses);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    reader.onload = (e) => {
      const text = e.target.result;
      setUploadProgress(90);

      try {
        const lines = text.split('\n').filter(line => line.trim());
        const headerLine = lines[0];
        const headers = headerLine.split('\t').map(h => h.trim());
        
        const colIndex = {};
        headers.forEach((header, idx) => {
          colIndex[header] = idx;
        });

        const dataLines = lines.slice(1);

        const newEntries = dataLines.map((line) => {
          const parts = line.split('\t').map(v => v.trim());

          if (parts.length < headers.length) return null;

          const businessName = parts[colIndex['Business Name']] || 'Unknown';
          
          // Filter out "My Ad Center"
          if (businessName === 'My Ad Center') return null;

          const dateStr = parts[colIndex['Date']];
          let formattedDate = '';

          if (dateStr && dateStr.includes('/')) {
            const dateParts = dateStr.split('/');
            if (dateParts.length === 3) {
              const [month, day, year] = dateParts;
              formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          } else if (dateStr && dateStr.includes('-')) {
            formattedDate = dateStr;
          }

          if (!formattedDate) return null;

          const rank = parseInt(parts[colIndex['Rank']]);
          if (isNaN(rank)) return null;

          return {
            date: formattedDate,
            keyword: parts[colIndex['Keyword']] || '',
            location: parts[colIndex['Location']] || '',
            rank: rank,
            positionInPack: parseInt(parts[colIndex['Position in Pack']]) || 0,
            businessName: businessName,
            googleRating: parseFloat(parts[colIndex['Google Rating']]) || 0,
            ratingsCount: parseInt(parts[colIndex['Ratings Count']]) || 0,
            globalSearchVolume: parseInt(parts[colIndex['Global Monthly Search Volume']]) || 0,
            regionalSearchVolume: parseInt(parts[colIndex['Regional Monthly Search Volume']]) || 0,
          };
        }).filter(entry => entry !== null);

        if (newEntries.length === 0) {
          alert('No valid entries found. Please check the file format.');
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        const mergedData = [...data, ...newEntries];
        setData(mergedData);
        updateKeywordsAndBusinesses(mergedData);

        const newKeywords = [...new Set(newEntries.map(d => d.keyword).filter(k => k))];
        if (selectedKeyword === '' && newKeywords.length > 0) {
          setSelectedKeyword(newKeywords[0]);
        }

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      } catch (error) {
        alert('Error parsing file: ' + error.message);
        setIsUploading(false);
        setUploadProgress(0);
      }
    };
    reader.readAsText(file);
  };

  const getDateRange = () => {
    if (data.length === 0) return { start: '', end: '' };
    const dates = data.map(d => {
      const [year, month, day] = d.date.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }).sort((a, b) => a - b);
    return {
      start: dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const getMonths = () => {
    const monthSet = new Set(data.map(d => d.date.slice(0, 7)));
    return Array.from(monthSet).sort();
  };

  const getTotalDaysInData = () => new Set(data.map(d => d.date)).size;

  const handleClearData = () => {
    setData([]);
    setKeywords([]);
    setBusinesses([]);
    setSelectedKeyword('');
    setSelectedBusiness('');
    setPrimaryClient('');
    setCompareCompetitor('');
  };

  const handleExport = async (exportOptions) => {
    const { selectedKeywords, selectedBusiness, primaryClient, competitors } = exportOptions;

    // Calculate total pages to export
    const totalPages = selectedKeywords.length +
                      (selectedBusiness ? 1 : 0) +
                      (primaryClient && competitors.length > 0 ? competitors.length : 0);

    if (totalPages === 0) {
      alert('Please select at least one keyword, business, or comparison to export.');
      return;
    }

    setIsExporting(true);
    setExportProgress({ current: 0, total: totalPages, currentTask: 'Initializing...' });
    setShowExportModal(false);

    try {
      // Import libraries dynamically
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      let isFirstPage = true;
      let pageCount = 0;

      // Helper function to capture and add a page to PDF
      const captureAndAddPage = async (element, title) => {
        if (!element) {
          console.warn('Element not found for:', title);
          return;
        }

        // Add new page if not first
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Capture the element as canvas
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#1e1b4b', // Purple background
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });

        // Calculate dimensions to fit A4
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');

        // If image is taller than page, we may need to handle it
        if (imgHeight > pageHeight) {
          // For very tall content, fit to page height
          const scaledWidth = (canvas.width * pageHeight) / canvas.height;
          pdf.addImage(imgData, 'PNG', (imgWidth - scaledWidth) / 2, 0, scaledWidth, pageHeight);
        } else {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }

        pageCount++;
        setExportProgress({ current: pageCount, total: totalPages, currentTask: `Exported: ${title}` });
      };

      // 1. Export Keyword Views
      for (const keyword of selectedKeywords) {
        setExportProgress({ current: pageCount, total: totalPages, currentTask: `Exporting keyword: ${keyword}` });

        // Temporarily set the keyword view
        setViewMode('keyword');
        setSelectedKeyword(keyword);

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 800));

        // Find the keyword view container
        const keywordContainer = document.querySelector('[data-view="keyword"]');
        if (keywordContainer) {
          await captureAndAddPage(keywordContainer, `Keyword: ${keyword}`);
        }
      }

      // 2. Export Business View
      if (selectedBusiness) {
        setExportProgress({ current: pageCount, total: totalPages, currentTask: `Exporting business: ${selectedBusiness}` });

        setViewMode('business');
        setSelectedBusiness(selectedBusiness);

        await new Promise(resolve => setTimeout(resolve, 800));

        const businessContainer = document.querySelector('[data-view="business"]');
        if (businessContainer) {
          await captureAndAddPage(businessContainer, `Business: ${selectedBusiness}`);
        }
      }

      // 3. Export Comparison Views (one per competitor)
      if (primaryClient && competitors.length > 0) {
        setViewMode('comparison');
        setPrimaryClient(primaryClient);

        for (const competitor of competitors) {
          setExportProgress({ current: pageCount, total: totalPages, currentTask: `Exporting comparison: ${primaryClient} vs ${competitor}` });

          setCompareCompetitor(competitor);

          await new Promise(resolve => setTimeout(resolve, 800));

          const comparisonContainer = document.querySelector('[data-view="comparison"]');
          if (comparisonContainer) {
            await captureAndAddPage(comparisonContainer, `${primaryClient} vs ${competitor}`);
          }
        }
      }

      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`local-rank-report-${timestamp}.pdf`);

      setExportProgress({ current: totalPages, total: totalPages, currentTask: 'Export complete!' });

      // Show success message briefly
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress({ current: 0, total: 0, currentTask: '' });
      }, 2000);

    } catch (error) {
      console.error('Export error:', error);
      alert('Error generating PDF: ' + error.message);
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0, currentTask: '' });
    }
  };

  const dateRange = getDateRange();
  const months = getMonths();
  const totalDays = getTotalDaysInData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Local Rank Tracker</h1>
            <p className="text-purple-300">Track local keyword rankings and competitor performance</p>
          </div>
          {data.length > 0 && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-purple-950 font-semibold px-4 py-2 rounded-lg transition"
            >
              <Download size={20} />
              Export
            </button>
          )}
        </div>

        <div className='flex justify-center mb-6'>
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6 w-full max-w-4xl min-w-[280px]">
            <div className="flex justify-center items-center gap-12 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
              >
                <FileText size={20} />
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              {data.length > 0 && (
                <button
                  onClick={handleClearData}
                  className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800/50 text-red-300 px-4 py-2 rounded-lg transition"
                >
                  <Trash2 size={20} />
                  Clear Data
                </button>
              )}
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-center items-center mb-2">
                  <span className="text-sm text-purple-300">Processing file...</span>
                  <span className="text-sm font-semibold text-cyan-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-purple-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {data.length > 0 && !isUploading && (
              <div className="mt-4 text-sm text-purple-300 text-center">
                Data loaded: {data.length} entries | Date range: {dateRange.start} - {dateRange.end}
              </div>
            )}
          </div>
        </div>

        {data.length === 0 && !isUploading && <StatInstructions />}

        {data.length > 0 && (
          <>
            <div className="flex gap-4 mb-6 w-full">
              <button
                onClick={() => setViewMode('keyword')}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition ${viewMode === 'keyword' ? 'bg-cyan-500 text-purple-950' : 'bg-purple-800 text-purple-200 hover:bg-purple-700'}`}
              >
                Keyword View
              </button>
              <button
                onClick={() => setViewMode('business')}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition ${viewMode === 'business' ? 'bg-cyan-500 text-purple-950' : 'bg-purple-800 text-purple-200 hover:bg-purple-700'}`}
              >
                Business View
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition ${viewMode === 'comparison' ? 'bg-cyan-500 text-purple-950' : 'bg-purple-800 text-purple-200 hover:bg-purple-700'}`}
              >
                Comparison View
              </button>
            </div>

            {viewMode === 'keyword' && (
              <KeywordView
                selectedKeyword={selectedKeyword}
                setSelectedKeyword={setSelectedKeyword}
                keywords={keywords}
                data={data}
                months={months}
                colors={colors}
                totalDays={totalDays}
              />
            )}

            {viewMode === 'business' && (
              <BusinessView
                businesses={businesses}
                selectedBusiness={selectedBusiness}
                setSelectedBusiness={setSelectedBusiness}
                data={data}
                months={months}
                colors={colors}
                totalDays={totalDays}
              />
            )}

            {viewMode === 'comparison' && (
              <ComparisonView
                primaryClient={primaryClient}
                setPrimaryClient={setPrimaryClient}
                compareCompetitor={compareCompetitor}
                setCompareCompetitor={setCompareCompetitor}
                businesses={businesses}
                data={data}
                totalDays={totalDays}
                keywords={keywords}
              />
            )}
          </>
        )}
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        keywords={keywords}
        businesses={businesses}
        onExport={handleExport}
      />

      {/* Export Progress Overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-purple-950 border border-purple-700 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Generating PDF</h3>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-300 text-sm">{exportProgress.currentTask}</span>
                <span className="text-cyan-400 font-semibold text-sm">
                  {exportProgress.current} / {exportProgress.total}
                </span>
              </div>
              <div className="w-full bg-purple-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${exportProgress.total > 0 ? (exportProgress.current / exportProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <p className="text-purple-400 text-sm text-center">
              Please wait while we capture your reports...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonView({ primaryClient, setPrimaryClient, compareCompetitor, setCompareCompetitor, businesses, data, totalDays, keywords }) {
  return (
    <div data-view="comparison" className="space-y-6">
      <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Your Client (Primary)</label>
            <div className="relative">
              <select value={primaryClient} onChange={(e) => setPrimaryClient(e.target.value)} className="w-full bg-purple-800 border border-purple-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer">
                <option value="">Select primary client...</option>
                {businesses.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 pointer-events-none text-purple-400" size={20} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Compare To (Competitor)</label>
            <div className="relative">
              <select value={compareCompetitor} onChange={(e) => setCompareCompetitor(e.target.value)} className="w-full bg-purple-800 border border-purple-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer">
                <option value="">Select competitor...</option>
                {businesses.filter(b => b !== primaryClient).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 pointer-events-none text-purple-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {primaryClient ? (
        <ClientSummaryCard primaryClient={primaryClient} compareCompetitor={compareCompetitor} data={data} totalDays={totalDays} keywords={keywords} />
      ) : (
        <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
          <p className="text-purple-300">Select a primary client above to view performance summary</p>
        </div>
      )}
    </div>
  );
}

function ClientSummaryCard({ primaryClient, compareCompetitor, data, totalDays }) {
  const clientData = data.filter(d => d.businessName === primaryClient);
  const competitorData = compareCompetitor ? data.filter(d => d.businessName === compareCompetitor) : [];

  const clientRanks = clientData.map(d => d.rank);
  const avgRank = clientRanks.length > 0 ? (clientRanks.reduce((a, b) => a + b, 0) / clientRanks.length).toFixed(2) : 'N/A';
  
  const datesAt1 = new Set(clientData.filter(d => d.rank === 1).map(d => d.date));
  const daysAt1 = datesAt1.size;
  
  const datesInTop3 = new Set(clientData.filter(d => d.rank <= 3).map(d => d.date));
  const daysInTop3 = datesInTop3.size;

  const clientReviews = clientData.length > 0 ? Math.max(...clientData.map(d => d.ratingsCount)) : 0;
  const clientRating = clientData.length > 0 ? (clientData.reduce((a, b) => a + b.googleRating, 0) / clientData.length).toFixed(1) : 0;

  const competitorReviews = competitorData.length > 0 ? Math.max(...competitorData.map(d => d.ratingsCount)) : 0;
  const competitorRating = competitorData.length > 0 ? (competitorData.reduce((a, b) => a + b.googleRating, 0) / competitorData.length).toFixed(1) : 0;
  const competitorAvgRank = competitorData.length > 0 ? (competitorData.map(d => d.rank).reduce((a, b) => a + b, 0) / competitorData.length).toFixed(2) : 'N/A';

  const reviewGap = competitorReviews - clientReviews;
  const insights = [];
  
  if (reviewGap > 0) insights.push(`You need ${reviewGap} more reviews to match ${compareCompetitor}'s review count.`);
  else if (reviewGap < 0 && compareCompetitor) insights.push(`You have ${Math.abs(reviewGap)} more reviews than ${compareCompetitor}.`);
  if (compareCompetitor && parseFloat(clientRating) < parseFloat(competitorRating)) insights.push(`Your rating (${clientRating}⭐) is below ${compareCompetitor} (${competitorRating}⭐).`);
  if (parseFloat(avgRank) > 2 && clientReviews < 50) insights.push(`Low review count (${clientReviews}) may be limiting rankings. Aim for 50+.`);

  return (
    <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Star size={24} className="text-yellow-400" />
        {primaryClient} - Performance Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">Avg Rank</p>
          <p className="text-3xl font-bold text-white">#{avgRank}</p>
        </div>
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">Review Count</p>
          <p className="text-3xl font-bold text-yellow-400">{clientReviews}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">Days at #1</p>
          <p className="text-3xl font-bold text-cyan-400">{daysAt1}</p>
          <p className="text-purple-400 text-xs mt-1">out of {totalDays} days</p>
        </div>
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">Days in Top 3</p>
          <p className="text-3xl font-bold text-fuchsia-400">{daysInTop3}</p>
          <p className="text-purple-400 text-xs mt-1">out of {totalDays} days</p>
        </div>
      </div>

      {compareCompetitor && (
        <div className="bg-purple-800/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-purple-200 mb-3">vs {compareCompetitor}</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-purple-400 text-xs">Avg Rank</p><p className="text-lg font-bold text-white">#{avgRank} vs #{competitorAvgRank}</p></div>
            <div><p className="text-purple-400 text-xs">Rating</p><p className="text-lg font-bold text-white">{clientRating}⭐ vs {competitorRating}⭐</p></div>
            <div><p className="text-purple-400 text-xs">Reviews</p><p className="text-lg font-bold text-white">{clientReviews} vs {competitorReviews}</p></div>
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2"><TrendingUp size={16} />Actionable Insights</h4>
          <ul className="space-y-1">
            {insights.map((insight, idx) => <li key={idx} className="text-sm text-purple-200">• {insight}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function KeywordView({ selectedKeyword, setSelectedKeyword, keywords, data, months, colors, totalDays }) {
  const formatDateLabel = (date) => {
    const [year, month, day] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  const getKeywordData = () => {
    if (!selectedKeyword) return { stats: {}, timeSeriesData: [], businesses: [] };
    const keywordData = data.filter(d => d.keyword === selectedKeyword);
    const businessList = [...new Set(keywordData.map(d => d.businessName))];

    const stats = {};
    months.forEach(month => {
      const monthData = keywordData.filter(d => d.date.startsWith(month));
      const daysInMonth = new Set(monthData.map(d => d.date)).size;
      const businessGroups = {};
      monthData.forEach(entry => {
        if (!businessGroups[entry.businessName]) businessGroups[entry.businessName] = [];
        businessGroups[entry.businessName].push(entry);
      });

      stats[month] = { businesses: {}, globalSearchVolume: monthData[0]?.globalSearchVolume || 0, regionalSearchVolume: monthData[0]?.regionalSearchVolume || 0, daysInMonth };

      Object.entries(businessGroups).forEach(([business, entries]) => {
        const ranks = entries.map(e => e.rank);
        const ratings = entries.map(e => e.googleRating);
        const reviewCounts = entries.map(e => e.ratingsCount);
        const daysAppeared = entries.length;
        const packAppearanceRate = ((daysAppeared / daysInMonth) * 100).toFixed(0);
        const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
        const variance = ranks.reduce((a, b) => a + Math.pow(b - avgRank, 2), 0) / ranks.length;
        const consistencyScore = Math.max(0, 100 - (Math.sqrt(variance) * 25)).toFixed(0);

        stats[month].businesses[business] = {
          averageRank: avgRank.toFixed(2), minRank: Math.min(...ranks), maxRank: Math.max(...ranks),
          daysInTop3: entries.filter(e => e.rank <= 3).length,
          averageRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
          minRating: Math.min(...ratings), maxRating: Math.max(...ratings),
          totalReviews: Math.max(...reviewCounts), packAppearanceRate, consistencyScore,
        };
      });
    });

    const sortedData = keywordData.sort((a, b) => a.date.localeCompare(b.date));
    const dates = [...new Set(sortedData.map(d => d.date))];
    const businessLastRanks = {};
    const timeSeriesData = dates.map(date => {
      const dayData = sortedData.filter(d => d.date === date);
      const point = { date };
      Object.keys(businessLastRanks).forEach(b => { point[b] = 5; });
      dayData.forEach(entry => { point[entry.businessName] = entry.rank <= 4 ? entry.rank : 5; businessLastRanks[entry.businessName] = true; });
      return point;
    });

    return { stats, timeSeriesData, businesses: businessList };
  };

  const { stats, timeSeriesData, businesses } = getKeywordData();

  return (
    <div data-view="keyword" className="space-y-6">
      <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
        <label className="block text-sm font-medium text-purple-200 mb-3">Select Keyword</label>
        <div className="relative">
          <select value={selectedKeyword} onChange={(e) => setSelectedKeyword(e.target.value)} className="w-full bg-purple-800 border border-purple-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer">
            <option value="">Choose a keyword...</option>
            {keywords.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 pointer-events-none text-purple-400" size={20} />
        </div>
      </div>

      {selectedKeyword ? (
        <>
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-4">{selectedKeyword}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><p className="text-purple-300 text-sm">Global Monthly Search Volume</p><p className="text-2xl font-bold text-cyan-400">{stats[months[0]]?.globalSearchVolume?.toLocaleString() || 0}</p></div>
              <div><p className="text-purple-300 text-sm">Regional Monthly Search Volume</p><p className="text-2xl font-bold text-cyan-400">{stats[months[0]]?.regionalSearchVolume?.toLocaleString() || 0}</p></div>
            </div>
          </div>

          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ranking Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7c3aed" />
                  <XAxis dataKey="date" stroke="#c4b5fd" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(timeSeriesData.length / 8) - 1)} tickFormatter={formatDateLabel} />
                  <YAxis stroke="#c4b5fd" tick={{ fontSize: 12 }} reversed domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => v === 5 ? 'Out' : `#${v}`} width={40} />
                  <Tooltip contentStyle={{ backgroundColor: '#581c87', border: '1px solid #7c3aed', borderRadius: '8px' }} labelFormatter={formatDateLabel}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const sorted = [...payload].sort((a, b) => (a.value === 5 ? Infinity : a.value) - (b.value === 5 ? Infinity : b.value));
                        return (<div className="bg-purple-950 p-3 rounded border border-purple-600"><p className="text-purple-300 text-sm mb-2">{formatDateLabel(label)}</p>{sorted.map((entry, idx) => (<p key={idx} style={{ color: entry.color }} className="text-sm font-medium">{entry.name}: {entry.value === 5 ? 'Out of Top 4' : `#${entry.value}`}</p>))}</div>);
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {businesses.map((business, idx) => (<Line key={business} type="monotone" dataKey={business} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} isAnimationActive={false} />))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {months.map((month) => {
            const monthStats = stats[month];
            if (!monthStats || Object.keys(monthStats.businesses).length === 0) return null;
            const monthDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]) - 1, 1);
            const monthTitle = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const sortedBusinesses = Object.entries(monthStats.businesses).sort((a, b) => parseFloat(a[1].averageRank) - parseFloat(b[1].averageRank));

            return (
              <div key={month} className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Rankings for {monthTitle}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-purple-700">
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Business Name</th>
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Avg Rank</th>
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Range</th>
                        <HeaderTooltip text="Pack Rate" tooltip="The percentage of days this business appeared in the local pack for this keyword. Higher is better - 100% means they showed up every day." />
                        <HeaderTooltip text="Consistency" tooltip="Measures how stable the ranking position is. Calculated from rank variance - 100% means the rank never changed, lower scores indicate more volatility." />
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Avg Rating</th>
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBusinesses.map(([business, bStats]) => (
                        <tr key={business} className="border-b border-purple-800 hover:bg-purple-800/30">
                          <td className="px-3 py-3 text-white font-medium">{business}</td>
                          <td className="px-3 py-3 text-purple-200">#{bStats.averageRank}</td>
                          <td className="px-3 py-3 text-purple-300">{bStats.minRank} - {bStats.maxRank}</td>
                          <td className="px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(bStats.packAppearanceRate) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(bStats.packAppearanceRate) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>{bStats.packAppearanceRate}%</span></td>
                          <td className="px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(bStats.consistencyScore) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(bStats.consistencyScore) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>{bStats.consistencyScore}%</span></td>
                          <td className="px-3 py-3 text-purple-200">{bStats.averageRating}⭐</td>
                          <td className="px-3 py-3 text-purple-200">{bStats.totalReviews}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6"><p className="text-purple-300">Select a keyword to view its performance</p></div>
      )}
    </div>
  );
}

function BusinessView({ businesses, selectedBusiness, setSelectedBusiness, data, months, colors, totalDays }) {
  const formatDateLabel = (date) => {
    const [year, month, day] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  const getBusinessData = () => {
    if (!selectedBusiness) return { keywords: [], timeSeriesData: [], stats: {} };
    const businessData = data.filter(d => d.businessName === selectedBusiness);
    const keywordsForBusiness = [...new Set(businessData.map(d => d.keyword))];
    const sortedData = businessData.sort((a, b) => a.date.localeCompare(b.date));
    const dates = [...new Set(sortedData.map(d => d.date))];
    const keywordLastSeen = {};
    const chartData = dates.map(date => {
      const point = { date };
      const dayData = sortedData.filter(d => d.date === date);
      Object.keys(keywordLastSeen).forEach(kw => { point[kw] = 5; });
      dayData.forEach(entry => { point[entry.keyword] = entry.rank <= 4 ? entry.rank : 5; keywordLastSeen[entry.keyword] = true; });
      return point;
    });

    const stats = {};
    months.forEach(month => {
      const monthData = businessData.filter(d => d.date.startsWith(month));
      const daysInMonth = new Set(data.filter(d => d.date.startsWith(month)).map(d => d.date)).size;
      stats[month] = {};
      keywordsForBusiness.forEach(keyword => {
        const keywordData = monthData.filter(d => d.keyword === keyword);
        if (keywordData.length > 0) {
          const ranks = keywordData.map(e => e.rank);
          const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
          const variance = ranks.reduce((a, b) => a + Math.pow(b - avgRank, 2), 0) / ranks.length;
          stats[month][keyword] = {
            averageRank: avgRank.toFixed(2), minRank: Math.min(...ranks), maxRank: Math.max(...ranks),
            daysInTop3: keywordData.filter(e => e.rank <= 3).length,
            packAppearanceRate: ((keywordData.length / daysInMonth) * 100).toFixed(0),
            consistencyScore: Math.max(0, 100 - (Math.sqrt(variance) * 25)).toFixed(0),
          };
        }
      });
    });
    return { keywords: keywordsForBusiness, timeSeriesData: chartData, stats };
  };

  const { keywords: businessKeywords, timeSeriesData, stats } = getBusinessData();

  return (
    <div data-view="business" className="space-y-6">
      <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
        <label className="block text-sm font-medium text-purple-200 mb-3">Select Business</label>
        <div className="relative">
          <select value={selectedBusiness} onChange={(e) => setSelectedBusiness(e.target.value)} className="w-full bg-purple-800 border border-purple-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer">
            <option value="">Choose a business...</option>
            {businesses.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 pointer-events-none text-purple-400" size={20} />
        </div>
      </div>

      {selectedBusiness ? (
        <>
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{selectedBusiness}</h2>
            <p className="text-purple-300">Tracking across {businessKeywords.length} keywords</p>
          </div>

          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ranking Across Keywords</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7c3aed" />
                  <XAxis dataKey="date" stroke="#c4b5fd" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(timeSeriesData.length / 8) - 1)} tickFormatter={formatDateLabel} />
                  <YAxis stroke="#c4b5fd" tick={{ fontSize: 12 }} reversed domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => v === 5 ? 'Out' : `#${v}`} width={40} />
                  <Tooltip contentStyle={{ backgroundColor: '#581c87', border: '1px solid #7c3aed', borderRadius: '8px' }} labelFormatter={formatDateLabel}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const sorted = [...payload].sort((a, b) => (a.value === 5 ? Infinity : a.value) - (b.value === 5 ? Infinity : b.value));
                        return (<div className="bg-purple-950 p-3 rounded border border-purple-600"><p className="text-purple-300 text-sm mb-2">{formatDateLabel(label)}</p>{sorted.map((entry, idx) => (<p key={idx} style={{ color: entry.color }} className="text-sm font-medium">{entry.name}: {entry.value === 5 ? 'Out of Top 4' : `#${entry.value}`}</p>))}</div>);
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {businessKeywords.slice(0, 8).map((keyword, idx) => (<Line key={keyword} type="monotone" dataKey={keyword} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} isAnimationActive={false} />))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {months.map((month) => {
            const monthStats = stats[month];
            if (!monthStats || Object.keys(monthStats).length === 0) return null;
            const monthDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]) - 1, 1);
            const monthTitle = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const sortedKeywords = Object.entries(monthStats).sort((a, b) => parseFloat(a[1].averageRank) - parseFloat(b[1].averageRank));

            return (
              <div key={month} className="bg-purple-900/50 border border-purple-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Performance in {monthTitle}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-purple-700">
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Keyword</th>
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Avg Rank</th>
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Range</th>
                        <HeaderTooltip text="Pack Rate" tooltip="The percentage of days this business appeared in the local pack for this keyword. Higher is better - 100% means they showed up every day." />
                        <HeaderTooltip text="Consistency" tooltip="Measures how stable the ranking position is. Calculated from rank variance - 100% means the rank never changed, lower scores indicate more volatility." />
                        <th className="text-left px-3 py-3 text-purple-200 font-semibold">Days in Top 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedKeywords.map(([keyword, kStats]) => (
                        <tr key={keyword} className="border-b border-purple-800 hover:bg-purple-800/30">
                          <td className="px-3 py-3 text-white font-medium">{keyword}</td>
                          <td className="px-3 py-3 text-purple-200">#{kStats.averageRank}</td>
                          <td className="px-3 py-3 text-purple-300">{kStats.minRank} - {kStats.maxRank}</td>
                          <td className="px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(kStats.packAppearanceRate) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(kStats.packAppearanceRate) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>{kStats.packAppearanceRate}%</span></td>
                          <td className="px-3 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(kStats.consistencyScore) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(kStats.consistencyScore) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>{kStats.consistencyScore}%</span></td>
                          <td className="px-3 py-3 text-purple-200">{kStats.daysInTop3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-6"><p className="text-purple-300">Select a business to view its performance</p></div>
      )}
    </div>
  );
}