import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { loginUser } from "../api/authApi";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await loginUser(formData);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-bold">Login</h1>

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border p-2"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border p-2"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border p-2"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;