import { useState, useEffect, useRef } from 'react';
import adminApi from '../../utils/adminApi';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function EditRoomForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
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

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      const response = await adminApi.get(`/admin/rooms/${id}`);
      const room = response.data;
      
      setFormData({
        name: room.name || '',
        type: room.type || 'economy',
        price: room.price || '',
        currency: room.currency || 'TJS',
        capacity: room.capacity || 2,
        area: room.area || '',
        beds: room.beds || '',
        description: room.description || '',
        full_description: room.full_description || '',
        seo_title: room.seo_title || '',
        seo_description: room.seo_description || '',
        sort_order: room.sort_order || 0,
        status: room.status || 'active'
      });

      if (room.photos) {
        setExistingPhotos(room.photos);
      }

      if (room.amenities) {
        let amenityIds = [];
        
        try {
          // Если это уже массив
          if (Array.isArray(room.amenities)) {
            amenityIds = room.amenities;
          } 
          // Если это строка
          else if (typeof room.amenities === 'string') {
            // Пробуем распарсить как JSON
            const parsed = JSON.parse(room.amenities);
            
            if (Array.isArray(parsed)) {
              amenityIds = parsed;
            } else if (typeof parsed === 'string') {
              // Двойной JSON - парсим еще раз
              amenityIds = JSON.parse(parsed);
            }
          }
        } catch (e) {
          // Если не JSON, то это строка через запятую (старый формат)
          amenityIds = room.amenities.split(',').filter(Boolean);
        }
        
        setSelectedAmenities(Array.isArray(amenityIds) ? amenityIds : []);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки номера:', error);
      alert('Ошибка загрузки номера');
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
    
    const totalPhotos = photos.length + validFiles.length;
    if (totalPhotos > 10) {
      alert('Максимум 10 фотографий');
      return;
    }
    
    const newPhotos = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeExistingPhoto = (photoId) => {
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const removeNewPhoto = (photoId) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId);
      if (photoToRemove && photoToRemove.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'photos') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Удобства сохраняем как JSON-массив
      formDataToSend.append('amenities', JSON.stringify(selectedAmenities));
      
      // Добавляем ID существующих фото, которые нужно сохранить
      const existingPhotoIds = existingPhotos.map(p => p.id);
      formDataToSend.append('existing_photo_ids', JSON.stringify(existingPhotoIds));

      // Добавляем новые фото
      photos.forEach(photo => {
        formDataToSend.append('photos', photo.file);
      });

      await adminApi.put(`/admin/rooms/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Номер успешно обновлен!');
      navigate('/admin/rooms');
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Ошибка при обновлении номера');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoom) {
    return <div className="text-center py-20">Загрузка данных номера...</div>;
  }

  return (
    <div className="add-room-form">
      <div className="form-header">
        <h1>Редактировать номер</h1>
        <button onClick={() => navigate('/admin/rooms')} className="btn-secondary">
          ← Назад
        </button>
      </div>

      <form onSubmit={handleSubmit}>
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
                placeholder="Например: Делюкс Люкс"
                required
              />
            </div>

            <div className="form-group">
              <label>Тип номера *</label>
              <select name="type" value={formData.type} onChange={handleInputChange} required>
                <option value="economy">Эконом</option>
                <option value="standard">Стандарт</option>
                <option value="luxury">Люкс</option>
                <option value="suite">Сьют</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Цена за ночь (TJS) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Вместимость *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                required
              />
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
              />
            </div>

            <div className="form-group">
              <label>Количество кроватей</label>
              <input
                type="text"
                name="beds"
                value={formData.beds}
                onChange={handleInputChange}
                placeholder="Например: 2 кровати"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Краткое описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Краткое описание номера"
            />
          </div>

          <div className="form-group">
            <label>Полное описание</label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleInputChange}
              rows="5"
              placeholder="Подробное описание номера"
            />
          </div>
        </section>

        {/* Фотографии */}
        <section className="form-section">
          <h2>Фотографии</h2>
          
          {/* Существующие фото */}
          {existingPhotos.length > 0 && (
            <div className="photos-grid">
              {existingPhotos.map(photo => (
                <div key={photo.id} className="photo-item">
                  <img src={photo.photo_url} alt="Room" />
                  <button 
                    type="button"
                    onClick={() => removeExistingPhoto(photo.id)}
                    className="remove-photo-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Новые фото */}
          {photos.length > 0 && (
            <div className="photos-grid">
              {photos.map(photo => (
                <div key={photo.id} className="photo-item">
                  <img src={photo.preview} alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => removeNewPhoto(photo.id)}
                    className="remove-photo-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className={`photo-upload-area ${isDragging ? 'dragging' : ''} ${photos.length === 0 && existingPhotos.length === 0 ? 'empty' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">📷</div>
            <p>Перетащите фото сюда или нажмите для выбора</p>
            <p className="upload-hint">Максимум 10 фотографий, до 3 МБ каждая</p>
          </div>
        </section>

        {/* Удобства */}
        <section className="form-section">
          <h2>Удобства</h2>
          <div className="amenities-grid">
            {AMENITIES_OPTIONS.map(amenity => {
              const isChecked = selectedAmenities.includes(amenity.id);
              console.log(`Amenity ${amenity.id}: checked=${isChecked}, label=${amenity.label}`);
              return (
                <div key={amenity.id} className="amenity-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAmenityChange(amenity.id)}
                    />
                    <span className="amenity-icon">{amenity.icon}</span>
                    <span className="amenity-label">{amenity.label}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEO */}
        <section className="form-section">
          <h2>SEO настройки</h2>
          
          <div className="form-group">
            <label>SEO заголовок</label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>SEO описание</label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
        </section>

        {/* Дополнительно */}
        <section className="form-section">
          <h2>Дополнительные настройки</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Статус</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Активен</option>
                <option value="inactive">Скрыт</option>
              </select>
            </div>

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
          </div>
        </section>

        {/* Кнопки */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/rooms')} className="btn-secondary">
            Отмена
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
}

