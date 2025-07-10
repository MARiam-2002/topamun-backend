# 🎓 دليل تكامل API منصة توبامين التعليمية

## 📋 نظرة عامة

مرحباً بك في دليل تكامل API منصة توبامين! هذا الدليل سيساعدك في فهم كيفية استخدام جميع واجهات برمجة التطبيقات المتاحة مع أمثلة عملية بلغات وأطر عمل مختلفة.

## 🌐 معلومات الخادم

- **خادم الإنتاج**: `https://topamun-backend.vercel.app/api/v1`
- **خادم التطوير**: `http://localhost:3000/api/v1`
- **التوثيق التفاعلي**: [https://topamun-backend.vercel.app/api-docs](https://topamun-backend.vercel.app/api-docs)

## 🔐 نظام التوثيق

### معلومات JWT Token
- **النوع**: Bearer Token
- **المدة**: 7 أيام
- **الرأس**: `Authorization: Bearer YOUR_TOKEN`
- **التشفير**: HS256

### طريقة الاستخدام
```javascript
// إضافة الرمز لجميع الطلبات
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## 👥 أنواع المستخدمين

### 1. الطلاب (Students) - `role: "user"`
- يحتاجون تحديد المرحلة الدراسية والمحافظة
- لا يحتاجون رفع وثائق
- يمكنهم تسجيل الدخول فور تفعيل البريد الإلكتروني

### 2. المعلمين (Instructors) - `role: "instructor"`
- يحتاجون رفع وثيقة تأهيل (PDF أو صورة)
- يحتاجون تحديد المادة التي يدرسونها
- يحتاجون موافقة الإدارة قبل تسجيل الدخول

### 3. المديرين (Admins) - `role: "admin"`
- لديهم صلاحيات إدارية كاملة
- يمكنهم الموافقة على طلبات المعلمين

## 📝 أمثلة التكامل

### 1. تسجيل حساب جديد

#### JavaScript (Vanilla)
```javascript
// تسجيل طالب جديد
async function registerStudent(studentData) {
  const formData = new FormData();
  
  // إضافة البيانات
  formData.append('firstName', studentData.firstName);
  formData.append('lastName', studentData.lastName);
  formData.append('email', studentData.email);
  formData.append('password', studentData.password);
  formData.append('confirmPassword', studentData.confirmPassword);
  formData.append('phone', studentData.phone);
  formData.append('role', 'user');
  formData.append('governorate', studentData.governorate);
  formData.append('gradeLevel', studentData.gradeLevel);

  try {
    const response = await fetch('https://topamun-backend.vercel.app/api/v1/auth/signup', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      alert('تم التسجيل بنجاح! يرجى فحص بريدك الإلكتروني');
      // توجيه المستخدم لصفحة تسجيل الدخول
      window.location.href = '/login';
    } else {
      console.error('خطأ في التسجيل:', result.message);
    }
  } catch (error) {
    console.error('خطأ في الشبكة:', error);
  }
}

// تسجيل معلم جديد
async function registerInstructor(instructorData, documentFile) {
  const formData = new FormData();
  
  // إضافة البيانات
  formData.append('firstName', instructorData.firstName);
  formData.append('lastName', instructorData.lastName);
  formData.append('email', instructorData.email);
  formData.append('password', instructorData.password);
  formData.append('confirmPassword', instructorData.confirmPassword);
  formData.append('phone', instructorData.phone);
  formData.append('role', 'instructor');
  formData.append('governorate', instructorData.governorate);
  formData.append('subject', instructorData.subject);
  formData.append('document', documentFile); // ملف الوثيقة

  try {
    const response = await fetch('https://topamun-backend.vercel.app/api/v1/auth/signup', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      alert('تم التسجيل بنجاح! سيتم مراجعة طلبك من قبل الإدارة');
    } else {
      console.error('خطأ في التسجيل:', result.message);
    }
  } catch (error) {
    console.error('خطأ في الشبكة:', error);
  }
}
```

#### React.js
```jsx
import React, { useState } from 'react';
import axios from 'axios';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    governorate: '',
    gradeLevel: '',
    subject: ''
  });
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    if (document) {
      submitData.append('document', document);
    }

    try {
      const response = await axios.post(
        'https://topamun-backend.vercel.app/api/v1/auth/signup',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('تم التسجيل بنجاح!');
        // إعادة توجيه أو تنظيف النموذج
      }
    } catch (error) {
      console.error('خطأ في التسجيل:', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="الاسم الأول"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="الاسم الأخير"
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="كلمة المرور"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="تأكيد كلمة المرور"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        required
      />
      
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
      >
        <option value="user">طالب</option>
        <option value="instructor">معلم</option>
      </select>
      
      <input
        type="text"
        placeholder="المحافظة"
        value={formData.governorate}
        onChange={(e) => setFormData({...formData, governorate: e.target.value})}
        required
      />
      
      {formData.role === 'user' && (
        <select
          value={formData.gradeLevel}
          onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
          required
        >
          <option value="">اختر المرحلة الدراسية</option>
          <option value="المرحلة الابتدائية">المرحلة الابتدائية</option>
          <option value="المرحلة الإعدادية">المرحلة الإعدادية</option>
          <option value="المرحلة الثانوية">المرحلة الثانوية</option>
        </select>
      )}
      
      {formData.role === 'instructor' && (
        <>
          <input
            type="text"
            placeholder="المادة التي تدرسها"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            required
          />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setDocument(e.target.files[0])}
            required
          />
        </>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'جاري التسجيل...' : 'تسجيل'}
      </button>
    </form>
  );
};

