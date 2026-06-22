import { useState, useEffect } from 'react';
import { getMatchesHistory } from '../api';
import HistoryTable from '../components/HistoryTable';

function History() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    radiantTeam: '',
    direTeam: '',
    status: '',
    minDuration: '',
    maxDuration: '',
  });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      if (filters.search) filterParams.search = filters.search;
      if (filters.radiantTeam) filterParams.radiantTeam = filters.radiantTeam;
      if (filters.direTeam) filterParams.direTeam = filters.direTeam;
      if (filters.status) filterParams.status = filters.status;
      if (filters.minDuration && filters.minDuration !== '') filterParams.minDuration = parseInt(filters.minDuration) * 60;
      if (filters.maxDuration && filters.maxDuration !== '') filterParams.maxDuration = parseInt(filters.maxDuration) * 60;
      
      const data = await getMatchesHistory(filterParams);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError('Failed to load match history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      radiantTeam: '',
      direTeam: '',
      status: '',
      minDuration: '',
      maxDuration: '',
    });
  };

  if (loading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchHistory} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Match History</h1>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by Match ID */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Match ID</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="#123456"
              className="w-full bg-card-hover border border-gray-700 rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
          
          {/* Radiant Team */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Radiant Team</label>
            <input
              type="text"
              value={filters.radiantTeam}
              onChange={(e) => handleFilterChange('radiantTeam', e.target.value)}
              placeholder="Team name"
              className="w-full bg-card-hover border border-gray-700 rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
          
          {/* Dire Team */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Dire Team</label>
            <input
              type="text"
              value={filters.direTeam}
              onChange={(e) => handleFilterChange('direTeam', e.target.value)}
              placeholder="Team name"
              className="w-full bg-card-hover border border-gray-700 rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-card-hover border border-gray-700 rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
            >
              <option value="">All</option>
              <option value="finish">Finished</option>
            </select>
          </div>
          
          {/* Min Duration */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Min Duration (min)</label>
            <input
              type="number"
              value={filters.minDuration}
              onChange={(e) => handleFilterChange('minDuration', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full bg-card-hover border border-gray-700 rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
          
          {/* Max Duration */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Max Duration (min)</label>
            <input
              type="number"
              value={filters.maxDuration}
              onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
              placeholder="60"
              min="0"
              className="w-full bg-card-hover border border-gray-700 rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
      
      <div className="card">
        <HistoryTable matches={matches} />
      </div>
    </div>
  );
}

export default History;
