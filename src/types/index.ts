export type CaseCategory =
  | 'CRIME_REPORT' // Tố giác tội phạm
  | 'CRIME_INFO' // Tin báo về tội phạm
  | 'SECURITY_ORDER' // Phản ánh ANTT
  | 'LAW_VIOLATION' // Phản ánh vi phạm pháp luật
  | 'SOCIAL_EVIL' // Phản ánh tệ nạn xã hội
  | 'OTHER_INFO'; // Thông tin khác

export type PriorityLevel = 'NORMAL' | 'URGENT' | 'VERY_URGENT';

export type CaseStatus =
  | 'NEW' // Mới tiếp nhận
  | 'RECEIVED' // Đã tiếp nhận
  | 'CLASSIFIED' // Đang phân loại / Đã phân loại
  | 'ASSIGNED' // Đã chuyển cán bộ xử lý
  | 'PROCESSING' // Đang xử lý
  | 'VERIFYING' // Đang xác minh
  | 'WAITING_INFO' // Cần bổ sung thông tin
  | 'TRANSFERRED' // Đang phối hợp xử lý / Điều chuyển
  | 'RESOLVED' // Đã xử lý
  | 'ARCHIVED' // Lưu trữ hồ sơ
  | 'CLOSED' // Kết thúc
  | 'OUT_OF_SCOPE' // Không thuộc thẩm quyền
  | 'REJECTED' // Từ chối tiếp nhận
  | 'CANCELLED'; // Hủy hồ sơ

export type UserRole =
  | 'SUPER_ADMIN' // Toàn quyền (admin)
  | 'ADMIN' // Quản trị hệ thống
  | 'LEADERSHIP' // Lãnh đạo (Trưởng, Phó CAX)
  | 'CHIEF' // Trưởng Công an xã
  | 'DEPUTY_CHIEF' // Phó trưởng Công an xã
  | 'DUTY_OFFICER' // Cán bộ trực ban
  | 'OFFICER' // Cán bộ xử lý
  | 'RECEPTION_OFFICER' // Cán bộ tiếp nhận
  | 'PROCESSING_OFFICER' // Cán bộ xử lý
  | 'VIEW_ONLY'; // Chỉ xem

export interface CaseAttachment {
  attachmentId: string;
  caseId: string;
  fileName: string;
  mimeType: string;
  size: number; // bytes
  dataUrl?: string; // base64 or object url
  driveFileId?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface InternalNoteItem {
  noteId: string;
  officerId: string;
  officerName: string;
  content: string;
  createdAt: string;
}

export interface TimelineItem {
  timelineId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface CaseRecord {
  caseId: string; // VD: DH-2026-000001
  publicTrackingCode: string; // VD: TK-9842-115
  createdAt: string;
  updatedAt: string;
  category: CaseCategory;
  priority: PriorityLevel;
  status: CaseStatus;
  incidentDate: string;
  incidentLocation: string;
  village: string; // 1 trong 11 thôn
  description: string;
  suspectDescription?: string; // Mô tả người/vật/phương tiện
  isOngoing: boolean; // Có đang tiếp diễn hay không
  latitude?: number;
  longitude?: number;
  anonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  reporterEmail?: string;
  reporterAddress?: string;
  consentToContact?: boolean;
  assignedTo?: string[]; // Array of officer userIds
  assignedToOfficerIds?: string[];
  assignedOfficerNames?: string[];
  assignedAt?: string;
  deadline?: string; // Hạn xử lý ISO string
  closedAt?: string;
  resolution?: string; // Kết quả giải quyết
  resolutionReport?: string;
  source: 'WEB_CITIZEN' | 'DIRECT_HOTLINE' | 'INTERNAL';
  attachmentFolderId?: string;
  attachments: CaseAttachment[];
  internalNotes?: (string | InternalNoteItem)[];
  timeline?: TimelineItem[];
  citizenFeedbacks?: {
    timestamp: string;
    content: string;
  }[];
}

export interface OfficerUser {
  userId: string;
  username: string; // e.g., Quang343001 or admin
  fullName: string;
  badgeNumber: string; // Số hiệu CAND
  rank: string; // Cấp bậc (Thượng tá, Trung tá, Thiếu tá, Đại úy, Thượng úy...)
  position: string; // Chức vụ (Trưởng CAX, Phó trưởng CAX, Cán bộ...)
  role: UserRole;
  phone: string;
  email: string;
  department: string;
  assignedVillages: string[]; // Danh sách thôn phụ trách
  status: 'ACTIVE' | 'INACTIVE';
  mustChangePassword?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ProcessHistoryItem {
  historyId: string;
  caseId: string;
  action: string;
  fromStatus?: CaseStatus;
  toStatus: CaseStatus;
  performedBy: string; // User full name or 'Hệ thống'
  performedByRole?: string;
  performedAt: string;
  reason?: string;
  note?: string;
}

export interface LegalRule {
  ruleId: string;
  category: CaseCategory;
  priority: PriorityLevel;
  deadlineDays: number;
  requiredActions: string;
  description: string;
  active: boolean;
}

export interface AuditLogItem {
  logId: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  performedByName?: string;
  userRole?: string;
  action: string;
  entity?: 'CASES' | 'USERS' | 'SYSTEM' | 'ATTACHMENTS' | 'LEGAL_RULES';
  entityId?: string;
  targetId?: string;
  ipOrSession?: string;
  ipAddress?: string;
  details: string;
}

export type AuditLog = AuditLogItem;

export interface SystemNotification {
  notificationId: string;
  caseId?: string;
  recipient: string; // Email or User ID
  type: 'NEW_CASE' | 'DEADLINE_WARNING' | 'OVERDUE' | 'ASSIGNMENT' | 'STATUS_CHANGE';
  message: string;
  createdAt: string;
  sentAt?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}

export interface SystemConfig {
  unitName: string;
  unitAddress: string;
  hotlineEmergency: string;
  emailNotification: string;
  emergencyNotificationEmail?: string;
  allowAnonymous: boolean;
  maxFilesCount: number;
  maxFileSizeMB: number;
  enableAuditLog: boolean;
  autoAssignByDefault: boolean;
  autoEmailNotification?: boolean;
  defaultDeadlineDays: Record<CaseCategory, number>;
}
