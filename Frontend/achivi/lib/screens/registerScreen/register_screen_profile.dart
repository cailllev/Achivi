import 'package:intl/intl.dart';

import 'package:flutter/material.dart';

import 'package:achivi/models/form_validator.dart';
import 'package:achivi/services/data_utility.dart';
import 'package:achivi/services/utility.dart';

class RegisterScreenProfile extends StatefulWidget {
  const RegisterScreenProfile({Key key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => new _RegisterScreenProfileState();
}

class _RegisterScreenProfileState extends State<RegisterScreenProfile> {
  // Focus fields
  final FocusNode _firstNameFocus = FocusNode();
  final FocusNode _surnameFocus = FocusNode();
  final FocusNode _userNameFocus = FocusNode();
  final FocusNode _birthdayFocus = FocusNode();

  final globalKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  FormValidator validator = new FormValidator();
  DateTime selectedDate = DateTime.now();

  //Controller für auslesen der Felder.
  final TextEditingController _userNameFilter = new TextEditingController();
  final TextEditingController _firstNameFilter = new TextEditingController();
  final TextEditingController _surnameFilter = new TextEditingController();
  final TextEditingController _birthdayFilter = new TextEditingController();

  String _email;
  String _password;
  String _userName = "";
  String _firstName = "";
  String _surname = "";
  String _birthday = "";

  _RegisterScreenProfileState() {
    _userNameFilter.addListener(_userNameListen);
    _firstNameFilter.addListener(_firstNameListen);
    _surnameFilter.addListener(_surnameListen);
    _birthdayFilter.addListener(_birthdayListen);
  }

  //listener
  void _userNameListen() {
    _userName = _userNameFilter.text;
  }

  void _firstNameListen() {
    _firstName = _firstNameFilter.text;
  }

  void _surnameListen() {
    _surname = _surnameFilter.text;
  }

  void _birthdayListen() {
    _birthday = _birthdayFilter.text;
  }

  //baut Seite als Widget auf.
  @override
  Widget build(BuildContext context) {
    final Map<String, Object> receivedData =
        ModalRoute.of(context).settings.arguments;
    _email = '${receivedData['e-mail']}';
    _password = '${receivedData['password']}';
    return new Scaffold(
      key: globalKey,
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
        child: Column(
          children: <Widget>[
            new Text(
              'Gib deinen Namen und dein Geburtsdatum ein',
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
              controller: _firstNameFilter,
              validator: validator.validateName,
              decoration: new InputDecoration(
                  labelText: 'Vorname',
                  labelStyle: Theme.of(context).textTheme.headline2),
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.next,
              focusNode: _firstNameFocus,
              onFieldSubmitted: (term) {
                Utility.fieldFocusChange(
                    context, _firstNameFocus, _surnameFocus);
              },
            ),
            new TextFormField(
              style: Theme.of(context).textTheme.headline2,
              controller: _surnameFilter,
              validator: validator.validateName,
              decoration: new InputDecoration(
                  labelText: 'Nachname',
                  labelStyle: Theme.of(context).textTheme.headline2),
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.next,
              focusNode: _surnameFocus,
              onFieldSubmitted: (term) {
                Utility.fieldFocusChange(
                    context, _surnameFocus, _userNameFocus);
              },
            ),
            new TextFormField(
              style: Theme.of(context).textTheme.headline2,
              controller: _userNameFilter,
              validator: validator.validateName,
              decoration: new InputDecoration(
                  labelText: 'Benutzername',
                  labelStyle: Theme.of(context).textTheme.headline2),
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.next,
              focusNode: _userNameFocus,
              onFieldSubmitted: (term) {
                Utility.fieldFocusChange(
                    context, _userNameFocus, _birthdayFocus);
              },
            ),
            GestureDetector(
              onTap: () => _selectDate(context),
              child: AbsorbPointer(
                child: new TextFormField(
                  style: Theme.of(context).textTheme.headline2,
                  controller: _birthdayFilter,
                  validator: validator.validateDate,
                  decoration: new InputDecoration(
                      labelText: 'Geburtsdatum',
                      labelStyle: Theme.of(context).textTheme.headline2),
                  keyboardType: TextInputType.datetime,
                  textInputAction: TextInputAction.done,
                  focusNode: _birthdayFocus,
                  onFieldSubmitted: (term) {
                    _createProfilePressed();
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildButtons() {
    return Container(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.only(top: 30),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              SizedBox(
                width: double.maxFinite,
                height: 50,
                child: new RaisedButton(
                    child: new Text('REGISTRIEREN',
                        style: Theme.of(context).textTheme.button),
                    onPressed: _createProfilePressed),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _createProfilePressed() {
    if (_formKey.currentState.validate()) {
      var url = 'api/register';
      var msg = {
        'firstName': _firstName,
        'lastName': _surname,
        'profileName': _userName,
        'birthDate': _birthday,
        'email': _email,
        'password': _password
      };
      var responded = DataUtility.post(url, msg);
      responded.then((value) {
        if (value.statusCode == 200) {
          final snackBar = SnackBar(
              content: Text('Registrierung erfolgreich'),
              action: SnackBarAction(
                label: 'Zum Login',
                onPressed: () {
                  Navigator.pushNamed(context, '/login');
                },
              ));
          globalKey.currentState.showSnackBar(snackBar);
        } else {
          final snackBar = SnackBar(content: Text('Internal Server Error'));
          globalKey.currentState.showSnackBar(snackBar);
        }
      });
    }
  }

  Future<Null> _selectDate(BuildContext context) async {
    final DateTime picked = await showDatePicker(
        context: context,
        initialDate: selectedDate,
        firstDate: DateTime(1901, 1),
        lastDate: DateTime.now());
    if (picked != null && picked != selectedDate)
      setState(() {
        selectedDate = picked;
        var formatter = new DateFormat('dd-MM-yyyy');
        String formatted = formatter.format(picked);
        _birthdayFilter.value = TextEditingValue(text: formatted.toString());
      });
  }
}
