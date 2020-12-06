import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;

import 'package:device_info/device_info.dart';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;

import 'package:achivi/services/persistence_service.dart';

class DataUtility {
  static Map<String, String> _headers = {
    'Content-Type': 'application/json',
  };
  static String _url = 'http://160.85.252.106/';

  static post(var path, var msg) async {
    await buildPlatformIdHeader();
    final body = jsonEncode(msg);
    final url = _url + path;
    var response = await http.post(url, body: body, headers: _headers);
    updateCookie(response);
    return response;
  }

  static delete(var path) async {
    await buildPlatformIdHeader();
    final url = _url + path;
    var response = await http.delete(url, headers: _headers);
    updateCookie(response);
    return response;
  }

  static get(var path) async {
    await buildPlatformIdHeader();
    final url = _url + path;
    var response = await http.get(url, headers: _headers);
    updateCookie(response);
    return response;
  }

  static put(var path, var msg) async {
    await buildPlatformIdHeader();
    final body = jsonEncode(msg);
    final url = _url + path;
    var response = await http.put(url, body: body, headers: _headers);
    updateCookie(response);
    return response;
  }

  static void updateCookie(http.Response response) async {
    String rawCookie = response.headers['set-cookie'];
    if (rawCookie != null) {
      int index = rawCookie.indexOf(';');
      _headers['cookie'] =
          (index == -1) ? rawCookie : rawCookie.substring(0, index);
      PersistenceService.setCookie(rawCookie);
    }
  }

  static void loadCookie() async {
    final persCookie = await PersistenceService.getCookie();
    if (persCookie != null) {
      _headers['cookie'] = persCookie;
    }
  }

  static Future<String> getId() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      AndroidDeviceInfo androidDeviceInfo = await deviceInfo.androidInfo;
      return androidDeviceInfo.androidId.toString(); // unique ID on Android
    } else if (Platform.isIOS) {
      IosDeviceInfo iosDeviceInfo = await deviceInfo.iosInfo;
      return iosDeviceInfo.identifierForVendor.toString(); // unique ID on iOS
    } else {
      return "SEFIsifei*489fa*)ASF)A3jr2f92fsdkf2si29+*F";
    }
  }

  static buildPlatformIdHeader() async {
    String deviceId = await getId();
    var bytes = utf8.encode(deviceId);
    var digest = sha256.convert(bytes).toString();
    _headers['PlatformId'] = digest;
  }
}
