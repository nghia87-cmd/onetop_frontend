// StatusBadge Component - Reusable status indicator
import { cn } from "~/lib/utils";
import type { ApplicationStatus } from "~/types/application";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig: Record<ApplicationStatus, { color: string; text: string; bgColor: string; textColor: string }> = {
  'PENDING': { 
    color: 'blue', 
    text: 'Chờ xử lý',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  'REVIEWING': { 
    color: 'yellow', 
    text: 'Đang xem xét',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  'INTERVIEW_SCHEDULED': { 
    color: 'purple', 
    text: 'Đã hẹn PV',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  'REJECTED': { 
    color: 'red', 
    text: 'Từ chối',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  'ACCEPTED': { 
    color: 'green', 
    text: 'Chấp nhận',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  'OFFER_EXTENDED': { 
    color: 'green', 
    text: 'Nhận offer',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  'WITHDRAWN': { 
    color: 'gray', 
    text: 'Đã rút',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    color: 'gray', 
    text: status,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.text}
    </span>
  );
}

// Icon variant with colored dot
export function StatusBadgeWithDot({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    color: 'gray', 
    text: status,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  };

  const dotColors: Record<string, string> = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dotColors[config.color])} />
      {config.text}
    </span>
  );
}

// Simple text variant (no background)
export function StatusText({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    color: 'gray', 
    text: status,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  };

  return (
    <span className={cn("text-sm font-medium", config.textColor, className)}>
      {config.text}
    </span>
  );
}
