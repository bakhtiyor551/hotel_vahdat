import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { roomsAPI } from '../utils/api';
import BookingModal from '../components/BookingModal';

function Booking() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const res = await roomsAPI.getAll();
      setRooms(res.data);
      
      // Если передан ID номера через URL
      const roomId = searchParams.get('room');
      if (roomId) {
        const room = res.data.find(r => r.id == roomId);
        if (room) {
          setSelectedRoom(room);
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки номеров:', error);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  return (
    <div className="section-padding bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="heading-primary mb-4">Забронировать номер</h1>
          <p className="text-xl text-gray-600">
            Выберите номер и заполните форму для бронирования
          </p>
        </div>

        {/* Список номеров */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {rooms.map((room) => (
            <div key={room.id} className="card card-hover group relative overflow-hidden">
              {/* Изображение */}
              {room.photos && room.photos[0] ? (
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.photos[0].photo_url} 
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {/* Badge цены */}
                  <div className="absolute top-4 right-4 bg-gold text-primary-900 px-4 py-2 rounded-full font-bold shadow-lg">
                    {room.price}$ <span className="text-sm">/ночь</span>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-primary-600 to-primary-800"></div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-primary-800">{room.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{room.description}</p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span>👥 {room.capacity} гостей</span>
                  <span className="capitalize">{room.type}</span>
                </div>

                <button
                  onClick={() => handleBookRoom(room)}
                  className="w-full btn-primary mt-4"
                >
                  Забронировать
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Информация о бронировании */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-primary-800 mb-6 text-center">
            Как работает бронирование?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="font-bold text-primary-800 mb-2">Заполните форму</h3>
              <p className="text-gray-600">Выберите номер, даты и контакты</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-bold text-primary-800 mb-2">Подтверждение</h3>
              <p className="text-gray-600">Мы свяжемся с вами для подтверждения</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🏨</div>
              <h3 className="font-bold text-primary-800 mb-2">Заселение</h3>
              <p className="text-gray-600">Приезжайте к нам в назначенное время</p>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      <BookingModal 
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        allRooms={rooms}
      />
    </div>
  );
}

export default Booking;

