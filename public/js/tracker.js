// Tracking functionality
document.addEventListener('DOMContentLoaded', function() {
    const trackBtn = document.getElementById('track-btn');
    const trackingIdInput = document.getElementById('tracking-id');
    const trackingResult = document.getElementById('tracking-result');
    
    if (trackBtn && trackingIdInput && trackingResult) {
        trackBtn.addEventListener('click', function() {
            const trackingId = trackingIdInput.value.trim();
            
            if (!trackingId) {
                alert('Please enter a tracking ID');
                return;
            }
            
            // Validate tracking ID format (simple validation for demo)
            if (!trackingId.match(/^SW\d{9}IN$/)) {
                alert('Please enter a valid tracking ID (e.g. SW123456789IN)');
                return;
            }
            
            // Show tracking result
            trackingResult.style.display = 'block';
            
            // Scroll to tracking result
            trackingResult.scrollIntoView({ behavior: 'smooth' });
            
            // In a real app, this would make an API call to get tracking data
            // For demo purposes, we'll just show the static data
        });
        
        // Allow pressing Enter to track
        trackingIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackBtn.click();
            }
        });
    }
    
    // Simulate tracking data updates
    function updateTrackingData() {
        // In a real app, this would fetch updated data from the server
        // For demo purposes, we'll just update the timestamp
        const statusDate = document.getElementById('status-date');
        if (statusDate) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            statusDate.textContent = `Updated: Today, ${timeString}`;
        }
    }
    
    // Update tracking data every 30 seconds
    setInterval(updateTrackingData, 30000);
    
    // Chatbot integration
    window.trackShipmentFromChat = function(trackingId) {
        if (trackingIdInput) {
            trackingIdInput.value = trackingId;
            trackBtn.click();
        }
    };
    
    // Listen for chatbot tracking requests
    window.addEventListener('chatbot-track-request', function(event) {
        if (event.detail && event.detail.trackingId) {
            window.trackShipmentFromChat(event.detail.trackingId);
        }
    });
});
