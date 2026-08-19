var bearingValue = document.getElementById('bearingValue');
var bearingDirection = document.getElementById('bearingDirection');
var errorMessage = document.getElementById('errorMessage');
var startBtn = document.getElementById('startBtn');
var compassBtn = document.getElementById('compassBtn');
var compassStatus = document.getElementById('compassStatus');
var compassRing = document.getElementById('compassRing');
var qiblaArrowCenter = document.getElementById('qiblaArrowCenter');

var qiblaBearing = null;
var compassActive = false;
var deviceHeading = 0;

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('visible');
}

function hideError() {
    errorMessage.classList.remove('visible');
}

function getCardinalDirection(bearing) {
    var d = [
        [0, 22.5, 'شمالاً'],
        [22.5, 67.5, 'شمالاً شرقاً'],
        [67.5, 112.5, 'شرقاً'],
        [112.5, 157.5, 'جنوباً شرقاً'],
        [157.5, 202.5, 'جنوباً'],
        [202.5, 247.5, 'جنوباً غرباً'],
        [247.5, 292.5, 'غرباً'],
        [292.5, 337.5, 'شمالاً غرباً'],
        [337.5, 360, 'شمالاً']
    ];
    for (var i = 0; i < d.length; i++) {
        if (bearing >= d[i][0] && bearing < d[i][1]) return d[i][2];
    }
    return '';
}

function updateArrow() {
    if (!compassActive || qiblaBearing === null) return;

    var angle = (qiblaBearing - deviceHeading + 360) % 360;
    qiblaArrowCenter.style.transform = 'rotate(' + angle + 'deg)';

    if (angle < 8 || angle > 352) {
        compassStatus.innerHTML = '<span class="pulse" style="background:#1e8e3e;"></span><span style="font-weight:700;color:#1e8e3e;">أنت في اتجاه القبلة!</span>';
    } else {
        compassStatus.innerHTML = '<span class="pulse"></span><span>حرّك الهاتف حتى يشير السهم للأعلى</span>';
    }
}

function handleOrientation(e) {
    var heading = 0;
    if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
    }
    deviceHeading = heading;
    requestAnimationFrame(updateArrow);
}

async function activateCompass() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            var p = await DeviceOrientationEvent.requestPermission();
            if (p === 'granted') {
                startCompass();
            } else {
                showError('تم رفض إذن البوصلة.');
            }
        } catch (err) {
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
    compassStatus.classList.add('active');
    if (qiblaBearing !== null) updateArrow();
}

function displayResult(lat, lng) {
    hideError();

    qiblaBearing = calculateQiblaBearing(lat, lng);
    bearingValue.textContent = qiblaBearing.toFixed(1);
    bearingDirection.textContent = 'اتجاه القبلة: ' + getCardinalDirection(qiblaBearing) + ' (' + qiblaBearing.toFixed(1) + '°)';

    if ('DeviceOrientationEvent' in window) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            compassStatus.innerHTML = '<span class="pulse"></span><span>اضغط لتفعيل البوصلة</span>';
            compassStatus.classList.add('active');
            compassStatus.style.cursor = 'pointer';
            compassStatus.onclick = activateCompass;
        } else {
            startCompass();
        }
    }

    initMap(lat, lng);
}

startBtn.addEventListener('click', function () {
    hideError();

    if (!navigator.geolocation) {
        showError('متصفحك لا يدعم تحديد الموقع.');
        return;
    }

    startBtn.textContent = 'جاري تحديد الموقع...';
    startBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            startBtn.textContent = 'تحديد اتجاه القبلة';
            startBtn.disabled = false;
            displayResult(pos.coords.latitude, pos.coords.longitude);
        },
        function (err) {
            startBtn.textContent = 'تحديد اتجاه القبلة';
            startBtn.disabled = false;

            if (err.code === 1) {
                showError('تم رفض إذن الموقع. يرجى السماح من إعدادات المتصفح.');
            } else if (err.code === 2) {
                showError('معلومات الموقع غير متاحة.');
            } else if (err.code === 3) {
                showError('انتهت المهلة. حاول مجدداً.');
            } else {
                showError('حدث خطأ في تحديد الموقع.');
            }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
});
