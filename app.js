// Global variables
let peer = null;
let connection = null;
let selectedFiles = [];
let isReceiver = false;
let receivedChunks = [];
let totalSize = 0;
let receivedSize = 0;
let startTime = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if there's a peer ID in URL (receiver mode)
    const urlParams = new URLSearchParams(window.location.search);
    const peerId = urlParams.get('id');
    
    if (peerId) {
        isReceiver = true;
        document.getElementById('senderSection').classList.add('hidden');
        document.getElementById('receiverSection').classList.remove('hidden');
        connectToSender(peerId);
    } else {
        // Sender mode - initialize peer
        initializePeer();
    }
}

function initializePeer() {
    // Initialize PeerJS with random ID
    peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    });

    peer.on('open', (id) => {
        console.log('Peer ID:', id);
    });

    peer.on('connection', (conn) => {
        connection = conn;
        setupConnection();
        updateStatus('Connected! Sending files...', true);
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        showToast('Connection error: ' + err.message, 'error');
    });
}

function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const createLinkBtn = document.getElementById('createLinkBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    // Drag and drop
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
        handleFiles(e.dataTransfer.files);
    });

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    createLinkBtn.addEventListener('click', createShareLink);
    copyLinkBtn.addEventListener('click', copyShareLink);
}

function handleFiles(files) {
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length === 0) {
        showToast('Please select at least one file!', 'error');
        return;
    }

    displaySelectedFiles();
    document.getElementById('fileInfo').classList.remove('hidden');
}

function displaySelectedFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    selectedFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-icon">${getFileIcon(file.name, file.type)}</div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatBytes(file.size)}</div>
            </div>
        `;
        fileList.appendChild(fileItem);
    });
}

function createShareLink() {
    if (!peer || !peer.id) {
        showToast('Please wait, establishing connection...', 'error');
        return;
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${peer.id}`;
    document.getElementById('shareLink').value = shareUrl;
    document.getElementById('shareLinkSection').classList.remove('hidden');
    showToast('Share link created!', 'success');
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // Mobile
    
    navigator.clipboard.writeText(shareLink.value).then(() => {
        showToast('Link copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy link!', 'error');
    });
}

function setupConnection() {
    connection.on('open', () => {
        console.log('Connection opened');
        sendFiles();
    });

    connection.on('data', (data) => {
        if (data.type === 'request') {
            // Receiver is ready
            console.log('Receiver ready');
        }
    });

    connection.on('close', () => {
        updateStatus('Connection closed', false);
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err);
        showToast('Connection error!', 'error');
    });
}

async function sendFiles() {
    updateStatus('Sending files...', true);
    startTime = Date.now();
    
    // Send metadata first
    const metadata = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
    }));
    
    connection.send({
        type: 'metadata',
        files: metadata
    });

    // Send files one by one
    for (let i = 0; i < selectedFiles.length; i++) {
        await sendFile(selectedFiles[i], i);
    }

    updateStatus('All files sent!', true);
    document.getElementById('sendProgress').textContent = '100%';
    document.getElementById('progressFill').style.width = '100%';
}

async function sendFile(file, index) {
    const CHUNK_SIZE = 16384; // 16KB chunks
    const reader = new FileReader();
    let offset = 0;

    return new Promise((resolve) => {
        reader.onload = (e) => {
            const chunk = e.target.result;
            
            connection.send({
                type: 'chunk',
                fileIndex: index,
                data: chunk,
                offset: offset,
                total: file.size
            });

            offset += chunk.byteLength;
            
            const progress = Math.round((offset / file.size) * 100);
            updateSendProgress(progress, offset);

            if (offset < file.size) {
                readNextChunk();
            } else {
                connection.send({
                    type: 'file-complete',
                    fileIndex: index
                });
                resolve();
            }
        };

        function readNextChunk() {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        }

        readNextChunk();
    });
}

function updateSendProgress(progress, bytes) {
    document.getElementById('sendProgress').textContent = `${progress}%`;
    document.getElementById('progressFill').style.width = `${progress}%`;
    
    const elapsed = (Date.now() - startTime) / 1000;
    const speed = bytes / elapsed / (1024 * 1024);
    document.getElementById('sendSpeed').textContent = `${speed.toFixed(2)} MB/s`;
}

