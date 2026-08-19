const arrow = document.getElementById('qiblaArrow');
const bearingValue = document.getElementById('bearingValue');
const bearingDirection = document.getElementById('bearingDirection');
const errorMessage = document.getElementById('errorMessage');
const getLocationBtn = document.getElementById('getLocationBtn');
const manualForm = document.getElementById('manualForm');

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('visible');
}

function hideError() {
    errorMessage.classList.remove('visible');
}

function displayResult(lat, lng) {
    hideError();

    if (!validateCoordinates(lat, lng)) {
        showError('إحداثيات غير صالحة. تحقق من القيم المدخلة.');
        return;
    }

    const bearing = calculateQiblaBearing(lat, lng);

    bearingValue.textContent = bearing.toFixed(1);

    arrow.style.transform = `rotate(${bearing}deg)`;

    const directions = [
        { min: 0, max: 22.5, label: 'شمالاً' },
        { min: 22.5, max: 67.5, label: 'شمالاً شرقاً' },
        { min: 67.5, max: 112.5, label: 'شرقاً' },
        { min: 112.5, max: 157.5, label: 'جنوباً شرقاً' },
        { min: 157.5, max: 202.5, label: 'جنوباً' },
        { min: 202.5, max: 247.5, label: 'جنوباً غرباً' },
        { min: 247.5, max: 292.5, label: 'غرباً' },
        { min: 292.5, max: 337.5, label: 'شمالاً غرباً' },
        { min: 337.5, max: 360, label: 'شمالاً' }
    ];

    const dir = directions.find(d => bearing >= d.min && bearing < d.max);
    bearingDirection.textContent = `اتجاه القبلة: ${dir ? dir.label : ''} (${bearing.toFixed(1)}°)`;

    initMap(lat, lng);
}

getLocationBtn.addEventListener('click', function () {
    if (!navigator.geolocation) {
        showError('متصفحك لا يدعم تحديد الموقع.');
        return;
    }

    getLocationBtn.textContent = 'جاري التحديد...';
    getLocationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        function (position) {
            getLocationBtn.textContent = 'تحديد موقعي تلقائياً';
            getLocationBtn.disabled = false;
            displayResult(position.coords.latitude, position.coords.longitude);
        },
        function (error) {
            getLocationBtn.textContent = 'تحديد موقعي تلقائياً';
            getLocationBtn.disabled = false;

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    showError('تم رفض إذن الموقع. أدخل إحداثياتك يدوياً.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    showError('معلومات الموقع غير متاحة. أدخل إحداثياتك يدوياً.');
                    break;
                case error.TIMEOUT:
                    showError('انتهت مهلة طلب الموقع. حاول مجدداً.');
                    break;
                default:
                    showError('حدث خطأ في تحديد الموقع.');
                    break;
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
});

manualForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const lat = parseFloat(document.getElementById('latInput').value);
    const lng = parseFloat(document.getElementById('lngInput').value);

    displayResult(lat, lng);
});
