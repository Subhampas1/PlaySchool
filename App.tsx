import React, { useState, useCallback, useEffect } from "react";
import { User } from "./types";
import Login from "./views/Login";
import AdminDashboard from "./views/AdminDashboard";
import TeacherDashboard from "./views/TeacherDashboard";
import ParentDashboard from "./views/ParentDashboard";
import Layout from "./components/Layout";
import SplashScreen from "./views/SplashScreen";
import LandingPage from "./views/LandingPage";
import AdmissionView from "./views/AdmissionView";
import { api } from "./services/api";
import { ThemeProvider } from "./hooks/useTheme";

type ViewState = "SPLASH" | "LANDING" | "LOGIN" | "DASHBOARD" | "ADMISSION";

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>("SPLASH");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for an existing session on initial application load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("authToken");
      const storedUserJSON = localStorage.getItem("currentUser");

      if (token && storedUserJSON) {
        try {
          const storedUser = JSON.parse(storedUserJSON);
          // Optimistically set user from localStorage to render UI faster
          setCurrentUser(storedUser);
          setViewState("DASHBOARD");

          // Then, validate token with the backend and get fresh user data
          const freshUser = await api.getMe();
          setCurrentUser(freshUser);
          // Update localStorage with the freshest data
          localStorage.setItem("currentUser", JSON.stringify(freshUser));
        } catch (error) {
          // Token is invalid or expired, or stored user is malformed.
          // Clear session data and log out.
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          setCurrentUser(null);
          setViewState("LANDING");
          console.error("Session validation failed:", error);
        }
      }
      setIsInitializing(false);
    };
    checkSession();
  }, []);

  // Handle transition from splash screen
  useEffect(() => {
    if (!isInitializing && viewState === "SPLASH") {
      const timer = setTimeout(() => {
        setViewState("LANDING");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [viewState, isInitializing]);

  const handleLogin = useCallback((user: User, token: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    setViewState("DASHBOARD");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setViewState("LANDING");
  }, []);

  const handleAdmissionSubmit = async (formData: {
    childName: string;
    parentName: string;
    parentEmail: string;
    notes: string;
  }) => {
    try {
      await api.createAdmission(formData);

      // Simulate sending notifications
      console.log(`
        ================================================
        🚀 SIMULATING NOTIFICATIONS
        ================================================
        New Admission Application Received:

        Child: ${formData.childName}
        Parent: ${formData.parentName}
        Email: ${formData.parentEmail}
        Notes: ${formData.notes || "N/A"}

        -> 📧 Sending email notification to: admin@test.com
        -> 📱 Sending WhatsApp notification to: +91 99999 99999 (Enquiry Desk)
        ================================================
      `);

      alert(
        "Your application has been submitted successfully! We will get in touch with you shortly."
      );
      setViewState("LANDING");
    } catch (error) {
      alert(
        "There was an error submitting your application. Please try again."
      );
      console.error(error);
    }
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case "ADMIN":
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      case "TEACHER":
        return <TeacherDashboard user={currentUser} onLogout={handleLogout} />;
      case "PARENT":
        return <ParentDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <div className="text-red-500">Error: Unknown role</div>;
    }
  };

  const renderViewState = () => {
    if (isInitializing || viewState === "SPLASH") {
      return <SplashScreen />;
    }

    switch (viewState) {
      case "LANDING":
        return (
          <LandingPage
            onLoginClick={() => setViewState("LOGIN")}
            onAdmissionClick={() => setViewState("ADMISSION")}
          />
        );
      case "LOGIN":
        return (
          <Login
            onLogin={handleLogin}
            onBackToHome={() => setViewState("LANDING")}
          />
        );
      case "ADMISSION":
        return (
          <AdmissionView
            onFormSubmit={handleAdmissionSubmit}
            onBackToHome={() => setViewState("LANDING")}
          />
        );
      case "DASHBOARD":
        return renderDashboard();
      default:
        return (
          <LandingPage
            onLoginClick={() => setViewState("LOGIN")}
            onAdmissionClick={() => setViewState("ADMISSION")}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <Layout>{renderViewState()}</Layout>
    </ThemeProvider>
  );
};

export default App;
