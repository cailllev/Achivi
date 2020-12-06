import 'package:flutter/material.dart';

import 'package:achivi/models/group.dart';
import 'package:achivi/screens/app_wrapper.dart';
import 'package:achivi/screens/friendsScreens/friends_navigation_screen.dart';
import 'package:achivi/screens/groupScreens/group_screen.dart';
import 'package:achivi/screens/profileScreens/my_achievements_screen.dart';
import 'package:achivi/services/data_services.dart';

//https://slcoderlk.blogspot.com/2019/01/beautiful-user-profile-material-ui-with.html

class MyProfile extends StatefulWidget {
  @override
  _MyProfileState createState() => _MyProfileState();
}

class _MyProfileState extends State<MyProfile> {
  var groups = new List<Group>();
  final globalKey = GlobalKey<ScaffoldState>();

  String followers = AppWrapper.userProfile.followers.length.toString();
  String follows = AppWrapper.userProfile.follows.length.toString();
  String points = AppWrapper.userProfile.points.toString();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.person)),
              Tab(icon: Icon(Icons.people)),
              Tab(icon: Icon(Icons.stars)),
            ],
          ),
          title: new Text("MEIN PROFIL",
              style: Theme.of(context).textTheme.headline6),
          centerTitle: true,
        ),
        body: new TabBarView(
          children: [
            _buildProfile(),
            GroupScreen(),
            MyAchievementsScreen(),
          ],
        ),
      ),
    );
  }

  Widget _buildProfile() {
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
                  _buildFullName(),
                  //_buildStatus(context),
                  _buildStatContainer(),
                  SizedBox(height: 10),
                  _buildBio(context),
                  /*_buildSeparator(screenSize),
              SizedBox(height: 10.0),
              _buildGetInTouch(context),
              SizedBox(height: 8.0),
              _buildButtons(),*/
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

  Widget _buildFullName() {
    return Text(DataService.profileName.toUpperCase(),
        style:
            Theme.of(context).textTheme.headline4.copyWith(letterSpacing: 3));
  }

  Widget _buildStatItem(String label, String count) {
    return InkWell(
      onTap: () {
        Navigator.push(context,
            MaterialPageRoute(builder: (context) => FriendsNavigationScreen()));
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Text(
            label.toUpperCase(),
            style: Theme.of(context)
                .textTheme
                .headline1
                .copyWith(letterSpacing: 1),
          ),
          Text(
            count,
            style: Theme.of(context)
                .textTheme
                .headline2
                .copyWith(letterSpacing: 1, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildStatContainer() {
    return Container(
      height: 60.0,
      margin: EdgeInsets.only(top: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          _buildStatItem("Followers", followers),
          _buildStatItem("Follows", follows),
          _buildStatItem("Punkte", points),
        ],
      ),
    );
  }

  Widget _buildBio(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.only(left: 15, right: 15),
        child: Text(
          AppWrapper.userProfile.bio,
          textAlign: TextAlign.justify,
          style:
              Theme.of(context).textTheme.headline2.copyWith(letterSpacing: 1),
        ),
      ),
    );
  }
}
