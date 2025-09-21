import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Edit2, Trash2, Plus } from 'lucide-react';

function TripTimeline({ tripData, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState(tripData.timeline || []);

  const getDaysBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = [];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    return days;
  };

  const days = getDaysBetween(tripData.startDate, tripData.endDate);

  const getEventsForDay = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayNumber = (date) => {
    const startDate = new Date(tripData.startDate);
    const diffTime = Math.abs(date - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'destination':
        return <MapPin size={16} className="text-blue-600" />;
      case 'activity':
        return <Clock size={16} className="text-green-600" />;
      case 'transportation':
        return <Calendar size={16} className="text-purple-600" />;
      case 'accommodation':
        return <Users size={16} className="text-orange-600" />;
      default:
        return <Calendar size={16} className="text-gray-600" />;
    }
  };

  const getEventColor = (type) => {
    const colors = {
      destination: 'bg-blue-100 border-blue-300 text-blue-800',
      activity: 'bg-green-100 border-green-300 text-green-800',
      transportation: 'bg-purple-100 border-purple-300 text-purple-800',
      accommodation: 'bg-orange-100 border-orange-300 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trip Timeline</h2>
            <p className="text-sm text-gray-600 mt-1">
              Day-by-day schedule for your {tripData.title}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-8">
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={dayIndex} className="relative">
                {/* Day Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full font-bold">
                    {getDayNumber(day)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {getDayNumber(day)}
                    </h3>
                    <p className="text-sm text-gray-600">{formatDate(day)}</p>
                  </div>
                </div>

                {/* Events */}
                <div className="ml-6 pl-6 border-l-2 border-gray-200 relative">
                  {dayEvents.length === 0 ? (
                    <div className="py-4 text-gray-500 text-sm italic">
                      No events scheduled for this day
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dayEvents
                        .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
                        .map((event, eventIndex) => (
                          <div
                            key={event.id}
                            className={`relative p-4 rounded-lg border-l-4 ${getEventColor(event.type)}`}
                          >
                            {/* Timeline dot */}
                            <div className="absolute -left-8 top-4 w-4 h-4 bg-white border-2 border-primary-400 rounded-full"></div>
                            
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {getEventIcon(event.type)}
                                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                                  {event.time && (
                                    <span className="text-sm text-gray-600">
                                      at {event.time}
                                    </span>
                                  )}
                                </div>
                                
                                {event.description && (
                                  <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                                )}
                                
                                {event.location && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <MapPin size={12} />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-4">
                                <button
                                  onClick={() => {
                                    setEditingEvent(event);
                                    setShowAddModal(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit event"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this event?')) {
                                      const updatedEvents = events.filter(e => e.id !== event.id);
                                      setEvents(updatedEvents);
                                      onUpdate({ ...tripData, timeline: updatedEvents });
                                    }
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete event"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <EventModal
          event={editingEvent}
          tripData={tripData}
          onSave={(eventData) => {
            let updatedEvents;
            if (editingEvent) {
              updatedEvents = events.map(e => 
                e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e
              );
            } else {
              updatedEvents = [...events, { ...eventData, id: Date.now().toString() }];
            }
            setEvents(updatedEvents);
            onUpdate({ ...tripData, timeline: updatedEvents });
            setShowAddModal(false);
            setEditingEvent(null);
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

// Event Modal Component
function EventModal({ event, tripData, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || tripData.startDate,
    time: event?.time || '',
    location: event?.location || '',
    type: event?.type || 'activity'
  });

  const eventTypes = [
    { value: 'destination', label: 'Destination Visit' },
    { value: 'activity', label: 'Activity/Attraction' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'accommodation', label: 'Accommodation' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {event ? 'Edit Event' : 'Add Event'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Event title"
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
                {eventTypes.map((type) => (
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
                placeholder="Event location"
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
                placeholder="Event description"
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
                {event ? 'Update' : 'Add'} Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TripTimeline;