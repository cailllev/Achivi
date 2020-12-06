import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import 'package:achivi/models/achievement.dart';

class AchievementWidget extends StatelessWidget {
  final Achievement achievement;
  AchievementWidget({this.achievement});

  @override
  Widget build(BuildContext context) {
    return Container(
        child: IconButton(
            icon: achievement.iconButton,
            padding: const EdgeInsets.all(8),
            iconSize: achievement.size,
            onPressed: achievement.onPressed));
  }
}
