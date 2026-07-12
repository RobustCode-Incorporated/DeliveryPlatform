import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { RestaurantDashboard } from './pages/restaurant/RestaurantDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard'; // Import ajouté

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['RESTAURANT']} />}>
          <Route path="/restaurant" element={<RestaurantDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}