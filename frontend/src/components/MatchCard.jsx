import { Link } from 'react-router-dom';
import { getHeroImage } from '../utils/dota2Data';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function MatchCard({ match }) {
  const {
    match_id,
    duration,
    RadiantTeamName,
    DireTeamName,
    PredictRadiant,
    full_match_data,
  } = match;

  const predictData = typeof PredictRadiant === 'string' 
    ? JSON.parse(PredictRadiant) 
    : PredictRadiant;
  
  const radiantWinProb = predictData?.all ? (predictData.all * 100).toFixed(1) : 50;
  const direWinProb = (100 - radiantWinProb).toFixed(1);

  // Parse heroes from full_match_data if available
  const radiantHeroes = [];
  const direHeroes = [];
  
  if (full_match_data) {
    for (let i = 0; i < 5; i++) {
      if (full_match_data[`p${i}_hero_id`]) {
        radiantHeroes.push(full_match_data[`p${i}_hero_id`]);
      }
      if (full_match_data[`p${i + 5}_hero_id`]) {
        direHeroes.push(full_match_data[`p${i + 5}_hero_id`]);
      }
    }
  }

  return (
    <Link to={`/match/${match_id}`} className="block">
      <div className="card hover:bg-card-hover transition-colors">
        {/* Duration badge */}
        <div className="flex justify-center mb-4">
          <span className="bg-accent/20 text-accent text-xs font-medium px-3 py-1 rounded-full">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-4">
          {/* Radiant */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
              <span className="text-xl">☀️</span>
            </div>
            <h3 className="text-xs font-semibold text-text truncate max-w-[80px] mx-auto">
              {RadiantTeamName || 'Radiant'}
            </h3>
          </div>

          {/* VS */}
          <div className="px-3">
            <span className="text-xl font-bold text-text-muted">VS</span>
          </div>

          {/* Dire */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
              <span className="text-xl">🌙</span>
            </div>
            <h3 className="text-xs font-semibold text-text truncate max-w-[80px] mx-auto">
              {DireTeamName || 'Dire'}
            </h3>
          </div>
        </div>

        {/* Hero icons */}
        <div className="flex justify-between items-center px-2 mb-3">
          <div className="flex -space-x-1">
            {radiantHeroes.slice(0, 5).map((heroId, idx) => (
              <div key={idx} className="w-6 h-6 rounded bg-gray-700 overflow-hidden border-2 border-green-900/50">
                <img 
                  src={getHeroImage(heroId, 'sm')} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            ))}
          </div>
          <div className="flex -space-x-1">
            {direHeroes.slice(0, 5).map((heroId, idx) => (
              <div key={idx} className="w-6 h-6 rounded bg-gray-700 overflow-hidden border-2 border-red-900/50">
                <img 
                  src={getHeroImage(heroId, 'sm')} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prediction bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-green-400">{radiantWinProb}%</span>
            <span className="text-text-muted">Win Prob</span>
            <span className="text-red-400">{direWinProb}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
              style={{ width: `${radiantWinProb}%` }}
            />
            <div 
              className="bg-gradient-to-l from-red-600 to-red-400 transition-all duration-500"
              style={{ width: `${direWinProb}%` }}
            />
          </div>
        </div>

        {/* ML prediction note */}
        {predictData && (
          <p className="text-xs text-text-muted text-center mt-3">
            Powered by LSTM
          </p>
        )}
      </div>
    </Link>
  );
}

export default MatchCard;
