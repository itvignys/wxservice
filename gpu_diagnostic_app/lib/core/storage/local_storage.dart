import 'package:shared_preferences/shared_preferences.dart';

/// 本地存储封装（对应小程序 wx.getStorageSync / wx.setStorageSync）
class LocalStorage {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static SharedPreferences get _instance {
    if (_prefs == null) {
      throw StateError('LocalStorage 未初始化，请在 main() 中调用 LocalStorage.init()');
    }
    return _prefs!;
  }

  // String
  static String? getString(String key) => _instance.getString(key);
  static Future<bool> setString(String key, String value) => _instance.setString(key, value);

  // int
  static int? getInt(String key) => _instance.getInt(key);
  static Future<bool> setInt(String key, int value) => _instance.setInt(key, value);

  // bool
  static bool? getBool(String key) => _instance.getBool(key);
  static Future<bool> setBool(String key, bool value) => _instance.setBool(key, value);

  // double
  static double? getDouble(String key) => _instance.getDouble(key);
  static Future<bool> setDouble(String key, double value) => _instance.setDouble(key, value);

  // List<String>
  static List<String>? getStringList(String key) => _instance.getStringList(key);
  static Future<bool> setStringList(String key, List<String> value) => _instance.setStringList(key, value);

  // 移除
  static Future<bool> remove(String key) => _instance.remove(key);

  // 清空
  static Future<bool> clear() => _instance.clear();

  // 是否包含 Key
  static bool containsKey(String key) => _instance.containsKey(key);
}
