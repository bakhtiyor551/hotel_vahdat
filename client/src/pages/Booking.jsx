import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';

function Booking() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    room_id: searchParams.get('room') || '',
    check_in: '',
    check_out: '',
    guests: 2,
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    special_requests: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      await bookingsAPI.create(formData);
      setSubmitStatus('success');
      setFormData({
        room_id: '',
        check_in: '',
        check_out: '',
        guests: 2,
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        special_requests: ''
      });
    } catch (error) {
      console.error('Ошибка бронирования:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-primary text-center mb-8">{t('booking.title')}</h1>

        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            {t('booking.success')}
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            Произошла ошибка. Попробуйте позже.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('booking.checkIn')}</label>
              <input
                type="date"
                name="check_in"
                required
                value={formData.check_in}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('booking.checkOut')}</label>
              <input
                type="date"
                name="check_out"
                required
                value={formData.check_out}
                onChange={handleChange}
                min={formData.check_in || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('booking.guests')}</label>
              <input
                type="number"
                name="guests"
                required
                min="1"
                max="10"
                value={formData.guests}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('booking.roomType')}</label>
              <input
                type="text"
                value={formData.room_id}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('booking.name')}</label>
              <input
                type="text"
                name="guest_name"
                required
                value={formData.guest_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('booking.email')}</label>
              <input
                type="email"
                name="guest_email"
                required
                value={formData.guest_email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('booking.phone')}</label>
              <input
                type="tel"
                name="guest_phone"
                required
                value={formData.guest_phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold mb-2">{t('booking.specialRequests')}</label>
            <textarea
              name="special_requests"
              rows="4"
              value={formData.special_requests}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            disabled={submitStatus === 'loading'}
            className="w-full mt-8 btn-primary disabled:opacity-50"
          >
            {submitStatus === 'loading' ? 'Отправка...' : t('booking.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;

