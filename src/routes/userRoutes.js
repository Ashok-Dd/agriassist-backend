// userRouter.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import { deleteAccount, getFarms, getProfile, updatePreferences, updateProfile } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';


const userRouter = express.Router();



// Middleware to handle validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

userRouter.get('/profile', verifyToken, getProfile);

userRouter.put('/profile',
    [
  verifyToken,
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),

  body('language')
    .optional()
    .isIn(['Telugu', 'Hindi', 'English'])
    .withMessage('Language must be Telugu, Hindi, or English'),

  body('location.state')
    .optional({ nullable: true })
    .isLength({ min: 2, max: 30 })
    .withMessage('State name must be between 2 and 30 characters')
    .trim()
    .escape(),

  body('location.district')
    .optional({ nullable: true })
    .isLength({ min: 2, max: 30 })
    .withMessage('District name must be between 2 and 30 characters')
    .trim()
    .escape(),

  body('location.mandal')
    .optional({ nullable: true })
    .isLength({ min: 2, max: 30 })
    .withMessage('Mandal name must be between 2 and 30 characters')
    .trim()
    .escape(),

  body('location.village')
    .optional({ nullable: true })
    .isLength({ min: 2, max: 30 })
    .withMessage('Village name must be between 2 and 30 characters')
    .trim()
    .escape(),

  body('location.coordinates.latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  validateRequest
], updateProfile);


userRouter.put('/preferences', 
  [
  verifyToken,
  body('notifications.disease')
    .optional()
    .isBoolean()
    .withMessage('Disease notification preference must be boolean'),

  body('notifications.fertilizer')
    .optional()
    .isBoolean()
    .withMessage('Fertilizer notification preference must be boolean'),

  body('notifications.irrigation')
    .optional()
    .isBoolean()
    .withMessage('Irrigation notification preference must be boolean'),

  body('notifications.market')
    .optional()
    .isBoolean()
    .withMessage('Market notification preference must be boolean'),

  body('units.area')
    .optional()
    .isIn(['acre', 'hectare'])
    .withMessage('Area unit must be either acre or hectare'),

  body('units.weight')
    .optional()
    .isIn(['kg', 'quintal'])
    .withMessage('Weight unit must be either kg or quintal'),
  validateRequest
], updatePreferences
);


userRouter.get('/farms', verifyToken, getFarms);

userRouter.delete('/account',
   [
    verifyToken,
    body('confirmation')
      .equals('DELETE_MY_ACCOUNT')
      .withMessage('Account deletion requires confirmation: "DELETE_MY_ACCOUNT"'),
    validateRequest
], deleteAccount);



export default userRouter;