# دليل إعداد Firebase - StudyMune

## 🔥 تفعيل Firebase Authentication و Firestore Database

### المتطلبات الأساسية
- حساب Firebase (مجاني)
- مشروع Firebase: `studio-3877062640-1afd2`

---

## 1️⃣ تفعيل Firebase Authentication

### الخطوة 1: الذهاب إلى Authentication
1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **studio-3877062640-1afd2**
3. من القائمة الجانبية، اضغط على **"Authentication"**
4. اضغط على **"Get Started"**

### الخطوة 2: تفعيل Email/Password
1. اذهب إلى تبويب **"Sign-in method"**
2. اضغط على **"Email/Password"**
3. فعّل الخيار الأول: **"Email/Password"** ✅
4. اضغط **"Save"**

### الخطوة 3: تفعيل Google Sign-In
1. في نفس الصفحة (Sign-in method)
2. اضغط على **"Google"**
3. فعّل **"Enable"** ✅
4. أدخل:
   - **Project public-facing name**: StudyMune
   - **Project support email**: بريدك الإلكتروني
5. اضغط **"Save"**

### الخطوة 4: إضافة Authorized Domains
1. في صفحة Authentication → Settings
2. اذهب إلى **"Authorized domains"**
3. أضف النطاقات التالية:
   ```
   replit.dev
   *.replit.dev
   ```
4. احفظ التغييرات

---

## 2️⃣ تفعيل Firestore Database

### الخطوة 1: إنشاء Database
1. من القائمة الجانبية، اضغط على **"Firestore Database"**
2. اضغط على **"Create database"**

### الخطوة 2: اختيار وضع الأمان
اختر أحد الخيارات:

**للتطوير (موصى به للبداية):**
- اختر **"Start in test mode"**
- سيسمح بالقراءة والكتابة لمدة 30 يوماً

**للإنتاج:**
- اختر **"Start in production mode"**
- ستحتاج لتطبيق قواعد الأمان فوراً

### الخطوة 3: اختيار الموقع
- اختر المنطقة الأقرب إليك (مثل: `europe-west` للشرق الأوسط)
- ⚠️ **تنبيه:** لا يمكن تغيير الموقع بعد الإنشاء

### الخطوة 4: تطبيق قواعد الأمان
1. اذهب إلى تبويب **"Rules"** في Firestore
2. استبدل القواعد الموجودة بهذه القواعد:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection rules
    match /users/{userId} {
      // Users can read any authenticated user's profile
      allow read: if request.auth != null;
      
      // Users can only write to their own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. اضغط **"Publish"**

---

## 3️⃣ التحقق من الإعداد

### اختبار تسجيل الدخول
1. افتح تطبيقك على Replit
2. اذهب إلى صفحة Sign Up: `/signup`
3. أنشئ حساب جديد باستخدام:
   - البريد الإلكتروني وكلمة المرور
   - أو Google Sign-In

### التحقق من قاعدة البيانات
1. في Firebase Console → Firestore Database
2. يجب أن ترى مجموعة `users` جديدة
3. بداخلها ملف المستخدم الذي أنشأته للتو

---

## 4️⃣ هيكل قاعدة البيانات

### مجموعة Users (`users/{userId}`)
```json
{
  "uid": "user-unique-id",
  "email": "user@example.com",
  "displayName": "اسم المستخدم",
  "photoURL": "رابط الصورة",
  "tokens": {
    "used": 0,
    "total": 100
  }
}
```

---

## 🔒 نصائح الأمان

1. **لا تشارك مفاتيح API العامة (Firebase Config)** في أماكن عامة
2. **استخدم Firestore Rules** لحماية البيانات
3. **فعّل Authentication** قبل السماح بالوصول لقاعدة البيانات
4. **راقب الاستخدام** في Firebase Console لاكتشاف أي نشاط غير طبيعي

---

## ❓ استكشاف الأخطاء

### خطأ: "Firebase services are not available"
- تأكد من أن جميع المتغيرات البيئية مُعرّفة في `.env.local`
- أعد تشغيل خادم التطوير

### خطأ: "auth/popup-blocked"
- تأكد من السماح للنوافذ المنبثقة في المتصفح
- أضف النطاق المناسب في Authorized Domains

### خطأ: "permission-denied" في Firestore
- تحقق من قواعد Firestore
- تأكد من أن المستخدم مسجل دخول

---

## 📚 مصادر إضافية

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
