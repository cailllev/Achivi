import 'package:flutter/material.dart';

import 'package:achivi/models/achievement.dart';

class MyAchievements extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Wrapper(),
    );
  }
}

class Wrapper extends StatefulWidget {
  @override
  _WrapperState createState() => _WrapperState();
}

class _WrapperState extends State<Wrapper> {
  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: EdgeInsets.fromLTRB(10, 10, 10, 100), child: Achievements());
  }
}

class Achievements extends StatefulWidget {
  @override
  _AchievementsState createState() => _AchievementsState();
}

class _AchievementsState extends State<Achievements> {
  List<Achievement> achievements = new List<Achievement>();
  @override
  void initState() {
    achievements = new List<Achievement>.filled(30, new Achievement());
    super.initState();
  }
  //Mock List of Achievements

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('my Achievements'),
    );
  }
}
