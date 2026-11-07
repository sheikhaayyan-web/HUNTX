// ==============================================================================
// HUNTX ESPORTS ENGINE — MASTER APPLICATION CONTROLLER
// Seamless State Orchestration Across 28 Screens & Real-Time Sync
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';
import { NotificationDrawer } from './components/navigation/NotificationDrawer';
import { CaptureConfirmationModal } from './components/qr/CaptureConfirmationModal';

// Screens
import { SplashScreen, WelcomeScreen } from './screens/auth/SplashScreen';
import { LoginScreen, RegisterScreen, GuestJoinScreen } from './screens/auth/AuthScreens';
import { HomeScreen, CreateGameScreen, JoinGameScreen } from './screens/game/HomeScreens';
import { LobbyScreen, TeamManagementScreen } from './screens/game/LobbyScreens';
import {
  GameSettingsScreen,
  GameModeSelectScreen,
  CustomModeBuilderScreen,
  ZoneSelectionScreen,
  ZoneStageManagerScreen,
} from './screens/game/SettingsAndZoneScreens';
import {
  ActiveGameDashboard,
  PlayerMapScreen,
  HunterScannerScreen,
  RunnerQRCodeScreen,
  CaptureRequestScreen,
} from './screens/game/ActiveMatchScreens';
import {
  ResultsScreen,
  LeaderboardScreen,
  SpectatorScreen,
  GameHistoryScreen,
  ProfileScreen,
  AppSettingsScreen,
} from './screens/stats/StatsAndProfileScreens';

