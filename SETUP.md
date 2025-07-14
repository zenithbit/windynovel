# 🚀 Hướng dẫn cài đặt WindyNovel

## 📋 Yêu cầu hệ thống

- **Node.js**: ≥ 16.0.0
- **npm**: ≥ 8.0.0
- **MongoDB**: Cục bộ hoặc MongoDB Atlas

## ⚡ Cài đặt siêu nhanh (1 lệnh duy nhất!)

```bash
npm run start:dev
```

**Thế thôi!** 🎉 Script này sẽ tự động:

- ✅ Kiểm tra và cài đặt dependencies
- ✅ Kiểm tra kết nối MongoDB
- ✅ Khởi động cả Frontend và Backend
- ✅ Mở browser tự động

## 🔧 Cài đặt thủ công (nếu cần)

### 1. Cài đặt dependencies:

```bash
npm run install:all
```

### 2. Thiết lập file .env:

File `.env` đã có sẵn, bạn có thể điều chỉnh nếu cần:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/windynovel

# JWT Secret (QUAN TRỌNG: Thay đổi trong production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=8080

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Chạy development:

```bash
npm run dev:all
```

## 🎯 Các lệnh khác hữu ích

```bash
# Siêu nhanh: Tự động setup + chạy
npm run start:dev

# Chỉ chạy frontend
npm run dev

# Chỉ chạy backend
npm run server:dev

# Chạy cả 2 (sau khi đã setup)
npm run dev:all

# Cài đặt tất cả dependencies
npm run setup

# Build production
npm run build

# Chạy production
npm run start

# Kiểm tra MongoDB
npm run check-mongo
```

## 🔗 URLs sau khi chạy

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

### API Endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Stories**: `/api/stories/*`
- **Chapters**: `/api/chapters/*`
- **Comments**: `/api/comments/*`

## 🛠️ Troubleshooting

### Lỗi kết nối MongoDB:

```bash
# Đảm bảo MongoDB đang chạy
mongod

# Hoặc sử dụng MongoDB Atlas
# Cập nhật MONGODB_URI trong .env
```

### Lỗi port đã được sử dụng:

```bash
# Thay đổi PORT trong .env
PORT=3001
```

### Lỗi dependencies:

```bash
# Xóa node_modules và cài lại
rm -rf node_modules server/node_modules
npm run setup
```

### Reset hoàn toàn:

```bash
# Xóa tất cả và cài lại
rm -rf node_modules server/node_modules package-lock.json server/package-lock.json
npm run start:dev
```

## 🎉 Hoàn thành!

Sau khi chạy `npm run start:dev`, bạn sẽ thấy:

1. ✅ **Dependencies đã cài đặt**
2. ✅ **MongoDB kết nối thành công**
3. ✅ **Frontend đang chạy**: http://localhost:5173
4. ✅ **Backend đang chạy**: http://localhost:8080
5. 🚀 **Sẵn sàng phát triển!**

---

💡 **Tips**:

- Sử dụng `Ctrl+C` để dừng cả 2 services
- Logs sẽ hiển thị cho cả frontend và backend
- Auto-reload khi thay đổi code
- Tất cả trong 1 terminal duy nhất!
