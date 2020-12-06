import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:achivi/app.dart';
import 'package:achivi/provider/flavors/flavor.dart';
import 'package:achivi/theme/theme_provider.dart';

void main() => runApp(MultiProvider(
      providers: <Provider>[
        Provider<Flavor>.value(
          value: Flavor.dev,
        ),
        //Provider(create: null),
      ],
      child: ChangeNotifierProvider(
        create: (BuildContext context) => ThemeProvider(isDarkMode: false),
        child: App(),
      ),
    ));
