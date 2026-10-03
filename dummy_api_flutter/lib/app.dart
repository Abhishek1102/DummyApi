import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/services/auth_service.dart';
import 'core/theme/app_theme.dart';
import 'home_screen.dart';
import 'mvc/basic_crud/controllers/product_controller.dart';
import 'mvc/query_params/controllers/user_controller.dart';
import 'mvc/auth/controllers/auth_controller.dart';
import 'mvc/headers/controllers/header_controller.dart';
import 'mvc/upload/controllers/upload_controller.dart';
import 'mvc/posts_comments/controllers/post_controller.dart';
import 'mvc/advanced/controllers/advanced_controller.dart';
import 'mvc/errors/controllers/error_simulation_controller.dart';

// LEARNING: Root Application & Provider Injection Setup
// In Flutter applications, `MultiProvider` is declared at the root level so that controllers
// are instantiated once and accessed across views without recreating network state.

class DummyApiApp extends StatelessWidget {
  const DummyApiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => ProductController()),
        ChangeNotifierProvider(create: (_) => UserController()),
        ChangeNotifierProvider(create: (_) => AuthController()),
        ChangeNotifierProvider(create: (_) => HeaderController()),
        ChangeNotifierProvider(create: (_) => UploadController()),
        ChangeNotifierProvider(create: (_) => PostController()),
        ChangeNotifierProvider(create: (_) => AdvancedController()),
        ChangeNotifierProvider(create: (_) => ErrorSimulationController()),
      ],
      child: MaterialApp(
        title: 'Dummy API Learn',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const HomeScreen(),
      ),
    );
  }
}
