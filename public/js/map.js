// Map functionality for tracking page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map only on tracking page
    if (document.getElementById('map')) {
        // Initialize map
        const map = L.map('map').setView([20.5937, 78.9629], 5); // Center of India
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Sample route coordinates (Mumbai to Delhi)
        const routeCoordinates = [
            [19.0760, 72.8777], // Mumbai
            [21.1458, 79.0882], // Nagpur
            [26.8467, 80.9462], // Lucknow
            [27.1767, 78.0081], // Agra
            [28.7041, 77.1025]  // Delhi
        ];
        
        // Draw route polyline
        const routeLine = L.polyline(routeCoordinates, {
            color: '#3498db',
            weight: 4,
            opacity: 0.7
        }).addTo(map);
        
        // Add markers for start and end points
        const startMarker = L.marker(routeCoordinates[0]).addTo(map)
            .bindPopup('<b>Mumbai</b><br>Origin')
            .openPopup();
            
        const endMarker = L.marker(routeCoordinates[routeCoordinates.length - 1]).addTo(map)
            .bindPopup('<b>Delhi</b><br>Destination');
        
        // Add current location marker (simulated)
        const currentLocationIndex = 3; // Agra
        const currentLocationMarker = L.marker(routeCoordinates[currentLocationIndex], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map)
            .bindPopup('<b>Current Location</b><br>Agra, Uttar Pradesh')
            .openPopup();
        
        // Fit map to show entire route
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        
        // Simulate real-time movement
        let currentIndex = 0;
        const moveInterval = setInterval(() => {
            if (currentIndex < routeCoordinates.length - 1) {
                currentIndex++;
                currentLocationMarker.setLatLng(routeCoordinates[currentIndex]);
                
                // Update popup content based on location
                let locationName = '';
                switch(currentIndex) {
                    case 0: locationName = 'Mumbai'; break;
                    case 1: locationName = 'Nagpur'; break;
                    case 2: locationName = 'Lucknow'; break;
                    case 3: locationName = 'Agra'; break;
                    case 4: locationName = 'Delhi'; break;
                }
                
                currentLocationMarker.setPopupContent(`<b>Current Location</b><br>${locationName}`);
                
                // Update current location in tracking info
                const currentLocationElement = document.getElementById('current-location');
                if (currentLocationElement) {
                    currentLocationElement.textContent = `${locationName}, ${getStateName(currentIndex)}`;
                }
                
                // Update timeline
                updateTimeline(currentIndex);
            } else {
                clearInterval(moveInterval);
            }
        }, 5000); // Move every 5 seconds
        
        // Function to get state name based on index
        function getStateName(index) {
            const states = ['Maharashtra', 'Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh', 'Delhi'];
            return states[index] || 'Unknown';
        }
        
        // Function to update timeline
        function updateTimeline(currentIndex) {
            const timelineItems = document.querySelectorAll('.timeline-item');
            
            timelineItems.forEach((item, index) => {
                if (index < currentIndex) {
                    item.classList.add('completed');
                    item.classList.remove('active');
                } else if (index === currentIndex) {
                    item.classList.add('active');
                    item.classList.remove('completed');
                } else {
                    item.classList.remove('completed', 'active');
                }
            });
            
            // Update status text
            const statusText = document.getElementById('status-text');
            if (statusText) {
                if (currentIndex === 0) {
                    statusText.textContent = 'Package Received';
                } else if (currentIndex === timelineItems.length - 1) {
                    statusText.textContent = 'Delivered';
                } else {
                    statusText.textContent = 'In Transit';
                }
            }
        }
    }
});