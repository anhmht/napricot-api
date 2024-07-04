const mongoose = require('mongoose')

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
    roles: [
      {
        type: String,
        enum: ['user', 'admin', 'superAdmin'],
        default: 'user'
      }
    ],
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
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('users', userSchema, 'users')
