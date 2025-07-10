import { SYSTEM_ROLES, ERROR_MESSAGES } from "../config/constants.js";
import { catchAsync, AuthorizationError } from "../utils/error.class.js";

/**
 * Check if user has required role
 */
export const requireRole = (...allowedRoles) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError(ERROR_MESSAGES.TOKEN_REQUIRED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(ERROR_MESSAGES.FORBIDDEN));
    }

    next();
  });
};

/**
 * Check if user is admin
 */
export const requireAdmin = requireRole(SYSTEM_ROLES.ADMIN);

/**
 * Check if user is instructor
 */
export const requireInstructor = requireRole(SYSTEM_ROLES.INSTRUCTOR);

/**
 * Check if user is student
 */
export const requireStudent = requireRole(SYSTEM_ROLES.USER);

/**
 * Check if user is admin or instructor
 */
export const requireAdminOrInstructor = requireRole(SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.INSTRUCTOR);

/**
 * Check if user is admin or the resource owner
 */
export const requireAdminOrOwner = (getResourceUserId) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError(ERROR_MESSAGES.TOKEN_REQUIRED));
    }

    // Admin can access everything
    if (req.user.role === SYSTEM_ROLES.ADMIN) {
      return next();
    }

    // Get resource user ID
    const resourceUserId = typeof getResourceUserId === 'function' 
      ? getResourceUserId(req) 
      : req.params.userId || req.user._id;

    // Check if user is the owner
    if (req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }

    return next(new AuthorizationError(ERROR_MESSAGES.FORBIDDEN));
  });
};

/**
 * Check if user can access user profile
 */
export const canAccessProfile = requireAdminOrOwner((req) => req.params.userId || req.user._id);

/**
 * Check if instructor is approved
 */
export const requireApprovedInstructor = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AuthorizationError(ERROR_MESSAGES.TOKEN_REQUIRED));
  }

  if (req.user.role !== SYSTEM_ROLES.INSTRUCTOR) {
    return next(new AuthorizationError(ERROR_MESSAGES.FORBIDDEN));
  }

  if (req.user.status !== 'approved') {
    return next(new AuthorizationError('حسابك في انتظار الموافقة من الإدارة'));
  }

  next();
});

/**
 * Check if user can manage users (admin only)
 */
export const canManageUsers = requireRole(SYSTEM_ROLES.ADMIN);

/**
 * Check if user can approve instructors (admin only)
 */
export const canApproveInstructors = requireRole(SYSTEM_ROLES.ADMIN);

/**
 * Check if user can access system statistics (admin only)
 */
export const canAccessSystemStats = requireRole(SYSTEM_ROLES.ADMIN);

/**
 * Check if user can moderate content (admin or approved instructor)
 */
export const canModerateContent = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AuthorizationError(ERROR_MESSAGES.TOKEN_REQUIRED));
  }

  // Admin can moderate everything
  if (req.user.role === SYSTEM_ROLES.ADMIN) {
    return next();
  }

  // Approved instructors can moderate their content
  if (req.user.role === SYSTEM_ROLES.INSTRUCTOR && req.user.status === 'approved') {
    return next();
  }

  return next(new AuthorizationError(ERROR_MESSAGES.FORBIDDEN));
});

/**
 * Check resource ownership with custom logic
 */
export const requireOwnership = (getResourceUserId, allowedRoles = []) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError(ERROR_MESSAGES.TOKEN_REQUIRED));
    }

    // Check if user has allowed role
    if (allowedRoles.length > 0 && allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Get resource user ID
    const resourceUserId = typeof getResourceUserId === 'function' 
      ? await getResourceUserId(req) 
      : getResourceUserId;

    // Check ownership
    if (req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }

    return next(new AuthorizationError(ERROR_MESSAGES.FORBIDDEN));
  });
};

/**
 * Check if user can access governorate-specific content
 */
export const requireSameGovernorate = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AuthorizationError(ERROR_MESSAGES.TOKEN_REQUIRED));
  }

  // Admin can access all governorates
  if (req.user.role === SYSTEM_ROLES.ADMIN) {
    return next();
  }

  const targetGovernorate = req.params.governorate || req.body.governorate;
  
  if (req.user.governorate !== targetGovernorate) {
    return next(new AuthorizationError('لا يمكنك الوصول لمحتوى محافظة أخرى'));
  }

  next();
});

/**
 * Check if user can access grade-specific content
 */
export const requireSameGrade = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AuthorizationError(ERROR_MESSAGES.TOKEN_REQUIRED));
  }

  // Admin and instructors can access all grades
  if ([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.INSTRUCTOR].includes(req.user.role)) {
    return next();
  }

  const targetGrade = req.params.grade || req.body.gradeLevel;
  
  if (req.user.gradeLevel !== targetGrade) {
    return next(new AuthorizationError('لا يمكنك الوصول لمحتوى مرحلة دراسية أخرى'));
  }

  next();
});

export default {
  requireRole,
  requireAdmin,
  requireInstructor,
  requireStudent,
  requireAdminOrInstructor,
  requireAdminOrOwner,
  canAccessProfile,
  requireApprovedInstructor,
  canManageUsers,
  canApproveInstructors,
  canAccessSystemStats,
  canModerateContent,
  requireOwnership,
  requireSameGovernorate,
  requireSameGrade
};
