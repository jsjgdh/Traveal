import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Bookmark } from 'lucide-react';
import TripPlannerList from '../components/trip-planner/TripPlannerList';
import CreateTripModal from '../components/trip-planner/CreateTripModal';
import TripPlanDetails from '../components/trip-planner/TripPlanDetails';
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from '../components/notifications';

function TripPlannerPage() {
  const [tripPlans, setTripPlans] = useState([]);
  const [selectedTripPlan, setSelectedTripPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadTripPlans();
  }, [filter]);

  const loadTripPlans = async () => {
    try {
      setIsLoading(true);
      const mockTripPlans = [
        {
          id: '1',
          title: 'Kerala Backwaters Adventure',
          description: 'A scenic journey through Kerala backwaters',
          startDate: new Date('2024-12-15'),
          endDate: new Date('2024-12-20'),
          status: 'planned',
          destinations: [
            { name: 'Kochi', city: 'Kochi', country: 'India' },
            { name: 'Alleppey', city: 'Alleppey', country: 'India' }
          ],
          companions: 3,
          totalBudget: 50000,
          currency: 'INR',
          createdAt: new Date('2024-11-01')
        }
      ];
      
      let filteredPlans = mockTripPlans;
      if (filter === 'upcoming') {
        const now = new Date();
        filteredPlans = mockTripPlans.filter(plan => plan.startDate > now);
      } else if (filter === 'draft') {
        filteredPlans = mockTripPlans.filter(plan => plan.status === 'draft');
      }
      
      setTripPlans(filteredPlans);
    } catch (error) {
      console.error('Error loading trip plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = (tripData) => {
    const newTrip = {
      id: Date.now().toString(),
      ...tripData,
      status: 'draft',
      companions: 0,
      createdAt: new Date()
    };
    
    setTripPlans(prev => [newTrip, ...prev]);
    setShowCreateModal(false);
  };

  const handleSelectTrip = (tripPlan) => {
    setSelectedTripPlan(tripPlan);
  };

  const handleBackToList = () => {
    setSelectedTripPlan(null);
  };

  if (selectedTripPlan) {
    return (
      <TripPlanDetails 
        tripPlan={selectedTripPlan}
        onBack={handleBackToList}
        onUpdate={(updatedTrip) => {
          setTripPlans(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
          setSelectedTripPlan(updatedTrip);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Trip Planner</h1>
              <p className="text-sm text-gray-600">Plan and organize your travel adventures</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-4 py-2 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>New Trip</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tripPlans.length}</p>
                <p className="text-sm text-gray-600">Total Trips</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 pb-6">
        <TripPlannerList 
          tripPlans={tripPlans}
          isLoading={isLoading}
          onSelectTrip={handleSelectTrip}
          onDeleteTrip={(tripId) => {
            setTripPlans(prev => prev.filter(t => t.id !== tripId));
          }}
        />
      </main>

      <CreateTripModal
        isVisible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTrip={handleCreateTrip}
      />
    </div>
  );
}

export default TripPlannerPage;