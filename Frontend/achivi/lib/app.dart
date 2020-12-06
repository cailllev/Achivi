import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:achivi/screens/app_wrapper.dart';
import 'package:achivi/screens/groupScreens/group_screen.dart';
import 'package:achivi/screens/loading_screen.dart';
import 'package:achivi/screens/login_screen.dart';
import 'package:achivi/screens/profileScreens/profile_screen.dart';
import 'package:achivi/screens/registerScreen/register_screen_profile.dart';
import 'package:achivi/screens/registerScreen/register_screen_user.dart';
import 'package:achivi/screens/search_screen.dart';
import 'package:achivi/theme/theme_provider.dart';

class App extends StatelessWidget {
  const App({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: "Achivi",
          theme: themeProvider.getTheme,
          initialRoute: '/login',
          routes: {
            '/loading': (context) => LoadingScreen(),
            '/login': (context) => LoginScreen(),
            '/search': (context) => SearchScreen(),
            '/register_user': (context) => RegisterScreenUser(),
            '/register_profile': (context) => RegisterScreenProfile(),
            '/app_wrapper': (context) => AppWrapper(),
            '/GroupScreen': (context) => GroupScreen(),
            '/MyProfile': (context) => MyProfile(),
          },
        );
      },
    );
  }
}
