import 'package:shared_preferences/shared_preferences.dart';

class PersistenceService {
  static getCookie() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final cookie = prefs.getString('sessionCookie');
    return cookie;
  }

  static setCookie(sessionCookie) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('sessionCookie', sessionCookie);
  }

  static deleteCookie() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.remove('sessionCookie');
  }
}
