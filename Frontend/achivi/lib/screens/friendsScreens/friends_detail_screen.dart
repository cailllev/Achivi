import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart';

import 'package:achivi/models/follower.dart';
import 'package:achivi/requests/follower_request.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class FriendDetailScreen extends StatefulWidget {
  final String userName;

  FriendDetailScreen({Key key, this.userName}) : super(key: key);

  @override
  _FriendDetailScreenState createState() => _FriendDetailScreenState(userName);
}

class _FriendDetailScreenState extends State<FriendDetailScreen> {
  final globalKey = GlobalKey<ScaffoldState>();

  String userName;
  String bio;
  int follower;
  int follows;
  int points = 0;
  static List<Follower> _followerList;
  static List<Follower> _followList;

  _FriendDetailScreenState(String name) {
    this.userName = name;
  }

  _getUserProfile() {
    var url = 'api/profiles/$userName';
    var responded = DataUtility.get(url);
    responded.then((value) {
      if (value.statusCode == 200) {
        setState(() {
          var parsedJson = json.decode(value.body);
          switch (parsedJson['access']) {
            case 'owner':
              Navigator.pushReplacementNamed(context, '/MyProfile');
              break;
            case 'friends':
              bio = parsedJson['bio'];
              break;
            default:
              bio = "Folge $userName um mehr zu erfahren.";
          }
        });
      } else {
        final snackBar = SnackBar(content: Text('Internal Server Error'));
        globalKey.currentState.showSnackBar(snackBar);
      }
    });
  }

  _getFollowers() async {
    _followerList = await FollowerRequest.getFollowers(userName);
    follower = _followerList.length;
  }

  _getFollows() async {
    _followList = await FollowerRequest.getFollowees(userName);
    follows = _followList.length;
  }

  _getPoins() async {
    Response response =
        await DataUtility.get('api/profiles/$userName/achievements/points');
    if (response.statusCode == 200 && json.decode(response.body) != null) {
      points = int.parse(json.decode(response.body));
    }
  }

  @override
  void initState() {
    super.initState();
    _getUserProfile();
    _getFollowers();
    _getFollows();
    _getPoins();
  }

  dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 1,
      child: Scaffold(
        appBar: AppBar(
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.person)),
              //Tab(icon: Icon(Icons.people)),
              //Tab(icon: Icon(Icons.stars)),
            ],
          ),
          title:
              new Text("PROFIL", style: Theme.of(context).textTheme.headline6),
          centerTitle: true,
        ),
        body: new TabBarView(
          children: [
            _buildProfile(context),
          ],
        ),
      ),
    );
  }

  _createFollowingButton(String name) {
    return FlatButton(
        child: (DataService.followsList.isFollowing(name)
            ? RaisedButton(
                child: RichText(
                  text: TextSpan(
                    children: [
                      WidgetSpan(
                        child: Icon(Icons.remove_circle, size: 20),
                      ),
                      TextSpan(
                          text: " Entfernen",
                          style: Theme.of(context).textTheme.button),
                    ],
                  ),
                ),
                onPressed: () {
                  print('Unfollowing');
                  FollowerRequest.removeFollowee(name).then((success) {
                    if (success) {
                      DataService.followsList.removeFollowee(name);
                      setState(() {});
                    }
                  });
                },
              )
            : RaisedButton(
                child: RichText(
                  text: TextSpan(
                    children: [
                      WidgetSpan(
                        child: Icon(Icons.add_circle, size: 20),
                      ),
                      TextSpan(
                          text: "  Folgen",
                          style: Theme.of(context).textTheme.button),
                    ],
                  ),
                ),
                onPressed: () {
                  print('Following');
                  FollowerRequest.addFollowee(name).then((success) {
                    if (success) {
                      DataService.followsList.addFollowee(name);
                      setState(() {
                        _getUserProfile();
                      });
                    }
                  });
                },
              )),
        onPressed: () {});
  }

  Widget _buildProfile(BuildContext context) {
    Size screenSize = MediaQuery.of(context).size;
    return Scaffold(
      body: Stack(
        children: <Widget>[
          _buildCoverImage(screenSize),
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: <Widget>[
                  SizedBox(height: screenSize.height / 6.4),
                  _buildProfileImage(),
                  _buildFullName(context),
                  _buildStatContainer(context),
                  SizedBox(height: 10),
                  _buildBio(context),
                  SizedBox(height: 90),
                  _createFollowingButton(userName)
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoverImage(Size screenSize) {
    return Container(
      height: screenSize.height / 3.5,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/images/cover_green.PNG'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildProfileImage() {
    return Center(
      child: Container(
        width: 140.0,
        height: 140.0,
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/defaults/defaul_avatar.png'),
            fit: BoxFit.cover,
          ),
          borderRadius: BorderRadius.circular(80.0),
          border: Border.all(
            color: Colors.white,
            width: 5,
          ),
        ),
      ),
    );
  }

  Widget _buildFullName(BuildContext context) {
    return Container(
      child: Column(children: <Widget>[
        Text(userName != null ? userName : 'Lädt',
            style: Theme.of(context)
                .textTheme
                .headline4
                .copyWith(letterSpacing: 3)),
        Icon(
          (DataService.followsList.isFollowing(userName)
              ? Icons.check
              : Icons.close),
        ),
      ]),
    );
  }

  Widget _buildStatItem(String label, int count, BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Text(
          label.toUpperCase() != null ? label.toUpperCase() : 'Lädt',
          style:
              Theme.of(context).textTheme.headline1.copyWith(letterSpacing: 1),
        ),
        Text(
          '$count',
          style: Theme.of(context)
              .textTheme
              .headline2
              .copyWith(letterSpacing: 1, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildStatContainer(BuildContext context) {
    return Container(
      height: 60.0,
      margin: EdgeInsets.only(top: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          _buildStatItem("Followers", follower, context),
          _buildStatItem("Follows", follows, context),
          _buildStatItem("Punkte", points, context),
        ],
      ),
    );
  }

  Widget _buildBio(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.only(left: 15, right: 15),
        child: Text(
          bio != null ? bio : 'Lädt',
          textAlign: TextAlign.justify,
          style:
              Theme.of(context).textTheme.headline2.copyWith(letterSpacing: 1),
        ),
      ),
    );
  }
}
