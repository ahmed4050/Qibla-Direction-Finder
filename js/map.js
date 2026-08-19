let map = null;
let userMarker = null;
let qiblaLine = null;

function initMap(userLat, userLng) {
    if (map) {
        map.remove();
    }

    map = L.map('map').setView([userLat, userLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="width:12px;height:12px;background:#1a73e8;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
        .bindPopup('موقعك الحالي').openPopup();

    const kaabaIcon = L.divIcon({
        className: 'kaaba-marker',
        html: '<div style="width:14px;height:14px;background:#fbbc04;border:2px solid white;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:8px;">🕋</div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    L.marker([KAABA_LAT, KAABA_LNG], { icon: kaabaIcon }).addTo(map)
        .bindPopup('الكعبة المشرفة');

    qiblaLine = L.polyline([
        [userLat, userLng],
        [KAABA_LAT, KAABA_LNG]
    ], {
        color: '#1a73e8',
        weight: 2,
        dashArray: '6, 6',
        opacity: 0.7
    }).addTo(map);

    map.fitBounds(qiblaLine.getBounds(), { padding: [30, 30] });

    document.getElementById('mapSection').style.display = 'block';

    setTimeout(() => map.invalidateSize(), 100);
}
