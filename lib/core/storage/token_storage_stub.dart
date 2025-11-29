// Stub implementation for non-web platforms
Future<void> saveToStorage(String key, String value) async {
  // Not used on non-web platforms
}

Future<String?> readFromStorage(String key) async {
  return null;
}

Future<void> deleteFromStorage(String key) async {
  // Not used on non-web platforms
}

