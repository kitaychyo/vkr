import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-accent' : 'text-text-muted hover:text-text';
  };

  return (
    <header className="bg-card border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold text-text">Dota 2 Predictor</span>
          </Link>
          
          <nav className="flex space-x-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>
              Live Matches
            </Link>
            <Link to="/history" className={`text-sm font-medium transition-colors ${isActive('/history')}`}>
              History
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
