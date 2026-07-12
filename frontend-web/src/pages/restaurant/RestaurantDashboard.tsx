import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const RestaurantDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Restaurant</h1>
          <p className="text-gray-600">Bienvenue, ID Restaurant : {user?.id}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Déconnexion
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Commandes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Commandes à traiter</h2>
          <div className="text-gray-400 italic">Aucune commande pour le moment.</div>
        </div>

        {/* Section Statistiques / Infos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Statut du restaurant</h2>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-green-600 font-medium">Ouvert</span>
          </div>
        </div>
      </div>
    </div>
  );
};