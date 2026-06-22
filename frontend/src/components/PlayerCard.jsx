import { getHeroImage, getHeroName, getItemImage } from '../utils/dota2Data';

function PlayerCard({ player, team }) {
  const {
    hero_id,
    gold,
    xp,
    kda,
    slot_1,
    slot_2,
    slot_3,
    slot_4,
    slot_5,
    slot_6,
  } = player;

  const items = [slot_1, slot_2, slot_3, slot_4, slot_5, slot_6].filter(i => i && i !== -1);
  const heroImage = getHeroImage(hero_id, 'sm');
  const heroName = getHeroName(hero_id);
  const isRadiant = team === 'radiant';

  return (
    <div className={`p-4 rounded-lg border ${
      isRadiant 
        ? 'bg-green-900/10 border-green-800/50' 
        : 'bg-red-900/10 border-red-800/50'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Hero Image */}
        <div className="w-16 h-16 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
          {heroImage ? (
            <img 
              src={heroImage} 
              alt={heroName} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.textContent = '?';
                e.target.parentElement.className = 'w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 text-2xl';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
              ?
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-text truncate" title={heroName}>
              {heroName}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
              isRadiant ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
            }`}>
              {isRadiant ? 'R' : 'D'}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
            <div>
              <span className="text-text-muted">Gold</span>
              <p className="text-yellow-400 font-medium">{(gold / 1000).toFixed(1)}k</p>
            </div>
            <div>
              <span className="text-text-muted">XP</span>
              <p className="text-blue-400 font-medium">{(xp / 1000).toFixed(1)}k</p>
            </div>
            <div>
              <span className="text-text-muted">KDA</span>
              <p className="text-purple-400 font-medium">{kda?.toFixed(1) || '0'}</p>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-wrap gap-1">
            {items.map((itemId, idx) => (
              <div 
                key={idx}
                className="w-7 h-7 bg-gray-800 rounded overflow-hidden"
                title={getItemImage(itemId) || `Item ${itemId}`}
              >
                <img 
                  src={getItemImage(itemId)}
                  alt=""
                  className="w-full h-full object-contain p-0.5"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.textContent = itemId;
                    e.target.parentElement.className = 'w-7 h-7 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500';
                  }}
                />
              </div>
            ))}
            {items.length === 0 && (
              <span className="text-xs text-gray-600">No items</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
