import React, { useState } from 'react';
import './index.css';

function Item({ item, onDelete, onEdit, onUpdateQuantity }) {
  // State to control whether item details are shown or hidden
  const [showDetails, setShowDetails] = useState(false);
  
  // State to manage the quantity of the item, defaulting to the value from the item or 1
  const [quantity, setQuantity] = useState(item.quantity || 1);

  // Function to toggle the visibility of item details when "See More"/"Hide Details" is clicked
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  // Function to handle changes in the quantity input box
  const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
    
    // Prevent the quantity from being less than 1 and show an alert
    if (newQuantity < 1) {
      window.alert("Quantity cannot be less than 1");
      return;  // Exit the function to prevent further execution
    }
    
    // Update the quantity state with the new valid quantity
    setQuantity(newQuantity);
    console.log(`Updating quantity for item ${item._id} to ${newQuantity}`);
    
    // Call the onUpdateQuantity function passed from the parent component to update the quantity
    onUpdateQuantity(item._id, newQuantity);
  };

  // Use equipmentId to access item details if available, otherwise fallback to an empty object
  const equipment = item.equipmentId || {};

  return (
    <div className="item-container">
       {/* Flexbox container to align item name and quantity input side by side */}
      <div className="item-header">
        <h3>{equipment.name}</h3>

        {/* Quantity input box */}
        <div className="item-quantity">
          <label htmlFor={`quantity-${item._id}`}>Quantity:</label>
          <input
            type="number"
            id={`quantity-${item._id}`}
            value={quantity} // Controlled input value tied to the quantity state
            onChange={handleQuantityChange} // Update quantity when user changes the input
            min="1" // Prevents entering a value less than 1
          />
        </div>
      </div>

      {/* Conditionally render equipment details if they are available */}
      {equipment.damage && equipment.damage.damage_dice && equipment.damage.damage_type && (
        <p><strong>Damage / Type:</strong> {equipment.damage.damage_dice} / {equipment.damage.damage_type.name}</p>
      )}
      {equipment.two_handed_damage && equipment.two_handed_damage.damage_dice && (
        <p><strong>Two-Handed Damage:</strong> {equipment.two_handed_damage.damage_dice} {equipment.two_handed_damage.damage_type.name}</p>
      )}
      {equipment.range && equipment.range.normal && (
        <p><strong>Range:</strong> {equipment.range.normal} ft
          {equipment.range.long && equipment.range.long !== '' ? ` / ${equipment.range.long} ft` : ''}
        </p>
      )}
      {equipment.throw_range && equipment.throw_range.normal && (
        <p><strong>Throw Range:</strong> Normal: {equipment.throw_range.normal} ft
          {equipment.throw_range.long && equipment.throw_range.long !== '' ? `, Long: ${equipment.throw_range.long} ft` : ''}
        </p>
      )}
      {equipment.desc && equipment.desc.length > 0 && <p>{equipment.desc.join(' ')}</p>}
      
      {/* Conditionally render item details when showDetails is true */}
      {showDetails && (
        <div className='item-details'>
          {equipment.category_range && <p><strong>Category Range:</strong> {equipment.category_range}</p>}
          {equipment.equipment_category && equipment.equipment_category.name && (
            <p><strong>Equipment Category:</strong> {equipment.equipment_category.name}</p>
          )}
          {equipment.weapon_category && <p><strong>Weapon Category:</strong> {equipment.weapon_category}</p>}
          
          {/* Conditionally render item properties if available */}
          {(equipment.properties && equipment.properties.length > 0 && equipment.properties.some(prop => prop.name)) && (
            <p><strong>Properties:</strong> {equipment.properties.map(prop => prop && prop.name).filter(name => name).join(', ')}</p>
          )}
          {equipment.cost && (equipment.cost.quantity > 0) && equipment.cost.unit && (
            <p><strong>Cost:</strong> {equipment.cost.quantity} {equipment.cost.unit}</p>
          )}
          {equipment.weight && <p><strong>Weight:</strong> {equipment.weight} lbs</p>}
          {equipment.rarity && equipment.rarity.name && equipment.rarity.name.trim() !== '' && (
            <p><strong>Rarity:</strong> {equipment.rarity.name}</p>
          )}
          {equipment.requires_attunement !== undefined && (
            <p><strong>Requires Attunement:</strong> {equipment.requires_attunement ? 'Yes' : 'No'}</p>
          )}
          {equipment.magical !== undefined && <p><strong>Magical:</strong> {equipment.magical ? 'Yes' : 'No'}</p>}
          
          {/* Conditionally render item effects if available */}
          {(equipment.effects && equipment.effects.length > 0 && equipment.effects.some(effect => effect.effectName || effect.effectDescription)) && (
          <div>
            <strong>Effects:</strong>
            {equipment.effects.map((effect, index) => (
              effect && (effect.effectName || effect.effectDescription) && <p key={index}>{effect.effectName}: {effect.effectDescription}</p>
            ))}
          </div>
          )}
        </div>
      )}
      
      {/* Buttons to toggle details, edit, and delete the item */}
      <div className="item-buttons">
        <button onClick={toggleDetails}>
          {showDetails ? 'Hide Details' : 'See More'}
        </button>
        <button onClick={() => onEdit(item)}>Edit</button>
        <button onClick={() => onDelete(item._id)}>Delete</button>
      </div>
    </div>
  );
}

export default Item;