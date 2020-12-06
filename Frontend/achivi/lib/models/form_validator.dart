class FormValidator {
  static const String emptyValue = 'Bitte geben Sie einen Wert ein';

  String validateName(String value) {
    String returnValue;
    Pattern pattern = r'^[^0-9]+$';
    RegExp regex = new RegExp(pattern);
    if (value.isEmpty) {
      returnValue = emptyValue;
    } else if (!regex.hasMatch(value))
      returnValue = 'Geben Sie einen gültigen Namen ein';
    else {
      returnValue = null;
    }
    return returnValue;
  }

  String validatePassword(String value) {
    String returnValue;
    Pattern pattern = r'^[\S]+$';
    RegExp regex = new RegExp(pattern);
    if (value.isEmpty) {
      returnValue = emptyValue;
    } else if (!regex.hasMatch(value) || value.length < 10)
      returnValue = 'Passwort muss mind. 10 Zeichen lang sein';
    else {
      returnValue = null;
    }
    return returnValue;
  }

  String validateEmail(String value) {
    String returnValue;
    Pattern pattern =
        r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
    RegExp regex = new RegExp(pattern);
    if (value.isEmpty) {
      returnValue = emptyValue;
    } else if (!regex.hasMatch(value))
      returnValue = 'Geben Sie eine gültige E-Mail-Adresse ein';
    else {
      returnValue = null;
    }
    return returnValue;
  }

  String validateDate(String value) {
    if (value.isEmpty) {
      return emptyValue;
    } else
      return null;
  }

  String validateText(String value,
      [int maxLength = 65000, int minLength = 0, bool canBeNull = false]) {
    if (value.isEmpty && !canBeNull) {
      return emptyValue;
    }

    if (value.length < minLength) {
      return 'Der Text muss mindestens $minLength Zeichen lang sein';
    }

    if (value.length > maxLength) {
      return 'Der Text darf höchstens $maxLength Zeichen lang sein';
    }

    return null;
  }
}
