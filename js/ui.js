const bearingValue = document.getElementById('bearingValue');
const bearingDirection = document.getElementById('bearingDirection');
const errorMessage = document.getElementById('errorMessage');
const startBtn = document.getElementById('startBtn');
const compassStatus = document.getElementById('compassStatus');
const compassStatusText = document.getElementById('compassStatusText');
const qiblaArrow = document.getElementById('qiblaArrow');
const compassBg = document.getElementById('compassBg');

let qiblaBearing = null;
let compassActive = false;
let deviceHeading = 0;
let filteredHeading = null;
let calibrationOffset = 0;
let hasVibrated = false;
let lastRenderTime = 0;
let arrowRotation = 0;
const FILTER_ALPHA = 0.2;
const MIN_UPDATE_MS = 50;

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('visible');
}

function hideError() {
    errorMessage.classList.remove('visible');
}

function getCardinalDirection(bearing) {
    const d = [
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
    for (let i = 0; i < d.length; i++) {
        if (bearing >= d[i][0] && bearing < d[i][1]) return d[i][2];
    }
    return '';
}

function updateArrow() {
    if (!compassActive || qiblaBearing === null) return;

    const effectiveBearing = (qiblaBearing + calibrationOffset + 360) % 360;
    const target = (effectiveBearing - deviceHeading + 360) % 360;

    const current = ((arrowRotation % 360) + 360) % 360;
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    arrowRotation += diff;

    qiblaArrow.style.transform = 'translate(-50%, -50%) rotate(' + arrowRotation + 'deg)';

    updateCompassBg(target);

    const isAligned = target < 10 || target > 350;

    if (isAligned) {
        compassStatus.className = 'compass-status active aligned';
        compassStatusText.textContent = 'أنت في اتجاه القبلة!';
        if (!hasVibrated && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
            hasVibrated = true;
        }
    } else {
        compassStatus.className = 'compass-status active';
        compassStatusText.textContent = 'حرّك الهاتف حتى يشير السهم للأعلى';
        hasVibrated = false;
    }
}

function updateCompassBg(target) {
    if (!compassBg) return;

    const distance = Math.min(target, 360 - target);
    const intensity = 1 - (distance / 180);

    const base = 240;
    const r = Math.round(base + (46 - base) * intensity);
    const g = Math.round(base + (125 - base) * intensity);
    const b = Math.round(base + (50 - base) * intensity);
    compassBg.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
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
    const alpha = e.alpha;
    if (alpha === null || alpha === undefined) return deviceHeading;

    const screenAngle = getScreenAngle();
    let heading;
    switch (screenAngle) {
        case 90:  heading = (alpha + 90) % 360; break;
        case 180: heading = (alpha + 180) % 360; break;
        case 270: heading = (alpha + 270) % 360; break;
        default:  heading = (360 - alpha) % 360; break;
    }
    return (heading + 360) % 360;
}

function angularDiff(a, b) {
    const diff = (a - b + 360) % 360;
    return diff > 180 ? diff - 360 : diff;
}

function handleOrientation(e) {
    const raw = computeHeading(e);

    if (filteredHeading === null) {
        filteredHeading = raw;
    } else {
        const diff = angularDiff(raw, filteredHeading);
        filteredHeading = (filteredHeading + diff * FILTER_ALPHA + 360) % 360;
    }

    deviceHeading = filteredHeading;

    const now = Date.now();
    if (now - lastRenderTime < MIN_UPDATE_MS) return;
    lastRenderTime = now;

    requestAnimationFrame(updateArrow);
}

async function activateCompass() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const p = await DeviceOrientationEvent.requestPermission();
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
    const evt = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(evt, handleOrientation, true);
    compassActive = true;
    compassStatus.className = 'compass-status active';
    compassStatusText.textContent = 'حرّك الهاتف حتى يشير السهم للأعلى';
    if (qiblaBearing !== null) updateArrow();
    showFlipButton();
}

function displayResult(lat, lng) {
    try {
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
    } catch (err) {
        showError('خطأ تقني: ' + (err && err.message ? err.message : err));
    }
}

function showFlipButton() {
    const flipBtn = document.getElementById('flipBtn');
    if (flipBtn) {
        flipBtn.style.display = 'block';
        flipBtn.textContent = calibrationOffset === 180 ? '↻ معايرة: مقلوبة' : '↻ معايرة';
        flipBtn.classList.toggle('flipped', calibrationOffset === 180);
    }
}

let locationTimeout = null;

startBtn.addEventListener('click', function () {
    hideError();

    if (!navigator.geolocation) {
        showError('متصفحك لا يدعم تحديد الموقع.');
        return;
    }

    startBtn.textContent = 'جاري تحديد الموقع...';
    startBtn.disabled = true;

    if (locationTimeout) clearTimeout(locationTimeout);
    locationTimeout = setTimeout(function () {
        startBtn.textContent = 'تحديد اتجاه القبلة';
        startBtn.disabled = false;
        showError('تعذر تحديد الموقع. تأكد من تفعيل خدمة الموقع (GPS) على هاتفك ثم جرّب مجدداً.');
    }, 20000);

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            if (locationTimeout) clearTimeout(locationTimeout);
            startBtn.textContent = 'تحديد اتجاه القبلة';
            startBtn.disabled = false;
            displayResult(pos.coords.latitude, pos.coords.longitude);
        },
        function (err) {
            if (locationTimeout) clearTimeout(locationTimeout);
            startBtn.textContent = 'تحديد اتجاه القبلة';
            startBtn.disabled = false;

            if (err.code === 1) {
                showError('تم رفض إذن الموقع. يرجى السماح من إعدادات المتصفح.');
            } else if (err.code === 2) {
                showError('معلومات الموقع غير متاحة. تأكد من تفعيل GPS.');
            } else if (err.code === 3) {
                showError('انتهت المهلة. حاول مجدداً.');
            } else {
                showError('حدث خطأ في تحديد الموقع.');
            }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
});

function flipCalibration() {
    calibrationOffset = (calibrationOffset === 0) ? 180 : 0;
    if (compassActive) updateArrow();
    const flipBtn = document.getElementById('flipBtn');
    if (flipBtn) {
        flipBtn.textContent = calibrationOffset === 180 ? '↻ معايرة: مقلوبة' : '↻ معايرة';
        flipBtn.classList.toggle('flipped', calibrationOffset === 180);
    }
}
