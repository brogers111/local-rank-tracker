import React, { useState, useRef } from 'react';
import { ChevronDown, FileText, Trash2, Star, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LocalRankTracker() {
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
  const fileInputRef = useRef(null);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

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

        const newEntries = dataLines.map((line, idx) => {
          const parts = line.split('\t').map(v => v.trim());

          if (parts.length < headers.length) return null;

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
            businessName: parts[colIndex['Business Name']] || 'Unknown',
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

  const getTotalDaysInData = () => {
    return new Set(data.map(d => d.date)).size;
  };

  const handleClearData = () => {
    setData([]);
    setKeywords([]);
    setBusinesses([]);
    setSelectedKeyword('');
    setSelectedBusiness('');
    setPrimaryClient('');
    setCompareCompetitor('');
  };

  const dateRange = getDateRange();
  const months = getMonths();
  const totalDays = getTotalDaysInData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Local Rank Tracker</h1>
          <p className="text-slate-400">Track keyword rankings and competitor performance</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
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
                className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition ml-auto"
              >
                <Trash2 size={20} />
                Clear Data
              </button>
            )}
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Processing file...</span>
                <span className="text-sm font-semibold text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {data.length > 0 && !isUploading && (
            <div className="mt-4 text-sm text-slate-400">
              Data loaded: {data.length} entries | Date range: {dateRange.start} - {dateRange.end}
            </div>
          )}
        </div>

        {data.length > 0 && (
          <>
            {/* View Mode Toggle */}
            <div className="flex gap-4 mb-6 w-full">
              <button
                onClick={() => setViewMode('keyword')}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition ${viewMode === 'keyword' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Keyword View
              </button>
              <button
                onClick={() => setViewMode('business')}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition ${viewMode === 'business' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Business View
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition ${viewMode === 'comparison' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
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
    </div>
  );
}

function ComparisonView({ primaryClient, setPrimaryClient, compareCompetitor, setCompareCompetitor, businesses, data, totalDays, keywords }) {
  return (
    <div className="space-y-6">
      {/* Client & Competitor Selection */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Client (Primary)</label>
            <div className="relative">
              <select
                value={primaryClient}
                onChange={(e) => setPrimaryClient(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer"
              >
                <option value="">Select primary client...</option>
                {businesses.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 pointer-events-none text-slate-400" size={20} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Compare To (Competitor)</label>
            <div className="relative">
              <select
                value={compareCompetitor}
                onChange={(e) => setCompareCompetitor(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer"
              >
                <option value="">Select competitor...</option>
                {businesses.filter(b => b !== primaryClient).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 pointer-events-none text-slate-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Client Summary Card */}
      {primaryClient ? (
        <ClientSummaryCard
          primaryClient={primaryClient}
          compareCompetitor={compareCompetitor}
          data={data}
          totalDays={totalDays}
          keywords={keywords}
        />
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400">Select a primary client above to view performance summary</p>
        </div>
      )}
    </div>
  );
}

function ClientSummaryCard({ primaryClient, compareCompetitor, data, totalDays, keywords }) {
  const clientData = data.filter(d => d.businessName === primaryClient);
  const competitorData = compareCompetitor ? data.filter(d => d.businessName === compareCompetitor) : [];

  const clientRanks = clientData.map(d => d.rank);
  const avgRank = clientRanks.length > 0 ? (clientRanks.reduce((a, b) => a + b, 0) / clientRanks.length).toFixed(2) : 'N/A';
  
  // Days at #1: Count unique dates where this client ranked #1 for ANY keyword
  const datesAt1 = new Set(clientData.filter(d => d.rank === 1).map(d => d.date));
  const daysAt1 = datesAt1.size;
  
  // Days in Top 3: Count unique dates where this client ranked in top 3 for ANY keyword
  const datesInTop3 = new Set(clientData.filter(d => d.rank <= 3).map(d => d.date));
  const daysInTop3 = datesInTop3.size;

  const clientReviews = clientData.length > 0 ? Math.max(...clientData.map(d => d.ratingsCount)) : 0;
  const clientRating = clientData.length > 0 ? (clientData.reduce((a, b) => a + b.googleRating, 0) / clientData.length).toFixed(1) : 0;

  const competitorReviews = competitorData.length > 0 ? Math.max(...competitorData.map(d => d.ratingsCount)) : 0;
  const competitorRating = competitorData.length > 0 ? (competitorData.reduce((a, b) => a + b.googleRating, 0) / competitorData.length).toFixed(1) : 0;
  const competitorAvgRank = competitorData.length > 0 ? (competitorData.map(d => d.rank).reduce((a, b) => a + b, 0) / competitorData.length).toFixed(2) : 'N/A';

  const reviewGap = competitorReviews - clientReviews;

  // Generate actionable insights without LLM
  const insights = [];
  
  if (reviewGap > 0) {
    insights.push(`You need ${reviewGap} more reviews to match ${compareCompetitor || 'top competitor'}'s review count.`);
  } else if (reviewGap < 0 && compareCompetitor) {
    insights.push(`You have ${Math.abs(reviewGap)} more reviews than ${compareCompetitor}.`);
  }

  if (compareCompetitor && parseFloat(clientRating) < parseFloat(competitorRating)) {
    insights.push(`Your rating (${clientRating}⭐) is below ${compareCompetitor} (${competitorRating}⭐). Focus on improving customer experience.`);
  }

  if (parseFloat(avgRank) > 2 && clientReviews < 50) {
    insights.push(`Low review count (${clientReviews}) may be limiting your rankings. Aim for 50+ reviews.`);
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Star size={24} className="text-yellow-400" />
        {primaryClient} - Performance Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Avg Rank</p>
          <p className="text-3xl font-bold text-white">#{avgRank}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Review Count</p>
          <p className="text-3xl font-bold text-yellow-400">{clientReviews}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Days at #1</p>
          <p className="text-3xl font-bold text-green-400">{daysAt1}</p>
          <p className="text-slate-500 text-xs mt-1">out of {totalDays} days</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Days in Top 3</p>
          <p className="text-3xl font-bold text-blue-400">{daysInTop3}</p>
          <p className="text-slate-500 text-xs mt-1">out of {totalDays} days</p>
        </div>
      </div>

      {compareCompetitor && (
        <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">vs {compareCompetitor}</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-xs">Avg Rank</p>
              <p className="text-lg font-bold text-white">#{avgRank} vs #{competitorAvgRank}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Rating</p>
              <p className="text-lg font-bold text-white">{clientRating}⭐ vs {competitorRating}⭐</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Reviews</p>
              <p className="text-lg font-bold text-white">{clientReviews} vs {competitorReviews}</p>
            </div>
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
            <TrendingUp size={16} />
            Actionable Insights
          </h4>
          <ul className="space-y-1">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-slate-300">• {insight}</li>
            ))}
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
    const totalDaysForKeyword = new Set(keywordData.map(d => d.date)).size;
    
    const stats = {};
    months.forEach(month => {
      const monthData = keywordData.filter(d => d.date.startsWith(month));
      const daysInMonth = new Set(monthData.map(d => d.date)).size;
      const businessGroups = {};
      monthData.forEach(entry => {
        if (!businessGroups[entry.businessName]) businessGroups[entry.businessName] = [];
        businessGroups[entry.businessName].push(entry);
      });

      stats[month] = {
        businesses: {},
        globalSearchVolume: monthData[0]?.globalSearchVolume || 0,
        regionalSearchVolume: monthData[0]?.regionalSearchVolume || 0,
        daysInMonth,
      };

      Object.entries(businessGroups).forEach(([business, entries]) => {
        const ranks = entries.map(e => e.rank);
        const ratings = entries.map(e => e.googleRating);
        const reviewCounts = entries.map(e => e.ratingsCount);
        const daysAppeared = entries.length;
        const packAppearanceRate = ((daysAppeared / daysInMonth) * 100).toFixed(0);
        
        // Consistency score: lower variance = higher consistency
        const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
        const variance = ranks.reduce((a, b) => a + Math.pow(b - avgRank, 2), 0) / ranks.length;
        const stdDev = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 100 - (stdDev * 25)).toFixed(0);

        stats[month].businesses[business] = {
          averageRank: avgRank.toFixed(2),
          minRank: Math.min(...ranks),
          maxRank: Math.max(...ranks),
          daysInTop3: entries.filter(e => e.rank <= 3).length,
          averageRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
          minRating: Math.min(...ratings),
          maxRating: Math.max(...ratings),
          totalReviews: Math.max(...reviewCounts),
          minReviewCount: Math.min(...reviewCounts),
          maxReviewCount: Math.max(...reviewCounts),
          packAppearanceRate,
          consistencyScore,
        };
      });
    });

    const sortedData = keywordData.sort((a, b) => a.date.localeCompare(b.date));
    const dates = [...new Set(sortedData.map(d => d.date))];
    const businessLastRanks = {};

    const timeSeriesData = dates.map(date => {
      const dayData = sortedData.filter(d => d.date === date);
      const point = { date };

      Object.keys(businessLastRanks).forEach(business => {
        point[business] = 5;
      });

      dayData.forEach(entry => {
        point[entry.businessName] = entry.rank <= 4 ? entry.rank : 5;
        businessLastRanks[entry.businessName] = true;
      });

      return point;
    });

    return { stats, timeSeriesData, businesses: businessList };
  };

  const { stats, timeSeriesData, businesses } = getKeywordData();

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Select Keyword</label>
        <div className="relative">
          <select
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer"
          >
            <option value="">Choose a keyword...</option>
            {keywords.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 pointer-events-none text-slate-400" size={20} />
        </div>
      </div>

      {selectedKeyword ? (
        <>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-4">{selectedKeyword}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-slate-400 text-sm">Global Monthly Search Volume</p>
                <p className="text-2xl font-bold text-blue-400">{stats[months[0]]?.globalSearchVolume?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Regional Monthly Search Volume</p>
                <p className="text-2xl font-bold text-blue-400">{stats[months[0]]?.regionalSearchVolume?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ranking Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(timeSeriesData.length / 8) - 1)} tickFormatter={formatDateLabel} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} reversed domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => v === 5 ? 'Out' : `#${v}`} width={40} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelFormatter={formatDateLabel}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const sorted = [...payload].sort((a, b) => {
                          const valA = a.value === 5 ? Infinity : a.value;
                          const valB = b.value === 5 ? Infinity : b.value;
                          return valA - valB;
                        });
                        return (
                          <div className="bg-slate-900 p-3 rounded border border-slate-700">
                            <p className="text-slate-400 text-sm mb-2">{formatDateLabel(label)}</p>
                            {sorted.map((entry, idx) => (
                              <p key={idx} style={{ color: entry.color }} className="text-sm font-medium">
                                {entry.name}: {entry.value === 5 ? 'Out of Top 4' : `#${entry.value}`}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {businesses.map((business, idx) => (
                    <Line key={business} type="monotone" dataKey={business} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} isAnimationActive={false} />
                  ))}
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
              <div key={month} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Rankings for {monthTitle}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Business Name</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Avg Rank</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Range</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Pack Rate</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Consistency</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Avg Rating</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBusinesses.map(([business, bStats]) => (
                        <tr key={business} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="px-3 py-3 text-white font-medium">{business}</td>
                          <td className="px-3 py-3 text-slate-300">#{bStats.averageRank}</td>
                          <td className="px-3 py-3 text-slate-400">{bStats.minRank} - {bStats.maxRank}</td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(bStats.packAppearanceRate) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(bStats.packAppearanceRate) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
                              {bStats.packAppearanceRate}%
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(bStats.consistencyScore) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(bStats.consistencyScore) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
                              {bStats.consistencyScore}%
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-300">{bStats.averageRating}⭐</td>
                          <td className="px-3 py-3 text-slate-300">{bStats.totalReviews}</td>
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
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400">Select a keyword to view its performance</p>
        </div>
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
      
      Object.keys(keywordLastSeen).forEach(keyword => {
        point[keyword] = 5;
      });
      
      dayData.forEach(entry => {
        point[entry.keyword] = entry.rank <= 4 ? entry.rank : 5;
        keywordLastSeen[entry.keyword] = true;
      });
      
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
          const stdDev = Math.sqrt(variance);
          const consistencyScore = Math.max(0, 100 - (stdDev * 25)).toFixed(0);
          const packAppearanceRate = ((keywordData.length / daysInMonth) * 100).toFixed(0);

          stats[month][keyword] = {
            averageRank: avgRank.toFixed(2),
            minRank: Math.min(...ranks),
            maxRank: Math.max(...ranks),
            daysInTop3: keywordData.filter(e => e.rank <= 3).length,
            packAppearanceRate,
            consistencyScore,
          };
        }
      });
    });

    return { keywords: keywordsForBusiness, timeSeriesData: chartData, stats };
  };

  const { keywords: businessKeywords, timeSeriesData, stats } = getBusinessData();

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Select Business</label>
        <div className="relative">
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer"
          >
            <option value="">Choose a business...</option>
            {businesses.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 pointer-events-none text-slate-400" size={20} />
        </div>
      </div>

      {selectedBusiness ? (
        <>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{selectedBusiness}</h2>
            <p className="text-slate-400">Tracking across {businessKeywords.length} keywords</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ranking Across Keywords</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(timeSeriesData.length / 8) - 1)} tickFormatter={formatDateLabel} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} reversed domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => v === 5 ? 'Out' : `#${v}`} width={40} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelFormatter={formatDateLabel}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const sorted = [...payload].sort((a, b) => {
                          const valA = a.value === 5 ? Infinity : a.value;
                          const valB = b.value === 5 ? Infinity : b.value;
                          return valA - valB;
                        });
                        return (
                          <div className="bg-slate-900 p-3 rounded border border-slate-700">
                            <p className="text-slate-400 text-sm mb-2">{formatDateLabel(label)}</p>
                            {sorted.map((entry, idx) => (
                              <p key={idx} style={{ color: entry.color }} className="text-sm font-medium">
                                {entry.name}: {entry.value === 5 ? 'Out of Top 4' : `#${entry.value}`}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {businessKeywords.slice(0, 8).map((keyword, idx) => (
                    <Line key={keyword} type="monotone" dataKey={keyword} stroke={colors[idx % colors.length]} dot={false} strokeWidth={2} isAnimationActive={false} />
                  ))}
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
              <div key={month} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Performance in {monthTitle}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Keyword</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Avg Rank</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Range</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Pack Rate</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Consistency</th>
                        <th className="text-left px-3 py-3 text-slate-300 font-semibold">Days in Top 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedKeywords.map(([keyword, kStats]) => (
                        <tr key={keyword} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="px-3 py-3 text-white font-medium">{keyword}</td>
                          <td className="px-3 py-3 text-slate-300">#{kStats.averageRank}</td>
                          <td className="px-3 py-3 text-slate-400">{kStats.minRank} - {kStats.maxRank}</td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(kStats.packAppearanceRate) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(kStats.packAppearanceRate) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
                              {kStats.packAppearanceRate}%
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${parseInt(kStats.consistencyScore) >= 80 ? 'bg-green-900/50 text-green-400' : parseInt(kStats.consistencyScore) >= 50 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
                              {kStats.consistencyScore}%
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-300">{kStats.daysInTop3}</td>
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
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400">Select a business to view its performance across keywords</p>
        </div>
      )}
    </div>
  );
}