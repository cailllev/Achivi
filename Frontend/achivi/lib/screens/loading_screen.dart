import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

import 'package:hexcolor/hexcolor.dart';

import 'package:achivi/services/user_profile_service.dart';

class LoadingScreen extends StatefulWidget {
  @override
  _LoadingScreenState createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> {
  void setup() async {
    var user = await UserProfileService.getCurrUserProfile();
    //TODO: instead of Future, subscribe to external sources i.e. login
    //await Future.delayed(Duration(seconds: 0));

    Navigator.pushReplacementNamed(context, '/app_wrapper', arguments: user);
  }

  @override
  void initState() {
    super.initState();
    setup();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Hexcolor('#ff9e80'),
        body: Center(
          child: SpinKitRotatingCircle(
            color: Colors.white,
            size: 50.0,
          ),
        ));
  }
}

class LoadScreen {
  static Widget getSpinKitRotationgCircle() {
    return Scaffold(
        backgroundColor: Colors.lightGreen,
        body: Center(
          child: SpinKitRotatingCircle(
            color: Colors.white,
            size: 50.0,
          ),
        ));
  }
}
