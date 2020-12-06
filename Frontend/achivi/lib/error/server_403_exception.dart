class Server403Exception implements Exception {
  /// The status code describing the format error.

  final int statusCode;

  /// The Description for the status code.

  final String statusDescription;

  /// A Description describing the format error.

  final String description = "Zugriff verweigert.";

  /// A message describing the format error.

  final String message;

  /// The method type of the request.

  final String method;

  /// The requested url.

  final String url;

  /// Creates a new FormatException with an optional error [message].

  const Server403Exception(
      this.statusCode, this.method, this.url, this.statusDescription,
      [this.message = "Zugriff verweigert."]);

  String toString() => "Server403Exception: $message";
}
