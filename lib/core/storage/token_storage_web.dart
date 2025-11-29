// Web implementation using dart:html
import 'dart:html' as html;

Future<void> saveToStorage(String key, String value) async {
  html.window.localStorage[key] = value;
}

Future<String?> readFromStorage(String key) async {
  return html.window.localStorage[key];
}

Future<void> deleteFromStorage(String key) async {
  html.window.localStorage.remove(key);
}

