import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { authAPI } from "~/lib/api.server";
import { createUserSession, getOptionalUser } from "~/lib/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Đăng ký - OneTop" },
    { name: "description", content: "Tạo tài khoản OneTop miễn phí" },
  ];
};

// Redirect if already logged in
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getOptionalUser(request);
  if (user) {
    return redirect(user.user.user_type === 'RECRUITER' ? '/recruiter/dashboard' : '/dashboard');
  }
  return json({});
}

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  // REMOVED: username field - backend uses email as username
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  password_confirm: z.string(),
  user_type: z.enum(["CANDIDATE", "RECRUITER"], {
    errorMap: () => ({ message: "Vui lòng chọn loại tài khoản" }),
  }),
  phone_number: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["password_confirm"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    // Step 1: Register user
    await authAPI.register({
      email: data.email,
      // REMOVED: username - backend uses email as username automatically
      full_name: data.full_name,
      password: data.password,
      user_type: data.user_type,
      phone_number: data.phone_number || undefined, // CRITICAL FIX: Actually save phone_number
    });

    // Step 2: Auto login after successful registration
    try {
      const loginResponse = await authAPI.login(
        data.email as string,
        data.password as string
      );

      const { access, refresh, user_type, ...userData } = loginResponse.data;
      const user = { user_type, ...userData };

      // Create secure session with HTTP-only cookie
      const redirectTo = user_type === 'RECRUITER' ? '/recruiter/dashboard' : '/dashboard';
      return await createUserSession(access, refresh, user, redirectTo);
    } catch (loginError) {
      // IMPROVED UX: Registration succeeded but auto-login failed (Recruiter pending approval)
      const message = data.user_type === 'RECRUITER'
        ? 'Đăng ký thành công! Tài khoản của bạn đang chờ phê duyệt. Chúng tôi sẽ thông báo qua email khi tài khoản được kích hoạt.'
        : 'Đăng ký thành công! Vui lòng đăng nhập.';
      return redirect(`/login?message=${encodeURIComponent(message)}`);
    }
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error.message);
    const errors = error.response?.data;
    let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

    if (errors) {
      // Handle field-specific errors
      if (errors.email) {
        if (Array.isArray(errors.email)) {
          errorMessage = errors.email[0];
        } else {
          errorMessage = "Email đã được sử dụng";
        }
      } else if (errors.detail) {
        errorMessage = errors.detail;
      } else if (errors.non_field_errors) {
        errorMessage = Array.isArray(errors.non_field_errors) 
          ? errors.non_field_errors[0] 
          : errors.non_field_errors;
      }
    }

    return json(
      { success: false, error: errorMessage, fieldErrors: errors },
      { status: 400 }
    );
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const {
    register,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: "CANDIDATE",
    },
  });

  const userType = watch("user_type");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <Briefcase className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">OneTop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tạo tài khoản mới
          </h1>
          <p className="text-gray-600">
            Tham gia OneTop để kết nối với hàng nghìn cơ hội nghề nghiệp
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Error Message */}
          {actionData && 'error' in actionData && actionData.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Đăng ký thất bại</p>
                <p className="text-sm text-red-700 mt-1">{actionData.error}</p>
              </div>
            </div>
          )}

          <Form method="post" className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bạn là ai?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`
                  relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${userType === 'CANDIDATE' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <input
                    {...register("user_type")}
                    type="radio"
                    value="CANDIDATE"
                    className="sr-only"
                  />
                  <User className={`h-8 w-8 mb-2 ${userType === 'CANDIDATE' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${userType === 'CANDIDATE' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Ứng viên
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Tìm việc làm</span>
                </label>

                <label className={`
                  relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${userType === 'RECRUITER' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <input
                    {...register("user_type")}
                    type="radio"
                    value="RECRUITER"
                    className="sr-only"
                  />
                  <Briefcase className={`h-8 w-8 mb-2 ${userType === 'RECRUITER' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${userType === 'RECRUITER' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Nhà tuyển dụng
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Đăng tin tuyển dụng</span>
                </label>
              </div>
              {errors.user_type && (
                <p className="mt-1 text-sm text-red-600">{errors.user_type.message}</p>
              )}
            </div>

            {/* Email - Single column (Username removed, backend uses email) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email * <span className="text-xs text-gray-500">(Dùng để đăng nhập)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.email || (actionData && 'fieldErrors' in actionData && actionData.fieldErrors?.email) ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
              {actionData && 'fieldErrors' in actionData && actionData.fieldErrors?.email && (
                <p className="mt-1 text-sm text-red-600">
                  {Array.isArray(actionData.fieldErrors.email) 
                    ? actionData.fieldErrors.email[0] 
                    : actionData.fieldErrors.email}
                </p>
              )}
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  {...register("full_name")}
                  type="text"
                  id="full_name"
                  name="full_name"
                  autoComplete="name"
                  className={`
                    block w-full px-3 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.full_name ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Nguyễn Văn A"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("phone_number")}
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    autoComplete="tel"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0912345678"
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    className={`
                      block w-full pl-10 pr-3 py-3 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${errors.password ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password_confirm")}
                    type="password"
                    id="password_confirm"
                    name="password_confirm"
                    autoComplete="new-password"
                    className={`
                      block w-full pl-10 pr-3 py-3 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${errors.password_confirm ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password_confirm && (
                  <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Tôi đồng ý với{" "}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3 px-4 rounded-lg font-medium text-white
                transition-colors duration-200
                ${isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </Form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
