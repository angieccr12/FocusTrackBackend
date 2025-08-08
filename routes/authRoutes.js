//authRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Registro de usuario
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password, first_name, last_name } = req.body;

    try {
      const existingUser = await pool.query(
        'SELECT * FROM "User" WHERE "userEmail" = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await pool.query(
        `INSERT INTO "User" ("userEmail", "userPassword", "userFirstName", "userLastName")
         VALUES ($1, $2, $3, $4)
         RETURNING "userId", "userEmail", "userFirstName", "userLastName"`,
        [email, hashedPassword, first_name, last_name]
      );

      const user = newUser.rows[0];
      const token = jwt.sign(
        { id: user.userId, email: user.userEmail },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          userId: user.userId,
          email: user.userEmail,
          firstName: user.userFirstName,
          lastName: user.userLastName,
        },
        token,
      });
    } catch (err) {
      console.error('Register error:', err.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Inicio de sesión
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query(
        'SELECT * FROM "User" WHERE "userEmail" = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.userPassword);

      if (!isValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.userId, email: user.userEmail },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Session started successfully',
        user: {
          userId: user.userId,
          email: user.userEmail,
          firstName: user.userFirstName,
          lastName: user.userLastName,
        },
        token,
      });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;
