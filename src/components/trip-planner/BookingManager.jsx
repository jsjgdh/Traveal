import { useState } from 'react';
import { Plus, Plane, Hotel, Car, Train, Calendar, Clock, DollarSign, FileText, Edit2, Trash2, Download, Upload } from 'lucide-react';

function BookingManager({ tripData, onUpdate }) {
  const [bookings, setBookings] = useState(tripData.bookings || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    type: 'flight',
    title: '',
    confirmationNumber: '',
    date: '',
    time: '',
    cost: '',
    notes: '',
    receipt: null
  });

  const bookingTypes = [
    { value: 'flight', label: 'Flight', icon: Plane, color: 'blue' },
    { value: 'hotel', label: 'Hotel', icon: Hotel, color: 'green' },
    { value: 'car', label: 'Car Rental', icon: Car, color: 'purple' },
    { value: 'train', label: 'Train', icon: Train, color: 'orange' },
    { value: 'other', label: 'Other', icon: Calendar, color: 'gray' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newBooking = {
      id: editingBooking ? editingBooking.id : Date.now().toString(),
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      addedDate: editingBooking ? editingBooking.addedDate : new Date().toISOString()
    };

    let updatedBookings;
    if (editingBooking) {
      updatedBookings = bookings.map(b => 
        b.id === editingBooking.id ? newBooking : b
      );
    } else {
      updatedBookings = [...bookings, newBooking];
    }

    setBookings(updatedBookings);
    onUpdate({ ...tripData, bookings: updatedBookings });
    
    // Reset form
    setFormData({
      type: 'flight',
      title: '',
      confirmationNumber: '',
      date: '',
      time: '',
      cost: '',
      notes: '',
      receipt: null
    });
    setShowAddModal(false);
    setEditingBooking(null);
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      type: booking.type,
      title: booking.title,
      confirmationNumber: booking.confirmationNumber,
      date: booking.date,
      time: booking.time,
      cost: booking.cost.toString(),
      notes: booking.notes,
      receipt: booking.receipt
    });
    setShowAddModal(true);
  };

  const handleDelete = (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      setBookings(updatedBookings);
      onUpdate({ ...tripData, bookings: updatedBookings });
    }
  };

  const getBookingIcon = (type) => {
    const typeConfig = bookingTypes.find(t => t.value === type);
    const Icon = typeConfig ? typeConfig.icon : Calendar;
    const color = typeConfig ? typeConfig.color : 'gray';
    return <Icon size={20} className={`text-${color}-600`} />;
  };

  const getBookingTypeLabel = (type) => {
    const typeConfig = bookingTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.label : 'Other';
  };

  const getTotalCost = () => {
    return bookings.reduce((total, booking) => total + (booking.cost || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bookings & Reservations</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage flight, hotel, and transportation bookings
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Booking</span>
          </button>
        </div>

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Bookings</div>
              <div className="text-xl font-bold text-blue-900">{bookings.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Cost</div>
              <div className="text-xl font-bold text-green-900">{formatCurrency(getTotalCost())}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Flights</div>
              <div className="text-xl font-bold text-purple-900">
                {bookings.filter(b => b.type === 'flight').length}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Hotels</div>
              <div className="text-xl font-bold text-orange-900">
                {bookings.filter(b => b.type === 'hotel').length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bookings List */}
      <div className="p-6">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings added</h3>
            <p className="text-gray-600 mb-4">Add your flight, hotel, and transportation reservations</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add First Booking
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getBookingIcon(booking.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{booking.title}</h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {getBookingTypeLabel(booking.type)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          {booking.confirmationNumber && (
                            <div>Confirmation: <span className="font-mono">{booking.confirmationNumber}</span></div>
                          )}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{formatDate(booking.date)}</span>
                            </div>
                            {booking.time && (
                              <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{booking.time}</span>
                              </div>
                            )}
                            {booking.cost > 0 && (
                              <div className="flex items-center space-x-1">
                                <DollarSign size={14} />
                                <span>{formatCurrency(booking.cost)}</span>
                              </div>
                            )}
                          </div>
                          {booking.notes && (
                            <div className="text-gray-600 mt-2">{booking.notes}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {booking.receipt && (
                        <button
                          onClick={() => window.open(booking.receipt, '_blank')}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View receipt"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(booking)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit booking"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete booking"
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
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingBooking ? 'Edit Booking' : 'Add Booking'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {bookingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                    placeholder="e.g., Delhi to Goa Flight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmation Number
                  </label>
                  <input
                    type="text"
                    value={formData.confirmationNumber}
                    onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Booking reference number"
                  />
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
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Additional details..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingBooking(null);
                      setFormData({
                        type: 'flight',
                        title: '',
                        confirmationNumber: '',
                        date: '',
                        time: '',
                        cost: '',
                        notes: '',
                        receipt: null
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
                    {editingBooking ? 'Update' : 'Add'} Booking
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

export default BookingManager;