# 📚 WindyNovel - Nền tảng đọc truyện dịch hiện đại

Nền tảng web đọc truyện dịch từ Trung Quốc với giao diện hiện đại, tính năng phong phú và trải nghiệm người dùng tối ưu.

## ✨ Tính năng chính

### 🎯 Dành cho độc giả

- 📖 **Đọc truyện mượt mà**: Giao diện đọc tối ưu với điều hướng chương linh hoạt
- 🌙 **Dark/Light Mode**: Chuyển đổi giao diện theo sở thích
- 📏 **Tùy chỉnh đọc**: Cỡ chữ, font chữ và màu nền linh hoạt
- 🔖 **Bookmark & Lịch sử**: Lưu truyện yêu thích và theo dõi tiến độ đọc
- 🔍 **Tìm kiếm thông minh**: Tìm kiếm theo tên, tác giả, thể loại với full-text search
- 💬 **Hệ thống bình luận**: Thảo luận và tương tác với cộng đồng, hỗ trợ threading
- 📱 **Responsive Design**: Tối ưu cho mọi thiết bị
- ⭐ **Hệ thống đánh giá**: Rating 5 sao cho từng truyện
- 📊 **Thống kê đọc**: Lịch sử đọc chi tiết với progress tracking

### 👤 Quản lý người dùng

- 🔐 **Xác thực an toàn**: JWT authentication với secure HTTP-only cookies
- 👨‍💼 **Phân quyền người dùng**: User và Admin roles
- 📊 **Thống kê cá nhân**: Lịch sử đọc, bookmark, tiến độ chi tiết
- ⚙️ **Tùy chỉnh profile**: Avatar, bio, sở thích thể loại, preferences
- 🎨 **Tùy chỉnh reading**: Theme, font size, font family cá nhân hóa

### 🛠️ Dành cho tác giả & quản trị viên

- ✍️ **Viết truyện**: Interface tạo và chỉnh sửa truyện với preview
- 📝 **Quản lý chương**: Tạo, chỉnh sửa, xóa chapters với rich text editor
- 👥 **Quản lý người dùng**: User management và phân quyền (admin)
- 💬 **Kiểm duyệt bình luận**: Moderation tools với báo cáo
- 📈 **Analytics**: Thống kê views, likes, bookmarks, reading progress
- 🌟 **Featured Stories**: Quản lý truyện nổi bật với ordering
- 📊 **Dashboard**: Admin panel với comprehensive statistics

## 🏗️ Kiến trúc hệ thống

### Frontend (React + Vite)

```
src/
├── components/          # Shared components
│   ├── Layout.jsx      # App layout với header/nav
│   ├── StoryCard.jsx   # Story display card
│   ├── ChapterList.jsx # Chapter navigation
│   ├── ReaderView.jsx  # Reading interface
│   ├── Toast.jsx       # Notification system
│   └── CookieDebug.jsx # Development utilities
├── pages/              # Page components
│   ├── Home.jsx        # Homepage với featured/trending stories
│   ├── StoryDetail.jsx # Story info và chapter list
│   ├── ChapterReader.jsx # Full-screen reading
│   ├── Login.jsx       # Authentication
│   ├── Register.jsx    # User registration
│   ├── Profile.jsx     # User profile management
│   ├── Bookmarks.jsx   # Saved stories với pagination
│   ├── ReadingHistory.jsx # Reading progress tracking
│   ├── WriteStory.jsx  # Story creation interface
│   ├── EditStory.jsx   # Story editing interface
│   └── WriteChapter.jsx # Chapter writing interface
├── contexts/           # React Context API
│   ├── AuthContext.jsx # Authentication state
│   ├── ThemeContext.jsx # UI theme management
│   ├── ToastContext.jsx # Notification state
│   └── ReadingProgressContext.jsx # Reading progress
├── services/           # API communication
│   └── api.js          # Axios setup và comprehensive API calls
├── utils/              # Utility functions
│   └── cookieUtils.js  # Secure cookie handling
└── data/               # Static data và mock data
```

### Backend (Node.js + Express + MongoDB)

```
server/
├── routes/             # API endpoints
│   ├── auth.js        # Authentication routes
│   ├── user.js        # User management với bookmarks/history
│   ├── story.js       # Story CRUD với advanced features
│   ├── chapter.js     # Chapter operations với statistics
│   └── comment.js     # Comment system với moderation
├── models/            # MongoDB schemas
│   ├── User.js        # User model với comprehensive profile
│   ├── Story.js       # Story với ratings, stats, và search
│   ├── Chapter.js     # Chapter content với view tracking
│   └── Comment.js     # Comments với threading và moderation
├── middleware/        # Express middleware
│   ├── error.js       # Global error handling
│   └── auth.js        # Authentication middleware
├── app.js            # Express app với security config
└── server.js         # Server startup
```

