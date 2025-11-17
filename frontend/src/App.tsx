"use client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SigninPage from "@/pages/SigninPage";
import SignupPage from "@/pages/SignupPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<SignupPage />} path="/signup" />
        <Route element={<SigninPage />} path="/signin" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
