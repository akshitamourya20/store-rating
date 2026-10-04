const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: extractedErrors[0].message,
      errors: extractedErrors,
    });
  }
  next();
};

// Signup & Add User rules
const userValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter.')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must include at least one special character.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
];

// Change Password rules
const changePasswordValidationRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters long.')
    .matches(/[A-Z]/)
    .withMessage('New password must include at least one uppercase letter.')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('New password must include at least one special character.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password cannot be the same as the current password.');
      }
      return true;
    }),
];

// Store creation rules
const storeValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage('Store name must be between 3 and 60 characters long.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store address is required.')
    .isLength({ max: 400 })
    .withMessage('Store address must not exceed 400 characters.'),
];

// Rating submission rules
const ratingValidationRules = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

module.exports = {
  handleValidationErrors,
  userValidationRules,
  changePasswordValidationRules,
  storeValidationRules,
  ratingValidationRules,
};
