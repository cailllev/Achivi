import 'package:flutter/material.dart';

import 'package:achivi/models/user.dart';
import 'package:achivi/requests/follower_request.dart';
import 'package:achivi/requests/search_request.dart';
import 'package:achivi/screens/friendsScreens/friends_detail_screen.dart';
import 'package:achivi/services/data_services.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _queryFilter = new TextEditingController();
  String _query = "";

  var _userResult = new List<User>();

  _SearchScreenState() {
    _queryFilter.addListener(_queryListen);
    DataService.followsList.update();
  }

  //listener
  void _queryListen() {
    if (_queryFilter.text.isEmpty) {
      _query = "";
    } else {
      _query = _queryFilter.text;
    }
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      appBar: new AppBar(
        title: new Text("SUCHE", style: Theme.of(context).textTheme.headline6),
        centerTitle: true,
      ),
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            _mySearchBar(),
            _mySearchResult(),
          ],
        ),
      ),
    );
  }

  Widget _mySearchBar() {
    return new Form(
      child: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            new TextFormField(
              autofocus: true,
              controller: _queryFilter,
              style: Theme.of(context).textTheme.headline2,
              decoration: new InputDecoration(
                  prefixIcon: IconButton(
                    onPressed: _searchPressed,
                    padding: EdgeInsets.all(0.0),
                    icon: Icon(Icons.search, color: Colors.grey),
                  ),
                  suffixIcon: new IconButton(
                      onPressed: () {
                        _queryFilter.clear();
                        _userResult = new List<User>();
                        setState(() {});
                      },
                      padding: EdgeInsets.all(0.0),
                      icon: Icon(Icons.clear, color: Colors.grey)),
                  hintText: 'Profilname',
                  labelStyle: Theme.of(context).textTheme.headline2),
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.search,
              onFieldSubmitted: (term) => _searchPressed(),
              onChanged: (term) => _searchPressed(),
            )
          ],
        ),
      ),
    );
  }

// https://medium.com/@DakshHub/flutter-displaying-dynamic-contents-using-listview-builder-f2cedb1a19fb
  Widget _mySearchResult() {
    if (_query != "" && _userResult.length == 0) {
      return SafeArea(
          child: Center(
        child: Text(
          'Es konnten keine Benutzer mit dem Namen\n\'$_query\'\ngefunden werden.',
          textAlign: TextAlign.center,
        ),
      ));
    }
    return new Expanded(
      child: new ListView.builder(
        itemCount: _userResult.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: Icon(
                Icons.perm_identity,
                size: 30,
                color: Colors.black,
              ),
              title: Text(_userResult[index].name,
                  style: Theme.of(context).textTheme.headline2),
              trailing: SizedBox(
                child: _createFollowingButton(_userResult[index].name),
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        FriendDetailScreen(userName: _userResult[index].name),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  _createFollowingButton(String name) {
    return IconButton(
        icon: Icon(
          (DataService.followsList.isFollowing(name)
              ? Icons.remove_circle
              : Icons.add_circle),
          color: Theme.of(context).primaryColorDark,
        ),
        onPressed: () {
          if (DataService.followsList.isFollowing(name)) {
            print('Unfollowing');
            FollowerRequest.removeFollowee(name).then((success) {
              if (success) {
                DataService.followsList.removeFollowee(name);
                setState(() {});
              }
            });
          } else {
            print('Following');
            FollowerRequest.addFollowee(name).then((success) {
              if (success) {
                DataService.followsList.addFollowee(name);
                setState(() {});
              }
            });
          }
        });
  }

  void _searchPressed() {
    print('Search query: $_query');
    if (_query == "") {
      // Clear result
      _userResult = new List<User>();
      setState(() {});
      return;
    }

    SearchRequest.searchUsers(context, _query).then((result) {
      print(result);
      _userResult = result;
      setState(() {});
    });
  }
}
