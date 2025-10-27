import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-dark-blue text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">HOTEL VAHDAT</h3>
            <p className="text-gray-300">
              Роскошная гостиница в сердце Душанбе. Комфорт и уют для каждого гостя.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Быстрые ссылки</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-gold transition">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-300 hover:text-gold transition">
                  {t('nav.rooms')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-gold transition">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="text-gray-300 hover:text-gold transition">
                  {t('nav.contacts')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Услуги</h4>
            <ul className="space-y-2 text-gray-300">
              <li>{t('services.breakfast')}</li>
              <li>{t('services.transfer')}</li>
              <li>{t('services.conference')}</li>
              <li>{t('services.parking')}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📧 info@hotelvahdat.com</li>
              <li>📞 +992 (37) 227-77-77</li>
              <li>📍 Душанбе, проспект Рудаки</li>
              <li className="pt-2">
                <a href="https://wa.me/992935007777" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition">
                  💬 WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 HOTEL VAHDAT. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

