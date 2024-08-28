import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Item from '../Item/Item';
import ItemForm from '../ItemForm/ItemForm';
import './index.css';

// Helper function to map fetched item to the format used by the user inventory
function mapFetchedItemToUserItem(item) {
    return {
      name: item.name,
      desc: Array.isArray(item.desc) ? item.desc : [],
      equipmentType: item.equipment_category ? item.equipment_category.name : '',
      equipmentCategory: item.category_range || '',
      weaponCategory: item.weapon_category || '',
      damage: item.damage ? item.damage.damage_dice : '',
      damageType: item.damage ? item.damage.damage_type.name : '',
      range: typeof item.range === 'object' ? {
        normal: item.range.normal || null,
        long: item.range.long || null
      } : { 
        normal: typeof item.range === 'string' ? parseInt(item.range.split(': ')[1]) || null : null,
        long: null 
      },
      throw_range: item.throw_range ? {
        normal: item.throw_range.normal || null,
        long: item.throw_range.long || null
      } : { 
        normal: null, 
        long: null 
      },
      properties: item.properties ? item.properties.map(prop => prop.name) : [],
      cost: item.cost ? {
        quantity: item.cost.quantity || null,
        unit: item.cost.unit || ''
      } : { 
        quantity: '', 
        unit: '' 
      },
      weight: item.weight || null,
      rarity: item.rarity ? item.rarity.name : '',
      acquiredDate: new Date(),
      customizations: '',
      quantity: 1, // Default quantity to 1
      equipmentId: item.index,
      requires_attunement: item.requires_attunement || false,
      magical: item.magical || false,
      effects: item.effects ? item.effects.map(effect => ({
        effectName: effect.effectName || '',
        effectDescription: effect.effectDescription || ''
      })) : []
    };
  }
  
  function Inventory() {
    // State to store the user's inventory
    const [items, setItems] = useState([]);
    
    // State to store search results and the search query
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // State for handling selected item, editing, and creation
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    
    // State to control showing details and the modal
    const [showDetails, setShowDetails] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
  
    // Fetch user inventory from the API when the component mounts
    useEffect(() => {
      console.log('useEffect triggered - fetching user inventory');
      fetchUserInventory();
    }, []);
  
    // Function to open and close the modal
    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);
  
    // Fetch user inventory from the API
    const fetchUserInventory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');
  
        const response = await fetch('http://localhost:5050/inventory', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error('Failed to fetch user inventory');
  
        const data = await response.json();
        setItems(data); // Update the items state with fetched inventory data
      } catch (error) {
        console.error('Error fetching user inventory:', error);
      }
    };
  
    // Fetch details for a specific item by its index
    const fetchItemDetails = async (index) => {
      try {
        const formattedIndex = index.replace(/\s+/g, '-'); // Replace spaces with hyphens
        const url = `http://localhost:5050/equipment/fetch/${formattedIndex}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch item details');
        
        const data = await response.json();
        setSelectedItem(data); // Update selected item state
        setShowDetails(true);
        openModal(); // Open the modal to show item details
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    };
  
    // Handle search by fetching the item details corresponding to the search query
    const handleSearch = async () => {
      try {
        const formattedQuery = searchQuery.replace(/\s+/g, '-');
        await fetchItemDetails(formattedQuery); // Fetch item details based on the search query
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };
  
    // Add an item to the user's inventory
    const handleAddToInventory = async (item) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');
  
        const userItem = mapFetchedItemToUserItem(item); // Map the fetched item to the user inventory format
  
        // Send the item to the backend for either updating quantity or adding to inventory
        const response = await fetch('http://localhost:5050/inventory/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ item: userItem }), // Send the mapped item as the request body
        });
  
        if (!response.ok) throw new Error('Failed to add item to inventory');
  
        const data = await response.json();
        console.log('Added or updated item in inventory:', data);
  
        await fetchUserInventory(); // Refresh the user's inventory after adding/updating the item
  
        // Reset search results and selected item
        setSearchResults([]);
        setSearchQuery('');
        setSelectedItem(null);
        setShowDetails(false);
      } catch (error) {
        console.error('Error adding item to inventory:', error);
      }
    };
  
    // Function to update the quantity of an item in the inventory
    const handleUpdateQuantity = async (itemId, newQuantity) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');
  
        // Send the updated quantity to the backend
        const response = await fetch(`http://localhost:5050/inventory/${itemId}/quantity`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }), // Send the new quantity in the request body
        });
  
        if (!response.ok) throw new Error('Failed to update quantity');
  
        const updatedItem = await response.json();
  
        console.log('Updated item:', updatedItem); // Debugging
  
        // Update the items state with the new quantity for the specific item
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, quantity: updatedItem.quantity } : item
          )
        );
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    };  
  
    // Function to handle submitting a new item creation
    const handleCreateSubmit = async (newItem) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');
  
        // Exclude _id and customId from the new item before sending it to the backend
        const { _id, customId, ...itemData } = newItem;
  
        const response = await fetch('http://localhost:5050/equipment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(itemData),
        });
  
        if (!response.ok) throw new Error('Failed to create item');
  
        const createdItem = await response.json();
        await handleAddToInventory(createdItem); // Add the newly created item to the inventory
  
        // Reset editing and creation states
        setIsEditing(false);
        setIsCreating(false);
      } catch (error) {
        console.error('Error creating item:', error);
      }
    };
  
    // Function to handle submitting an item edit
    const handleEditSubmit = async (updatedItem) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');
    
        const equipmentId = updatedItem.equipmentId._id || updatedItem.equipmentId;
    
        // Remove weight from the payload if it's not a valid number
        const { weight, ...restOfItem } = updatedItem;
        const itemData = {
          ...restOfItem,
          ...(weight ? { weight: parseFloat(weight) } : {}), // Only include weight if it's a valid number
        };
    
        const response = await fetch(`http://localhost:5050/equipment/${equipmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(itemData), // Send the item data without invalid weight
        });
    
        if (!response.ok) {
          const errorDetails = await response.json();
          console.error('Error details:', errorDetails);
          throw new Error('Failed to update item');
        }
    
        const data = await response.json();
        console.log('Updated data:', data);
    
        setItems(items.map(item => (item.equipmentId._id === data._id ? { ...item, equipmentId: data } : item)));
        setIsEditing(false);
        setEditingItem(null);
      } catch (error) {
        console.error('Error updating item:', error);
      }
    };  
  
    // Function to handle deleting an item from the inventory
    const handleDelete = async (id) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5050/inventory/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          // Remove the deleted item from the items state
          setItems(items.filter(item => item._id !== id));
        } else {
          console.error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    };
  
    // Function to handle initiating an edit on an item
    const handleEdit = (item) => {
      setEditingItem(item);
      setIsEditing(true);
      setIsCreating(false);
      setSelectedItem(null);
      setModalIsOpen(true); // Open modal for editing
    };
  
    // Function to handle initiating the creation of a new item
    const handleCreate = () => {
      setEditingItem(null);
      setIsCreating(true);
      setIsEditing(true);
      setSelectedItem(null);
    };
  
    // Function to handle canceling item creation or editing
    const handleCancel = () => {
      setIsEditing(false);
      setIsCreating(false);
      setEditingItem(null);
      setSelectedItem(null);
      setShowDetails(false);
      closeModal(); // Close the modal
    };
  
    return (
      <div className="inventory-container">
        <div className='item-bar'>
          {/* Search input field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for equipment"
          />
          <button className='search-btn' onClick={handleSearch}>Search</button>
          <button className='create-btn' onClick={handleCreate}>Create New Item</button>
        </div>
  
        {/* Render search results */}
        <div>
          {searchResults.map(item => (
            <div key={item.index}>
              <h4>{item.name}</h4>
              <button onClick={() => fetchItemDetails(item.index)}>View Details</button>
              <button onClick={() => handleAddToInventory(item)}>Add to Inventory</button>
            </div>
          ))}
        </div>
  
        {/* Modal for displaying selected item details */}
        {showDetails && selectedItem && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Item Details"
            className="ReactModal__Content"
            overlayClassName="ReactModal__Overlay"
            style={{ content: {}, overlay: {} }} // Disable default inline styles
          >
            <h3><u>Item Details</u></h3>
            <p><b>{selectedItem.name}</b></p>
            {selectedItem.desc && selectedItem.desc.length > 0 && (
              <p>Description: {selectedItem.desc.join(' ')}</p>
            )}
            {selectedItem.equipment_category && selectedItem.equipment_category.name && (
              <p>Equipment Category: {selectedItem.equipment_category.name}</p>
            )}
            {selectedItem.weapon_category && (
              <p>Weapon Category: {selectedItem.weapon_category}</p>
            )}
            {selectedItem.weapon_range && (
              <p>Weapon Range: {selectedItem.weapon_range}</p>
            )}
            {selectedItem.damage && selectedItem.damage.damage_dice && selectedItem.damage.damage_type && (
              <p>Damage: {selectedItem.damage.damage_dice} / {selectedItem.damage.damage_type.name}</p>
            )}
            {selectedItem.two_handed_damage && selectedItem.two_handed_damage.damage_dice && (
              <p>Two-Handed Damage: {selectedItem.two_handed_damage.damage_dice} {selectedItem.two_handed_damage.damage_type.name}</p>
            )}
            {selectedItem.range && selectedItem.range.normal && (
              <p>Range: {selectedItem.range.normal} ft
                {selectedItem.range.long && selectedItem.range.long !== '' ? ` / ${selectedItem.range.long} ft` : ''}
              </p>
            )}
            {selectedItem.throw_range && selectedItem.throw_range.normal && (
              <p>Throw Range: Normal: {selectedItem.throw_range.normal} ft
                {selectedItem.throw_range.long && selectedItem.throw_range.long !== '' ? `, Long: ${selectedItem.throw_range.long} ft` : ''}
              </p>
            )}
            {selectedItem.cost && selectedItem.cost.quantity > 0 && selectedItem.cost.unit && (
              <p>Cost: {selectedItem.cost.quantity} {selectedItem.cost.unit}</p>
            )}
            {selectedItem.properties && selectedItem.properties.length > 0 && selectedItem.properties.some(prop => prop.name) && (
              <p>Properties: {selectedItem.properties.map(prop => prop.name).filter(name => name).join(', ')}</p>
            )}
            {selectedItem.weight > 0 && (
              <p>Weight: {selectedItem.weight} lbs</p>
            )}
            {selectedItem.rarity && selectedItem.rarity.name && selectedItem.rarity.name.trim() !== '' && (
              <p>Rarity: {selectedItem.rarity.name}</p>
            )}
            {selectedItem.requires_attunement !== undefined && (
              <p>Requires Attunement: {selectedItem.requires_attunement ? 'Yes' : 'No'}</p>
            )}
            {selectedItem.magical !== undefined && (
              <p>Magical: {selectedItem.magical ? 'Yes' : 'No'}</p>
            )}
            {selectedItem.effects && selectedItem.effects.length > 0 && selectedItem.effects.some(effect => effect.effectName || effect.effectDescription) && (
              <div>
                <strong>Effects:</strong>
                {selectedItem.effects.map((effect, index) => (
                  effect && (effect.effectName || effect.effectDescription) && <p key={index}>{effect.effectName}: {effect.effectDescription}</p>
                ))}
              </div>
            )}
            <button onClick={() => handleAddToInventory(selectedItem)}>Add to Inventory</button>
            <button onClick={closeModal}>Close</button>
          </Modal>
        )}
  
        {/* Render user's inventory items */}
        <div className='inventory'>
          <h3>Inventory Items</h3>
          <div className='inventory-list'>
            {items.map(item => (
              <Item
                key={item._id}
                item={item}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onUpdateQuantity={handleUpdateQuantity} // Pass the update quantity handler to the Item component
              />
            ))}
          </div>
        </div>
  
        {/* Render ItemForm modal for creating or editing an item */}
        {isEditing && (
          <div>
            <h3>{isCreating ? 'Create Item' : 'Edit Item'}</h3>
            <ItemForm
              item={editingItem}
              onSubmit={isCreating ? handleCreateSubmit : handleEditSubmit} // Handle submit depending on whether creating or editing
              onCancel={handleCancel} // Handle canceling creation/editing
              isOpen={true}
              onRequestClose={handleCancel}
            />
          </div>
        )}
      </div>
    );
  }
  
  export default Inventory;