import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-dark-blue to-blue-900 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="heading-primary text-white mb-6">{t('about.title')}</h1>
          <p className="text-xl">Отель с богатой историей и безупречным сервисом</p>
        </div>
      </section>

      {/* History */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="heading-secondary text-center mb-8">{t('about.history')}</h2>
          <div className="space-y-6 text-gray-700">
            <p className="text-lg leading-relaxed">
              HOTEL VAHDAT был основан в 2015 году в самом сердце столицы Таджикистана - Душанбе. 
              Отель является символом роскоши, комфорта и гостеприимства.
            </p>
            <p className="text-lg leading-relaxed">
              За годы работы мы заслужили репутацию одного из лучших отелей страны. 
              Наши номера сочетают в себе современный дизайн и традиционный таджикский колорит.
            </p>
            <p className="text-lg leading-relaxed">
              Мы гордимся тем, что создали место, где каждый гость чувствует себя особенным. 
              Наша команда стремится сделать ваш отдых незабываемым.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-4xl">
          <h2 className="heading-secondary text-center mb-8">{t('about.mission')}</h2>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-xl font-semibold text-center text-dark-blue mb-4">
              "Предоставить нашим гостям незабываемый опыт, сочетающий роскошь, комфорт и теплоту таджикского гостеприимства"
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="heading-secondary text-center mb-12">{t('about.values')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤝',
                title: 'Гостеприимство',
                desc: 'Каждый гость - это член нашей семьи'
              },
              {
                icon: '⭐',
                title: 'Качество',
                desc: 'Высокие стандарты сервиса и чистоты'
              },
              {
                icon: '🌍',
                title: 'Культура',
                desc: 'Сочетание традиций и современности'
              }
            ].map((value, idx) => (
              <div key={idx} className="text-center p-6 rounded-lg hover:shadow-lg transition">
                <div className="text-6xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="heading-secondary text-center mb-12">{t('about.team')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Амирбек', role: 'Генеральный менеджер', emoji: '👨‍💼' },
              { name: 'Фарзона', role: 'Менеджер по обслуживанию', emoji: '👩‍💼' },
              { name: 'Бахтовар', role: 'Шеф-повар', emoji: '👨‍🍳' }
            ].map((member, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;