## 🛡️ Bảo mật & Performance

### Security Features

- 🔐 **JWT Authentication** với secure HTTP-only cookies
- 🛡️ **Helmet.js** cho HTTP security headers
- 🚫 **Rate Limiting** chống spam và abuse
- 🧹 **Data Sanitization** chống NoSQL injection với express-mongo-sanitize
- 🔒 **CORS** configuration bảo mật
- 🔑 **Password Hashing** với bcryptjs
- 🛡️ **HPP Protection** chống HTTP Parameter Pollution
- ✅ **Input Validation** với validator

### Performance Optimizations

- ⚡ **Vite** cho fast development và optimized builds
- 🗜️ **Compression** middleware
- 📊 **Database Indexing** cho queries nhanh (text search, user lookups)
- 🎯 **Lazy Loading** cho components
- 📱 **Responsive Images** và assets
- 🔍 **Full-text Search** với MongoDB text indexes
- 📄 **Pagination** cho all listing endpoints

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **MongoDB** (local hoặc Atlas)

### ⚡ Khởi động siêu nhanh (1 lệnh)

```bash
npm run start:dev
```

Script này tự động:

- ✅ Kiểm tra và cài đặt dependencies
- ✅ Verify MongoDB connection
- ✅ Khởi động cả Frontend (port 5173) và Backend (port 8080)
- ✅ Mở browser tự động

### 🔧 Setup thủ công

1. **Clone repository**

```bash
git clone <repository-url>
cd windynovel
```

2. **Cài đặt dependencies**

```bash
npm run install:all
```

3. **Configure environment**

```bash
# Copy và edit file .env
cp .env.example .env
```

**Environment Variables:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/windynovel

# JWT Secret (QUAN TRỌNG: Thay đổi trong production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=8080
FRONTEND_URL=http://localhost:5173

# Client Configuration
VITE_API_URL=http://localhost:8080/api
VITE_COOKIE_SECRET_KEY=your-cookie-encryption-key
```

4. **Khởi động development**

```bash
npm run dev:all
```

## 📋 Scripts có sẵn

```bash
# Development
npm run dev              # Frontend only
npm run server:dev       # Backend only với nodemon
npm run dev:all         # Cả frontend + backend
npm run start:dev       # Auto setup + run

# Production
npm run build           # Build frontend
npm run start           # Production mode
npm run preview         # Preview build

# Utilities
npm run setup           # Install all dependencies
npm run check-mongo     # Test MongoDB connection
npm run lint            # Run ESLint
```

## 🌐 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register         # User registration
POST   /api/auth/login           # User login
POST   /api/auth/refresh         # Refresh JWT token
GET    /api/auth/me              # Get current user
POST   /api/auth/logout          # Logout
POST   /api/auth/change-password # Change password
POST   /api/auth/forgot-password # Password recovery
```

### Story Management

```
GET    /api/stories              # Get all stories (với filtering, search, pagination)
GET    /api/stories/:slug        # Get story by slug
GET    /api/stories/featured     # Featured stories
GET    /api/stories/trending     # Trending stories
GET    /api/stories/statistics   # Platform statistics
POST   /api/stories             # Create story (authenticated users)
PUT    /api/stories/:id         # Update story (owner hoặc admin)
DELETE /api/stories/:id         # Delete story (owner hoặc admin)
PUT    /api/stories/:id/publish # Toggle publish status (admin)
PUT    /api/stories/:id/feature # Toggle featured status (admin)
```

### Chapter Management

```
GET    /api/chapters/story/:storyId       # Get chapters by story
GET    /api/chapters/:storyId/:number     # Get specific chapter
GET    /api/chapters/latest              # Latest chapters
POST   /api/chapters                     # Create chapter (story owner)
PUT    /api/chapters/:id                 # Update chapter (owner)
DELETE /api/chapters/:id                 # Delete chapter (owner)
```

### User Features

```
GET    /api/users/profile/:userId?       # Get user profile
PUT    /api/users/profile               # Update profile
GET    /api/users/bookmarks            # Get user bookmarks với pagination
POST   /api/users/bookmarks/:storyId   # Add bookmark
DELETE /api/users/bookmarks/:storyId   # Remove bookmark
GET    /api/users/reading-history      # Get reading history với pagination
POST   /api/users/reading-history      # Update reading progress
GET    /api/users/comments             # Get user comments
```

