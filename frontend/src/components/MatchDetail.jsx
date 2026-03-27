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
  const [activeLines, setActiveLines] = useState({
    all: true,
    econComp: true,
    econObj: true,
    compObj: true,
  });

  const toggleLine = (line) => {
    setActiveLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No prediction data available
      </div>
    );
  }

  const chartData = snapshots.reduce((acc, snapshot) => {
    const predictData = typeof snapshot.PredictRadiant === 'string'
      ? JSON.parse(snapshot.PredictRadiant)
      : snapshot.PredictRadiant;

    const dataPoint = {
      duration: snapshot.duration,
      all: predictData?.all ? parseFloat((predictData.all * 100).toFixed(1)) : 50,
      econComp: predictData?.['econ+comp'] ? parseFloat((predictData['econ+comp'] * 100).toFixed(1)) : 50,
      econObj: predictData?.['econ+obj'] ? parseFloat((predictData['econ+obj'] * 100).toFixed(1)) : 50,
      compObj: predictData?.['comp+obj'] ? parseFloat((predictData['comp+obj'] * 100).toFixed(1)) : 50,
    };

    // Skip duplicates by duration
    const lastPoint = acc[acc.length - 1];
    if (!lastPoint || lastPoint.duration !== snapshot.duration) {
      acc.push(dataPoint);
    }

    return acc;
  }, []);

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">Prediction Over Time (Radiant Win Probability)</h3>
            {/* Legend with checkboxes */}
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLines.all}
                  onChange={() => toggleLine('all')}
                  className="w-4 h-4 rounded border-gray-600 bg-card-hover text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-text-muted">All Features</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLines.econComp}
                  onChange={() => toggleLine('econComp')}
                  className="w-4 h-4 rounded border-gray-600 bg-card-hover text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-text-muted">Econ + Comp</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLines.econObj}
                  onChange={() => toggleLine('econObj')}
                  className="w-4 h-4 rounded border-gray-600 bg-card-hover text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-text-muted">Econ + Obj</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLines.compObj}
                  onChange={() => toggleLine('compObj')}
                  className="w-4 h-4 rounded border-gray-600 bg-card-hover text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-text-muted">Comp + Obj</span>
              </label>
            </div>
          </div>
          <div className="w-full max-w-4xl mx-auto aspect-video">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} horizontal={true} />
                <XAxis
                  dataKey="duration"
                  stroke="#9ca3af"
                  tickFormatter={(val) => formatDuration(val)}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                  label={{ value: 'Game Time', position: 'insideBottomRight', fill: '#9ca3af', fontSize: 12, offset: -10 }}
                  interval={0}
                />
                <YAxis
                  stroke="#9ca3af"
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 50, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                  width={50}
                  label={{ value: 'Win Probability (%)', angle: -90, position: 'insideTopLeft', fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#e5e7eb', marginBottom: '8px', fontWeight: 600 }}
                  labelFormatter={(val) => `Time: ${formatDuration(val)}`}
                  itemStyle={{ color: '#e5e7eb' }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="4 4" strokeWidth={2} label={{ value: '50%', fill: '#6b7280', fontSize: 11 }} />
                {activeLines.all && (
                  <Line
                    type="linear"
                    dataKey="all"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#1f2937' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="All Features"
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                )}
                {activeLines.econComp && (
                  <Line
                    type="linear"
                    dataKey="econComp"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 1, stroke: '#1f2937' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="Econ + Comp"
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                )}
                {activeLines.econObj && (
                  <Line
                    type="linear"
                    dataKey="econObj"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#1f2937' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="Econ + Obj"
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                )}
                {activeLines.compObj && (
                  <Line
                    type="linear"
                    dataKey="compObj"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 1, stroke: '#1f2937' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="Comp + Obj"
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                )}
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
