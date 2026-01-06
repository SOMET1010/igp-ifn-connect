/**
 * Shared UI Components
 * 
 * Barrel export pour tous les composants UI partagés
 * Architecture unifiée: tous les composants sont maintenant dans src/shared/ui/
 */

// Accessibility & Controls
export { AccessibilityControls } from './AccessibilityControls';
export { FloatingAccessibilityButton } from './FloatingAccessibilityButton';
export { ThemeToggle } from './ThemeToggle';

// Animation
export { AnimatedList } from './AnimatedList';
export { AnimatedListItem } from './AnimatedListItem';
export { Confetti } from './Confetti';

// Audio
export { AudioButton } from './AudioButton';
export { AudioLevelMeter } from './AudioLevelMeter';
export { AudioPlayingIndicator } from './AudioPlayingIndicator';
export { VoiceHeroButton } from './VoiceHeroButton';
export { VoiceInput } from './VoiceInput';

// Auth & Login
export { AuthErrorBanner, createAuthError } from './AuthErrorBanner';
export { LoginCard } from './LoginCard';
export { SimpleLoginPage } from './SimpleLoginPage';
export { UnifiedLoginPage } from './UnifiedLoginPage';

// Backgrounds & Patterns
export { BackgroundDecor } from './BackgroundDecor';
export { HeroOverlay } from './HeroOverlay';
export { ImmersiveBackground } from './ImmersiveBackground';
export { WaxPattern } from './WaxPattern';

// Cards
export { GlassCard } from './GlassCard';
export { HeroActionCard } from './HeroActionCard';
export { ProfileInfoCard } from './ProfileInfoCard';
export { SafeCard } from './SafeCard';
export { StatCard } from './StatCard';
export { UnifiedActionCard } from './UnifiedActionCard';
export { UnifiedListCard } from './UnifiedListCard';

// Data Display
export { FilterChips, type FilterOption } from './FilterChips';
export { SafeList } from './SafeList';
export { SafeMetric } from './SafeMetric';
export { StatusBadge, type StatusType } from './StatusBadge';
export { VibrantTotalBar } from './VibrantTotalBar';

// Error & State
export { ErrorBoundary } from './ErrorBoundary';
export { LoadingState, ErrorState, EmptyState } from './StateComponents';
export { RetryIndicator } from './RetryIndicator';

// Forms & Input
export { CurrencyCalculator } from './CurrencyCalculator';
export { GPSCapture } from './GPSCapture';
export { PhoneInput } from './PhoneInput';
export { PhoneNumPad } from './PhoneNumPad';
export { PhotoCapture } from './PhotoCapture';
export { SearchInput } from './SearchInput';

// Headers & Navigation
export { EnhancedHeader } from './EnhancedHeader';
export { InstitutionalFooter } from './InstitutionalFooter';
export { InstitutionalHeader } from './InstitutionalHeader';
export { PageHero } from './PageHero';
export { UnifiedBottomNav, type NavItem } from './UnifiedBottomNav';

// Help & Onboarding
export { ContextualHelp } from './ContextualHelp';
export { OnboardingTutorial } from './OnboardingTutorial';
export { StepProgress } from './StepProgress';
export { TantieMascot } from './TantieMascot';

// Language
export { LanguageSelector } from './LanguageSelector';
export { LanguageToggle } from './LanguageToggle';

// Notifications
export { NotificationBadge } from './NotificationBadge';
export { NotificationDropdown } from './NotificationDropdown';
export { NotificationToggle } from './NotificationToggle';

// Indicators
export { DemoBanner } from './DemoBanner';
export { OfflineIndicator } from './OfflineIndicator';

// Actions
export { GiantActionButton } from './GiantActionButton';
export { Pictogram } from './Pictogram';
