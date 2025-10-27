import { useState, useEffect } from 'react';
import adminApi from '../../utils/adminApi';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Панель управления</h1>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🏨</div>
          <div className="stat-info">
            <h3>Номера</h3>
            <p className="stat-value">{stats?.rooms?.total || 0}</p>
            <p className="stat-sub">Активных: {stats?.rooms?.active || 0}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Бронирования</h3>
            <p className="stat-value">{stats?.bookings?.total || 0}</p>
            <p className="stat-sub">Ожидают: {stats?.bookings?.pending || 0}</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Доход</h3>
            <p className="stat-value">{stats?.revenue?.toFixed(2) || 0} TJS</p>
            <p className="stat-sub">За текущий месяц</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Загрузка</h3>
            <p className="stat-value">{stats?.occupancy?.toFixed(1) || 0}%</p>
            <p className="stat-sub">Номеров занято</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h2>Последние бронирования</h2>
          <div className="chart-content">
            <p>График временно недоступен</p>
          </div>
        </div>

        <div className="chart-card">
          <h2>Статистика по месяцам</h2>
          <div className="chart-content">
            <p>График временно недоступен</p>
          </div>
        </div>
      </div>
    </div>
  );
}

