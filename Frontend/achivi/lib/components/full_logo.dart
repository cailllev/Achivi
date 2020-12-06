import 'package:flutter/material.dart';

class FullLogo extends StatelessWidget {
  //Color color;
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Image(
        image: AssetImage('assets/images/logo_achivi.png'),
        //color: color,
      ),
    );
  }
}
