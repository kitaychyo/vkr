import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PlayerCard from './PlayerCard';
import { getHeroImage, getHeroName } from '../utils/dota2Data';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function parsePlayerData(fullMatchData) {
  if (!fullMatchData) return { radiant: [], dire: [] };
  
  const radiant = [];
  const dire = [];
  
  for (let i = 0; i < 5; i++) {
    const playerKey = `p${i}_`;
    const direKey = `p${i + 5}_`;
    
    const radiantPlayer = {};
    const direPlayer = {};
    
    Object.keys(fullMatchData).forEach(key => {
      if (key.startsWith(playerKey)) {
        radiantPlayer[key.replace(playerKey, '')] = fullMatchData[key];
      }
      if (key.startsWith(direKey)) {
        direPlayer[key.replace(direKey, '')] = fullMatchData[key];
      }
    });
    
    if (Object.keys(radiantPlayer).length > 0) radiant.push(radiantPlayer);
    if (Object.keys(direPlayer).length > 0) dire.push(direPlayer);
  }
  
  return { radiant, dire };
}

function MatchDetail({ snapshots }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No prediction data available
      </div>
    );
  }

  const chartData = snapshots.map((snapshot) => {
    const predictData = typeof snapshot.PredictRadiant === 'string'
      ? JSON.parse(snapshot.PredictRadiant)
      : snapshot.PredictRadiant;
    
    const radiantProb = predictData?.all ? (predictData.all * 100).toFixed(1) : 50;
    return {
      duration: snapshot.duration,
      radiant: parseFloat(radiantProb),
      dire: parseFloat((100 - radiantProb).toFixed(1)),
    };
  });

  const latestSnapshot = snapshots[snapshots.length - 1];
  const latestPredict = typeof latestSnapshot.PredictRadiant === 'string'
    ? JSON.parse(latestSnapshot.PredictRadiant)
    : latestSnapshot.PredictRadiant;

  const { radiant: radiantPlayers, dire: direPlayers } = parsePlayerData(latestSnapshot.full_match_data);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'players', label: 'Players & Items' },
    { id: 'chart', label: 'Prediction Chart' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current prediction */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text mb-4">Current Prediction</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800">
                <p className="text-sm text-green-400 mb-1">Radiant Win</p>
                <p className="text-3xl font-bold text-green-400">
                  {latestPredict?.all ? (latestPredict.all * 100).toFixed(1) : 50}%
                </p>
              </div>
              <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-800">
                <p className="text-sm text-red-400 mb-1">Dire Win</p>
                <p className="text-3xl font-bold text-red-400">
                  {latestPredict?.all ? (100 - latestPredict.all * 100).toFixed(1) : 50}%
                </p>
              </div>
            </div>

            {latestPredict && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(latestPredict).map(([key, value]) => (
                  <div key={key} className="bg-card-hover rounded p-2 text-center">
                    <p className="text-xs text-text-muted capitalize">{key.replace('+', ' + ')}</p>
                    <p className="text-lg font-semibold text-accent">{(value * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radiant Team */}
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Radiant Team
              </h4>
              <div className="space-y-2">
                {radiantPlayers.map((player, idx) => (
                  <div key={idx} className="card py-2 px-3 text-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                      <img 
                        src={getHeroImage(player.hero_id, 'sm')} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text font-medium truncate">{getHeroName(player.hero_id)}</p>
                      <p className="text-text-muted text-xs">
                        KDA: {player.kda?.toFixed(1) || '0'} · {(player.gold / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dire Team */}
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                Dire Team
              </h4>
              <div className="space-y-2">
                {direPlayers.map((player, idx) => (
                  <div key={idx} className="card py-2 px-3 text-sm flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                      <img 
                        src={getHeroImage(player.hero_id, 'sm')} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text font-medium truncate">{getHeroName(player.hero_id)}</p>
                      <p className="text-text-muted text-xs">
                        KDA: {player.kda?.toFixed(1) || '0'} · {(player.gold / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">Radiant Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {radiantPlayers.map((player, idx) => (
                <PlayerCard key={idx} player={player} team="radiant" />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-4">Dire Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {direPlayers.map((player, idx) => (
                <PlayerCard key={idx} player={player} team="dire" />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Prediction Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="duration" 
                  stroke="#a3a3a3"
                  tickFormatter={(val) => formatDuration(val)}
                />
                <YAxis stroke="#a3a3a3" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(val) => `Time: ${formatDuration(val)}`}
                />
                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="radiant" stroke="#22c55e" strokeWidth={2} dot={false} name="Radiant" />
                <Line type="monotone" dataKey="dire" stroke="#ef4444" strokeWidth={2} dot={false} name="Dire" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Match info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Match Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Match ID</span>
            <span className="text-text font-mono">{latestSnapshot.match_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Duration</span>
            <span className="text-text">{formatDuration(latestSnapshot.duration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Snapshots</span>
            <span className="text-text">{snapshots.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchDetail;
