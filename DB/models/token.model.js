import mongoose, { Schema, model } from "mongoose";
import { APP_CONFIG } from "../../src/config/constants.js";

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: [true, 'الرمز المميز مطلوب'],
      unique: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'معرف المستخدم مطلوب'],
      index: true
    },
    agent: {
      type: String,
      required: [true, 'معلومات المتصفح مطلوبة'],
      trim: true
    },
    isValid: {
      type: Boolean,
      default: true,
      index: true
    },
    tokenType: {
      type: String,
      enum: ['access', 'refresh', 'reset'],
      default: 'access',
      index: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    location: {
      country: String,
      city: String,
      region: String
    },
    deviceInfo: {
      type: String,
      trim: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Set expiration based on token type
        const now = new Date();
        if (this.tokenType === 'refresh') {
          return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        } else if (this.tokenType === 'reset') {
          return new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour
        }
        return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days for access tokens
      },
      index: { expireAfterSeconds: 0 } // TTL index
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Compound indexes for better query performance
tokenSchema.index({ user: 1, isValid: 1 });
tokenSchema.index({ user: 1, tokenType: 1 });
tokenSchema.index({ token: 1, isValid: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ createdAt: -1 });

// Virtual for checking if token is expired
tokenSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for checking if token is active
tokenSchema.virtual('isActive').get(function() {
  return this.isValid && !this.isExpired;
});

// Pre-save middleware to update lastUsed
tokenSchema.pre('save', function(next) {
  if (this.isModified('token') && !this.isNew) {
    this.lastUsed = new Date();
  }
  next();
});

// Instance method to invalidate token
tokenSchema.methods.invalidate = function() {
  this.isValid = false;
  return this.save();
};

// Instance method to refresh token expiration
tokenSchema.methods.refresh = function() {
  const now = new Date();
  if (this.tokenType === 'refresh') {
    this.expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
  } else if (this.tokenType === 'reset') {
    this.expiresAt = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour
  } else {
    this.expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
  }
  this.lastUsed = now;
  return this.save();
};

// Static method to find active tokens for a user
tokenSchema.statics.findActiveTokensForUser = function(userId) {
  return this.find({
    user: userId,
    isValid: true,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to invalidate all tokens for a user
tokenSchema.statics.invalidateAllForUser = function(userId) {
  return this.updateMany(
    { user: userId },
    { $set: { isValid: false } }
  );
};

// Static method to invalidate all tokens except current
tokenSchema.statics.invalidateAllExceptCurrent = function(userId, currentToken) {
  return this.updateMany(
    { user: userId, token: { $ne: currentToken } },
    { $set: { isValid: false } }
  );
};

// Static method to cleanup expired tokens
tokenSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isValid: false }
    ]
  });
};

// Static method to get user session statistics
tokenSchema.statics.getUserSessionStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { user: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isValid', true] },
                  { $gt: ['$expiresAt', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        lastActivity: { $max: '$lastUsed' }
      }
    }
  ]);
  
  return stats[0] || { totalSessions: 0, activeSessions: 0, lastActivity: null };
};

// Static method to get system-wide token statistics
tokenSchema.statics.getSystemStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$tokenType',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isValid', true] },
                  { $gt: ['$expiresAt', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats;
};

// Create model
const tokenModel = mongoose.models.Token || model("Token", tokenSchema);

export default tokenModel;