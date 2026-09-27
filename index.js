// server.js - متوافق بالكامل مع Vercel و Gemini API
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

// تقديم الملفات الستاتيكية (HTML/CSS/JS)
app.use(express.static(path.join(__dirname)));

// جلب مفتاح الـ API المسجل في Vercel
const apiKey = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: 'يرجى كتابة نص أولاً.' });
  }

  if (!apiKey) {
    return res.status(500).json({ reply: 'خطأ: لم يتم التعرف على مفتاح GEMINI_API_KEY في Vercel.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: 'أنت مساعد OmniFix AI الذكي. أجب على كافة أسئلة المستخدمين بذكاء ودقة، واكتب الأكواد البرمجية واشرحها وقم بحل المشكلات. يُمنع منعاً باتاً توليد أو إجابة طلبات إنشاء الصور والفيديوهات، واعتذر بلباقة وبشكل محترف إذا طلب المستخدم ذلك.'
      }
    });

    const aiReply = response.text || 'لم أتمكن من الحصول على إجابة حالياً.';
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ reply: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ' + (error.message || 'خطأ غير معروف') });
  }
});

// الصفحة الرئيسية
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// تصدير التطبيق ليعمل على Vercel Serverless
module.exports = app;

// تشغيل محلي في حال التجربة على جهازك
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}
