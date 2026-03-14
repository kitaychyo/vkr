import { useState, useEffect } from 'react';
import { getMatchesHistory } from '../api';
import HistoryTable from '../components/HistoryTable';

function History() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getMatchesHistory();
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
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
      <div className="card">
        <HistoryTable matches={matches} />
      </div>
    </div>
  );
}

export default History;
