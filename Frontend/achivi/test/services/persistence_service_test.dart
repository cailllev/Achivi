import 'package:flutter_test/flutter_test.dart';

import 'package:achivi/services/persistence_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  SharedPreferences.setMockInitialValues({});

  test('No Cookie here initial', () async {
    var persistentCookie = await PersistenceService.getCookie();
    expect(persistentCookie, null);

  });

  test('Get Cookie', () async {
    var cookie = '1234';
    SharedPreferences.setMockInitialValues({
      "sessionCookie": cookie
    });
    expect(await PersistenceService.getCookie(), cookie);
  });

  test('Save Cookie', () async {
    var cookie = '1234';
    PersistenceService.setCookie(cookie);
    expect(await PersistenceService.getCookie(), cookie);
    var newCookie = '1234';
    PersistenceService.setCookie(newCookie);
    expect(await PersistenceService.getCookie(), newCookie);
  });

  test('Delete Cookie', () async {
    SharedPreferences.setMockInitialValues({
      "sessionCookie": "1234"
    });

    await PersistenceService.deleteCookie();
    expect(await PersistenceService.getCookie(), null);
  });
}