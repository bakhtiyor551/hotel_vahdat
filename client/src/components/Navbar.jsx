import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="navbar">
      <div className="container-custom">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-3xl">🏨</span>
            <span>HOTEL VAHDAT</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-primary-800 font-medium hover:text-primary-600 transition relative group">
              {t('nav.home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/rooms" className="text-primary-800 font-medium hover:text-primary-600 transition relative group">
              {t('nav.rooms')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/about" className="text-primary-800 font-medium hover:text-primary-600 transition relative group">
              {t('nav.about')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/services" className="text-primary-800 font-medium hover:text-primary-600 transition relative group">
              {t('nav.services')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/contacts" className="text-primary-800 font-medium hover:text-primary-600 transition relative group">
              {t('nav.contacts')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* Language Switcher */}
            <div className="flex space-x-2 ml-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeLanguage('ru')}
                className={`px-3 py-1 rounded-md transition ${i18n.language === 'ru' ? 'bg-gradient-primary text-white font-bold shadow-md' : 'text-gray-600 hover:text-primary-800'}`}
              >
                RU
              </button>
              <button
                onClick={() => changeLanguage('tg')}
                className={`px-3 py-1 rounded-md transition ${i18n.language === 'tg' ? 'bg-gradient-primary text-white font-bold shadow-md' : 'text-gray-600 hover:text-primary-800'}`}
              >
                TG
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-md transition ${i18n.language === 'en' ? 'bg-gradient-primary text-white font-bold shadow-md' : 'text-gray-600 hover:text-primary-800'}`}
              >
                EN
              </button>
            </div>

            <Link to="/booking" className="btn-primary whitespace-nowrap">
              {t('home.bookNow')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-800 p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-6 space-y-4 bg-gradient-to-b from-gray-50 to-white rounded-xl mt-4 border border-gray-200 animate-fade-in">
            <Link to="/" className="block text-primary-800 font-medium hover:text-primary-600 transition px-4 py-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link to="/rooms" className="block text-primary-800 font-medium hover:text-primary-600 transition px-4 py-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
              {t('nav.rooms')}
            </Link>
            <Link to="/about" className="block text-primary-800 font-medium hover:text-primary-600 transition px-4 py-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
              {t('nav.about')}
            </Link>
            <Link to="/services" className="block text-primary-800 font-medium hover:text-primary-600 transition px-4 py-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
              {t('nav.services')}
            </Link>
            <Link to="/contacts" className="block text-primary-800 font-medium hover:text-primary-600 transition px-4 py-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>
              {t('nav.contacts')}
            </Link>
            <div className="flex space-x-2 px-4 py-2">
              <button onClick={() => changeLanguage('ru')} className={`px-3 py-1 rounded-md ${i18n.language === 'ru' ? 'bg-gradient-primary text-white' : 'bg-gray-200'}`}>RU</button>
              <button onClick={() => changeLanguage('tg')} className={`px-3 py-1 rounded-md ${i18n.language === 'tg' ? 'bg-gradient-primary text-white' : 'bg-gray-200'}`}>TG</button>
              <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded-md ${i18n.language === 'en' ? 'bg-gradient-primary text-white' : 'bg-gray-200'}`}>EN</button>
            </div>
            <Link to="/booking" className="btn-primary block text-center mx-4" onClick={() => setIsOpen(false)}>
              {t('home.bookNow')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

