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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-gold">
            🏨 HOTEL VAHDAT
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-dark-blue hover:text-gold transition">
              {t('nav.home')}
            </Link>
            <Link to="/rooms" className="text-dark-blue hover:text-gold transition">
              {t('nav.rooms')}
            </Link>
            <Link to="/about" className="text-dark-blue hover:text-gold transition">
              {t('nav.about')}
            </Link>
            <Link to="/services" className="text-dark-blue hover:text-gold transition">
              {t('nav.services')}
            </Link>
            <Link to="/contacts" className="text-dark-blue hover:text-gold transition">
              {t('nav.contacts')}
            </Link>
            
            {/* Language Switcher */}
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => changeLanguage('ru')}
                className={`px-2 ${i18n.language === 'ru' ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                RU
              </button>
              <button
                onClick={() => changeLanguage('tg')}
                className={`px-2 ${i18n.language === 'tg' ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                TG
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 ${i18n.language === 'en' ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                EN
              </button>
            </div>

            <Link to="/booking" className="btn-primary">
              {t('home.bookNow')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-dark-blue"
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
          <div className="md:hidden py-4 space-y-4">
            <Link to="/" className="block text-dark-blue hover:text-gold transition">
              {t('nav.home')}
            </Link>
            <Link to="/rooms" className="block text-dark-blue hover:text-gold transition">
              {t('nav.rooms')}
            </Link>
            <Link to="/about" className="block text-dark-blue hover:text-gold transition">
              {t('nav.about')}
            </Link>
            <Link to="/services" className="block text-dark-blue hover:text-gold transition">
              {t('nav.services')}
            </Link>
            <Link to="/contacts" className="block text-dark-blue hover:text-gold transition">
              {t('nav.contacts')}
            </Link>
            <div className="flex space-x-2">
              <button onClick={() => changeLanguage('ru')} className="px-2">RU</button>
              <button onClick={() => changeLanguage('tg')} className="px-2">TG</button>
              <button onClick={() => changeLanguage('en')} className="px-2">EN</button>
            </div>
            <Link to="/booking" className="btn-primary block text-center">
              {t('home.bookNow')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

