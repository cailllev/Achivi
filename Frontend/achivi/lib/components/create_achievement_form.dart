import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'package:achivi/models/form_validator.dart';
import 'package:achivi/services/data_utility.dart';
import 'package:achivi/services/utility.dart';

class CreateAchievementForm extends StatefulWidget {
  final String groupName;

  const CreateAchievementForm({Key key, @required this.groupName})
      : super(key: key);

  @override
  State<StatefulWidget> createState() => new _CreateAchievementFormState();
}

class _CreateAchievementFormState extends State<CreateAchievementForm> {
  String _groupName;

  final _globalKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  String _dropdownValue;
  List<String> _dropdownValues = new List<String>();

  // Form validator
  FormValidator validator = new FormValidator();

  // Focus fields
  final FocusNode _achievementNameFocus = FocusNode();
  final FocusNode _achievementDescriptionFocus = FocusNode();

  //Controller für auslesen der Felder.
  final TextEditingController _achievementName = new TextEditingController();
  final TextEditingController _achievementDescription =
      new TextEditingController();

  @override
  void initState() {
    super.initState();
    this._groupName = this.widget.groupName;

    DataUtility.get('api/achievements/classes').then((response) {
      if (response.statusCode == 200) {
        setState(() {
          // Load data into dropdown
          json
              .decode(response.body)
              .map((entry) => _dropdownValues.add(entry['name']))
              .toList();

          // Set default value
          if (_dropdownValues.length != 0) {
            _dropdownValue = _dropdownValues[0];
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      key: _globalKey,
      appBar: new AppBar(
        title: new Text("ACHIEVEMENT ERSTELLEN",
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
                flex: 4,
                child: Container(child: _buildFields())),
            Flexible(flex: 1, child: Container(child: _buildButtons()))
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
              'Erstelle ein Achievement für $_groupName',
              style: Theme.of(context)
                  .textTheme
                  .headline5
                  .copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFields() {
    return new Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            new TextFormField(
              autofocus: true,
              style: Theme.of(context).textTheme.headline5,
              controller: _achievementName,
              maxLength: 65,
              validator: (value) => validator.validateText(value, 65, 1),
              decoration: new InputDecoration(
                  labelText: 'Name',
                  labelStyle: Theme.of(context).textTheme.headline5),
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.next,
              focusNode: _achievementNameFocus,
              onFieldSubmitted: (term) {
                Utility.fieldFocusChange(context, _achievementNameFocus,
                    _achievementDescriptionFocus);
              },
            ),
            new TextFormField(
              minLines: 1,
              maxLines: 3,
              style: Theme.of(context).textTheme.headline5,
              controller: _achievementDescription,
              maxLength: 256,
              validator: (value) => validator.validateText(value, 256, 5),
              decoration: new InputDecoration(
                  labelText: 'Beschreibung',
                  labelStyle: Theme.of(context).textTheme.headline5),
              keyboardType: TextInputType.multiline,
              // textInputAction: TextInputAction.next, => NOT WORKING BECAUSE OF MULTILINE
              focusNode: _achievementDescriptionFocus,
            ),
            _buildDropdownButton(),
          ],
        ),
      ),
    );
  }

  // https://api.flutter.dev/flutter/material/DropdownButton-class.html
  // https://stackoverflow.com/questions/49780858/flutter-dropdown-text-field
  _buildDropdownButton() {
    if (_dropdownValues.length == 0) {
      return Text('Kategorien werden geladen...');
    }
    return new InputDecorator(
      decoration: new InputDecoration(
        labelText: 'Klasse',
        labelStyle: Theme.of(context).textTheme.headline5,
      ),
      child: DropdownButton<String>(
        value: _dropdownValue,
        icon: Icon(Icons.arrow_downward),
        iconSize: 24,
        elevation: 16,
        style: Theme.of(context).textTheme.headline5,
        underline: Container(
          height: 2,
          color: Colors.deepOrangeAccent,
        ),
        onChanged: (String newValue) {
          setState(() {
            _dropdownValue = newValue;
          });
        },
        items: _dropdownValues.map<DropdownMenuItem<String>>((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
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
                      child: new Text('Achievement erstellen',
                          style: Theme.of(context).textTheme.button),
                      onPressed: _createAchievementPressed),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _createAchievementPressed() {
    if (_formKey.currentState.validate()) {
      print('create achievement');
      var url = 'api/achievements';
      var msg = {
        'name': _achievementName.text,
        'description': _achievementDescription.text,
        'achClName': _dropdownValue,
        'groupName': _groupName
      };
      print(msg);
      var responded = DataUtility.post(url, msg);
      responded.then((value) {
        if (value.statusCode == 200) {
          // Clear fields
          _achievementName.clear();
          _achievementDescription.clear();

          // Output answer
          _globalKey.currentState.showSnackBar(new SnackBar(
            content: Text(
                'Achievement ${_achievementName.text} wurde erfolgreich erstellt'),
            duration: Duration(seconds: 7),
          ));
        } else {
          _globalKey.currentState.showSnackBar(new SnackBar(
            content: Text(
                'Es gab einen Fehler beim Erstellen des Achievement ${_achievementName.text}\n(${value.body})'),
            duration: Duration(seconds: 7),
          ));
        }
      });
    }
  }
}
