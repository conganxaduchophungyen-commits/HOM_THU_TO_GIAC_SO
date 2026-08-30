import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { Footer } from './components/common/Footer';
import { CitizenHome } from './components/citizen/CitizenHome';
import { SubmitCaseForm } from './components/citizen/SubmitCaseForm';
import { SubmissionReceipt } from './components/citizen/SubmissionReceipt';
import { CaseTracker } from './components/citizen/CaseTracker';
import { InstructionModal, LegalNoticeModal } from './components/citizen/InstructionModal';
import { OfficerLogin } from './components/officer/OfficerLogin';
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { GasDeploymentCenter } from './components/officer/GasDeploymentCenter';
import { OfficerUser, CaseRecord } from './types';
import { storageService } from './services/storageService';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<
    'home' | 'submit' | 'track' | 'guide' | 'officer' | 'gas_center'
  >('home');

  // Auth State
  const [currentUser, setCurrentUser] = useState<OfficerUser | null>(() => {
    return storageService.getCurrentUser();
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals State
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Case Submission & Tracking State
  const [lastSubmittedCase, setLastSubmittedCase] = useState<CaseRecord | null>(null);
  const [trackingCaseId, setTrackingCaseId] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState<string>('');

  // Handle Login
  const handleLoginSuccess = (user: OfficerUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    setCurrentTab('officer');
  };

  // Handle Logout
  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setCurrentTab('home');
  };

  // Handle Case Created
  const handleCaseSubmitted = (caseRecord: CaseRecord) => {
    setLastSubmittedCase(caseRecord);
  };

  // Navigate to Track
  const handleGoToTrackWithCode = (cId: string, tCode: string) => {
    setLastSubmittedCase(null);
    setTrackingCaseId(cId);
    setTrackingCode(tCode);
    setCurrentTab('track');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4] font-sans text-[#1a1a1a] selection:bg-[#8B0000] selection:text-white">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'guide') {
            setIsGuideModalOpen(true);
          } else if (tab === 'officer' && !currentUser) {
            setIsLoginModalOpen(true);
          } else {
            setLastSubmittedCase(null);
            setCurrentTab(tab);
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Emergency Banner */}
      <EmergencyBanner />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Citizen Home */}
        {currentTab === 'home' && !lastSubmittedCase && (
          <CitizenHome
            onGoToSubmit={() => {
              setLastSubmittedCase(null);
              setCurrentTab('submit');
            }}
            onGoToTrack={() => {
              setLastSubmittedCase(null);
              setCurrentTab('track');
            }}
            onGoToGuide={() => setIsGuideModalOpen(true)}
            onOpenLegalNotice={() => setIsLegalModalOpen(true)}
          />
        )}

        {/* Tab 2: Submit Case Form or Submission Receipt */}
        {currentTab === 'submit' && (
          <>
            {lastSubmittedCase ? (
              <SubmissionReceipt
                caseRecord={lastSubmittedCase}
                onGoToTrack={(cId, tCode) => handleGoToTrackWithCode(cId, tCode)}
                onGoHome={() => {
                  setLastSubmittedCase(null);
                  setCurrentTab('home');
                }}
              />
            ) : (
              <SubmitCaseForm
                onSuccess={handleCaseSubmitted}
                onCancel={() => setCurrentTab('home')}
              />
            )}
          </>
        )}

        {/* Tab 3: Case Tracker */}
        {currentTab === 'track' && (
          <CaseTracker
            initialCaseId={trackingCaseId}
            initialTrackingCode={trackingCode}
          />
        )}

        {/* Tab 4: GAS Deployment Center */}
        {currentTab === 'gas_center' && <GasDeploymentCenter />}

        {/* Tab 5: Officer Dashboard (Protected) */}
        {currentTab === 'officer' && currentUser && (
          <OfficerDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      <OfficerLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Instruction Modal */}
      <InstructionModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Legal Notice Modal */}
      <LegalNoticeModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
