let map = null;

function initMap(userLat, userLng) {
    if (map) {
        map.remove();
        map = null;
    }

    document.getElementById('mapSection').style.display = 'block';

    setTimeout(function () {
        map = L.map('map', { zoomControl: true });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        var userIcon = L.divIcon({
            className: '',
            html: '<div style="width:14px;height:14px;background:#1a73e8;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        var kaabaIcon = L.divIcon({
            className: '',
            html: '<div style="width:28px;height:28px;background:#fbbc04;border:3px solid white;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;">🕋</div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
            .bindPopup('موقعك');

        L.marker([KAABA_LAT, KAABA_LNG], { icon: kaabaIcon }).addTo(map)
            .bindPopup('الكعبة المشرفة');

        L.polyline([
            [userLat, userLng],
            [KAABA_LAT, KAABA_LNG]
        ], {
            color: '#1a73e8',
            weight: 2,
            dashArray: '8, 6',
            opacity: 0.6
        }).addTo(map);

        var bounds = L.latLngBounds(
            [userLat, userLng],
            [KAABA_LAT, KAABA_LNG]
        );

        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });

        setTimeout(function () { map.invalidateSize(); }, 200);
    }, 150);
}
