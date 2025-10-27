import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminGallery.css';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get('/api/admin/gallery', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(response.data);
    } catch (error) {
      console.error('Ошибка загрузки галереи:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Файл слишком большой (максимум 3 МБ)');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Файл должен быть изображением');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: file, preview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const uploadData = new FormData();
      uploadData.append('image', formData.image);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);

      await axios.post('/api/admin/gallery', uploadData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchImages();
      setShowModal(false);
      setFormData({ title: '', description: '', image: null });
      alert('Фото добавлено в галерею!');
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка при загрузке фото');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это фото?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(`/api/admin/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.message) {
        alert(response.data.message);
      } else {
        alert('Фото удалено');
      }
      
      await fetchImages();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      const errorMsg = error.response?.data?.error || 'Ошибка при удалении фото';
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-xl text-gray-600">Загрузка галереи...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-primary-800 mb-2">Фото-галерея</h1>
          <p className="text-gray-600">Управление фотографиями отеля</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Добавить фото
        </button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="gallery-card">
              <div className="gallery-image-wrapper">
                <img 
                  src={image.image_url} 
                  alt={image.title}
                  className="gallery-image"
                />
                <div className="gallery-overlay">
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="gallery-delete-btn"
                  >
                    🗑 Удалить
                  </button>
                </div>
              </div>
              <div className="gallery-info">
                <h3 className="font-bold text-lg">{image.title}</h3>
                {image.description && (
                  <p key={`desc-${image.id}`} className="text-gray-600 text-sm">{image.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Галерея пуста</h2>
          <p className="text-gray-600 mb-6">Добавьте фотографии отеля</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Добавить первое фото
          </button>
        </div>
      )}

      {/* Modal для добавления фото */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-primary text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Добавить фото в галерею</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gold text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary-800">
                  Загрузить фото
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-600 transition"
                  required
                />
                {formData.preview && (
                  <img 
                    src={formData.preview} 
                    alt="Preview" 
                    className="mt-4 rounded-xl max-h-64 w-full object-cover"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-primary-800">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Лобби отеля"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-primary-800">
                  Описание (необязательно)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание фото"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-600 transition"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 btn-primary"
                >
                  {uploading ? 'Загрузка...' : 'Добавить фото'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

