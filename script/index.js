if( 'serviceWorker' in navigator ) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => {
        console.log('Service worker registered.');
    })
}


window.addEventListener('load', () => {
    if( 'mediaDevices' in navigator ) {
        cameraSettings();
    }
})

function cameraSettings() {
    const errorMessage = document.querySelector('.video > .error');
    const showVideoButton = document.querySelector('.video .start-stream');
    const stopButton = document.querySelector('.video .stop-stream');
    const facingButton = document.querySelector('.video .change-facing');
    const photoButton = document.querySelector('.profile button');
    const profilePic = document.querySelector('.profile > img');
    const startRecording = document.querySelector('.video .start-recording');
    const stopRecording = document.querySelector('.video .stop-recording');
    const downloadLink = document.querySelector('.video .downloadLink');
    // .profile > p > button  --> 012, omständigt men mer specifikt
    // .profile       button  --> 011, enklare

    let stream;
    let facingMode = 'environment';

    showVideoButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';
        try {
            const md = navigator.mediaDevices;
            stream = await md.getUserMedia({
                video: { width: 320, height: 320, facingMode: facingMode }
            })

            const video = document.querySelector('.video > video');
            video.srcObject = stream;
            
            stopButton.disabled = false;
            photoButton.disabled = false;
            showVideoButton.disabled = true;
            startRecording.disabled = false;

        } catch (e) {
            errorMessage.innerHTML = 'Could not show camera window.';
        }
    })

    stopButton.addEventListener('click', () => {
        errorMessage.innerHTML = '';
        if( !stream ) {
            errorMessage.innerHTML = 'No video to stop.';
            return;
        }
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
       
        stopButton.disabled = true;
        photoButton.disabled = true;
        showVideoButton.disabled = false;
        startRecording.disabled = true;
        stopRecording.disabled = true;
    })

    facingButton.addEventListener('click', () => {
        if(facingMode == 'environment') {
            facingMode = 'user';
            facingButton.innerHTML = 'Show environment';
        } else {
            facingMode = 'environment';
            facingButton.innerHTML = 'Show user';
        }
        stopButton.click();
        showVideoButton.click();
    })

    photoButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';
        if( !stream ) {
            errorMessage.innerHTML = 'No video to take photo from.';
            return;
        }

        let tracks = stream.getTracks();
        let videoTrack = tracks[0];
        let capture = new ImageCapture(videoTrack);
        let blob = await capture.takePhoto();

        let imgUrl = URL.createObjectURL(blob);
        profilePic.src = imgUrl;
    })

    let mediaRecorder;
    startRecording.addEventListener('click', async () => {
        if( !stream ) {
            errorMessage.innerHTML = 'No video available';
            return;
        }
        startRecording.disabled = true;
        stopRecording.disabled = false;
        mediaRecorder = new MediaRecorder(stream);
        let chunks = [];
        mediaRecorder.addEventListener('dataavailable', event => {
            console.log('mediaRecorder.dataavailable: ', event);
            const blob = event.data;
            if( blob.size > 0 ) {
                chunks.push(blob);
            }
        });
        mediaRecorder.addEventListener('stop', event => {
            console.log('mediaRecorder.stop: ', event);
            const blob = new Blob(chunks, { type: 'video/webm' });
            // WEBM-formatet fungerar i Chrome och Firefox
            // Använd gärna MP4 som fallback
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.classList.remove('hidden');
            downloadLink.download = 'recording.webm';
        })
        mediaRecorder.start();
    })

    stopRecording.addEventListener('click', async () => {
        if( mediaRecorder ) {
            stopRecording.disabled = true;
            startRecording.disabled = false;
            mediaRecorder.stop();
            mediaRecorder = null;
        } else {
            errorMessage.innerHTML = 'No recording to stop.';
        }
    })
}