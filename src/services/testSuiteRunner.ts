import { storageService } from './storageService';
import { DUC_HOP_VILLAGES, DUC_HOP_COMMUNE_INFO } from '../constants/policeData';

export interface TestResultItem {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteReport {
  total: number;
  passed: number;
  failed: number;
  timestamp: string;
  results: TestResultItem[];
}

export function runInAppTestSuite(): TestSuiteReport {
  const results: TestResultItem[] = [];
  const startTime = performance.now();

  // Test 1: Kiểm tra địa giới 11 thôn
  const t1Start = performance.now();
  const villageCount = DUC_HOP_VILLAGES.length;
  const expectedVillages = [
    'Đức An', 'Đức Trung', 'Phú Ninh', 'Nho Lâm', 'Hạnh Lâm',
    'Vân Nghệ', 'Trung Hòa', 'Phú Cường', 'Quảng Lạc', 'Bắc Nam Phú', 'Tây Thịnh'
  ];
  const hasAllVillages = expectedVillages.every(v => DUC_HOP_VILLAGES.includes(v));
  results.push({
    name: 'Kiểm tra 11 thôn hành chính xã Đức Hợp',
    category: 'Cấu hình địa bàn',
    passed: villageCount === 11 && hasAllVillages,
    message: villageCount === 11 ? 'Đầy đủ chính xác 11 thôn theo địa giới hành chính mới' : `Thiếu thôn (${villageCount}/11)`,
    durationMs: Math.round(performance.now() - t1Start),
  });

  // Test 2: Kiểm tra thông tin trực ban và email thông báo
  const t2Start = performance.now();
  const hasEmail = DUC_HOP_COMMUNE_INFO.notificationEmail === 'conganxaduchopdangbai@gmail.com';
  const hasHotline = DUC_HOP_COMMUNE_INFO.hotlineDirect === '02213.815.999';
  results.push({
    name: 'Kiểm tra Email & Đường dây nóng Trực ban CAX',
    category: 'Thông tin liên hệ',
    passed: hasEmail && hasHotline,
    message: `Hotline: ${DUC_HOP_COMMUNE_INFO.hotlineDirect} | Email: ${DUC_HOP_COMMUNE_INFO.notificationEmail}`,
    durationMs: Math.round(performance.now() - t2Start),
  });

  // Test 3: Tạo hồ sơ tố giác tội phạm mới
  const t3Start = performance.now();
  const testCase = storageService.submitCase({
    category: 'CRIME_REPORT',
    priority: 'VERY_URGENT',
    incidentDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    incidentLocation: 'Khu vực gần Trụ sở UBND xã',
    village: 'Nho Lâm',
    description: '[TEST SUITE AUTOMATION] Kiểm thử chức năng tiếp nhận hồ sơ tự động từ hệ thống.',
    isOngoing: false,
    anonymous: true,
    source: 'WEB_CITIZEN',
    attachments: [],
  });
  const validCaseId = testCase.caseId.startsWith('DH-') && testCase.publicTrackingCode.startsWith('TK-');
  results.push({
    name: 'Sinh Mã hồ sơ & Mã tra cứu bảo mật',
    category: 'Tiếp nhận hồ sơ',
    passed: validCaseId && testCase.status === 'NEW',
    message: `Mã: ${testCase.caseId} | Mã tra cứu: ${testCase.publicTrackingCode} | Hạn: ${new Date(testCase.deadline || '').toLocaleDateString('vi-VN')}`,
    durationMs: Math.round(performance.now() - t3Start),
  });

  // Test 4: Tra cứu hồ sơ bảo mật
  const t4Start = performance.now();
  const trackedCase = storageService.trackCase(testCase.caseId, testCase.publicTrackingCode);
  results.push({
    name: 'Tra cứu hồ sơ theo Mã bảo mật',
    category: 'Tra cứu công dân',
    passed: trackedCase !== null && trackedCase.caseId === testCase.caseId,
    message: trackedCase ? `Tra cứu thành công, trạng thái: ${trackedCase.status}` : 'Không tìm thấy hồ sơ',
    durationMs: Math.round(performance.now() - t4Start),
  });

  // Test 5: Xác thực tài khoản Super Admin admin/admin@123
  const t5Start = performance.now();
  const adminAuth = storageService.login('admin', 'admin@123');
  results.push({
    name: 'Xác thực Super Admin (admin / admin@123)',
    category: 'Phân quyền & Xác thực',
    passed: adminAuth.success && adminAuth.user?.role === 'SUPER_ADMIN',
    message: adminAuth.success ? `Đăng nhập quyền: ${adminAuth.user?.role}` : adminAuth.message,
    durationMs: Math.round(performance.now() - t5Start),
  });

  // Test 6: Kiểm tra tài khoản cán bộ lần đầu bắt buộc đổi pass (Mặc định '1')
  const t6Start = performance.now();
  const officerAuth = storageService.login('Quang343001', '1');
  results.push({
    name: 'Đăng nhập cán bộ & Bắt buộc đổi mật khẩu lần đầu (Pass: 1)',
    category: 'Bảo mật cán bộ',
    passed: officerAuth.success && officerAuth.user?.mustChangePassword === true,
    message: officerAuth.success ? `Tài khoản: ${officerAuth.user?.username} (Bắt buộc đổi pass: ${officerAuth.user?.mustChangePassword})` : officerAuth.message,
    durationMs: Math.round(performance.now() - t6Start),
  });

  // Test 7: Phân công cán bộ xử lý hồ sơ
  const t7Start = performance.now();
  const assigned = storageService.assignCase(testCase.caseId, ['USR-OFFICER-002', 'USR-OFFICER-005'], 'Giao đồng chí Hài và Doanh phối hợp xác minh.');
  results.push({
    name: 'Phân công cán bộ & Cập nhật trạng thái ASSIGNED',
    category: 'Workflow & Nghiệp vụ',
    passed: assigned,
    message: assigned ? 'Phân công thành công nhiều cán bộ thụ lý' : 'Lỗi phân công',
    durationMs: Math.round(performance.now() - t7Start),
  });

  // Test 8: State Machine chuyển trạng thái
  const t8Start = performance.now();
  const stateRes = storageService.updateCaseStatus(testCase.caseId, 'PROCESSING', 'Tiến hành xác minh theo đúng quy trình nghiệp vụ');
  results.push({
    name: 'Chuyển trạng thái State Machine (ASSIGNED -> PROCESSING)',
    category: 'Workflow & Nghiệp vụ',
    passed: stateRes.success,
    message: stateRes.message,
    durationMs: Math.round(performance.now() - t8Start),
  });

  // Test 9: Ghi Audit Log an ninh
  const t9Start = performance.now();
  const logs = storageService.getAuditLogs();
  const hasLatestAudit = logs.length > 0;
  results.push({
    name: 'Ghi vết Nhật ký kiểm toán an ninh (Audit Log)',
    category: 'Audit & Bảo mật',
    passed: hasLatestAudit,
    message: `Tổng số bản ghi Audit hiện có: ${logs.length}`,
    durationMs: Math.round(performance.now() - t9Start),
  });

  // Dọn dẹp test case
  storageService.deleteCase(testCase.caseId);

  const passedCount = results.filter(r => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    timestamp: new Date().toLocaleString('vi-VN'),
    results,
  };
}
