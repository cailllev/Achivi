import 'dart:convert';

import 'package:http/http.dart';

import 'package:achivi/error/server_exception.dart';
import 'package:achivi/models/achievement.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class AchievementRequest {
  static Future<List<Achievement>> getGlobalAchievements() async {
    return await getGroupAchievements('Community');
  }

  static Future<List<Achievement>> getGroupAchievements(
      String groupName) async {
    var url = 'api/groups/$groupName/achievements';
    Response response = await DataUtility.get(url);

    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      throw ServerException(response);
    }

    Iterable list = json.decode(response.body)['message'];
    var achievements =
        list.map((model) => Achievement.fromJson(model)).toList();

    return achievements;
  }

  static Future<bool> claimAchievement(int id) async {
    Response response = await DataUtility.post(
        'api/profiles/${DataService.profileName}/achievements/$id/claim', {});

    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      throw ServerException(response);
    }

    return true;
  }

  static Future<List<Achievement>> getClaimedAchievements() async {
    Response response = await DataUtility.get(
        'api/profiles/${DataService.profileName}/achievements/claimed');

    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      throw ServerException(response);
    }
    Iterable list = json.decode(response.body);
    var achievements =
        list.map((model) => Achievement.fromJson(model)).toList();
    return achievements;
  }

  static Future<bool> flagAchievement(int id) async {
    Response response = await DataUtility.post(
        'api/profiles/${DataService.profileName}/achievements/$id/flag', {});

    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      throw ServerException(response);
    }

    return true;
  }

  static Future<bool> deflagAchievement(int id) async {
    Response response = await DataUtility.delete(
        'api/profiles/${DataService.profileName}/achievements/$id/flag');

    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      throw ServerException(response);
    }

    return true;
  }

  static Future<List<Achievement>> getFlaggedAchievements() async {
    Response response = await DataUtility.get(
        'api/profiles/${DataService.profileName}/achievements/flagged');

    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      throw ServerException(response);
    }

    Iterable list = json.decode(response.body);
    var achievements =
        list.map((model) => Achievement.fromJson(model)).toList();
    return achievements;
  }
}
