import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Check, X, Download, Filter, Search, Package, Shirt, Backpack, Umbrella, Camera } from 'lucide-react';

// Function to generate PDF content
const generatePDFContent = (items, tripData, getCategoryLabel) => {
  // Create a simple HTML structure for PDF generation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${tripData.title || 'Trip'} - Packing List</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        .stats { display: flex; justify-content: space-between; margin: 20px 0; }
        .stat-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #0ea5e9; }
        .stat-label { font-size: 14px; color: #666; }
        .progress-bar { height: 20px; background: #eee; border-radius: 10px; margin: 10px 0; overflow: hidden; }
        .progress-fill { height: 100%; background: #0ea5e9; }
        .item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .item-status { width: 30px; text-align: center; }
        .item-details { flex: 1; }
        .item-name { font-weight: bold; }
        .item-category { background: #e0f2fe; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
        .item-notes { font-size: 14px; color: #666; margin-top: 5px; }
        .packed { text-decoration: line-through; color: #999; }
      </style>
    </head>
    <body>
      <h1>${tripData.title || 'Trip'} - Packing List</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      
      <div class="stats">
        <div class="stat-box">
          <div class="stat-value">${items.length}</div>
          <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${items.filter(item => item.packed).length}</div>
          <div class="stat-label">Packed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${items.length > 0 ? Math.round((items.filter(item => item.packed).length / items.length) * 100) : 0}%</div>
          <div class="stat-label">Progress</div>
        </div>
      </div>
      
      <h2>Items</h2>
      ${items.map(item => `
        <div class="item ${item.packed ? 'packed' : ''}">
          <div class="item-status">${item.packed ? '✓' : '○'}</div>
          <div class="item-details">
            <span class="item-name">${item.quantity}x ${item.name}</span>
            <span class="item-category">${getCategoryLabel(item.category)}</span>
            ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  return htmlContent;
};

function AdvancedPackingListManager({ tripData, onUpdate }) {
  const [items, setItems] = useState(tripData.packingList || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'clothing',
    quantity: 1,
    packed: false,
    notes: ''
  });

  const categories = [
    { value: 'clothing', label: 'Clothing', icon: Shirt },
    { value: 'toiletries', label: 'Toiletries', icon: Package },
    { value: 'electronics', label: 'Electronics', icon: Camera },
    { value: 'documents', label: 'Documents', icon: Package },
    { value: 'medications', label: 'Medications', icon: Package },
    { value: 'accessories', label: 'Accessories', icon: Backpack },
    { value: 'other', label: 'Other', icon: Package }
  ];

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      const item = {
        id: Date.now().toString(),
        ...newItem,
        quantity: parseInt(newItem.quantity) || 1
      };
      
      setItems(prev => [...prev, item]);
      onUpdate({ ...tripData, packingList: [...items, item] });
      
      // Reset form
      setNewItem({
        name: '',
        category: 'clothing',
        quantity: 1,
        packed: false,
        notes: ''
      });
      setShowAddModal(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      packed: item.packed,
      notes: item.notes || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateItem = () => {
    if (newItem.name.trim() && editingItem) {
      const updatedItems = items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...newItem, quantity: parseInt(newItem.quantity) || 1 }
          : item
      );
      
      setItems(updatedItems);
      onUpdate({ ...tripData, packingList: updatedItems });
      
      // Reset form
      setNewItem({
        name: '',
        category: 'clothing',
        quantity: 1,
        packed: false,
        notes: ''
      });
      setEditingItem(null);
      setShowAddModal(false);
    }
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      onUpdate({ ...tripData, packingList: updatedItems });
    }
  };

  const togglePacked = (itemId) => {
    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { ...item, packed: !item.packed }
        : item
    );
    
    setItems(updatedItems);
    onUpdate({ ...tripData, packingList: updatedItems });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, filterCategory]);

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    const Icon = cat ? cat.icon : Package;
    return <Icon size={16} className="text-gray-600" />;
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : 'Other';
  };

  const packingStats = useMemo(() => {
    const total = items.length;
    const packed = items.filter(item => item.packed).length;
    const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
    
    return { total, packed, percentage };
  }, [items]);

  const exportPackingList = (format = 'txt') => {
    if (format === 'pdf') {
      // Generate HTML content for PDF
      const htmlContent = generatePDFContent(items, tripData, getCategoryLabel);
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      return;
    }
    
    // Original text export
    const listText = items.map(item => 
      `${item.packed ? '[✓]' : '[ ]'} ${item.quantity}x ${item.name} (${getCategoryLabel(item.category)})${item.notes ? ` - ${item.notes}` : ''}`
    ).join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripData.title || 'Trip'}_PackingList.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Packing List</h2>
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                <button
                  onClick={() => exportPackingList('txt')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as Text
                </button>
                <button
                  onClick={() => exportPackingList('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as PDF
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Items</div>
            <div className="text-2xl font-bold text-blue-900">{packingStats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Packed</div>
            <div className="text-2xl font-bold text-green-900">{packingStats.packed}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Progress</div>
            <div className="text-2xl font-bold text-purple-900">{packingStats.percentage}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Packing Progress</span>
            <span>{packingStats.packed}/{packingStats.total} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${packingStats.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Packing List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packing items yet</h3>
            <p className="text-gray-600 mb-4">Add items to your packing list to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center p-4 rounded-lg border transition-all ${
                  item.packed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => togglePacked(item.id)}
                  className={`flex items-center justify-center w-6 h-6 rounded-full border mr-4 transition-colors ${
                    item.packed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {item.packed && <Check size={14} />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(item.category)}
                    <span className={`font-medium ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  {item.notes && (
                    <p className={`text-sm mt-1 ${item.packed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                      {item.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit item"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
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
                {editingItem ? 'Edit Packing Item' : 'Add Packing Item'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., T-shirts, Toiletry bag"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Additional details (e.g., color, size, brand)"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="packed"
                    checked={newItem.packed}
                    onChange={(e) => setNewItem({ ...newItem, packed: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="packed" className="ml-2 text-sm text-gray-700">
                    Already packed
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      setNewItem({
                        name: '',
                        category: 'clothing',
                        quantity: 1,
                        packed: false,
                        notes: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedPackingListManager;