import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'package:provider/provider.dart';

import 'package:achivi/components/full_logo.dart';
import 'package:achivi/provider/flavors/flavor.dart';
import 'package:achivi/screens/registerScreen/register_screen_user.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';
import 'package:achivi/services/utility.dart';

class LoginScreen extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => new _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Focus fields
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  //Controller für auslesen der Felder.
  final TextEditingController _emailFilter = new TextEditingController();
  final TextEditingController _passwordFilter = new TextEditingController();
  String _email = "";
  String _password = "";

  _LoginScreenState() {
    _initialIsLoggedIn();
    _emailFilter.addListener(_emailListen);
    _passwordFilter.addListener(_passwordListen);
  }

  //listener
  void _emailListen() {
    if (_emailFilter.text.isEmpty) {
      _email = "";
    } else {
      _email = _emailFilter.text;
    }
  }

  void _passwordListen() {
    if (_passwordFilter.text.isEmpty) {
      _password = "";
    } else {
      _password = _passwordFilter.text;
    }
  }

  //baut Seite als Widget auf.
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //appBar: _buildBar(context),
      body: Container(
        color: Theme.of(context).primaryColor,
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            Flexible(
                fit: FlexFit.tight,
                flex: 2,
                child: Container(child: Center(child: FullLogo()))),
            Flexible(
                fit: FlexFit.tight,
                flex: 2,
                child: Container(child: _buildTextFields())),
            Flexible(
                fit: FlexFit.tight,
                flex: 2,
                child: Container(child: _buildButtons()))
          ],
        ),
      ),
    );
  }

  Widget _buildTextFields() {
    return new Form(
      child: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            new TextFormField(
              autofocus: true,
              style: Theme.of(context).textTheme.headline2,
              controller: _emailFilter,
              decoration: new InputDecoration(
                  labelText: 'E-Mail',
                  labelStyle: Theme.of(context).textTheme.headline2),
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              focusNode: _emailFocus,
              onFieldSubmitted: (term) {
                Utility.fieldFocusChange(context, _emailFocus, _passwordFocus);
              },
            ),
            new TextFormField(
              style: Theme.of(context).textTheme.headline2,
              controller: _passwordFilter,
              decoration: new InputDecoration(
                  labelText: 'Password',
                  labelStyle: Theme.of(context).textTheme.headline2),
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.done,
              focusNode: _passwordFocus,
              obscureText: true,
              onFieldSubmitted: (term) {
                _loginPressed();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildButtons() {
    final flavor = Provider.of<Flavor>(context);
    return new Container(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.only(top: 30),
          child: new Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              SizedBox(
                width: double.maxFinite,
                height: 50,
                child: (flavor.toString() == 'Flavor.dev')
                    ? RaisedButton(
                        child: Text('DEV-LOGIN',
                            style: Theme.of(context).textTheme.button),
                        onPressed: _devLoginPressed,
                        //onPressed: _loginPressed,
                      )
                    : RaisedButton(
                        child: Text('LOGIN',
                            style: Theme.of(context).textTheme.button),
                        onPressed: _loginPressed,
                      ),
              ),
              SizedBox(height: 20),
              SizedBox(
                width: double.maxFinite,
                height: 50,
                child: new RaisedButton(
                  child: new Text('REGISTRIEREN',
                      style: Theme.of(context).textTheme.button),
                  onPressed: () {
                    navigateToSubPage(context);
                  },
                ),
              ),
              SizedBox(height: 20),
              new FlatButton(
                child: new Text('Passwort vergessen?',
                    style: Theme.of(context).textTheme.headline2),
                onPressed: _passwordReset,
              )
            ],
          ),
        ),
      ),
    );
  }

  //Hintergrundfunktionen. Eventuell auslagern...
  void _loginPressed() async {
    print('Login pressed');
    var url = 'api/login';
    var msg = {'email': _email, 'password': _password};
    var responded = DataUtility.post(url, msg);
    responded.then((value) {
      if (value.statusCode == 200 && value.body.contains('true')) {
        DataService.setProfileName();
        Navigator.pushReplacementNamed(context, '/loading');
      } else {
        print('Email or Username wrong');
      }
    });
  }

  void _passwordReset() {
    print("The user wants a password reset request sent to $_email");
  }

  Future navigateToSubPage(context) async {
    Navigator.push(
        context, MaterialPageRoute(builder: (context) => RegisterScreenUser()));
  }

  void _devLoginPressed() async {
    String data = await DefaultAssetBundle.of(context)
        .loadString("assets/dev_options/dev_login.json");
    Map devUserMap = json.decode(data);
    print('Login pressed');
    var url = 'api/login';
    var msg = {'email': devUserMap['user'], 'password': devUserMap['pw']};
    var responded = DataUtility.post(url, msg);
    responded.then((value) {
      print(value.statusCode);
      print(value.body);
      print(value.headers);
      if (value.statusCode == 200 && value.body.contains('true')) {
        DataService.setProfileName();
        Navigator.pushReplacementNamed(context, '/loading');
      } else {
        print('Dev Login didnt Work');
      }
    });
  }

  void _initialIsLoggedIn() async {
    var url = 'api/profiles';
    DataUtility.loadCookie();
    var responded = DataUtility.get(url);
    responded.then((value) {
      print(value.statusCode);
      print(value.body);
      print(value.headers);
      if (value.statusCode == 200) {
        DataService.setProfileName();
        Navigator.pushReplacementNamed(context, '/loading');
      }
    });
  }
}
