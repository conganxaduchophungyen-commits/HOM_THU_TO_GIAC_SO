/**
 * Trình tạo và xuất toàn bộ mã nguồn Google Apps Script (GAS)
 * Hệ thống: HÒM THƯ TỐ GIÁC TỘI PHẠM SỐ - CÔNG AN XÃ ĐỨC HỢP, TỈNH HƯNG YÊN
 */

export interface GasFileItem {
  id?: string;
  name: string;
  fileName?: string;
  path?: string;
  type: 'gs' | 'html' | 'md' | 'json';
  description: string;
  category: 'Backend .gs' | 'Frontend .html' | 'Cấu hình & Tài liệu' | 'Triển khai';
  content: string;
}

export type GasSourceFile = {
  id: string;
  fileName: string;
  path: string;
  description: string;
  content: string;
  category: string;
};

export function getAllGasFiles(): GasSourceFile[] {
  return GAS_PROJECT_FILES.map((file, idx) => ({
    id: `gas-file-${idx + 1}`,
    fileName: file.name,
    path: `src/backend/${file.name}`,
    description: file.description,
    content: file.content,
    category: file.category,
  }));
}

export function getDeploymentMarkdownSummary(): string {
  const mdFile = GAS_PROJECT_FILES.find((f) => f.name === 'README.md');
  return mdFile ? mdFile.content : 'Hướng dẫn triển khai hệ thống';
}

