import { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Download, Save, Book } from 'lucide-react';

function TripNotesManager({ tripData, onUpdate }) {
  const [notes, setNotes] = useState(tripData.notes || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });

  const noteCategories = [
    { value: 'general', label: 'General Notes', color: 'gray' },
    { value: 'planning', label: 'Trip Planning', color: 'blue' },
    { value: 'activities', label: 'Activities & Attractions', color: 'green' },
    { value: 'food', label: 'Food & Restaurants', color: 'orange' },
    { value: 'transport', label: 'Transportation', color: 'purple' },
    { value: 'accommodation', label: 'Accommodation', color: 'indigo' },
    { value: 'emergency', label: 'Emergency Info', color: 'red' },
    { value: 'budget', label: 'Budget & Expenses', color: 'yellow' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newNote = {
      id: editingNote ? editingNote.id : Date.now().toString(),
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdDate: editingNote ? editingNote.createdDate : new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    let updatedNotes;
    if (editingNote) {
      updatedNotes = notes.map(n => 
        n.id === editingNote.id ? newNote : n
      );
    } else {
      updatedNotes = [...notes, newNote];
    }

    setNotes(updatedNotes);
    onUpdate({ ...tripData, notes: updatedNotes });
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: ''
    });
    setShowAddModal(false);
    setEditingNote(null);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags.join(', ')
    });
    setShowAddModal(true);
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      onUpdate({ ...tripData, notes: updatedNotes });
    }
  };

  const getCategoryColor = (category) => {
    const categoryConfig = noteCategories.find(c => c.value === category);
    return categoryConfig ? categoryConfig.color : 'gray';
  };

  const getCategoryLabel = (category) => {
    const categoryConfig = noteCategories.find(c => c.value === category);
    return categoryConfig ? categoryConfig.label : 'General Notes';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportNotes = () => {
    const notesText = notes.map(note => 
      `${note.title}
${getCategoryLabel(note.category)}
${note.content}
Tags: ${note.tags.join(', ')}
Created: ${formatDate(note.createdDate)}

`
    ).join('---\n\n');
    
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripData.title || 'Trip'}_Notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const notesByCategory = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trip Notes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Keep track of important information, ideas, and reminders
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {notes.length > 0 && (
              <button
                onClick={exportNotes}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Download size={20} />
                <span>Export</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes Content */}
      <div className="p-6">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <Book size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-4">Start adding notes to keep track of important trip information</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add First Note
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(notesByCategory).map(([category, categoryNotes]) => (
              <div key={category}>
                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <span className={`w-3 h-3 rounded-full bg-${getCategoryColor(category)}-500 mr-2`}></span>
                  {getCategoryLabel(category)} ({categoryNotes.length})
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryNotes
                    .sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))
                    .map((note) => (
                      <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 flex-1">{note.title}</h4>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => handleEdit(note)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Edit note"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{note.content}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-2">
                            {note.tags.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {note.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                                {note.tags.length > 2 && (
                                  <span className="text-gray-400">+{note.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span>{formatDate(note.updatedDate)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingNote ? 'Edit Note' : 'Add Note'}
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
                    placeholder="Note title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {noteCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Write your note here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Separate tags with commas (e.g., restaurant, booking, important)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use tags to organize and find notes easily</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingNote(null);
                      setFormData({
                        title: '',
                        content: '',
                        category: 'general',
                        tags: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save size={18} />
                    <span>{editingNote ? 'Update' : 'Save'} Note</span>
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

export default TripNotesManager;