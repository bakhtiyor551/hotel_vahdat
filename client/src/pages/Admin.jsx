import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminLogin from '../components/admin/AdminLogin';
import Dashboard from '../components/admin/Dashboard';
import AdminRooms from '../components/admin/AdminRooms';
import AddRoomForm from '../components/admin/AddRoomForm';
import EditRoomForm from '../components/admin/EditRoomForm';
import AdminBookings from '../components/admin/AdminBookings';
import AdminReviews from '../components/admin/AdminReviews';
import AdminServices from '../components/admin/AdminServices';
import AdminGallery from '../components/admin/AdminGallery';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSettings from '../components/admin/AdminSettings';
import AdminFinance from '../components/admin/AdminFinance';
import './Admin.css';

// Публичный роут - только для неавторизованных
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return !token ? children : <Navigate to="/admin/dashboard" />;
};

// Приватный роут - только для авторизованных
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" />;
};

export default function Admin() {
  return (
    <Routes>
      <Route path="login" element={
        <PublicRoute>
          <AdminLogin />
        </PublicRoute>
      } />
      
      <Route path="" element={
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="rooms/add" element={<AddRoomForm />} />
        <Route path="rooms/edit/:id" element={<EditRoomForm />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

