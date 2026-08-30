import {
  CaseRecord,
  OfficerUser,
  ProcessHistoryItem,
  AuditLogItem,
  LegalRule,
  SystemNotification,
  SystemConfig,
  CaseCategory,
  PriorityLevel,
  CaseStatus,
} from '../types';
import {
  DUC_HOP_COMMUNE_INFO,
  DUC_HOP_VILLAGES,
  DEFAULT_LEGAL_RULES,
  STATE_TRANSITIONS,
} from '../constants/policeData';

const STORAGE_KEYS = {
  CASES: 'duchop_police_cases_v1',
  USERS: 'duchop_police_users_v1',
  PASSWORDS: 'duchop_police_passwords_v1',
  HISTORY: 'duchop_police_history_v1',
  AUDIT: 'duchop_police_audit_v1',
  RULES: 'duchop_police_rules_v1',
  NOTIFICATIONS: 'duchop_police_notifications_v1',
  CONFIG: 'duchop_police_config_v1',
  CURRENT_USER: 'duchop_police_current_user_v1',
};

// Initial Config
const DEFAULT_CONFIG: SystemConfig = {
  unitName: 'Công an xã Đức Hợp',
  unitAddress: 'Thôn Nho Lâm, xã Đức Hợp, tỉnh Hưng Yên',
  hotlineEmergency: '02213.815.999',
  emailNotification: 'conganxaduchopdangbai@gmail.com',
  emergencyNotificationEmail: 'conganxaduchopdangbai@gmail.com',
  allowAnonymous: true,
  maxFilesCount: 5,
  maxFileSizeMB: 15,
  enableAuditLog: true,
  autoAssignByDefault: false,
  autoEmailNotification: true,
  defaultDeadlineDays: {
    CRIME_REPORT: 20,
    CRIME_INFO: 7,
    SECURITY_ORDER: 3,
    LAW_VIOLATION: 7,
    SOCIAL_EVIL: 7,
    OTHER_INFO: 5,
  },
};

