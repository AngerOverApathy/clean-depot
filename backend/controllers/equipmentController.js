const axios = require('axios');
const Equipment = require('../models/equipmentSchema');
const crypto = require('crypto');

// Generates a unique ID for new equipment items
const generateUniqueId = () => {
  return crypto.randomBytes(10).toString('hex');
};

const equipmentController = {
  // Fetch data from an external API by index
  async fetchData(req, res) {
    let { index } = req.params;

    // Convert the index to lowercase and replace spaces with hyphens
    index = index.toLowerCase().replace(/\s+/g, '-');

    const baseUrl = 'https://www.dnd5eapi.co/api';
    const endpoints = [
      `${baseUrl}/equipment/${index}`,
      `${baseUrl}/magic-items/${index}`,
      `${baseUrl}/weapon-properties/${index}`
    ];

    try {
      // Fetch data from multiple endpoints and wait for all results
      const apiRequests = endpoints.map(endpoint => axios.get(endpoint));
      const apiResponses = await Promise.allSettled(apiRequests);

      // Find the first successful response
      const successfulResponse = apiResponses.find(response => response.status === 'fulfilled');

      if (successfulResponse) {
        // Return the data from the successful response
        return res.status(200).json(successfulResponse.value.data);
      } else {
        // Collect reasons for failure for error handling
        const reasons = apiResponses
          .filter(response => response.status === 'rejected')
          .map((response, idx) => ({
            endpoint: endpoints[idx],
            reason: response.reason.message
          }));

        // Respond with 404 if no successful response was found
        return res.status(404).json({ message: 'Item not found', errors: reasons });
      }
    } catch (error) {
      // Handle unexpected errors during API fetch
      return res.status(500).json({ message: 'Failed to fetch data', error: error.message });
    }
  },

  // Save fetched equipment to DB or return existing one
  async saveFetchedEquipment(item) {
    try {
      // Ensure item has a valid name
      if (!item.name) {
        throw new Error('Item name is required');
      }

      // Check if the equipment already exists in the DB
      let equipment = await Equipment.findOne({ customId: item.equipmentId });

      // If equipment doesn't exist, create a new one
      if (!equipment) {
        equipment = new Equipment({
          customId: generateUniqueId(),
          name: item.name,
          category_range: item.category_range || item.equipmentCategory || '',
          damage: {
            damage_dice: item.damage || '',
            damage_type: { name: item.damageType || '' }
          },
          two_handed_damage: {
            damage_dice: item.two_handed_damage?.damage_dice || '',
            damage_type: { name: item.two_handed_damage?.damage_type?.name || '' }
          },
          range: {
            normal: typeof item.range === 'object' ? item.range.normal : (typeof item.range === 'string' ? item.range.split(': ')[1] : null),
            long: typeof item.range === 'object' ? item.range.long : null
          },
          throw_range: {
            normal: item.throw_range?.normal || null,
            long: item.throw_range?.long || null
          },
          properties: item.properties ? item.properties.map(prop => ({ name: prop })) : [],
          equipment_category: { name: item.equipment_category?.name || item.equipmentCategory || '' },
          rarity: item.rarity || '',
          requires_attunement: item.requires_attunement || false,
          weight: item.weight || null,
          cost: {
            quantity: item.cost?.quantity || null,
            unit: item.cost?.unit || ''
          },
          desc: item.desc || [],
          magical: item.magical || false,
          effects: item.effects ? item.effects.map(effect => ({ name: effect.name || '', description: effect.description || '' })) : []
        });

        // Save new equipment to DB
        await equipment.save();
      }

      // Return the saved or existing equipment
      return equipment;
    } catch (error) {
      // Handle error during equipment save
      throw new Error('Failed to save fetched equipment');
    }
  },

  // Create a new equipment item in the DB
  async createEquipment(req, res) {
    try {
      const { name, category_range, damage, two_handed_damage, range, throw_range, properties, equipment_category, rarity, requires_attunement, weight, cost, desc, magical, effects } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Create a new equipment object
      const newEquipment = new Equipment({
        customId: generateUniqueId(),
        name,
        category_range,
        damage: {
          damage_dice: damage?.damage_dice || '',
          damage_type: { name: damage?.damage_type?.name || '' }
        },
        two_handed_damage: {
          damage_dice: two_handed_damage?.damage_dice || '',
          damage_type: { name: two_handed_damage?.damage_type?.name || '' }
        },
        range: {
          normal: range?.normal || null,
          long: range?.long || null
        },
        throw_range: {
          normal: throw_range?.normal || null,
          long: throw_range?.long || null
        },
        properties: properties ? properties.map(prop => ({ name: prop.name })) : [],
        equipment_category: { name: equipment_category?.name || '' },
        rarity: { name: rarity?.name || '' },
        requires_attunement,
        weight,
        cost: {
          quantity: cost?.quantity || null,
          unit: cost?.unit || ''
        },
        desc,
        magical,
        effects: effects ? effects.map(effect => ({ effectName: effect.effectName || '', effectDescription: effect.effectDescription || '' })) : []
      });

      // Save new equipment and return the response
      const savedEquipment = await newEquipment.save();
      return res.status(201).json(savedEquipment);
    } catch (error) {
      // Handle error during equipment creation
      return res.status(400).json({
        message: 'Failed to create new equipment',
        error: error.message
      });
    }
  },

  // Get all equipment items for the logged-in user
  async getAllEquipment(req, res) {
    try {
      const equipments = await Equipment.find({ user: req.user.id });
      return res.status(200).json(equipments);
    } catch (error) {
      // Handle error during retrieval of all equipment
      return res.status(500).json({ message: 'Failed to get equipment', error });
    }
  },

  // Get a single equipment item by its ID
  async getEquipmentById(req, res) {
    try {
      const equipment = await Equipment.findById(req.params.id);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      } else {
        return res.status(200).json(equipment);
      }
    } catch (error) {
      // Handle error during retrieval of a single equipment item
      return res.status(500).json({ message: 'Failed to get equipment', error });
    }
  },

  // Update an existing equipment item
  async updateEquipment(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      // Validate required fields
      if (!updatedData.name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Validate data types: Only check if cost.quantity exists
      if (updatedData.cost && updatedData.cost.quantity !== undefined && typeof updatedData.cost.quantity !== 'number') {
        return res.status(400).json({ message: 'Cost quantity must be a number' });
      }

      if (updatedData.weight !== undefined && typeof updatedData.weight !== 'number') {
        return res.status(400).json({ message: 'Weight must be a number' });
      }

      // Clean up the cost object if it's empty (null or undefined fields)
      if (updatedData.cost && !updatedData.cost.quantity && !updatedData.cost.unit) {
        delete updatedData.cost; // Remove the cost field entirely if both quantity and unit are missing
      }

      delete updatedData._id;

      // Find and update the equipment item in the DB
      const updatedEquipment = await Equipment.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

      if (!updatedEquipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      return res.status(200).json(updatedEquipment);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update equipment', error: error.message });
    }
  }  
};

module.exports = equipmentController;