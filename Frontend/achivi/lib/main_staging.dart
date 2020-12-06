import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:achivi/app.dart';
import 'package:achivi/provider/flavors/flavor.dart';

void main() => runApp(
      Provider<Flavor>.value(
        value: Flavor.staging,
        child: App(),
      ),
    );