export default SignupForm;
```

#### React Native
```jsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const SignupScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    governorate: '',
    gradeLevel: '',
    subject: ''
  });
  const [document, setDocument] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      setDocument(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('خطأ في اختيار الملف:', err);
      }
    }
  };

  const handleSignup = async () => {
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    if (document) {
      submitData.append('document', {
        uri: document.uri,
        type: document.type,
        name: document.name,
      });
    }

    try {
      const response = await fetch('https://topamun-backend.vercel.app/api/v1/auth/signup', {
        method: 'POST',
        body: submitData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('نجح التسجيل', 'تم التسجيل بنجاح! يرجى فحص بريدك الإلكتروني');
      } else {
        Alert.alert('خطأ', result.message);
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في الشبكة');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="الاسم الأول"
        value={formData.firstName}
        onChangeText={(text) => setFormData({...formData, firstName: text})}
      />
      
      <TextInput
        placeholder="الاسم الأخير"
        value={formData.lastName}
        onChangeText={(text) => setFormData({...formData, lastName: text})}
      />
      
      <TextInput
        placeholder="البريد الإلكتروني"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        keyboardType="email-address"
      />
      
      <TextInput
        placeholder="كلمة المرور"
        value={formData.password}
        onChangeText={(text) => setFormData({...formData, password: text})}
        secureTextEntry
      />
      
      {formData.role === 'instructor' && (
        <TouchableOpacity onPress={pickDocument}>
          <Text>اختر وثيقة التأهيل</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity onPress={handleSignup}>
        <Text>تسجيل</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;
```

### 2. تسجيل الدخول

#### JavaScript
```javascript
async function login(email, password) {
  try {
    const response = await fetch('https://topamun-backend.vercel.app/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    if (result.success) {
      // حفظ الرمز المميز
      localStorage.setItem('authToken', result.token);
      
      // فك تشفير الرمز للحصول على معلومات المستخدم
      const tokenPayload = JSON.parse(atob(result.token.split('.')[1]));
      localStorage.setItem('userInfo', JSON.stringify({
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role
      }));
      
      // إعادة توجيه حسب نوع المستخدم
      if (tokenPayload.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (tokenPayload.role === 'instructor') {
        window.location.href = '/instructor-dashboard';
      } else {
        window.location.href = '/student-dashboard';
      }
    } else {
      alert('خطأ في تسجيل الدخول: ' + result.message);
    }
  } catch (error) {
    console.error('خطأ في الشبكة:', error);
    alert('حدث خطأ في الاتصال');
  }
}
```

#### React.js مع Context
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('userInfo');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://topamun-backend.vercel.app/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (result.success) {
        const tokenPayload = JSON.parse(atob(result.token.split('.')[1]));
        const userInfo = {
          id: tokenPayload.id,
          email: tokenPayload.email,
          role: tokenPayload.role
        };
        
        setToken(result.token);
        setUser(userInfo);
        
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        return { success: true, user: userInfo };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'خطأ في الشبكة' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  };

  const getProfile = async () => {
    if (!token) return null;
    
    try {
      const response = await fetch('https://topamun-backend.vercel.app/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      return result.success ? result.user : null;
    } catch (error) {
      console.error('خطأ في الحصول على الملف الشخصي:', error);
      return null;
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    getProfile,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### 3. الحصول على الملف الشخصي

#### JavaScript
```javascript
async function getUserProfile() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    alert('يجب تسجيل الدخول أولاً');
    return;
  }

  try {
    const response = await fetch('https://topamun-backend.vercel.app/api/v1/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      return result.user;
    } else {
      console.error('خطأ في الحصول على الملف الشخصي:', result.message);
      return null;
    }
  } catch (error) {
    console.error('خطأ في الشبكة:', error);
    return null;
  }
}

// استخدام الدالة
getUserProfile().then(user => {
  if (user) {
    console.log('معلومات المستخدم:', user);
    // عرض المعلومات في الواجهة
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-role').textContent = user.role;
  }
});
```

### 4. إعادة تعيين كلمة المرور

#### JavaScript
```javascript
// طلب إعادة تعيين كلمة المرور
async function forgotPassword(email) {
  try {
    const response = await fetch('https://topamun-backend.vercel.app/api/v1/auth/forgot-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    
    if (result.success) {
      alert('تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      // توجيه المستخدم لصفحة إدخال الرمز
      window.location.href = '/reset-password';
    } else {
      alert('خطأ: ' + result.message);
    }
  } catch (error) {
    console.error('خطأ في الشبكة:', error);
  }
}

// إعادة تعيين كلمة المرور
async function resetPassword(email, forgetCode, password, confirmPassword) {
  try {
    const response = await fetch('https://topamun-backend.vercel.app/api/v1/auth/reset-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        forgetCode,
        password,
        confirmPassword
      })
    });

    const result = await response.json();
    
    if (result.success) {
      alert('تم إعادة تعيين كلمة المرور بنجاح');
      // توجيه المستخدم لصفحة تسجيل الدخول
      window.location.href = '/login';
    } else {
      alert('خطأ: ' + result.message);
    }
  } catch (error) {
    console.error('خطأ في الشبكة:', error);
  }
}
```

## 🛠️ أدوات مساعدة

### 1. دالة مساعدة للطلبات
```javascript
class TopamunAPI {
  constructor(baseURL = 'https://topamun-backend.vercel.app/api/v1') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'حدث خطأ في الطلب');
      }
      
      return result;
    } catch (error) {
      console.error('خطأ في API:', error);
      throw error;
    }
  }

  // طرق التوثيق
  async login(email, password) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });
    
    if (result.success) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async signup(userData) {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });

    return await this.request('/auth/signup', {
      method: 'POST',
      body: formData,
      headers: {}, // إزالة Content-Type للـ FormData
      skipAuth: true
    });
  }

  async getProfile() {
    return await this.request('/users/profile');
  }

  async forgotPassword(email) {
    return await this.request('/auth/forgot-password', {
      method: 'PATCH',
      body: JSON.stringify({ email }),
      skipAuth: true
    });
  }

  async resetPassword(email, forgetCode, password, confirmPassword) {
    return await this.request('/auth/reset-password', {
      method: 'PATCH',
      body: JSON.stringify({ email, forgetCode, password, confirmPassword }),
      skipAuth: true
    });
  }
}

