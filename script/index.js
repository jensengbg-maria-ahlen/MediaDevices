if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => {
        console.log('Registration succeeded. Scope is ' + reg.scope);
    });
}

async function allowCamera() {
    if ('mediaDevices' in navigator) {
        const md = navigator.mediaDevices;
        let stream = await md.getUserMedia({ 
            audio: false, 
            video: true
        });
    }
}

allowCamera();