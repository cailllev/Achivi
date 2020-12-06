import 'package:achivi/requests/achievement_request.dart';
import 'package:flutter_test/flutter_test.dart';
import '../rest_api_test_helper.dart';

Future<void> main() async {
  var _restApiTestHelper = new RESTApiTestHelper();

  setUpAll(() async {
    // Init
    await _restApiTestHelper.initState();

    // Register User A
    await _restApiTestHelper.userProfileA.register();

    // Sign in as userProfileA
    await _restApiTestHelper.userProfileA.login();
  });

  test('Try to get global achievements', () async {
    var achievements = await AchievementRequest.getGlobalAchievements();
    expect(achievements.length > 0, true,
        reason: 'No global achievements found');

    // Loop over all achievements to check if they are from the community
    for (var i = 0; i < achievements.length && i < 100; i++) {
      expect(achievements[i].groupName.toLowerCase(), 'community',
          reason: 'Achievement is not from the Community');
    }
  });

  test('Try to claim achievements', () async {
    for (var id = 1; id <= 5; id++) {
      expect(await AchievementRequest.claimAchievement(id), true,
          reason: 'Could not claim achievement with the id $id');
    }
  });

  test('Try to get claimed achievements', () async {
    var claimedAchievements = await AchievementRequest.getClaimedAchievements();
    expect(claimedAchievements.length > 0, true,
        reason: 'No claimeds achievements found');

    expect(claimedAchievements.length, 5,
        reason: 'Not the right amount of claimed achievements found');

    var achievementId = [false, false, false, false, false];
    var i = 0;
    for (; i < 5; i++) {
      achievementId[claimedAchievements[i].id - 1] = true;
    }

    // Check if claimed achievements are the correct ones
    for (i = 0; i < 5; i++) {
      expect(achievementId[i], true,
          reason: 'Achievement with the id ${i + 1} not claimed');
    }
  });

  test('Try to flag achievements', () async {
    for (var id = 1; id <= 5; id++) {
      expect(await AchievementRequest.flagAchievement(id), true,
          reason: 'Could not flag achievement with the id $id');
    }
  });

  test('Try to get flagged achievements', () async {
    var flaggedAchievements = await AchievementRequest.getFlaggedAchievements();
    expect(flaggedAchievements.length > 0, true,
        reason: 'No flagged achievements found');

    expect(flaggedAchievements.length, 5,
        reason: 'Not the right amount of flagged achievements found');

    var achievementId = [false, false, false, false, false];
    var i = 0;
    for (; i < 5; i++) {
      achievementId[flaggedAchievements[i].id - 1] = true;
    }

    // Check if claimed achievements are the correct ones
    for (i = 0; i < 5; i++) {
      expect(achievementId[i], true,
          reason: 'Achievement with the id ${i + 1} not flagged');
    }
  });

  test('Try to deflagg achievements', () async {
    for (var id = 1; id <= 5; id++) {
      expect(await AchievementRequest.deflagAchievement(id), true,
          reason: 'Could not deflag achievement with the id $id');
    }

    expect((await AchievementRequest.getFlaggedAchievements()).length, 0,
        reason: 'Not all achievement deflagged');
  });

  tearDownAll(() async {
    // Clear all
    await _restApiTestHelper.dispose();
  });
}
