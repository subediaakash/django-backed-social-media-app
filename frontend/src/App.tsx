"use client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import GroupsPage from "@/pages/GroupsPage";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import SigninPage from "@/pages/SigninPage";
import SignupPage from "@/pages/SignupPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />} path="/">
          <Route element={<Navigate to="/posts" replace />} index />
          <Route element={<HomePage />} path="posts" />
          <Route element={<GroupsPage />} path="groups" />
          <Route element={<ProfilePage />} path="profile" />
          <Route element={<SearchPage />} path="search" />
          <Route element={<SettingsPage />} path="settings" />
        </Route>
        <Route element={<SignupPage />} path="/signup" />
        <Route element={<SigninPage />} path="/signin" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
