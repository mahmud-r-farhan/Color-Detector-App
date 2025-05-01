export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/serviceWorker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('Service Worker update found!');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New Service Worker available, showing update notification');
                  showUpdateNotification();
                }
              });
            });
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
          
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          console.log('Controller changed, refreshing page');
          window.location.reload();
        });
      });
    }
  }
  

  function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <p>New version available!</p>
        <button id="update-button">Update Now</button>
      </div>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '9999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    
   
    document.body.appendChild(notification);
    document.getElementById('update-button').addEventListener('click', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        notification.remove();
      }
    });
  }
  
 