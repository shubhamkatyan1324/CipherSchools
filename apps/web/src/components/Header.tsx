import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, History, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (location.pathname !== '/') {
      navigate(`/?q=${encodeURIComponent(val)}`);
    } else {
      if (val) {
        setSearchParams({ q: val }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  };

  const handleClearSearch = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleExploreClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const elem = document.getElementById('problems-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 shadow-sm backdrop-blur-md">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6 relative">
        {/* Left: Explore Problems Navigation Button */}
        <div className="flex items-center gap-4">
          <Link
            to="/#problems-section"
            onClick={handleExploreClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/' || (location.pathname.startsWith('/problem') && !location.pathname.includes('/history'))
                ? 'bg-[#F98513] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>Explore Problems</span>
          </Link>
        </div>

        {/* Center: CipherSchools Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <Link to="/" className="flex items-center group">
            {!logoError ? (
              <img
                src="/C.png"
                alt="CipherSchools"
                className="h-14 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cs-orange-gradient p-0.5 shadow-md shadow-cs-orange-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center font-bold font-arial text-[#F98513] text-xl">
                    C
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-2xl text-slate-900 tracking-tight">
                      Cipher<span className="text-[#F98513]">Schools</span>
                    </span>
                    <span className="text-xs font-semibold font-arial bg-cs-orange-500/10 text-[#F98513] border border-cs-orange-500/30 px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
                      LLD Practice
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Right: My Progress Link */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3">
            <Link
              to="/problem/parking-lot/history"
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-base font-bold transition-all shadow-sm border-2 ${
                location.pathname.includes('/history')
                  ? 'bg-slate-800 text-white border-slate-900 shadow-md shadow-slate-900/20'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <History className="w-5 h-5 text-slate-700" />
              <span>My Progress</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-slate-200 bg-white p-5 space-y-2.5">
          <Link
            to="/#problems-section"
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleExploreClick(e);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold bg-[#F98513] text-white"
          >
            <BookOpen className="w-5 h-5" />
            <span>Explore Problems</span>
          </Link>

          <Link
            to="/problem/parking-lot/history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            <History className="w-5 h-5" />
            <span>My Attempt History</span>
          </Link>
        </div>
      )}
    </header>
  );
};
