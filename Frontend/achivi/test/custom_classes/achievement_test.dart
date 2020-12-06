import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:achivi/models/achievement.dart';
import 'package:hexcolor/hexcolor.dart';

void main() {
  group('achievement json', () {
    Achievement achievement = new Achievement(id: 1,
        name: 'test',
        categoryDescription: 'this is a small description for test achievement',
        points: 10,
        categoryName: 'ZHAW',
        className: 'Bronze',
        claimed: true,
        flagged: false
    );
    var model = {
      "id": '1',
      "achievement_name": 'test',
      "achievement_points": '10',
      "achievement_description": 'this is a small description for test achievement',
      "category_name": 'ZHAW',
      "category_description": '',
      "class_name": 'Bronze',
      "claimed": 'true',
      "group_name": ''
    };


    test('json to achievement', () {
      Achievement achievementFromJson = Achievement.fromJson(model);
      expect(achievementFromJson.id, achievement.id);
      expect(achievementFromJson.name, achievement.name);
      expect(achievementFromJson.points, achievement.points);
      expect(achievementFromJson.categoryName, achievement.categoryName);
      expect(achievementFromJson.className, achievement.className);
      expect(achievementFromJson.claimed, achievement.claimed);
      expect(achievementFromJson.flagged, achievement.flagged);
    });

    var outputModel = {
      "id": 1,
      "achievement_name": 'test',
      "achievement_points": 10,
      "achievement_description": '',
      "category_name": 'ZHAW',
      "category_description": 'this is a small description for test achievement',
      "class_name": 'Bronze',
      "claimed": true,
      "group_name": '',
      "flagged": false
    };

    test('achievement to json', () {
      var achievementToJson = achievement.toJson();
      expect(achievementToJson['id'], outputModel['id']);
      expect(achievementToJson['name'], outputModel['achievement_name']);
      expect(achievementToJson['points'], outputModel['achievement_points']);
      expect(achievementToJson['categoryName'], outputModel['category_name']);
      expect(achievementToJson['categoryDescription'], outputModel['category_description']);
    });
  });

  group('achievement colors', (){
    Color color;

    test('get Bronze achievement color', () {
      Achievement achievement = new Achievement(className: 'Bronze');
      color = Hexcolor('#CD7F32');
      expect(achievement.getClassColor(), color);
    });
    test('get Silver achievement color', () {
      Achievement achievement = new Achievement(className: 'Silver');
      color = Colors.grey[400];
      expect(achievement.getClassColor(), color);
    });
    test('get Gold achievement color', () {
      Achievement achievement = new Achievement(className: 'Gold');
      color = Colors.yellowAccent[400];
      expect(achievement.getClassColor(), color);
    });
    test('get other achievement color', () {
      Achievement achievement = new Achievement(className: 'Platin');
      color = Colors.black;
      expect(achievement.getClassColor(), color);
    });
  });
  
  testWidgets('loads Icon Button', (WidgetTester tester) async {
    Achievement achievement = new Achievement();

    final iconButton = achievement.iconButton;
    await tester.pumpWidget(MaterialApp(
      key: Key('icon button'),
      home: Material(
        child: iconButton
      )
    ));
    expect(find.byWidget(iconButton), findsOneWidget);
  });
}