let map = null;

function updateDistanceInfo(userLat, userLng) {
    const dist = calculateDistanceKm(userLat, userLng, KAABA_LAT, KAABA_LNG);
    const distEl = document.getElementById('distanceInfo');
    if (distEl) {
        distEl.textContent = 'المسافة بينك وبين الكعبة المشرفة: ' +
            dist.toLocaleString('ar-EG', { maximumFractionDigits: 0 }) + ' كم';
    }
}

function initMap(userLat, userLng) {
    if (typeof L === 'undefined') {
        updateDistanceInfo(userLat, userLng);
        return;
    }

    if (map) {
        map.remove();
        map = null;
    }

    document.getElementById('mapSection').style.display = 'block';

    setTimeout(function () {
        map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(map);

        const userIcon = L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;background:#1a73e8;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        const kaabaIcon = L.divIcon({
            className: '',
            html: '<div style="width:32px;height:32px;background:#fbbf24;border:3px solid white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🕋</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
            .bindPopup('موقعك الحالي');

        L.marker([KAABA_LAT, KAABA_LNG], { icon: kaabaIcon }).addTo(map)
            .bindPopup('الكعبة المشرفة');

        L.polyline([
            [userLat, userLng],
            [KAABA_LAT, KAABA_LNG]
        ], {
            color: '#1a73e8',
            weight: 2.5,
            dashArray: '10, 8',
            opacity: 0.5
        }).addTo(map);

        const bounds = L.latLngBounds(
            [userLat, userLng],
            [KAABA_LAT, KAABA_LNG]
        );

        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 6
        });

        updateDistanceInfo(userLat, userLng);

        setTimeout(function () {
            map.invalidateSize();
        }, 300);
    }, 200);
}
