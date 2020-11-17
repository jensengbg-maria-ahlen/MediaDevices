if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => {
            console.log('Registration succeeded. Scope is ' + reg.scope);
        });
}

const errorMessage = document.querySelector('.message.error');
const startButton = document.querySelector('.start-stream');
const stopButton = document.querySelector('.stop-stream');
const switchCamera = document.querySelector('.switch-camera');
const photoButton = document.querySelector('.profile button');
const profilePic = document.querySelector('.profile > img');
const startRecording = document.querySelector('.start-recording');
const stopRecording = document.querySelector('.stop-recording');
const downloadLink = document.querySelector('.a-link');



window.addEventListener('load', () => {
    if ('mediaDevices' in navigator) {
        cameraSettings();
    }
})


function cameraSettings() {
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
            startRecording.disabled = false;
            startButton.disabled = true;

        } catch (e) {
            errorMessage.innerHTML = 'Could not show camera window.';
        }
    })

    stopButton.addEventListener('click', () => {
        errorMessage.innerHTML = '';
        if (!stream) {
            errorMessage.innerHTML = 'No video to stop.';
            return;
        }
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        stopButton.disabled = true;
        photoButton.disabled = true;
        startRecording.disabled = true;
        stopRecording.disabled = true;
        startButton.disabled = false;
    })

    photoButton.addEventListener('click', async () => {
        if (!stream) {
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

    let mediaRecorder;
    startRecording.addEventListener('click', () => {
        if (! stream) {
            errorMessage.innerHTML = 'No video available';
            return;
        }
        startRecording.disabled = true;
        stopRecording.disabled = false;
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.addEventListener('dataavailable', event => {
            const blob = event.data;
            if(blob.size > 0) {
                chunks.push(blob);
            }
        })

        mediaRecorder.addEventListener('stop', event => {
            const blob = new Blob(chunks, { type: 'video/webm'});
            const url = URL.createObjectURL(blob);
            downloadLink.innerHTML = 'Download video';
            downloadLink.href = url;
            downloadLink.download = 'recording.webm';
        })

        mediaRecorder.start();
    })

    stopRecording.addEventListener('click', () => {
        if(mediaRecorder) {
            stopRecording.disabled = true;
            startRecording.disabled = false;
            mediaRecorder.stop();
            mediaRecorder = null;
        } else {
            errorMessage.innerHTML = 'No recording to stop';
        }
    })
}