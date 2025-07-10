import userModel from "../../../../DB/models/user.model.js";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  HTTP_STATUS,
  SYSTEM_ROLES,
  USER_STATUS
} from "../../../config/constants.js";
import { 
  catchAsync,
  NotFoundError,
  ValidationError,
  AuthorizationError
} from "../../../utils/error.class.js";
import { sendSuccess } from "../../../utils/error-handling.js";

/**
 * Get current user profile
 */
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user._id)
    .select('-password -forgetCode');

  if (!user) {
    return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
  }

  sendSuccess(res, { user }, 'تم الحصول على الملف الشخصي بنجاح', HTTP_STATUS.OK);
});

/**
 * Update user profile
 */
export const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone, governorate, gradeLevel, subject } = req.body;
  const userId = req.user._id;

  // Prepare update data
  const updateData = {};
  
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (governorate) updateData.governorate = governorate;
  
  // Role-specific updates
  if (req.user.role === SYSTEM_ROLES.USER && gradeLevel) {
    updateData.gradeLevel = gradeLevel;
  }
  
  if (req.user.role === SYSTEM_ROLES.INSTRUCTOR && subject) {
    updateData.subject = subject;
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -forgetCode');

  if (!updatedUser) {
    return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
  }

  sendSuccess(res, { user: updatedUser }, SUCCESS_MESSAGES.PROFILE_UPDATED, HTTP_STATUS.OK);
});

/**
 * Change user password
 */
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await userModel.findById(userId).select('+password');
  
  if (!user) {
    return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new ValidationError('كلمة المرور الحالية غير صحيحة'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 'تم تغيير كلمة المرور بنجاح', HTTP_STATUS.OK);
});

/**
 * Get user by ID (Admin only)
 */
export const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId)
    .select('-password -forgetCode');

  if (!user) {
    return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
  }

  sendSuccess(res, { user }, 'تم الحصول على بيانات المستخدم بنجاح', HTTP_STATUS.OK);
});

/**
 * Get all users with pagination and filters (Admin only)
 */
export const getAllUsers = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = '-createdAt',
    role,
    governorate,
    gradeLevel,
    subject,
    status,
    isConfirmed,
    query
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (role) filter.role = role;
  if (governorate) filter.governorate = governorate;
  if (gradeLevel) filter.gradeLevel = gradeLevel;
  if (subject) filter.subject = subject;
  if (status) filter.status = status;
  if (isConfirmed !== undefined) filter.isConfirmed = isConfirmed === 'true';
  
  // Add search functionality
  if (query) {
    filter.$or = [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get users with pagination
  const users = await userModel.find(filter)
    .select('-password -forgetCode')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const totalUsers = await userModel.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / parseInt(limit));

  // Prepare response
  const response = {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalUsers,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    }
  };

  sendSuccess(res, response, 'تم الحصول على قائمة المستخدمين بنجاح', HTTP_STATUS.OK);
});

/**
 * Get pending instructors (Admin only)
 */
export const getPendingInstructors = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const instructors = await userModel.find({
    role: SYSTEM_ROLES.INSTRUCTOR,
    status: USER_STATUS.PENDING
  })
    .select('-password -forgetCode')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const totalInstructors = await userModel.countDocuments({
    role: SYSTEM_ROLES.INSTRUCTOR,
    status: USER_STATUS.PENDING
  });

  const totalPages = Math.ceil(totalInstructors / parseInt(limit));

  const response = {
    instructors,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalInstructors,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    }
  };

  sendSuccess(res, response, 'تم الحصول على قائمة المعلمين المعلقين بنجاح', HTTP_STATUS.OK);
});

/**
 * Approve or reject instructor (Admin only)
 */
export const updateInstructorStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { status, reason } = req.body;

  // Validate status
  if (!['approved', 'rejected'].includes(status)) {
    return next(new ValidationError('حالة المعلم يجب أن تكون "approved" أو "rejected"'));
  }

  const instructor = await userModel.findOne({
    _id: userId,
    role: SYSTEM_ROLES.INSTRUCTOR
  });

  if (!instructor) {
    return next(new NotFoundError('المعلم غير موجود'));
  }

  // Update status
  instructor.status = status;
  await instructor.save();

  // TODO: Send notification email to instructor about status change

  const message = status === 'approved' 
    ? 'تم قبول المعلم بنجاح' 
    : 'تم رفض المعلم';

  sendSuccess(res, { instructor }, message, HTTP_STATUS.OK);
});

/**
 * Delete user account (Admin only)
 */
export const deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId);

  if (!user) {
    return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
  }

  // Prevent admin from deleting other admins
  if (user.role === SYSTEM_ROLES.ADMIN && req.user.role === SYSTEM_ROLES.ADMIN) {
    return next(new AuthorizationError('لا يمكن حذف حساب مدير آخر'));
  }

  await userModel.findByIdAndDelete(userId);

  sendSuccess(res, null, 'تم حذف المستخدم بنجاح', HTTP_STATUS.OK);
});

/**
 * Get user statistics (Admin only)
 */
export const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await userModel.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        confirmed: { $sum: { $cond: ['$isConfirmed', 1, 0] } },
        active: { $sum: { $cond: ['$isLoggedIn', 1, 0] } }
      }
    }
  ]);

  // Get instructor status breakdown
  const instructorStats = await userModel.aggregate([
    {
      $match: { role: SYSTEM_ROLES.INSTRUCTOR }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get governorate distribution
  const governorateStats = await userModel.aggregate([
    {
      $group: {
        _id: '$governorate',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const response = {
    userRoleStats: stats,
    instructorStatusStats: instructorStats,
    governorateDistribution: governorateStats
  };

  sendSuccess(res, response, 'تم الحصول على إحصائيات المستخدمين بنجاح', HTTP_STATUS.OK);
});

/**
 * Search users (Admin only)
 */
export const searchUsers = catchAsync(async (req, res, next) => {
  const { query, role, governorate, limit = 10 } = req.query;

  if (!query || query.length < 2) {
    return next(new ValidationError('كلمة البحث يجب أن تكون على الأقل حرفين'));
  }

  // Build search filter
  const filter = {
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  };

  if (role) filter.role = role;
  if (governorate) filter.governorate = governorate;

  const users = await userModel.find(filter)
    .select('firstName lastName email role governorate gradeLevel subject status isConfirmed')
    .limit(parseInt(limit));

  sendSuccess(res, { users }, 'تم البحث بنجاح', HTTP_STATUS.OK);
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getAllUsers,
  getPendingInstructors,
  updateInstructorStatus,
  deleteUser,
  getUserStats,
  searchUsers
}; 