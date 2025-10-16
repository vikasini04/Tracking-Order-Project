// Authentication functions
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    function checkAuth() {
        // In a real app, this would check for a valid session or token
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        // Update UI based on login status
        const userMenu = document.querySelector('.user-menu');
        const signInLink = document.querySelector('a[href="signin.html"]');
        const signUpLink = document.querySelector('a[href="signup.html"]');
        
        if (isLoggedIn === 'true' && userMenu) {
            userMenu.style.display = 'flex';
            if (signInLink) signInLink.style.display = 'none';
            if (signUpLink) signUpLink.style.display = 'none';
        } else if (userMenu) {
            userMenu.style.display = 'none';
            if (signInLink) signInLink.style.display = 'block';
            if (signUpLink) signUpLink.style.display = 'block';
        }
    }
    
    // Handle login
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validate required fields
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            try {
                const response = await fetch('/api/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store authentication data
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userName', data.user.name);
                    localStorage.setItem('userId', data.user.id);
                    
                    alert('Login successful!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Signin error:', error);
                alert('Network error. Please try again.');
            }
        });
    }
    
    // Handle signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            const pincode = document.getElementById('pincode').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // Validate pincode
            if (!/^\d{6}$/.test(pincode)) {
                alert('Please enter a valid 6-digit pincode');
                return;
            }
            
            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        address,
                        city,
                        state,
                        pincode,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store authentication data
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userName', data.user.name);
                    localStorage.setItem('userId', data.user.id);
                    
                    alert('Account created successfully!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('Network error. Please try again.');
            }
        });
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear all authentication data
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userId');
            
            alert('You have been logged out successfully');
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
    
    // Run auth check on page load
    checkAuth();
});