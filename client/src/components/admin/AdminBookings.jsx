import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBookings.css';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const statusColors = {
    pending: 'orange',
    confirmed: 'green',
    cancelled: 'red',
    completed: 'gray'
  };

  const statusLabels = {
    pending: 'Ожидает',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено'
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-bookings">
      <h1>Бронирования</h1>

      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Гость</th>
              <th>Контакты</th>
              <th>Номер</th>
              <th>Даты</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>
                  <strong>{booking.guest_name}</strong>
                  <br />
                  <small>{booking.guests} гостей</small>
                </td>
                <td>
                  <div>📧 {booking.guest_email}</div>
                  <div>📱 {booking.guest_phone}</div>
                </td>
                <td>
                  <strong>{booking.room_name}</strong>
                  <br />
                  <small>{booking.room_type}</small>
                </td>
                <td>
                  <div>📥 {new Date(booking.check_in).toLocaleDateString('ru')}</div>
                  <div>📤 {new Date(booking.check_out).toLocaleDateString('ru')}</div>
                </td>
                <td>
                  <span className={`status-badge ${statusColors[booking.status]}`}>
                    {statusLabels[booking.status]}
                  </span>
                </td>
                <td>
                  {booking.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="btn-confirm"
                      >
                        ✅ Подтвердить
                      </button>
                      <button 
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="btn-cancel"
                      >
                        ❌ Отменить
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div className="empty-state">
          <p>Нет бронирований</p>
        </div>
      )}
    </div>
  );
}

