# اتجاه القبلة - Qibla Direction Finder

تطبيق ويب بسيط لتحديد اتجاه القبلة من موقعك الحالي.

## المميزات

- تحديد الموقع تلقائياً عبر GPS
- بوصلة تفاعلية تُشير لاتجاه القبلة
- خريطة تفاعلية تُظهر مسارك نحو الكعبة
- تصميم متجاوب يعمل على الهاتف والكمبيوتر
- رمز QR لمشاركة الرابط بسهولة

## الاستخدام

1. افتح الصفحة في المتصفح
2. اضغط **تحديد اتجاه القبلة**
3. اسمح بتحديد الموقع
4. حرّك الهاتف حتى يشير السهم للأعلى

## التقنيات

- HTML5 + CSS3 + JavaScript
- [Leaflet.js](https://leafletjs.com/) — الخرائط التفاعلية
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) — توليد رمز QR

## التشغيل المحلي

```bash
git clone https://github.com/ahmed4050/Qibla-Direction-Finder.git
cd Qibla-Direction-Finder
python -m http.server 8000
```

ثم افتح `http://localhost:8000`

## الرخصة

MIT
