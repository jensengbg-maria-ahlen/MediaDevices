if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => {
        console.log('Registration succeeded. Scope is ' + reg.scope);
    });
}

const errorMessage = document.querySelector('.video > .message.error');
const startButton = document.querySelector('.video > .start-stream');
const stopButton = document.querySelector('.video > .stop-stream');
const photoButton = document.querySelector('.profile button');
const profilePic = document.querySelector('.profile > img');



window.addEventListener('load', () => {
    if( 'mediaDevices' in navigator ) {
        let stream;
        startButton.addEventListener('click', async () => {
            errorMessage.innerHTML = '';
            try {
                const md = navigator.mediaDevices;
                stream = await md.getUserMedia({
                    video: { width: 320, height: 320 }
                })

                const video = document.querySelector('.video > video');
                video.srcObject = stream;

                stopButton.disabled = false;
                photoButton.disabled = false;
                startButton.disabled = true;
            } catch (e) {
                errorMessage.innerHTML = 'Could not show camera window.';
            }
            
        })
        stopButton.addEventListener('click', () => {
            errorMessage.innerHTML = '';
            if( stream ) {
                let tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                stopButton.disabled = true;
                photoButton.disabled = true;
                startButton.disabled = false;

            } else {
                errorMessage.innerHTML = 'No video to stop.';
            }
        })

        photoButton.addEventListener('click', async () => {
            if( !stream ){
                errorMessage.innerHTML = 'No video to take photo from';
                return;
            }

            let tracks = stream.getTracks();
            let videoTrack = tracks[0];
            let capture = new ImageCapture(videoTrack);
            let blob = await capture.takePhoto();

            let imgUrl = URL.createObjectURL(blob);
            profilePic.src = imgUrl;
        })
    }
})
