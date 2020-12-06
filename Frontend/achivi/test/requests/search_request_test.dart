import 'package:achivi/requests/search_request.dart';
import 'package:flutter_test/flutter_test.dart';
import '../rest_api_test_helper.dart';

Future<void> main() async {
  var _restApiTestHelper = new RESTApiTestHelper();

  setUpAll(() async {
    // Init
    await _restApiTestHelper.initState();

    // Register User A to D
    await _restApiTestHelper.userProfileA.register();
    await _restApiTestHelper.userProfileB.register();
    await _restApiTestHelper.userProfileC.register();

    // Sign in as userProfileA
    await _restApiTestHelper.userProfileA.login();
  });

  test("Try to find my self (Not allowed)", () async {
    var result = await SearchRequest.searchUsers(
        null, _restApiTestHelper.userProfileA.username);
    expect(result.length, 0, reason: "Own profile found");
  });

  test("Try to find my self (Allowed)", () async {
    var result = await SearchRequest.searchUsers(
        null, _restApiTestHelper.userProfileA.username, 15, true);
    expect(result.length, 1, reason: "Own profile not found");
    expect(result[0].name, _restApiTestHelper.userProfileA.username,
        reason: "Own profile not found");
  });

  test("Try to find other users (Should found them)", () async {
    var result = await SearchRequest.searchUsers(
        null, _restApiTestHelper.userProfileB.username, 15, true);
    expect(result.length, 1, reason: "UserProfileB not found");
    expect(result[0].name, _restApiTestHelper.userProfileB.username,
        reason: "Found different profile");

    result = await SearchRequest.searchUsers(
        null, _restApiTestHelper.userProfileC.username, 15, true);
    expect(result.length, 1, reason: "UserProfileC not found");
    expect(result[0].name, _restApiTestHelper.userProfileC.username,
        reason: "Found different profile");
  });

  test("Try to find other users (Should not found them)", () async {
    var result = await SearchRequest.searchUsers(
        null, _restApiTestHelper.userProfileD.username, 15, true);
    expect(result.length, 0, reason: "UserProfileD not found");

    result = await SearchRequest.searchUsers(
        null, _restApiTestHelper.userProfileE.username, 15, true);
    expect(result.length, 0, reason: "UserProfileE not found");
  });

  tearDownAll(() async {
    // Clear all
    await _restApiTestHelper.dispose();
  });
}
