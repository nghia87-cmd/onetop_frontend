import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
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
import { requireAuth } from "~/lib/session.server";
import { applicationsAPI, chatsAPI, notificationsAPI } from "~/lib/api.server";
import type { Application, DashboardStats, Notification } from "~/types/application";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - OneTop" },
    { name: "description", content: "Quản lý hồ sơ và ứng tuyển" },
  ];
};

// Server-side authentication check
export async function loader({ request }: LoaderFunctionArgs) {
  const { user, accessToken } = await requireAuth(request);
  
  // Ensure only candidates can access
  if (user.user_type !== 'CANDIDATE') {
    throw new Response("Unauthorized", { status: 403 });
  }

  try {
    // Fetch real data from API in parallel
    const [applicationsRes, unreadCountRes, notificationsRes] = await Promise.all([
      applicationsAPI.list(accessToken),
      chatsAPI.getUnreadCount(accessToken),
      notificationsAPI.list(accessToken, { unread_only: true }),
    ]);

    const applications: Application[] = applicationsRes.data;
    
    // Calculate stats from applications
    const stats: DashboardStats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter((app) => 
        app.status === 'PENDING' || app.status === 'REVIEWING'
      ).length,
      interviews: applications.filter((app) => 
        app.status === 'INTERVIEW_SCHEDULED'
      ).length,
      offers: applications.filter((app) => 
        app.status === 'ACCEPTED' || app.status === 'OFFER_EXTENDED'
      ).length,
    };

    return json({ 
      user,
      stats,
      recentApplications: applications.slice(0, 3), // Latest 3 applications
      unreadMessages: unreadCountRes.data.count || 0,
      notifications: notificationsRes.data.results?.slice(0, 3) || [],
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    
    // Return fallback data if API fails
    return json({ 
      user,
      stats: {
        totalApplications: 0,
        pendingApplications: 0,
        interviews: 0,
        offers: 0,
      },
      recentApplications: [],
      unreadMessages: 0,
      notifications: [],
      error: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
    });
  }
}

export default function CandidateDashboard() {
  const loaderData = useLoaderData<typeof loader>();
  const { user, stats, recentApplications, unreadMessages, notifications } = loaderData;
  const error = 'error' in loaderData ? (loaderData.error as string) : undefined;

  // Helper function to format date using date-fns
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: vi 
    });
  };

  // Helper function to get status color and text
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'PENDING': { color: 'blue', text: 'Chờ xử lý' },
      'REVIEWING': { color: 'yellow', text: 'Đang xem xét' },
      'SHORTLISTED': { color: 'green', text: 'Được chọn' },
      'INTERVIEW_SCHEDULED': { color: 'purple', text: 'Đã hẹn PV' },
      'REJECTED': { color: 'red', text: 'Từ chối' },
      'ACCEPTED': { color: 'green', text: 'Chấp nhận' },
      'OFFER_EXTENDED': { color: 'green', text: 'Nhận offer' },
    };
    return statusMap[status] || { color: 'gray', text: status };
  };

  return (
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
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </Form>
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
            {error && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <Bell className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalApplications}</span>
              </div>
              <p className="text-gray-600 text-sm">Đơn ứng tuyển</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.offers}</span>
              </div>
              <p className="text-gray-600 text-sm">Được chấp nhận</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</span>
              </div>
              <p className="text-gray-600 text-sm">Đang xử lý</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.interviews}</span>
              </div>
              <p className="text-gray-600 text-sm">Lịch phỏng vấn</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Đơn ứng tuyển gần đây
                </h2>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Chưa có đơn ứng tuyển nào</p>
                    <Link to="/jobs" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                      Tìm việc ngay →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application: any) => {
                      const statusDisplay = getStatusDisplay(application.status);
                      return (
                        <div
                          key={application.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {application.job?.title || 'Job Title'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {application.job?.company?.name || 'Company'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(application.created_at)}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`
                                px-3 py-1 rounded-full text-xs font-medium
                                ${statusDisplay.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${statusDisplay.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                                ${statusDisplay.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                                ${statusDisplay.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                                ${statusDisplay.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                                ${statusDisplay.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                              `}
                            >
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Không có thông báo mới</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`
                          p-3 rounded-lg text-sm
                          ${!notification.is_read ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}
                        `}
                      >
                        <p className={!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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
  );
}
