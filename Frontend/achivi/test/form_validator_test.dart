import 'package:achivi/models/form_validator.dart';
import 'package:test/test.dart';

void main() {
  FormValidator fM = new FormValidator();

  group('NameValidation', () {
    test('empty value should throw warning', () {
      String warning = fM.validateName('');
      expect(warning, 'Bitte geben Sie einen Wert ein');
    });

    test('forbbiden value should throw warning', () {
      String warning = fM.validateName('55ff55');
      expect(warning, 'Geben Sie einen gültigen Namen ein');
    });

    test('valid value should not throw warning', () {
      String warning = fM.validateName('Selma');
      expect(warning, null);
    });
  });

  group('PasswordValidation', () {
    test('empty value should throw warning', () {
      String warning = fM.validatePassword('');
      expect(warning, 'Bitte geben Sie einen Wert ein');
    });

    test('forbbiden value should throw warning', () {
      String warning = fM.validatePassword('34ds ssdf');
      expect(warning, 'Passwort muss mind. 10 Zeichen lang sein');
    });

    test('valid value should not throw warning', () {
      String warning = fM.validatePassword('asd34/_de3');
      expect(warning, null);
    });
  });

  group('EMailValidation', () {
    test('empty value should throw warning', () {
      String warning = fM.validateEmail('');
      expect(warning, 'Bitte geben Sie einen Wert ein');
    });

    test('forbbiden value should throw warning', () {
      String warning = fM.validateEmail('s.ch');
      expect(warning, 'Geben Sie eine gültige E-Mail-Adresse ein');
    });

    test('valid value should not throw warning', () {
      String warning = fM.validateEmail('test@zhaw.ch');
      expect(warning, null);
    });
  });

  group('DateValidation', () {
    test('empty value should throw warning', () {
      String warning = fM.validateDate('');
      expect(warning, 'Bitte geben Sie einen Wert ein');
    });

    test('valid value should not throw warning', () {
      String warning = fM.validateDate('12-02-2020');
      expect(warning, null);
    });
  });
}
