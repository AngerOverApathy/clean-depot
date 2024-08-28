const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController'); 
const { protect } = require('../middleware/authMiddleware');

//Routes
router.get('/fetch/:index', equipmentController.fetchData);     // Route for fetching detailed data by index

router.post('/', protect, equipmentController.createEquipment);               // Create new equipment
router.get('/', protect, equipmentController.getAllEquipment);                // Get all equipment items
router.get('/:id', protect, equipmentController.getEquipmentById);            // Get a single equipment item by ID
router.put('/:id', protect, equipmentController.updateEquipment);             // Update an equipment item


module.exports = router;
