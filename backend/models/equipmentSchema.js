const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const equipmentSchema = new Schema({
  name: { type: String, required: true },  // Name of the item
  category_range: { type: String, default: '' },

  damage: {
    damage_dice: { type: String, default: '' },
    damage_type: {
      name: { type: String, default: '' }
    }
  },

  two_handed_damage: {
    damage_dice: { type: String, default: '' },
    damage_type: {
      name: { type: String, default: '' }
    }
  },

  range: {
    normal: { type: Number, default: null },
    long: { type: Number, default: null }
  },

  throw_range: {
    normal: { type: Number, default: null },
    long: { type: Number, default: null }
  },

  properties: [{ name: { type: String, default: '' } }],

  equipment_category: {
    name: { type: String, default: '' }
  },

  rarity: {
    name: { type: String, default: '' }
  },

  requires_attunement: { type: Boolean, default: false },

  weight: { type: Number, default: null },
  
  cost: {
    quantity: { type: Number, default: null },
    unit: { type: String, default: '' }
  },

  desc: { type: [String], default: [] },  // Descriptions array

  magical: { type: Boolean, default: false },

  effects: [{ 
    effectName: { type: String, default: '' },
    effectDescription: { type: String, default: '' }
  }],

  customId: { type: String, unique: true, default: '' }  // Unique customId field
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;
