# 🚀 دليل إعداد متغيرات البيئة في Vercel

## المشكلة الحالية
التطبيق يعمل بشكل صحيح محلياً ولكن يفشل في Vercel بسبب عدم وجود متغيرات البيئة المطلوبة.

## الخطوات المطلوبة

### 1. الدخول إلى لوحة تحكم Vercel
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع `topamun-backend`
3. اذهب إلى `Settings` > `Environment Variables`

### 2. إضافة المتغيرات المطلوبة

#### متغيرات قاعدة البيانات (مطلوبة)
```
CONNECTION_URL=mongodb+srv://topamun:topamun123@cluster0.fya37pm.mongodb.net/Topamin?retryWrites=true&w=majority
```

#### متغيرات JWT والأمان (مطلوبة)
```
TOKEN_KEY=your-super-secret-jwt-token-key-for-topamun-platform-2024
JWT_SECRET_CONFIRMATION=your-super-secret-confirmation-token-key-for-topamun-platform-2024
BEARER_KEY=Bearer 
SALT_ROUND=12
```

#### متغيرات البريد الإلكتروني (اختيارية - لكن مهمة)
```
EMAIL=topamun.platform@gmail.com
EMAIL_PASSWORD=[كلمة مرور التطبيق من Gmail]
EMAIL_FROM="Topamun Platform" <topamun.platform@gmail.com>
```

#### متغيرات Cloudinary (اختيارية - لرفع الملفات)
```
CLOUD_NAME=[اسم Cloudinary الخاص بك]
API_KEY=[مفتاح API]
API_SECRET=[المفتاح السري]
```

#### متغيرات التطبيق العامة
```
NODE_ENV=production
FRONTEND_URL=https://topamun.com
API_BASE_URL=https://topamun-backend.vercel.app/api/v1
```

### 3. إعداد Gmail App Password (للبريد الإلكتروني)

#### الخطوات:
1. اذهب إلى [Google Account Settings](https://myaccount.google.com/)
2. اختر `Security` من القائمة الجانبية
3. فعّل `2-Step Verification` إذا لم تكن مُفعلة
4. ابحث عن `App passwords` وانقر عليها
5. اختر `Mail` كنوع التطبيق
6. انسخ كلمة المرور المُولدة واستخدمها في `EMAIL_PASSWORD`

### 4. إعداد Cloudinary (لرفع الملفات)

#### الخطوات:
1. اذهب إلى [Cloudinary](https://cloudinary.com/)
2. أنشئ حساب مجاني
3. من Dashboard، انسخ:
   - `Cloud Name`
   - `API Key`  
   - `API Secret`

### 5. إعادة النشر

بعد إضافة جميع المتغيرات:
1. اذهب إلى `Deployments` في لوحة تحكم Vercel
2. انقر على `Redeploy` للنشر الأخير
3. أو ادفع تغيير جديد إلى Git

## 🔍 التحقق من النجاح

بعد إعادة النشر، تحقق من:
1. `https://topamun-backend.vercel.app/health` - يجب أن يُظهر حالة صحية
2. `https://topamun-backend.vercel.app/api-docs` - يجب أن يعمل التوثيق
3. اختبار endpoint التسجيل من Swagger UI

## ⚠️ ملاحظات مهمة

### الأولوية:
1. **CONNECTION_URL** - الأهم (بدونه لن يعمل التطبيق)
2. **TOKEN_KEY & JWT_SECRET_CONFIRMATION** - مطلوبة للتوثيق
3. **EMAIL_** متغيرات - اختيارية لكن مهمة لتفعيل الحسابات
4. **CLOUD_** متغيرات - اختيارية لرفع الملفات

### في حالة عدم توفر بعض الخدمات:
- بدون إعدادات البريد: ستعمل عملية التسجيل لكن بدون تفعيل
- بدون Cloudinary: ستعمل عملية التسجيل لكن بدون رفع ملفات للمعلمين

## 🚨 استكشاف الأخطاء

إذا استمر الخطأ 500:
1. تحقق من `Function Logs` في Vercel
2. تأكد من صحة `CONNECTION_URL`
3. تأكد من إضافة جميع المتغيرات المطلوبة
4. جرب إعادة النشر مرة أخرى

## 📞 الدعم

إذا واجهت مشاكل، تحقق من:
- Function Logs في Vercel
- MongoDB Atlas connection logs
- Gmail security settings 