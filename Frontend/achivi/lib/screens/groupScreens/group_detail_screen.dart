import 'package:hexcolor/hexcolor.dart';

import 'package:flutter/material.dart';

import 'package:achivi/models/group.dart';
import 'package:achivi/screens/groupScreens/group_achievement_screen.dart';
import 'package:achivi/screens/groupScreens/group_member_screen.dart';
import 'package:achivi/screens/groupScreens/group_news_screen.dart';

class GroupDetailScreen extends StatelessWidget {
  final Group group;

  GroupDetailScreen({Key key, @required this.group}) : super(key: key);

  //baut Seite als Widget auf.
  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      appBar: new AppBar(
        title:
            Text(group.groupName, style: Theme.of(context).textTheme.headline6),
        centerTitle: true,
      ),
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            Flexible(
                fit: FlexFit.tight,
                flex: 1,
                child: Container(
                  child: _buildImage(),
                )),
            Flexible(
              fit: FlexFit.tight,
              flex: 3,
              child: Container(child: _buildTabs()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: new PreferredSize(
          preferredSize: Size.fromHeight(kToolbarHeight),
          child: new Container(
            height: 50.0,
            child: new TabBar(
              indicatorColor: Hexcolor('#96b397'),
              tabs: [
                Tab(icon: Icon(Icons.history, color: Hexcolor('#c96f53'))),
                Tab(icon: Icon(Icons.people, color: Hexcolor('#c96f53'))),
                Tab(icon: Icon(Icons.stars, color: Hexcolor('#c96f53'))),
              ],
            ),
          ),
        ),
        body: new TabBarView(
          children: [
            GroupNewsScreen(groupName: group.groupName),
            GroupMemberScreen(group: group),
            GroupAchievementScreen(groupName: group.groupName),
          ],
        ),
      ),
    );
  }

  Widget _buildImage() {
    return Center(
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            new Image(
              image: AssetImage('assets/images/logo_achivi.png'),
            ),
          ],
        ),
      ),
    );
  }
}