// Receiver functions
function connectToSender(peerId) {
    peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    });

    peer.on('open', () => {
        connection = peer.connect(peerId, {
            reliable: true
        });
        setupReceiverConnection();
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        document.getElementById('receiveStatus').textContent = 'Connection error!';
        document.getElementById('receiveStatus').classList.add('error');
        showToast('Sender not found or unable to connect!', 'error');
    });
}

function setupReceiverConnection() {
    connection.on('open', () => {
        console.log('Connected to sender');
        document.getElementById('receiveStatus').textContent = 'Connected, waiting for files...';
        document.getElementById('receiveStatus').classList.add('connected');
        startTime = Date.now();
        
        // Request files
        connection.send({ type: 'request' });
    });

    connection.on('data', handleReceivedData);

    connection.on('close', () => {
        document.getElementById('receiveStatus').textContent = 'Connection closed';
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err);
        showToast('Data transfer error!', 'error');
    });
}

function handleReceivedData(data) {
    if (data.type === 'metadata') {
        // Initialize file buffers
        receivedChunks = data.files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            chunks: [],
            receivedSize: 0
        }));
        totalSize = data.files.reduce((sum, file) => sum + file.size, 0);
        receivedSize = 0;
        
        document.getElementById('receiveStatus').textContent = `Receiving ${data.files.length} file(s)...`;
    } 
    else if (data.type === 'chunk') {
        const fileData = receivedChunks[data.fileIndex];
        fileData.chunks.push(data.data);
        fileData.receivedSize += data.data.byteLength;
        receivedSize += data.data.byteLength;
        
        const progress = Math.round((receivedSize / totalSize) * 100);
        updateReceiveProgress(progress, receivedSize);
    } 
    else if (data.type === 'file-complete') {
        const fileData = receivedChunks[data.fileIndex];
        const blob = new Blob(fileData.chunks, { type: fileData.type });
        displayReceivedImage(fileData.name, blob, fileData.type);
        
        // Check if all files received
        const allReceived = receivedChunks.every(f => f.receivedSize === f.size);
        if (allReceived) {
            document.getElementById('receiveStatus').textContent = 'All files received!';
            document.getElementById('receiveProgress').textContent = '100%';
            document.getElementById('receiveProgressFill').style.width = '100%';
            showToast('Files received successfully!', 'success');
        }
    }
}

function updateReceiveProgress(progress, bytes) {
    document.getElementById('receiveProgress').textContent = `${progress}%`;
    document.getElementById('receiveProgressFill').style.width = `${progress}%`;
    
    const elapsed = (Date.now() - startTime) / 1000;
    const speed = bytes / elapsed / (1024 * 1024);
    document.getElementById('receiveSpeed').textContent = `${speed.toFixed(2)} MB/s`;
}

function displayReceivedImage(fileName, blob, fileType) {
    const fileUrl = URL.createObjectURL(blob);
    const isImage = fileType.startsWith('image/');
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    
    if (isImage) {
        fileCard.innerHTML = `
            <div class="file-preview">
                <img src="${fileUrl}" alt="${fileName}">
            </div>
            <div class="file-card-footer">
                <div class="file-card-icon">${getFileIcon(fileName, fileType)}</div>
                <div class="file-card-info">
                    <div class="file-card-name">${fileName}</div>
                    <div class="file-card-type">${getFileTypeLabel(fileName)}</div>
                </div>
                <button class="download-btn" onclick="downloadFile('${fileUrl}', '${fileName}')">
                    💾 Download
                </button>
            </div>
        `;
    } else {
        fileCard.innerHTML = `
            <div class="file-preview-icon">
                <span class="large-icon">${getFileIcon(fileName, fileType)}</span>
            </div>
            <div class="file-card-footer">
                <div class="file-card-icon">${getFileIcon(fileName, fileType)}</div>
                <div class="file-card-info">
                    <div class="file-card-name">${fileName}</div>
                    <div class="file-card-type">${getFileTypeLabel(fileName)}</div>
                </div>
                <button class="download-btn" onclick="downloadFile('${fileUrl}', '${fileName}')">
                    💾 Download
                </button>
            </div>
        `;
    }
    
    document.getElementById('receivedFiles').appendChild(fileCard);
}

