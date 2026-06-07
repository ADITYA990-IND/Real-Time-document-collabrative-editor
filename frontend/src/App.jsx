import React, { useEffect, useState, useRef } from 'react';

import { QRCodeSVG } from 'qrcode.react';

import './index.css';

function App() {

  const [room, setRoom] = useState(null);

  const [inputRoomId, setInputRoomId] = useState("");

  const [content, setContent] = useState("");

  const [status, setStatus] = useState("Disconnected");

  const [showShareModal, setShowShareModal] = useState(false);
 
  // Naya State: Network-aware URL
  const [networkUrl, setNetworkUrl] = useState("");
  const socketRef = useRef(null);

  // Logic: Automatically detect Network IP and Update URL
  useEffect(() => {
    const host = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
   
    // Room ID ko URL se fetch karo
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoom = urlParams.get('room');
    if (urlRoom) setRoom(urlRoom);

    // Dynamic Network URL generate karo
    const baseUrl = `${protocol}//${host}:${port}`;
    setNetworkUrl(urlRoom ? `${baseUrl}/?room=${urlRoom}` : baseUrl);
  }, []);

  useEffect(() => {
    if (!room) return;

    // Enhanced WebSocket connection with dynamic host and error handling
    const getWebSocketUrl = () => {
      const hostname = window.location.hostname;
      const port = 5000;
      // Use ws:// for http and wss:// for https to avoid mixed content issues
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${hostname}:${port}`;
    };

    const connectWebSocket = () => {
      const socketUrl = getWebSocketUrl();
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        setStatus("Connected Sync Engine");
        socketRef.current.send(JSON.stringify({ type: 'JOIN', docId: room }));
      };

      socketRef.current.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'LOAD_DOCUMENT' || payload.type === 'RECEIVE_EDIT') {
          setContent(payload.content);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus("Connection Error - Retrying...");
      };

      socketRef.current.onclose = () => {
        setStatus("Disconnected Line Error");
        // Attempt reconnection after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [room]);

  const handleTextareaChange = (e) => {
    const updatedText = e.target.value;
    setContent(updatedText);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'EDIT',
        docId: room,
        content: updatedText
      }));
    }
  };

  const createNewRoom = () => {
    const randomId = "doc-" + Math.random().toString(36).substring(2, 9);
    const newUrl = `${window.location.protocol}//${window.location.host}/?room=${randomId}`;
    window.history.pushState({}, '', `?room=${randomId}`);
    setNetworkUrl(newUrl); // QR aur Link update
    setRoom(randomId);
  };

  const joinExistingRoom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    window.history.pushState({}, '', `?room=${inputRoomId.trim()}`);
    setRoom(inputRoomId.trim());
  };

  const copyShareLink = () => {
    const copyToClipboard = (text) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard
          .writeText(text)
          .then(() => {
            alert("🚀 Invite link copied: " + text);
          })
          .catch(() => {
            copyUsingExecCommand(text);
          });
      } else {
        copyUsingExecCommand(text);
      }
    };

    const copyUsingExecCommand = (text) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("🚀 Invite link copied: " + text);
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert("Failed to copy. Please try manually: " + text);
      } finally {
        document.body.removeChild(textArea);
      }
    };

    copyToClipboard(networkUrl);
  };

  if (!room) {
    return (
      <div className="landing-wrapper">
        <div className="landing-card">
          <h1>⚡ Co-Edit Hub Engine</h1>
          <p>Create an isolated real-time workspace or join an existing dynamic pipeline room.</p>
          <button className="primary-btn" onClick={createNewRoom}>✨ Create Brand New Workspace</button>
          <div className="divider"><span>OR</span></div>
          <form onSubmit={joinExistingRoom} className="join-form">
            <input type="text" placeholder="Enter Workspace ID" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)} />
            <button type="submit" className="secondary-btn">Join Stream</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="title-area">
          <h2>Co-Edit Workspace Platform</h2>
          <span className="doc-tag">Active Room Token: <strong>{room}</strong></span>
        </div>
        <div className="action-tray">
          <button className="share-btn" onClick={() => setShowShareModal(!showShareModal)}>📡 Share & Stream Hub</button>
          <div className={`sync-status ${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</div>
        </div>
      </header>

      {showShareModal && (
        <div className="share-modal-overlay">
          <div className="share-modal-card">
            <div className="modal-header">
              <h3>Connect Remote Clients</h3>
              <button className="close-modal-btn" onClick={() => setShowShareModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="qr-section">
                <h4>Option 1: Scan QR Code</h4>
                <div className="qr-container-glowing">
                  <QRCodeSVG value={networkUrl} size={160} bgColor={"#0a0d1a"} fgColor={"#00f2fe"} level={"H"} includeMargin={true} />
                </div>
                <p className="qr-subtext">Scan using phone camera to sync instantly</p>
              </div>
              <div className="modal-divider"><span>OR</span></div>
              <div className="link-section">
                <h4>Option 2: Direct Broadcast Link</h4>
                <div className="copy-input-group">
                  <input type="text" readOnly value={networkUrl} />
                  <button onClick={copyShareLink}>Copy</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="editor-workspace">
        <textarea value={content} onChange={handleTextareaChange} placeholder="Start typing here..." className="glass-textarea" />
      </main>
    </div>
  );
}

export default App;