// Generate initial demo users
const INITIAL_USERS: OfficerUser[] = [
  {
    userId: 'USR-ADMIN-001',
    username: 'admin',
    fullName: 'Quản trị viên Hệ thống',
    badgeNumber: 'ADMIN-ROOT',
    rank: 'Quản trị viên',
    position: 'Quản trị hệ thống',
    role: 'SUPER_ADMIN',
    phone: '02213.815.999',
    email: 'admin.duchop@hungyen.gov.vn',
    department: 'Ban Quản trị Công nghệ & Hồ sơ',
    assignedVillages: [...DUC_HOP_VILLAGES],
    status: 'ACTIVE',
    mustChangePassword: false,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  ...DUC_HOP_COMMUNE_INFO.leadershipAndOfficers.map((officer, index) => ({
    userId: `USR-OFFICER-00${index + 1}`,
    username: officer.username,
    fullName: `${officer.rank} ${officer.fullName}`,
    badgeNumber: officer.badgeNumber,
    rank: officer.rank,
    position: officer.position,
    role: officer.role,
    phone: officer.phone,
    email: `${officer.username.toLowerCase()}@hungyen.gov.vn`,
    department: officer.department,
    assignedVillages: officer.assignedVillages,
    status: 'ACTIVE' as const,
    mustChangePassword: true, // Requires changing password on first login
    createdAt: '2026-01-10T08:00:00.000Z',
  })),
];

const INITIAL_PASSWORDS: Record<string, string> = {
  admin: 'admin@123',
  Quang343001: '1',
  Hai343002: '1',
  Ngoc343003: '1',
  Thu343004: '1',
  Doanh343005: '1',
  Ngoan343006: '1',
};

// Generate 10 realistic demo cases
const INITIAL_CASES: CaseRecord[] = [
  {
    caseId: 'DH-2026-000001',
    publicTrackingCode: 'TK-7842-101',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: 'CRIME_REPORT',
    priority: 'VERY_URGENT',
    status: 'PROCESSING',
    incidentDate: '2026-08-24 19:30',
    incidentLocation: 'Khu vực đường liên thôn gần Trạm y tế cũ',
    village: 'Nho Lâm',
    description: 'Phát hiện 2 đối tượng lạ mặt đi xe máy Exciter không biển số có hành vi bẻ khóa trộm xe máy của người dân đang dừng mua hàng.',
    suspectDescription: '2 nam thanh niên, mặc áo khoác đen, đội mũ bảo hiểm trùm đầu, xe Yamaha Exciter màu xanh đen',
    isOngoing: false,
    latitude: 20.7321,
    longitude: 106.0125,
    anonymous: false,
    reporterName: 'Trần Văn Mạnh',
    reporterPhone: '0912.345.678',
    reporterEmail: 'manhtran.dh@gmail.com',
    reporterAddress: 'Thôn Nho Lâm, xã Đức Hợp',
    consentToContact: true,
    assignedTo: ['USR-OFFICER-002', 'USR-OFFICER-005'],
    assignedOfficerNames: ['Thiếu tá Phạm Văn Hài', 'Trung tá Nguyễn Văn Doanh'],
    assignedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    deadline: new Date(Date.now() - 2 * 86400000).toISOString(), // Overdue for demo
    source: 'WEB_CITIZEN',
    attachments: [
      {
        attachmentId: 'ATT-001',
        caseId: 'DH-2026-000001',
        fileName: 'anh_hien_truong_camera.jpg',
        mimeType: 'image/jpeg',
        size: 1420000,
        uploadedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        uploadedBy: 'Người dân cung cấp',
      },
    ],
    internalNotes: ['Đã trích xuất camera an ninh ngã tư Nho Lâm', 'Phát hiện hướng di chuyển sang địa bàn lân cận'],
    citizenFeedbacks: [],
  },
  {
    caseId: 'DH-2026-000002',
    publicTrackingCode: 'TK-5912-204',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'SOCIAL_EVIL',
    priority: 'URGENT',
    status: 'VERIFYING',
    incidentDate: '2026-08-27 22:00',
    incidentLocation: 'Bãi đất trống phía sau đình làng',
    village: 'Đức Trung',
    description: 'Có một nhóm thanh niên khoảng 6-8 người thường xuyên tụ tập đánh bạc ăn tiền và hò hét gây mất trật tự sau 22h đêm.',
    suspectDescription: 'Nhóm đối tượng gồm thanh niên địa phương và một số người lạ mặt từ nơi khác đến',
    isOngoing: true,
    latitude: 20.7384,
    longitude: 106.0189,
    anonymous: true,
    source: 'WEB_CITIZEN',
    assignedTo: ['USR-OFFICER-006'],
    assignedOfficerNames: ['Thiếu tá Phạm Văn Ngoạn'],
    assignedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 1 * 86400000).toISOString(), // Warning approaching
    attachments: [],
    internalNotes: ['Đã phân công trinh sát địa bàn theo dõi quy luật hoạt động'],
  },
  {
    caseId: 'DH-2026-000003',
    publicTrackingCode: 'TK-3341-889',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'SECURITY_ORDER',
    priority: 'NORMAL',
    status: 'RECEIVED',
    incidentDate: '2026-08-29 14:00',
    incidentLocation: 'Trục đường chính thôn Phú Ninh',
    village: 'Phú Ninh',
    description: 'Một hộ dân tập kết vật liệu xây dựng cát sỏi lấn chiếm 1/2 lòng đường giao thông nông thôn gây nguy cơ tai nạn.',
    isOngoing: true,
    latitude: 20.7412,
    longitude: 106.0098,
    anonymous: false,
    reporterName: 'Nguyễn Thị Hoa',
    reporterPhone: '0988.223.344',
    reporterEmail: 'hoanguyen.dh@gmail.com',
    reporterAddress: 'Thôn Phú Ninh, xã Đức Hợp',
    consentToContact: true,
    source: 'WEB_CITIZEN',
    attachments: [],
  },
  {
    caseId: 'DH-2026-000004',
    publicTrackingCode: 'TK-9923-412',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'LAW_VIOLATION',
    priority: 'NORMAL',
    status: 'RESOLVED',
    incidentDate: '2026-08-22 09:00',
    incidentLocation: 'Cơ sở thu mua phế liệu',
    village: 'Hạnh Lâm',
    description: 'Phản ánh cơ sở kinh doanh phế liệu đốt dây điện và chất thải nguy hại vào ban đêm gây ô nhiễm khói mù mịt khu dân cư.',
    isOngoing: false,
    latitude: 20.7295,
    longitude: 106.0156,
    anonymous: false,
    reporterName: 'Lê Hoàng Long',
    reporterPhone: '0977.654.321',
    consentToContact: true,
    assignedTo: ['USR-OFFICER-004'],
    assignedOfficerNames: ['Trung tá Vũ Văn Thu'],
    assignedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    deadline: new Date(Date.now() - 2 * 86400000).toISOString(),
    closedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    resolution: 'Công an xã phối hợp cán bộ môi trường đã kiểm tra thực tế, lập biên bản nhắc nhở và yêu cầu chủ cơ sở ký cam kết chấm dứt đốt chất thải.',
    source: 'WEB_CITIZEN',
    attachments: [],
    internalNotes: ['Chủ hộ đã chấp hành và nộp phạt theo quy định'],
  },
  {
    caseId: 'DH-2026-000005',
    publicTrackingCode: 'TK-1287-665',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'CRIME_INFO',
    priority: 'NORMAL',
    status: 'WAITING_INFO',
    incidentDate: '2026-08-26 10:30',
    incidentLocation: 'Khu vực chợ đầu mối xã Đức Hợp',
    village: 'Vân Nghệ',
    description: 'Có đối tượng khả nghi tiếp cận người già để mời mua thuốc chữa bệnh lạ có dấu hiệu lừa đảo đa cấp.',
    suspectDescription: 'Người phụ nữ khoảng 45 tuổi, nói giọng miền Trung, đeo túi xách da màu đen',
    isOngoing: false,
    latitude: 20.735,
    longitude: 106.022,
    anonymous: true,
    source: 'WEB_CITIZEN',
    assignedTo: ['USR-OFFICER-005'],
    assignedOfficerNames: ['Trung tá Nguyễn Văn Doanh'],
    assignedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    attachments: [],
    internalNotes: ['Đã yêu cầu người dân nếu có hình ảnh hoặc địa điểm đối tượng thuê trọ cung cấp thêm'],
  },
  {
    caseId: 'DH-2026-000006',
    publicTrackingCode: 'TK-4821-390',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'SECURITY_ORDER',
    priority: 'NORMAL',
    status: 'CLOSED',
    incidentDate: '2026-08-18 20:00',
    incidentLocation: 'Khu dân cư xóm 3',
    village: 'Trung Hòa',
    description: 'Xích mích tranh chấp ranh giới đất và mương tiêu thoát nước giữa 2 hộ gia đình dẫn đến cãi cọ to tiếng.',
    isOngoing: false,
    anonymous: false,
    reporterName: 'Đỗ Văn Hưng',
    reporterPhone: '0904.112.233',
    assignedTo: ['USR-OFFICER-005'],
    assignedOfficerNames: ['Trung tá Nguyễn Văn Doanh'],
    resolution: 'Công an xã phối hợp Ban Mặt trận thôn tổ chức hòa giải thành công, hai bên đã thống nhất cắm mốc ranh giới.',
    closedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    source: 'DIRECT_HOTLINE',
    attachments: [],
  },
  {
    caseId: 'DH-2026-000007',
    publicTrackingCode: 'TK-7761-002',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    category: 'CRIME_REPORT',
    priority: 'VERY_URGENT',
    status: 'NEW',
    incidentDate: '2026-08-30 06:45',
    incidentLocation: 'Cửa hàng tạp hóa đối diện trường học',
    village: 'Phú Cường',
    description: 'Bị kẻ gian đột nhập rạng sáng cạy cửa lấy trộm 01 két sắt nhỏ và thẻ cào điện thoại trị giá ước tính 35 triệu đồng.',
    suspectDescription: 'Camera ghi nhận 1 người đeo găng tay, trùm khăn kín mặt lúc 03:15 sáng',
    isOngoing: false,
    latitude: 20.7302,
    longitude: 106.0111,
    anonymous: false,
    reporterName: 'Vũ Thị Minh',
    reporterPhone: '0936.789.012',
    reporterEmail: 'minhvu.dh@gmail.com',
    reporterAddress: 'Thôn Phú Cường, xã Đức Hợp',
    consentToContact: true,
    source: 'WEB_CITIZEN',
    attachments: [],
  },
  {
    caseId: 'DH-2026-000008',
    publicTrackingCode: 'TK-8834-119',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'OTHER_INFO',
    priority: 'NORMAL',
    status: 'CLASSIFIED',
    incidentDate: '2026-08-28 16:00',
    incidentLocation: 'Khu vực bến đò cũ',
    village: 'Quảng Lạc',
    description: 'Người dân nhặt được 01 ví da có nhiều giấy tờ tùy thân (CCCD, GPLX, thẻ ATM) mang tên công dân ở xã khác rơi tại quán nước.',
    isOngoing: false,
    anonymous: false,
    reporterName: 'Phạm Đức Dũng',
    reporterPhone: '0979.888.999',
    consentToContact: true,
    source: 'WEB_CITIZEN',
    attachments: [],
  },
  {
    caseId: 'DH-2026-000009',
    publicTrackingCode: 'TK-5519-743',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: 'SOCIAL_EVIL',
    priority: 'URGENT',
    status: 'TRANSFERRED',
    incidentDate: '2026-08-25 15:00',
    incidentLocation: 'Khu vực giáp ranh đê sông Hồng',
    village: 'Bắc Nam Phú',
    description: 'Nghi vấn điểm tàng trữ và bán lẻ ma túy trái phép cho người nghiện lang thang tại chòi canh cá bỏ hoang.',
    isOngoing: true,
    anonymous: true,
    source: 'WEB_CITIZEN',
    assignedTo: ['USR-OFFICER-002'],
    assignedOfficerNames: ['Thiếu tá Phạm Văn Hài'],
    assignedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 1 * 86400000).toISOString(),
    attachments: [],
    internalNotes: ['Đã phối hợp Đội Cảnh sát Điều tra tội phạm về Ma túy - Công an tỉnh thụ lý phối hợp'],
  },
  {
    caseId: 'DH-2026-000010',
    publicTrackingCode: 'TK-6620-918',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    category: 'LAW_VIOLATION',
    priority: 'NORMAL',
    status: 'OUT_OF_SCOPE',
    incidentDate: '2026-08-20 11:00',
    incidentLocation: 'Cánh đồng Thôn Tây Thịnh',
    village: 'Tây Thịnh',
    description: 'Khiếu nại về việc đền bù giải phóng mặt bằng đường nội đồng chưa thỏa đáng.',
    isOngoing: false,
    anonymous: false,
    reporterName: 'Lê Văn Toàn',
    reporterPhone: '0913.556.778',
    resolution: 'Nội dung thuộc thẩm quyền giải quyết của Hội đồng bồi thường GPMB UBND xã Đức Hợp. Công an xã đã hướng dẫn công dân gửi đơn đến UBND xã.',
    closedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    source: 'WEB_CITIZEN',
    attachments: [],
  },
];

