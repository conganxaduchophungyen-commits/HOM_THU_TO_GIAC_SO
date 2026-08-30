import React, { useState } from 'react';
import {
  Code,
  FileCode,
  Copy,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  FolderCode,
  ExternalLink,
  BookOpen,
  Terminal,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getAllGasFiles, GasSourceFile, getDeploymentMarkdownSummary } from '../../services/gasCodeGenerator';
import { runInAppTestSuite, TestSuiteReport } from '../../services/testSuiteRunner';

export const GasDeploymentCenter: React.FC = () => {
  const allGasFiles = getAllGasFiles();
  const [selectedFileId, setSelectedFileId] = useState<string>(allGasFiles[0].id);
  const [activeTab, setActiveTab] = useState<'files' | 'guide' | 'tests'>('files');
  const [copiedFile, setCopiedFile] = useState(false);
  const [testReport, setTestReport] = useState<TestSuiteReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const selectedFile = allGasFiles.find((f) => f.id === selectedFileId) || allGasFiles[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.fileName;
    a.click();
  };

  const handleDownloadAllZipOrBundle = () => {
    // Generate bundle text of all files
    let bundle = `/**\n * BỘ MÃ NGUỒN TOÀN DIỆN GOOGLE APPS SCRIPT (GAS)\n * HỆ THỐNG: HÒM THƯ TỐ GIÁC TỘI PHẠM SỐ - CÔNG AN XÃ ĐỨC HỢP, TỈNH HƯNG YÊN\n * Ngay tao: ${new Date().toLocaleString('vi-VN')}\n */\n\n`;
    allGasFiles.forEach((file) => {
      bundle += `\n/* ==========================================================================\n`;
      bundle += `   FILE: ${file.fileName} (${file.path})\n`;
      bundle += `   DESCRIPTION: ${file.description}\n`;
      bundle += `   ========================================================================== */\n\n`;
      bundle += file.content;
      bundle += `\n\n`;
    });

    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOURCE_CODE_GAS_CAX_DUC_HOP_FULL_${new Date().toISOString().slice(0, 10)}.js`;
    a.click();
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const report = runInAppTestSuite();
      setTestReport(report);
      setIsRunningTests(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-amber-400/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 mb-2">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>TRUNG TÂM MÃ NGUỒN GAS & HƯỚNG DẪN TRIỂN KHAI THỰC TẾ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              BỘ SOURCE CODE GOOGLE APPS SCRIPT (GAS) ĐẦY ĐỦ
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Bao gồm toàn bộ 15 file backend `.gs`, cấu trúc Database Sheets 6 bảng, quy trình phân quyền,
              Email Trực ban, mã hóa mật khẩu SHA-256, Audit Log và Test Suite tự động.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95"
            >
              <Play className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Đang chạy kiểm thử...' : 'CHẠY TEST SUITE NGHIỆP VỤ'}</span>
            </button>
            <button
              onClick={handleDownloadAllZipOrBundle}
              className="px-4 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>TẢI TOÀN BỘ 15 FILE GAS</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'files'
                ? 'bg-red-900 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderCode className="w-4 h-4 text-amber-400" />
            <span>Trình duyệt 15 File Code (.gs)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'guide'
                ? 'bg-red-900 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Hướng dẫn triển khai 9 phần</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'tests'
                ? 'bg-red-900 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Kết quả Test Suite tự động</span>
            {testReport && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">
                {testReport.passed}/{testReport.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: 15 Files Browser */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File List Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2 lg:col-span-1 max-h-[75vh] overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
              <span>DANH MỤC 15 FILE GAS</span>
              <span className="font-mono text-red-950">{allGasFiles.length} tệp</span>
            </div>

            {allGasFiles.map((file) => {
              const isSelected = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-red-900 text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isSelected ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="overflow-hidden">
                    <div className="truncate font-mono">{file.fileName}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-red-200' : 'text-slate-400'
                      }`}
                    >
                      {file.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl p-5 lg:col-span-3 flex flex-col max-h-[75vh]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-mono text-xs font-bold text-white block">
                    {selectedFile.fileName}
                  </span>
                  <span className="text-[11px] text-slate-400">{selectedFile.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedFile ? 'Đã chép mã!' : 'Sao chép'}</span>
                </button>
                <button
                  onClick={handleDownloadSingle}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp .gs</span>
                </button>
              </div>
            </div>

            {/* Code Pre Box */}
            <div className="overflow-auto flex-1 font-mono text-xs text-slate-300 p-4 bg-slate-900/90 rounded-xl border border-slate-800 leading-relaxed select-all whitespace-pre">
              {selectedFile.content}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Deployment Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-xs text-slate-800 leading-relaxed">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 uppercase">
              HƯỚNG DẪN TRIỂN KHAI VÀO GOOGLE APPS SCRIPT THỰC TẾ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Các bước cụ thể để đưa hệ thống vào vận hành trực tiếp trên Google Workspace của Công an xã Đức Hợp:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-red-900 text-white font-bold text-xs inline-flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-xs">Tạo Google Sheet Database</h4>
              <p className="text-[11px] text-slate-600">
                Tạo 01 Google Spreadsheet mới tên "DB_HOM_THU_TO_GIAC_CAX_DUC_HOP", lấy Spreadsheet ID.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-xs inline-flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-xs">Dán 15 tệp .gs vào Apps Script</h4>
              <p className="text-[11px] text-slate-600">
                Mở Extensions → Apps Script. Tạo lần lượt 15 tệp script tương ứng và dán toàn bộ mã nguồn vào.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-xs">Chạy setupSystem() & Deploy</h4>
              <p className="text-[11px] text-slate-600">
                Chạy hàm `setupSystem()` để tự động khởi tạo 6 bảng tính và tài khoản mẫu. Sau đó bấm Deploy → New Deployment → Web App.
              </p>
            </div>
          </div>

          {/* Quick Markdown summary snippet */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {getDeploymentMarkdownSummary()}
          </div>
        </div>
      )}

      {/* Tab 3: Test Suite Runner */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase">
                TEST SUITE KIỂM THỬ TỰ ĐỘNG (IN-APP TEST ENGINE)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra 9 chức năng cốt lõi: 11 thôn hành chính, thông tin liên hệ, tạo hồ sơ, tra cứu bảo mật, State Machine, xác thực admin/cán bộ, Audit Log.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-5 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 text-amber-400" />
              <span>{isRunningTests ? 'Đang chạy test...' : 'CHẠY TOÀN BỘ KIỂM THỬ'}</span>
            </button>
          </div>

          {testReport ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">TỔNG TEST CASE</span>
                  <div className="text-xl font-black text-slate-900 mt-1">{testReport.total}</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">VƯỢT QUA (PASSED)</span>
                  <div className="text-xl font-black text-emerald-800 mt-1">{testReport.passed}</div>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-[10px] font-bold text-red-700 uppercase">THẤT BÀI (FAILED)</span>
                  <div className="text-xl font-black text-red-800 mt-1">{testReport.failed}</div>
                </div>
              </div>

              {/* Test List */}
              <div className="space-y-2">
                {testReport.results.map((res, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      res.passed
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {res.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">{res.name}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{res.message}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-500 border border-slate-200">
                          {res.category}
                        </span>
                      </div>
                    </div>

                    <div className="font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {res.durationMs} ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              Bấm nút <strong>"CHẠY TOÀN BỘ KIỂM THỬ"</strong> để khởi động bộ test nghiệp vụ.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
