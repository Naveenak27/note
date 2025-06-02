const express = require('express');
const { 
  createNote, 
  getAllNotes, 
  getNoteById, 
  updateNote, 
  deleteNote 
} = require('../controllers/notesController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All notes routes require authentication
router.use(authenticateToken);

// Notes routes
router.post('/', createNote);
router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;