import 'package:achivi/screens/registerScreen/register_screen_user.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget makeTesteableWidget({Widget child}) {
    return MaterialApp(
      home: child,
    );
  }

  const MaterialApp achivi = MaterialApp(
    home: Scaffold(
      body: RegisterScreenUser(),
    ),
  );

  testWidgets('Renders', (WidgetTester tester) async {
    await tester.pumpWidget(achivi);
    expect(find.text('Gib dein E-Mail und dein Passwort ein'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.byType(RaisedButton), findsOneWidget);
  });

  /*testWidgets('E-Mail already taken', (WidgetTester tester) async {

    final widget = makeTesteableWidget(
      child: RegisterScreenUser(),
    );

    await tester.pumpWidget(widget);


    expect(find.text('Es existiert bereits ein Nutzer mit dieser E-Mail.'), findsNothing);

    final Finder email = find.widgetWithText(TextFormField, 'E-Mail');
    final Finder passwort = find.widgetWithText(TextFormField, 'Passwort');
    final Finder weiter = find.widgetWithText(RaisedButton, 'WEITER');

    await tester.enterText(email, 'selma@test.ch');
    await tester.enterText(passwort, 'test123456');

    await tester.tap(weiter);
    await tester.pump(new Duration(milliseconds: 5000));

    expect(find.text("Internal Server Error"), findsOneWidget);
  });*/

  /* testWidgets('Form can be submitted', (WidgetTester tester) async {
    await tester.pumpWidget(achivi);

    final Finder email = find.widgetWithText(TextFormField, 'E-Mail');
    final Finder passwort = find.widgetWithText(TextFormField, 'Passwort');
    final Finder weiter = find.widgetWithText(RaisedButton, 'WEITER');

    expect(find.text('User erstellt'), findsNothing);

    await tester.enterText(email, 'muster@zhaw.ch');
    await tester.enterText(passwort, 'test123456');

    await tester.tap(weiter);
    await tester.pump();

    expect(find.text('User erstellt'), findsOneWidget);
  });*/
}
