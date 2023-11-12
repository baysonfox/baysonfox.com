hexo.extend.injector.register('head_end', 
    `<script defer type="text/javascript">
    if ('serviceWorker' in navigator && window.location.hostname === 'baysonfox.com') {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('https://baysonfox.com/scripts/service_workers.js').then(function (registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    } else {
        console.log('ServiceWorker not supported or hostname not baysonfox.com');
    }
    </script>`
)
