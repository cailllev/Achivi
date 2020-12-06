import 'package:achivi/error/server_400_exception.dart';
import 'package:achivi/error/server_401_exception.dart';
import 'package:achivi/error/server_403_exception.dart';
import 'package:achivi/error/server_404_exception.dart';
import 'package:achivi/error/server_405_exception.dart';
import 'package:achivi/error/server_412_exception.dart';
import 'package:achivi/error/server_500_exception.dart';
import 'package:http/http.dart';

class ServerException implements Exception {
  /*
   * Creates a new FormatException with an optional error [message].
   */
  ServerException(Response response) {
    // Check if the message contains important informations
    var message = response.body.contains("</html>") ? null : response.body;

    switch (response.statusCode) {
      case 400:
        throw (message == null
            ? new Server400Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
              )
            : new Server400Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
                message,
              ));
        break;
      case 401:
        throw (message == null
            ? new Server401Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
              )
            : new Server401Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
                message,
              ));
        break;
      case 403:
        throw (message == null
            ? new Server403Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
              )
            : new Server403Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
                message,
              ));
        break;
      case 404:
        throw (message == null
            ? new Server404Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
              )
            : new Server404Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
                message,
              ));
        break;
      case 405:
        throw (message == null
            ? new Server405Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
              )
            : new Server405Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
                message,
              ));
        break;
      case 412:
        throw (message == null
            ? new Server412Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
              )
            : new Server412Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
                message,
              ));
        break;
      case 500:
        throw (message == null
            ? new Server500Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
              )
            : new Server500Exception(
                response.statusCode,
                response.request.method,
                response.request.url.path,
                response.reasonPhrase,
                message,
              ));
        break;
      default:
        throw ('ServerException: Status code ${response.statusCode} not found.');
        break;
    }
  }
}
