import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-gradient text-white relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-10 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-10 animate-float" style={{animationDelay: '1.5s'}}></div>
      
      <div className="container-custom section-padding relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-gold bg-clip-text text-transparent">HOTEL VAHDAT</h3>
            <p className="text-gray-300 leading-relaxed">
              Роскошная гостиница в сердце Бохтара. Комфорт и уют для каждого гостя.
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h4 className="text-lg font-bold mb-6 text-gold">Быстрые ссылки</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-gold transition hover:translate-x-2 inline-block">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-300 hover:text-gold transition hover:translate-x-2 inline-block">
                  {t('nav.rooms')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-gold transition hover:translate-x-2 inline-block">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="text-gray-300 hover:text-gold transition hover:translate-x-2 inline-block">
                  {t('nav.contacts')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h4 className="text-lg font-bold mb-6 text-gold">Услуги</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-gold">✨</span> {t('services.breakfast')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">🚗</span> {t('services.transfer')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">🎯</span> {t('services.conference')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">🅿️</span> {t('services.parking')}
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h4 className="text-lg font-bold mb-6 text-gold">Контакты</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-gold text-xl">📧</span> info@hotelvahdat.com
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold text-xl">📞</span> +992 (37) 227-77-77
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold text-xl">📍</span> Бохтар, проспект Рудаки
              </li>
              <li className="pt-2">
                <a 
                  href="https://wa.me/992935007777" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 hover:text-gold transition hover:translate-x-1 inline-block"
                >
                  <span className="text-gold text-xl">💬</span> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-gray-400">&copy; 2025 HOTEL VAHDAT. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

