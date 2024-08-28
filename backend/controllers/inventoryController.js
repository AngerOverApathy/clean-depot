const UserInventory = require('../models/userInventorySchema');
const Equipment = require('../models/equipmentSchema');
const { saveFetchedEquipment } = require('./equipmentController');
const mongoose = require('mongoose');

const inventoryController = {
  // Fetch all inventory items for the logged-in user
  async getUserInventory(req, res) {
    try {
      const userId = req.user.id;
      const userInventory = await UserInventory.find({ user: userId }).populate('equipmentId');
      res.status(200).json(userInventory);
    } catch (error) {
      console.error("Error fetching user inventory:", error);  // Retaining useful error logging
      res.status(500).json({ message: "Failed to fetch user inventory" });
    }
  },

  // Add item to user inventory
  async addToInventory(req, res) {
    try {
      const userId = req.user.id;
      const { item } = req.body;
  
      // Save fetched equipment or find existing one
      const equipment = await saveFetchedEquipment(item);
  
      // Log the item that is attempting to be added to the inventory for debugging
      console.log('Attempting to add item:', equipment.name, 'for user:', userId);
  
      // Fetch the user's entire inventory and populate the equipment details
      let userInventory = await UserInventory.find({ user: userId }).populate('equipmentId');
  
      // Now we have the entire inventory populated, log it to verify
      console.log('User Inventory:', userInventory);
  
      // Find if an item with the same name exists in the user's inventory
      let existingItem = userInventory.find(inventoryItem => inventoryItem.equipmentId.name === equipment.name);
  
      if (existingItem) {
        // If the item exists, increment the quantity
        existingItem.quantity += 1;
        await existingItem.save();
  
        console.log(`Item exists. Incremented quantity to ${existingItem.quantity}`);
        return res.status(200).json(existingItem);
      } else {
        // If the item doesn't exist, add it as a new item
        const newInventoryItem = new UserInventory({
          user: userId,
          equipmentId: equipment._id,
          quantity: 1,  // Start with a quantity of 1
          acquiredDate: new Date(),
        });
  
        const savedItem = await newInventoryItem.save();
        console.log('Added new item to inventory:', savedItem);
        return res.status(201).json(savedItem);
      }
    } catch (error) {
      console.error("Error adding item to inventory:", error);
      return res.status(500).json({ message: "Failed to add item to inventory", error: error.message });
    }
  },
  
  // // Add item to user inventory
  // async addToInventory(req, res) {
  //   try {
  //     const userId = req.user.id;
  //     const { item } = req.body;

  //     // Save fetched equipment
  //     const equipment = await saveFetchedEquipment(item);

  //     // Check if the item already exists in the user's inventory by comparing name and key details
  //     let existingItem = await UserInventory.findOne({
  //       user: userId,
  //       'equipmentId.name': equipment.name,
  //       'equipmentId.damage.damage_dice': equipment.damage.damage_dice,
  //       'equipmentId.equipmentType': equipment.equipmentType,
  //       // Add more fields as needed to ensure a precise match
  //     }).populate('equipmentId');

  //     if (existingItem) {
  //       // If item exists, increment the quantity
  //       existingItem.quantity += 1;
  //       await existingItem.save();

  //       console.log(`Item exists. Incremented quantity to ${existingItem.quantity}`);
  //       return res.status(200).json(existingItem);
  //     } else {
  //       // If item does not exist, add a new entry to the inventory
  //       const newInventoryItem = new UserInventory({
  //         user: userId,
  //         equipmentId: equipment._id,
  //         quantity: 1,  // Start with a quantity of 1
  //         acquiredDate: new Date(),
  //       });

  //       const savedItem = await newInventoryItem.save();
  //       console.log('Added new item to inventory:', savedItem);
  //       return res.status(201).json(savedItem);
  //     }
  //   } catch (error) {
  //     console.error("Error adding item to inventory:", error);
  //     return res.status(500).json({ message: "Failed to add item to inventory", error: error.message });
  //   }
  // },

  // Update an inventory item
  async updateInventoryItem(req, res) {
    try {
      const { id } = req.params;
      const { quantity, customizations, equipmentData } = req.body;

      // Update the inventory item
      const inventoryItem = await UserInventory.findByIdAndUpdate(
        id,
        { quantity, customizations },
        { new: true, runValidators: true }  // Return the updated object and run schema validations
      );

      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      // Update the associated equipment item if equipmentData is provided
      if (equipmentData) {
        const equipmentId = inventoryItem.equipmentId;
        const updatedEquipment = await Equipment.findByIdAndUpdate(
          equipmentId,
          equipmentData,
          { new: true, runValidators: true }  // Return the updated object and run schema validations
        );

        if (!updatedEquipment) {
          return res.status(404).json({ message: 'Equipment item not found' });
        }

        inventoryItem.equipmentId = updatedEquipment;  // Embed the updated equipment in the response
      }

      res.status(200).json(inventoryItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);  // Retaining useful error logging
      res.status(400).json({ message: "Failed to update inventory item", error: error.message });
    }
  },

  // Update the quantity of an inventory item
  async updateItemQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      // Ensure the quantity is valid
      if (quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }

      // Update the quantity field only
      const updatedItem = await UserInventory.findByIdAndUpdate(
        id,
        { quantity },
        { new: true, runValidators: true }  // Return the updated object and run schema validations
      );

      if (!updatedItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      res.status(200).json(updatedItem);
    } catch (error) {
      console.error("Error updating item quantity:", error);  // Retaining useful error logging
      res.status(500).json({ message: "Failed to update item quantity", error: error.message });
    }
  },

  // Delete an item from the user's inventory
  async deleteItem(req, res) {
    const { itemId } = req.params;
    try {
      // Find and delete the inventory item by its ID
      const inventoryResult = await UserInventory.findByIdAndDelete(itemId);
      if (!inventoryResult) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      // Extract the equipmentId from the deleted inventory item
      const equipmentId = inventoryResult.equipmentId;

      // Check if any other inventory items are using the same equipment
      const otherInventoryItems = await UserInventory.find({ equipmentId });

      // If no other inventory items are using the equipment, delete the equipment
      if (otherInventoryItems.length === 0) {
        await Equipment.findByIdAndDelete(equipmentId);
      }

      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error(`Error deleting item with ID: ${itemId}`, error);  // Retaining useful error logging
      res.status(500).json({ message: 'Error deleting item', error });
    }
  }
};

module.exports = inventoryController; 