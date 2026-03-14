function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

function HistoryTable({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No match history available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-text-muted font-medium">Match ID</th>
            <th className="text-left py-3 px-4 text-text-muted font-medium">Radiant</th>
            <th className="text-left py-3 px-4 text-text-muted font-medium">Dire</th>
            <th className="text-center py-3 px-4 text-text-muted font-medium">Duration</th>
            <th className="text-center py-3 px-4 text-text-muted font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.match_id} className="border-b border-gray-800 hover:bg-card-hover transition-colors">
              <td className="py-3 px-4">
                <span className="text-text-muted font-mono text-xs">#{match.match_id}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-green-400">{match.RadiantTeamName || 'Radiant'}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-red-400">{match.DireTeamName || 'Dire'}</span>
              </td>
              <td className="py-3 px-4 text-center text-text-muted">
                {formatDuration(match.duration)}
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  match.status === 'In play' 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-gray-800 text-text-muted'
                }`}>
                  {match.status || 'Finished'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
