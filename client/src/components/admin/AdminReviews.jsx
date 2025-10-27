import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminReviews.css';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/admin/reviews', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/reviews/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить отзыв?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-reviews">
      <h1>Отзывы гостей</h1>

      <div className="reviews-filters">
        <button 
          onClick={() => setFilter('all')} 
          className={filter === 'all' ? 'active' : ''}
        >
          Все
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={filter === 'pending' ? 'active' : ''}
        >
          На модерации
        </button>
        <button 
          onClick={() => setFilter('approved')} 
          className={filter === 'approved' ? 'active' : ''}
        >
          Одобренные
        </button>
        <button 
          onClick={() => setFilter('rejected')} 
          className={filter === 'rejected' ? 'active' : ''}
        >
          Отклоненные
        </button>
      </div>

      <div className="reviews-grid">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div>
                <h3>{review.guest_name}</h3>
                <p className="review-date">
                  {new Date(review.created_at).toLocaleDateString('ru')}
                </p>
              </div>
              <div className="review-rating">
                {'⭐'.repeat(review.rating)}
              </div>
            </div>

            <p className="review-comment">{review.comment}</p>

            <div className="review-footer">
              <span className={`status-badge ${review.status}`}>
                {review.status === 'pending' && '⏳ Ожидает модерации'}
                {review.status === 'approved' && '✅ Одобрено'}
                {review.status === 'rejected' && '❌ Отклонено'}
              </span>

              {review.status === 'pending' && (
                <div className="review-actions">
                  <button 
                    onClick={() => updateStatus(review.id, 'approved')}
                    className="btn-approve"
                  >
                    ✅ Одобрить
                  </button>
                  <button 
                    onClick={() => updateStatus(review.id, 'rejected')}
                    className="btn-reject"
                  >
                    ❌ Отклонить
                  </button>
                </div>
              )}

              {review.status !== 'pending' && (
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="btn-delete"
                >
                  🗑️ Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="empty-state">
          <p>Нет отзывов</p>
        </div>
      )}
    </div>
  );
}

