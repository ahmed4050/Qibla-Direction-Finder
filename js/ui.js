const arrow = document.getElementById('qiblaArrow');
const bearingValue = document.getElementById('bearingValue');
const bearingDirection = document.getElementById('bearingDirection');
const errorMessage = document.getElementById('errorMessage');
const getLocationBtn = document.getElementById('getLocationBtn');
const manualForm = document.getElementById('manualForm');
const compassBtn = document.getElementById('compassBtn');
const compassRing = document.getElementById('compassRing');
const compassStatus = document.getElementById('compassStatus');
const qiblaIndicator = document.getElementById('qiblaIndicator');

let qiblaBearing = null;
let compassActive = false;
let deviceHeading = 0;

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('visible');
}

function hideError() {
    errorMessage.classList.remove('visible');
}

function getCardinalDirection(bearing) {
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
    return dir ? dir.label : '';
}

function updateCompassRotation() {
    if (!compassActive || qiblaBearing === null) return;

    const adjustedBearing = (qiblaBearing - deviceHeading + 360) % 360;
    compassRing.style.transform = `rotate(${-deviceHeading}deg)`;

    const indicatorAngle = adjustedBearing;
    const radian = (indicatorAngle - 90) * (Math.PI / 180);
    const radius = 42;
    const x = 50 + radius * Math.cos(radian);
    const y = 50 + radius * Math.sin(radian);

    qiblaIndicator.style.display = 'flex';
    qiblaIndicator.style.left = `${x}%`;
    qiblaIndicator.style.top = `${y}%`;
    qiblaIndicator.style.transform = `translate(-50%, -50%) rotate(${deviceHeading}deg)`;

    const diff = Math.abs(adjustedBearing);
    const isAligned = diff < 5 || diff > 355;

    if (isAligned) {
        compassStatus.innerHTML = '<span class="pulse"></span><span style="color: var(--success); font-weight:700;">✓ أنت في اتجاه القبلة!</span>';
    } else {
        compassStatus.innerHTML = '<span class="pulse"></span><span>حرّك الهاتف باتجاه القبلة</span>';
    }
}

function handleOrientation(event) {
    let heading = 0;

    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        heading = (360 - event.alpha) % 360;
    }

    deviceHeading = heading;
    requestAnimationFrame(updateCompassRotation);
}

async function activateCompass() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                startCompass();
            } else {
                showError('تم رفض إذن البوصلة.');
            }
        } catch (e) {
            showError('خطأ في طلب إذن البوصلة.');
        }
    } else if ('DeviceOrientationEvent' in window) {
        startCompass();
    } else {
        showError('جهازك لا يدعم البوصلة.');
    }
}

function startCompass() {
    window.addEventListener('deviceorientation', handleOrientation, true);
    compassActive = true;
    compassBtn.style.display = 'none';
    compassStatus.classList.add('active');
}

function displayResult(lat, lng) {
    hideError();

    if (!validateCoordinates(lat, lng)) {
        showError('إحداثيات غير صالحة. تحقق من القيم المدخلة.');
        return;
    }

    qiblaBearing = calculateQiblaBearing(lat, lng);

    bearingValue.textContent = qiblaBearing.toFixed(1);
    bearingDirection.textContent = `اتجاه القبلة: ${getCardinalDirection(qiblaBearing)} (${qiblaBearing.toFixed(1)}°)`;

    if ('DeviceOrientationEvent' in window) {
        compassBtn.style.display = 'block';
    }

    if (compassActive) {
        updateCompassRotation();
    }

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

compassBtn.addEventListener('click', activateCompass);

manualForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const lat = parseFloat(document.getElementById('latInput').value);
    const lng = parseFloat(document.getElementById('lngInput').value);

    displayResult(lat, lng);
});
