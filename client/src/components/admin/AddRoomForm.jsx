import { useState, useEffect, useRef } from 'react';
import adminApi from '../../utils/adminApi';
import { useNavigate } from 'react-router-dom';
import './AddRoomForm.css';

const AMENITIES_OPTIONS = [
  { id: 'wifi', label: 'Wi-Fi', icon: '🌐' },
  { id: 'air_conditioning', label: 'Кондиционер', icon: '❄️' },
  { id: 'tv', label: 'Телевизор', icon: '📺' },
  { id: 'breakfast', label: 'Завтрак', icon: '🥐' },
  { id: 'bathroom', label: 'Ванная', icon: '🚿' },
  { id: 'minibar', label: 'Мини-бар', icon: '🍾' },
  { id: 'safe', label: 'Сейф', icon: '🔒' },
  { id: 'balcony', label: 'Балкон', icon: '🌅' },
  { id: 'jacuzzi', label: 'Джакузи', icon: '💧' },
  { id: 'parking', label: 'Парковка', icon: '🚗' },
  { id: 'pet_friendly', label: 'Разрешены животные', icon: '🐕' },
  { id: 'smoking', label: 'Курящий', icon: '🚬' },
];

export default function AddRoomForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'economy',
    price: '',
    currency: 'TJS',
    capacity: 2,
    area: '',
    beds: '',
    description: '',
    full_description: '',
    seo_title: '',
    seo_description: '',
    sort_order: 0,
    status: 'active'
  });

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAmenityChange = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // Проверяем размер файлов и формат
    const validFiles = [];
    for (const file of fileArray) {
      if (file.size > 3 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой (максимум 3 МБ)`);
        continue;
      }
      
      if (!file.type.startsWith('image/')) {
        alert(`Файл ${file.name} не является изображением`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Ограничение на общее количество фото
    const totalPhotos = photos.length + validFiles.length;
    if (totalPhotos > 10) {
      alert('Максимум 10 фотографий');
      validFiles.splice(0, 10 - photos.length);
    }
    
    const newPhotos = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removePhoto = (id) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const setPrimaryPhoto = (targetId) => {
    setPhotos(prev => {
      const reordered = prev.map(p => ({ ...p, isPrimary: p.id === targetId }));
      // Перемещаем основное фото в начало
      const newPrimaryIndex = reordered.findIndex(p => p.id === targetId);
      if (newPrimaryIndex > 0) {
        const newOrder = [...reordered];
        const [primaryPhoto] = newOrder.splice(newPrimaryIndex, 1);
        return [primaryPhoto, ...newOrder];
      }
      return reordered;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Название должно быть не менее 3 символов';
    }
    
    if (!formData.type) {
      newErrors.type = 'Выберите категорию';
    }
    
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Цена должна быть больше 0';
    }
    
    const capacity = parseInt(formData.capacity);
    if (!formData.capacity || isNaN(capacity) || capacity < 1) {
      newErrors.capacity = 'Количество гостей должно быть минимум 1';
    }
    
    // Фото больше не обязательны
    
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Краткое описание должно быть не менее 10 символов';
    }
    
    if (!formData.full_description || formData.full_description.trim().length < 20) {
      newErrors.full_description = 'Полное описание должно быть не менее 20 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Основная информация
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('capacity', String(formData.capacity));
      if (formData.area) formDataToSend.append('area', String(formData.area));
      if (formData.beds) formDataToSend.append('beds', formData.beds);
      
      // Описания
      formDataToSend.append('description', formData.description);
      formDataToSend.append('full_description', formData.full_description);
      
      // Удобства (как JSON массив)
      formDataToSend.append('amenities', JSON.stringify(selectedAmenities));
      
      // SEO
      if (formData.seo_title) formDataToSend.append('seo_title', formData.seo_title);
      if (formData.seo_description) formDataToSend.append('seo_description', formData.seo_description);
      
      // Дополнительно
      formDataToSend.append('sort_order', String(formData.sort_order));
      formDataToSend.append('status', formData.status);
      
      // Добавляем фото
      photos.forEach((photo) => {
        formDataToSend.append('photos', photo.file);
      });
      
      // Отправляем запрос
      const response = await adminApi.post('/admin/rooms', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Показываем уведомление об успехе
      alert('✅ Номер успешно добавлен');
      
      // Перенаправляем на страницу списка номеров
      navigate('/admin/rooms');
      
    } catch (error) {
      console.error('Ошибка при добавлении номера:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка при добавлении номера';
      alert('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-room-container">
      <div className="add-room-header">
        <h1>Добавить новый номер</h1>
        <button 
          onClick={() => navigate('/admin/rooms')} 
          className="btn-secondary"
        >
          ← Вернуться к списку
        </button>
      </div>

      <form onSubmit={handleSubmit} className="add-room-form">
        {/* Основная информация */}
        <section className="form-section">
          <h2>Основная информация</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Название номера *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Например: Стандартный двухместный номер"
                required
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Категория *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="economy">Эконом</option>
                <option value="standard">Стандарт</option>
                <option value="luxury">Люкс</option>
              </select>
              {errors.type && <span className="error">{errors.type}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Цена за ночь *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
              {errors.price && <span className="error">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Валюта *</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                required
              >
                <option value="TJS">TJS (сомони)</option>
                <option value="USD">USD (доллары)</option>
                <option value="RUB">RUB (рубли)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Количество гостей *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
              />
              {errors.capacity && <span className="error">{errors.capacity}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Площадь (м²)</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Кровати</label>
              <input
                type="text"
                name="beds"
                value={formData.beds}
                onChange={handleInputChange}
                placeholder="Например: 1 двуспальная"
              />
            </div>
          </div>
        </section>

        {/* Описания */}
        <section className="form-section">
          <h2>Описание</h2>
          
          <div className="form-group">
            <label>Краткое описание * (2-3 строки для карточки)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Краткое описание номера..."
              required
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Полное описание * (детальное описание номера)</label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleInputChange}
              rows="8"
              placeholder="Полное описание номера со всеми деталями..."
              required
            />
            {errors.full_description && <span className="error">{errors.full_description}</span>}
          </div>
        </section>

        {/* Удобства */}
        <section className="form-section">
          <h2>Удобства</h2>
          <div className="amenities-grid">
            {AMENITIES_OPTIONS.map(amenity => (
              <label key={amenity.id} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => handleAmenityChange(amenity.id)}
                />
                <span className="amenity-icon">{amenity.icon}</span>
                <span className="amenity-label">{amenity.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Фотографии */}
        <section className="form-section">
          <h2>Фотографии номера</h2>
          
          <div 
            className={`photo-upload-area ${isDragging ? 'dragging' : ''} ${photos.length === 0 ? 'empty' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            
            {photos.length === 0 ? (
              <div className="upload-placeholder">
                <div className="upload-icon">📸</div>
                <p>Перетащите фото сюда или нажмите для выбора</p>
                <small>Форматы: JPG, PNG, WebP (максимум 3 МБ каждое)</small>
              </div>
            ) : null}
            
            {photos.length > 0 && (
              <div className="photo-preview-grid">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="photo-preview-item">
                    <div className="photo-actions">
                      {index === 0 && <span className="primary-badge">Основное</span>}
                      {index !== 0 && (
                        <button 
                          type="button"
                          onClick={() => setPrimaryPhoto(photo.id)}
                          className="btn-set-primary"
                        >
                          Сделать основным
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="btn-remove-photo"
                      >
                        ✕
                      </button>
                    </div>
                    <img src={photo.preview} alt={`Preview ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {errors.photos && <span className="error">{errors.photos}</span>}
          
          {photos.length > 0 && photos.length < 10 && (
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="btn-add-more-photos"
            >
              + Добавить еще фото
            </button>
          )}
        </section>

        {/* SEO */}
        <section className="form-section">
          <h2>SEO настройки</h2>
          
          <div className="form-group">
            <label>SEO Title</label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleInputChange}
              placeholder="Заголовок для поисковых систем"
            />
          </div>

          <div className="form-group">
            <label>SEO Description</label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleInputChange}
              rows="2"
              placeholder="Описание для поисковых систем"
            />
          </div>
        </section>

        {/* Дополнительно */}
        <section className="form-section">
          <h2>Дополнительно</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Порядок сортировки</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Статус *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
              </select>
            </div>
          </div>
        </section>

        {/* Кнопки действий */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/rooms')} 
            className="btn-cancel"
          >
            Отменить
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : '💾 Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}

