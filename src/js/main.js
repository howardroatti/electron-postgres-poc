const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');

try {
  require('electron-reloader')(module);
} catch (_) {}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, '..', 'views', 'index.html'));
  // win.webContents.openDevTools();
}

ipcMain.handle('get-sales-data', async () => {
  console.log('Executando consulta complexa...');
  const startTime = performance.now();

  const result = await db.query(`
    SELECT
      c.nome AS nome_cliente,
      COUNT(v.id) AS total_vendas,
      SUM(vi.quantidade * vi.preco_unitario) AS valor_total_gasto
    FROM clientes c
    JOIN vendas v ON c.id = v.cliente_id
    JOIN vendas_itens vi ON v.id = vi.venda_id
    GROUP BY c.nome
    ORDER BY valor_total_gasto DESC
    ;
  `);

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);
  console.log(`Consulta executada em ${duration} ms.`);
  
  return {
    rows: result.rows,
    duration: duration
  };
});


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
