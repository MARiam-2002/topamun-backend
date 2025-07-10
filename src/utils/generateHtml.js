export const signupTemp = (link) => `
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #0D99FF; padding: 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 30px; color: #333333; line-height: 1.6; text-align: right; }
        .content h2 { color: #0D99FF; }
        .content p { margin: 15px 0; }
        .button-container { text-align: center; margin-top: 30px; }
        .button { background-color: #0D99FF; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
        .footer { background-color: #f4f7f6; color: #777777; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>توبامين</h1>
        </div>
        <div class="content">
            <h2>مرحبًا بك في منصة توبامين!</h2>
            <p>شكرًا لتسجيلك. خطوة واحدة فقط تفصلك عن البدء.</p>
            <p>يرجى النقر على الزر أدناه لتفعيل حسابك:</p>
            <div class="button-container">
                <a href="${link}" class="button">تفعيل الحساب</a>
            </div>
            <p>إذا كنت تواجه مشكلة في النقر على الزر، يرجى نسخ ولصق الرابط التالي في متصفحك:</p>
            <p><a href="${link}" style="color: #0D99FF; word-break: break-all;">${link}</a></p>
            <p>نتطلع لرؤيتك!</p>
        </div>
        <div class="footer">
            <p>&copy; 2023 توبامين. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
`;

export const resetPassword = (code) => `
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #0D99FF; padding: 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 30px; color: #333333; line-height: 1.6; text-align: right; }
        .content h2 { color: #0D99FF; }
        .content p { margin: 15px 0; }
        .code-container { text-align: center; margin: 30px 0; }
        .code { background-color: #eaf0f6; color: #0D99FF; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block; }
        .footer { background-color: #f4f7f6; color: #777777; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>توبامين</h1>
        </div>
        <div class="content">
            <h2>طلب إعادة تعيين كلمة المرور</h2>
            <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك.</p>
            <p>استخدم الرمز التالي لإكمال العملية. هذا الرمز صالح لمدة 10 دقائق فقط.</p>
            <div class="code-container">
                <span class="code">${code}</span>
            </div>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
        </div>
        <div class="footer">
            <p>&copy; 2023 توبامين. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
`;
