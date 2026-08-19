const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function calculateQiblaBearing(userLat, userLng) {
    const lat1 = toRadians(userLat);
    const lat2 = toRadians(KAABA_LAT);
    const dLng = toRadians(KAABA_LNG - userLng);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = Math.atan2(y, x);
    bearing = toDegrees(bearing);
    return (bearing + 360) % 360;
}

function validateCoordinates(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    if (isNaN(lat) || isNaN(lng)) return false;
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
}