### Comment System

```
GET    /api/comments/story/:storyId           # Get story comments
GET    /api/comments/chapter/:chapterId       # Get chapter comments
POST   /api/comments                         # Create comment
PUT    /api/comments/:id                     # Update comment (owner)
DELETE /api/comments/:id                     # Delete comment (owner hoặc admin)
POST   /api/comments/:id/like               # Like/unlike comment
POST   /api/comments/:id/report             # Report comment
GET    /api/comments/admin/all              # Admin: Get all comments
PUT    /api/comments/:id/approve            # Admin: Approve comment
```

## 🗃️ Database Schema

### User Model

- Authentication: username, email, password (hashed)
- Profile: displayName, bio, avatar, favoriteGenres[]
- Preferences: theme, fontSize, fontFamily, autoBookmark
- Features: bookmarks[] (với addedAt), readingHistory[] (với progress)
- Admin: role, permissions, isActive, lastLogin

### Story Model

- Content: title, slug, author, translator, description
- Metadata: tags[], status, cover, isPublished, featured
- Stats: viewCount, likeCount, bookmarkCount, totalChapters
- Rating: average, count (calculated từ user ratings)
- Publishing: createdBy, lastUpdatedBy, featuredOrder
- Search: Full-text indexes on title, description, author

### Chapter Model

- Content: title, content, chapterNumber
- Relations: storyId reference
- Stats: viewCount, readingTime (calculated)
- Publishing: createdBy, updatedAt

### Comment Model

- Content: content, userId, storyId, chapterId
- Threading: parentId (for nested comments)
- Moderation: isApproved, isDeleted, reports[]
- Interaction: likes[], likeCount

## 🎯 Roadmap & Tính năng tương lai

### Phase 1 - Core Features ✅

- [x] User authentication và authorization
- [x] Story và chapter management với full CRUD
- [x] Reading interface với customization
- [x] Bookmark và reading history với progress tracking
- [x] Comment system với threading
- [x] Author interface (WriteStory, EditStory, WriteChapter)
- [x] Admin panel với moderation tools
- [x] Search functionality với full-text search
- [x] Rating system với 5-star ratings
- [x] Responsive design cho mobile

### Phase 2 - Advanced Features ⚠️ (Một phần đã implement)

- [x] **Advanced Search**: Full-text search với filters
- [x] **Detailed Statistics**: Reading analytics và progress tracking
- [x] **Featured Stories**: Story highlighting với admin control
- [x] **User Preferences**: Comprehensive customization
- [ ] **Recommendation Engine**: AI-powered suggestions
- [ ] **Social Features**: Follow users, activity feed
- [ ] **Notification System**: Real-time updates
- [ ] **Mobile App**: React Native implementation

### Phase 3 - Premium Features

- [ ] **Subscription System**: Premium content access
- [ ] **Offline Reading**: PWA với offline support
- [ ] **Multi-language**: Internationalization
- [ ] **AI Translation**: Auto-translate features
- [ ] **Voice Reading**: Text-to-speech integration
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Community Features**: Forums, discussions
- [ ] **Publishing Tools**: Advanced editing, formatting

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **Vite 6.3.5** - Build tool và dev server
- **React Router** - Client-side routing
- **Ant Design 5.25.4** - UI component library với Pro Components
- **Axios 1.7.7** - HTTP client
- **Context API** - State management
- **js-cookie** - Cookie management
- **crypto-js** - Client-side encryption
- **dayjs** - Date manipulation

### Backend

- **Node.js** - Runtime environment
- **Express.js 4.21.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.9.5** - ODM cho MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### DevOps & Security

- **ESLint** - Code linting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API protection
- **Express Mongo Sanitize** - NoSQL injection prevention
- **HPP** - HTTP Parameter Pollution protection
- **Morgan** - HTTP request logger
- **Compression** - Response compression
- **Validator** - Input validation
- **Slugify** - URL-friendly strings

### Development Tools

- **Concurrently** - Run multiple commands
- **Nodemon** - Development server auto-restart
- **ESLint** - Code quality
- **Vite** - Fast development và HMR

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**WindyNovel Development Team**

- Full-stack development
- UI/UX design
- DevOps & deployment

---

<div align="center">

**🌟 Star this repo if you find it helpful! 🌟**

[Demo](https://windynovel.demo) • [Documentation](https://docs.windynovel.com) • [Issues](https://github.com/windynovel/windynovel/issues)

</div>
