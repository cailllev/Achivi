import 'package:flutter_test/flutter_test.dart';

import 'package:achivi/models/form_validator.dart';

void main() {
  FormValidator formValidator = new FormValidator();

  group('validate name', () {
    test('is a correct name', () {
      String name = 'Maximilian';
      String answer = formValidator.validateName(name);
      expect(answer, null);
    });

    test('empty name', () {
      String name = '';
      expect(formValidator.validateName(name), 'Bitte geben Sie einen Wert ein');
    });

    test('non-valid characters in name', () {
      String name = 'Hans23';
      expect(formValidator.validateName(name), 'Geben Sie einen gültigen Namen ein');
    });
  });

  group('validate passwords', () {
    test('correct password', () {
      String password = 'GeheimesKennwort12';
      expect(formValidator.validatePassword(password), null);
    });

    test('to short password', () {
      String password = 'asdf12';
      expect(formValidator.validatePassword(password), 'Passwort muss mind. 10 Zeichen lang sein');
    });

    test('no password given', () {
      String password = '';
      expect(formValidator.validatePassword(password), 'Bitte geben Sie einen Wert ein');
    });
  });

  group('validate email', () {
    test('correct email address', () {
      String email = 'maxmustermann@email.com';
      expect(formValidator.validateEmail(email), null);
    });

    test('empty email address', () {
      String email = '';
      expect(formValidator.validateEmail(email), 'Bitte geben Sie einen Wert ein');
    });

    test('non-valid email address', () {
      String email = 'asdfg';
      String email2 = '%s@jomd';
      String expectedAnswer = 'Geben Sie eine gültige E-Mail-Adresse ein';
      expect(formValidator.validateEmail(email), expectedAnswer);
      expect(formValidator.validateEmail(email2), expectedAnswer);
    });
  });

  group('validate date', () {
    test('correct date', () {
      String date = '01.01.2020';
      expect(formValidator.validateDate(date), null);
    });

    test('empty date', () {
      String date = '';
      expect(formValidator.validateDate(date), 'Bitte geben Sie einen Wert ein');
    });
  });

  group('validate text', () {
    String text = 'Dies ist ein Beispieltext. Dieser Text ist zu Demonstrationszwecken 84 Zeichen lang.';
    test('has correct length', () {
      String validated = formValidator.validateText(text);
      expect(validated, null);
    });

    test('cannot be empty', () {
      String validated = formValidator.validateText('');
      expect(validated, 'Bitte geben Sie einen Wert ein');
    });

    test('can be empty', () {
      String validated = formValidator.validateText('', 1000, 0, true);
      expect(validated, null);
    });

    test('is to short', () {
      String validated = formValidator.validateText(text, 1000, 85);
      expect(validated, 'Der Text muss mindestens 85 Zeichen lang sein');
    });

    test('is to long', () {
      String validated = formValidator.validateText(text, 83, 0);
      expect(validated, 'Der Text darf höchstens 83 Zeichen lang sein');
    });
  });
}