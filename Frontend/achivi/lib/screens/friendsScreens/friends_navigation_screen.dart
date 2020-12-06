import 'package:flutter/material.dart';

import 'package:achivi/screens/friendsScreens/follower_screen.dart';
import 'package:achivi/screens/friendsScreens/follows_screen.dart';
import 'package:achivi/screens/friendsScreens/friends_screen.dart';

class FriendsNavigationScreen extends StatefulWidget {
  @override
  _FriendsNavigationScreenState createState() =>
      _FriendsNavigationScreenState();
}

class _FriendsNavigationScreenState extends State<FriendsNavigationScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: Theme.of(context).primaryColor,
        appBar: new PreferredSize(
          preferredSize: Size.fromHeight(kToolbarHeight),
          child: new Container(
            margin: EdgeInsets.only(top: 25),
            child: new TabBar(
              indicatorColor: Theme.of(context).indicatorColor,
              tabs: [
                Tab(
                  icon: Icon(Icons.people),
                  text: "Freunde",
                ),
                Tab(
                  icon: Icon(Icons.people_outline),
                  text: "Folge ich",
                ),
                Tab(
                  icon: Icon(Icons.people_outline),
                  text: "Folgen mir",
                ),
              ],
            ),
            color: Theme.of(context).primaryColor,
          ),
        ),
        body: new TabBarView(
          children: [
            FriendsScreen(),
            FollowsScreen(),
            FollowerScreen(),
          ],
        ),
      ),
    );
  }
}
