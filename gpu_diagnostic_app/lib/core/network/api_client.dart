import 'package:dio/dio.dart';
import 'package:dio_smart_retry/dio_smart_retry.dart';
import '../constants/api_constants.dart';
import '../storage/local_storage.dart';
import 'api_response.dart';

/// 统一网络请求封装（对应小程序 utils/api.js）
class ApiClient {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  static bool _initialized = false;

  /// 手动设置认证头（用于登录后更新）
  static void setAuthHeaders(String? token, String? openid) {
    _init();
    if (token != null && token.isNotEmpty) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
    if (openid != null && openid.isNotEmpty) {
      _dio.options.headers['X-Openid'] = openid;
    }
  }

  static void _init() {
    if (_initialized) return;
    _initialized = true;

    // 自动重试插件
    _dio.interceptors.add(
      RetryInterceptor(
        dio: _dio,
        logPrint: print,
        retries: 2,
        retryDelays: const [
          Duration(seconds: 1),
          Duration(seconds: 2),
        ],
      ),
    );

    // 请求/响应拦截器
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = LocalStorage.getString('token');
          final openid = LocalStorage.getString('openid');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          if (openid != null && openid.isNotEmpty) {
            options.headers['X-Openid'] = openid;
          }
          handler.next(options);
        },
        onResponse: (response, handler) {
          handler.next(response);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Token 过期，清除本地缓存
            LocalStorage.remove('token');
          }
          handler.next(error);
        },
      ),
    );
  }

  /// GET 请求
  static Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    _init();
    final response = await _dio.get(path, queryParameters: queryParameters);
    return ApiResponse.fromJson(response.data, fromJson);
  }

  /// POST 请求
  static Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    _init();
    final response = await _dio.post(path, data: data);
    return ApiResponse.fromJson(response.data, fromJson);
  }

  /// PUT 请求
  static Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    _init();
    final response = await _dio.put(path, data: data);
    return ApiResponse.fromJson(response.data, fromJson);
  }

  /// 文件上传
  static Future<ApiResponse<T>> upload<T>(
    String filePath, {
    T Function(dynamic)? fromJson,
  }) async {
    _init();
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post(ApiConstants.uploadUrl, data: formData);
    return ApiResponse.fromJson(response.data, fromJson);
  }
}
