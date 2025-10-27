import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      await axios.put('/api/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Настройки сохранены');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-settings">
      <h1>Настройки сайта</h1>

      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h2>📞 Контактная информация</h2>
          
          <div className="form-group">
            <label>Адрес</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Душанбе, проспект Рудаки, 84"
            />
          </div>

          <div className="form-group">
            <label>Телефон</label>
            <input
              type="text"
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+992 (37) 227-77-77"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="info@hotelvahdat.com"
            />
          </div>

          <div className="form-group">
            <label>WhatsApp</label>
            <input
              type="text"
              value={settings.whatsapp || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              placeholder="+992 93 500-77-77"
            />
          </div>

          <div className="form-group">
            <label>Telegram</label>
            <input
              type="text"
              value={settings.telegram || ''}
              onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
              placeholder="@hotelvahdat"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>🎛️ Дополнительные настройки</h2>

          <div className="form-group">
            <label>Время работы</label>
            <input
              type="text"
              value={settings.working_hours || ''}
              onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
              placeholder="Круглосуточно"
            />
          </div>

          <div className="form-group">
            <label>Включить уведомления</label>
            <select
              value={settings.enable_notifications || 'true'}
              onChange={(e) => setSettings({ ...settings, enable_notifications: e.target.value })}
            >
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>
    </div>
  );
}

