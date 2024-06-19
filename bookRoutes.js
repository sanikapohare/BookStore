const express = require('express');
const Router = express.Router();
const Book = require('./booksModel');  // Adjust the path as needed
const authenticateToken = require('../middleware/authenticateUser');  // Adjust the path as needed

// Define your route handlers
Router.get('/isbn/:isbn', authenticateToken, async (req, res) => {
    try {
        const books = await Book.find({ ISBN: req.params.isbn });
        res.json(books);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

Router.get('/author/:author', authenticateToken, async (req, res) => {
    try {
        const books = await Book.find({ author: req.params.author });
        res.json(books);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

Router.get('/review/:isbn', authenticateToken, async (req, res) => {
    try {
        const book = await Book.findOne({ ISBN: req.params.isbn }, 'review');
        res.json({ review: book ? book.review : null });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

Router.post('/review/:isbn', authenticateToken, async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate(
            { ISBN: req.params.isbn },
            { review: req.body.review },
            { new: true, upsert: true }
        );
        res.json(book);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

Router.post('/postBooks', async (req, res) => {
    const { title, author, review, ISBN } = req.body;
    if (!title || !author || !review || !ISBN) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    try {
        const existingBook = await Book.findOne({ ISBN });
        if (existingBook) {
            return res.status(409).send({ message: 'Book already exists' });
        }

        const book = new Book({ title, author, review, ISBN });
        await book.save();
        res.status(201).send({ message: 'Book added successfully', book });
    } catch (error) {
        res.status(500).send({ message: 'Internal server error', error });
    }
});
Router.get('/getAll',async (req,res)=>{
    try{
        const books=await Book.find();
        res.json(books);

    }
    catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ error: 'Failed to fetch books' });
      }
})


Router.get('/:id/reviews', async (req, res) => {
    const bookId = req.params.id;
    try {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      const reviews = book.review;
      res.json(reviews);
    } catch (err) {
      console.error('Error fetching book review:', err);
      res.status(500).json({ error: 'Failed to fetch book review' });
    }
  });

  Router.put('/:id/reviews/:reviewId', async (req, res) => {
    const bookId = req.params.id;
    const reviewId = req.params.reviewId;
    const { newReview } = req.body;
    try {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      const index = book.review.findIndex(review => review === reviewId);
      if (index === -1) {
        return res.status(404).json({ error: 'Review not found' });
      }
      book.review[index] = newReview;
      await book.save();
      res.json({ message: 'Review modified successfully' });
    } catch (err) {
      console.error('Error modifying book review:', err);
      res.status(500).json({ error: 'Failed to modify book review' });
    }
  });

  Router.delete('/:id/reviews/:reviewId', async (req, res) => {
    const bookId = req.params.id;
    const reviewId = req.params.reviewId;
    try {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      const index = book.review.findIndex(review => review === reviewId);
      if (index === -1) {
        return res.status(404).json({ error: 'Review not found' });
      }
      book.review.slice(index, 1);
      await book.save();
      res.json({ message: 'Review deleted successfully' });
    } catch (err) {
      console.error('Error deleting book review:', err);
      res.status(500).json({ error: 'Failed to delete book review' });
    }
  });


  Router.get('/api/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;
    Book.findOne({ isbn: isbn })
      .then(book => {
        if (!book) {
          return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
      })
      .catch(err => {
        console.error('Error fetching book by ISBN:', err);
        res.status(500).json({ error: 'Failed to fetch book by ISBN' });
      });
  });

  Router.get('/api/author/:author', (req, res) => {
    const { author } = req.params;
    Book.find({ author: author })
      .then(books => {
        if (books.length === 0) {
          return res.status(404).json({ error: 'No books found for this author' });
        }
        res.json(books);
      })
      .catch(err => {
        console.error('Error fetching books by author:', err);
        res.status(500).json({ error: 'Failed to fetch books by author' });
      });
  });
  
  Router.get('/api/title/:title', (req, res) => {
    const { title } = req.params;
    Book.find({ title: new RegExp(title, 'i') }) // Case-insensitive search
      .then(books => {
        if (books.length === 0) {
          return res.status(404).json({ error: 'No books found with this title' });
        }
        res.json(books);
      })
      .catch(err => {
        console.error('Error fetching books by title:', err);
        res.status(500).json({ error: 'Failed to fetch books by title' });
      });
  });

  
module.exports = Router;
