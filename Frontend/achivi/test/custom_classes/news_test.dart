import 'package:flutter_test/flutter_test.dart';

import 'package:achivi/models/news.dart';

void main() {
  group('news json', () {
    var now = new DateTime.now();
    News news = new News('Kategorie', now, 'link', 'Dies wird ein Text sein');
    var model = {
      "category": 'Kategorie',
      "date": now,
      "link": 'link',
      "text": 'Dies wird ein Text sein'
    };

    test('json to news', () {
      News newsFromJson = News.fromJson(model);
      expect(newsFromJson.category, news.category);
      expect(newsFromJson.text, news.text);
      expect(newsFromJson.date, news.date);
      expect(newsFromJson.link, news.link);
    });

    test('news to json', () {
      var newsToJson = news.toJson();
      expect(newsToJson['text'], model['text']);
      expect(newsToJson['link'], model['link']);
      expect(newsToJson['date'], model['date']);
      expect(newsToJson['category'], model['category']);
    });
  });

  group('news ages', () {
    var now;
    setUp(() {
      now = new DateTime.now();
    });

    test('news age should be "jetzt"', () {
      var news = new News('kategorie', now, 'link', 'Dies ist ein Beispieltext');
      expect(news.getAge(), 'jetzt');
    });

    test('news age should be 10 mins ago', () {
      var duration = new Duration(minutes: -10);
      var tenMinutesAgo = now.add(duration);
      var news = new News('kategorie', tenMinutesAgo, 'link', 'Dies ist ein Beispieltext');
      expect(news.getAge(), 'vor 10 Minuten');
    });

    test('news age should be 1 hour ago', () {
      var duration = new Duration(hours: -1);
      var oneHourAgo = now.add(duration);
      var news = new News('kategorie', oneHourAgo, 'link', 'Dies ist ein Beispieltext');
      expect(news.getAge(), 'vor 1 Stunde');
    });

    test('news age should be 2 hours ago', () {
      var duration = new Duration(hours: -2);
      var twoHoursAgo = now.add(duration);
      var news = new News('kategorie', twoHoursAgo, 'link', 'Dies ist ein Beispieltext');
      expect(news.getAge(), 'vor 2 Stunden');
    });

    test('news age should be 1 day ago', () {
      var duration = new Duration(days: -1);
      var oneDayAgo = now.add(duration);
      var news = new News('kategorie', oneDayAgo, 'link', 'Dies ist ein Beispieltext');
      expect(news.getAge(), 'vor 1 Tag');
    });

    test('news age should be 10 days ago', () {
      var duration = new Duration(days: -10);
      var tenDaysAgo = now.add(duration);
      var news = new News('kategorie', tenDaysAgo, 'link', 'Dies ist ein Beispieltext');
      expect(news.getAge(), 'vor 10 Tagen');
    });

    test('news age should be now', () {
      var duration = new Duration(seconds: 10);
      var inFuture = now.add(duration);
      var news = new News('kategorie', inFuture, 'link', 'Dies ist ein Beispieltext');
      expect(news.getAge(), 'jetzt');
    });

  });


}