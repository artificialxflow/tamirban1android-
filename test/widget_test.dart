// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'package:tamirban1android/app.dart';

void main() {
  testWidgets('TamirbanApp renders dashboard placeholder',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: TamirbanApp(),
      ),
    );

    expect(find.text('داشبورد تعمیربان'), findsOneWidget);
    expect(
      find.textContaining('نسخه موبایل در حال آماده‌سازی است'),
      findsOneWidget,
    );
  });
}
