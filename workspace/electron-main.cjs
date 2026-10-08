const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let serverProcess = null;

function checkServerReady(url, callback) {
  const req = http.get(url, (res) => {
    callback(true);
  });
  req.on('error', () => {
    callback(false);
  });
  req.setTimeout(800, () => {
    req.destroy();
    callback(false);
  });
}

function startBackendServer() {
  const isWin = process.platform === 'win32';
  const npmCmd = isWin ? 'npm.cmd' : 'npm';
  serverProcess = spawn(npmCmd, ['start'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'MoA Studio - 混合代理人工作台',
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'public/pwa-512x512.png'),
  });

  // 檢查 http://localhost:3000 是否已有服務在跑，若無則自動啟動
  checkServerReady('http://localhost:3000', (isReady) => {
    if (!isReady) {
      console.log('未偵測到運行的服務，正在為您自動於背景啟動伺服器 (npm start)...');
      startBackendServer();
    }
  });

  // 輪詢重試載入，直到後端伺服器就緒
  let attempts = 0;
  const loadWithRetry = () => {
    checkServerReady('http://localhost:3000', (isReady) => {
      if (isReady) {
        win.loadURL('http://localhost:3000');
      } else {
        attempts++;
        if (attempts < 30) {
          setTimeout(loadWithRetry, 1000);
        } else {
          win.loadURL(
            'data:text/html;charset=utf-8,' +
              encodeURIComponent(
                '<body style="background:#0f172a;color:#fff;font-family:sans-serif;padding:40px;"><h2>啟動逾時</h2><p>無法連線至 http://localhost:3000。請開啟 PowerShell 執行 <code>npm start</code> 確認後端狀態。</p></body>'
              )
          );
        }
      }
    });
  };

  setTimeout(loadWithRetry, 500);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (_) {}
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
