import 'package:flutter/material.dart';
import 'app.dart';

// LEARNING: Application Entrypoint
// `main()` is the starting function executed when the Flutter app launches.
// `WidgetsFlutterBinding.ensureInitialized()` ensures Flutter bindings are ready before any async operations or storage initialization occur.

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DummyApiApp());
}
