import 'package:flutter_test/flutter_test.dart';
import 'package:dummy_api_flutter/app.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DummyApiApp());
    expect(find.byType(DummyApiApp), findsOneWidget);
  });
}
