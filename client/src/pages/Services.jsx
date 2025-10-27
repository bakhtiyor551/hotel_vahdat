import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { servicesAPI } from '../utils/api';

function Services() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await servicesAPI.getAll();
      setServices(res.data);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    }
  };

  const icons = {
    restaurant: '🍳',
    car: '🚗',
    conference: '🏢',
    laundry: '👔',
    'room-service': '🏨',
    parking: '🅿️'
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-dark-blue to-blue-900 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="heading-primary text-white mb-6">{t('services.title')}</h1>
          <p className="text-xl">Полный спектр услуг для вашего комфорта</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition text-center">
                  <div className="text-6xl mb-4">
                    {icons[service.icon] || '✨'}
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{service.name}</h2>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))
            ) : (
              <>
                {/* Fallback если API не работает */}
                {[
                  { name: t('services.breakfast'), desc: 'Вкусный завтрак "шведский стол"', icon: '🍳' },
                  { name: t('services.transfer'), desc: 'Встреча и проводы гостей', icon: '🚗' },
                  { name: t('services.conference'), desc: 'Для деловых встреч', icon: '🏢' },
                  { name: t('services.laundry'), desc: 'Стирка и химчистка', icon: '👔' },
                  { name: t('services.roomService'), desc: 'Обслуживание в номере', icon: '🏨' },
                  { name: t('services.parking'), desc: 'Охраняемая стоянка', icon: '🅿️' }
                ].map((service, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition text-center">
                    <div className="text-6xl mb-4">{service.icon}</div>
                    <h2 className="text-2xl font-bold mb-4">{service.name}</h2>
                    <p className="text-gray-600">{service.desc}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services;

