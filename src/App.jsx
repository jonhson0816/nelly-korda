import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import HomePage from './components/HomePage/HomePage';
import ProfilePage from './components/ProfilePage/ProfilePage';
import PostPage from './pages/Post/PostPage';
import GalleryPage from './components/GalleryPage/GalleryPage';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

// Page
import SettingsPage from './pages/Settings/SettingsPage';
import EventsPage from './pages/Events/EventsPage';

// Achievement Pages
import AchievementsPage from './pages/Achievements/AchievementsPage';
import AchievementDetailPage from './pages/Achievements/AchievementDetailPage';

// Tournament Pages
import TournamentsPage from './pages/Tournaments/TournamentsPage';
import TournamentDetailPage from './pages/Tournaments/TournamentDetailPage';
import TournamentForm from './components/Admin/Tournaments/TournamentForm';

// Admin Pages
import AdminDashboard from './components/Admin/Achievements/AdminDashboard';
import AdminTournamentDashboard from './components/Admin/Tournaments/AdminTournamentDashboard';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Story Page
import StoryPage from './pages/StoryPage/StoryPage';

// Messenger & Notifications
import MessengerPage from './components/MessengerPage/MessengerPage';
import NotificationPage from './components/NotificationPage/NotificationPage';

// Static Pages
import AboutPage from './pages/AboutPage/AboutPage';
import Contact from './components/Contact/Contact';
import HelpCenter from './components/HelpCenter/HelpCenter';
import Privacy from './components/Privacy/Privacy';

// ✅ NEW PAGES
import FAQPage from './pages/FAQ/FAQPage';
import TermsPage from './pages/Terms/TermsPage';
import JoinNow from './pages/JoinNow/JoinNow';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import TrendingPage from './pages/Trending/TrendingPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/join" element={<JoinNow />} />

                {/* PROTECTED ROUTES - HOME */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - PROFILE */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:username"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - GALLERY */}
                <Route
                  path="/gallery"
                  element={
                    <ProtectedRoute>
                      <GalleryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gallery/:userId"
                  element={
                    <ProtectedRoute>
                      <GalleryPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - POST */}
                <Route
                  path="/post/:id"
                  element={
                    <ProtectedRoute>
                      <PostPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - ACHIEVEMENTS */}
                <Route
                  path="/achievements"
                  element={
                    <ProtectedRoute>
                      <AchievementsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/achievements/:id"
                  element={
                    <ProtectedRoute>
                      <AchievementDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - TOURNAMENTS */}
                <Route
                  path="/tournaments"
                  element={
                    <ProtectedRoute>
                      <TournamentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tournaments/:id"
                  element={
                    <ProtectedRoute>
                      <TournamentDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - ADMIN */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tournaments"
                  element={
                    <ProtectedRoute>
                      <AdminTournamentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tournaments/create"
                  element={
                    <ProtectedRoute>
                      <TournamentForm mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tournaments/edit/:id"
                  element={
                    <ProtectedRoute>
                      <TournamentForm mode="edit" />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - STORY */}
                <Route
                  path="/story/:storyId"
                  element={
                    <ProtectedRoute>
                      <StoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - MESSAGING */}
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <MessengerPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - NOTIFICATIONS */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - SETTINGS */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - EVENTS */}
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />

                {/* PROTECTED ROUTES - STATIC PAGES */}
                <Route
                  path="/about"
                  element={
                    <ProtectedRoute>
                      <AboutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <ProtectedRoute>
                      <Contact />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <HelpCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <ProtectedRoute>
                      <Privacy />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ NEW ROUTES - FAQ & TERMS */}
                <Route
                  path="/faq"
                  element={
                    <ProtectedRoute>
                      <FAQPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <ProtectedRoute>
                      <TermsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trending"
                  element={
                    <ProtectedRoute>
                      <TrendingPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 NOT FOUND */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;