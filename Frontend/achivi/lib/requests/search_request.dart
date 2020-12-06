import 'dart:convert';

import 'package:flutter/widgets.dart';

import 'package:http/http.dart';

import 'package:achivi/error/server_500_exception.dart';
import 'package:achivi/error/server_exception.dart';
import 'package:achivi/models/user.dart';
import 'package:achivi/services/data_utility.dart';

class SearchRequest {
  static Future<List<User>> searchUsers(BuildContext context, String query,
      [int limit = 15, bool findMyself = false]) async {
    try {
      Response response = await DataUtility.get(
          'api/profiles?q=$query&limit=$limit&findMySelf=$findMyself');

      if (response.statusCode != 200) {
        ServerException(response);
      }

      // Process answer
      var users = new List<User>();
      Iterable list = json.decode(response.body)['message'];
      users = list.map((model) => User.fromJson(model)).toList();

      return users;
    } on Server500Exception catch (_) {
      Navigator.pushReplacementNamed(context, '/login');
      return null;
    }
  }
}
