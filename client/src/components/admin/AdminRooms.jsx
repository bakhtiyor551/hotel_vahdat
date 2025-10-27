import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../utils/adminApi';
import './AdminRooms.css';

export default function AdminRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await adminApi.get('/admin/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Ошибка загрузки номеров:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить номер?')) return;
    
    try {
      await adminApi.delete(`/admin/rooms/${id}`);
      fetchRooms();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleEdit = (roomId) => {
    navigate(`/admin/rooms/edit/${roomId}`);
  };

  const typeLabels = {
    economy: 'Эконом',
    standard: 'Стандарт',
    luxury: 'Люкс',
    suite: 'Сьют'
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-rooms">
      <div className="admin-header-section">
        <h1>Управление номерами</h1>
        <button onClick={() => navigate('/admin/rooms/add')} className="btn-primary">
          + Добавить номер
        </button>
      </div>

      <div className="rooms-grid">
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <div className="room-image">
              {room.photos?.[0] ? (
                <img src={room.photos[0].photo_url} alt={room.name} />
              ) : (
                <div className="no-image">🏨</div>
              )}
              <span className={`status-badge ${room.status}`}>
                {room.status === 'active' ? '✓ Активен' : '✗ Скрыт'}
              </span>
            </div>
            
            <div className="room-info">
              <h3>{room.name}</h3>
              <p className="room-type">{typeLabels[room.type]}</p>
              <p className="room-price">{room.price} TJS/ночь</p>
              <p className="room-capacity">👥 {room.capacity} места</p>
            </div>

            <div className="room-actions">
              <button onClick={() => handleEdit(room.id)} className="btn-edit">
                ✏️ Редактировать
              </button>
              <button onClick={() => handleDelete(room.id)} className="btn-delete">
                🗑️ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

