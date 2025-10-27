import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { roomsAPI, reviewsAPI } from '../utils/api';

function Home() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const roomsRes = await roomsAPI.getAll();
      const reviewsRes = await reviewsAPI.getAll();
      setRooms(roomsRes.data.slice(0, 3));
      setReviews(reviewsRes.data.slice(0, 3));
      
      // Загрузка галереи
      try {
        const galleryRes = await fetch('/api/admin/gallery/public');
        if (galleryRes.ok) {
          const gallery = await galleryRes.json();
          setGalleryImages(gallery);
        } else {
          console.log('Статус ответа галереи:', galleryRes.status);
        }
      } catch (error) {
        console.error('Ошибка загрузки галереи:', error);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-primary"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="relative text-center z-10 px-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white">
            {t('home.welcome')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gold font-semibold">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/booking" className="btn-gold shadow-gold">
              {t('home.bookNow')}
            </Link>
            <Link to="/about" className="btn-secondary">
              {t('home.learnMore')}
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="heading-primary text-center mb-16 animate-fade-in">{t('home.advantages')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '📶', title: 'Wi-Fi', desc: 'Бесплатный интернет', color: 'from-blue-500 to-blue-600' },
              { icon: '🚗', title: 'Парковка', desc: 'Охраняемая стоянка', color: 'from-green-500 to-green-600' },
              { icon: '🍳', title: 'Завтрак', desc: 'Шведский стол', color: 'from-orange-500 to-orange-600' },
              { icon: '🕐', title: '24/7', desc: 'Круглосуточная стойка', color: 'from-purple-500 to-purple-600' }
            ].map((advantage, idx) => (
              <div key={idx} className="card card-hover text-center p-8 group cursor-pointer animate-slide-up" style={{animationDelay: `${idx * 0.15}s`}}>
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-800 group-hover:text-primary-600 transition">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.desc}</p>
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl" style={{background: `linear-gradient(135deg, ${advantage.color})`}}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section - показывать только если есть фото */}
      {galleryImages.length > 0 && (
        <section className="section-padding bg-gradient-to-b from-white via-gray-50 to-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="heading-primary animate-fade-in">Фото-галерея</h2>
              <p className="text-xl text-gray-600 mt-4 animate-slide-up">Добро пожаловать в наш уютный отель</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {galleryImages.map((image, idx) => (
                <div 
                  key={image.id} 
                  className="relative group cursor-pointer animate-slide-up"
                  style={{animationDelay: `${idx * 0.1}s`}}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="h-72 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative">
                    <img 
                      src={image.image_url} 
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-xl font-bold text-white">{image.title}</h3>
                      {image.description && (
                        <p className="text-sm text-white/80 mt-1">{image.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal for Gallery */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full animate-zoom-in">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gold transition"
            >
              ×
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="p-6 bg-white">
                <h3 className="text-3xl font-bold text-primary-800 mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-gray-600 text-lg">{selectedImage.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Rooms */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <h2 className="heading-primary text-center mb-16 animate-fade-in">{t('home.popularRooms')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {rooms.map((room, idx) => (
              <div key={room.id} className="card card-hover group relative overflow-hidden animate-slide-up" style={{animationDelay: `${idx * 0.2}s`}}>
                {room.photos && room.photos[0] ? (
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={room.photos[0].photo_url} 
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-primary-600 to-primary-800"></div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-primary-800">{room.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{room.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                      {room.price} TJS
                    </span>
                    <Link to={`/rooms/${room.id}`} className="btn-primary text-sm">
                      {t('rooms.moreDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12 animate-slide-up" style={{animationDelay: '0.8s'}}>
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
            <h2 className="heading-primary text-center mb-16 animate-fade-in">{t('home.testimonials')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review, idx) => (
                <div key={review.id} className="card p-8 group hover:shadow-2xl transition-all duration-300 border-l-4 border-primary-600 animate-slide-up" style={{animationDelay: `${idx * 0.15}s`}}>
                  <div className="flex mb-4 text-2xl">
                    {'⭐'.repeat(review.rating)}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg italic leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                      {review.guest_name[0]}
                    </div>
                    <p className="font-bold text-primary-800">{review.guest_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        <div className="container-custom text-center relative z-10 animate-fade-in">
          <h2 className="text-5xl font-extrabold mb-6 animate-slide-up">{t('home.contactUs')}</h2>
          <p className="text-2xl mb-10 text-gold animate-slide-up" style={{animationDelay: '0.2s'}}>Готовы забронировать номер?</p>
          <Link to="/contacts" className="btn-gold inline-block shadow-gold animate-slide-up" style={{animationDelay: '0.4s'}}>
            Связаться с нами
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

