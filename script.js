// Backend API Endpoint (Node.js Server URL)
const BACKEND_URL = 'http://localhost:5000/api/generate';

// 1. Tab Switcher Logic (Code vs Preview)
function switchTab(tabName) {
  const codeView = document.getElementById('codeView');
  const previewView = document.getElementById('previewView');
  const codeTabBtn = document.getElementById('codeTabBtn');
  const previewTabBtn = document.getElementById('previewTabBtn');

  if (tabName === 'code') {
    codeView.classList.add('active');
    previewView.classList.remove('active');
    codeTabBtn.classList.add('active');
    previewTabBtn.classList.remove('active');
  } else if (tabName === 'preview') {
    previewView.classList.add('active');
    codeView.classList.remove('active');
    previewTabBtn.classList.add('active');
    codeTabBtn.classList.remove('active');

    // Switch karte waqt preview update karein
    renderLivePreview();
  }
}

// 2. Live Preview Renderer
function renderLivePreview() {
  const code = document.getElementById('codeOutput').value;
  const previewFrame = document.getElementById('previewFrame');
  
  // Directly write code to iframe srcdoc
  previewFrame.srcdoc = code;
}

// 3. Send Prompt to Node.js / Groq Backend
async function sendPromptToBackend() {
  const promptInput = document.getElementById('promptInput');
  const codeOutput = document.getElementById('codeOutput');
  const sendBtn = document.getElementById('sendBtn');
  
  const promptText = promptInput.value.trim();
  const currentCode = codeOutput.value;

  if (!promptText) return;

  // UI Loading State
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  promptInput.placeholder = 'Generating code... Please wait...';

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: promptText,
        existingCode: currentCode // Sends current code for edits/updates
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Update code output text
      codeOutput.value = data.code;

      // Update live preview if preview tab is currently active
      if (document.getElementById('previewView').classList.contains('active')) {
        renderLivePreview();
      }

      promptInput.value = '';
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Backend Request Error:', error);
    alert('Server Error! Make sure your Node.js backend server (server.js) is running on port 5000.');
  } finally {
    // Reset Loading State
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    promptInput.placeholder = 'Describe the website you want to build...';
  }
}

// 4. Event Listeners for Send Button & Enter Key
document.getElementById('sendBtn').addEventListener('click', sendPromptToBackend);

document.getElementById('promptInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendPromptToBackend();
  }
});

// 5. Left Plus Icon: Smart Multi-File Upload Reader
const codeFileInput = document.getElementById('codeFileInput');

if (codeFileInput) {
  codeFileInput.addEventListener('change', async function(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';

    // Sabhi uploaded files ko async read karein
    for (const file of files) {
      const text = await readFileAsText(file);
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        htmlContent += text + '\n';
      } else if (fileName.endsWith('.css')) {
        cssContent += text + '\n';
      } else if (fileName.endsWith('.js')) {
        jsContent += text + '\n';
      } else {
        // Kisi plain text ya secondary file ka text
        htmlContent += text + '\n';
      }
    }

    // Smart Multi-File Bundling Logic
    let finalBundledCode = htmlContent;

    // CSS styling inject karein
    if (cssContent.trim()) {
      finalBundledCode += `\n<style>\n${cssContent}\n</style>`;
    }

    // JavaScript logic inject karein
    if (jsContent.trim()) {
      finalBundledCode += `\n<script>\n${jsContent}\n</script>`;
    }

    // Code Output Textarea mein final combined code set karein
    const codeOutput = document.getElementById('codeOutput');
    if (codeOutput) {
      codeOutput.value = finalBundledCode;
    }

    // Preview refresh & Tab switch karein
    if (typeof switchTab === 'function') switchTab('preview');
    if (typeof renderLivePreview === 'function') renderLivePreview();

    // Alert notification
    const fileNames = files.map(f => f.name).join(', ');
    alert(`File(s) [${fileNames}] loaded successfuly!`);
  });
}

// Helper Function: Promise-based File Reader
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

// 6. Login Button Placeholder
function openLoginModal() {
  alert('Login functionality coming soon!');
}

