import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { roomsAPI } from '../utils/api';
import BookingModal from '../components/BookingModal';

function Rooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const res = await roomsAPI.getAll();
      setRooms(res.data);
    } catch (error) {
      console.error('Ошибка загрузки номеров:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = filter === 'all' 
    ? rooms 
    : rooms.filter(room => room.type === filter);

  const typeLabels = {
    economy: t('rooms.economy'),
    standard: t('rooms.standard'),
    luxury: t('rooms.luxury'),
    suite: t('rooms.suite')
  };

  const typeColors = {
    economy: 'from-green-400 to-green-600',
    standard: 'from-blue-400 to-blue-600',
    luxury: 'from-purple-400 to-purple-600',
    suite: 'from-yellow-400 to-yellow-600'
  };

  const typeIcons = {
    economy: '🏨',
    standard: '⭐',
    luxury: '👑',
    suite: '💎'
  };

  if (loading) {
    return (
      <div className="section-padding text-center py-20">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-xl text-gray-600">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="section-padding bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Заголовок и описание */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-dark-blue mb-4">{t('rooms.title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Комфорт, уют и всё необходимое для вашего отдыха в HOTEL VAHDAT
          </p>
        </div>

        {/* Фильтры - улучшенная версия */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg ${
              filter === 'all' 
                ? 'bg-gold text-dark-blue font-bold scale-105' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Все номера
          </button>
          {['economy', 'standard', 'luxury', 'suite'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                filter === type 
                  ? 'bg-gold text-dark-blue font-bold scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{typeIcons[type]}</span>
              <span>{typeLabels[type]}</span>
            </button>
          ))}
        </div>

        {/* Сетка номеров - улучшенный дизайн */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => {
            const amenities = room.amenities ? JSON.parse(room.amenities) : [];
            
            return (
              <div 
                key={room.id} 
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Изображение */}
                <div className={`h-64 relative overflow-hidden ${typeColors[room.type]}`}>
                  {room.photos && room.photos[0] ? (
                    <img 
                      src={room.photos[0].photo_url} 
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${typeColors[room.type]}`}></div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-dark-blue px-4 py-2 rounded-full font-bold shadow-lg">
                    {typeIcons[room.type]} {typeLabels[room.type]}
                  </div>
                  
                  {/* Price badge */}
                  <div className="absolute top-4 right-4 bg-gold text-dark-blue px-4 py-2 rounded-full font-bold shadow-lg">
                    {room.price} TJS
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-dark-blue mb-3">{room.name}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{room.description}</p>
                  
                  <div className="mb-4 flex items-center text-sm text-gray-500">
                    <span className="mr-2">👥</span>
                    <span>{t('rooms.capacity')}: {room.capacity} {t('rooms.guests')}</span>
                  </div>

                  {/* Удобства */}
                  {amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{t('rooms.amenities')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {amenities.slice(0, 4).map((amenityId, idx) => {
                          const amenityLabels = {
                            wifi: 'Wi-Fi',
                            air_conditioning: 'Кондиционер',
                            tv: 'Телевизор',
                            breakfast: 'Завтрак',
                            bathroom: 'Ванная',
                            minibar: 'Мини-бар',
                            safe: 'Сейф',
                            balcony: 'Балкон',
                            jacuzzi: 'Джакузи',
                            parking: 'Парковка',
                            pet_friendly: 'Животные',
                            smoking: 'Курящий'
                          };
                          return (
                            <span 
                              key={idx} 
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                            >
                              {amenityLabels[amenityId] || amenityId}
                            </span>
                          );
                        })}
                        {amenities.length > 4 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            +{amenities.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Кнопки */}
                  <div className="mt-6 flex gap-3">
                    <Link 
                      to={`/rooms/${room.id}`} 
                      className="flex-1 bg-primary-800 hover:bg-primary-900 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
                    >
                      {t('rooms.moreDetails')}
                    </Link>
                    <button 
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowModal(true);
                      }}
                      className="flex-1 btn-gold"
                    >
                      {t('rooms.bookNow')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Модальное окно бронирования */}
        <BookingModal 
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          allRooms={rooms}
        />

        {filteredRooms.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏨</div>
            <p className="text-gray-500 text-xl">Номера не найдены</p>
            <button 
              onClick={() => setFilter('all')}
              className="mt-4 text-gold hover:text-yellow-600"
            >
              Показать все номера
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rooms;

