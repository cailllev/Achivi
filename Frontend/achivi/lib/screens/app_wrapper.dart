import 'package:flutter/material.dart';

import 'package:achivi/models/user_profile.dart';
import 'package:achivi/screens/achievementScreen/achievements_screen.dart';
import 'package:achivi/screens/friendsScreens/friends_navigation_screen.dart';
import 'package:achivi/screens/news_screen.dart';
import 'package:achivi/screens/profileScreens/profile_screen.dart';
import 'package:achivi/screens/search_screen.dart';

class AppWrapper extends StatefulWidget {
  static UserProfile userProfile;
  @override
  _AppWrapperState createState() => _AppWrapperState();
}

class _AppWrapperState extends State<AppWrapper> {
//  var user;
////  void getUser() async {
////    var user = await UserProfileService.getCurrUserProfile();
////    AppWrapper.userProfile = user;
////    print('userProfile Test : $user');
////  }

  int _selectedPage = 2;
  final _pageOptions = [
    AchievementsScreen(),
    SearchScreen(),
    NewsScreen(),
    FriendsNavigationScreen(),
    MyProfile(),
  ];

  TextStyle bottomNavbarStyle() {
    return Theme.of(context).textTheme.caption.copyWith(fontSize: 12.0);
  }

  @override
  void initState() {
    // TODO: implement initState
//    getUser();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    AppWrapper.userProfile = ModalRoute.of(context).settings.arguments;
    Color iconColor = Theme.of(context).primaryColorDark;
    return Scaffold(
      body: _pageOptions[_selectedPage],
      bottomNavigationBar: Container(
        child: BottomNavigationBar(
          currentIndex: _selectedPage,
          onTap: (int index) {
            setState(() {
              _selectedPage = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          showSelectedLabels: false,
          showUnselectedLabels: false,
          items: [
            BottomNavigationBarItem(
              icon: Icon(
                Icons.stars,
                color: iconColor,
              ),
              activeIcon: Icon(Icons.stars, color: Colors.black),
              title: Text('Achievements', style: bottomNavbarStyle()),
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search, color: iconColor),
              activeIcon: Icon(Icons.search, color: Colors.black),
              title: Text('Suche', style: bottomNavbarStyle()),
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.rss_feed, color: iconColor),
              activeIcon: Icon(Icons.rss_feed, color: Colors.black),
              title: Text('News-Feed', style: bottomNavbarStyle()),
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.group, color: iconColor),
              activeIcon: Icon(Icons.group, color: Colors.black),
              title: Text('Freunde', style: bottomNavbarStyle()),
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_circle, color: iconColor),
              activeIcon: Icon(Icons.account_circle, color: Colors.black),
              title: Text('Profil', style: bottomNavbarStyle()),
            ),
          ],
          selectedItemColor: Colors.black,
        ),
      ),
    );
  }
}
