var bearingValue = document.getElementById('bearingValue');
var bearingDirection = document.getElementById('bearingDirection');
var errorMessage = document.getElementById('errorMessage');
var startBtn = document.getElementById('startBtn');
var compassStatus = document.getElementById('compassStatus');
var compassStatusText = document.getElementById('compassStatusText');
var qiblaArrow = document.getElementById('qiblaArrow');

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
    qiblaArrow.style.transform = 'translate(-50%, -50%) rotate(' + angle + 'deg)';

    var isAligned = angle < 10 || angle > 350;

    if (isAligned) {
        compassStatus.className = 'compass-status active aligned';
        compassStatusText.textContent = 'أنت في اتجاه القبلة!';
    } else {
        compassStatus.className = 'compass-status active';
        compassStatusText.textContent = 'حرّك الهاتف حتى يشير السهم للأعلى';
    }
}

function getScreenAngle() {
    if (screen.orientation && typeof screen.orientation.angle === 'number') {
        return screen.orientation.angle;
    }
    return (typeof window.orientation === 'number') ? window.orientation : 0;
}

function computeHeading(e) {
    if (e.webkitCompassHeading !== undefined) {
        return e.webkitCompassHeading;
    }
    var alpha = e.alpha;
    if (alpha === null || alpha === undefined) return deviceHeading;

    var screenAngle = getScreenAngle();
    var heading;
    switch (screenAngle) {
        case 90:  heading = (alpha + 90) % 360; break;
        case 180: heading = (alpha + 180) % 360; break;
        case 270: heading = (alpha + 270) % 360; break;
        default:  heading = (360 - alpha) % 360; break;
    }
    return (heading + 360) % 360;
}

function handleOrientation(e) {
    deviceHeading = computeHeading(e);
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
    var evt = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(evt, handleOrientation, true);
    compassActive = true;
    compassStatus.className = 'compass-status active';
    compassStatusText.textContent = 'حرّك الهاتف حتى يشير السهم للأعلى';
    if (qiblaBearing !== null) updateArrow();
}

function displayResult(lat, lng) {
    hideError();

    qiblaBearing = calculateQiblaBearing(lat, lng);
    bearingValue.textContent = qiblaBearing.toFixed(1);
    bearingDirection.textContent = 'اتجاه القبلة: ' + getCardinalDirection(qiblaBearing) + ' (' + qiblaBearing.toFixed(1) + '°)';

    if ('DeviceOrientationEvent' in window) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            compassStatus.className = 'compass-status active';
            compassStatusText.textContent = 'اضغط هنا لتفعيل البوصلة';
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
