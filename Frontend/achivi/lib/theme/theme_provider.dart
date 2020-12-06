import 'package:flutter/material.dart';
import 'package:hexcolor/hexcolor.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeData _selectedTheme;

  static Color primaryColor = Hexcolor('#ff9e80');
  static Color primaryColorLight = Hexcolor('#ffd0b0');
  static Color primaryColorDark = Hexcolor('#c96f53');
  static Color accentColor = Hexcolor('#c8e6c9');
  static Color accentColorLight = Hexcolor('#fafffb');
  static Color accentColorDark = Hexcolor('#96b397');

  ThemeData light = ThemeData.light().copyWith(
    primaryColor: Hexcolor('#ff9e80'),
    primaryColorLight: Hexcolor('#ffd0b0'),
    primaryColorDark: Hexcolor('#c96f53'),
    accentColor: Hexcolor('#c8e6c9'),
    indicatorColor: Hexcolor('#96b397'),
    backgroundColor: accentColorLight,
    iconTheme: IconThemeData(color: Colors.black),
    accentIconTheme: IconThemeData(color: Colors.white),
    bottomAppBarColor: primaryColorLight,
    textTheme: TextTheme(
      headline5:
          TextStyle(fontFamily: 'Roboto', fontSize: 22.0, color: Colors.black),
      headline6: TextStyle(
          fontFamily: 'Roboto',
          fontSize: 26.0,
          color: Colors.white,
          fontWeight: FontWeight.w500,
          letterSpacing: 2),
      headline4:
          TextStyle(fontFamily: 'Oswald', fontSize: 30, color: Colors.black),
      headline3:
          TextStyle(fontFamily: 'Oswald', fontSize: 25, color: Colors.black),
      headline2: TextStyle(
          fontFamily: 'Roboto',
          fontSize: 20,
          color: Colors.black,
          fontWeight: FontWeight.w400,
          letterSpacing: 2),
      headline1: TextStyle(
          fontFamily: 'Roboto',
          fontSize: 15,
          color: Colors.black,
          fontWeight: FontWeight.w400),
      caption: TextStyle(
          fontFamily: 'Oswald',
          fontSize: 25,
          color: Colors.black,
          height: 0.95),
      button: TextStyle(
          fontFamily: 'Roboto',
          fontSize: 20,
          color: accentColorLight,
          fontWeight: FontWeight.w500,
          letterSpacing: 2),
      bodyText1: TextStyle(
        fontFamily: 'Oswald',
        fontSize: 16.0,
        color: Colors.black,
      ),
      bodyText2: TextStyle(
          fontFamily: 'Roboto',
          fontSize: 14.0,
          color: Colors.black,
          fontWeight: FontWeight.w300),
      overline:
          TextStyle(fontFamily: 'Roboto', fontSize: 12.0, color: Colors.black),
    ),
    buttonTheme: ButtonThemeData(
        buttonColor: primaryColorDark,
        shape: RoundedRectangleBorder(
          borderRadius: new BorderRadius.circular(18.0),
        )),
  );

  ThemeData dark = ThemeData.dark().copyWith(
    primaryColor: Colors.green[900],
    accentColor: Colors.amber[100],
    brightness: Brightness.dark,
    backgroundColor: Colors.grey[850],
    bottomAppBarColor: primaryColorLight,
    textTheme: TextTheme(
      headline5: TextStyle(
          fontFamily: 'OleoScript', fontSize: 22.0, color: Colors.white),
      headline6: TextStyle(
          fontFamily: 'OleoScript', fontSize: 26.0, color: Colors.white),
      headline4: TextStyle(
          fontFamily: 'FrancoisOne', fontSize: 34.0, color: Colors.white),
      caption: TextStyle(
          fontFamily: 'FrancoisOne',
          fontSize: 18.0,
          color: Colors.white,
          height: 0.95),
      bodyText1: TextStyle(
        fontFamily: 'SpecialElite',
        fontSize: 16.0,
        color: Colors.white,
      ),
      bodyText2: TextStyle(
          fontFamily: 'SpecialElite', fontSize: 14.0, color: Colors.white),
      overline: TextStyle(
          fontFamily: 'SpecialElite', fontSize: 12.0, color: Colors.white),
    ),
  );

  ThemeProvider({bool isDarkMode}) {
    this._selectedTheme = isDarkMode ? dark : light;
  }

  ThemeData get getTheme => _selectedTheme;

  void swapTheme() {
    _selectedTheme = _selectedTheme == dark ? light : dark;
    notifyListeners();
  }
}
