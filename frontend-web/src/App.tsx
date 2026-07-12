import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages temporaires (nous les créerons plus tard)
const Login = () => <div className="p-10">Page de Login (A venir)</div>;
const AdminDashboard = () => <div className="p-10">Dashboard ADMIN</div>;
const RestaurantDashboard = () => <div className="p-10">Dashboard RESTAURANT</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Routes protégées pour ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Routes protégées pour RESTAURANT */}
        <Route element={<ProtectedRoute allowedRoles={['RESTAURANT']} />}>
          <Route path="/restaurant" element={<RestaurantDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}