import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  X,
  MapPin,
  Compass,
  FileText,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
  Lock,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { CaseCategory, PriorityLevel, CaseAttachment, CaseRecord } from '../../types';
import {
  CATEGORY_DETAILS,
  PRIORITY_DETAILS,
  DUC_HOP_VILLAGES,
  DUC_HOP_COMMUNE_INFO,
} from '../../constants/policeData';
import { storageService } from '../../services/storageService';

interface SubmitCaseFormProps {
  onSuccess: (caseRecord: CaseRecord) => void;
  onCancel: () => void;
}

export const SubmitCaseForm: React.FC<SubmitCaseFormProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<CaseCategory>('CRIME_REPORT');
  const [priority, setPriority] = useState<PriorityLevel>('NORMAL');
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [village, setVillage] = useState<string>(DUC_HOP_VILLAGES[0]);
  const [incidentLocation, setIncidentLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [suspectDescription, setSuspectDescription] = useState<string>('');
  const [isOngoing, setIsOngoing] = useState<boolean>(false);

  // Location / GPS State
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState<CaseAttachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Reporter State
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [reporterAddress, setReporterAddress] = useState<string>('');
  const [consentToContact, setConsentToContact] = useState<boolean>(true);

  // Step 6 Confirmation Checkbox
  const [legalResponsibilityConfirmed, setLegalResponsibilityConfirmed] = useState<boolean>(false);

  // GPS fetcher
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }
    setIsGettingGps(true);
    setGpsStatus('Đang lấy vị trí GPS từ thiết bị...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(6)));
        setLongitude(Number(position.coords.longitude.toFixed(6)));
        setGpsStatus(`Đã lấy vị trí: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        setGpsStatus(`Không thể lấy vị trí: ${err.message}. Bạn có thể nhập địa chỉ chi tiết bằng tay.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files) as File[];
    if (attachments.length + files.length > 5) {
      setFileError('Chỉ được tải lên tối đa 5 tài liệu/hình ảnh đính kèm.');
      return;
    }

    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs', '.js', '.jar', '.php'];

    files.forEach((file: File) => {
      // Validate file size (15MB)
      if (file.size > 15 * 1024 * 1024) {
        setFileError(`File "${file.name}" vượt quá dung lượng 15MB.`);
        return;
      }

      // Check dangerous extensions
      const lowerName = file.name.toLowerCase();
      if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
        setFileError(`Tệp "${file.name}" là định dạng bị cấm tải lên.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: CaseAttachment = {
          attachmentId: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          caseId: '',
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl: event.target?.result as string,
          uploadedAt: new Date().toISOString(),
          uploadedBy: isAnonymous ? 'Người dân ẩn danh' : reporterName || 'Người dân',
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.attachmentId !== attachmentId));
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!category) {
        setErrorMsg('Vui lòng chọn 1 loại thông tin phản ánh.');
        return false;
      }
    } else if (step === 2) {
      if (!description.trim() || description.trim().length < 10) {
        setErrorMsg('Vui lòng nhập nội dung vụ việc chi tiết (tối thiểu 10 ký tự).');
        return false;
      }
      if (!village) {
        setErrorMsg('Vui lòng chọn Thôn xảy ra vụ việc.');
        return false;
      }
    } else if (step === 5) {
      if (!isAnonymous) {
        if (!reporterName.trim()) {
          setErrorMsg('Vui lòng nhập Họ và tên của bạn hoặc chọn "Cung cấp ẩn danh".');
          return false;
        }
        if (!reporterPhone.trim()) {
          setErrorMsg('Vui lòng nhập Số điện thoại liên hệ để Công an xã xác minh khi cần.');
          return false;
        }
        if (!consentToContact) {
          setErrorMsg('Vui lòng đánh dấu đồng ý để Công an xã sử dụng thông tin liên hệ xác minh.');
          return false;
        }
      }
    } else if (step === 6) {
      if (!legalResponsibilityConfirmed) {
        setErrorMsg('Vui lòng tích chọn cam kết chịu trách nhiệm về thông tin cung cấp.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submit
  const handleSubmit = () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const createdRecord = storageService.submitCase({
        category,
        priority,
        incidentDate,
        incidentLocation: incidentLocation || `Tại thôn ${village}`,
        village,
        description,
        suspectDescription,
        isOngoing,
        latitude,
        longitude,
        anonymous: isAnonymous,
        reporterName: isAnonymous ? undefined : reporterName,
        reporterPhone: isAnonymous ? undefined : reporterPhone,
        reporterEmail: isAnonymous ? undefined : reporterEmail,
        reporterAddress: isAnonymous ? undefined : reporterAddress,
        consentToContact: isAnonymous ? false : consentToContact,
        source: 'WEB_CITIZEN',
        attachments,
      });

      setIsSubmitting(false);
      onSuccess(createdRecord);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(`Có lỗi xảy ra: ${err?.message || 'Không thể gửi thông tin. Vui lòng thử lại.'}`);
    }
  };

  const stepsList = [
    { num: 1, title: 'Loại thông tin' },
    { num: 2, title: 'Nội dung' },
    { num: 3, title: 'Vị trí' },
    { num: 4, title: 'Tài liệu' },
    { num: 5, title: 'Người báo' },
    { num: 6, title: 'Xác nhận' },
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-12">
      {/* Step Header with Red Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-5 sm:p-6 border-b border-amber-400/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {DUC_HOP_COMMUNE_INFO.unitTitle} • TỈNH HƯNG YÊN
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
              TIẾP NHẬN TỐ GIÁC TỘI PHẠM & PHẢN ÁNH ANTT
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-400 text-red-950 font-black text-xs">
            BƯỚC {currentStep} / 6
          </span>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-6 gap-1.5 mt-5">
          {stepsList.map((st) => (
            <div key={st.num} className="text-center">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  st.num < currentStep
                    ? 'bg-emerald-400'
                    : st.num === currentStep
                    ? 'bg-amber-400 ring-2 ring-amber-300/40'
                    : 'bg-white/20'
                }`}
              />
              <span
                className={`text-[10px] hidden sm:block mt-1 font-semibold truncate ${
                  st.num === currentStep ? 'text-amber-300 font-bold' : 'text-red-200/70'
                }`}
              >
                {st.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ----------------- BƯỚC 1: LOẠI THÔNG TIN ----------------- */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                BƯỚC 1: LỰA CHỌN LOẠI HÌNH PHẢN ÁNH / TỐ GIÁC
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Vui lòng chọn đúng loại hình để vụ việc được chuyển trực tiếp đến đúng tổ nghiệp vụ chuyên trách:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(Object.keys(CATEGORY_DETAILS) as CaseCategory[]).map((catKey) => {
                const item = CATEGORY_DETAILS[catKey];
                const isSelected = category === catKey;
                return (
                  <div
                    key={catKey}
                    id={`cat-option-${catKey}`}
                    onClick={() => setCategory(catKey)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                      isSelected
                        ? 'border-red-800 bg-red-50/50 shadow-md ring-1 ring-red-800'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${item.badgeColor}`}>
                          {item.label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-red-800 border-red-800 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------- BƯỚC 2: NỘI DUNG VỤ VIỆC ----------------- */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                BƯỚC 2: NỘI DUNG CHI TIẾT VỤ VIỆC
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Mô tả chi tiết những gì bạn biết để cán bộ Công an xã có đủ thông tin xác minh, giải quyết:
              </p>
            </div>

            {/* Thôn xảy ra vụ việc (11 Thôn) */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Thuộc địa bàn Thôn nào trong 11 Thôn xã Đức Hợp? <span className="text-red-600">*</span>
              </label>
              <select
                id="input-village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900"
              >
                {DUC_HOP_VILLAGES.map((v) => (
                  <option key={v} value={v}>
                    Thôn {v} (Xã Đức Hợp)
                  </option>
                ))}
              </select>
            </div>

            {/* Thời gian xảy ra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Thời gian xảy ra hoặc phát hiện <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-incidentDate"
                  type="text"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  placeholder="VD: 2026-08-30 14:30 hoặc Khoảng 20h tối qua"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900"
                />
              </div>

              {/* Mức độ khẩn cấp */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Mức độ khẩn cấp <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['NORMAL', 'URGENT', 'VERY_URGENT'] as PriorityLevel[]).map((p) => {
                    const pInfo = PRIORITY_DETAILS[p];
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 px-1 rounded-lg text-[11px] font-bold border transition-all text-center ${
                          isSelected
                            ? `${pInfo.badgeColor} ring-2 ring-red-800 font-extrabold shadow-sm`
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pInfo.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Có đang tiếp diễn hay không */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Hành vi có đang diễn ra tại thời điểm này?</span>
                <span className="text-[11px] text-slate-500">Nếu đang diễn ra, Công an xã sẽ ưu tiên cử lực lượng ngay.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOngoing}
                  onChange={(e) => setIsOngoing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-800"></div>
              </label>
            </div>

            {/* Nội dung vụ việc */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Nội dung vụ việc, hành vi vi phạm <span className="text-red-600">*</span>
              </label>
              <textarea
                id="input-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể diễn biến sự việc, hành vi vi phạm pháp luật, hậu quả, phương thức thủ đoạn..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900 leading-relaxed"
              />
            </div>

            {/* Mô tả người / phương tiện liên quan */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Mô tả đối tượng nghi vấn, đặc điểm phương tiện, tang vật (nếu có)
              </label>
              <input
                id="input-suspectDescription"
                type="text"
                value={suspectDescription}
                onChange={(e) => setSuspectDescription(e.target.value)}
                placeholder="VD: Nam giới khoảng 30 tuổi, áo khoác đen, đi xe Wave Alpha màu đỏ BKS 89B1-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900"
              />
            </div>
          </div>
        )}

        {/* ----------------- BƯỚC 3: VỊ TRÍ XẢY RA ----------------- */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                BƯỚC 3: ĐỊA ĐIỂM & ĐỊNH VỊ VỊ TRÍ HIỆN TRƯỜNG
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Cung cấp địa chỉ chi tiết hoặc lấy tọa độ GPS để lực lượng chức năng tiếp cận nhanh nhất:
              </p>
            </div>

            {/* Nhập địa chỉ cụ thể */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Địa điểm cụ thể tại Thôn {village}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-700 absolute left-3.5 top-3" />
                <input
                  id="input-location"
                  type="text"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder={`VD: Cạnh quán nước bà Lan, gần cổng đình Thôn ${village}...`}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-red-900 focus:border-red-900"
                />
              </div>
            </div>

            {/* GPS Geolocation Button */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-700" />
                    Lấy vị trí GPS tự động từ thiết bị
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hữu ích khi bạn đang có mặt trực tiếp tại hiện trường xảy ra vụ việc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGetGpsLocation}
                  disabled={isGettingGps}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Compass className={`w-4 h-4 ${isGettingGps ? 'animate-spin' : ''}`} />
                  <span>{isGettingGps ? 'Đang xác định vị trí...' : 'Lấy tọa độ GPS'}</span>
                </button>
              </div>

              {gpsStatus && (
                <div className="mt-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  {gpsStatus}
                </div>
              )}
            </div>

            {/* Nhập tọa độ thủ công nếu có */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude !== undefined ? latitude : ''}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="VD: 20.7321"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude !== undefined ? longitude : ''}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="VD: 106.0125"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Static Visual Map Badge */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Địa bàn hành chính: </span>
                Thôn {village}, Xã Đức Hợp, Tỉnh Hưng Yên (Trực thuộc Công an tỉnh Hưng Yên).
              </div>
            </div>
          </div>
        )}

        {/* ----------------- BƯỚC 4: TÀI LIỆU ĐÍNH KÈM ----------------- */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                BƯỚC 4: TÀI LIỆU, HÌNH ẢNH, VIDEO ĐÍNH KÈM
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Tải lên tối đa 5 file (Ảnh chụp hiện trường, video clip trích xuất camera, ghi âm, tài liệu PDF, DOC...):
              </p>
            </div>

            {/* Drag and Drop / Select Upload Box */}
            <div className="border-2 border-dashed border-red-300 rounded-2xl p-6 text-center bg-red-50/20 hover:bg-red-50/40 transition-colors">
              <Upload className="w-10 h-10 text-red-800 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-900 mb-1">
                Chọn file hoặc kéo thả tài liệu vào đây
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Hỗ trợ ảnh JPG, PNG, Video MP4, Tài liệu PDF, DOCX (Tối đa 15MB/file, tối đa 5 file)
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-95">
                <Paperclip className="w-4 h-4 text-amber-400" />
                <span>Chọn tài liệu từ máy / Điện thoại</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {fileError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {fileError}
              </div>
            )}

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">
                  Danh sách tệp đã chọn ({attachments.length}/5):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.attachmentId}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {att.mimeType.startsWith('image/') && att.dataUrl ? (
                          <img
                            src={att.dataUrl}
                            alt="preview"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate">{att.fileName}</div>
                          <div className="text-[10px] text-slate-500">
                            {(att.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.attachmentId)}
                        className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- BƯỚC 5: THÔNG TIN NGƯỜI CUNG CẤP ----------------- */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                BƯỚC 5: THÔNG TIN NGƯỜI CUNG CẤP
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Bạn có thể hoàn toàn ẩn danh hoặc cung cấp thông tin liên hệ để nhận thông báo và hỗ trợ xác minh:
              </p>
            </div>

            {/* Toggle Anonymity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                id="opt-anonymous"
                onClick={() => setIsAnonymous(true)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isAnonymous
                    ? 'border-emerald-700 bg-emerald-50 shadow-sm ring-1 ring-emerald-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">CUNG CẤP ẨN DANH</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Không lưu lại họ tên, số điện thoại hay email của bạn. Bảo mật tuyệt đối 100%.
                  </p>
                </div>
              </div>

              <div
                id="opt-contact"
                onClick={() => setIsAnonymous(false)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  !isAnonymous
                    ? 'border-red-800 bg-red-50 shadow-sm ring-1 ring-red-800'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-red-100 text-red-800 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">CUNG CẤP THÔNG TIN LIÊN HỆ</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Để cán bộ Công an xã thuận tiện liên hệ trao đổi, xác minh thông tin vụ việc.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Details Form (if not anonymous) */}
            {!isAnonymous && (
              <div className="space-y-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Họ và tên của bạn <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="input-reporterName"
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="VD: Nguyễn Văn Nam"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Số điện thoại liên hệ <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="input-reporterPhone"
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="VD: 0912.345.678"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Địa chỉ Email (Nhận thông báo tiến độ)
                    </label>
                    <input
                      id="input-reporterEmail"
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="VD: nam.nguyen@gmail.com"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Địa chỉ cư trú
                    </label>
                    <input
                      id="input-reporterAddress"
                      type="text"
                      value={reporterAddress}
                      onChange={(e) => setReporterAddress(e.target.value)}
                      placeholder="VD: Thôn Đức An, xã Đức Hợp"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentToContact}
                    onChange={(e) => setConsentToContact(e.target.checked)}
                    className="mt-0.5 rounded text-red-800 focus:ring-red-900 w-4 h-4"
                  />
                  <span className="text-[11px] text-slate-700 leading-snug">
                    Đồng ý để Công an xã Đức Hợp sử dụng thông tin liên hệ nhằm phục vụ việc tiếp nhận,
                    xác minh và trao đổi về nội dung phản ánh.
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* ----------------- BƯỚC 6: RÀ SOÁT & XÁC NHẬN ----------------- */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                BƯỚC 6: RÀ SOÁT THÔNG TIN & GỬI TỐ GIÁC
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Vui lòng kiểm tra lại toàn bộ nội dung trước khi gửi đến Công an xã Đức Hợp:
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Loại hình phản ánh:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold border ${CATEGORY_DETAILS[category].badgeColor}`}>
                  {CATEGORY_DETAILS[category].label}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Mức độ khẩn cấp:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold border ${PRIORITY_DETAILS[priority].badgeColor}`}>
                  {PRIORITY_DETAILS[priority].label} {isOngoing && '• (Đang tiếp diễn)'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Địa bàn xảy ra:</span>
                <span className="font-bold text-slate-900">
                  Thôn {village}, Xã Đức Hợp, Hưng Yên
                </span>
              </div>

              {incidentLocation && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">Địa điểm cụ thể:</span>
                  <span className="font-medium text-slate-800">{incidentLocation}</span>
                </div>
              )}

              <div className="border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold block mb-1">Nội dung vụ việc:</span>
                <p className="text-slate-900 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-normal">
                  {description}
                </p>
              </div>

              {suspectDescription && (
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold block mb-0.5">Mô tả đối tượng/phương tiện:</span>
                  <span className="text-slate-800 font-medium">{suspectDescription}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Tài liệu đính kèm:</span>
                <span className="font-bold text-slate-900">{attachments.length} tệp tin</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Người cung cấp:</span>
                <span className="font-bold text-slate-900">
                  {isAnonymous ? 'Ẩn danh (Bảo mật 100%)' : `${reporterName} - ${reporterPhone}`}
                </span>
              </div>
            </div>

            {/* Legal Responsibility Checkbox */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="chk-legal-confirm"
                  type="checkbox"
                  checked={legalResponsibilityConfirmed}
                  onChange={(e) => setLegalResponsibilityConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-red-800 focus:ring-red-900 w-5 h-5 flex-shrink-0"
                />
                <span className="text-xs text-amber-950 font-medium leading-relaxed">
                  Tôi xác nhận những thông tin cung cấp là thông tin do tôi biết/có được và chịu trách nhiệm
                  về nội dung cung cấp theo quy định pháp luật.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              Hủy bỏ
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              id="btn-step-next"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-final-submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !legalResponsibilityConfirmed}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Đang gửi hồ sơ...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>GỬI THÔNG TIN TỚI CÔNG AN XÃ</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
