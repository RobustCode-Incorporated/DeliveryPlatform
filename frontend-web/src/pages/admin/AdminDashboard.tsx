import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/RobustCodelogowhite.png';

export const AdminDashboard = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'drivers', label: 'Chauffeurs' },
    { id: 'orders', label: 'Commandes' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFFAFA] font-['ABeeZee',sans-serif]">
      {/* Header */}
      <header className="bg-black flex flex-wrap md:flex-nowrap justify-between items-center px-5 py-3 md:px-10 gap-4 shadow-md">
        <div className="flex flex-col items-center min-w-[150px]">
          <img src={logoImage} alt="Logo RDM" className="w-[120px] md:w-[140px] h-auto" />
          <h1 className="text-[0.6rem] md:text-[0.65rem] text-[#FFFAFA] tracking-[1.5px] uppercase font-normal mt-0.5 whitespace-nowrap">
            ROBUST DELIVERY MANAGEMENT
          </h1>
        </div>

        <div className="flex items-center gap-6 flex-1 justify-end overflow-hidden">
          <nav className="flex gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`text-[0.85rem] transition-colors ${
                  currentTab === item.id ? 'text-white font-bold' : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <button 
            onClick={handleLogout}
            className="bg-transparent text-white border border-[#333] px-4 py-1.5 rounded-[20px] text-[0.75rem] transition-all hover:bg-white hover:text-black whitespace-nowrap"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-[30px_50px] overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wider">
            {menuItems.find(i => i.id === currentTab)?.label}
          </h2>
          
          {/* Affichage conditionnel des statistiques pour le Dashboard */}
          {currentTab === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-gray-500">Total Restaurants</h3>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-gray-500">Commandes en cours</h3>
                <p className="text-2xl font-bold">45</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-gray-500">Chauffeurs Actifs</h3>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          ) : (
            <div className="min-h-[400px] bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600">
                Zone de gestion : {menuItems.find(i => i.id === currentTab)?.label}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};