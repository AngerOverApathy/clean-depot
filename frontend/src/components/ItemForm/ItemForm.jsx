import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const ItemForm = ({ item, onSubmit, onCancel, isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_range: '',
    damage: { damage_dice: '', damage_type: { name: '' } },
    two_handed_damage: { damage_dice: '', damage_type: { name: '' } },
    range: { normal: '', long: '' },
    throw_range: { normal: '', long: '' },
    properties: [{ name: '' }],
    equipment_category: { name: '' },
    rarity: '', 
    requires_attunement: false,
    weight: '',
    cost: { quantity: null, unit: '' },
    desc: [], 
    magical: false,
    effects: [{ effectName: '', effectDescription: '' }]
  });

  useEffect(() => {
    console.log("Item received in useEffect:", item);
    if (item) {
      const equipment = item.equipmentId || {};
      const initializedItem = {
        ...formData,
        ...item,
        name: equipment.name || '',
        category_range: equipment.category_range || '',
        damage: {
          damage_dice: equipment.damage?.damage_dice || '',
          damage_type: {
            name: equipment.damage?.damage_type?.name || ''
          }
        },
        two_handed_damage: {
          damage_dice: equipment.two_handed_damage?.damage_dice || '',
          damage_type: {
            name: equipment.two_handed_damage?.damage_type?.name || ''
          }
        },
        range: equipment.range || { normal: '', long: '' },
        throw_range: equipment.throw_range || { normal: '', long: '' },
        properties: equipment.properties && equipment.properties.length ? equipment.properties : [{ name: '' }],
        equipment_category: equipment.equipment_category || { name: '' },
        cost: equipment.cost ? { 
          quantity: equipment.cost.quantity !== undefined ? equipment.cost.quantity : null, 
          unit: equipment.cost.unit || '' 
        } : { quantity: null, unit: '' },
        desc: Array.isArray(equipment.desc) ? equipment.desc : [],
        effects: equipment.effects && equipment.effects.length ? equipment.effects : [{ effectName: '', effectDescription: '' }],
        requires_attunement: equipment.requires_attunement || false,
        weight: equipment.weight || null,
        rarity: equipment.rarity || ''
      };
      console.log("Initialized item:", initializedItem);
      setFormData(initializedItem);
    }
  }, [item]);
  
  console.log('FormData Cost:', formData.cost);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleNestedChange = (e, field, nestedField) => {
    const { value } = e.target;
    console.log('Change detected:', field, nestedField, value);
  
    const fieldParts = nestedField.split('.');
  
    const parsedValue = (field === 'cost' && nestedField === 'quantity' && value === '')
      ? null
      : value;
  
    if (fieldParts.length === 2) { // Handling two-level nesting, e.g., "damage.damage_dice"
      setFormData(prevState => ({
        ...prevState,
        [field]: {
          ...prevState[field],
          [fieldParts[0]]: {
            ...prevState[field][fieldParts[0]],
            [fieldParts[1]]: parsedValue
          }
        }
      }));
    } else if (fieldParts.length === 1) { // Handling one-level nesting, e.g., "cost.unit"
      setFormData(prevState => ({
        ...prevState,
        [field]: {
          ...prevState[field],
          [nestedField]: parsedValue
        }
      }));
    } else {
      console.warn("Unexpected nested field structure:", fieldParts);
    }
  };  
  
  const handleArrayChange = (e, field, index, nestedField) => {
    const { value } = e.target;
    const updatedArray = formData[field].map((item, i) => (
      i === index ? { ...item, [nestedField]: value } : item
    ));
    setFormData({ ...formData, [field]: updatedArray });
  };  

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Destructure and remove _id and customId from formData
    const { _id, customId, ...cleanFormData } = formData;
    
    // Clean up cost if quantity is empty or null
    if (cleanFormData.cost) {
      // If quantity is null or empty, remove the entire quantity field
      if (cleanFormData.cost.quantity === null || cleanFormData.cost.quantity === '') {
        delete cleanFormData.cost.quantity;
      }
      
      // If unit is empty, remove the unit field
      if (!cleanFormData.cost.unit) {
        delete cleanFormData.cost.unit;
      }
  
      // If both quantity and unit are missing, remove the cost object itself
      if (!cleanFormData.cost.quantity && !cleanFormData.cost.unit) {
        delete cleanFormData.cost;
      }
    }
  
    console.log('Cleaned Form Data before submit:', cleanFormData);
  
    // Call onSubmit to send the cleaned data
    onSubmit(cleanFormData);
    
    // Reset formData to its initial state after submission
    setFormData({
      name: '',
      category_range: '',
      damage: { damage_dice: '', damage_type: { name: '' } },
      two_handed_damage: { damage_dice: '', damage_type: { name: '' } },
      range: { normal: '', long: '' },
      throw_range: { normal: '', long: '' },
      properties: [{ name: '' }],
      equipment_category: { name: '' },
      rarity: '', 
      requires_attunement: false,
      weight: null,
      cost: { quantity: null, unit: '' },
      desc: [], 
      magical: false,
      effects: [{ effectName: '', effectDescription: '' }]
    });
  };       

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Item Form Modal"
      className="CreationForm_ReactModal__Content"
      overlayClassName="CreationForm_ReactModal__Overlay"
    >
      <form 
        className='item-form'
        onSubmit={handleSubmit}
      >
        <label>
          Name:
          <input
            className='input-box'
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            placeholder="e.g., Longsword"
          />
        </label>
        <label>
          Category Range:
          <input
            className='input-box'
            type="text"
            name="category_range"
            value={formData.category_range || ''}
            onChange={handleChange}
            placeholder="e.g., Martial Melee"
          />
        </label>
        <label>
          Damage Dice:
          <input
            type="text"
            name="damage.damage_dice"
            value={formData.damage?.damage_dice || ''}
            onChange={(e) => handleNestedChange(e, 'damage', 'damage_dice')}
            placeholder="e.g., 1d8"
          />
        </label>
        <label>
          Damage Type:
          <input
            type="text"
            name="damage.damage_type.name"
            value={formData.damage.damage_type.name || ''}
            onChange={(e) => handleNestedChange(e, 'damage', 'damage_type.name')}
            placeholder="e.g., Slashing"
          />
        </label>
        <label>
          Two-Handed Damage Dice:
          <input
            type="text"
            name="two_handed_damage.damage_dice"
            value={formData.two_handed_damage?.damage_dice || ''}
            onChange={(e) => handleNestedChange(e, 'two_handed_damage', 'damage_dice')}
            placeholder="e.g., 1d10"
          />
        </label>
        <label>
          Two-Handed Damage Type:
          <input
            type="text"
            name="two_handed_damage.damage_type.name"
            value={formData.two_handed_damage.damage_type.name || ''}
            onChange={(e) => handleNestedChange(e, 'two_handed_damage', 'damage_type.name')}
            placeholder="e.g., Slashing"
          />
        </label>
        <label>
          Range (Normal):
          <input
            type="number"
            name="range_normal"
            value={formData.range?.normal !== null ? formData.range.normal : ''}
            onChange={(e) => handleNestedChange(e, 'range', 'normal')}
            placeholder="e.g., 5"
          />
        </label>
        <label>
          Range (Long):
          <input
            type="number"
            name="range_long"
            value={formData.range?.long !== null ? formData.range.long : ''}
            onChange={(e) => handleNestedChange(e, 'range', 'long')}
            placeholder="e.g., 20"
          />
        </label>
        <label>
          Throw Range (Normal):
          <input
            type="number"
            name="throw_range_normal"
            value={formData.throw_range?.normal !== null ? formData.throw_range.normal : ''}
            onChange={(e) => handleNestedChange(e, 'throw_range', 'normal')}
            placeholder="e.g., 20"
          />
        </label>
        <label>
          Throw Range (Long):
          <input
            type="number"
            name="throw_range_long"
            value={formData.throw_range?.long !== null ? formData.throw_range.long : ''}
            onChange={(e) => handleNestedChange(e, 'throw_range', 'long')}
            placeholder="e.g., 60"
          />
        </label>
        <label>
          Properties:
          {formData.properties.map((property, index) => (
            <input
              key={index}
              type="text"
              value={property.name || ''}
              onChange={(e) => handleArrayChange(e, 'properties', index, 'name')}
              placeholder="e.g., Versatile"
            />
          ))}
        </label>
        <label>
          Equipment Category:
          <input
            type="text"
            name="equipment_category"
            value={formData.equipment_category?.name || ''}
            onChange={(e) => handleNestedChange(e, 'equipment_category', 'name')}
            placeholder="e.g., Weapon"
          />
        </label>
        <label>
          Rarity:
          <input
            type="text"
            name="rarity"
            value={formData.rarity || ''}
            onChange={handleChange}
            placeholder="e.g., Uncommon"
          />
        </label>
        <label>
          Weight:
          <input
            type="number"
            name="weight"
            value={formData.weight !== null ? formData.weight : ''}
            onChange={handleChange}
            placeholder="e.g., 3"
          />
        </label>
        <label>
          Cost:
          <input
            type="number"
            name="cost_quantity"
            value={formData.cost?.quantity !== null ? formData.cost.quantity : null}
            onChange={(e) => handleNestedChange(e, 'cost', 'quantity')}
            placeholder="e.g., 15"
          />
        </label>
        <label>
          Cost Unit:
          <input
            type="text"
            name="cost_unit"
            value={formData.cost?.unit || ''}
            onChange={(e) => handleNestedChange(e, 'cost', 'unit')}
            placeholder="e.g., gp"
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="desc"
            value={Array.isArray(formData.desc) ? formData.desc.join(', ') : ''}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value.split(', ') })}
            placeholder="e.g., An arcane focus is a special item..."
          />
        </label>
        <label>
          Effects:
          {formData.effects.map((effect, index) => (
            <div key={index}>
              <input
                type="text"
                name="effect_name"
                value={effect.effectName || ''}
                onChange={(e) => handleArrayChange(e, 'effects', index, 'effectName')}
                placeholder="e.g., Fire Resistance"
              />
              <input
                type="text"
                name="effect_description"
                value={effect.effectDescription || ''}
                onChange={(e) => handleArrayChange(e, 'effects', index, 'effectDescription')}
                placeholder="e.g., Grants resistance to fire damage"
              />
              <label>
                Magical:
                <input
                  type="checkbox"
                  name="magical"
                  checked={formData.magical || false}
                  onChange={(e) => setFormData({ ...formData, magical: e.target.checked })}
                />
              </label>
              <label>
                Requires Attunement:
                <input
                  type="checkbox"
                  name="requires_attunement"
                  checked={formData.requires_attunement || false}
                  onChange={(e) => setFormData({ ...formData, requires_attunement: e.target.checked })}
                />
              </label>
            </div>
          ))}
        </label>
        <div className="button-container">
          <button type="submit">Save</button>
          <button type="button" onClick={onRequestClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default ItemForm;