const prisma = require('../lib/prisma');

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

    // Validate title length
    if (title.length > 255) {
      return res.status(400).json({
        error: 'Title must be 255 characters or less'
      });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId
      }
    });

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all notes for the authenticated user
const getAllNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;

    const priority = req.query.priority;
    if (priority) {
      const notes = await prisma.note.findMany({
        where: {
          userId,
          priority
        },
        orderBy: { updatedAt: 'desc' }
      });
      return res.json({
        message: 'Notes retrieved successfully',
        notes
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for search
    const whereClause = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Get notes with pagination
    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.note.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      message: 'Notes retrieved successfully',
      notes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalNotes: totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
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
    const noteId = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId
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
    const noteId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { title, content } = req.body;

    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    // Validate title length
    if (title.length > 255) {
      return res.status(400).json({
        error: 'Title must be 255 characters or less'
      });
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId
      }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update the note
    const note = await prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content
      }
    });

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId
      }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete the note
    await prisma.note.delete({
      where: { id: noteId }
    });

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