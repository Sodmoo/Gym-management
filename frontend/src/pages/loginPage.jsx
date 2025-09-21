import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { LoaderCircle, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, islogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const formCheck = () => {
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return (
        toast.error("Имэйлийн формат буруу байна", { position: "top-center" }),
        false
      );

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formCheck()) return;

    const success = await login(formData);

    if (success) {
      const { profileComplete, role } = useAuthStore.getState();

      if (profileComplete) {
        navigate("/"); // 🏠 гол нүүр
      } else {
        navigate("/setup-profile", { state: { role } }); // role-г дамжуулж байна
      }
    }
  };

  return (
    <>
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Login to Your Account
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">
                Your email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="name@company.com"
                  className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={40}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            <Link
              to="/forgot-password"
              className="text-blue-400 hover:underline mt-4 text-center"
            >
              Forgot Password
            </Link>

            <button
              type="submit"
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
              disabled={islogin}
            >
              {islogin ? (
                <LoaderCircle className="animate-spin mx-auto" size={24}>
                  "Login..."
                </LoaderCircle>
              ) : (
                "Login "
              )}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-4 text-center">
            Do not have account?
            <Link
              to={"/register"}
              className="text-blue-400 hover:underline mt-4 text-center"
            >
              {" "}
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
