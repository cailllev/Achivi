import 'package:flutter/widgets.dart';

class Utility {
  Utility() {
    throw ("Class should not be initilized");
  }

  // https://medium.com/flutterpub/flutter-keyboard-actions-and-next-focus-field-3260dc4c694
  static void fieldFocusChange(
      BuildContext context, FocusNode currentFocus, FocusNode nextFocus) {
    currentFocus.unfocus();
    FocusScope.of(context).requestFocus(nextFocus);
  }
}
