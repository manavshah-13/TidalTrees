document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // --- Reporting Page - Severity Selector ---
    const severityOptions = document.querySelectorAll('.severity-option');

    if (severityOptions.length > 0) {
        severityOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove 'active' class from all options
                severityOptions.forEach(opt => opt.classList.remove('active'));
                // Add 'active' class to the clicked option
                option.classList.add('active');
            });
        });
    }
    // --- Image Upload and Camera Handling ---
    const uploadBtn = document.getElementById('uploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const imageUpload = document.getElementById('imageUpload');
    const camera = document.getElementById('camera');
    const photoCanvas = document.getElementById('photoCanvas');
    const imagePreview = document.getElementById('imagePreview');
    const previewArea = document.querySelector('.preview-area');
    const retakeBtn = document.getElementById('retakeBtn');
    const submitBtn = document.getElementById('submitBtn');
    const uploadArea = document.querySelector('.upload-area');
    
    let stream = null;

    // File Upload Handling
    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                showPreview();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Camera Handling
    cameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            camera.srcObject = stream;
            camera.style.display = 'block';
            previewArea.style.display = 'block';
            uploadArea.style.display = 'none';
            camera.play();
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please make sure you have granted camera permissions.');
        }
    });

    // Take Photo
    camera.addEventListener('click', () => {
        if (stream) {
            photoCanvas.width = camera.videoWidth;
            photoCanvas.height = camera.videoHeight;
            const context = photoCanvas.getContext('2d');
            context.drawImage(camera, 0, 0);
            imagePreview.src = photoCanvas.toDataURL('image/png');
            stopCamera();
            showPreview();
        }
    });

    // Retake Photo/Image
    retakeBtn.addEventListener('click', () => {
        imagePreview.src = '';
        imageUpload.value = '';
        hidePreview();
        uploadArea.style.display = 'block';
    });

    // Submit for Analysis
    submitBtn.addEventListener('click', async () => {
        if (!imagePreview.src) return;

        try {
            // Convert image to blob
            const response = await fetch(imagePreview.src);
            const blob = await response.blob();
            
            // Create FormData and append image
            const formData = new FormData();
            formData.append('image', blob, 'analysis-image.png');

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

            // Send to server (update URL as needed)
            const result = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await result.json();
            
            // Handle response
            if (data.success) {
                alert('Analysis complete! Confidence: ' + data.confidence + '%');
            } else {
                throw new Error(data.message);
            }

        } catch (err) {
            console.error('Error during analysis:', err);
            alert('Error analyzing image. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit for Analysis';
        }
    });

    // Helper Functions
    function showPreview() {
        camera.style.display = 'none';
        imagePreview.parentElement.style.display = 'block';
        previewArea.style.display = 'block';
    }

    function hidePreview() {
        imagePreview.parentElement.style.display = 'none';
        previewArea.style.display = 'none';
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            camera.style.display = 'none';
        }
    }

    // Drag and Drop Handling
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                showPreview();
            };
            reader.readAsDataURL(e.dataTransfer.files[0]);
        }
    });
});