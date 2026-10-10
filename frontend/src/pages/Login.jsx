import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import Shell from "../components/Shell";
import { BTN, FIELD_P, FIELD_E, ERRBOX } from "../components/ui";

// R5: start a session and open the dashboard for the role
const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axiosInstance.post("/api/auth/login", form);
      login(data);
      navigate(
        data.role === "technician"
          ? "/lab"
          : data.role === "admin"
            ? "/admin/users"
            : "/home",
      );
    } catch {
      // Never say which of the two was wrong
      setError(
        "That email and password do not match. Check both and try again.",
      );
    }
  };

  const field = error ? FIELD_E : FIELD_P;

  return (
    <Shell>
      <form
        onSubmit={submit}
        className="mx-[17px] mt-[199px] flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-black text-[32px] font-semibold tracking-[-0.96px] leading-10">
            Log In
          </h1>
          <p className="text-[#667085] text-base font-medium tracking-[-0.48px] leading-6">
            Welcome Back!
          </p>
        </div>

        {error && (
          <div className={ERRBOX} role="alert">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            className={field}
            type="email"
            required
            placeholder="University Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={field}
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit" className={BTN}>
          Get Started
        </button>

        <p className="text-center text-[#98a2b3] text-base font-medium">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-black text-xs">
            Register &rarr;
          </Link>
        </p>
      </form>
    </Shell>
  );
};
export default Login;
