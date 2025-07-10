import mongoose, { Schema, model } from "mongoose";
import bcryptjs from 'bcryptjs';
import { 
  SYSTEM_ROLES, 
  USER_STATUS, 
  GRADE_LEVELS, 
  GOVERNORATES, 
  SUBJECTS,
  APP_CONFIG,
  VALIDATION_PATTERNS
} from "../../src/config/constants.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'الاسم الأول مطلوب'],
      trim: true,
      minlength: [2, 'الاسم الأول يجب أن يكون أكثر من حرفين'],
      maxlength: [20, 'الاسم الأول يجب أن يكون أقل من 20 حرف'],
      validate: {
        validator: function(v) {
          return VALIDATION_PATTERNS.ARABIC_NAME.test(v);
        },
        message: 'الاسم الأول يجب أن يحتوي على أحرف عربية فقط'
      }
    },
    lastName: {
      type: String,
      required: [true, 'الاسم الأخير مطلوب'],
      trim: true,
      minlength: [2, 'الاسم الأخير يجب أن يكون أكثر من حرفين'],
      maxlength: [20, 'الاسم الأخير يجب أن يكون أقل من 20 حرف'],
      validate: {
        validator: function(v) {
          return VALIDATION_PATTERNS.ARABIC_NAME.test(v);
        },
        message: 'الاسم الأخير يجب أن يحتوي على أحرف عربية فقط'
      }
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return VALIDATION_PATTERNS.EMAIL.test(v);
        },
        message: 'البريد الإلكتروني غير صحيح'
      },
      index: true
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [APP_CONFIG.SECURITY.PASSWORD_MIN_LENGTH, `كلمة المرور يجب أن تكون على الأقل ${APP_CONFIG.SECURITY.PASSWORD_MIN_LENGTH} أحرف`],
      select: false // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || VALIDATION_PATTERNS.PHONE.test(v);
        },
        message: 'رقم الهاتف غير صحيح'
      },
      sparse: true, // Allow multiple null values
      index: true
    },
    role: {
      type: String,
      enum: {
        values: Object.values(SYSTEM_ROLES),
        message: 'نوع المستخدم غير صحيح'
      },
      default: SYSTEM_ROLES.USER,
      required: [true, 'نوع المستخدم مطلوب'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: 'حالة المستخدم غير صحيحة'
      },
      default: USER_STATUS.APPROVED,
      index: true
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      index: true
    },
    isLoggedIn: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ['system', 'google', 'facebook'],
      default: 'system'
    },
    forgetCode: {
      type: String,
      select: false // Don't include in queries by default
    },
    
    // Location information
    governorate: {
      type: String,
      required: [true, 'المحافظة مطلوبة'],
      enum: {
        values: GOVERNORATES,
        message: 'المحافظة غير صحيحة'
      },
      index: true
    },
    
    // Student-specific fields
    gradeLevel: {
      type: String,
      enum: {
        values: Object.values(GRADE_LEVELS),
        message: 'المرحلة الدراسية غير صحيحة'
      },
      required: function() {
        return this.role === SYSTEM_ROLES.USER;
      },
      index: true
    },
    
    // Instructor-specific fields
    subject: {
      type: String,
      enum: {
        values: SUBJECTS,
        message: 'المادة الدراسية غير صحيحة'
      },
      required: function() {
        return this.role === SYSTEM_ROLES.INSTRUCTOR;
      },
      index: true
    },
    document: {
      secure_url: {
        type: String,
        required: function() {
          return this.role === SYSTEM_ROLES.INSTRUCTOR;
        }
      },
      public_id: {
        type: String,
        required: function() {
          return this.role === SYSTEM_ROLES.INSTRUCTOR;
        }
      }
    },
    
    // Security fields
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    
    // Tracking fields
    lastLogin: {
      type: Date
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    
    // Profile completeness
    profileComplete: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.forgetCode;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ governorate: 1, gradeLevel: 1 });
userSchema.index({ role: 1, subject: 1 });
userSchema.index({ isConfirmed: 1, status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActivity: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcryptjs.genSalt(APP_CONFIG.SECURITY.SALT_ROUNDS);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware for profile completeness
userSchema.pre('save', function(next) {
  this.profileComplete = this.isProfileComplete();
  next();
});

// Pre-save middleware for instructor status
userSchema.pre('save', function(next) {
  if (this.role === SYSTEM_ROLES.INSTRUCTOR && this.isNew) {
    this.status = USER_STATUS.PENDING;
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Instance method to check if profile is complete
userSchema.methods.isProfileComplete = function() {
  const requiredFields = ['firstName', 'lastName', 'email', 'governorate'];
  
  if (this.role === SYSTEM_ROLES.USER) {
    requiredFields.push('gradeLevel');
  }
  
  if (this.role === SYSTEM_ROLES.INSTRUCTOR) {
    requiredFields.push('subject', 'document.secure_url');
  }
  
  return requiredFields.every(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return this[parent] && this[parent][child];
    }
    return this[field];
  });
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Check if we need to lock the account
  if (this.loginAttempts + 1 >= APP_CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + APP_CONFIG.SECURITY.LOCKOUT_TIME };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

// Static method to find pending instructors
userSchema.statics.findPendingInstructors = function() {
  return this.find({ 
    role: SYSTEM_ROLES.INSTRUCTOR, 
    status: USER_STATUS.PENDING 
  });
};

// Static method to find users by governorate
userSchema.statics.findByGovernorate = function(governorate) {
  return this.find({ governorate });
};

// Static method to get user statistics
userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        confirmed: { $sum: { $cond: ['$isConfirmed', 1, 0] } },
        active: { $sum: { $cond: ['$isLoggedIn', 1, 0] } }
      }
    }
  ]);
  
  return stats;
};

// Create model
const userModel = mongoose.models.User || model("User", userSchema);

export default userModel;
