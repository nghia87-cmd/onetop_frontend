import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Bell, 
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  LogOut
} from "lucide-react";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { getCurrentUser, logout } from "~/lib/auth";
import type { User } from "~/lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - OneTop" },
    { name: "description", content: "Quản lý hồ sơ và ứng tuyển" },
  ];
};

export default function CandidateDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute allowedUserTypes={["CANDIDATE"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">OneTop</span>
              </div>
              <nav className="flex items-center space-x-4">
                <Link
                  to="/jobs"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tìm việc
                </Link>
                <Link
                  to="/applications"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ứng tuyển
                </Link>
                <Link
                  to="/resumes"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  CV của tôi
                </Link>
                <Link
                  to="/chat"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium relative"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Xin chào, {user.full_name}! 👋
            </h1>
            <p className="text-gray-600">
              Chào mừng bạn quay trở lại. Đây là tổng quan về hoạt động của bạn.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">5</span>
              </div>
              <p className="text-gray-600 text-sm">Đơn ứng tuyển</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <p className="text-gray-600 text-sm">Được chấp nhận</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <p className="text-gray-600 text-sm">Đang xử lý</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">85%</span>
              </div>
              <p className="text-gray-600 text-sm">Tỷ lệ phù hợp</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Đơn ứng tuyển gần đây
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      job: "Senior Full-Stack Developer",
                      company: "Tech Corp",
                      status: "REVIEWING",
                      date: "2 ngày trước",
                      color: "yellow",
                    },
                    {
                      job: "React Developer",
                      company: "Startup Inc",
                      status: "SHORTLISTED",
                      date: "5 ngày trước",
                      color: "green",
                    },
                    {
                      job: "Backend Engineer",
                      company: "Big Company",
                      status: "PENDING",
                      date: "1 tuần trước",
                      color: "blue",
                    },
                  ].map((application, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {application.job}
                        </h3>
                        <p className="text-sm text-gray-600">{application.company}</p>
                        <p className="text-xs text-gray-500 mt-1">{application.date}</p>
                      </div>
                      <div>
                        <span
                          className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${application.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${application.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                            ${application.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                          `}
                        >
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/applications"
                  className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem tất cả ứng tuyển →
                </Link>
              </div>
            </div>

            {/* Quick Actions & Notifications */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thao tác nhanh
                </h2>
                <div className="space-y-3">
                  <Link
                    to="/jobs"
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Tìm việc mới
                  </Link>
                  <Link
                    to="/resumes/new"
                    className="block w-full bg-white border-2 border-blue-600 text-blue-600 text-center py-3 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    Tạo CV mới
                  </Link>
                  <Link
                    to="/profile"
                    className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Cập nhật hồ sơ
                  </Link>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thông báo
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      message: "Tech Corp đã xem hồ sơ của bạn",
                      time: "10 phút trước",
                      unread: true,
                    },
                    {
                      message: "Bạn có tin nhắn mới từ Startup Inc",
                      time: "2 giờ trước",
                      unread: true,
                    },
                    {
                      message: "Đơn ứng tuyển đã được cập nhật",
                      time: "1 ngày trước",
                      unread: false,
                    },
                  ].map((notification, index) => (
                    <div
                      key={index}
                      className={`
                        p-3 rounded-lg text-sm
                        ${notification.unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}
                      `}
                    >
                      <p className={notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/notifications"
                  className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