// الاستخدام
const api = new TopamunAPI();

// تسجيل الدخول
api.login('user@example.com', 'password123')
  .then(result => {
    if (result.success) {
      console.log('تم تسجيل الدخول بنجاح');
    }
  })
  .catch(error => {
    console.error('خطأ في تسجيل الدخول:', error);
  });
```

### 2. Axios Interceptor للتعامل مع الأخطاء
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://topamun-backend.vercel.app/api/v1',
  timeout: 10000
});

// إضافة الرمز المميز تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// التعامل مع الأخطاء
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // انتهت صلاحية الرمز المميز
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## 🚨 التعامل مع الأخطاء

### أكواد الأخطاء الشائعة

| الكود | المعنى | الحل |
|-------|--------|------|
| 400 | خطأ في البيانات المُرسلة | تحقق من صحة البيانات |
| 401 | غير مصرح | تحقق من الرمز المميز |
| 403 | ممنوع | تحقق من الصلاحيات |
| 404 | غير موجود | تحقق من الرابط |
| 409 | تضارب | البريد الإلكتروني مستخدم |
| 500 | خطأ في الخادم | أعد المحاولة لاحقاً |

### مثال على التعامل مع الأخطاء
```javascript
async function handleAPICall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    let message = 'حدث خطأ غير متوقع';
    
    if (error.response) {
      // الخادم أرجع رد مع كود خطأ
      switch (error.response.status) {
        case 400:
          message = 'البيانات المُرسلة غير صحيحة';
          break;
        case 401:
          message = 'يجب تسجيل الدخول أولاً';
          break;
        case 403:
          message = 'لا تملك الصلاحية للوصول';
          break;
        case 404:
          message = 'المورد المطلوب غير موجود';
          break;
        case 409:
          message = 'البريد الإلكتروني مستخدم بالفعل';
          break;
        case 500:
          message = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
          break;
        default:
          message = error.response.data?.message || message;
      }
    } else if (error.request) {
      // لا يوجد رد من الخادم
      message = 'لا يمكن الوصول للخادم، تحقق من الاتصال';
    }
    
    return { success: false, message };
  }
}
```

## 🔒 نصائح الأمان

### 1. حماية الرمز المميز
```javascript
// تشفير الرمز قبل الحفظ (اختياري)
function encryptToken(token) {
  return btoa(token); // تشفير بسيط
}

