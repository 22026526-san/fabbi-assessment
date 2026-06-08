import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useLogout, fetchCurrentUser } from "../api/auth";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const token = localStorage.getItem("access_token");
  const isAuthenticated = !!token;

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  });

  // Khi user A đăng xuất và user B đăng nhập trên cùng thiết bị
  // React Query vẫn giữ cache todos của user A. User B có thể thấy dữ liệu của A
  // Fix: queryClient.clear() để xóa sạch cache trước khi chuyển đến màn login
  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear()
        navigate("/login");
      },
      onError: () => {
        // Even on error, clear local tokens and redirect
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        queryClient.clear()
        navigate("/login");
      },
    });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
  };
}
