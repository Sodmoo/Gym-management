import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LoaderCircle, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token, id } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmshowPassword, setconfirmshowPassword] = useState(false);
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();

  const matchpasswords = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { position: "top-center" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(await matchpasswords())) {
      return;
    }
    await resetPassword(id, token, password);
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <>
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Create new Password
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={confirmshowPassword ? "text" : "password"}
                  name="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setconfirmshowPassword(!confirmshowPassword)}
                >
                  {confirmshowPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin mx-auto" size={24}>
                  "Loading...."
                </LoaderCircle>
              ) : (
                "Set Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
