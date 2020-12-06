import 'dart:convert';

import 'package:flutter/material.dart';

import 'package:achivi/models/form_validator.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class CreateGroupForm extends StatefulWidget {
  const CreateGroupForm({Key key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => new _CreateGroupFormState();
}

class _CreateGroupFormState extends State<CreateGroupForm> {
  //Controller für auslesen der Felder.
  final TextEditingController _groupNameFilter = new TextEditingController();
  FormValidator validator = new FormValidator();
  final globalKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();

  String _groupName = "";
  List myFollowers = [];
  Map selection = Map<String, bool>();
  List<String> selectedFollowers = [];

  _CreateGroupFormState() {
    _groupNameFilter.addListener(_groupNameListen);
  }

  initState() {
    super.initState();
    myFollowers = DataService.followersList.getList();
    int i;
    for (i = 0; i < myFollowers.length; i++) {
      selection[myFollowers[i].name] = false;
    }
  }

//listener
  void _groupNameListen() {
    _groupName = _groupNameFilter.text;
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      key: globalKey,
      appBar: new AppBar(
        title: new Text("GRUPPE ERSTELLEN",
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
                flex: 2,
                child: Container(child: _buildTextFields())),
            Flexible(
                flex: 5,
                child: Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Container(child: _friendsList()),
                )),
            Flexible(flex: 2, child: Container(child: _buildButtons()))
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
              'Gib einen Gruppennamen an und fügen deine Freunde hinzu',
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
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            new TextFormField(
              style: Theme.of(context).textTheme.headline2,
              controller: _groupNameFilter,
              keyboardType: TextInputType.text,
              validator: validator.validateName,
              decoration: new InputDecoration(
                  labelText: 'Gruppenname',
                  labelStyle: Theme.of(context).textTheme.headline2),
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
                    child: new Text('GRUPPE ERSTELLEN',
                        style: Theme.of(context).textTheme.button),
                    onPressed: () {
                      _createGroupPressed();
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _friendsList() {
    return Container(
      child: ListView.builder(
          itemCount: myFollowers.length, itemBuilder: _getListItemTile),
    );
  }

  Widget _getListItemTile(BuildContext context, int index) {
    return ListTile(
        onTap: null,
        leading: Icon(
          Icons.perm_identity,
          size: 30,
          color: Colors.black,
        ),
        title: new Row(
          children: <Widget>[
            new Expanded(
              child: Text(myFollowers[index].name,
                  style: Theme.of(context).textTheme.headline2),
            ),
            new Checkbox(
                checkColor: Theme.of(context).primaryColorDark,
                activeColor: Theme.of(context).primaryColorLight,
                value: selection[myFollowers[index].name],
                onChanged: (bool value) {
                  setState(() {
                    if (value) {
                      selection[myFollowers[index].name] = true;
                    } else {
                      selection[myFollowers[index].name] = false;
                    }
                  });
                })
          ],
        ));
  }

  void _createGroupPressed() {
    selectedFollowers.clear();
    selection.forEach(getChecked);
    print(selectedFollowers);
    print(_groupName);
    if (_formKey.currentState.validate()) {
      var url = 'api/groups';
      var msg = {
        'groupName': _groupName,
        'members': jsonEncode(selectedFollowers),
        'category': "test",
      };
      var responded = DataUtility.post(url, msg);
      responded.then((value) {
        print(value.body);
        print(value.statusCode);
        if (value.statusCode == 200) {
          final snackBar = SnackBar(
              content: Text('Gruppe wurde erstellt'),
              action: SnackBarAction(
                label: 'Zur Übersicht',
                onPressed: () {
                  Navigator.pushNamed(context, '/GroupScreen');
                },
              ));
          globalKey.currentState.showSnackBar(snackBar);
        } else {
          final snackBar =
              SnackBar(content: Text('Gruppe konnte nicht erstellt werden'));
          globalKey.currentState.showSnackBar(snackBar);
        }
      });
    }
  }

  void getChecked(key, value) {
    if (value == true) {
      if (!selectedFollowers.contains(key)) {
        selectedFollowers.add(key);
      }
    }
  }
}
