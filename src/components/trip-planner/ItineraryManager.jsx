import { useState } from 'react';
import { Plus, Clock, MapPin, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';

function ItineraryManager({ tripData, onUpdate }) {
  const [itinerary, setItinerary] = useState(tripData.itinerary || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleSubmit = (itemData) => {
    let updatedItinerary;
    if (editingItem) {
      updatedItinerary = itinerary.map(item => 
        item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item
      );
    } else {
      updatedItinerary = [...itinerary, { ...itemData, id: Date.now().toString() }];
    }
    
    setItinerary(updatedItinerary);
    onUpdate({ ...tripData, itinerary: updatedItinerary });
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to delete this itinerary item?')) {
      const updatedItinerary = itinerary.filter(item => item.id !== itemId);
      setItinerary(updatedItinerary);
      onUpdate({ ...tripData, itinerary: updatedItinerary });
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      activity: <Clock size={16} className="text-blue-600" />,
      transportation: <MapPin size={16} className="text-green-600" />,
      accommodation: <Calendar size={16} className="text-purple-600" />,
      meal: <DollarSign size={16} className="text-orange-600" />
    };
    return icons[type] || <Calendar size={16} className="text-gray-600" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      activity: 'bg-blue-100 border-blue-300 text-blue-800',
      transportation: 'bg-green-100 border-green-300 text-green-800',
      accommodation: 'bg-purple-100 border-purple-300 text-purple-800',
      meal: 'bg-orange-100 border-orange-300 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trip Itinerary</h2>
            <p className="text-sm text-gray-600 mt-1">
              Plan activities, transportation, and accommodations
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Itinerary List */}
      <div className="p-6">
        {itinerary.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No itinerary items</h3>
            <p className="text-gray-600 mb-4">Add activities, transportation, and accommodations to your trip</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {itinerary
              .sort((a, b) => new Date(a.date) - new Date(b.date) || (a.time || '').localeCompare(b.time || ''))
              .map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-l-4 ${getActivityColor(item.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getActivityIcon(item.type)}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                            {formatDate(item.date)}
                          </span>
                          {item.time && (
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                              {item.time}
                            </span>
                          )}
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {item.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span>{item.location}</span>
                            </div>
                          )}
                          {item.cost && (
                            <div className="flex items-center space-x-1">
                              <DollarSign size={12} />
                              <span>₹{item.cost}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit item"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ItineraryModal
          item={editingItem}
          tripData={tripData}
          onSave={handleSubmit}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// Itinerary Modal Component
function ItineraryModal({ item, tripData, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    date: item?.date || tripData.startDate,
    time: item?.time || '',
    location: item?.location || '',
    type: item?.type || 'activity',
    cost: item?.cost || ''
  });

  const itemTypes = [
    { value: 'activity', label: 'Activity/Attraction', icon: Clock },
    { value: 'transportation', label: 'Transportation', icon: MapPin },
    { value: 'accommodation', label: 'Accommodation', icon: Calendar },
    { value: 'meal', label: 'Meal/Dining', icon: DollarSign }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {item ? 'Edit Itinerary Item' : 'Add Itinerary Item'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Visit Backwater Houseboat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {itemTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={tripData.startDate}
                  max={tripData.endDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Location name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional details..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {item ? 'Update' : 'Add'} Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ItineraryManager;