import { useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import { toast } from "react-hot-toast";
import {
  LoaderCircle,
  Lock,
  Mail,
  User,
  UserRoundCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    surname: "",
    username: "",
    email: "",
    password: "",
    role: "",
    gender: "",
    acceptedTerms: "",
  });

  const { register, isRegistering } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const formCheck = () => {
    if (!formData.acceptedTerms)
      return (
        toast.error("You must accept the terms of use to register", {
          position: "top-center",
        }),
        false
      );
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return (
        toast.error("Имэйлийн формат буруу байна", { position: "top-center" }),
        false
      );

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formCheck()) {
      return;
    } else {
      const isRegistered = await register(formData);
      if (isRegistered) {
        setTimeout(() => {
          navigate("/login");
        }, 1200); // Redirect to login after 2 seconds
      }
    }
  };

  return (
    <>
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Create Account
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Surname + Username */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Овог</label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                    placeholder="Овогоо оруулна уу"
                    className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={20}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Нэр</label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Нэрээ оруулна уу"
                    className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">
                Email хаяг
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

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">
                Нууц үг
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

            {/* Gender */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Хүйс</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Хүйс
                </option>
                <option value="male">Эрэгтэй</option>
                <option value="female">Эмэгтэй</option>
              </select>
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Эрх</label>
              <div className="relative">
                <UserRoundCheck
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full pl-8 py-2.5 px-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Нэвтрэх эрх
                  </option>
                  <option value="user">Хэрэглэгч</option>
                  <option value="trainer">Дасгалжуулагч</option>
                </select>
              </div>
            </div>

            {/* Terms - simple */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                checked={formData.acceptedTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptedTerms: e.target.checked })
                }
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                I agree to the{" "}
                <a href="#" className="text-blue-400 hover:underline">
                  Terms of Use
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <LoaderCircle className="animate-spin mx-auto" size={24} />
              ) : (
                "Create an account"
              )}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-4 text-center">
            Already have an account?
            <Link to={"/login"} className="text-blue-400 hover:underline ml-1">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
