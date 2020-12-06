import 'dart:math' show Random;
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RESTApiTestHelper {
  bool ready = false;
  _UserProfileHelper userProfileA;
  _UserProfileHelper userProfileB;
  _UserProfileHelper userProfileC;
  _UserProfileHelper userProfileD;
  _UserProfileHelper userProfileE;

  RESTApiTestHelper() {
    WidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues(
        {'Content-Type': 'application/json'});
  }

  @required
  Future<void> initState() async {
    // Userprofile A
    String username = await _generateUserName();
    userProfileA = new _UserProfileHelper(
      username: username,
      email: "$username@test.ch",
    );

    // Userprofile B
    username = await _generateUserName();
    userProfileB = new _UserProfileHelper(
      username: username,
      email: "$username@test.ch",
    );

    // Userprofile C
    username = await _generateUserName();
    userProfileC = new _UserProfileHelper(
      username: username,
      email: "$username@test.ch",
    );

    // Userprofile D
    username = await _generateUserName();
    userProfileD = new _UserProfileHelper(
      username: username,
      email: "$username@test.ch",
    );

    // Userprofile E
    username = await _generateUserName();
    userProfileE = new _UserProfileHelper(
      username: username,
      email: "$username@test.ch",
    );
  }

  @required
  Future<void> dispose() async {
    // Delete users if registered
    if (userProfileA.isRegistered()) {
      await userProfileA.deleteUser();
    }
    if (userProfileB.isRegistered()) {
      await userProfileB.deleteUser();
    }
    if (userProfileC.isRegistered()) {
      await userProfileC.deleteUser();
    }
    if (userProfileD.isRegistered()) {
      await userProfileD.deleteUser();
    }
    if (userProfileE.isRegistered()) {
      await userProfileE.deleteUser();
    }
  }

  Future<String> _generateUserName([length = 13]) async {
    String userName = "";
    Random rnd = new Random(new DateTime.now().millisecondsSinceEpoch);
    String chars = "abcdefghijklmnopqrstuvwxyz";
    chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    chars += "0123456789";
    Response response;

    do {
      for (var i = 0; i < length; i++) {
        userName += chars[rnd.nextInt(chars.length)];
      }
      // Check if username already exists
      response = await DataUtility.get("api/profiles/$userName/is-used");
    } while (response.statusCode != 200 &&
        !response.body.contains("\"status\":false"));

    return userName;
  }
}

class _UserProfileHelper {
  final String firstName = "Vorname";
  final String lastName = "Nachname";
  final String username;
  final String birthday = "2000-03-18";
  final String email;
  final String password = "passWord123";

  bool _registered = false;

  _UserProfileHelper({@required this.username, @required this.email});

  Future<bool> register() async {
    Response response = await DataUtility.post(
      'api/register',
      {
        'firstName': this.firstName,
        'lastName': this.lastName,
        'profileName': this.username,
        'birthDate': this.birthday,
        'email': this.email,
        'password': this.password
      },
    );

    _registered =
        response.statusCode == 200 && response.body.contains("\"status\":true");

    return _registered;
  }

  Future<bool> login() async {
    Response response = await DataUtility.post(
      'api/login',
      {
        'email': this.email,
        'password': this.password,
      },
    );

    // Set correct profileName
    DataService.profileName = this.username;

    return response.statusCode == 200 &&
        response.body.contains("\"status\":true");
  }

  Future<bool> deleteUser() async {
    // Check if user is registered
    if (!_registered) {
      return true;
    }

    // User needs to be loged in to delete himself
    await this.login();
    Response response = await DataUtility.delete("api/users/$email");

    bool deleted =
        response.statusCode == 200 && response.body.contains("\"status\":true");

    // Update registered
    if (deleted) {
      _registered = false;
    }

    return deleted;
  }

  bool isRegistered() {
    return _registered;
  }
}
