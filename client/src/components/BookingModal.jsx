import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { bookingsAPI } from '../utils/api';

function BookingModal({ isOpen, onClose, room, allRooms }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    room_id: room?.id || '',
    check_in: '',
    check_out: '',
    guests: 2,
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    special_requests: '',
    privacy: false
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    if (room?.id) {
      setFormData(prev => ({ ...prev, room_id: room.id }));
    }
  }, [room]);

  const validateForm = () => {
    const newErrors = {};

    // Валидация имени
    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'Имя обязательно';
    } else if (formData.guest_name.trim().length < 2) {
      newErrors.guest_name = 'Имя должно содержать минимум 2 символа';
    }

    // Валидация телефона (Tajikistan format)
    const phoneRegex = /^(\+992|992|0)?[9][0-9]{8}$/;
    if (!formData.guest_phone.trim()) {
      newErrors.guest_phone = 'Телефон обязателен';
    } else if (!phoneRegex.test(formData.guest_phone.replace(/\s/g, ''))) {
      newErrors.guest_phone = 'Неверный формат телефона';
    }

    // Валидация email (необязательно, но если указан - проверяем)
    if (formData.guest_email && formData.guest_email.trim() && !/\S+@\S+\.\S+/.test(formData.guest_email)) {
      newErrors.guest_email = 'Неверный формат email';
    }

    // Валидация дат
    const today = new Date().toISOString().split('T')[0];
    if (!formData.check_in) {
      newErrors.check_in = 'Дата заезда обязательна';
    } else if (formData.check_in < today) {
      newErrors.check_in = 'Дата заезда не может быть в прошлом';
    }

    if (!formData.check_out) {
      newErrors.check_out = 'Дата выезда обязательна';
    } else if (formData.check_out <= formData.check_in) {
      newErrors.check_out = 'Дата выезда должна быть позже даты заезда';
    }

    // Валидация количества гостей
    if (formData.guests < 1 || formData.guests > 10) {
      newErrors.guests = 'Количество гостей от 1 до 10';
    }

    // Валидация согласия
    if (!formData.privacy) {
      newErrors.privacy = 'Необходимо согласие с политикой конфиденциальности';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Очистка ошибок при изменении
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('validation-error');
      return;
    }

    setSubmitStatus('loading');

    try {
      await bookingsAPI.create(formData);
      setSubmitStatus('success');
      
      // Сброс формы через 3 секунды
      setTimeout(() => {
        setSubmitStatus('');
        onClose();
        setFormData({
          room_id: room?.id || '',
          check_in: '',
          check_out: '',
          guests: 2,
          guest_name: '',
          guest_email: '',
          guest_phone: '',
          special_requests: '',
          privacy: false
        });
      }, 3000);
    } catch (error) {
      console.error('Ошибка бронирования:', error);
      
      // Проверка на конфликт дат
      if (error.response?.status === 400 && error.response?.data?.error?.includes('занят')) {
        setErrors({ 
          ...errors, 
          check_in: 'Выбранные даты уже заняты',
          check_out: 'Выберите другие даты'
        });
      }
      
      setSubmitStatus('error');
    }
  };

  const handleClose = () => {
    setErrors({});
    setSubmitStatus('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Заголовок */}
        <div className="sticky top-0 bg-gradient-primary text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Забронировать номер</h2>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gold text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Выбор номера */}
          {!room && (
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-primary-800">
                Выберите номер *
              </label>
              <select
                name="room_id"
                value={formData.room_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.room_id ? 'border-red-500' : 'border-gray-300 focus:border-primary-600'
                }`}
                required
              >
                <option value="">-- Выберите номер --</option>
                {allRooms?.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.price}$/ночь
                  </option>
                ))}
              </select>
              {errors.room_id && (
                <p className="text-red-500 text-sm mt-1">{errors.room_id}</p>
              )}
            </div>
          )}

          {/* Если номер выбран, показываем информацию */}
          {formData.room_id && !room && (() => {
            const selectedRoom = allRooms?.find(r => r.id == formData.room_id);
            return selectedRoom ? (
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-primary-800">{selectedRoom.name}</h3>
                    <p className="text-sm text-gray-600">{selectedRoom.capacity} гостей</p>
                  </div>
                  <span className="text-2xl font-bold text-gold">{selectedRoom.price}$</span>
                </div>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Дата заезда */}
            <div>
              <label className="block text-sm font-bold mb-2 text-primary-800">
                Дата заезда *
              </label>
              <input
                type="date"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.check_in ? 'border-red-500' : 'border-gray-300 focus:border-primary-600'
                }`}
              />
              {errors.check_in && (
                <p className="text-red-500 text-sm mt-1">{errors.check_in}</p>
              )}
            </div>

            {/* Дата выезда */}
            <div>
              <label className="block text-sm font-bold mb-2 text-primary-800">
                Дата выезда *
              </label>
              <input
                type="date"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                min={formData.check_in || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.check_out ? 'border-red-500' : 'border-gray-300 focus:border-primary-600'
                }`}
              />
              {errors.check_out && (
                <p className="text-red-500 text-sm mt-1">{errors.check_out}</p>
              )}
            </div>

            {/* Количество гостей */}
            <div>
              <label className="block text-sm font-bold mb-2 text-primary-800">
                Количество гостей *
              </label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                max="10"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.guests ? 'border-red-500' : 'border-gray-300 focus:border-primary-600'
                }`}
              />
              {errors.guests && (
                <p className="text-red-500 text-sm mt-1">{errors.guests}</p>
              )}
            </div>

            {/* Имя */}
            <div>
              <label className="block text-sm font-bold mb-2 text-primary-800">
                Имя гостя *
              </label>
              <input
                type="text"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleChange}
                placeholder="Ваше имя"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.guest_name ? 'border-red-500' : 'border-gray-300 focus:border-primary-600'
                }`}
              />
              {errors.guest_name && (
                <p className="text-red-500 text-sm mt-1">{errors.guest_name}</p>
              )}
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-sm font-bold mb-2 text-primary-800">
                Телефон *
              </label>
              <input
                type="tel"
                name="guest_phone"
                value={formData.guest_phone}
                onChange={handleChange}
                placeholder="+992 9XX XX XX XX"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.guest_phone ? 'border-red-500' : 'border-gray-300 focus:border-primary-600'
                }`}
              />
              {errors.guest_phone && (
                <p className="text-red-500 text-sm mt-1">{errors.guest_phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-2 text-primary-800">
                Email (опционально)
              </label>
              <input
                type="email"
                name="guest_email"
                value={formData.guest_email}
                onChange={handleChange}
                placeholder="email@example.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.guest_email ? 'border-red-500' : 'border-gray-300 focus:border-primary-600'
                }`}
              />
              {errors.guest_email && (
                <p className="text-red-500 text-sm mt-1">{errors.guest_email}</p>
              )}
            </div>
          </div>

          {/* Комментарий */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-primary-800">
              Комментарий (опционально)
            </label>
            <textarea
              name="special_requests"
              value={formData.special_requests}
              onChange={handleChange}
              rows="3"
              placeholder="Просьбы, пожелания..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-primary-600 transition"
            />
          </div>

          {/* Согласие */}
          <div className="mb-6 flex items-start gap-3">
            <input
              type="checkbox"
              name="privacy"
              checked={formData.privacy}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded"
            />
            <label className="text-sm text-gray-700">
              Я согласен с <a href="/privacy" className="text-primary-800 hover:text-primary-600 underline">политикой конфиденциальности</a> *
              {errors.privacy && (
                <span className="block text-red-500">{errors.privacy}</span>
              )}
            </label>
          </div>

          {/* Сообщения */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-xl text-green-800 font-semibold">
              ✅ Ваша заявка успешно отправлена! Мы свяжемся с вами для подтверждения.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-800 font-semibold">
              ❌ Произошла ошибка. Попробуйте позже или позвоните нам.
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitStatus === 'loading' || submitStatus === 'success'}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {submitStatus === 'loading' ? '⏳ Отправка...' : submitStatus === 'success' ? '✅ Отправлено' : '📝 Забронировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
