hexo.extend.injector.register('head_end', 
    `<script defer type="text/javascript">
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('scripts/service_workers.js').then(function (registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
    </script>`
)
