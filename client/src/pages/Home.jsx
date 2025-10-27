import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { roomsAPI, reviewsAPI } from '../utils/api';

function Home() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const roomsRes = await roomsAPI.getAll();
      const reviewsRes = await reviewsAPI.getAll();
      setRooms(roomsRes.data.slice(0, 3));
      setReviews(reviewsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-dark-blue to-blue-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative text-center z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {t('home.welcome')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gold">
            {t('home.subtitle')}
          </p>
          <div className="space-x-4">
            <Link to="/booking" className="btn-primary">
              {t('home.bookNow')}
            </Link>
            <Link to="/about" className="btn-secondary">
              {t('home.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="heading-primary text-center mb-12">{t('home.advantages')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '📶', title: 'Wi-Fi', desc: 'Бесплатный интернет' },
              { icon: '🚗', title: 'Парковка', desc: 'Охраняемая стоянка' },
              { icon: '🍳', title: 'Завтрак', desc: 'Шведский стол' },
              { icon: '🕐', title: '24/7', desc: 'Круглосуточная стойка' }
            ].map((advantage, idx) => (
              <div key={idx} className="text-center p-6 rounded-lg hover:shadow-lg transition">
                <div className="text-5xl mb-4">{advantage.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Rooms */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="heading-primary text-center mb-12">{t('home.popularRooms')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
                {room.photos && room.photos[0] ? (
                  <img 
                    src={room.photos[0].photo_url} 
                    alt={room.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gold to-yellow-500"></div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gold">
                      {room.price} $
                    </span>
                    <Link to={`/rooms/${room.id}`} className="btn-primary text-sm">
                      {t('rooms.moreDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/rooms" className="btn-secondary">
              {t('nav.rooms')}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <h2 className="heading-primary text-center mb-12">{t('home.testimonials')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex mb-3">
                    {'⭐'.repeat(review.rating)}
                  </div>
                  <p className="text-gray-700 mb-4">"{review.comment}"</p>
                  <p className="font-semibold text-dark-blue">— {review.guest_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-dark-blue to-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">{t('home.contactUs')}</h2>
          <p className="text-xl mb-8">Готовы забронировать номер?</p>
          <Link to="/contacts" className="btn-primary">
            Связаться с нами
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