export const GAS_PROJECT_FILES: GasFileItem[] = [
  {
    name: '01_Config.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Cấu hình hệ thống, thông tin Công an xã Đức Hợp, danh sách 11 thôn, hằng số và quyền hạn',
    content: `/**
 * 01_Config.gs - Cấu hình hệ thống Hòm thư tố giác tội phạm số
 * Đơn vị: CÔNG AN XÃ ĐỨC HỢP, TỈNH HƯNG YÊN
 */

var CONFIG = {
  UNIT_NAME: "CÔNG AN XÃ ĐỨC HỢP",
  PROVINCE: "CÔNG AN TỈNH HƯNG YÊN",
  ADDRESS: "Thôn Nho Lâm, xã Đức Hợp, tỉnh Hưng Yên",
  HOTLINE_DIRECT: "02213.815.999",
  NOTIFICATION_EMAIL: "conganxaduchopdangbai@gmail.com",
  APP_TITLE: "HÒM THƯ TỐ GIÁC TỘI PHẠM SỐ",
  
  // Danh sách 11 thôn hành chính thuộc xã Đức Hợp
  VILLAGES: [
    "Đức An", "Đức Trung", "Phú Ninh", "Nho Lâm", "Hạnh Lâm", 
    "Vân Nghệ", "Trung Hòa", "Phú Cường", "Quảng Lạc", "Bắc Nam Phú", "Tây Thịnh"
  ],
  
  // Tên các bảng tính trong Google Sheets Database
  SHEETS: {
    CASES: "CASES",
    USERS: "USERS",
    PROCESS_HISTORY: "PROCESS_HISTORY",
    LEGAL_RULES: "LEGAL_RULES",
    ATTACHMENTS: "ATTACHMENTS",
    AUDIT_LOG: "AUDIT_LOG",
    NOTIFICATIONS: "NOTIFICATIONS",
    SYSTEM_CONFIG: "SYSTEM_CONFIG"
  },
  
  // Thư mục gốc Google Drive lưu trữ hồ sơ
  DRIVE_ROOT_FOLDER: "HOM_THU_TO_GIAC_DUCHOP",
  MAX_FILE_SIZE_MB: 15,
  ALLOWED_MIME_TYPES: [
    "image/jpeg", "image/png", "image/webp", "image/heic",
    "video/mp4", "video/quicktime", "video/x-msvideo",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  
  // Phân quyền cán bộ
  ROLES: {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    LEADERSHIP: "LEADERSHIP",
    RECEPTION_OFFICER: "RECEPTION_OFFICER",
    PROCESSING_OFFICER: "PROCESSING_OFFICER",
    VIEW_ONLY: "VIEW_ONLY"
  }
};
`,
  },
  {
    name: '02_Database.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Tầng Repository kết nối Google Sheets, cơ chế Batch Read/Write, LockService và CacheService',
    content: `/**
 * 02_Database.gs - Tầng truy xuất dữ liệu Google Sheets
 * Sử dụng LockService chống xung đột ghi đồng thời và CacheService tối ưu hiệu năng
 */

function getSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty("SPREADSHEET_ID");
  if (!sheetId) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      props.setProperty("SPREADSHEET_ID", ss.getId());
      return ss;
    }
    throw new Error("Chưa cấu hình SPREADSHEET_ID trong Script Properties. Vui lòng chạy setupSystem() trước.");
  }
  return SpreadsheetApp.openById(sheetId);
}

function getSheetData(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var rows = data.slice(1);
  return rows.map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      obj[h] = row[i];
    });
    return obj;
  });
}

function appendSheetRow(sheetName, rowObj) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Không tìm thấy Sheet: " + sheetName);
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = headers.map(function(h) {
      return rowObj[h] !== undefined ? rowObj[h] : "";
    });
    
    sheet.appendRow(newRow);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function updateSheetRow(sheetName, keyField, keyValue, updatesObj) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Không tìm thấy Sheet: " + sheetName);
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var keyIndex = headers.indexOf(keyField);
    if (keyIndex === -1) throw new Error("Không tìm thấy cột khóa: " + keyField);
    
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][keyIndex]).trim() === String(keyValue).trim()) {
        for (var key in updatesObj) {
          var colIndex = headers.indexOf(key);
          if (colIndex !== -1) {
            sheet.getRange(r + 1, colIndex + 1).setValue(updatesObj[key]);
          }
        }
        return true;
      }
    }
    return false;
  } finally {
    lock.releaseLock();
  }
}
`,
  },
  {
    name: '03_Auth.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Xác thực tài khoản, phân quyền RBAC, hash mật khẩu, kiểm tra mật khẩu lần đầu',
    content: `/**
 * 03_Auth.gs - Dịch vụ Xác thực và Phân quyền cán bộ Công an xã
 */

function authenticateOfficer(username, password) {
  if (!username || !password) {
    return { success: false, message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." };
  }
  
  var users = getSheetData(CONFIG.SHEETS.USERS);
  var user = users.find(function(u) {
    return String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase();
  });
  
  if (!user) {
    return { success: false, message: "Tài khoản không tồn tại trên hệ thống Công an xã." };
  }
  
  if (user.status !== "ACTIVE") {
    return { success: false, message: "Tài khoản đang bị khóa hoặc ngừng hoạt động." };
  }
  
  // Xác thực mật khẩu
  var passHash = user.passwordHash || "1";
  var isMatch = (password === passHash) || (hashPassword(password) === passHash);
  if (!isMatch) {
    return { success: false, message: "Mật khẩu không chính xác. Vui lòng kiểm tra lại." };
  }
  
  // Tạo session token
  var token = Utilities.base64Encode(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    user.userId + "_" + new Date().getTime() + "_" + Math.random()
  ));
  
  var props = PropertiesService.getUserProperties();
  props.setProperty("AUTH_TOKEN_" + user.userId, token);
  
  // Cập nhật lastLoginAt
  updateSheetRow(CONFIG.SHEETS.USERS, "userId", user.userId, {
    lastLoginAt: new Date().toISOString()
  });
  
  logAudit({
    userId: user.userId,
    userName: user.fullName,
    userRole: user.role,
    action: "LOGIN",
    entity: "USERS",
    entityId: user.userId,
    details: "Đăng nhập hệ thống (" + user.role + ")"
  });
  
  return {
    success: true,
    data: {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      rank: user.rank,
      position: user.position,
      role: user.role,
      department: user.department,
      assignedVillages: user.assignedVillages ? user.assignedVillages.split(",") : [],
      mustChangePassword: Boolean(user.mustChangePassword === true || user.mustChangePassword === "TRUE" || password === "1"),
      token: token
    }
  };
}

function hashPassword(pass) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pass, Utilities.Charset.UTF_8);
  var txt = "";
  for (var i = 0; i < rawHash.length; i++) {
    var b = rawHash[i];
    if (b < 0) b += 256;
    var byteString = b.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    txt += byteString;
  }
  return txt;
}
`,
  },
  {
    name: '04_PublicAPI.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'API công khai tiếp nhận hồ sơ từ người dân, tra cứu tiến độ bảo mật (che thông tin nghiệp vụ)',
    content: `/**
 * 04_PublicAPI.gs - Cổng tiếp nhận tố giác và tra cứu hồ sơ người dân
 */

function submitCitizenCase(payload) {
  try {
    // 1. Validate payload
    if (!payload.category || !payload.description || !payload.village) {
      return { success: false, message: "Vui lòng cung cấp đầy đủ loại thông tin, nội dung và thôn xảy ra vụ việc." };
    }
    
    // 2. Sinh Case ID và Public Tracking Code
    var now = new Date();
    var year = now.getFullYear();
    var cases = getSheetData(CONFIG.SHEETS.CASES);
    var count = cases.length + 1;
    var padded = ("000000" + count).slice(-6);
    var caseId = "DH-" + year + "-" + padded;
    var trackingCode = "TK-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(100 + Math.random() * 900);
    
    // 3. Tính hạn xử lý dựa trên LEGAL_RULES
    var rules = getSheetData(CONFIG.SHEETS.LEGAL_RULES);
    var rule = rules.find(function(r) {
      return r.category === payload.category && r.priority === payload.priority && r.active === "TRUE";
    }) || { deadlineDays: 7 };
    
    var deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + Number(rule.deadlineDays || 7));
    
    // 4. Xử lý tải file lên Google Drive nếu có
    var folderId = "";
    if (payload.files && payload.files.length > 0) {
      folderId = createCaseDriveFolder(caseId);
      for (var f = 0; f < payload.files.length; f++) {
        var fileItem = payload.files[f];
        saveAttachmentToDrive(caseId, folderId, fileItem);
      }
    }
    
    // 5. Ghi vào bảng CASES
    var newCaseObj = {
      caseId: caseId,
      publicTrackingCode: trackingCode,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      category: payload.category,
      priority: payload.priority || "NORMAL",
      status: "NEW",
      incidentDate: payload.incidentDate || now.toISOString(),
      incidentLocation: payload.incidentLocation || "",
      village: payload.village,
      description: payload.description,
      suspectDescription: payload.suspectDescription || "",
      isOngoing: payload.isOngoing ? "TRUE" : "FALSE",
      latitude: payload.latitude || "",
      longitude: payload.longitude || "",
      anonymous: payload.anonymous ? "TRUE" : "FALSE",
      reporterName: payload.anonymous ? "" : (payload.reporterName || ""),
      reporterPhone: payload.anonymous ? "" : (payload.reporterPhone || ""),
      reporterEmail: payload.anonymous ? "" : (payload.reporterEmail || ""),
      assignedTo: "",
      deadline: deadlineDate.toISOString(),
      source: "WEB_CITIZEN",
      attachmentFolderId: folderId
    };
    
    appendSheetRow(CONFIG.SHEETS.CASES, newCaseObj);
    
    // 6. Ghi Process History
    appendSheetRow(CONFIG.SHEETS.PROCESS_HISTORY, {
      historyId: "HIST-" + now.getTime(),
      caseId: caseId,
      action: "Tiếp nhận tố giác mới từ Cổng Web App",
      fromStatus: "",
      toStatus: "NEW",
      performedBy: payload.anonymous ? "Người dân (Ẩn danh)" : (payload.reporterName || "Người dân"),
      performedAt: now.toISOString(),
      note: "Tiếp nhận tự động. Thôn: " + payload.village + ", Mức độ: " + payload.priority
    });
    
    // 7. Gửi thông báo Email đến trực ban Công an xã
    sendEmailNotification({
      recipient: CONFIG.NOTIFICATION_EMAIL,
      subject: "[CÔNG AN XÃ ĐỨC HỢP] Hồ sơ tố giác mới: " + caseId + " (" + payload.village + ")",
      body: "Kính gửi Ban Chỉ huy và Trực ban Công an xã Đức Hợp,\\n\\nHệ thống Hòm thư tố giác tội phạm số vừa tiếp nhận 01 tin báo/tố giác mới:\\n- Mã hồ sơ: " + caseId + "\\n- Địa bàn: Thôn " + payload.village + "\\n- Mức độ: " + payload.priority + "\\n- Nội dung tóm tắt: " + payload.description + "\\n\\nĐề nghị cán bộ trực ban truy cập Dashboard để tiếp nhận và phân công xử lý theo quy định."
    });
    
    return {
      success: true,
      data: {
        caseId: caseId,
        publicTrackingCode: trackingCode,
        createdAt: now.toISOString(),
        village: payload.village
      },
      message: "Thông tin của bạn đã được chuyển tới Công an xã Đức Hợp."
    };
  } catch (err) {
    return { success: false, message: "Lỗi tiếp nhận hồ sơ: " + err.message };
  }
}

function trackCitizenCase(caseId, trackingCode) {
  var cases = getSheetData(CONFIG.SHEETS.CASES);
  var record = cases.find(function(c) {
    return String(c.caseId).trim().toUpperCase() === String(caseId).trim().toUpperCase() &&
           String(c.publicTrackingCode).trim().toUpperCase() === String(trackingCode).trim().toUpperCase();
  });
  
  if (!record) {
    return { success: false, message: "Không tìm thấy hồ sơ. Vui lòng kiểm tra lại Mã hồ sơ và Mã tra cứu." };
  }
  
  // Masked: Chỉ trả về thông tin công khai, không để lộ tên cán bộ hoặc ghi chú nghiệp vụ
  return {
    success: true,
    data: {
      caseId: record.caseId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      category: record.category,
      village: record.village,
      status: record.status,
      resolution: record.status === "CLOSED" || record.status === "RESOLVED" ? record.resolution : "",
      allowFeedback: record.status === "WAITING_INFO"
    }
  };
}
`,
  },
  {
    name: '05_CaseService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Quản lý danh sách hồ sơ, chi tiết, bộ lọc đa tiêu chí và trích xuất dữ liệu nghiệp vụ',
    content: `/**
 * 05_CaseService.gs - Nghiệp vụ Quản lý hồ sơ dành cho Cán bộ & Lãnh đạo
 */

function getOfficerCases(filter) {
  var cases = getSheetData(CONFIG.SHEETS.CASES);
  
  if (!filter) return { success: true, data: cases };
  
  var filtered = cases.filter(function(c) {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.village && c.village !== filter.village) return false;
    if (filter.category && c.category !== filter.category) return false;
    if (filter.priority && c.priority !== filter.priority) return false;
    if (filter.assignedTo && (!c.assignedTo || c.assignedTo.indexOf(filter.assignedTo) === -1)) return false;
    if (filter.keyword) {
      var kw = filter.keyword.toLowerCase();
      var matchId = c.caseId && c.caseId.toLowerCase().indexOf(kw) !== -1;
      var matchDesc = c.description && c.description.toLowerCase().indexOf(kw) !== -1;
      var matchLoc = c.incidentLocation && c.incidentLocation.toLowerCase().indexOf(kw) !== -1;
      if (!matchId && !matchDesc && !matchLoc) return false;
    }
    return true;
  });
  
  return { success: true, data: filtered };
}

function getCaseDetail(caseId, currentUser) {
  var cases = getSheetData(CONFIG.SHEETS.CASES);
  var record = cases.find(function(c) { return c.caseId === caseId; });
  if (!record) return { success: false, message: "Không tìm thấy hồ sơ." };
  
  var histories = getSheetData(CONFIG.SHEETS.PROCESS_HISTORY).filter(function(h) {
    return h.caseId === caseId;
  });
  
  var attachments = getSheetData(CONFIG.SHEETS.ATTACHMENTS).filter(function(a) {
    return a.caseId === caseId;
  });
  
  // Ghi Audit
  logAudit({
    userId: currentUser ? currentUser.userId : "UNKNOWN",
    userName: currentUser ? currentUser.fullName : "Cán bộ",
    userRole: currentUser ? currentUser.role : "OFFICER",
    action: "VIEW_CASE",
    entity: "CASES",
    entityId: caseId,
    details: "Xem chi tiết hồ sơ " + caseId
  });
  
  return {
    success: true,
    data: {
      caseRecord: record,
      histories: histories,
      attachments: attachments
    }
  };
}
`,
  },
  {
    name: '06_WorkflowService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'State Machine quản lý luồng trạng thái hồ sơ, kiểm tra chuyển trạng thái hợp lệ',
    content: `/**
 * 06_WorkflowService.gs - State Machine & Quy trình xử lý tố giác
 */

var STATE_TRANSITIONS = {
  NEW: ["RECEIVED", "OUT_OF_SCOPE", "REJECTED"],
  RECEIVED: ["CLASSIFIED", "OUT_OF_SCOPE"],
  CLASSIFIED: ["ASSIGNED", "OUT_OF_SCOPE", "REJECTED"],
  ASSIGNED: ["PROCESSING", "TRANSFERRED", "CLASSIFIED"],
  PROCESSING: ["VERIFYING", "WAITING_INFO", "RESOLVED", "TRANSFERRED"],
  VERIFYING: ["PROCESSING", "RESOLVED", "WAITING_INFO"],
  WAITING_INFO: ["PROCESSING", "CANCELLED", "CLOSED"],
  TRANSFERRED: ["ASSIGNED", "PROCESSING", "RESOLVED"],
  RESOLVED: ["CLOSED", "PROCESSING"],
  OUT_OF_SCOPE: ["CLOSED"],
  REJECTED: ["CLOSED"],
  CANCELLED: ["CLOSED"],
  CLOSED: []
};

function updateCaseStatus(caseId, toStatus, reason, note, currentUser) {
  var cases = getSheetData(CONFIG.SHEETS.CASES);
  var record = cases.find(function(c) { return c.caseId === caseId; });
  if (!record) return { success: false, message: "Không tìm thấy hồ sơ." };
  
  var fromStatus = record.status;
  var allowed = STATE_TRANSITIONS[fromStatus] || [];
  
  if (allowed.indexOf(toStatus) === -1 && currentUser.role !== CONFIG.ROLES.SUPER_ADMIN) {
    return {
      success: false,
      message: "Quy trình không cho phép chuyển từ '" + fromStatus + "' sang '" + toStatus + "'."
    };
  }
  
  var now = new Date().toISOString();
  var updates = {
    status: toStatus,
    updatedAt: now
  };
  if (toStatus === "CLOSED" || toStatus === "RESOLVED") {
    updates.closedAt = now;
  }
  
  updateSheetRow(CONFIG.SHEETS.CASES, "caseId", caseId, updates);
  
  appendSheetRow(CONFIG.SHEETS.PROCESS_HISTORY, {
    historyId: "HIST-" + new Date().getTime(),
    caseId: caseId,
    action: "Chuyển trạng thái sang " + toStatus,
    fromStatus: fromStatus,
    toStatus: toStatus,
    performedBy: currentUser.rank + " " + currentUser.fullName,
    performedAt: now,
    reason: reason || "",
    note: note || ""
  });
  
  logAudit({
    userId: currentUser.userId,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: "CHANGE_STATUS",
    entity: "CASES",
    entityId: caseId,
    details: "Đổi trạng thái " + fromStatus + " -> " + toStatus + ". Lý do: " + reason
  });
  
  return { success: true, message: "Cập nhật trạng thái thành công." };
}
`,
  },
  {
    name: '07_AssignmentService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Phân công, điều chuyển cán bộ, bàn giao nhiều cán bộ và ghi nhận lịch sử phân công',
    content: `/**
 * 07_AssignmentService.gs - Phân công & Điều chuyển cán bộ thụ lý
 */

function assignOfficersToCase(caseId, officerUserIds, note, currentUser) {
  if (currentUser.role !== CONFIG.ROLES.LEADERSHIP && currentUser.role !== CONFIG.ROLES.SUPER_ADMIN && currentUser.role !== CONFIG.ROLES.ADMIN) {
    return { success: false, message: "Chỉ Lãnh đạo Công an xã mới có quyền phân công cán bộ thụ lý." };
  }
  
  var users = getSheetData(CONFIG.SHEETS.USERS);
  var assignedUsers = users.filter(function(u) {
    return officerUserIds.indexOf(u.userId) !== -1;
  });
  
  var assignedNames = assignedUsers.map(function(u) { return u.rank + " " + u.fullName; }).join(", ");
  var now = new Date().toISOString();
  
  updateSheetRow(CONFIG.SHEETS.CASES, "caseId", caseId, {
    assignedTo: officerUserIds.join(","),
    assignedAt: now,
    status: "ASSIGNED",
    updatedAt: now
  });
  
  appendSheetRow(CONFIG.SHEETS.PROCESS_HISTORY, {
    historyId: "HIST-" + new Date().getTime(),
    caseId: caseId,
    action: "Phân công cán bộ thụ lý",
    toStatus: "ASSIGNED",
    performedBy: currentUser.rank + " " + currentUser.fullName,
    performedAt: now,
    note: "Giao cán bộ: " + assignedNames + ". " + (note || "")
  });
  
  logAudit({
    userId: currentUser.userId,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: "ASSIGN",
    entity: "CASES",
    entityId: caseId,
    details: "Phân công hồ sơ cho: " + assignedNames
  });
  
  return { success: true, message: "Phân công cán bộ thành công." };
}
`,
  },
  {
    name: '08_NotificationService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Gửi thông báo email qua Gmail/MailApp, kiểm tra cảnh báo hạn xử lý tự động',
    content: `/**
 * 08_NotificationService.gs - Quản lý thông báo và Cảnh báo Quá hạn
 */

function sendEmailNotification(options) {
  try {
    MailApp.sendEmail({
      to: options.recipient || CONFIG.NOTIFICATION_EMAIL,
      subject: options.subject,
      body: options.body
    });
    
    appendSheetRow(CONFIG.SHEETS.NOTIFICATIONS, {
      notificationId: "NOTIF-" + new Date().getTime(),
      recipient: options.recipient || CONFIG.NOTIFICATION_EMAIL,
      type: "EMAIL",
      message: options.subject,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      status: "SENT"
    });
    return true;
  } catch (err) {
    Logger.log("Lỗi gửi email: " + err.message);
    return false;
  }
}

function checkDeadlinesDailyTrigger() {
  var cases = getSheetData(CONFIG.SHEETS.CASES);
  var now = new Date().getTime();
  var overdueCount = 0;
  var warningCount = 0;
  
  cases.forEach(function(c) {
    if (c.status === "CLOSED" || c.status === "RESOLVED") return;
    if (!c.deadline) return;
    
    var deadlineTime = new Date(c.deadline).getTime();
    var diffDays = (deadlineTime - now) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) {
      overdueCount++;
    } else if (diffDays <= 1) {
      warningCount++;
    }
  });
  
  if (overdueCount > 0 || warningCount > 0) {
    sendEmailNotification({
      recipient: CONFIG.NOTIFICATION_EMAIL,
      subject: "[CẢNH BÁO TIẾN ĐỘ] Công an xã Đức Hợp có " + overdueCount + " hồ sơ quá hạn, " + warningCount + " hồ sơ sắp đến hạn",
      body: "Kính gửi Ban Chỉ huy Công an xã Đức Hợp,\\n\\nHệ thống ghi nhận:\\n- Số hồ sơ quá hạn xử lý: " + overdueCount + "\\n- Số hồ sơ sắp đến hạn (dưới 24h): " + warningCount + "\\n\\nĐề nghị các đồng chí kiểm tra và đôn đốc xử lý dứt điểm."
    });
  }
}
`,
  },
  {
    name: '09_DashboardService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Tổng hợp thống kê KPI, biểu đồ 11 thôn, trạng thái, mức độ khẩn cấp và loại vụ việc',
    content: `/**
 * 09_DashboardService.gs - Thống kê Dashboard & Báo cáo số liệu
 */

function getDashboardStats() {
  var cases = getSheetData(CONFIG.SHEETS.CASES);
  var now = new Date();
  var todayStr = now.toISOString().split("T")[0];
  
  var stats = {
    total: cases.length,
    today: 0,
    processing: 0,
    resolved: 0,
    overdue: 0,
    urgent: 0,
    unassigned: 0,
    byVillage: {},
    byCategory: {},
    byStatus: {},
    byPriority: {}
  };
  
  // Khởi tạo 11 thôn
  CONFIG.VILLAGES.forEach(function(v) { stats.byVillage[v] = 0; });
  
  cases.forEach(function(c) {
    if (c.createdAt && c.createdAt.indexOf(todayStr) !== -1) stats.today++;
    if (c.status === "PROCESSING" || c.status === "VERIFYING") stats.processing++;
    if (c.status === "RESOLVED" || c.status === "CLOSED") stats.resolved++;
    if (!c.assignedTo || c.assignedTo === "") stats.unassigned++;
    if (c.priority === "URGENT" || c.priority === "VERY_URGENT") stats.urgent++;
    
    // Check overdue
    if (c.deadline && (c.status !== "CLOSED" && c.status !== "RESOLVED")) {
      if (new Date(c.deadline).getTime() < now.getTime()) {
        stats.overdue++;
      }
    }
    
    if (c.village) {
      stats.byVillage[c.village] = (stats.byVillage[c.village] || 0) + 1;
    }
    if (c.category) {
      stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
    }
    if (c.status) {
      stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
    }
    if (c.priority) {
      stats.byPriority[c.priority] = (stats.byPriority[c.priority] || 0) + 1;
    }
  });
  
  return { success: true, data: stats };
}
`,
  },
  {
    name: '10_AuditService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Nhật ký kiểm toán an toàn thông tin, ghi vết mọi hành vi và truy vết bảo mật',
    content: `/**
 * 10_AuditService.gs - Audit Trail & Nhật ký kiểm toán an ninh
 */

function logAudit(logData) {
  try {
    var now = new Date().toISOString();
    var logItem = {
      logId: "AUD-" + new Date().getTime(),
      timestamp: now,
      userId: logData.userId || "SYSTEM",
      action: logData.action || "ACTION",
      entity: logData.entity || "SYSTEM",
      entityId: logData.entityId || "N/A",
      ipOrSession: "GAS_SESSION",
      details: (logData.userName ? "[" + logData.userName + "] " : "") + (logData.details || "")
    };
    appendSheetRow(CONFIG.SHEETS.AUDIT_LOG, logItem);
    return true;
  } catch (err) {
    Logger.log("Lỗi ghi Audit Log: " + err.message);
    return false;
  }
}

function getAuditLogsList(limit) {
  var logs = getSheetData(CONFIG.SHEETS.AUDIT_LOG);
  if (limit && logs.length > limit) {
    return logs.slice(-limit).reverse();
  }
  return logs.reverse();
}
`,
  },
  {
    name: '11_SecurityService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Sanitize input, chống XSS, kiểm tra giới hạn kích thước file và định dạng cho phép',
    content: `/**
 * 11_SecurityService.gs - An toàn thông tin & Kiểm duyệt dữ liệu vào
 */

function sanitizeInput(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateUploadFile(fileName, mimeType, sizeBytes) {
  if (sizeBytes > CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, message: "Dung lượng file vượt quá giới hạn " + CONFIG.MAX_FILE_SIZE_MB + "MB." };
  }
  
  if (CONFIG.ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) {
    return { valid: false, message: "Định dạng file không được phép tải lên hệ thống." };
  }
  
  var dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".js", ".vbs", ".msi", ".jar", ".php", ".py"];
  var lowerName = fileName.toLowerCase();
  for (var i = 0; i < dangerousExtensions.length; i++) {
    if (lowerName.endsWith(dangerousExtensions[i])) {
      return { valid: false, message: "Tệp tin chứa phần mở rộng nguy hiểm bị cấm." };
    }
  }
  
  return { valid: true };
}
`,
  },
  {
    name: '12_Utils.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Hàm tiện ích tạo thư mục Google Drive, lưu file đính kèm và định dạng ngày giờ tiếng Việt',
    content: `/**
 * 12_Utils.gs - Tiện ích hệ thống & Tương tác Google Drive
 */

function createCaseDriveFolder(caseId) {
  var rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
  var root = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);
  
  var year = new Date().getFullYear().toString();
  var yearFolders = root.getFoldersByName(year);
  var yearFolder = yearFolders.hasNext() ? yearFolders.next() : root.createFolder(year);
  
  var caseFolder = yearFolder.createFolder(caseId);
  return caseFolder.getId();
}

function saveAttachmentToDrive(caseId, folderId, fileObj) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var bytes = Utilities.base64Decode(fileObj.base64Content);
    var blob = Utilities.newBlob(bytes, fileObj.mimeType, fileObj.fileName);
    var createdFile = folder.createFile(blob);
    
    appendSheetRow(CONFIG.SHEETS.ATTACHMENTS, {
      attachmentId: "ATT-" + new Date().getTime(),
      caseId: caseId,
      fileName: fileObj.fileName,
      mimeType: fileObj.mimeType,
      size: blob.getBytes().length,
      driveFileId: createdFile.getId(),
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Người dân cung cấp"
    });
    return createdFile.getId();
  } catch (err) {
    Logger.log("Lỗi lưu file: " + err.message);
    return "";
  }
}
`,
  },
  {
    name: '13_AdminService.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Quản lý tài khoản cán bộ, tạo cán bộ phụ trách nhiều thôn, reset mật khẩu, xóa hồ sơ (Super Admin)',
    content: `/**
 * 13_AdminService.gs - Quản trị Cán bộ, Thôn phụ trách & Cấu hình
 */

function createOfficerAccount(officerData, currentUser) {
  if (currentUser.role !== CONFIG.ROLES.SUPER_ADMIN && currentUser.role !== CONFIG.ROLES.ADMIN) {
    return { success: false, message: "Bạn không có quyền tạo tài khoản cán bộ." };
  }
  
  // Tạo username: [Tên viết tắt/đầu] + [Số hiệu CAND]
  var nameParts = (officerData.fullName || "").trim().split(" ");
  var lastName = nameParts[nameParts.length - 1] || "CB";
  var cleanBadge = (officerData.badgeNumber || "343000").replace(/[^a-zA-Z0-9]/g, "");
  var username = lastName + cleanBadge;
  
  var newUser = {
    userId: "USR-" + new Date().getTime(),
    username: username,
    passwordHash: "1", // Mật khẩu mặc định là 1
    fullName: officerData.fullName,
    badgeNumber: officerData.badgeNumber,
    rank: officerData.rank,
    position: officerData.position,
    role: officerData.role || "PROCESSING_OFFICER",
    phone: officerData.phone,
    email: officerData.email || (username.toLowerCase() + "@hungyen.gov.vn"),
    department: officerData.department || "Công an xã Đức Hợp",
    assignedVillages: (officerData.assignedVillages || []).join(","),
    status: "ACTIVE",
    mustChangePassword: "TRUE",
    createdAt: new Date().toISOString(),
    lastLoginAt: ""
  };
  
  appendSheetRow(CONFIG.SHEETS.USERS, newUser);
  
  logAudit({
    userId: currentUser.userId,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: "ADMIN_ACTION",
    entity: "USERS",
    entityId: newUser.userId,
    details: "Tạo tài khoản cán bộ mới: " + newUser.fullName + " (" + username + ")"
  });
  
  return { success: true, message: "Tạo tài khoản cán bộ thành công. Tên đăng nhập: " + username + ", Mật khẩu mặc định: 1", data: newUser };
}

function resetOfficerPassword(targetUserId, currentUser) {
  if (currentUser.role !== CONFIG.ROLES.SUPER_ADMIN && currentUser.role !== CONFIG.ROLES.ADMIN) {
    return { success: false, message: "Không đủ thẩm quyền đặt lại mật khẩu." };
  }
  
  updateSheetRow(CONFIG.SHEETS.USERS, "userId", targetUserId, {
    passwordHash: "1",
    mustChangePassword: "TRUE"
  });
  
  logAudit({
    userId: currentUser.userId,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: "RESET_PASSWORD",
    entity: "USERS",
    entityId: targetUserId,
    details: "Đặt lại mật khẩu tài khoản về mặc định ('1')"
  });
  
  return { success: true, message: "Đã đặt lại mật khẩu về mặc định là 1." };
}

function deleteCaseRecordPermanent(caseId, currentUser) {
  if (currentUser.role !== CONFIG.ROLES.SUPER_ADMIN) {
    return { success: false, message: "Chỉ tài khoản Quản trị cao nhất (admin) mới được xóa hồ sơ vụ việc." };
  }
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.CASES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === caseId) {
      sheet.deleteRow(i + 1);
      logAudit({
        userId: currentUser.userId,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: "DELETE_CASE",
        entity: "CASES",
        entityId: caseId,
        details: "SUPER_ADMIN xóa vĩnh viễn hồ sơ " + caseId
      });
      return { success: true, message: "Đã xóa hồ sơ thành công." };
    }
  }
  return { success: false, message: "Không tìm thấy hồ sơ cần xóa." };
}
`,
  },
  {
    name: '14_Setup.gs',
    type: 'gs',
    category: 'Triển khai',
    description: 'Script khởi tạo tự động toàn bộ 8 bảng Google Sheets, tài khoản admin, dữ liệu Công an xã Đức Hợp',
    content: `/**
 * 14_Setup.gs - Cài đặt tự động hệ thống (Idempotent Setup)
 * Chạy hàm setupSystem() từ Apps Script Editor để khởi tạo Spreadsheet & Drive
 */

function setupSystem() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.create("HOM_THU_TO_GIAC_DUCHOP_DATABASE");
  }
  
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", ss.getId());
  
  // Định nghĩa Schema 8 Sheet
  var schemas = {
    CASES: [
      "caseId", "publicTrackingCode", "createdAt", "updatedAt", "category",
      "priority", "status", "incidentDate", "incidentLocation", "village",
      "description", "suspectDescription", "isOngoing", "latitude", "longitude",
      "anonymous", "reporterName", "reporterPhone", "reporterEmail", "assignedTo",
      "assignedAt", "deadline", "closedAt", "resolution", "source", "attachmentFolderId"
    ],
    USERS: [
      "userId", "username", "passwordHash", "fullName", "badgeNumber", "rank",
      "position", "role", "phone", "email", "department", "assignedVillages",
      "status", "mustChangePassword", "createdAt", "lastLoginAt"
    ],
    PROCESS_HISTORY: [
      "historyId", "caseId", "action", "fromStatus", "toStatus",
      "performedBy", "performedAt", "reason", "note"
    ],
    LEGAL_RULES: [
      "ruleId", "category", "priority", "deadlineDays", "requiredActions", "description", "active"
    ],
    ATTACHMENTS: [
      "attachmentId", "caseId", "fileName", "mimeType", "size", "driveFileId", "uploadedAt", "uploadedBy"
    ],
    AUDIT_LOG: [
      "logId", "timestamp", "userId", "action", "entity", "entityId", "ipOrSession", "details"
    ],
    NOTIFICATIONS: [
      "notificationId", "caseId", "recipient", "type", "message", "createdAt", "sentAt", "status"
    ],
    SYSTEM_CONFIG: ["key", "value", "description"]
  };
  
  // Tạo từng Sheet và Header nếu chưa có
  for (var sheetName in schemas) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schemas[sheetName]);
      sheet.getRange(1, 1, 1, schemas[sheetName].length)
        .setBackground("#991b1b")
        .setFontColor("#ffffff")
        .setFontWeight("bold");
    }
  }
  
  // Xóa Sheet1 mặc định nếu rỗng
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính 1");
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  
  // Tạo tài khoản Super Admin mặc định: admin / admin@123
  var usersSheet = ss.getSheetByName("USERS");
  var usersData = usersSheet.getDataRange().getValues();
  var hasAdmin = usersData.some(function(row) { return row[1] === "admin"; });
  if (!hasAdmin) {
    usersSheet.appendRow([
      "USR-ADMIN-001", "admin", "admin@123", "Quản trị viên Hệ thống", "ADMIN-001",
      "Quản trị viên", "Quản trị hệ thống", "SUPER_ADMIN", "02213.815.999",
      "conganxaduchopdangbai@gmail.com", "Ban Quản trị", CONFIG.VILLAGES.join(","),
      "ACTIVE", "FALSE", new Date().toISOString(), ""
    ]);
  }
  
  // Tạo cán bộ chỉ huy Công an xã Đức Hợp
  var officers = [
    ["USR-001", "Quang343001", "1", "Đoàn Ngọc Quang", "343-001", "Thượng tá", "Trưởng Công an xã", "LEADERSHIP", "0983.892.222", "quang.doan@hungyen.gov.vn", "Chỉ huy CAX", "Nho Lâm,Đức An,Đức Trung", "ACTIVE", "TRUE", new Date().toISOString(), ""],
    ["USR-002", "Hai343002", "1", "Phạm Văn Hài", "343-002", "Thiếu tá", "Phó trưởng Công an xã", "LEADERSHIP", "0986.106.548", "hai.pham@hungyen.gov.vn", "Tổ PCTP", "Phú Ninh,Hạnh Lâm,Vân Nghệ", "ACTIVE", "TRUE", new Date().toISOString(), ""],
    ["USR-003", "Ngoc343003", "1", "Đặng Hồng Ngọc", "343-003", "Trung tá", "Phó trưởng Công an xã", "LEADERSHIP", "0944.061.666", "ngoc.dang@hungyen.gov.vn", "Tổ Tổng hợp", "Trung Hòa,Phú Cường", "ACTIVE", "TRUE", new Date().toISOString(), ""],
    ["USR-004", "Thu343004", "1", "Vũ Văn Thu", "343-004", "Trung tá", "Phó trưởng Công an xã", "LEADERSHIP", "0988.178.118", "thu.vu@hungyen.gov.vn", "Tổ CSTT", "Quảng Lạc,Bắc Nam Phú", "ACTIVE", "TRUE", new Date().toISOString(), ""],
    ["USR-005", "Doanh343005", "1", "Nguyễn Văn Doanh", "343-005", "Trung tá", "Cán bộ", "PROCESSING_OFFICER", "0987.668.867", "doanh.nguyen@hungyen.gov.vn", "Tổ CSKV", "Tây Thịnh,Đức An,Đức Trung,Phú Ninh", "ACTIVE", "TRUE", new Date().toISOString(), ""],
    ["USR-006", "Ngoan343006", "1", "Phạm Văn Ngoạn", "343-006", "Thiếu tá", "Cán bộ", "PROCESSING_OFFICER", "0987.827.336", "ngoan.pham@hungyen.gov.vn", "Tổ An ninh", CONFIG.VILLAGES.join(","), "ACTIVE", "TRUE", new Date().toISOString(), ""]
  ];
  
  officers.forEach(function(off) {
    var exists = usersData.some(function(row) { return row[1] === off[1]; });
    if (!exists) {
      usersSheet.appendRow(off);
    }
  });
  
  // Tạo thư mục Google Drive
  var rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
  if (!rootFolders.hasNext()) {
    DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);
  }
  
  // Tạo Trigger kiểm tra deadline hằng ngày lúc 07:00 sáng
  var triggers = ScriptApp.getProjectTriggers();
  var hasDeadlineTrigger = triggers.some(function(t) { return t.getHandlerFunction() === "checkDeadlinesDailyTrigger"; });
  if (!hasDeadlineTrigger) {
    ScriptApp.newTrigger("checkDeadlinesDailyTrigger")
      .timeBased()
      .everyDays(1)
      .atHour(7)
      .create();
  }
  
  return "Cài đặt hệ thống thành công! Spreadsheet ID: " + ss.getId();
}
`,
  },
  {
    name: '15_Test.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Bộ kiểm thử tự động Test Suite kiểm tra tiếp nhận, tạo Case ID, đổi trạng thái và phân quyền',
    content: `/**
 * 15_Test.gs - Bộ kiểm thử tự động (Automated Test Suite)
 */

function runAllTests() {
  var report = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };
  
  function assert(testName, condition, msg) {
    report.total++;
    if (condition) {
      report.passed++;
      report.details.push({ name: testName, status: "PASSED", note: msg || "OK" });
    } else {
      report.failed++;
      report.details.push({ name: testName, status: "FAILED", note: msg || "Lỗi assertion" });
    }
  }
  
  // Test 1: Kiểm tra cấu hình thôn
  assert("Kiểm tra 11 thôn xã Đức Hợp", CONFIG.VILLAGES.length === 11, "Đủ 11 thôn hành chính");
  
  // Test 2: Tạo hồ sơ tố giác
  var testPayload = {
    category: "CRIME_REPORT",
    priority: "URGENT",
    village: "Nho Lâm",
    description: "Test tự động tố giác tội phạm từ test suite",
    anonymous: true
  };
  var submitRes = submitCitizenCase(testPayload);
  assert("Tiếp nhận tố giác công dân", submitRes.success === true, "Sinh Case ID: " + (submitRes.data ? submitRes.data.caseId : ""));
  
  // Test 3: Tra cứu hồ sơ
  if (submitRes.success) {
    var trackRes = trackCitizenCase(submitRes.data.caseId, submitRes.data.publicTrackingCode);
    assert("Tra cứu hồ sơ bằng mã", trackRes.success === true, "Trạng thái: " + (trackRes.data ? trackRes.data.status : ""));
  }
  
  // Test 4: Đăng nhập Admin
  var authAdmin = authenticateOfficer("admin", "admin@123");
  assert("Đăng nhập Super Admin", authAdmin.success === true, "Role: " + (authAdmin.data ? authAdmin.data.role : ""));
  
  // Test 5: Đăng nhập Cán bộ với mật khẩu mặc định 1
  var authOfficer = authenticateOfficer("Quang343001", "1");
  assert("Đăng nhập Cán bộ lần đầu (Pass '1')", authOfficer.success === true && authOfficer.data.mustChangePassword === true, "Yêu cầu đổi pass lần đầu");
  
  return report;
}
`,
  },
  {
    name: 'Code.gs',
    type: 'gs',
    category: 'Backend .gs',
    description: 'Điểm vào chính Web App (doGet, doPost), điều hướng trang và xử lý Ajax router',
    content: `/**
 * Code.gs - Router chính cho Google Apps Script Web App
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile("index");
  return template.evaluate()
    .setTitle("Hòm Thư Tố Giác Tội Phạm Số - Công An Xã Đức Hợp")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
`,
  },
  {
    name: 'index.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Khung giao diện chính (Shell), Header Công an xã Đức Hợp, Thanh khẩn cấp, Footer và điều hướng tab',
    content: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hòm Thư Tố Giác Tội Phạm Số - Công An Xã Đức Hợp</title>
  <!-- Nhúng Stylesheet và Tailwind CSS -->
  <?!= include('styles'); ?>
</head>
<body class="bg-[#F4F4F4] text-[#1a1a1a] min-h-screen flex flex-col font-sans">
  <!-- 1. Header Công Quyền -->
  <header class="bg-[#8B0000] text-white border-b-4 border-[#FFD700] shadow-md">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
      <div class="flex items-center space-x-3 cursor-pointer" onclick="switchView('citizen')">
        <div class="w-11 h-11 rounded-full bg-white border-2 border-[#FFD700] flex items-center justify-center font-black text-[#8B0000] text-sm shadow-inner">
          ★ CA ★
        </div>
        <div>
          <h1 class="text-base md:text-lg font-black tracking-wide uppercase leading-tight text-white">
            CÔNG AN XÃ ĐỨC HỢP
          </h1>
          <p class="text-xs text-[#FFD700] font-semibold tracking-wider uppercase">
            CÔNG AN TỈNH HƯNG YÊN • HÒM THƯ TỐ GIÁC TỘI PHẠM SỐ
          </p>
        </div>
      </div>

      <!-- Navigation Tabs & User Status -->
      <div class="flex items-center gap-2">
        <button id="nav-btn-citizen" onclick="switchView('citizen')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors bg-white/20 text-white border border-white/30">
          📝 Gửi Tố Giác
        </button>
        <button id="nav-btn-track" onclick="switchView('track')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors bg-black/20 hover:bg-white/10 text-white">
          🔍 Tra Cứu Tiến Độ
        </button>
        <button id="nav-btn-officer" onclick="handleOfficerNavClick()" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors bg-[#FFD700] text-[#8B0000] shadow hover:bg-amber-300">
          🔒 Cán Bộ Trực Ban
        </button>
      </div>
    </div>
  </header>

  <!-- 2. Thanh Thông Báo Khẩn Cấp / Hotline Trực Ban -->
  <div class="bg-[#FFFDE7] border-y border-amber-300 px-4 py-2 text-xs text-amber-950 font-medium shadow-sm">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-[#8B0000] text-white font-black text-[10px] uppercase">Trực ban 24/7</span>
        <span>Hotline Công an xã Đức Hợp: <strong class="text-[#8B0000] font-mono text-sm">02213.815.999</strong> | Địa chỉ: Thôn Nho Lâm, xã Đức Hợp</span>
      </div>
      <div class="flex items-center gap-3 text-[11px]">
        <span>Cảnh sát 113</span> • <span>Cứu hỏa 114</span> • <span>Cấp cứu 115</span>
      </div>
    </div>
  </div>

  <!-- 3. Main Container cho các View -->
  <main class="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
    <!-- View: Gửi Tố Giác -->
    <section id="view-citizen" class="view-panel">
      <?!= include('citizen'); ?>
    </section>

    <!-- View: Tra Cứu -->
    <section id="view-track" class="view-panel hidden">
      <?!= include('track'); ?>
    </section>

    <!-- View: Đăng Nhập Cán Bộ -->
    <section id="view-login" class="view-panel hidden">
      <?!= include('login'); ?>
    </section>

    <!-- View: Bảng Điều Khiển Cán Bộ -->
    <section id="view-dashboard" class="view-panel hidden">
      <?!= include('dashboard'); ?>
    </section>

    <!-- View: Quản Trị Cán Bộ & Hệ Thống -->
    <section id="view-admin" class="view-panel hidden">
      <?!= include('admin'); ?>
    </section>
  </main>

  <!-- Modal Chi Tiết Hồ Sơ -->
  <?!= include('case-detail'); ?>

  <!-- Toast Notification System -->
  <div id="toast-container" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"></div>

  <!-- 4. Footer Đơn Vị -->
  <footer class="bg-[#2d3748] text-gray-300 border-t-4 border-[#FFD700] pt-8 pb-6 text-xs mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div>
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-7 h-7 rounded bg-[#8B0000] border border-[#FFD700] flex items-center justify-center font-bold text-white text-xs">CA</div>
            <h4 class="font-black text-white text-xs uppercase">CÔNG AN XÃ ĐỨC HỢP</h4>
          </div>
          <p class="text-gray-400 text-[11px] leading-relaxed">
            Hệ thống tiếp nhận, xử lý tin báo, tố giác tội phạm và phản ánh an ninh trật tự trực tuyến 24/7 trên địa bàn 11 thôn.
          </p>
          <div class="mt-2 text-emerald-400 font-semibold text-[11px]">
            🛡️ Bảo mật danh tính người cung cấp thông tin tuyệt đối
          </div>
        </div>

        <div>
          <h4 class="font-bold text-[#FFD700] text-xs uppercase border-b border-gray-600 pb-1 mb-2">Ban Chỉ Huy CAX</h4>
          <ul class="space-y-1 text-[11px]">
            <li><strong class="text-white">Thượng tá Đoàn Ngọc Quang</strong> - Trưởng CAX (0983.892.222)</li>
            <li><strong class="text-white">Thiếu tá Phạm Văn Hài</strong> - Phó CAX PCTP (0986.106.548)</li>
            <li><strong class="text-white">Trung tá Đặng Hồng Ngọc</strong> - Phó CAX Tổng hợp (0944.061.666)</li>
            <li><strong class="text-white">Trung tá Vũ Văn Thu</strong> - Phó CAX CSTT (0988.178.118)</li>
          </ul>
        </div>

        <div>
          <h4 class="font-bold text-[#FFD700] text-xs uppercase border-b border-gray-600 pb-1 mb-2">Địa Bàn 11 Thôn</h4>
          <div class="grid grid-cols-2 gap-1 text-[11px]">
            <span>• Thôn Đức An</span><span>• Thôn Đức Trung</span>
            <span>• Thôn Phú Ninh</span><span>• Thôn Nho Lâm</span>
            <span>• Thôn Hạnh Lâm</span><span>• Thôn Vân Nghệ</span>
            <span>• Thôn Trung Hòa</span><span>• Thôn Phú Cường</span>
            <span>• Thôn Quảng Lạc</span><span>• Thôn Bắc Nam Phú</span>
            <span>• Thôn Tây Thịnh</span>
          </div>
        </div>

        <div>
          <h4 class="font-bold text-[#FFD700] text-xs uppercase border-b border-gray-600 pb-1 mb-2">Trụ Sở & Liên Hệ</h4>
          <p class="text-[11px] text-gray-300">📍 Thôn Nho Lâm, xã Đức Hợp, tỉnh Hưng Yên</p>
          <p class="text-[11px] text-[#FFD700] font-mono font-bold mt-1">📞 Trực ban: 02213.815.999 (24/7)</p>
          <p class="text-[11px] text-cyan-300 mt-1">✉️ conganxaduchopdangbai@gmail.com</p>
        </div>
      </div>
      <div class="border-t border-gray-700 pt-3 text-center text-gray-400 text-[11px]">
        © <?= new Date().getFullYear() ?> CÔNG AN XÃ ĐỨC HỢP - CÔNG AN TỈNH HƯNG YÊN.
      </div>
    </div>
  </footer>

  <!-- Nhúng Script Client-side -->
  <?!= include('javascript'); ?>
</body>
</html>
`,
  },
  {
    name: 'styles.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Bảng mã CSS, Tailwind CDN, màu sắc công quyền (#8B0000, #FFD700) và kiểu in ấn',
    content: `<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          police: {
            red: '#8B0000',
            darkred: '#700000',
            gold: '#FFD700',
            amber: '#D97706',
            graybg: '#F4F4F4',
            slate: '#2d3748'
          }
        }
      }
    }
  }
</script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .view-panel {
    transition: opacity 0.2s ease-in-out;
  }
  @media print {
    header, footer, .no-print, button {
      display: none !important;
    }
    body {
      background: white !important;
      color: black !important;
    }
    .print-only {
      display: block !important;
    }
  }
</style>
`,
  },
  {
    name: 'citizen.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Giao diện form gửi tố giác, phản ánh tội phạm, chọn 11 thôn, GPS, đính kèm file, ẩn danh',
    content: `<div class="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
  <!-- Card Header -->
  <div class="bg-[#8B0000] text-white px-6 py-4 border-b-2 border-[#FFD700]">
    <h2 class="text-base md:text-lg font-black uppercase tracking-wide flex items-center gap-2">
      <span>🛡️</span> GỬI TIN BÁO, TỐ GIÁC TỘI PHẠM & PHẢN ÁNH AN NINH TRẬT TỰ
    </h2>
    <p class="text-xs text-amber-200 mt-1">
      Công an xã Đức Hợp cam kết bảo mật 100% danh tính người cung cấp thông tin.
    </p>
  </div>

  <form id="citizen-form" onsubmit="submitCitizenForm(event)" class="p-6 space-y-6">
    <!-- 1. Loại thông tin & Mức độ khẩn cấp -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-black uppercase text-gray-700 mb-1.5">
          Loại thông tin tố giác / phản ánh <span class="text-red-600">*</span>
        </label>
        <select id="c-category" required class="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent">
          <option value="">-- Chọn danh mục tố giác --</option>
          <option value="CRIME_REPORT">Tố giác tội phạm (Trộm cắp, cướp giật, ma túy, đánh bạc...)</option>
          <option value="ORDER_SECURITY">Phản ánh an ninh trật tự (Gây rối trật tự công cộng, karaoke quá giờ...)</option>
          <option value="TRAFFIC_VIOLATION">Vi phạm giao thông (Lạng lách, xe quá tải, tai nạn...)</option>
          <option value="FIRE_SAFETY">Phòng cháy chữa cháy & Cứu nạn cứu hộ</option>
          <option value="ADMIN_COMPLAINT">Thủ tục hành chính & Phản ánh cán bộ</option>
          <option value="OTHER">Vấn đề khác</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-black uppercase text-gray-700 mb-1.5">
          Mức độ khẩn cấp <span class="text-red-600">*</span>
        </label>
        <select id="c-priority" required class="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent">
          <option value="NORMAL">Bình thường (Xử lý theo quy trình thông thường)</option>
          <option value="URGENT">Khẩn cấp (Cần kiểm tra xác minh ngay)</option>
          <option value="VERY_URGENT">Đặc biệt khẩn cấp (Đang diễn ra / Nguy hiểm tính mạng)</option>
        </select>
      </div>
    </div>

    <!-- 2. Địa bàn xảy ra vụ việc (11 Thôn) & Tọa độ GPS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-xs font-black uppercase text-gray-700 mb-1.5">
          Thôn xảy ra vụ việc <span class="text-red-600">*</span>
        </label>
        <select id="c-village" required class="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent">
          <option value="">-- Chọn 1 trong 11 thôn --</option>
          <option value="Đức An">Thôn Đức An</option>
          <option value="Đức Trung">Thôn Đức Trung</option>
          <option value="Phú Ninh">Thôn Phú Ninh</option>
          <option value="Nho Lâm">Thôn Nho Lâm</option>
          <option value="Hạnh Lâm">Thôn Hạnh Lâm</option>
          <option value="Vân Nghệ">Thôn Vân Nghệ</option>
          <option value="Trung Hòa">Thôn Trung Hòa</option>
          <option value="Phú Cường">Thôn Phú Cường</option>
          <option value="Quảng Lạc">Thôn Quảng Lạc</option>
          <option value="Bắc Nam Phú">Thôn Bắc Nam Phú</option>
          <option value="Tây Thịnh">Thôn Tây Thịnh</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-black uppercase text-gray-700 mb-1.5">
          Địa điểm cụ thể / Mốc nhận biết
        </label>
        <div class="flex gap-2">
          <input type="text" id="c-location" placeholder="Ví dụ: Gần cổng đình, ngã tư Nho Lâm, khu vực bờ đê..." class="flex-1 text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent">
          <button type="button" onclick="getCurrentGPS()" class="px-3 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-gray-300 flex items-center gap-1.5 whitespace-nowrap">
            <span>📍</span> Lấy vị trí GPS
          </button>
        </div>
        <input type="hidden" id="c-lat"><input type="hidden" id="c-lng">
        <p id="gps-status" class="text-[10px] text-gray-500 mt-1"></p>
      </div>
    </div>

    <!-- 3. Nội dung mô tả chi tiết vụ việc -->
    <div>
      <label class="block text-xs font-black uppercase text-gray-700 mb-1.5">
        Nội dung chi tiết vụ việc <span class="text-red-600">*</span>
      </label>
      <textarea id="c-description" rows="4" required placeholder="Mô tả cụ thể diễn biến, thời gian, phương thức, thủ đoạn, tài sản thiệt hại (nếu có)..." class="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"></textarea>
    </div>

    <!-- 4. Nhận dạng đối tượng (Nếu có) -->
    <div>
      <label class="block text-xs font-black uppercase text-gray-700 mb-1.5">
        Đặc điểm nhận dạng đối tượng / Phương tiện liên quan (Nếu có)
      </label>
      <input type="text" id="c-suspect" placeholder="Độ tuổi ước tính, chiều cao, quần áo, biển số xe, loại phương tiện, hướng bỏ chạy..." class="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent">
    </div>

    <!-- 5. Đính kèm file bằng chứng (Hình ảnh, Video, Tài liệu) -->
    <div>
      <label class="block text-xs font-black uppercase text-gray-700 mb-1.5">
        Tài liệu / Hình ảnh / Video bằng chứng đính kèm (Tùy chọn)
      </label>
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
        <input type="file" id="c-files" multiple accept="image/*,video/*,application/pdf" onchange="handleFileSelect(event)" class="hidden">
        <label for="c-files" class="cursor-pointer flex flex-col items-center">
          <span class="text-2xl mb-1">📁</span>
          <span class="text-xs font-bold text-[#8B0000]">Nhấn để chọn ảnh, video hoặc kéo thả tài liệu vào đây</span>
          <span class="text-[11px] text-gray-500 mt-0.5">Hỗ trợ JPG, PNG, MP4, PDF (Tối đa 15MB/file)</span>
        </label>
      </div>
      <div id="file-preview-list" class="mt-2 space-y-1"></div>
    </div>

    <!-- 6. Lựa chọn Ẩn danh & Thông tin người phản ánh -->
    <div class="p-4 rounded-lg bg-gray-50 border border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-black uppercase text-gray-800 flex items-center gap-2">
          <span>🔒</span> Chế độ cung cấp thông tin
        </label>
        <div class="flex items-center gap-2">
          <input type="checkbox" id="c-anonymous" onchange="toggleAnonymousMode(this.checked)" class="w-4 h-4 text-[#8B0000] rounded focus:ring-[#8B0000]" checked>
          <label for="c-anonymous" class="text-xs font-bold text-gray-700 cursor-pointer">Gửi ẩn danh hoàn toàn</label>
        </div>
      </div>

      <div id="reporter-fields" class="grid grid-cols-1 sm:grid-cols-3 gap-3 hidden pt-2 border-t border-gray-200">
        <div>
          <label class="block text-[11px] font-bold text-gray-600 mb-1">Họ và tên</label>
          <input type="text" id="c-rep-name" class="w-full text-xs px-3 py-2 rounded-lg border border-gray-300">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-gray-600 mb-1">Số điện thoại liên hệ</label>
          <input type="tel" id="c-rep-phone" class="w-full text-xs px-3 py-2 rounded-lg border border-gray-300">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-gray-600 mb-1">Email (Nhận kết quả)</label>
          <input type="email" id="c-rep-email" class="w-full text-xs px-3 py-2 rounded-lg border border-gray-300">
        </div>
      </div>
    </div>

    <!-- Submit Button & Disclaimer -->
    <div class="pt-2">
      <button type="submit" id="submit-case-btn" class="w-full py-3.5 px-6 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <span>🚀</span> GỬI TIN BÁO TỚI CÔNG AN XÃ ĐỨC HỢP
      </button>
      <p class="text-center text-[10px] text-gray-500 mt-2">
        * Người cung cấp thông tin hoàn toàn chịu trách nhiệm trước pháp luật về tính trung thực của tin báo theo quy định.
      </p>
    </div>
  </form>

  <!-- Kết quả nộp hồ sơ thành công (Receipt Modal/Panel) -->
  <div id="submit-success-panel" class="hidden p-6 bg-emerald-50 border-t-2 border-emerald-500">
    <div class="text-center max-w-lg mx-auto space-y-3">
      <div class="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl mx-auto shadow-md">✓</div>
      <h3 class="text-lg font-black text-emerald-950 uppercase">TIẾP NHẬN HỒ SƠ THÀNH CÔNG!</h3>
      <p class="text-xs text-emerald-800">
        Thông tin tố giác của bạn đã được chuyển thẳng tới Trực ban Công an xã Đức Hợp.
      </p>
      
      <div class="bg-white p-4 rounded-xl border border-emerald-200 text-left font-mono text-xs space-y-1.5 shadow-sm">
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">MÃ HỒ SƠ:</span>
          <strong id="res-case-id" class="text-[#8B0000] text-sm">--</strong>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">MÃ TRA CỨU TIẾN ĐỘ:</span>
          <strong id="res-tracking-code" class="text-emerald-700 text-sm">--</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">THỜI GIAN TIẾP NHẬN:</span>
          <span id="res-created-at" class="text-gray-700">--</span>
        </div>
      </div>

      <div class="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 text-left">
        <strong>Lưu ý quan trọng:</strong> Vui lòng chụp màn hình hoặc lưu lại <strong>Mã hồ sơ</strong> và <strong>Mã tra cứu</strong> ở trên để theo dõi kết quả xử lý.
      </div>

      <div class="flex gap-2 justify-center pt-2">
        <button onclick="window.print()" class="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold">🖨️ In Biên Nhận</button>
        <button onclick="copyTrackingInfo()" class="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold">📋 Sao Chép Mã</button>
        <button onclick="resetCitizenForm()" class="px-4 py-2 bg-white text-gray-800 border rounded-lg text-xs font-bold">Gửi Tin Khác</button>
      </div>
    </div>
  </div>
</div>
`,
  },
  {
    name: 'track.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Giao diện tra cứu tiến độ hồ sơ cho người dân bằng Mã hồ sơ + Mã tra cứu bảo mật',
    content: `<div class="max-w-3xl mx-auto space-y-6">
  <!-- Search Card -->
  <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6">
    <div class="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
      <div class="w-10 h-10 rounded-lg bg-[#8B0000] text-[#FFD700] flex items-center justify-center font-bold text-lg">🔍</div>
      <div>
        <h2 class="text-base font-black uppercase text-[#8B0000]">TRA CỨU TIẾN ĐỘ XỬ LÝ HỒ SƠ</h2>
        <p class="text-xs text-gray-500">Nhập Mã hồ sơ và Mã tra cứu bí mật đã được cấp khi gửi tin báo</p>
      </div>
    </div>

    <form onsubmit="handleTrackSubmit(event)" class="grid grid-cols-1 sm:grid-cols-5 gap-3">
      <div class="sm:col-span-2">
        <label class="block text-[11px] font-bold uppercase text-gray-700 mb-1">Mã hồ sơ</label>
        <input type="text" id="track-case-id" required placeholder="Ví dụ: DH-2026-000001" class="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-gray-300 uppercase focus:ring-2 focus:ring-[#8B0000]">
      </div>
      <div class="sm:col-span-2">
        <label class="block text-[11px] font-bold uppercase text-gray-700 mb-1">Mã tra cứu</label>
        <input type="text" id="track-code" required placeholder="Ví dụ: TK-1234-567" class="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-gray-300 uppercase focus:ring-2 focus:ring-[#8B0000]">
      </div>
      <div class="sm:col-span-1 flex items-end">
        <button type="submit" id="track-btn" class="w-full py-2.5 px-3 bg-[#8B0000] hover:bg-[#700000] text-white font-bold text-xs rounded-lg uppercase shadow">
          Tra cứu
        </button>
      </div>
    </form>
  </div>

  <!-- Result Card (Hidden by default) -->
  <div id="track-result-card" class="hidden bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
    <div class="bg-gray-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
      <span class="text-xs font-bold text-gray-700">KẾT QUẢ TRA CỨU HỒ SƠ: <strong id="t-case-id" class="text-[#8B0000] font-mono">--</strong></span>
      <span id="t-status-badge" class="px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-blue-100 text-blue-800">--</span>
    </div>

    <div class="p-6 space-y-6">
      <!-- 4-step Timeline -->
      <div>
        <h4 class="text-xs font-bold uppercase text-gray-600 mb-3">TIẾN TRÌNH XỬ LÝ CỦA CÔNG AN XÃ:</h4>
        <div class="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
          <div id="step-1" class="p-2 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
            <div class="text-base mb-0.5">📥</div> 1. Tiếp nhận
          </div>
          <div id="step-2" class="p-2 rounded-lg bg-gray-100 text-gray-500 border">
            <div class="text-base mb-0.5">📋</div> 2. Phân loại
          </div>
          <div id="step-3" class="p-2 rounded-lg bg-gray-100 text-gray-500 border">
            <div class="text-base mb-0.5">🔍</div> 3. Xác minh
          </div>
          <div id="step-4" class="p-2 rounded-lg bg-gray-100 text-gray-500 border">
            <div class="text-base mb-0.5">🏁</div> 4. Kết quả
          </div>
        </div>
      </div>

      <!-- Info Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div><span class="text-gray-500">Địa bàn thôn:</span> <strong id="t-village" class="text-gray-900">--</strong></div>
        <div><span class="text-gray-500">Loại thông tin:</span> <strong id="t-category" class="text-gray-900">--</strong></div>
        <div><span class="text-gray-500">Ngày gửi:</span> <span id="t-created-at" class="text-gray-800 font-mono">--</span></div>
        <div><span class="text-gray-500">Cập nhật lần cuối:</span> <span id="t-updated-at" class="text-gray-800 font-mono">--</span></div>
      </div>

      <!-- Resolution / Feedback -->
      <div id="t-resolution-box" class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
        <h5 class="font-bold uppercase text-blue-900">THÔNG BÁO TỪ CƠ QUAN CÔNG AN:</h5>
        <p id="t-resolution-text" class="leading-relaxed">Đang trong quá trình kiểm tra, xác minh thực địa.</p>
      </div>
    </div>
  </div>
</div>
`,
  },
  {
    name: 'login.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Cổng đăng nhập nghiệp vụ dành riêng cho cán bộ, chỉ huy và quản trị viên',
    content: `<div class="max-w-md mx-auto my-6">
  <div class="bg-white rounded-2xl shadow-2xl border-2 border-red-950 overflow-hidden">
    <!-- Header Modal Cán Bộ -->
    <div class="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-6 text-center border-b border-amber-400/40 relative">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-800 to-red-950 mx-auto flex items-center justify-center border border-amber-400/60 shadow mb-2">
        <span class="text-xl text-amber-400 font-bold">🛡️</span>
      </div>
      <div class="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
        CÔNG AN XÃ ĐỨC HỢP • TỈNH HƯNG YÊN
      </div>
      <h3 class="text-base font-extrabold text-white mt-0.5 uppercase tracking-wide">
        CỔNG ĐĂNG NHẬP CÁN BỘ CÔNG AN
      </h3>
      <p class="text-[11px] text-slate-300 mt-1">
        Hệ thống quản lý, phân loại và thụ lý hồ sơ tố giác tội phạm số
      </p>
    </div>

    <!-- Login Form -->
    <form onsubmit="handleOfficerLogin(event)" class="p-6 space-y-4 text-xs">
      <div id="login-error-msg" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-semibold flex items-start gap-2">
        <span class="text-red-600 font-bold">⚠️</span>
        <span id="login-error-text">Lỗi đăng nhập</span>
      </div>

      <div>
        <label class="block font-bold text-slate-900 mb-1">
          Tên tài khoản cán bộ <span class="text-red-600">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3.5 top-2.5 text-slate-400 text-sm">👤</span>
          <input
            id="login-username"
            type="text"
            required
            placeholder="VD: Quang343001 hoặc admin"
            class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900 font-medium"
          />
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-900 mb-1">
          Mật khẩu truy cập <span class="text-red-600">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔒</span>
          <input
            id="login-password"
            type="password"
            required
            placeholder="Nhập mật khẩu (Mặc định: 1)"
            class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900 font-medium"
          />
        </div>
      </div>

      <button
        type="submit"
        id="login-submit-btn"
        class="w-full py-2.5 px-4 rounded-xl bg-red-900 hover:bg-red-800 text-white font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
      >
        <span class="text-amber-400 font-bold">➔</span>
        <span id="login-btn-label">ĐĂNG NHẬP HỆ THỐNG</span>
      </button>

      <!-- Preset Test Accounts Shortcut -->
      <div class="pt-3 border-t border-slate-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <span class="text-blue-700 font-bold">ℹ️</span>
            Tài khoản kiểm thử nhanh:
          </span>
        </div>

        <div class="grid grid-cols-2 gap-1.5 text-[10px]">
          <button
            type="button"
            onclick="quickFillLogin('admin', 'admin@123')"
            class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors cursor-pointer"
          >
            <div class="font-bold text-red-950">Super Admin</div>
            <div class="text-slate-500 font-mono">admin / admin@123</div>
          </button>

          <button
            type="button"
            onclick="quickFillLogin('Quang343001', '1')"
            class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors cursor-pointer"
          >
            <div class="font-bold text-red-950">Thượng tá Quang</div>
            <div class="text-slate-500 font-mono">Quang343001 / 1</div>
          </button>

          <button
            type="button"
            onclick="quickFillLogin('Hai343002', '1')"
            class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors cursor-pointer"
          >
            <div class="font-bold text-red-950">Thiếu tá Hài</div>
            <div class="text-slate-500 font-mono">Hai343002 / 1</div>
          </button>

          <button
            type="button"
            onclick="quickFillLogin('Doanh343005', '1')"
            class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-left border border-slate-200 transition-colors cursor-pointer"
          >
            <div class="font-bold text-red-950">Đ/c Doanh (Cán bộ)</div>
            <div class="text-slate-500 font-mono">Doanh343005 / 1</div>
          </button>
        </div>
        <p class="text-[10px] text-slate-400 italic mt-2 text-center">
          * Mật khẩu mặc định cho cán bộ là <strong>1</strong> (Hệ thống hỗ trợ đổi mật khẩu sau khi đăng nhập).
        </p>
      </div>
    </form>
  </div>
</div>
`,
  },
  {
    name: 'dashboard.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Bảng điều khiển KPI, thống kê 11 thôn, bộ lọc đa tiêu chí và danh sách quản lý hồ sơ',
    content: `<div class="space-y-6">
  <!-- Top Bar: Officer Info & Action Controls -->
  <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3">
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-full bg-[#8B0000] text-[#FFD700] flex items-center justify-center font-bold">CB</div>
      <div>
        <div class="flex items-center gap-2">
          <h3 id="dash-officer-name" class="font-black text-sm text-gray-900">Đoàn Ngọc Quang</h3>
          <span id="dash-officer-role" class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">LEADERSHIP</span>
        </div>
        <p id="dash-officer-pos" class="text-xs text-gray-500">Thượng tá • Trưởng Công an xã</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button onclick="refreshDashboard()" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1">
        🔄 Tải lại
      </button>
      <button id="admin-nav-btn" onclick="switchView('admin')" class="hidden px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold">
        ⚙️ Quản Trị Hệ Thống
      </button>
      <button onclick="handleOfficerLogout()" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold">
        🚪 Đăng Xuất
      </button>
    </div>
  </div>

  <!-- KPI Cards Grid -->
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div class="text-[11px] font-bold text-gray-500 uppercase">Tổng hồ sơ</div>
      <div id="kpi-total" class="text-2xl font-black text-gray-900 mt-1">0</div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
      <div class="text-[11px] font-bold text-blue-600 uppercase">Tiếp nhận hôm nay</div>
      <div id="kpi-today" class="text-2xl font-black text-blue-700 mt-1">0</div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
      <div class="text-[11px] font-bold text-amber-600 uppercase">Đang thụ lý</div>
      <div id="kpi-processing" class="text-2xl font-black text-amber-700 mt-1">0</div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
      <div class="text-[11px] font-bold text-emerald-600 uppercase">Đã giải quyết</div>
      <div id="kpi-resolved" class="text-2xl font-black text-emerald-700 mt-1">0</div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
      <div class="text-[11px] font-bold text-red-600 uppercase">Quá hạn cảnh báo</div>
      <div id="kpi-overdue" class="text-2xl font-black text-red-700 mt-1">0</div>
    </div>
  </div>

  <!-- Multi-criteria Filter Bar -->
  <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <input type="text" id="filter-keyword" oninput="applyFilters()" placeholder="Tìm theo Mã HS, nội dung, địa điểm..." class="text-xs px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B0000]">
      <select id="filter-village" onchange="applyFilters()" class="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300">
        <option value="">-- Tất cả 11 Thôn --</option>
        <option value="Đức An">Đức An</option><option value="Đức Trung">Đức Trung</option>
        <option value="Phú Ninh">Phú Ninh</option><option value="Nho Lâm">Nho Lâm</option>
        <option value="Hạnh Lâm">Hạnh Lâm</option><option value="Vân Nghệ">Vân Nghệ</option>
        <option value="Trung Hòa">Trung Hòa</option><option value="Phú Cường">Phú Cường</option>
        <option value="Quảng Lạc">Quảng Lạc</option><option value="Bắc Nam Phú">Bắc Nam Phú</option>
        <option value="Tây Thịnh">Tây Thịnh</option>
      </select>
      <select id="filter-status" onchange="applyFilters()" class="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300">
        <option value="">-- Tất cả Trạng thái --</option>
        <option value="NEW">Mới tiếp nhận (NEW)</option>
        <option value="RECEIVED">Đã tiếp nhận (RECEIVED)</option>
        <option value="ASSIGNED">Đã phân công (ASSIGNED)</option>
        <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
        <option value="VERIFYING">Đang xác minh (VERIFYING)</option>
        <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
        <option value="CLOSED">Đã đóng hồ sơ (CLOSED)</option>
      </select>
      <select id="filter-priority" onchange="applyFilters()" class="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300">
        <option value="">-- Tất cả Mức độ --</option>
        <option value="NORMAL">Bình thường</option>
        <option value="URGENT">Khẩn cấp</option>
        <option value="VERY_URGENT">Đặc biệt khẩn cấp</option>
      </select>
    </div>
  </div>

  <!-- Case Table -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#8B0000] text-white uppercase text-[11px]">
          <tr>
            <th class="p-3">Mã hồ sơ</th>
            <th class="p-3">Thời gian</th>
            <th class="p-3">Thôn</th>
            <th class="p-3">Danh mục</th>
            <th class="p-3">Mức độ</th>
            <th class="p-3">Trạng thái</th>
            <th class="p-3">Hạn xử lý</th>
            <th class="p-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody id="case-table-body" class="divide-y divide-gray-200">
          <tr><td colspan="8" class="p-6 text-center text-gray-500">Đang tải dữ liệu hồ sơ...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`,
  },
  {
    name: 'case-detail.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Modal chi tiết hồ sơ nghiệp vụ, quản lý tài liệu đính kèm, phân công cán bộ, chuyển trạng thái',
    content: `<div id="case-detail-modal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
  <div class="bg-white rounded-2xl shadow-2xl border border-gray-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
    <!-- Header -->
    <div class="bg-[#8B0000] text-white px-6 py-4 border-b-2 border-[#FFD700] flex justify-between items-center">
      <div>
        <h3 class="text-base font-black uppercase flex items-center gap-2">
          <span>📁</span> CHI TIẾT HỒ SƠ TỐ GIÁC: <span id="m-case-id" class="font-mono text-[#FFD700]">--</span>
        </h3>
        <p class="text-xs text-amber-200">Hệ thống Tiếp nhận & Quản lý Hồ sơ Nghiệp vụ - Công an xã Đức Hợp</p>
      </div>
      <button onclick="closeCaseDetailModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm">✕</button>
    </div>

    <!-- Body Scrollable -->
    <div class="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
      <!-- 1. Metadata Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div><span class="text-gray-500 block">Địa bàn thôn:</span> <strong id="m-village" class="text-gray-900 font-bold">--</strong></div>
        <div><span class="text-gray-500 block">Mức độ khẩn:</span> <span id="m-priority-badge">--</span></div>
        <div><span class="text-gray-500 block">Trạng thái:</span> <span id="m-status-badge">--</span></div>
        <div><span class="text-gray-500 block">Hạn xử lý:</span> <strong id="m-deadline" class="font-mono text-red-700">--</strong></div>
      </div>

      <!-- 2. Reporter Info (Confidential) -->
      <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
        <h4 class="font-bold text-amber-950 uppercase text-[11px] mb-2 flex items-center gap-1.5">
          <span>🔒</span> THÔNG TIN NGƯỜI BÁO TIN (MẬT THEO LUẬT)
        </h4>
        <div id="m-reporter-info" class="text-gray-800">Ẩn danh hoàn toàn</div>
      </div>

      <!-- 3. Incident Description -->
      <div>
        <h4 class="font-bold uppercase text-gray-700 mb-1.5">NỘI DUNG VỤ VIỆC TỐ GIÁC:</h4>
        <div id="m-description" class="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 leading-relaxed whitespace-pre-wrap">--</div>
      </div>

      <!-- 4. Suspect Info & GPS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 class="font-bold uppercase text-gray-700 mb-1">Đặc điểm đối tượng / Phương tiện:</h4>
          <div id="m-suspect" class="p-2.5 bg-gray-50 rounded-lg border text-gray-800">Không có thông tin</div>
        </div>
        <div>
          <h4 class="font-bold uppercase text-gray-700 mb-1">Vị trí thực địa & Tọa độ GPS:</h4>
          <div id="m-location" class="p-2.5 bg-gray-50 rounded-lg border text-gray-800">--</div>
        </div>
      </div>

      <!-- 5. Attachments -->
      <div>
        <h4 class="font-bold uppercase text-gray-700 mb-1.5">TÀI LIỆU, HÌNH ẢNH & BẰNG CHỨNG ĐÍNH KÈM:</h4>
        <div id="m-attachments-list" class="space-y-1.5">Chưa có file đính kèm</div>
      </div>

      <!-- 6. Phân công & Chuyển trạng thái (Workflow) -->
      <div class="p-4 bg-gray-100 rounded-xl border border-gray-300 space-y-4">
        <h4 class="font-black text-[#8B0000] uppercase text-xs">XỬ LÝ NGHIỆP VỤ & PHÂN CÔNG THỤ LÝ</h4>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Phân công -->
          <div>
            <label class="block text-[11px] font-bold text-gray-700 mb-1">Phân công Cán bộ thụ lý:</label>
            <select id="m-assign-officer" class="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 mb-2">
              <option value="">-- Chọn cán bộ phụ trách --</option>
              <option value="USR-001">Thượng tá Đoàn Ngọc Quang (Trưởng CAX)</option>
              <option value="USR-002">Thiếu tá Phạm Văn Hài (Phó CAX - PCTP)</option>
              <option value="USR-003">Trung tá Đặng Hồng Ngọc (Phó CAX - Tổng hợp)</option>
              <option value="USR-004">Trung tá Vũ Văn Thu (Phó CAX - CSTT)</option>
              <option value="USR-005">Trung tá Nguyễn Văn Doanh (CSKV)</option>
              <option value="USR-006">Thiếu tá Phạm Văn Ngoạn (An ninh)</option>
            </select>
            <button onclick="handleAssignOfficer()" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold">
              Giao Thụ Lý
            </button>
          </div>

          <!-- Chuyển trạng thái -->
          <div>
            <label class="block text-[11px] font-bold text-gray-700 mb-1">Chuyển trạng thái quy trình:</label>
            <select id="m-next-status" class="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 mb-2">
              <option value="RECEIVED">Tiếp nhận hồ sơ (RECEIVED)</option>
              <option value="PROCESSING">Đang thụ lý xác minh (PROCESSING)</option>
              <option value="VERIFYING">Kiểm tra thực địa (VERIFYING)</option>
              <option value="RESOLVED">Giải quyết xong (RESOLVED)</option>
              <option value="CLOSED">Đóng hồ sơ (CLOSED)</option>
              <option value="OUT_OF_SCOPE">Chuyển cơ quan khác (OUT_OF_SCOPE)</option>
            </select>
            <button onclick="handleStatusUpdate()" class="px-3 py-1.5 bg-[#8B0000] hover:bg-[#700000] text-white rounded-lg text-xs font-bold">
              Cập Nhật Trạng Thái
            </button>
          </div>
        </div>
      </div>

      <!-- 7. Process History & Audit -->
      <div>
        <h4 class="font-bold uppercase text-gray-700 mb-1.5">NHẬT KÝ TIẾN TRÌNH XỬ LÝ:</h4>
        <div id="m-history-list" class="space-y-2 max-h-40 overflow-y-auto"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
      <button onclick="window.print()" class="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold">🖨️ In Hồ Sơ Nghiệp Vụ</button>
      <button onclick="closeCaseDetailModal()" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-xs font-bold">Đóng</button>
    </div>
  </div>
</div>
`,
  },
  {
    name: 'admin.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Trang quản trị cán bộ, tạo tài khoản theo quy tắc, gán nhiều thôn, reset mật khẩu, xóa hồ sơ',
    content: `<div class="space-y-6">
  <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
    <div>
      <h2 class="text-base font-black uppercase text-purple-900 flex items-center gap-2">
        <span>⚙️</span> QUẢN TRỊ CÁN BỘ & HỆ THỐNG CÔNG AN XÃ
      </h2>
      <p class="text-xs text-gray-500">Quản lý danh sách cán bộ, cấp tài khoản, phân công địa bàn thôn phụ trách và kiểm tra nhật ký</p>
    </div>
    <button onclick="switchView('dashboard')" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold">
      ← Quay lại Dashboard
    </button>
  </div>

  <!-- Form Tạo Cán Bộ Mới -->
  <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
    <h3 class="text-xs font-black uppercase text-gray-800 border-b pb-2">➕ THÊM CÁN BỘ / TẠO TÀI KHOẢN MỚI</h3>
    
    <form onsubmit="handleCreateOfficer(event)" class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
      <div>
        <label class="block font-bold text-gray-700 mb-1">Họ và tên cán bộ *</label>
        <input type="text" id="adm-name" required placeholder="Ví dụ: Nguyễn Văn A" class="w-full px-3 py-2 rounded-lg border">
      </div>
      <div>
        <label class="block font-bold text-gray-700 mb-1">Số hiệu CAND *</label>
        <input type="text" id="adm-badge" required placeholder="Ví dụ: 343-007" class="w-full px-3 py-2 rounded-lg border">
      </div>
      <div>
        <label class="block font-bold text-gray-700 mb-1">Cấp bậc</label>
        <select id="adm-rank" class="w-full px-3 py-2 rounded-lg border">
          <option value="Thiếu úy">Thiếu úy</option><option value="Trung úy">Trung úy</option>
          <option value="Thượng úy">Thượng úy</option><option value="Đại úy">Đại úy</option>
          <option value="Thiếu tá">Thiếu tá</option><option value="Trung tá">Trung tá</option>
          <option value="Thượng tá">Thượng tá</option>
        </select>
      </div>
      <div>
        <label class="block font-bold text-gray-700 mb-1">Chức vụ</label>
        <input type="text" id="adm-pos" placeholder="Ví dụ: Cảnh sát khu vực" class="w-full px-3 py-2 rounded-lg border">
      </div>
      <div>
        <label class="block font-bold text-gray-700 mb-1">Số điện thoại</label>
        <input type="tel" id="adm-phone" placeholder="Ví dụ: 0988.xxx.xxx" class="w-full px-3 py-2 rounded-lg border">
      </div>
      <div>
        <label class="block font-bold text-gray-700 mb-1">Vai trò hệ thống</label>
        <select id="adm-role" class="w-full px-3 py-2 rounded-lg border">
          <option value="PROCESSING_OFFICER">Cán bộ xử lý (PROCESSING_OFFICER)</option>
          <option value="LEADERSHIP">Ban Chỉ huy (LEADERSHIP)</option>
          <option value="ADMIN">Quản trị viên (ADMIN)</option>
        </select>
      </div>
      <div class="sm:col-span-3">
        <label class="block font-bold text-gray-700 mb-1">Thôn phụ trách (Có thể chọn nhiều thôn):</label>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px]">
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Đức An"> Đức An</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Đức Trung"> Đức Trung</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Phú Ninh"> Phú Ninh</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Nho Lâm"> Nho Lâm</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Hạnh Lâm"> Hạnh Lâm</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Vân Nghệ"> Vân Nghệ</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Trung Hòa"> Trung Hòa</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Phú Cường"> Phú Cường</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Quảng Lạc"> Quảng Lạc</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Bắc Nam Phú"> Bắc Nam Phú</label>
          <label class="flex items-center gap-1"><input type="checkbox" name="adm-villages" value="Tây Thịnh"> Tây Thịnh</label>
        </div>
      </div>
      <div class="sm:col-span-3">
        <button type="submit" class="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow">
          Tạo Tài Khoản Cán Bộ
        </button>
      </div>
    </form>
  </div>

  <!-- Danh Sách Cán Bộ Hiện Có -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="bg-gray-100 p-4 border-b font-bold text-xs uppercase text-gray-700">DANH SÁCH CÁN BỘ CÔNG AN XÃ</div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="p-3">Họ tên & Cấp bậc</th>
            <th class="p-3">Số hiệu</th>
            <th class="p-3">Tên đăng nhập</th>
            <th class="p-3">Vai trò</th>
            <th class="p-3">Thôn phụ trách</th>
            <th class="p-3">SĐT</th>
            <th class="p-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody id="officers-table-body" class="divide-y">
          <tr><td colspan="7" class="p-4 text-center text-gray-500">Đang tải danh sách cán bộ...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`,
  },
  {
    name: 'javascript.html',
    type: 'html',
    category: 'Frontend .html',
    description: 'Toàn bộ mã JavaScript Client-side điều hướng, kết nối google.script.run, xử lý form và hiển thị',
    content: `<script>
  // State toàn cục Client
  var currentSessionUser = null;
  var attachedFiles = [];
  var cachedCases = [];

  // Khởi chạy khi load trang
  window.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra session lưu trong sessionStorage
    var saved = sessionStorage.getItem('GAS_OFFICER_SESSION');
    if (saved) {
      try {
        currentSessionUser = JSON.parse(saved);
        updateOfficerUI();
      } catch (e) {}
    }
  });

  // 1. Chuyển đổi View/Tab
  function switchView(viewName) {
    document.querySelectorAll('.view-panel').forEach(function(el) {
      el.classList.add('hidden');
    });
    var target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Highlight Nav Button
    ['citizen', 'track'].forEach(function(tab) {
      var btn = document.getElementById('nav-btn-' + tab);
      if (btn) {
        if (tab === viewName) {
          btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors bg-white/20 text-white border border-white/30';
        } else {
          btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors bg-black/20 hover:bg-white/10 text-white';
        }
      }
    });

    if (viewName === 'dashboard' && currentSessionUser) {
      refreshDashboard();
    }
  }

  function handleOfficerNavClick() {
    if (currentSessionUser) {
      switchView('dashboard');
    } else {
      switchView('login');
    }
  }

  // 2. Client-side Toast System
  function showToast(msg, type) {
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    var bg = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-red-600' : 'bg-gray-800');
    toast.className = bg + ' text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-fadeIn';
    toast.innerHTML = '<span>' + msg + '</span><button onclick="this.parentElement.remove()" class="text-white/80 font-bold">✕</button>';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 4000);
  }

  // 3. Citizen Form Logic
  function toggleAnonymousMode(isAnon) {
    var f = document.getElementById('reporter-fields');
    if (isAnon) {
      f.classList.add('hidden');
    } else {
      f.classList.remove('hidden');
    }
  }

  function getCurrentGPS() {
    var status = document.getElementById('gps-status');
    if (!navigator.geolocation) {
      status.innerText = 'Trình duyệt không hỗ trợ GPS.';
      return;
    }
    status.innerText = 'Đang lấy tọa độ GPS...';
    navigator.geolocation.getCurrentPosition(function(pos) {
      document.getElementById('c-lat').value = pos.coords.latitude;
      document.getElementById('c-lng').value = pos.coords.longitude;
      status.innerText = 'Đã lấy tọa độ: ' + pos.coords.latitude.toFixed(5) + ', ' + pos.coords.longitude.toFixed(5);
    }, function(err) {
      status.innerText = 'Không thể lấy GPS: ' + err.message;
    });
  }

  function handleFileSelect(e) {
    var files = e.target.files;
    var preview = document.getElementById('file-preview-list');
    attachedFiles = [];
    preview.innerHTML = '';

    for (var i = 0; i < files.length; i++) {
      (function(file) {
        var reader = new FileReader();
        reader.onload = function(evt) {
          var base64 = evt.target.result.split(',')[1];
          attachedFiles.push({
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            base64Content: base64
          });

          var item = document.createElement('div');
          item.className = 'text-[11px] p-2 bg-gray-100 rounded flex justify-between items-center';
          item.innerHTML = '<span>📄 ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)</span><span class="text-emerald-600 font-bold">✓ Đã sẵn sàng</span>';
          preview.appendChild(item);
        };
        reader.readAsDataURL(file);
      })(files[i]);
    }
  }

  function submitCitizenForm(e) {
    e.preventDefault();
    var btn = document.getElementById('submit-case-btn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang chuyển thông tin tới Công an xã...';

    var payload = {
      category: document.getElementById('c-category').value,
      priority: document.getElementById('c-priority').value,
      village: document.getElementById('c-village').value,
      incidentLocation: document.getElementById('c-location').value,
      latitude: document.getElementById('c-lat').value,
      longitude: document.getElementById('c-lng').value,
      description: document.getElementById('c-description').value,
      suspectDescription: document.getElementById('c-suspect').value,
      anonymous: document.getElementById('c-anonymous').checked,
      reporterName: document.getElementById('c-rep-name').value,
      reporterPhone: document.getElementById('c-rep-phone').value,
      reporterEmail: document.getElementById('c-rep-email').value,
      files: attachedFiles
    };

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          btn.disabled = false;
          btn.innerHTML = '🚀 GỬI TIN BÁO TỚI CÔNG AN XÃ ĐỨC HỢP';
          if (res.success) {
            document.getElementById('citizen-form').classList.add('hidden');
            document.getElementById('submit-success-panel').classList.remove('hidden');
            document.getElementById('res-case-id').innerText = res.data.caseId;
            document.getElementById('res-tracking-code').innerText = res.data.publicTrackingCode;
            document.getElementById('res-created-at').innerText = new Date(res.data.createdAt).toLocaleString('vi-VN');
          } else {
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function(err) {
          btn.disabled = false;
          btn.innerHTML = '🚀 GỬI TIN BÁO TỚI CÔNG AN XÃ ĐỨC HỢP';
          showToast('Lỗi gửi hồ sơ: ' + err.message, 'error');
        })
        .submitCitizenCase(payload);
    } else {
      // Offline fallback
      setTimeout(function() {
        btn.disabled = false;
        btn.innerHTML = '🚀 GỬI TIN BÁO TỚI CÔNG AN XÃ ĐỨC HỢP';
        var mockId = 'DH-2026-000099';
        var mockCode = 'TK-' + Math.floor(1000 + Math.random() * 9000) + '-888';
        document.getElementById('citizen-form').classList.add('hidden');
        document.getElementById('submit-success-panel').classList.remove('hidden');
        document.getElementById('res-case-id').innerText = mockId;
        document.getElementById('res-tracking-code').innerText = mockCode;
        document.getElementById('res-created-at').innerText = new Date().toLocaleString('vi-VN');
      }, 800);
    }
  }

  function resetCitizenForm() {
    document.getElementById('citizen-form').reset();
    document.getElementById('citizen-form').classList.remove('hidden');
    document.getElementById('submit-success-panel').classList.add('hidden');
    document.getElementById('file-preview-list').innerHTML = '';
    attachedFiles = [];
  }

  function copyTrackingInfo() {
    var id = document.getElementById('res-case-id').innerText;
    var code = document.getElementById('res-tracking-code').innerText;
    navigator.clipboard.writeText('Mã hồ sơ: ' + id + '\\nMã tra cứu: ' + code);
    showToast('Đã sao chép mã vào bộ nhớ tạm!', 'success');
  }

  // 4. Case Tracking Logic
  function handleTrackSubmit(e) {
    e.preventDefault();
    var caseId = document.getElementById('track-case-id').value.trim();
    var code = document.getElementById('track-code').value.trim();
    var btn = document.getElementById('track-btn');
    btn.innerText = 'Đang tìm...';

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          btn.innerText = 'Tra cứu';
          if (res.success) {
            renderTrackResult(res.data);
          } else {
            showToast(res.message, 'error');
          }
        })
        .withFailureHandler(function(err) {
          btn.innerText = 'Tra cứu';
          showToast('Lỗi: ' + err.message, 'error');
        })
        .trackCitizenCase(caseId, code);
    } else {
      setTimeout(function() {
        btn.innerText = 'Tra cứu';
        renderTrackResult({
          caseId: caseId,
          village: 'Nho Lâm',
          category: 'CRIME_REPORT',
          status: 'PROCESSING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resolution: 'Công an xã đang thụ lý xác minh hiện trường.'
        });
      }, 500);
    }
  }

  function renderTrackResult(data) {
    document.getElementById('track-result-card').classList.remove('hidden');
    document.getElementById('t-case-id').innerText = data.caseId;
    document.getElementById('t-village').innerText = 'Thôn ' + (data.village || '--');
    document.getElementById('t-category').innerText = data.category || '--';
    document.getElementById('t-status-badge').innerText = data.status || 'NEW';
    document.getElementById('t-created-at').innerText = new Date(data.createdAt).toLocaleString('vi-VN');
    document.getElementById('t-updated-at').innerText = new Date(data.updatedAt).toLocaleString('vi-VN');
    document.getElementById('t-resolution-text').innerText = data.resolution || 'Hồ sơ đang được Công an xã tiến hành kiểm tra, xác minh.';

    // Cập nhật 4 step timeline
    var step2 = document.getElementById('step-2');
    var step3 = document.getElementById('step-3');
    var step4 = document.getElementById('step-4');
    
    if (data.status === 'RECEIVED' || data.status === 'CLASSIFIED' || data.status === 'ASSIGNED') {
      step2.className = 'p-2 rounded-lg bg-blue-100 text-blue-900 border border-blue-300';
    } else if (data.status === 'PROCESSING' || data.status === 'VERIFYING') {
      step2.className = 'p-2 rounded-lg bg-blue-100 text-blue-900 border border-blue-300';
      step3.className = 'p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300';
    } else if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      step2.className = 'p-2 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300';
      step3.className = 'p-2 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300';
      step4.className = 'p-2 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300';
    }
  }

  // 5. Officer Auth Logic
  function quickFillLogin(u, p) {
    document.getElementById('login-username').value = u;
    document.getElementById('login-password').value = p;
  }

  function handleOfficerLogin(e) {
    e.preventDefault();
    var u = document.getElementById('login-username').value.trim();
    var p = document.getElementById('login-password').value.trim();
    var btn = document.getElementById('login-submit-btn');
    btn.innerText = 'Đang xác thực...';

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          btn.innerText = 'ĐĂNG NHẬP HỆ THỐNG';
          if (res.success) {
            currentSessionUser = res.data;
            sessionStorage.setItem('GAS_OFFICER_SESSION', JSON.stringify(res.data));
            updateOfficerUI();
            switchView('dashboard');
            showToast('Đăng nhập thành công!', 'success');
          } else {
            var errEl = document.getElementById('login-error-msg');
            errEl.innerText = res.message;
            errEl.classList.remove('hidden');
          }
        })
        .withFailureHandler(function(err) {
          btn.innerText = 'ĐĂNG NHẬP HỆ THỐNG';
          showToast('Lỗi: ' + err.message, 'error');
        })
        .authenticateOfficer(u, p);
    } else {
      // Mock Login
      setTimeout(function() {
        btn.innerText = 'ĐĂNG NHẬP HỆ THỐNG';
        currentSessionUser = {
          userId: 'USR-001',
          fullName: 'Đoàn Ngọc Quang',
          rank: 'Thượng tá',
          position: 'Trưởng Công an xã',
          role: u === 'admin' ? 'SUPER_ADMIN' : 'LEADERSHIP'
        };
        sessionStorage.setItem('GAS_OFFICER_SESSION', JSON.stringify(currentSessionUser));
        updateOfficerUI();
        switchView('dashboard');
      }, 500);
    }
  }

  function updateOfficerUI() {
    if (!currentSessionUser) return;
    document.getElementById('dash-officer-name').innerText = currentSessionUser.fullName;
    document.getElementById('dash-officer-pos').innerText = (currentSessionUser.rank || '') + ' • ' + (currentSessionUser.position || 'Cán bộ');
    document.getElementById('dash-officer-role').innerText = currentSessionUser.role;

    var admBtn = document.getElementById('admin-nav-btn');
    if (admBtn && (currentSessionUser.role === 'SUPER_ADMIN' || currentSessionUser.role === 'ADMIN')) {
      admBtn.classList.remove('hidden');
    }
  }

  function handleOfficerLogout() {
    currentSessionUser = null;
    sessionStorage.removeItem('GAS_OFFICER_SESSION');
    switchView('login');
    showToast('Đã đăng xuất khỏi hệ thống.', 'info');
  }

  // 6. Dashboard & Case Listing
  function refreshDashboard() {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            document.getElementById('kpi-total').innerText = res.data.total;
            document.getElementById('kpi-today').innerText = res.data.today;
            document.getElementById('kpi-processing').innerText = res.data.processing;
            document.getElementById('kpi-resolved').innerText = res.data.resolved;
            document.getElementById('kpi-overdue').innerText = res.data.overdue;
          }
        })
        .getDashboardStats();

      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            cachedCases = res.data;
            renderCaseTable(cachedCases);
          }
        })
        .getOfficerCases();
    } else {
      // Mock data
      document.getElementById('kpi-total').innerText = '12';
      document.getElementById('kpi-today').innerText = '2';
      document.getElementById('kpi-processing').innerText = '5';
      document.getElementById('kpi-resolved').innerText = '6';
      document.getElementById('kpi-overdue').innerText = '1';
      renderCaseTable([
        {
          caseId: 'DH-2026-000001',
          createdAt: new Date().toISOString(),
          village: 'Nho Lâm',
          category: 'CRIME_REPORT',
          priority: 'URGENT',
          status: 'PROCESSING',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          description: 'Trộm cắp xe máy tại ngã tư Nho Lâm.'
        }
      ]);
    }
  }

  function renderCaseTable(cases) {
    var tbody = document.getElementById('case-table-body');
    if (!cases || cases.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-gray-500">Không có hồ sơ nào phù hợp bộ lọc.</td></tr>';
      return;
    }

    tbody.innerHTML = cases.map(function(c) {
      var pColor = c.priority === 'VERY_URGENT' ? 'bg-red-100 text-red-800' : (c.priority === 'URGENT' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700');
      var sColor = c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';

      return '<tr class="hover:bg-gray-50 transition-colors">' +
        '<td class="p-3 font-mono font-bold text-[#8B0000]">' + c.caseId + '</td>' +
        '<td class="p-3 text-gray-500 font-mono text-[11px]">' + new Date(c.createdAt).toLocaleDateString('vi-VN') + '</td>' +
        '<td class="p-3 font-semibold">Thôn ' + (c.village || '--') + '</td>' +
        '<td class="p-3">' + c.category + '</td>' +
        '<td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ' + pColor + '">' + c.priority + '</span></td>' +
        '<td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ' + sColor + '">' + c.status + '</span></td>' +
        '<td class="p-3 font-mono text-gray-600 text-[11px]">' + (c.deadline ? new Date(c.deadline).toLocaleDateString('vi-VN') : '--') + '</td>' +
        '<td class="p-3 text-right"><button onclick="viewCaseDetail(\\'' + c.caseId + '\\')" class="px-2.5 py-1 bg-[#8B0000] hover:bg-[#700000] text-white font-bold rounded text-[11px]">Chi tiết</button></td>' +
      '</tr>';
    }).join('');
  }

  function applyFilters() {
    var kw = document.getElementById('filter-keyword').value.toLowerCase();
    var v = document.getElementById('filter-village').value;
    var st = document.getElementById('filter-status').value;
    var p = document.getElementById('filter-priority').value;

    var filtered = cachedCases.filter(function(c) {
      if (v && c.village !== v) return false;
      if (st && c.status !== st) return false;
      if (p && c.priority !== p) return false;
      if (kw) {
        var text = ((c.caseId || '') + ' ' + (c.description || '') + ' ' + (c.incidentLocation || '')).toLowerCase();
        if (text.indexOf(kw) === -1) return false;
      }
      return true;
    });
    renderCaseTable(filtered);
  }

  // 7. Case Detail Modal
  var activeDetailCaseId = null;
  function viewCaseDetail(caseId) {
    activeDetailCaseId = caseId;
    document.getElementById('case-detail-modal').classList.remove('hidden');
    document.getElementById('m-case-id').innerText = caseId;

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            populateCaseDetailModal(res.data);
          }
        })
        .getCaseDetail(caseId, currentSessionUser);
    }
  }

  function populateCaseDetailModal(data) {
    var c = data.caseRecord;
    document.getElementById('m-village').innerText = 'Thôn ' + (c.village || '--');
    document.getElementById('m-priority-badge').innerText = c.priority;
    document.getElementById('m-status-badge').innerText = c.status;
    document.getElementById('m-deadline').innerText = c.deadline ? new Date(c.deadline).toLocaleDateString('vi-VN') : '--';
    document.getElementById('m-description').innerText = c.description || '--';
    document.getElementById('m-suspect').innerText = c.suspectDescription || 'Không có mô tả';
    document.getElementById('m-location').innerText = (c.incidentLocation || '') + (c.latitude ? ' (GPS: ' + c.latitude + ', ' + c.longitude + ')' : '');

    var repBox = document.getElementById('m-reporter-info');
    if (c.anonymous === 'TRUE' || c.anonymous === true) {
      repBox.innerText = '🔒 Người báo tin chọn chế độ ẨN DANH HOÀN TOÀN.';
    } else {
      repBox.innerText = 'Họ tên: ' + (c.reporterName || 'N/A') + ' | SĐT: ' + (c.reporterPhone || 'N/A') + ' | Email: ' + (c.reporterEmail || 'N/A');
    }

    // Attachments
    var attBox = document.getElementById('m-attachments-list');
    if (data.attachments && data.attachments.length > 0) {
      attBox.innerHTML = data.attachments.map(function(a) {
        return '<div class="p-2 bg-gray-100 rounded flex justify-between items-center text-xs"><span>📎 ' + a.fileName + '</span><a href="https://drive.google.com/open?id=' + a.driveFileId + '" target="_blank" class="text-blue-700 font-bold underline">Mở Drive</a></div>';
      }).join('');
    } else {
      attBox.innerHTML = '<span class="text-gray-400 italic">Không có tài liệu đính kèm.</span>';
    }

    // History
    var histBox = document.getElementById('m-history-list');
    if (data.histories && data.histories.length > 0) {
      histBox.innerHTML = data.histories.map(function(h) {
        return '<div class="p-2 bg-gray-50 border rounded text-[11px]"><div class="flex justify-between font-bold text-gray-800"><span>' + h.action + '</span><span class="text-gray-400">' + new Date(h.performedAt).toLocaleString('vi-VN') + '</span></div><div class="text-gray-600">Thực hiện: ' + h.performedBy + ' ' + (h.note ? ' - ' + h.note : '') + '</div></div>';
      }).join('');
    }
  }

  function closeCaseDetailModal() {
    document.getElementById('case-detail-modal').classList.add('hidden');
    activeDetailCaseId = null;
  }

  function handleAssignOfficer() {
    var offId = document.getElementById('m-assign-officer').value;
    if (!offId) {
      showToast('Vui lòng chọn cán bộ để phân công!', 'error');
      return;
    }
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            showToast(res.message, 'success');
            viewCaseDetail(activeDetailCaseId);
            refreshDashboard();
          } else {
            showToast(res.message, 'error');
          }
        })
        .assignOfficersToCase(activeDetailCaseId, [offId], '', currentSessionUser);
    }
  }

  function handleStatusUpdate() {
    var nextSt = document.getElementById('m-next-status').value;
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            showToast(res.message, 'success');
            viewCaseDetail(activeDetailCaseId);
            refreshDashboard();
          } else {
            showToast(res.message, 'error');
          }
        })
        .updateCaseStatus(activeDetailCaseId, nextSt, 'Cập nhật từ modal', '', currentSessionUser);
    }
  }

  // 8. Admin Officer Management
  function handleCreateOfficer(e) {
    e.preventDefault();
    var checkedVillages = [];
    document.querySelectorAll('input[name="adm-villages"]:checked').forEach(function(el) {
      checkedVillages.push(el.value);
    });

    var data = {
      fullName: document.getElementById('adm-name').value,
      badgeNumber: document.getElementById('adm-badge').value,
      rank: document.getElementById('adm-rank').value,
      position: document.getElementById('adm-pos').value,
      phone: document.getElementById('adm-phone').value,
      role: document.getElementById('adm-role').value,
      assignedVillages: checkedVillages
    };

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            showToast(res.message, 'success');
          } else {
            showToast(res.message, 'error');
          }
        })
        .createOfficerAccount(data, currentSessionUser);
    }
  }
