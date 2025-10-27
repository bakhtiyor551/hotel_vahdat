import { useState, useEffect } from 'react';
import adminApi from '../../utils/adminApi';
import './AdminFinance.css';

export default function AdminFinance() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    incomeType: '',
    expenseType: ''
  });

  // Формы
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    type: 'Номер',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    type: 'Персонал',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.incomeType) params.append('type', filters.incomeType);
      
      const paramsStr = params.toString();
      
      // Запросы для доходов, расходов и статистики
      const incomeParams = new URLSearchParams();
      if (filters.startDate) incomeParams.append('startDate', filters.startDate);
      if (filters.endDate) incomeParams.append('endDate', filters.endDate);
      if (filters.incomeType) incomeParams.append('type', filters.incomeType);
      
      const expenseParams = new URLSearchParams();
      if (filters.startDate) expenseParams.append('startDate', filters.startDate);
      if (filters.endDate) expenseParams.append('endDate', filters.endDate);
      if (filters.expenseType) expenseParams.append('type', filters.expenseType);
      
      const statsParams = new URLSearchParams();
      if (filters.startDate) statsParams.append('startDate', filters.startDate);
      if (filters.endDate) statsParams.append('endDate', filters.endDate);
      
      const [incomesRes, expensesRes, statsRes] = await Promise.all([
        adminApi.get(`/admin/finance/incomes?${incomeParams.toString()}`),
        adminApi.get(`/admin/finance/expenses?${expenseParams.toString()}`),
        adminApi.get(`/admin/finance/stats?${statsParams.toString()}`)
      ]);
      
      setIncomes(incomesRes.data);
      setExpenses(expensesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Ошибка загрузки финансов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/admin/finance/incomes', incomeForm);
      setShowIncomeModal(false);
      setIncomeForm({
        amount: '',
        type: 'Номер',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
      fetchData();
      alert('Запись успешно добавлена');
    } catch (error) {
      console.error('Ошибка добавления дохода:', error);
      alert('Ошибка при добавлении дохода');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/admin/finance/expenses', expenseForm);
      setShowExpenseModal(false);
      setExpenseForm({
        amount: '',
        type: 'Персонал',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
      fetchData();
      alert('Запись успешно добавлена');
    } catch (error) {
      console.error('Ошибка добавления расхода:', error);
      alert('Ошибка при добавлении расхода');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
    try {
      await adminApi.delete(`/admin/finance/incomes/${id}`);
      fetchData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
    try {
      await adminApi.delete(`/admin/finance/expenses/${id}`);
      fetchData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toFixed(2)} TJS`;
  };

  if (loading) {
    return <div className="finance-loading">Загрузка...</div>;
  }

  return (
    <div className="admin-finance">
      <div className="finance-header">
        <h1>💰 Финансовый контроль</h1>
        <div className="finance-actions">
          <button className="btn-add-income" onClick={() => setShowIncomeModal(true)}>
            ➕ Добавить доход
          </button>
          <button className="btn-add-expense" onClick={() => setShowExpenseModal(true)}>
            ➖ Добавить расход
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="finance-stats-grid">
        <div className="stat-card income">
          <h3>Общий доход</h3>
          <p className="stat-value">{formatCurrency(stats?.totalIncome)}</p>
        </div>
        <div className="stat-card expense">
          <h3>Общие расходы</h3>
          <p className="stat-value">{formatCurrency(stats?.totalExpense)}</p>
        </div>
        <div className="stat-card profit">
          <h3>Чистая прибыль</h3>
          <p className="stat-value">{formatCurrency(stats?.netProfit)}</p>
        </div>
        <div className="stat-card booking">
          <h3>Доход от бронирований</h3>
          <p className="stat-value">{formatCurrency(stats?.bookingIncome)}</p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="finance-filters">
        <h3>Фильтры</h3>
        <div className="filter-row">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="От"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            placeholder="До"
          />
          <button onClick={() => setFilters({ startDate: '', endDate: '', incomeType: '', expenseType: '' })}>
            Очистить
          </button>
        </div>
      </div>

      {/* Графики */}
      <div className="finance-charts">
        <div className="chart-card">
          <h3>Доход по типам</h3>
          <div className="chart-content">
            {stats?.incomesByType?.map((item) => (
              <div key={item.type} className="chart-item">
                <span className="chart-label">{item.type}</span>
                <div className="chart-bar">
                  <div 
                    className="chart-fill" 
                    style={{ 
                      width: `${((item.total / (stats.totalIncome || 1)) * 100)}%`,
                      backgroundColor: '#22c55e'
                    }} 
                  />
                </div>
                <span className="chart-value">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Расходы по категориям</h3>
          <div className="chart-content">
            {stats?.expensesByType?.map((item) => (
              <div key={item.type} className="chart-item">
                <span className="chart-label">{item.type}</span>
                <div className="chart-bar">
                  <div 
                    className="chart-fill" 
                    style={{ 
                      width: `${((item.total / (stats.totalExpense || 1)) * 100)}%`,
                      backgroundColor: '#ef4444'
                    }} 
                  />
                </div>
                <span className="chart-value">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Таблицы */}
      <div className="finance-tables">
        <div className="table-section">
          <h2>Доходы</h2>
          <div className="table-container">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Сумма</th>
                  <th>Комментарий</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td>{new Date(income.date).toLocaleDateString('ru-RU')}</td>
                    <td>{income.type}</td>
                    <td className="amount income">{formatCurrency(income.amount)}</td>
                    <td>{income.comment || '-'}</td>
                    <td>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteIncome(income.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-section">
          <h2>Расходы</h2>
          <div className="table-container">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Сумма</th>
                  <th>Комментарий</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString('ru-RU')}</td>
                    <td>{expense.type}</td>
                    <td className="amount expense">{formatCurrency(expense.amount)}</td>
                    <td>{expense.comment || '-'}</td>
                    <td>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Добавить доход</h2>
            <form onSubmit={handleAddIncome}>
              <div className="form-group">
                <label>Сумма *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Тип дохода *</label>
                <select
                  required
                  value={incomeForm.type}
                  onChange={(e) => setIncomeForm({ ...incomeForm, type: e.target.value })}
                >
                  <option>Номер</option>
                  <option>Ресторан</option>
                  <option>Услуги</option>
                  <option>Прочее</option>
                </select>
              </div>
              <div className="form-group">
                <label>Дата *</label>
                <input
                  type="date"
                  required
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Комментарий</label>
                <textarea
                  value={incomeForm.comment}
                  onChange={(e) => setIncomeForm({ ...incomeForm, comment: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-save">💾 Сохранить</button>
                <button type="button" className="btn-cancel" onClick={() => setShowIncomeModal(false)}>
                  🔙 Отменить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Добавить расход</h2>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label>Сумма *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Тип расхода *</label>
                <select
                  required
                  value={expenseForm.type}
                  onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                >
                  <option>Персонал</option>
                  <option>Коммунальные услуги</option>
                  <option>Закупки</option>
                  <option>Прочее</option>
                </select>
              </div>
              <div className="form-group">
                <label>Дата *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Комментарий</label>
                <textarea
                  value={expenseForm.comment}
                  onChange={(e) => setExpenseForm({ ...expenseForm, comment: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-save">💾 Сохранить</button>
                <button type="button" className="btn-cancel" onClick={() => setShowExpenseModal(false)}>
                  🔙 Отменить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

