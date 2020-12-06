import 'package:achivi/screens/registerScreen/register_screen_profile.dart';
import 'package:flutter/material.dart';

void main() {
  const MaterialApp achivi = MaterialApp(
    home: Scaffold(
      body: RegisterScreenProfile(),
    ),
  );

  /*testWidgets('Renders', (WidgetTester tester) async {
    await tester.pumpWidget(achivi);
    expect(find.text('Gib deinen Namen und dein Geburtsdatum ein'), findsOneWidget);
    expect(find.byType(TextFormField),findsNWidgets(4));
    expect(find.byType(RaisedButton),findsOneWidget);
  });*/

  /*testWidgets('Form can be submitted', (WidgetTester tester) async {
    await tester.pumpWidget(achivi);
    final Finder vorname = find.widgetWithText(TextFormField, 'Vorname');
    final Finder nachname = find.widgetWithText(TextFormField, 'Nachname');
    final Finder userName = find.widgetWithText(TextFormField, 'Benutzername');
    final Finder geburtsdatum = find.widgetWithText(TextFormField, 'Geburtsdatum');
    final Finder registrieren = find.widgetWithText(RaisedButton, 'REGISTRIEREN');

    expect(find.text(''Registrierung erfolgreich''), findsNothing);

    await tester.enterText(vorname, 'Peter');
    await tester.enterText(nachname, 'Muster');
    await tester.enterText(userName, 'testUser');
    await tester.enterText(passwort, 'test123');
    await tester.enterText(geburtsdatum, '20-11-1998');

    await tester.tap(registrieren);
    await tester.pump();

    expect(find.text('Registrierung erfolgreich'), findsOneWidget);
  });*/
}
