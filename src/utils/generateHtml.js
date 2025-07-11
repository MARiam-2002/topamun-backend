/**
 * Creates a branded, responsive, and RTL-ready HTML email template.
 * @param {string} title - The title of the email, for the <title> tag.
 * @param {string} content - The HTML content of the email body.
 * @returns {string} - The full HTML email template.
 */
const createBaseTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Tajawal', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            direction: rtl;
            color: #343a40;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #dee2e6;
            box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        }
        .header {
            background: linear-gradient(135deg, #2D65B4, #3B82F6);
            color: #ffffff;
            padding: 25px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 35px 30px;
            text-align: right;
            line-height: 1.8;
        }
        .content h2 {
            color: #1e3a8a;
            font-size: 22px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #3B82F6;
            color: #ffffff !important;
            padding: 14px 28px;
            margin: 20px auto;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
            background-color: #2563EB;
        }
        .button-wrapper{
            text-align: center;
        }
        .code-wrapper {
            text-align: center;
            margin: 25px 0;
        }
        .code {
            display: inline-block;
            background-color: #e9ecef;
            color: #1e3a8a;
            padding: 12px 25px;
            border-radius: 8px;
            font-size: 22px;
            letter-spacing: 5px;
            font-weight: bold;
            border: 1px dashed #ced4da;
        }
        .footer {
            background-color: #f1f3f5;
            color: #6c757d;
            text-align: center;
            padding: 20px;
            font-size: 13px;
            border-top: 1px solid #dee2e6;
        }
        .link {
            color: #3B82F6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>منصة توبامين</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} توبامين. جميع الحقوق محفوظة.</p>
            <p>إذا كانت لديك أي أسئلة، لا تتردد في التواصل معنا.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Generates the email for account activation.
 * @param {string} name - The user's first name.
 * @param {string} link - The activation link.
 * @returns {string} - The full HTML email.
 */
export const activationEmail = (name, link) => {
    const content = `
        <h2>أهلاً بك ${name}!</h2>
        <p>شكراً لتسجيلك في منصة توبامين. خطوة واحدة تفصلنا عن البدء، يرجى تفعيل حسابك بالضغط على الزر أدناه:</p>
        <div class="button-wrapper">
            <a href="${link}" class="cta-button">تفعيل الحساب</a>
        </div>
        <p>إذا كنت تواجه مشكلة، يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
        <p><a href="${link}" class="link">${link}</a></p>
        <p>نتطلع لرؤيتك في المنصة!</p>
    `;
    return createBaseTemplate("تفعيل حسابك في توبامين", content);
};

/**
 * Generates the email for password reset.
 * @param {string} name - The user's first name.
 * @param {string} code - The password reset code.
 * @returns {string} - The full HTML email.
 */
export const passwordResetEmail = (name, code) => {
    const content = `
        <h2>مرحباً ${name},</h2>
        <p>لقد طلبت إعادة تعيين كلمة المرور. استخدم الرمز التالي لإكمال العملية. هذا الرمز صالح لمدة 10 دقائق فقط.</p>
        <div class="code-wrapper">
            <div class="code">${code}</div>
        </div>
        <p>إذا لم تطلب أنت هذا الإجراء، فيمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>
    `;
    return createBaseTemplate("إعادة تعيين كلمة المرور", content);
};

/**
 * Generates the email for a teacher's pending application.
 * @param {string} name - The teacher's first name.
 * @returns {string} - The full HTML email.
 */
export const teacherPendingEmail = (name) => {
    const content = `
        <h2>أهلاً بك أستاذ ${name},</h2>
        <p>لقد استلمنا طلب التسجيل الخاص بك كـ "معلم" في منصة توبامين، وهو الآن قيد المراجعة من قبل فريقنا.</p>
        <p>سنقوم بإعلامك عبر البريد الإلكتروني فور الموافقة على طلبك. شكراً لصبرك.</p>
        <p>فريق توبامين</p>
    `;
    return createBaseTemplate("طلب التسجيل قيد المراجعة", content);
};
