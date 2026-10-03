import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// LEARNING: Learning Banner Widget
// Displays clear educational notes at the top of each screen so the user immediately understands
// what concept, HTTP method, or parameter style is being demonstrated.

class LearningBanner extends StatelessWidget {
  final String title;
  final String description;
  final List<String>? keyConcepts;

  const LearningBanner({
    super.key,
    required this.title,
    required this.description,
    this.keyConcepts,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE3F2FD), // Light primary blue tint
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF90CAF9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.school_rounded, color: Color(0xFF1565C0), size: 22),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0D47A1),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(0xFF1E88E5),
              height: 1.4,
            ),
          ),
          if (keyConcepts != null && keyConcepts!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: keyConcepts!.map((concept) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFBBDEFB)),
                  ),
                  child: Text(
                    '• $concept',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1565C0),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}
