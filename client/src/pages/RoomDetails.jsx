import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { roomsAPI } from '../utils/api';
import BookingModal from '../components/BookingModal';

function RoomDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      const res = await roomsAPI.getById(id);
      setRoom(res.data);
    } catch (error) {
      console.error('Ошибка загрузки номера:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section-padding text-center py-20">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-xl text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="section-padding text-center py-20">
        <h2 className="text-3xl font-bold mb-4">Номер не найден</h2>
        <Link to="/rooms" className="btn-primary mt-4 inline-block">
          Вернуться к номерам
        </Link>
      </div>
    );
  }

  // Маппинг ID удобств в названия
  const amenityLabels = {
    wifi: 'Wi-Fi 🌐',
    air_conditioning: 'Кондиционер ❄️',
    tv: 'Телевизор 📺',
    breakfast: 'Завтрак 🥐',
    bathroom: 'Ванная 🚿',
    minibar: 'Мини-бар 🍾',
    safe: 'Сейф 🔒',
    balcony: 'Балкон 🌅',
    jacuzzi: 'Джакузи 💧',
    parking: 'Парковка 🚗',
    pet_friendly: 'Разрешены животные 🐕',
    smoking: 'Курящий 🚬'
  };
  
  const amenities = room.amenities ? JSON.parse(room.amenities).map(id => amenityLabels[id] || id) : [];
  
  // Данные характеристик в зависимости от типа номера
  const getRoomSpecs = () => {
    const specs = {
      economy: { area: '18 м²', beds: '1 двуспальная', breakfast: 'Опционально' },
      standard: { area: '25 м²', beds: '1 двуспальная', breakfast: 'Включён' },
      luxury: { area: '35 м²', beds: '1 двуспальная', breakfast: 'Включён' },
      suite: { area: '50 м²', beds: '2 (1 двуспальная + диван)', breakfast: 'Включён' }
    };
    return specs[room.type] || specs.standard;
  };

  const roomSpecs = getRoomSpecs();

  // Используем реальные фото или дефолтный градиент
  const displayPhotos = room.photos && room.photos.length > 0 
    ? room.photos 
    : [{ photo_url: null }];

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Кнопка назад */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-dark-blue hover:text-gold transition"
        >
          <span className="mr-2">←</span>
          <span>Вернуться к номерам</span>
        </button>

        <div className="bg-white rounded-xl overflow-hidden shadow-xl">
          {/* Галерея изображений */}
          <div className="relative">
            <div className="h-96 bg-gradient-to-br from-gold to-yellow-500 relative overflow-hidden">
              {displayPhotos[currentImageIndex] && displayPhotos[currentImageIndex].photo_url ? (
                <img 
                  src={displayPhotos[currentImageIndex].photo_url} 
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600"></div>
              )}
              
              {/* Индикаторы */}
              {displayPhotos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {displayPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-3 h-3 rounded-full transition ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Основная информация */}
          <div className="p-8">
            {/* Заголовок и цена */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-dark-blue mb-3">{room.name}</h1>
              <p className="text-3xl font-bold text-gold">
                {room.price} TJS <span className="text-lg text-gray-600">{t('rooms.perNight')}</span>
              </p>
            </div>

            {/* Описание */}
            <div className="mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">{room.description}</p>
            </div>

            {/* Таблица характеристик */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-dark-blue">Характеристики номера</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Площадь</span>
                  <span className="text-dark-blue font-semibold">{roomSpecs.area}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Количество гостей</span>
                  <span className="text-dark-blue font-semibold">{room.capacity} {t('rooms.guests')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Кровати</span>
                  <span className="text-dark-blue font-semibold">{roomSpecs.beds}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Завтрак</span>
                  <span className="text-dark-blue font-semibold">{roomSpecs.breakfast}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600 font-medium">Wi-Fi</span>
                  <span className="text-dark-blue font-semibold">Бесплатно</span>
                </div>
              </div>
            </div>

            {/* Удобства */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-dark-blue">{t('rooms.amenities')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                    <span className="mr-3 text-gold text-xl">✓</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => setShowBookingModal(true)}
                className="btn-primary flex-1 text-center py-4 text-lg hover:scale-105 transition"
              >
                {t('rooms.bookNow')}
              </button>
              
              <a 
                href="https://wa.me/99293500777?text=Здравствуйте!%20Хочу%20забронировать%20номер" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg text-center transition flex items-center justify-center gap-2"
              >
                <span>💬</span> WhatsApp
              </a>
              
              <a 
                href="https://t.me/hotelvahdat" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg text-center transition flex items-center justify-center gap-2"
              >
                <span>✈️</span> Telegram
              </a>
              
              <a 
                href="tel:+99237227777" 
                className="bg-dark-blue hover:bg-blue-900 text-white font-semibold py-4 px-6 rounded-lg text-center transition flex items-center justify-center gap-2"
              >
                <span>📞</span> Позвонить
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно бронирования */}
      <BookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        room={room}
      />
    </div>
  );
}

export default RoomDetails;

