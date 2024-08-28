const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInventorySchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    equipmentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Equipment' 
    },
    //equip properties
    quantity: { 
        type: Number, 
        default: 1 
    },
    acquiredDate: { 
        type: Date, 
        default: Date.now 
    },
    customizations: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // Automatically generates createdAt and updatedAt fields for each record modification
});

const UserInventory = mongoose.model('UserInventory', userInventorySchema);
module.exports = UserInventory;