import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMatchDetails } from '../api';
import MatchDetail from '../components/MatchDetail';
import { getTeamLogo } from '../utils/dota2Data';

function MatchPage() {
  const { matchId } = useParams();
  const [snapshots, setSnapshots] = useState([]);
  const [radiantLogo, setRadiantLogo] = useState(null);
  const [direLogo, setDireLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const data = await getMatchDetails(matchId);
      if (data && data.length > 0) {
        setSnapshots(data);
        
        // Load team logos from OpenDota API
        const latestSnapshot = data[data.length - 1];
        const radiantTeamId = latestSnapshot?.RadiantLogoTeamId || latestSnapshot?.RadiantTeamId;
        const direTeamId = latestSnapshot?.DireLogoTeamId || latestSnapshot?.DireTeamId;
        
        if (radiantTeamId) {
          const logo = await getTeamLogo(radiantTeamId);
          setRadiantLogo(logo);
        }
        if (direTeamId) {
          const logo = await getTeamLogo(direTeamId);
          setDireLogo(logo);
        }
      }
      setError(null);
    } catch (err) {
      setError('Failed to load match details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();
    const interval = setInterval(fetchMatchData, 15000);
    return () => clearInterval(interval);
  }, [matchId]);

  if (loading && snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error && snapshots.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/" className="btn-primary">
          Back to Matches
        </Link>
      </div>
    );
  }

  const latestSnapshot = snapshots[snapshots.length - 1];
  const radiantTeamName = latestSnapshot?.RadiantTeamName || 'Radiant';
  const direTeamName = latestSnapshot?.DireTeamName || 'Dire';

  return (
    <div>
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-sm text-text-muted hover:text-text mb-6 transition-colors">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Matches
      </Link>

      {/* Match Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          {/* Radiant Team */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700">
              {radiantLogo ? (
                <img src={radiantLogo} alt={radiantTeamName} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">☀️</div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-400">{radiantTeamName}</h2>
              <span className="text-xs text-text-muted">Radiant</span>
            </div>
          </div>
            
          {/* VS */}
          <div className="px-6">
            <span className="text-3xl font-bold text-text-muted">VS</span>
          </div>
            
          {/* Dire Team */}
          <div className="flex items-center space-x-4 flex-row-reverse">
            <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700">
              {direLogo ? (
                <img src={direLogo} alt={direTeamName} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🌙</div>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-red-400">{direTeamName}</h2>
              <span className="text-xs text-text-muted">Dire</span>
            </div>
          </div>
        </div>

        {/* Match ID badge */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Match ID</span>
            <span className="text-text font-mono bg-card-hover px-3 py-1 rounded">{matchId}</span>
          </div>
        </div>
      </div>

      {/* Match Detail with Chart */}
      <MatchDetail snapshots={snapshots} />
    </div>
  );
}

export default MatchPage;
