import 'dart:convert';

import 'package:http/http.dart';

import 'package:achivi/error/server_exception.dart';
import 'package:achivi/models/follower.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class FollowerRequest {
  // They follow me
  static Future<List<Follower>> getFollowers([String profileName]) async {
    profileName = profileName ?? DataService.profileName;
    return (await _requestFollowers(
        'api/profiles/$profileName/followers', 'follower'));
  }

  // I follow them
  static Future<List<Follower>> getFollowees([String profileName]) async {
    profileName = profileName ?? DataService.profileName;
    return (await _requestFollowers(
        'api/profiles/$profileName/followees', 'followee'));
  }

  static Future<List<Follower>> getFriends() async {
    return (await _requestFollowers(
        'api/profiles/${DataService.profileName}/friends', 'friend'));
  }

  static Future<bool> addFollowee(String followee) async {
    Response response = await DataUtility.post(
      'api/profiles/${DataService.profileName}/followees',
      {'followeeProfileName': followee},
    );

    Map body = json.decode(response.body);

    if (response.statusCode != 200) {
      throw new ServerException(response);
    }

    return body['status'];
  }

  static Future<bool> removeFollowee(String followee) async {
    Response response = await DataUtility.delete(
        'api/profiles/${DataService.profileName}/followees/$followee');

    Map body = json.decode(response.body);

    if (response.statusCode != 200) {
      throw new ServerException(response);
    }

    return body['status'];
  }

  static Future<List<Follower>> _requestFollowers(
      String path, String field) async {
    Response response = await DataUtility.get(path);
    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      ServerException(response);
    }

    // Process answer
    List<Follower> followers = new List<Follower>();

    // https://github.com/dart-lang/site-www/issues/736
    var list = json.decode(response.body)[field] as Iterable;
    followers = list.map((model) => Follower.fromJson(model)).toList();

    return followers;
  }
}
