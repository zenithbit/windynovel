import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ReadingProgressProvider } from "./contexts/ReadingProgressContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StoryDetail from "./pages/StoryDetail";
import ChapterReader from "./pages/ChapterReader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import ReadingHistory from "./pages/ReadingHistory";
import WriteStory from "./pages/WriteStory";
import WriteChapter from "./pages/WriteChapter";
import EditStory from "./pages/EditStory";
import CookieDebug from "./components/CookieDebug";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Auth Route Component (redirect if already logged in)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/story/:id"
        element={
          <Layout>
            <StoryDetail />
          </Layout>
        }
      />

      {/* Reader route without layout for full-screen experience */}
      <Route
        path="/story/:id/chapter/:chapterNumber"
        element={<ChapterReader />}
      />

      {/* Auth Routes (only for non-authenticated users) */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Layout>
              <Bookmarks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <ReadingHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/write"
        element={
          <ProtectedRoute>
            <Layout>
              <WriteStory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/story/:storyId/write-chapter"
        element={
          <ProtectedRoute>
            <Layout>
              <WriteChapter />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/story/:storyId/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditStory />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ReadingProgressProvider>
          <ThemeProvider>
            <Router>
              <div className="App">
                <AppRoutes />
                <CookieDebug />
              </div>
            </Router>
          </ThemeProvider>
        </ReadingProgressProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
