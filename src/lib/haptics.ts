import * as Haptics from 'expo-haptics';
import { FEATURES } from '@/config/features';

/**
 * Enhanced Haptic Feedback Manager
 * Provides contextual haptic feedback for premium iOS native feel
 */
class HapticManager {
  private enabled = FEATURES.enableHapticFeedback;

  /**
   * Light feedback for subtle UI interactions
   * Use for: Button highlights, tab switches, picker selection
   */
  light = () => {
    if (!this.enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /**
   * Medium feedback for user actions
   * Use for: Button presses, message send, confirmations
   */
  medium = () => {
    if (!this.enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /**
   * Heavy feedback for significant actions
   * Use for: Long press actions, errors, important alerts
   */
  heavy = () => {
    if (!this.enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  /**
   * Success feedback for positive outcomes
   * Use for: Message sent, save successful, login success
   */
  success = () => {
    if (!this.enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  /**
   * Error feedback for negative outcomes
   * Use for: Network errors, validation failures, crashes
   */
  error = () => {
    if (!this.enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  /**
   * Warning feedback for caution situations
   * Use for: Unsaved changes, destructive actions
   */
  warning = () => {
    if (!this.enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  /**
   * Selection feedback for pickers and lists
   * Use for: Scroll picker changes, list item selection
   */
  selection = () => {
    if (!this.enabled) return;
    Haptics.selectionAsync();
  };

  /**
   * Convenience methods for common actions
   */
  
  // Button interactions
  buttonPress = this.medium;
  buttonHighlight = this.light;
  
  // Input interactions
  textInput = this.light;
  keyboardKey = this.light;
  
  // Navigation
  tabSwitch = this.selection;
  screenTransition = this.light;
  
  // Gestures
  swipeAction = this.medium;
  longPress = this.heavy;
  
  // Messages and notifications
  messageSent = this.success;
  messageReceived = this.light;
  notificationReceived = this.medium;
  
  // Authentication
  authSuccess = this.success;
  authError = this.error;
  biometricAuth = this.medium;
}

export const haptics = new HapticManager();

/**
 * Usage examples:
 * 
 * haptics.light();           // Subtle UI feedback
 * haptics.buttonPress();     // Button interactions
 * haptics.messageSent();     // Message sent successfully
 * haptics.authError();       // Login failed
 * haptics.selection();       // Picker/list selection
 */