class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PASSWORDS)) {
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(INITIAL_PASSWORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RULES)) {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(DEFAULT_LEGAL_RULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) {
      const initialLogs: AuditLogItem[] = [
        {
          logId: 'AUD-000001',
          timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
          userId: 'USR-ADMIN-001',
          userName: 'Quản trị viên Hệ thống',
          userRole: 'SUPER_ADMIN',
          action: 'ADMIN_ACTION',
          entity: 'SYSTEM',
          entityId: 'SYS-INIT',
          ipOrSession: '127.0.0.1 (Khởi tạo hệ thống)',
          details: 'Khởi tạo hệ thống Hòm thư tố giác tội phạm số Công an xã Đức Hợp',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(initialLogs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
      const initialHistories: ProcessHistoryItem[] = [
        {
          historyId: 'HIST-001',
          caseId: 'DH-2026-000001',
          action: 'Tiếp nhận hồ sơ',
          fromStatus: 'NEW',
          toStatus: 'PROCESSING',
          performedBy: 'Thiếu tá Phạm Văn Hài',
          performedByRole: 'LEADERSHIP',
          performedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          reason: 'Phát hiện dấu hiệu tội phạm trộm cắp tài sản',
          note: 'Phân công đồng chí Doanh phối hợp rà soát',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(initialHistories));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
  }

  // --- Reset & Seed ---
  public resetToDemoData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(INITIAL_PASSWORDS));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(DEFAULT_LEGAL_RULES));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    this.addAuditLog({
      action: 'ADMIN_ACTION',
      entity: 'SYSTEM',
      entityId: 'DEMO-RESET',
      details: 'Khôi phục dữ liệu mẫu Demo ban đầu của Công an xã Đức Hợp',
    });
  }

  // --- Auth & Users ---
  public getUsers(): OfficerUser[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  public saveUsers(users: OfficerUser[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public getPasswords(): Record<string, string> {
    const data = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    return data ? JSON.parse(data) : INITIAL_PASSWORDS;
  }

  public savePasswords(passwords: Record<string, string>) {
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
  }

  public getCurrentUser(): OfficerUser | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  public setCurrentUser(user: OfficerUser | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public login(username: string, pass: string): { success: boolean; user?: OfficerUser; message: string } {
    const trimmedUser = username.trim();
    const users = this.getUsers();
    const passwords = this.getPasswords();

    const user = users.find((u) => u.username.toLowerCase() === trimmedUser.toLowerCase());
    if (!user) {
      return { success: false, message: 'Tên đăng nhập không tồn tại trên hệ thống.' };
    }

    if (user.status !== 'ACTIVE') {
      return { success: false, message: 'Tài khoản đã bị tạm khóa hoặc ngừng hoạt động.' };
    }

    const expectedPass = passwords[user.username] || '1';
    if (pass !== expectedPass) {
      return { success: false, message: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    this.saveUsers(users);
    this.setCurrentUser(user);

    this.addAuditLog({
      userId: user.userId,
      userName: user.fullName,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'USERS',
      entityId: user.userId,
      details: `Đăng nhập thành công vào cổng nghiệp vụ Công an xã Đức Hợp (${user.role})`,
    });

    return { success: true, user, message: 'Đăng nhập thành công.' };
  }

  public logout() {
    const user = this.getCurrentUser();
    if (user) {
      this.addAuditLog({
        userId: user.userId,
        userName: user.fullName,
        userRole: user.role,
        action: 'LOGOUT',
        entity: 'USERS',
        entityId: user.userId,
        details: 'Đăng xuất khỏi hệ thống',
      });
    }
    this.setCurrentUser(null);
  }

  public changePassword(
    userIdOrUsername: string,
    arg2: string,
    arg3?: string
  ): { success: boolean; user?: OfficerUser; message: string } {
    const passwords = this.getPasswords();
    const users = this.getUsers();
    const user = users.find(
      (u) => u.userId === userIdOrUsername || u.username === userIdOrUsername
    );
    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản cán bộ.' };
    }

    let oldPass: string | undefined;
    let newPass: string;

    if (arg3 !== undefined) {
      oldPass = arg2;
      newPass = arg3;
      if (passwords[user.username] !== oldPass) {
        return { success: false, message: 'Mật khẩu cũ không chính xác.' };
      }
    } else {
      newPass = arg2;
    }

    passwords[user.username] = newPass;
    this.savePasswords(passwords);

    user.mustChangePassword = false;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && (currentUser.userId === user.userId || currentUser.username === user.username)) {
      currentUser.mustChangePassword = false;
      this.setCurrentUser(currentUser);
    }

    this.addAuditLog({
      userId: user.userId,
      userName: user.fullName,
      userRole: user.role,
      action: 'RESET_PASSWORD',
      entity: 'USERS',
      entityId: user.userId,
      details: 'Đổi mật khẩu tài khoản cán bộ thành công',
    });

    return { success: true, user, message: 'Đổi mật khẩu thành công!' };
  }

  public createOfficerUser(officerData: Partial<OfficerUser>): OfficerUser {
    const users = this.getUsers();
    const passwords = this.getPasswords();

    // Auto-generate username if not provided: [Tên viết tắt/đầu] + [Số hiệu không dấu gạch]
    let generatedUsername = officerData.username;
    if (!generatedUsername && officerData.fullName && officerData.badgeNumber) {
      const nameParts = officerData.fullName.trim().split(' ');
      const lastName = nameParts[nameParts.length - 1];
      const cleanBadge = officerData.badgeNumber.replace(/[^a-zA-Z0-9]/g, '');
      generatedUsername = `${lastName}${cleanBadge}`;
    }
    if (!generatedUsername) {
      generatedUsername = `CB${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
    }

    const uniqueSuffix = `${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 1000)}`;
    const newUser: OfficerUser = {
      userId: `USR-OFFICER-${uniqueSuffix}`,
      username: generatedUsername,
      fullName: officerData.fullName || 'Cán bộ Công an',
      badgeNumber: officerData.badgeNumber || '343-000',
      rank: officerData.rank || 'Đại úy',
      position: officerData.position || 'Cán bộ',
      role: officerData.role || 'PROCESSING_OFFICER',
      phone: officerData.phone || '02213.815.999',
      email: officerData.email || `${generatedUsername.toLowerCase()}@hungyen.gov.vn`,
      department: officerData.department || 'Công an xã Đức Hợp',
      assignedVillages: officerData.assignedVillages || [],
      status: 'ACTIVE',
      mustChangePassword: true, // Default pass is 1, must change on first login
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    passwords[newUser.username] = '1'; // Default password '1'

    this.saveUsers(users);
    this.savePasswords(passwords);

    this.addAuditLog({
      action: 'ADMIN_ACTION',
      entity: 'USERS',
      entityId: newUser.userId,
      details: `Tạo mới tài khoản cán bộ: ${newUser.fullName} (${newUser.username}) - Phụ trách: ${newUser.assignedVillages.join(', ') || 'Chưa phân thôn'}`,
    });

    return newUser;
  }

  public updateOfficerUser(userId: string, updates: Partial<OfficerUser>): OfficerUser | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.userId === userId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.userId === userId) {
      this.setCurrentUser(users[index]);
    }

    this.addAuditLog({
      action: 'ADMIN_ACTION',
      entity: 'USERS',
      entityId: userId,
      details: `Cập nhật thông tin cán bộ: ${users[index].fullName}`,
    });

    return users[index];
  }

  public resetUserPasswordToDefault(userId: string): boolean {
    const users = this.getUsers();
    const passwords = this.getPasswords();
    const user = users.find((u) => u.userId === userId);
    if (!user) return false;

    passwords[user.username] = '1';
    user.mustChangePassword = true;

    this.saveUsers(users);
    this.savePasswords(passwords);

    this.addAuditLog({
      action: 'RESET_PASSWORD',
      entity: 'USERS',
      entityId: userId,
      details: `Reset mật khẩu tài khoản ${user.username} về mặc định ('1')`,
    });

    return true;
  }

  public deleteOfficerUser(userId: string): boolean {
    let users = this.getUsers();
    const user = users.find((u) => u.userId === userId);
    if (!user || user.username === 'admin') return false;

    users = users.filter((u) => u.userId !== userId);
    this.saveUsers(users);

    this.addAuditLog({
      action: 'ADMIN_ACTION',
      entity: 'USERS',
      entityId: userId,
      details: `Xóa tài khoản cán bộ: ${user.fullName} (${user.username})`,
    });

    return true;
  }

  // --- Cases Management ---
  public getCases(): CaseRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.CASES);
    return data ? JSON.parse(data) : [];
  }

  public saveCases(cases: CaseRecord[]) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }

  public getCaseById(caseId: string): CaseRecord | null {
    const cases = this.getCases();
    return cases.find((c) => c.caseId === caseId) || null;
  }

  public trackCase(caseId: string, trackingCode: string): CaseRecord | null {
    const cases = this.getCases();
    const trimmedId = caseId.trim().toUpperCase();
    const trimmedCode = trackingCode.trim().toUpperCase();

    const record = cases.find(
      (c) => c.caseId.toUpperCase() === trimmedId && c.publicTrackingCode.toUpperCase() === trimmedCode
    );

    if (record) {
      this.addAuditLog({
        userId: 'CITIZEN_PUBLIC',
        userName: 'Người dân tra cứu',
        userRole: 'CITIZEN',
        action: 'VIEW_CASE',
        entity: 'CASES',
        entityId: record.caseId,
        details: `Tra cứu thành công tình trạng hồ sơ ${record.caseId}`,
      });
    }

    return record || null;
  }

  public generateCaseId(): { caseId: string; trackingCode: string } {
    const year = new Date().getFullYear();
    const cases = this.getCases();
    const count = cases.length + 1;
    const padded = String(count).padStart(6, '0');
    const caseId = `DH-${year}-${padded}`;

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const trackingCode = `TK-${randomDigits}-${randomSuffix}`;

    return { caseId, trackingCode };
  }

  public calculateDeadline(category: CaseCategory, priority: PriorityLevel): string {
    const rules = this.getRules();
    const rule = rules.find((r) => r.category === category && r.priority === priority && r.active) ||
      rules.find((r) => r.category === category && r.active) || { deadlineDays: 7 };

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + (rule?.deadlineDays || 7));
    return deadlineDate.toISOString();
  }

  public submitCase(caseData: Omit<CaseRecord, 'caseId' | 'publicTrackingCode' | 'createdAt' | 'updatedAt' | 'status'>): CaseRecord {
    const { caseId, trackingCode } = this.generateCaseId();
    const now = new Date().toISOString();
    const deadline = this.calculateDeadline(caseData.category, caseData.priority);

    const newCase: CaseRecord = {
      ...caseData,
      caseId,
      publicTrackingCode: trackingCode,
      createdAt: now,
      updatedAt: now,
      status: 'NEW',
      deadline,
      attachments: caseData.attachments || [],
      internalNotes: [],
      citizenFeedbacks: [],
    };

    const cases = this.getCases();
    cases.unshift(newCase);
    this.saveCases(cases);

    // Add History
    this.addProcessHistory({
      caseId,
      action: 'Tiếp nhận hồ sơ mới từ Cổng thông tin',
      toStatus: 'NEW',
      performedBy: caseData.anonymous ? 'Người dân (Ẩn danh)' : (caseData.reporterName || 'Người dân'),
      performedAt: now,
      note: `Hồ sơ tiếp nhận tự động qua Web App. Đơn vị phụ trách: Công an xã Đức Hợp. Thôn: ${caseData.village}`,
    });

    // Send Notification simulation to email
    this.sendNotification({
      caseId,
      recipient: DUC_HOP_COMMUNE_INFO.notificationEmail,
      type: 'NEW_CASE',
      message: `[CÔNG AN XÃ ĐỨC HỢP] Hồ sơ mới: ${caseId} - Loại: ${caseData.category} - Thôn: ${caseData.village} - Mức độ: ${caseData.priority}`,
      createdAt: now,
      status: 'SENT',
      sentAt: now,
    });

    this.addAuditLog({
      userId: 'CITIZEN_SUBMIT',
      userName: caseData.anonymous ? 'Người dân (Ẩn danh)' : (caseData.reporterName || 'Người dân'),
      userRole: 'CITIZEN',
      action: 'CREATE_CASE',
      entity: 'CASES',
      entityId: caseId,
      details: `Gửi thành công hồ sơ ${caseId} (Mức độ: ${caseData.priority}, Thôn: ${caseData.village})`,
    });

    return newCase;
  }

  public updateCaseStatus(
    caseId: string,
    toStatus: CaseStatus,
    reason: string,
    note?: string
  ): { success: boolean; message: string; caseRecord?: CaseRecord } {
    const cases = this.getCases();
    const caseRecord = cases.find((c) => c.caseId === caseId);
    if (!caseRecord) {
      return { success: false, message: 'Không tìm thấy hồ sơ.' };
    }

    const currentUser = this.getCurrentUser();
    const fromStatus = caseRecord.status;

    // Check state machine validity
    const allowed = STATE_TRANSITIONS[fromStatus] || [];
    if (!allowed.includes(toStatus) && currentUser?.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: `Quy trình không cho phép chuyển trạng thái từ "${fromStatus}" sang "${toStatus}".`,
      };
    }

    caseRecord.status = toStatus;
    caseRecord.updatedAt = new Date().toISOString();
    if (toStatus === 'CLOSED' || toStatus === 'RESOLVED') {
      caseRecord.closedAt = new Date().toISOString();
    }

    this.saveCases(cases);

    const performerName = currentUser ? `${currentUser.rank} ${currentUser.fullName}` : 'Hệ thống';
    const performerRole = currentUser?.role || 'SYSTEM';

    this.addProcessHistory({
      caseId,
      action: `Chuyển trạng thái sang "${toStatus}"`,
      fromStatus,
      toStatus,
      performedBy: performerName,
      performedByRole: performerRole,
      performedAt: new Date().toISOString(),
      reason,
      note,
    });

    this.addAuditLog({
      action: 'CHANGE_STATUS',
      entity: 'CASES',
      entityId: caseId,
      details: `Chuyển trạng thái từ ${fromStatus} sang ${toStatus}. Lý do: ${reason}`,
    });

    return { success: true, message: 'Cập nhật trạng thái thành công.', caseRecord };
  }

  public assignCase(caseId: string, officerIds: string[], note?: string): boolean {
    const cases = this.getCases();
    const caseRecord = cases.find((c) => c.caseId === caseId);
    if (!caseRecord) return false;

    const users = this.getUsers();
    const assignedOfficers = users.filter((u) => officerIds.includes(u.userId));
    const assignedNames = assignedOfficers.map((o) => `${o.rank} ${o.fullName}`);

    caseRecord.assignedTo = officerIds;
    caseRecord.assignedOfficerNames = assignedNames;
    caseRecord.assignedAt = new Date().toISOString();
    caseRecord.updatedAt = new Date().toISOString();

    if (caseRecord.status === 'NEW' || caseRecord.status === 'RECEIVED' || caseRecord.status === 'CLASSIFIED') {
      caseRecord.status = 'ASSIGNED';
    }

    this.saveCases(cases);

    const currentUser = this.getCurrentUser();
    this.addProcessHistory({
      caseId,
      action: 'Phân công cán bộ xử lý',
      toStatus: caseRecord.status,
      performedBy: currentUser ? `${currentUser.rank} ${currentUser.fullName}` : 'Lãnh đạo CAX',
      performedByRole: currentUser?.role || 'LEADERSHIP',
      performedAt: new Date().toISOString(),
      note: `Giao cán bộ thụ lý: ${assignedNames.join(', ')}. ${note || ''}`,
    });

    this.addAuditLog({
      action: 'ASSIGN',
      entity: 'CASES',
      entityId: caseId,
      details: `Phân công hồ sơ cho: ${assignedNames.join(', ')}`,
    });

    return true;
  }

  public addInternalNote(caseId: string, note: string): boolean {
    const cases = this.getCases();
    const caseRecord = cases.find((c) => c.caseId === caseId);
    if (!caseRecord) return false;

    if (!caseRecord.internalNotes) caseRecord.internalNotes = [];
    const currentUser = this.getCurrentUser();
    const timeStr = new Date().toLocaleString('vi-VN');
    const author = currentUser ? `${currentUser.rank} ${currentUser.fullName}` : 'Cán bộ';
    caseRecord.internalNotes.push(`[${timeStr}] (${author}): ${note}`);
    caseRecord.updatedAt = new Date().toISOString();

    this.saveCases(cases);

    this.addAuditLog({
      action: 'UPDATE_CASE',
      entity: 'CASES',
      entityId: caseId,
      details: `Thêm ghi chú nghiệp vụ nội bộ`,
    });

    return true;
  }

  public addResolution(caseId: string, resolution: string): boolean {
    const cases = this.getCases();
    const caseRecord = cases.find((c) => c.caseId === caseId);
    if (!caseRecord) return false;

    caseRecord.resolution = resolution;
    caseRecord.updatedAt = new Date().toISOString();
    this.saveCases(cases);

    this.addAuditLog({
      action: 'UPDATE_CASE',
      entity: 'CASES',
      entityId: caseId,
      details: `Cập nhật báo cáo kết quả giải quyết vụ việc`,
    });

    return true;
  }

  public addCitizenFeedback(caseId: string, content: string): boolean {
    const cases = this.getCases();
    const caseRecord = cases.find((c) => c.caseId === caseId);
    if (!caseRecord) return false;

    if (!caseRecord.citizenFeedbacks) caseRecord.citizenFeedbacks = [];
    caseRecord.citizenFeedbacks.push({
      timestamp: new Date().toISOString(),
      content,
    });
    caseRecord.updatedAt = new Date().toISOString();

    // If case was WAITING_INFO, we can note it
    this.saveCases(cases);

    this.addProcessHistory({
      caseId,
      action: 'Người dân bổ sung thông tin',
      toStatus: caseRecord.status,
      performedBy: 'Người dân tra cứu',
      performedAt: new Date().toISOString(),
      note: `Nội dung bổ sung: ${content}`,
    });

    this.addAuditLog({
      action: 'UPDATE_CASE',
      entity: 'CASES',
      entityId: caseId,
      details: `Người dân bổ sung thông tin/tài liệu`,
    });

    return true;
  }

  public deleteCase(caseId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (currentUser?.role !== 'SUPER_ADMIN') return false;

    let cases = this.getCases();
    cases = cases.filter((c) => c.caseId !== caseId);
    this.saveCases(cases);

    this.addAuditLog({
      action: 'DELETE_CASE',
      entity: 'CASES',
      entityId: caseId,
      details: `SUPER_ADMIN xóa hoàn toàn hồ sơ ${caseId} khỏi hệ thống`,
    });

    return true;
  }

  // --- Process History ---
  public getProcessHistory(caseId?: string): ProcessHistoryItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!data) return [];
    try {
      const list: ProcessHistoryItem[] = JSON.parse(data);
      const seenIds = new Set<string>();
      let modified = false;
      const sanitized = list.map((item, idx) => {
        if (!item.historyId || seenIds.has(item.historyId)) {
          modified = true;
          const uniqueId = `HIST-${Date.now().toString().slice(-6)}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
          seenIds.add(uniqueId);
          return { ...item, historyId: uniqueId };
        }
        seenIds.add(item.historyId);
        return item;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(sanitized));
      }
      if (caseId) {
        return sanitized.filter((h) => h.caseId === caseId).reverse();
      }
      return sanitized.reverse();
    } catch {
      return [];
    }
  }

  public addProcessHistory(item: Omit<ProcessHistoryItem, 'historyId'>) {
    const list = this.getProcessHistory();
    const uniqueSalt = Math.random().toString(36).slice(2, 6);
    const newItem: ProcessHistoryItem = {
      ...item,
      historyId: `HIST-${Date.now().toString().slice(-6)}-${uniqueSalt}`,
    };
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLogItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!data) return [];
    try {
      const logs: AuditLogItem[] = JSON.parse(data);
      const seenIds = new Set<string>();
      let modified = false;
      const sanitized = logs.map((log, idx) => {
        if (!log.logId || seenIds.has(log.logId)) {
          modified = true;
          const uniqueId = `AUD-${Date.now().toString().slice(-6)}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
          seenIds.add(uniqueId);
          return { ...log, logId: uniqueId };
        }
        seenIds.add(log.logId);
        return log;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(sanitized));
      }
      return sanitized;
    } catch {
      return [];
    }
  }

  public addAuditLog(log: Partial<AuditLogItem>) {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const uniqueSalt = Math.random().toString(36).slice(2, 6);

    const newLog: AuditLogItem = {
      logId: log.logId || `AUD-${Date.now().toString().slice(-6)}-${uniqueSalt}`,
      timestamp: new Date().toISOString(),
      userId: log.userId || currentUser?.userId || 'SYSTEM',
      userName: log.userName || currentUser?.fullName || 'Hệ thống',
      userRole: log.userRole || currentUser?.role || 'SYSTEM',
      action: log.action || 'ADMIN_ACTION',
      entity: log.entity || 'SYSTEM',
      entityId: log.entityId || 'N/A',
      ipOrSession: log.ipOrSession || '127.0.0.1 (Web Browser)',
      details: log.details || '',
    };

    logs.unshift(newLog);
    // Keep max 500 logs locally
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs));
  }

  // --- Legal Rules ---
  public getRules(): LegalRule[] {
    const data = localStorage.getItem(STORAGE_KEYS.RULES);
    return data ? JSON.parse(data) : DEFAULT_LEGAL_RULES;
  }

  public saveRules(rules: LegalRule[]) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    this.addAuditLog({
      action: 'ADMIN_ACTION',
      entity: 'LEGAL_RULES',
      entityId: 'RULES-CONFIG',
      details: 'Cập nhật danh mục quy tắc thời hạn nghiệp vụ (Legal Rules)',
    });
  }

  // --- System Config ---
  public getConfig(): SystemConfig {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  }

  public saveConfig(config: SystemConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    this.addAuditLog({
      action: 'ADMIN_ACTION',
      entity: 'SYSTEM',
      entityId: 'SYS-CONFIG',
      details: 'Cập nhật cấu hình thông số hệ thống',
    });
  }

  // --- Aliases and helper methods ---
  public getAllCases(): CaseRecord[] {
    return this.getCases();
  }

  public getOfficers(): OfficerUser[] {
    return this.getUsers();
  }

  public createOfficer(officerData: Partial<OfficerUser>): OfficerUser {
    return this.createOfficerUser(officerData);
  }

  public deleteOfficer(userId: string): boolean {
    return this.deleteOfficerUser(userId);
  }

  public resetOfficerPassword(userId: string): boolean {
    return this.resetUserPasswordToDefault(userId);
  }

  public getAllowedNextStatuses(currentStatus: CaseStatus): CaseStatus[] {
    return (STATE_TRANSITIONS as Record<string, CaseStatus[]>)[currentStatus] || [];
  }

  public addPublicSupplement(caseId: string, content: string): boolean {
    const cases = this.getCases();
    const c = cases.find((x) => x.caseId === caseId);
    if (!c) return false;

    if (!c.citizenFeedbacks) c.citizenFeedbacks = [];
    c.citizenFeedbacks.push({
      timestamp: new Date().toISOString(),
      content: content.trim(),
    });

    if (c.status === 'WAITING_INFO') {
      c.status = 'PROCESSING';
    }
    c.updatedAt = new Date().toISOString();
    this.saveCases(cases);

    this.addAuditLog({
      userId: 'CITIZEN',
      userName: 'Người dân',
      userRole: 'CITIZEN',
      action: 'UPDATE_CASE',
      entity: 'CASES',
      entityId: caseId,
      details: 'Người dân bổ sung tài liệu, thông tin vụ việc',
    });

    return true;
  }

  public getStatistics() {
    const cases = this.getCases();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const total = cases.length;
    const today = cases.filter((c) => new Date(c.createdAt).getTime() >= oneDayAgo).length;
    const processing = cases.filter((c) => ['PROCESSING', 'VERIFYING', 'ASSIGNED', 'CLASSIFIED'].includes(c.status)).length;
    const resolved = cases.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
    const overdue = cases.filter((c) => {
      return (
        c.deadline &&
        new Date(c.deadline).getTime() < now &&
        !['RESOLVED', 'CLOSED', 'ARCHIVED', 'REJECTED'].includes(c.status)
      );
    }).length;
    const unassigned = cases.filter((c) => !c.assignedTo || c.assignedTo.length === 0).length;

    const byVillage: Record<string, number> = {};
    DUC_HOP_VILLAGES.forEach((v) => {
      byVillage[v] = cases.filter((c) => c.village === v).length;
    });

    const byCategory: Record<string, number> = {};
    cases.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    });

    return {
      total,
      today,
      processing,
      resolved,
      overdue,
      unassigned,
      byVillage,
      byCategory,
    };
  }

  public exportAuditLogsCsv(): string {
    const logs = this.getAuditLogs();
    let csv = 'Timestamp,Action,PerformedBy,TargetId,Details,IP\n';
    logs.forEach((l) => {
      const cleanDetails = (l.details || '').replace(/"/g, '""');
      const performed = l.performedByName || l.userName || 'Hệ thống';
      csv += `"${l.timestamp}","${l.action}","${performed}","${l.targetId || l.entityId || ''}","${cleanDetails}","${l.ipAddress || l.ipOrSession || ''}"\n`;
    });
    return csv;
  }

  public exportDatabaseJson(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      cases: this.getCases(),
      users: this.getUsers(),
      passwords: this.getPasswords(),
      auditLogs: this.getAuditLogs(),
      config: this.getConfig(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public importDatabaseJson(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.cases && Array.isArray(parsed.cases)) {
        this.saveCases(parsed.cases);
      }
      if (parsed.users && Array.isArray(parsed.users)) {
        this.saveUsers(parsed.users);
      }
      if (parsed.passwords) {
        this.savePasswords(parsed.passwords);
      }
      if (parsed.config) {
        this.saveConfig(parsed.config);
      }
      return { success: true, message: 'Phục hồi thành công' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Lỗi định dạng JSON' };
    }
  }

  // --- Notifications ---
  public getNotifications(): SystemNotification[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) return [];
    try {
      const list: SystemNotification[] = JSON.parse(data);
      const seenIds = new Set<string>();
      let modified = false;
      const sanitized = list.map((item, idx) => {
        if (!item.notificationId || seenIds.has(item.notificationId)) {
          modified = true;
          const uniqueId = `NOTIF-${Date.now().toString().slice(-6)}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
          seenIds.add(uniqueId);
          return { ...item, notificationId: uniqueId };
        }
        seenIds.add(item.notificationId);
        return item;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(sanitized));
      }
      return sanitized;
    } catch {
      return [];
    }
  }

  public sendNotification(notif: Omit<SystemNotification, 'notificationId'>) {
    const list = this.getNotifications();
    const uniqueSalt = Math.random().toString(36).slice(2, 6);
    const newNotif: SystemNotification = {
      ...notif,
      notificationId: `NOTIF-${Date.now().toString().slice(-6)}-${uniqueSalt}`,
    };
    list.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }
}

export const storageService = new StorageService();
