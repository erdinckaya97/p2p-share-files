# 📦 P2P File Sharing Platform

A modern web application for sharing any type of files using peer-to-peer (P2P) WebRTC technology. Designed to be deployed on Cloudflare Pages.

## ✨ Features

- 🔒 **Completely Secure**: Files are shared directly between browsers via P2P
- 📦 **Serverless**: No files are uploaded to any server
- 🚀 **Fast Transfer**: High-speed data transfer using WebRTC
- 📂 **All File Types**: Share images, documents, code files, archives, media files, and more
- 🖼️ **Blob Display**: Files are handled as blob URLs (never stored on server)
- 📱 **Responsive**: Works perfectly on mobile and desktop
- 🎨 **Modern UI**: Beautiful and user-friendly interface with file type icons
- 📊 **Progress Tracking**: Real-time transfer speed and progress display

## 📁 Supported File Types

- **Images**: JPG, PNG, GIF, SVG, WebP, BMP, ICO
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD
- **Code Files**: JS, TS, HTML, CSS, PHP, Python, Java, C++, Ruby, Go, Rust, Swift, Kotlin, SQL
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **Media**: MP4, AVI, MOV, MP3, WAV, OGG
- **And any other file type!**

## 🚀 Deploy to Cloudflare Pages

### 1. Create GitHub Repository

```bash
cd image-share-p2p
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Cloudflare Pages

1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to the **Pages** tab
3. Click **Create a project**
4. Select **Connect to Git**
5. Choose your GitHub repository
6. Configure build settings:
   - **Framework preset**: None
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
7. Click **Save and Deploy**

### 3. Direct Upload (without Git)

1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to the **Pages** tab
3. Select **Upload assets**
4. Drag and drop all files (index.html, styles.css, app.js)
5. Click **Deploy site**

## 📖 Usage

### Sender

1. Open the site
2. Drag and drop any files or use the file picker
3. Click **Create Share Link**
4. Copy the generated link and share it with the receiver
5. Files will be sent automatically when the receiver connects

### Receiver

1. Open the shared link in a browser
2. Automatically connects to the sender
3. Files are displayed as they are received (with preview for images)
4. Each file can be downloaded individually

## 🛠️ Technologies

- **HTML5**: Structure
- **CSS3**: Styles and animations
- **JavaScript (ES6+)**: Application logic
- **WebRTC**: P2P connection
- **PeerJS**: WebRTC wrapper library

## 🔧 Technical Details

### P2P Connection

- WebRTC connection is established using the PeerJS library
- NAT traversal is enabled with Google STUN servers
- Each transfer is done in 16KB chunks

### Data Flow

1. Sender creates a Peer ID
2. A share link is generated with this ID
3. Receiver connects to this ID
4. Files are sent in chunks over WebRTC DataChannel
5. Receiver combines chunks to create a Blob
6. Image is displayed with Blob URL

### Security

- All data is transferred directly peer-to-peer
- No data is stored on servers
- WebRTC encryption is used

## 📝 Notes

- Sender must keep the page open until receiver downloads the files
- Both parties must be online simultaneously
- Maximum file size is limited by browser memory
- HTTPS connection is required (Cloudflare Pages provides automatically)

## 🔍 Troubleshooting

### Cannot Establish Connection

1. Check both parties' internet connections
2. Open browser console and check for error messages
3. Try a different browser
4. Check firewall settings

### Cannot Send Files

1. Check file size (very large files may cause issues with browser memory)
2. Try sending fewer files at once
3. Clear browser cache and try again

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

We welcome contributions! Feel free to submit pull requests.

---

Made with ❤️ for secure file sharing
