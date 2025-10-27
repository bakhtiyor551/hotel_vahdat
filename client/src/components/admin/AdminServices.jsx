import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminServices.css';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    status: 'active',
    sort_order: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');

      if (editingService) {
        await axios.put(`/api/admin/services/${editingService.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/admin/services', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      status: 'active',
      sort_order: 0
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить услугу?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-services">
      <div className="admin-header-section">
        <h1>Управление услугами</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          + Добавить услугу
        </button>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon || '📋'}</div>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <div className="service-info">
              <span className={`status-badge ${service.status}`}>
                {service.status === 'active' ? '✓ Активна' : '✗ Скрыта'}
              </span>
              <span className="sort-order">Порядок: {service.sort_order}</span>
            </div>
            <div className="service-actions">
              <button onClick={() => { setEditingService(service); setFormData(service); setShowModal(true); }} className="btn-edit">
                ✏️ Редактировать
              </button>
              <button onClick={() => handleDelete(service.id)} className="btn-delete">
                🗑️ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingService ? 'Редактировать услугу' : 'Добавить услугу'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Иконка (эмодзи)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📋"
                />
              </div>

              <div className="form-group">
                <label>Порядок отображения</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Активна</option>
                  <option value="inactive">Скрыта</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Отмена
                </button>
                <button type="submit" className="btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