function decryptToken(encryptedToken) {
  return atob(encryptedToken); // فك التشفير
}

// حفظ آمن
localStorage.setItem('authToken', encryptToken(token));

// استرجاع آمن
const token = decryptToken(localStorage.getItem('authToken'));
```

### 2. التحقق من انتهاء صلاحية الرمز
```javascript
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}

// استخدام الدالة
const token = localStorage.getItem('authToken');
if (token && isTokenExpired(token)) {
  // الرمز منتهي الصلاحية
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

### 3. تنظيف البيانات عند تسجيل الخروج
```javascript
function logout() {
  // إزالة جميع البيانات المحفوظة
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  sessionStorage.clear();
  
  // إعادة توجيه لصفحة تسجيل الدخول
  window.location.href = '/login';
}
```

## 📱 أمثلة للمنصات المختلفة

### Flutter/Dart
```dart
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class TopamunAPI {
  static const String baseURL = 'https://topamun-backend.vercel.app/api/v1';
  String? token;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseURL/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final result = jsonDecode(response.body);
    
    if (result['success']) {
      token = result['token'];
      // حفظ الرمز محلياً
      // SharedPreferences prefs = await SharedPreferences.getInstance();
      // prefs.setString('authToken', token!);
    }
    
    return result;
  }

  Future<Map<String, dynamic>> getProfile() async {
    if (token == null) {
      throw Exception('لم يتم تسجيل الدخول');
    }

    final response = await http.get(
      Uri.parse('$baseURL/users/profile'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    return jsonDecode(response.body);
  }
}
```

### PHP
```php
<?php
class TopamunAPI {
    private $baseURL = 'https://topamun-backend.vercel.app/api/v1';
    private $token;

    public function login($email, $password) {
        $data = json_encode([
            'email' => $email,
            'password' => $password
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseURL . '/auth/login');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data)
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        
        if ($result['success']) {
            $this->token = $result['token'];
            $_SESSION['authToken'] = $this->token;
        }
        
        return $result;
    }

    public function getProfile() {
        if (!$this->token) {
            throw new Exception('لم يتم تسجيل الدخول');
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseURL . '/users/profile');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->token
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }
}
?>
```

## 🎯 أفضل الممارسات

### 1. إدارة الحالة
- استخدم Context API في React أو Vuex في Vue.js
- احفظ الرمز المميز في مكان آمن
- تحقق من صلاحية الرمز قبل كل طلب

### 2. تجربة المستخدم
- أظهر رسائل تحميل أثناء الطلبات
- اعرض رسائل خطأ واضحة ومفيدة
- أضف إمكانية إعادة المحاولة

### 3. الأداء
- احفظ البيانات محلياً لتجنب الطلبات المتكررة
- استخدم pagination للقوائم الطويلة
- ضغط الصور قبل الرفع

### 4. الأمان
- لا تحفظ كلمات المرور في الذاكرة
- استخدم HTTPS دائماً
- تحقق من صحة البيانات في الواجهة والخادم

## 📞 الدعم والمساعدة

- **التوثيق التفاعلي**: [https://topamun-backend.vercel.app/api-docs](https://topamun-backend.vercel.app/api-docs)
- **البريد الإلكتروني**: support@topamun.com
- **الموقع الرسمي**: https://topamun.com

---

تم إنشاء هذا الدليل بعناية لتسهيل عملية التكامل مع API منصة توبامين. نتمنى لك تجربة تطوير ممتعة ومثمرة! 🚀 