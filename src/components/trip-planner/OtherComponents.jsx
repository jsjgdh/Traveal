// Placeholder components for trip planner features

import { Users, Plus, Mail, Phone, Shield } from 'lucide-react';

export function CompanionManager({ tripData, onUpdate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Travel Companions</h2>
        <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
          <Plus size={16} />
          <span>Add Companion</span>
        </button>
      </div>
      
      <div className="text-center py-8">
        <Users size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-3">No companions added yet</p>
        <p className="text-sm text-gray-400">Add travel companions and emergency contacts</p>
      </div>
    </div>
  );
}

export function BookingManager({ tripData, onUpdate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Booking Organizer</h2>
        <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
          <Plus size={16} />
          <span>Add Booking</span>
        </button>
      </div>
      
      <div className="text-center py-8">
        <Shield size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-3">No bookings organized yet</p>
        <p className="text-sm text-gray-400">Store flight, hotel, and transport confirmations</p>
      </div>
    </div>
  );
}

export function PackingListManager({ tripData, onUpdate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Packing List</h2>
        <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>
      
      <div className="text-center py-8">
        <Plus size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-3">Your packing list is empty</p>
        <p className="text-sm text-gray-400">Create a checklist to prepare for your trip</p>
      </div>
    </div>
  );
}

export function TripNotesManager({ tripData, onUpdate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Notes</h2>
      
      <textarea
        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="Add your trip notes, important reminders, or any other information..."
        defaultValue={tripData.notes || ''}
      />
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Last updated: Never
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Save Draft
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

// Default exports for individual components
export default CompanionManager;