import 'dart:convert';

import 'package:http/http.dart';

import 'package:achivi/error/server_exception.dart';
import 'package:achivi/models/news.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class NewsRequest {
  static Future<List<News>> getAllNews() async {
    var timestamp = '2010-01-01+00:00:00';
    var response = (await _requestNews(
        'api/profiles/${DataService.profileName}/news/$timestamp'));
    return _processAllNews(response);
  }

  static Future<List<News>> getGroupNews(String groupName) async {
    var timestamp = '2010-01-01+00:00:00';
    var response =
        (await _requestNews('api/groups/$groupName/news/$timestamp'));
    return _processGroupNews(response);
  }

  static _requestNews(String path) async {
    Response response = await DataUtility.get(path);
    if (response.statusCode != 200) {
      print('Fehler: ${response.statusCode}');
      ServerException(response);
    }
    return response;
  }

  static List<News> _processAllNews(response) {
    List<News> news = new List<News>();

    var followerList =
        json.decode(response.body)['news']['follower_news'] as Iterable;
    var followeeList =
        json.decode(response.body)['news']['followee_news'] as Iterable;
    var friendsAchievementList = json.decode(response.body)['news']
        ['achievement_news']['friends_achievements'] as Iterable;
    var ownAchievementList = json.decode(response.body)['news']
        ['achievement_news']['own_achievements'] as Iterable;

    news = news +
        _iterableToList('Follower', followerList) +
        _iterableToList('Followee', followeeList) +
        _iterableToList('Friends Achievement', friendsAchievementList) +
        _iterableToList('Achievement', ownAchievementList);
    return news;
  }

  static List<News> _processGroupNews(response) {
    List<News> news = new List<News>();

    var groupJoinList =
        json.decode(response.body)['news']['group_join'] as Iterable;
    var adminSwitchList =
        json.decode(response.body)['news']['admin_switch'] as Iterable;
    var achievementGetList =
        json.decode(response.body)['news']['group_achievement_get'] as Iterable;
    var achievementNewList =
        json.decode(response.body)['news']['group_achievement_new'] as Iterable;

    news = news +
        _iterableToList('Neues Mitglied', groupJoinList) +
        _iterableToList('Neuer Admin', adminSwitchList) +
        _iterableToList('Erreicht', achievementGetList) +
        _iterableToList('Neu', achievementNewList);
    return news;
  }

  static List<News> _iterableToList(String category, List list) {
    if (list == null) return new List<News>();
    List<News> news = list.map((singleNews) {
      var link = singleNews['link'];
      if (link is int) {
        link = singleNews['link'].toString();
      }
      var model = {
        'category': category,
        'text': singleNews['text'],
        'link': link,
        'date': DateTime.parse(singleNews['date'])
      };
      return News.fromJson(model);
    }).toList();
    return news;
  }
}
