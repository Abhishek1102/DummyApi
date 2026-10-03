import 'package:flutter/material.dart';

// LEARNING: App Design Tokens & Color Palette
// Maintaining a clean, professional palette is critical for commercial Flutter apps.
// Avoid neon colors; stick to high-contrast, accessible, harmonic shades.

class AppColors {
  // Primary Palette
  static const Color primary = Color(0xFF1565C0); // Deep Royal Blue
  static const Color primaryLight = Color(0xFF5E92F3);
  static const Color primaryDark = Color(0xFF003C8F);

  // Secondary / Accent Palette
  static const Color accent = Color(0xFF00897B); // Teal Accent
  static const Color accentLight = Color(0xFF4EBAAA);

  // Neutral Palette
  static const Color background = Color(0xFFF8F9FA); // Off-white / Cool Grey
  static const Color surface = Color(0xFFFFFFFF); // Pure White
  static const Color cardBg = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE0E0E0);

  // Text Colors
  static const Color textPrimary = Color(0xFF212121); // Charcoal Dark
  static const Color textSecondary = Color(0xFF757575); // Medium Grey
  static const Color textLight = Color(0xFFBDBDBD);

  // Status & HTTP Feedback Colors
  static const Color success = Color(0xFF2E7D32); // 200 OK
  static const Color warning = Color(0xFFED6C02); // 400 Validation / Warning
  static const Color error = Color(0xFFC62828); // 500 Server Error / 401 Unauthorized
  static const Color info = Color(0xFF0288D1); // Information

  // Category Badge Colors
  static const Color badgeBlue = Color(0xFFE3F2FD);
  static const Color badgeGreen = Color(0xFFE8F5E9);
  static const Color badgeOrange = Color(0xFFFFF3E0);
  static const Color badgeRed = Color(0xFFFFEBEE);
  static const Color badgePurple = Color(0xFFF3E5F5);
}