</script>
`,
  },
  {
    name: 'README.md',
    type: 'md',
    category: 'Cấu hình & Tài liệu',
    description: 'Tài liệu hướng dẫn triển khai thực tế, kiến trúc, phân quyền và quy trình vận hành',
    content: `# HÒM THƯ TỐ GIÁC TỘI PHẠM SỐ
**ĐƠN VỊ: CÔNG AN XÃ ĐỨC HỢP, TỈNH HƯNG YÊN**

Hệ thống số hóa tiếp nhận tin báo, phản ánh an ninh trật tự và tố giác tội phạm phục vụ nhân dân trên địa bàn 11 thôn xã Đức Hợp.

---

## 1. THÔNG TIN CÔNG AN XÃ ĐỨC HỢP
* **Địa chỉ trụ sở:** Thôn Nho Lâm, xã Đức Hợp, tỉnh Hưng Yên.
* **Cơ quan chủ quản:** Công an tỉnh Hưng Yên *(theo địa giới hành chính mới không còn huyện Kim Động)*.
* **Số điện thoại Trực ban 24/7:** **02213.815.999**
* **Email tiếp nhận thông báo tự động:** \`conganxaduchopdangbai@gmail.com\`
* **Danh sách 11 thôn:** Đức An, Đức Trung, Phú Ninh, Nho Lâm, Hạnh Lâm, Vân Nghệ, Trung Hòa, Phú Cường, Quảng Lạc, Bắc Nam Phú, Tây Thịnh.

### Danh bạ Lãnh đạo & Cán bộ
1. **Thượng tá Đoàn Ngọc Quang** - Trưởng Công an xã - SĐT: \`0983.892.222\`
2. **Thiếu tá Phạm Văn Hài** - Phó trưởng CAX (Phụ trách Phòng chống tội phạm) - SĐT: \`0986.106.548\`
3. **Trung tá Đặng Hồng Ngọc** - Phó trưởng CAX (Phụ trách Tổng hợp) - SĐT: \`0944.061.666\`
4. **Trung tá Vũ Văn Thu** - Phó trưởng CAX (Phụ trách Cảnh sát trật tự) - SĐT: \`0988.178.118\`
5. **Trung tá Nguyễn Văn Doanh** - Cán bộ (Phụ trách Cảnh sát khu vực) - SĐT: \`0987.668.867\`
6. **Thiếu tá Phạm Văn Ngoạn** - Cán bộ (Phụ trách An ninh) - SĐT: \`0987.827.336\`

---

## 2. TÀI KHOẢN HỆ THỐNG
* **Tài khoản Quản trị cao nhất (Super Admin):**
  * Tên đăng nhập: \`admin\`
  * Mật khẩu: \`admin@123\`
  * Quyền hạn: Toàn quyền, quản lý/xóa tài khoản, reset mật khẩu, xóa hồ sơ vụ việc, cấu hình hệ thống.
* **Tài khoản Cán bộ:**
  * Quy tắc: \`[Tên] + [Số hiệu]\` (Ví dụ: Nguyễn Văn A, số hiệu 343-001 -> \`A343001\` hoặc \`Quang343001\`).
  * Mật khẩu mặc định khi tạo mới: \`1\`
  * Khi đăng nhập lần đầu tiên, hệ thống tự động yêu cầu đổi mật khẩu mới.
  * Hỗ trợ gán một cán bộ phụ trách nhiều thôn.

---

## 3. HƯỚNG DẪN TRIỂN KHAI LÊN GOOGLE APPS SCRIPT (GAS)
1. Truy cập [Google Sheets](https://sheets.new) tạo một Bảng tính mới đặt tên: \`HOM_THU_TO_GIAC_DUCHOP\`.
2. Vào **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
3. Tạo các file \`.gs\` tương ứng từ mục **Mã nguồn GAS** trong ứng dụng này.
4. Chạy hàm \`setupSystem()\` trong file \`14_Setup.gs\` để tự động khởi tạo 8 bảng Sheet và cấp quyền.
5. Bấm **Deploy (Triển khai)** -> **New Deployment (Triển khai mới)**.
6. Chọn loại: **Web App**.
   * Execute as: **Me**
   * Who has access: **Anyone (Bất kỳ ai)**
7. Copy đường dẫn Web App và tạo mã QR phát cho nhân dân các thôn.
`,
  },
];