function downloadFile(blobUrl, fileName) {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download started!', 'success');
}

// Get file icon based on file type
function getFileIcon(fileName, fileType) {
    const ext = fileName.split('.').pop().toLowerCase();
    
    // Images
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
        return '🖼️';
    }
    
    // Code files
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return '📜';
    if (['html', 'htm'].includes(ext)) return '🌐';
    if (['css', 'scss', 'sass', 'less'].includes(ext)) return '🎨';
    if (['php'].includes(ext)) return '🐘';
    if (['py'].includes(ext)) return '🐍';
    if (['java'].includes(ext)) return '☕';
    if (['cpp', 'c', 'h'].includes(ext)) return '⚙️';
    if (['rb'].includes(ext)) return '💎';
    if (['go'].includes(ext)) return '🐹';
    if (['rs'].includes(ext)) return '🦀';
    if (['swift'].includes(ext)) return '🦅';
    if (['kt', 'kts'].includes(ext)) return '🅺';
    if (['sql'].includes(ext)) return '🗄️';
    if (['json', 'xml', 'yaml', 'yml', 'toml'].includes(ext)) return '📋';
    
    // Documents
    if (['pdf'].includes(ext)) return '📕';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📽️';
    if (['txt', 'md', 'markdown'].includes(ext)) return '📄';
    
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return '📦';
    
    // Media
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) return '🎬';
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) return '🎵';
    
    // Others
    if (['exe', 'app', 'dmg'].includes(ext)) return '⚡';
    if (['apk', 'ipa'].includes(ext)) return '📱';
    if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) return '🔤';
    
    // Default
    return '📄';
}

// Get file type label
function getFileTypeLabel(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
        // Images
        'jpg': 'JPEG Image', 'jpeg': 'JPEG Image', 'png': 'PNG Image', 'gif': 'GIF Image',
        'svg': 'SVG Image', 'webp': 'WebP Image', 'bmp': 'Bitmap Image', 'ico': 'Icon',
        
        // Code
        'js': 'JavaScript', 'jsx': 'React JSX', 'ts': 'TypeScript', 'tsx': 'React TSX',
        'html': 'HTML', 'htm': 'HTML', 'css': 'CSS', 'scss': 'SCSS', 'sass': 'Sass',
        'php': 'PHP', 'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C',
        'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'swift': 'Swift', 'kt': 'Kotlin',
        'sql': 'SQL', 'json': 'JSON', 'xml': 'XML', 'yaml': 'YAML', 'yml': 'YAML',
        
        // Documents
        'pdf': 'PDF Document', 'doc': 'Word Document', 'docx': 'Word Document',
        'xls': 'Excel Spreadsheet', 'xlsx': 'Excel Spreadsheet',
        'ppt': 'PowerPoint', 'pptx': 'PowerPoint', 'txt': 'Text File',
        'md': 'Markdown', 'markdown': 'Markdown',
        
        // Archives
        'zip': 'ZIP Archive', 'rar': 'RAR Archive', '7z': '7-Zip Archive',
        'tar': 'TAR Archive', 'gz': 'GZip Archive',
        
        // Media
        'mp4': 'MP4 Video', 'avi': 'AVI Video', 'mov': 'QuickTime Video',
        'mp3': 'MP3 Audio', 'wav': 'WAV Audio', 'ogg': 'OGG Audio',
        
        // Others
        'exe': 'Windows Executable', 'app': 'macOS Application',
        'apk': 'Android App', 'dmg': 'macOS Disk Image'
    };
    
    return typeMap[ext] || ext.toUpperCase() + ' File';
}

// Utility functions
function updateStatus(message, isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    statusElement.textContent = message;
    statusElement.classList.remove('connected', 'error');
    if (isConnected) {
        statusElement.classList.add('connected');
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

