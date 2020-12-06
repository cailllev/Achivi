import 'package:flutter/material.dart';

import 'package:achivi/models/form_validator.dart';
import 'package:achivi/services/data_utility.dart';
import 'package:achivi/services/utility.dart';

class RegisterScreenUser extends StatefulWidget {
  const RegisterScreenUser({Key key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => new _RegisterScreenUserState();
}

class _RegisterScreenUserState extends State<RegisterScreenUser> {
  // Focus fields
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  FormValidator validator = new FormValidator();

  final TextEditingController _emailFilter = new TextEditingController();
  final TextEditingController _passwordFilter = new TextEditingController();

  String _email = "";
  String _password = "";
  String snackBarMsg = "";
  SnackBar snackbar;

  _RegisterScreenUserState() {
    snackbar = SnackBar(content: Text(snackBarMsg));
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
    return new Scaffold(
      key: _scaffoldKey,
      appBar: new AppBar(
        title: new Text("REGISTRIERUNG",
            style: Theme.of(context).textTheme.headline6),
        centerTitle: true,
      ),
      body: Container(
        color: Theme.of(context).backgroundColor,
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            Flexible(flex: 2, child: Container(child: _buildInfoText())),
            Flexible(
                fit: FlexFit.tight,
                flex: 5,
                child: Container(child: _buildTextFields())),
            Flexible(flex: 3, child: Container(child: _buildButtons()))
          ],
        ),
      ),
    );
  }

  Widget _buildInfoText() {
    return Center(
      child: SingleChildScrollView(
        child: new Column(
          children: <Widget>[
            new Text(
              'Gib dein E-Mail und dein Passwort ein',
              style: Theme.of(context)
                  .textTheme
                  .headline2
                  .copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextFields() {
    return new Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            new TextFormField(
              autofocus: true,
              style: Theme.of(context).textTheme.headline2,
              controller: _emailFilter,
              validator: validator.validateEmail,
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
              validator: validator.validatePassword,
              decoration: new InputDecoration(
                  labelText: 'Passwort',
                  labelStyle: Theme.of(context).textTheme.headline2),
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.done,
              focusNode: _passwordFocus,
              obscureText: true,
              onFieldSubmitted: (term) {
                _createUserPressed();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildButtons() {
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
                child: Builder(
                  builder: (context) => RaisedButton(
                      child: new Text('WEITER',
                          style: Theme.of(context).textTheme.button),
                      onPressed: _createUserPressed),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _createUserPressed() {
    if (_formKey.currentState.validate()) {
      var url = 'api/users/$_email/is-used';
      var responded = DataUtility.get(url);
      responded.then((value) {
        if (value.statusCode == 200) {
          if (value.body.contains('false')) {
            snackBarMsg =
                ('Es existiert bereits ein Nutzer mit dieser E-Mail.');
            snackbar = new SnackBar(content: Text(snackBarMsg));

            // Set Focus back to email
            FocusScope.of(context).requestFocus(_emailFocus);
          } else {
            Navigator.pushNamed(context, '/register_profile',
                arguments: {"e-mail": _email, "password": _password});
          }
        } else {
          snackBarMsg = ('Internal Server Error');
          snackbar = new SnackBar(content: Text(snackBarMsg));
        }
        _scaffoldKey.currentState.showSnackBar(snackbar);
      });
    }
  }
}
