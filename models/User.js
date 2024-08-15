const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      unique: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    avatar: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'images'
      },
      url: {
        type: String
      },
      thumbnail: {
        type: String
      }
    },
    roles: {
      type: [String],
      enum: ['user', 'admin', 'superadmin'],
      default: ['user']
    },
    shippingAddress: {
      addressLine1: {
        type: String
      },
      addressLine2: {
        type: String
      },
      city: {
        type: String
      },
      postalCode: {
        type: String
      },
      country: {
        type: String
      },
      phone: {
        type: String
      }
    },
    billingAddress: {
      addressLine1: {
        type: String
      },
      addressLine2: {
        type: String
      },
      city: {
        type: String
      },
      postalCode: {
        type: String
      },
      country: {
        type: String
      },
      phone: {
        type: String
      }
    },
    verifyCode: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('users', userSchema, 'users')
