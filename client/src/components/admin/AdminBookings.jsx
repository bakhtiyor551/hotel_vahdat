import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBookings.css';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

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

  const filterBookings = () => {
    let filtered = bookings;

    // Поиск по имени, телефону, email, номеру
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.guest_name?.toLowerCase().includes(term) ||
        b.guest_phone?.toLowerCase().includes(term) ||
        b.guest_email?.toLowerCase().includes(term) ||
        b.room_name?.toLowerCase().includes(term) ||
        b.room_type?.toLowerCase().includes(term)
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Сортировка по дате создания (новые сначала)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredBookings(filtered);
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Вы уверены, что хотите изменить статус на "${getStatusLabel(status)}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchBookings();
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchBookings();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении');
    }
  };

  const statusColors = {
    pending: 'bg-orange-100 text-orange-800 border-orange-500',
    confirmed: 'bg-green-100 text-green-800 border-green-500',
    cancelled: 'bg-red-100 text-red-800 border-red-500',
    completed: 'bg-gray-100 text-gray-800 border-gray-500'
  };

  const statusLabels = {
    pending: '⏳ Ожидает',
    confirmed: '✅ Подтверждено',
    cancelled: '❌ Отменено',
    completed: '✓ Завершено'
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Ожидает',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено',
      completed: 'Завершено'
    };
    return labels[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    return `inline-block px-3 py-1 rounded-full text-sm font-semibold border-2 ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-xl text-gray-600">Загрузка бронирований...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-800 mb-2">Бронирования</h1>
        <p className="text-gray-600">Управление бронированиями номеров</p>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-primary-800">Поиск</label>
            <input
              type="text"
              placeholder="Имя, телефон, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-600 transition"
            />
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-primary-800">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-600 transition"
            >
              <option value="all">Все статусы</option>
              <option value="pending">⏳ Ожидает</option>
              <option value="confirmed">✅ Подтверждено</option>
              <option value="cancelled">❌ Отменено</option>
              <option value="completed">✓ Завершено</option>
            </select>
          </div>

          {/* Статистика */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-primary-800">Статистика</label>
            <div className="bg-primary-50 px-4 py-3 rounded-xl border border-primary-200">
              <span className="text-2xl font-bold text-primary-800">{filteredBookings.length}</span>
              <span className="text-gray-600 ml-2">бронирований</span>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      {filteredBookings.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-primary text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Гость</th>
                  <th className="px-6 py-4 text-left font-bold">Контакты</th>
                  <th className="px-6 py-4 text-left font-bold">Номер</th>
                  <th className="px-6 py-4 text-left font-bold">Даты</th>
                  <th className="px-6 py-4 text-left font-bold">Статус</th>
                  <th className="px-6 py-4 text-left font-bold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking, idx) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary-800">{booking.guest_name}</div>
                      <div className="text-sm text-gray-500">👥 {booking.guests} гостей</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {booking.guest_email && (
                          <div className="text-gray-700">📧 {booking.guest_email}</div>
                        )}
                        <div className="text-gray-700">📱 {booking.guest_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary-800">{booking.room_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500 capitalize">{booking.room_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-700">📥 {new Date(booking.check_in).toLocaleDateString('ru')}</div>
                        <div className="text-gray-700">📤 {new Date(booking.check_out).toLocaleDateString('ru')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadgeClass(booking.status)}>
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Кнопка просмотра */}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition text-sm font-semibold"
                        >
                          👁
                        </button>
                        
                        {/* Действия в зависимости от статуса */}
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(booking.id, 'confirmed')}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition text-sm font-semibold"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        
                        {/* Удаление */}
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Нет бронирований</h2>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Попробуйте изменить фильтры' 
              : 'Бронирования будут отображаться здесь'}
          </p>
        </div>
      )}

      {/* Модальное окно деталей */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-primary text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Детали бронирования #{selectedBooking.id}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gold text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">Имя гостя</label>
                  <p className="text-lg font-bold text-primary-800">{selectedBooking.guest_name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Количество гостей</label>
                  <p className="text-lg font-bold text-primary-800">{selectedBooking.guests} гостей</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Телефон</label>
                  <p className="text-lg font-bold text-primary-800">{selectedBooking.guest_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Email</label>
                  <p className="text-lg font-bold text-primary-800">{selectedBooking.guest_email || 'Не указан'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Дата заезда</label>
                  <p className="text-lg font-bold text-primary-800">{new Date(selectedBooking.check_in).toLocaleDateString('ru')}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Дата выезда</label>
                  <p className="text-lg font-bold text-primary-800">{new Date(selectedBooking.check_out).toLocaleDateString('ru')}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Номер</label>
                  <p className="text-lg font-bold text-primary-800">{selectedBooking.room_name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Тип номера</label>
                  <p className="text-lg font-bold text-primary-800 capitalize">{selectedBooking.room_type}</p>
                </div>
              </div>
              
              {selectedBooking.special_requests && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">Комментарий</label>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl mt-2">{selectedBooking.special_requests}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold text-gray-500">Статус</label>
                <span className={getStatusBadgeClass(selectedBooking.status)}>
                  {statusLabels[selectedBooking.status]}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition"
                >
                  Закрыть
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    updateStatus(selectedBooking.id, 'confirmed');
                  }}
                  className="flex-1 btn-primary"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

