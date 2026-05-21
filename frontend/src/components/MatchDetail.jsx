import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PlayerCard from './PlayerCard';
import { getHeroImage, getHeroName } from '../utils/dota2Data';

const MASK_GROUPS = [
  { id: 'all', label: 'All', color: '#22c55e' },
  { id: 'econ+comp', label: 'Econ+Comp', color: '#3b82f6' },
  { id: 'econ+obj', label: 'Econ+Obj', color: '#f59e0b' },
  { id: 'comp+obj', label: 'Comp+Obj', color: '#8b5cf6' }
];

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const MASK_TO_LINE_KEY = {
  'all': 'all',
  'econ+comp': 'econComp',
  'econ+obj': 'econObj',
  'comp+obj': 'compObj',
};

function HeatmapTable({ chartData, activeLines }) {
  const visibleGroups = MASK_GROUPS.filter((m) => activeLines[MASK_TO_LINE_KEY[m.id]]);

  if (visibleGroups.length === 0) {
    return <p className="text-text-muted text-sm">Select at least one feature group above.</p>;
  }

  const allValues = chartData.flatMap((d) =>
    visibleGroups.map((m) => d[MASK_TO_LINE_KEY[m.id]])
  );

  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  const getHeatmapColor = (value) => {
    const normalized = (value - minVal) / (maxVal - minVal || 1);
    
    // Красивый градиент: красный (низкий) -> желтый -> зеленый (высокий)
    const hue = normalized * 120;
    return `hsl(${hue}, 85%, 55%)`;
  };

  const shouldShowLabel = (idx) =>
    idx % 5 === 0 || idx === chartData.length - 1;

  // Адаптивный размер ячеек в зависимости от количества данных
  const cellWidth = chartData.length > 30 ? 'min-w-[28px] w-7' : chartData.length > 20 ? 'min-w-[36px] w-9' : 'min-w-[48px] w-12';
  const fontSize = chartData.length > 30 ? 'text-[9px]' : chartData.length > 20 ? 'text-[10px]' : 'text-xs';

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header */}
        <div className="flex border-b border-gray-700 pb-2 mb-2">
          <div className="w-24 flex-shrink-0" />
          {chartData.map((col, idx) => (
            <div
              key={idx}
              className={`${cellWidth} flex-shrink-0 text-center ${
                shouldShowLabel(idx) ? '' : 'opacity-0'
              }`}
            >
              <span className={`${fontSize} font-mono text-text-muted`}>
                {formatDuration(col.duration)}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {visibleGroups.map((mask) => (
          <div key={mask.id} className="flex items-center mb-1">
            <div
              className="w-24 flex-shrink-0 px-3 py-2 flex items-center rounded-l-md"
              style={{ backgroundColor: `${mask.color}20`, borderLeft: `3px solid ${mask.color}` }}
            >
              <span className="text-xs font-semibold text-text" style={{ color: mask.color }}>
                {mask.label}
              </span>
            </div>

            {chartData.map((col, idx) => {
              const value = col[MASK_TO_LINE_KEY[mask.id]];

              return (
                <div
                  key={`${mask.id}-${idx}`}
                  className={`${cellWidth} flex-shrink-0 py-2 px-1 text-center first:rounded-l-md last:rounded-r-md transition-all hover:scale-105 hover:z-10 hover:shadow-lg`}
                  style={{ 
                    backgroundColor: getHeatmapColor(value),
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                  }}
                >
                  <span
                    className={`${fontSize} font-bold text-black drop-shadow-sm`}
                  >
                    {value.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 flex justify-center items-center gap-3 px-24">
          <span className="text-xs font-semibold text-red-400">0%</span>
          <div
            className="flex-1 h-4 rounded-full"
            style={{
              background: 'linear-gradient(to right, #ef4444 0%, #fbbf24 50%, #22c55e 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
          <span className="text-xs font-semibold text-green-400">100%</span>
        </div>
      </div>
    </div>
  );
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
  const [chartSubTab, setChartSubTab] = useState('chart');
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

  // Дедупликация через объект (берём последнее значение для каждого времени)
  const byDuration = {};

  snapshots.forEach((snapshot) => {
    const predictData = typeof snapshot.PredictRadiant === 'string'
      ? JSON.parse(snapshot.PredictRadiant)
      : snapshot.PredictRadiant;

    const durationKey = Math.floor(Number(snapshot.duration));
    if (isNaN(durationKey)) return;

    byDuration[durationKey] = {
      duration: durationKey,
      all: predictData?.all ? parseFloat((predictData.all * 100).toFixed(1)) : 50,
      econComp: predictData?.['econ+comp'] ? parseFloat((predictData['econ+comp'] * 100).toFixed(1)) : 50,
      econObj: predictData?.['econ+obj'] ? parseFloat((predictData['econ+obj'] * 100).toFixed(1)) : 50,
      compObj: predictData?.['comp+obj'] ? parseFloat((predictData['comp+obj'] * 100).toFixed(1)) : 50,
    };
  });

  const chartData = Object.values(byDuration).sort((a, b) => a.duration - b.duration);

  console.log('Snapshots count:', snapshots.length);
  console.log('ChartData count:', chartData.length);
  console.log('ChartData durations:', chartData.map(d => d.duration));

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
          {/* Sub-tabs: Chart / Heatmap */}
          <div className="flex items-center space-x-1 mb-4 bg-gray-800/50 rounded-lg p-1 w-fit">
            <button
              onClick={() => setChartSubTab('chart')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                chartSubTab === 'chart'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setChartSubTab('heatmap')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                chartSubTab === 'heatmap'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Heatmap
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
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

          {chartSubTab === 'chart' && (
            <>
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
            </>
          )}

          {chartSubTab === 'heatmap' && (
            <>
              <h3 className="text-lg font-semibold text-text mb-4">
                Ablation Study Heatmap
              </h3>
              <HeatmapTable chartData={chartData} activeLines={activeLines} />
            </>
          )}
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
