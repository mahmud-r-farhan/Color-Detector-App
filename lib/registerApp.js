'use client';


export function registerApp() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/serviceWorker.js');
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
  
  // Set up beforeinstallprompt event listener for custom install UI
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser install prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Optional: Notify your install UI logic that the app is installable
    const installEvent = new CustomEvent('appinstallable', { 
      detail: { deferredPrompt: e } 
    });
    window.dispatchEvent(installEvent);
    
    return false;
  });
  
  // Function to programmatically show the install prompt
  window.showInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.log('App cannot be installed at this time');
      return false;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
    
    // Clear the deferredPrompt variable
    deferredPrompt = null;
    
    return outcome === 'accepted';
  };
  
  // Handle app installed event
  window.addEventListener('appinstalled', (event) => {
    console.log('App was installed');
    // Optional: Update UI to reflect installed state
    const installedEvent = new CustomEvent('appinstalled');
    window.dispatchEvent(installedEvent);
  });
}