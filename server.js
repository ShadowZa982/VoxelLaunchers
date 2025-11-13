const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let db;
try {
  db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error('Lỗi kết nối DB:', err.message);
    } else {
      console.log('Kết nối SQLite (in-memory) thành công!');
      initDatabase();
    }
  });
} catch (err) {
  console.error('Không thể khởi tạo DB:', err.message);
}

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS download_stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        count INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) {
        console.error('Lỗi tạo bảng:', err.message);
      } else {
        console.log('Bảng download_stats đã sẵn sàng.');
      }
    });

    db.run(
      `INSERT OR IGNORE INTO download_stats (id, count) VALUES (1, 0)`,
      (err) => {
        if (err) {
          console.error('Lỗi khởi tạo dữ liệu:', err.message);
        } else {
          console.log('Đã khởi tạo lượt tải: 0 (in-memory)');
        }
      }
    );
  });
}
app.get('/api/get-downloads', (req, res) => {
  db.get("SELECT count FROM download_stats WHERE id = 1", (err, row) => {
    if (err) {
      console.error('Lỗi lấy count:', err.message);
      return res.status(500).json({ count: 0 });
    }
    res.json({ count: row?.count || 0 });
  });
});

app.post('/api/increment', (req, res) => {
  db.run("UPDATE download_stats SET count = count + 1 WHERE id = 1", function (err) {
    if (err) {
      console.error('Lỗi update count:', err.message);
      return res.status(500).json({ success: false });
    }
    db.get("SELECT count FROM download_stats WHERE id = 1", (err, row) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, count: row?.count || 0 });
    });
  });
});

app.get('/redirect', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('<h2>Không có URL tải xuống!</h2>');
  }
  res.sendFile(path.join(__dirname, 'public', 'redirect.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).send('<h2>Không tìm thấy trang!</h2>');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`DB: SQLite in-memory (không lưu file)`);
});