// 7. Initial Demo Setup
document.addEventListener('DOMContentLoaded', () => {
  const sampleHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; text-align: center; padding-top: 50px; background: #111; color: #fff; }
    button { padding: 10px 20px; background: #fff; color: #000; border: none; border-radius: 5px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Welcome to Web Builder</h1>
  <p>Type a prompt below to generate a site or preview code!</p>
  <button onclick="alert('Ready to generate!')">Test Button</button>
</body>
</html>

Note: Code will reset once the tab is closed or refreshed. Make sure to copy your code!`;

  document.getElementById('codeOutput').value = sampleHTML;
});
// Dynamic Tab & Control Switcher
function switchTab(tabName) {
  const codeView = document.getElementById('codeView');
  const previewView = document.getElementById('previewView');
  const codeTabBtn = document.getElementById('codeTabBtn');
  const previewTabBtn = document.getElementById('previewTabBtn');
  
  const codeControls = document.getElementById('codeControls');
  const previewControls = document.getElementById('previewControls');

  if (tabName === 'code') {
    codeView.classList.add('active');
    previewView.classList.remove('active');
    codeTabBtn.classList.add('active');
    previewTabBtn.classList.remove('active');

    // Show Copy button, Hide Preview controls
    codeControls.style.display = 'flex';
    previewControls.style.display = 'none';

  } else if (tabName === 'preview') {
    previewView.classList.add('active');
    codeView.classList.remove('active');
    previewTabBtn.classList.add('active');
    codeTabBtn.classList.remove('active');

    // Hide Copy button, Show Preview controls
    codeControls.style.display = 'none';
    previewControls.style.display = 'flex';

    renderLivePreview();
  }
}

// Render Live Preview inside iframe
function renderLivePreview() {
  const code = document.getElementById('codeOutput').value;
  const previewFrame = document.getElementById('previewFrame');
  previewFrame.srcdoc = code;
}

// Copy Code Function
async function copyGeneratedCode() {
  const codeOutput = document.getElementById('codeOutput');
  if (!codeOutput.value.trim()) return;

  try {
    await navigator.clipboard.writeText(codeOutput.value);
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Code';
    }, 2000);
  } catch (err) {
    console.error('Copy Failed:', err);
  }
}

// Device View Switcher (Desktop / Tablet / Mobile)
function setDeviceView(device) {
  const previewFrame = document.getElementById('previewFrame');

  if (device === 'mobile') {
    previewFrame.style.width = '375px';
    previewFrame.style.height = '667px';
  } else if (device === 'tablet') {
    previewFrame.style.width = '768px';
    previewFrame.style.height = '90%';
  } else {
    // Desktop view
    previewFrame.style.width = '100%';
    previewFrame.style.height = '100%';
  }
}

// Fullscreen Mode
function toggleFullscreen() {
  const previewView = document.getElementById('previewView');

  if (!document.fullscreenElement) {
    if (previewView.requestFullscreen) {
      previewView.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
// Dynamic Fullscreen Toggle with Floating Back Button Logic
function toggleFullscreen() {
  const previewView = document.getElementById('previewView');

  if (!document.fullscreenElement) {
    if (previewView.requestFullscreen) {
      previewView.requestFullscreen();
    } else if (previewView.webkitRequestFullscreen) {
      previewView.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

// Fullscreen state listener (Handles button toggle & ESC key exit)
document.addEventListener('fullscreenchange', handleFullscreenUI);
document.addEventListener('webkitfullscreenchange', handleFullscreenUI);

function handleFullscreenUI() {
  const exitBtn = document.getElementById('exitFullscreenBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  if (document.fullscreenElement) {
    // Fullscreen Mode Active: Floating exit button show karein
    if (exitBtn) exitBtn.style.display = 'block';
    if (fullscreenBtn) {
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i> Exit';
    }
  } else {
    // Normal Mode: Floating exit button hide karein
    if (exitBtn) exitBtn.style.display = 'none';
    if (fullscreenBtn) {
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
    }
  }
}