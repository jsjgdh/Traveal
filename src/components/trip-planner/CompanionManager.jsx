import { useState } from 'react';
import { Plus, Users, Phone, Mail, Edit2, Trash2, UserPlus } from 'lucide-react';

function CompanionManager({ tripData, onUpdate }) {
  const [companions, setCompanions] = useState(tripData.companions || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompanion, setEditingCompanion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'traveler',
    emergencyContact: false
  });

  const companionRoles = [
    { value: 'traveler', label: 'Traveler', icon: Users },
    { value: 'organizer', label: 'Trip Organizer', icon: UserPlus },
    { value: 'emergency', label: 'Emergency Contact', icon: Phone },
    { value: 'local', label: 'Local Contact', icon: Mail }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newCompanion = {
      id: editingCompanion ? editingCompanion.id : Date.now().toString(),
      ...formData,
      addedDate: editingCompanion ? editingCompanion.addedDate : new Date().toISOString()
    };

    let updatedCompanions;
    if (editingCompanion) {
      updatedCompanions = companions.map(c => 
        c.id === editingCompanion.id ? newCompanion : c
      );
    } else {
      updatedCompanions = [...companions, newCompanion];
    }

    setCompanions(updatedCompanions);
    onUpdate({ ...tripData, companions: updatedCompanions });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'traveler',
      emergencyContact: false
    });
    setShowAddModal(false);
    setEditingCompanion(null);
  };

  const handleEdit = (companion) => {
    setEditingCompanion(companion);
    setFormData({
      name: companion.name,
      email: companion.email,
      phone: companion.phone,
      role: companion.role,
      emergencyContact: companion.emergencyContact
    });
    setShowAddModal(true);
  };

  const handleDelete = (companionId) => {
    if (window.confirm('Are you sure you want to remove this companion?')) {
      const updatedCompanions = companions.filter(c => c.id !== companionId);
      setCompanions(updatedCompanions);
      onUpdate({ ...tripData, companions: updatedCompanions });
    }
  };

  const getRoleIcon = (role) => {
    const roleConfig = companionRoles.find(r => r.value === role);
    const Icon = roleConfig ? roleConfig.icon : Users;
    return <Icon size={16} className="text-gray-600" />;
  };

  const getRoleLabel = (role) => {
    const roleConfig = companionRoles.find(r => r.value === role);
    return roleConfig ? roleConfig.label : 'Traveler';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Travel Companions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage travelers and emergency contacts for your trip
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Companion</span>
          </button>
        </div>
      </div>

      {/* Companions List */}
      <div className="p-6">
        {companions.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companions added</h3>
            <p className="text-gray-600 mb-4">Add travel companions and emergency contacts</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add First Companion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {companions.map((companion) => (
              <div key={companion.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getRoleIcon(companion.role)}
                      <h3 className="font-medium text-gray-900">{companion.name}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {getRoleLabel(companion.role)}
                      </span>
                      {companion.emergencyContact && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {companion.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail size={14} />
                          <span>{companion.email}</span>
                        </div>
                      )}
                      {companion.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone size={14} />
                          <span>{companion.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(companion)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit companion"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(companion.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove companion"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCompanion ? 'Edit Companion' : 'Add Companion'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter companion's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {companionRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emergencyContact"
                    checked={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="emergencyContact" className="ml-2 text-sm text-gray-700">
                    Emergency contact
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCompanion(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        role: 'traveler',
                        emergencyContact: false
                      });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    {editingCompanion ? 'Update' : 'Add'} Companion
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanionManager;