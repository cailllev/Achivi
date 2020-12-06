import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class User {
  String name;

  IconData icon;
  double size = 50;
  Function onPressed;

  User(this.name);

  User.fromJson(Map json) : name = json['name'];

  Map toJson() {
    return {'name': name};
  }
}
