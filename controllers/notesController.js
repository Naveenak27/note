const { Note, User } = require('../models');
const { Op } = require('sequelize');

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    const note = await Note.create({
      title,
      content,
      user_id: userId
    });

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all notes for the authenticated user
const getAllNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { user_id: userId };

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: notes } = await Note.findAndCountAll({
      where: whereClause,
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      message: 'Notes retrieved successfully',
      notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalNotes: count,
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific note by ID
const getNoteById = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    const note = await Note.findOne({
      where: {
        id: noteId,
        user_id: userId
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      message: 'Note retrieved successfully',
      note
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    // Find the note first
    const note = await Note.findOne({
      where: {
        id: noteId,
        user_id: userId
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update the note
    await note.update({
      title,
      content
    });

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    // Find and delete the note
    const deletedRows = await Note.destroy({
      where: {
        id: noteId,
        user_id: userId
      }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
};