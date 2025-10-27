import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactsAPI } from '../utils/api';

function Contacts() {
  const { t } = useTranslation();
  const [contact, setContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    loadContact();
  }, []);

  const loadContact = async () => {
    try {
      const res = await contactsAPI.get();
      setContact(res.data);
    } catch (error) {
      console.error('Ошибка загрузки контактов:', error);
    }
  };

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
      await contactsAPI.sendMessage(formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      setSubmitStatus('error');
    }
  };

  const contactData = contact || {
    address: 'Душанбе, проспект Рудаки, 84',
    phone: '+992 (37) 227-77-77',
    email: 'info@hotelvahdat.com',
    whatsapp: '+992 93 500-77-77',
    telegram: '@hotelvahdat'
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-dark-blue to-blue-900 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="heading-primary text-white mb-6">{t('contacts.title')}</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Наши контакты</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('contacts.address')}</h3>
                  <p className="text-gray-600">{contactData.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('contacts.phone')}</h3>
                  <p className="text-gray-600">{contactData.phone}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('contacts.email')}</h3>
                  <p className="text-gray-600">{contactData.email}</p>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`https://wa.me/${contactData.whatsapp?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                  >
                    📱 {t('contacts.whatsapp')}
                  </a>
                  <a
                    href={`https://t.me/${contactData.telegram?.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                  >
                    ✈️ {t('contacts.telegram')}
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">🗺️ Карта</p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">{t('contacts.sendMessage')}</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                  {t('contacts.success')}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
                  Произошла ошибка. Попробуйте позже.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder={t('contacts.formName')}
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />

                <input
                  type="email"
                  name="email"
                  placeholder={t('contacts.formEmail')}
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder={t('contacts.formPhone')}
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />

                <input
                  type="text"
                  name="subject"
                  placeholder={t('contacts.formSubject')}
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />

                <textarea
                  name="message"
                  rows="6"
                  placeholder={t('contacts.formMessage')}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                />

                <button
                  type="submit"
                  disabled={submitStatus === 'loading'}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {submitStatus === 'loading' ? 'Отправка...' : t('contacts.formSubmit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contacts;

