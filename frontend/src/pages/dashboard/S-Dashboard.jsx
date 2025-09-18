import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

function S_Dashboard() {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const islogout = await logout();
    if (islogout) {
      setTimeout(() => {
        navigate("/");
      }, 200);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>{authUser.username}</p>
      <p>{authUser.email}</p>
      <p>{authUser.role}</p>

      <button onClick={handleLogout}>LogOut</button>
    </div>
  );
}

export default S_Dashboard;
