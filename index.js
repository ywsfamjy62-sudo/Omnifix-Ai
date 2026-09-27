const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// جلب مفتاح الـ API من متغيرات البيئة في Vercel
const apiKey = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: 'يرجى كتابة نص أولاً.' });
  }

  if (!apiKey) {
    return res.status(500).json({ reply: 'خطأ: لم يتم العثور على GEMINI_API_KEY في Vercel.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // استدعاء نموذج gemini-2.5-flash المباشر
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: 'أنت مساعد OmniFix AI الذكي. أجب على كافة أسئلة المستخدمين بدقة واكتب الأكواد واشرحها. يُمنع منعاً باتاً توليد أو إجابة طلبات إنشاء الصور والفيديوهات، واعتذر بلباقة عند طلبها.'
      }
    });

    const aiReply = response.text || 'لم يتم استلام رد من الذكاء الاصطناعي.';
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ reply: 'خطأ بالسيرفر: ' + (error.message || 'خطأ غير معروف') });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('Server running on port 3000'));
}
