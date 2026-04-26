import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { authAPI } from "../services/api";

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiCall = isLogin 
        ? authAPI.login({ email: form.email, password: form.password })
        : authAPI.register(form);
      
      const { data } = await apiCall;
      
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        toast(`Welcome, ${data.data.name}!`);
        onLogin(data.data);
      } else {
        toast(data.message || "Authentication failed", "error");
      }
    } catch (err) {
      toast(err.response?.data?.message || "Server error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg-base)" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ color: "var(--accent)" }}>✧</span> StudyPlanner
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            {isLogin ? "Welcome back! Please enter your details." : "Create an account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required placeholder="Enter your name" />
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Enter your password" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "10px" }} disabled={loading}>
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
