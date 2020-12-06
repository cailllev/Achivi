import 'package:hexcolor/hexcolor.dart';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Achievement {
  int id;
  String name;
  String description;
  int points;
  String groupName;
  String className;
  String categoryName;
  String categoryDescription;
  bool flagged;
  bool claimed;

  IconData icon;
  double size = 50;
  Function onPressed;

  Achievement({
    int id,
    String name,
    String description,
    int points,
    String groupName,
    String className,
    String categoryName,
    String categoryDescription,
    bool flagged,
    bool claimed,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.points = points;
    this.groupName = groupName;
    this.className = className;
    this.categoryName = categoryName;
    this.categoryDescription = categoryDescription;
    this.flagged = flagged;
    this.claimed = claimed;
  }

  Color getClassColor() {
    Color color;
    switch (className) {
      case 'Bronze':
        {
          color = Hexcolor('#CD7F32');
        }
        break;

      case 'Silver':
        {
          color = Colors.grey[400];
        }
        break;
      case 'Gold':
        {
          color = Colors.yellowAccent[400];
        }
        break;

      default:
        {
          color = Colors.black;
        }
        break;
    }
    return color;
  }

  Container get iconButton {
    return Container(
        child: IconButton(
            icon: Icon(
              this.icon,
              size: size,
            ),
            onPressed: onPressed));
  }

  Achievement.fromJson(Map json)
      : id = int.parse(json['id'] as String),
        name = json['achievement_name'],
        description = json['achievement_description'],
        points = int.parse(json['achievement_points'] as String),
        groupName = json['group_name'],
        className = json['class_name'],
        categoryName = json['category_name'],
        categoryDescription = json['category_description'],
        flagged = (json['flagged'] != null),
        claimed = (json['claimed'] != null);

  Map toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'points': points,
      'groupName': groupName,
      'className': className,
      'categoryName': categoryName,
      'categoryDescription': categoryDescription,
      'flagged': flagged,
      'claimed': claimed,
    };
  }
}