const MainRouter: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const { activeGame } = useGame();

  const [currentScreen, setCurrentScreen] = useState<string>('splash');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Monitor match status transitions
  useEffect(() => {
    if (!activeGame) return;

    if (activeGame.status === 'active' || activeGame.status === 'countdown') {
      if (currentScreen === 'lobby' || currentScreen === 'team_management' || currentScreen === 'create_game') {
        setCurrentScreen('active_dashboard');
      }
    } else if (activeGame.status === 'finished') {
      setCurrentScreen('results');
    }
  }, [activeGame?.status]);

  // Loading indicator
  if (isLoading && currentScreen !== 'splash') {
    return (
      <div className="min-h-screen bg-huntx-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-huntx-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // 1. Splash Screen
  if (currentScreen === 'splash') {
    return (
      <SplashScreen
        onFinishSplash={() => {
          if (currentUser) {
            setCurrentScreen(activeGame ? (activeGame.status === 'lobby' ? 'lobby' : 'active_dashboard') : 'home');
          } else {
            setCurrentScreen('welcome');
          }
        }}
      />
    );
  }

  // 2. Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onLogin={() => setCurrentScreen('login')}
        onRegister={() => setCurrentScreen('register')}
        onGuest={() => setCurrentScreen('guest_join')}
      />
    );
  }

  // 3. Login Screen
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onBack={() => setCurrentScreen('welcome')}
        onSuccess={() => setCurrentScreen('home')}
        onGoToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  // 4. Register Screen
  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onBack={() => setCurrentScreen('welcome')}
        onSuccess={() => setCurrentScreen('home')}
        onGoToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  // 5. Guest Join Screen
  if (currentScreen === 'guest_join') {
    return (
      <GuestJoinScreen
        onBack={() => setCurrentScreen('welcome')}
        onSuccess={() => setCurrentScreen('home')}
      />
    );
  }

  // Render Screen Content
  const renderScreen = () => {
    switch (currentScreen) {
      // 6. Home Dashboard
      case 'home':
        return <HomeScreen onNavigate={(scr) => setCurrentScreen(scr)} />;

      // 7. Create Game Screen
      case 'create_game':
        return (
          <CreateGameScreen
            onBack={() => setCurrentScreen('home')}
            onSuccess={() => setCurrentScreen('lobby')}
            onSelectZone={() => setCurrentScreen('zone_selection')}
          />
        );

      // 8. Join Game Screen
      case 'join_game':
        return (
          <JoinGameScreen
            onBack={() => setCurrentScreen('home')}
            onSuccess={() => setCurrentScreen('lobby')}
          />
        );

      // 9. Game Lobby
      case 'lobby':
        return <LobbyScreen onNavigate={(scr) => setCurrentScreen(scr)} />;

      // 10. Team Management
      case 'team_management':
        return <TeamManagementScreen onBack={() => setCurrentScreen('lobby')} />;

      // 11. Game Settings
      case 'game_settings':
        return (
          <GameSettingsScreen
            onBack={() => setCurrentScreen(activeGame?.status === 'lobby' ? 'lobby' : 'active_dashboard')}
          />
        );

      // 12. Game Mode Selection
      case 'mode_select':
        return (
          <GameModeSelectScreen
            onBack={() => setCurrentScreen('home')}
            onOpenCustomBuilder={() => setCurrentScreen('custom_builder')}
          />
        );

      // 13. Custom Mode Builder
      case 'custom_builder':
        return <CustomModeBuilderScreen onBack={() => setCurrentScreen('mode_select')} />;

      // 14. Zone Selection Map
      case 'zone_selection':
        return (
          <ZoneSelectionScreen
            onBack={() => setCurrentScreen(activeGame ? 'lobby' : 'create_game')}
          />
        );

      // 15. Zone Stage Manager
      case 'zone_stages':
        return (
          <ZoneStageManagerScreen
            onBack={() => setCurrentScreen(activeGame?.status === 'lobby' ? 'lobby' : 'active_dashboard')}
          />
        );

      // 16. Active Match Dashboard
      case 'active_dashboard':
        return <ActiveGameDashboard onNavigate={(scr) => setCurrentScreen(scr)} />;

      // 17. Player Map Screen
      case 'player_map':
        return <PlayerMapScreen onNavigate={(scr) => setCurrentScreen(scr)} />;

      // 18. Hunter Scanner
      case 'hunter_scanner':
        return <HunterScannerScreen onBack={() => setCurrentScreen('active_dashboard')} />;

      // 19. Runner QR Pass
      case 'runner_qr':
        return <RunnerQRCodeScreen onBack={() => setCurrentScreen('active_dashboard')} />;

      // 20 & 21. Capture Feeds & Approvals
      case 'capture_requests':
        return <CaptureRequestScreen onBack={() => setCurrentScreen('active_dashboard')} />;

      // 23. Live Leaderboard
      case 'leaderboard':
        return (
          <LeaderboardScreen
            onBack={() => setCurrentScreen(activeGame ? (activeGame.status === 'lobby' ? 'lobby' : 'active_dashboard') : 'home')}
          />
        );

      // 24. Spectator Screen
      case 'spectator':
        return <SpectatorScreen onBack={() => setCurrentScreen('active_dashboard')} />;

      // 25. Game Results Screen
      case 'results':
        return <ResultsScreen onReturnHome={() => setCurrentScreen('home')} />;

      // 26. Game History
      case 'game_history':
        return <GameHistoryScreen onBack={() => setCurrentScreen('home')} />;

      // 27. User Profile
      case 'profile':
        return (
          <ProfileScreen
            onBack={() => setCurrentScreen('home')}
            onOpenSettings={() => setCurrentScreen('app_settings')}
          />
        );

      // 28. App Settings
      case 'app_settings':
        return <AppSettingsScreen onBack={() => setCurrentScreen('profile')} />;

      default:
        return <HomeScreen onNavigate={(scr) => setCurrentScreen(scr)} />;
    }
  };

  return (
    <div className="min-h-screen bg-huntx-bg text-huntx-text flex flex-col font-sans selection:bg-huntx-accent selection:text-black">
      {/* Top Header */}
      {currentScreen !== 'player_map' && (
        <Header
          activeScreen={currentScreen}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenProfile={() => setCurrentScreen('profile')}
        />
      )}

      {/* Main Screen Body */}
      <main className="flex-1 w-full">{renderScreen()}</main>

      {/* Persistent Bottom Esports HUD */}
      <BottomNav currentScreen={currentScreen} onNavigate={(scr) => setCurrentScreen(scr)} />

      {/* Real-time Capture Confirmation Modal */}
      <CaptureConfirmationModal />

      {/* Tactical Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <MainRouter />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
