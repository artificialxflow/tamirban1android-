import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/constants/app_colors.dart';
import '../../../data/customers/models/geo_location.dart';

/// کامپوننت نقشه Neshan Map
/// 
/// این کامپوننت برای نمایش نقشه و انتخاب موقعیت استفاده می‌شود.
/// 
/// **نکته:** برای استفاده کامل، نیاز به:
/// 1. نصب پکیج `neshanmap_flutter` (نیاز به SDK >=3.9.0)
/// 2. دریافت و افزودن API Key به AndroidManifest.xml
/// 3. بارگذاری فایل License در کد
class NeshanMapWidget extends StatefulWidget {
  const NeshanMapWidget({
    super.key,
    this.center,
    this.zoom = 11.0,
    this.markers = const [],
    this.onLocationSelect,
    this.interactive = false,
    this.height = 300,
  });

  /// موقعیت مرکز نقشه (default: تهران)
  final GeoLocation? center;

  /// سطح زوم (default: 11)
  final double zoom;

  /// لیست Markerها برای نمایش روی نقشه
  final List<MapMarker> markers;

  /// Callback برای زمانی که کاربر موقعیت را انتخاب می‌کند
  final ValueChanged<GeoLocation>? onLocationSelect;

  /// آیا نقشه قابل تعامل است (برای انتخاب موقعیت)
  final bool interactive;

  /// ارتفاع نقشه
  final double height;

  @override
  State<NeshanMapWidget> createState() => _NeshanMapWidgetState();
}

class _NeshanMapWidgetState extends State<NeshanMapWidget> {
  String? _errorMessage;
  bool _isLoading = true;
  String? _licenseContent;

  // Default center: تهران
  static const _defaultCenter = GeoLocation(
    latitude: 35.6892,
    longitude: 51.389,
  );

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    try {
      // بارگذاری فایل License
      try {
        _licenseContent = await rootBundle.loadString('assets/licenses/neshan.license');
      } catch (e) {
        // اگر فایل License پیدا نشد، ادامه می‌دهیم بدون License
        debugPrint('⚠️ License file not found: $e');
        _licenseContent = null;
      }
      
      // TODO: Initialize Neshan Map SDK با License
      // TODO: Load API Key from AndroidManifest.xml
      // اگر SDK نصب شده باشد:
      // if (_licenseContent != null) {
      //   NeshanMapSDK.setLicense(_licenseContent);
      // }
      
      // شبیه‌سازی زمان بارگذاری
      await Future.delayed(const Duration(milliseconds: 300));
      
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = null; // برای نمایش placeholder بهتر
        });
      }
    } catch (e) {
      // اگر خطای دیگری رخ داد
      debugPrint('❌ Error initializing map: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'خطا در بارگذاری نقشه: ${e.toString()}';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final resolvedCenter = widget.center ?? _defaultCenter;

    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.border,
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: _buildMapContent(resolvedCenter),
      ),
    );
  }

  Widget _buildMapContent(GeoLocation center) {
    if (_isLoading) {
      return Container(
        color: AppColors.background,
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_errorMessage != null) {
      return Container(
        color: AppColors.background,
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.map_outlined,
                  size: 48,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(height: 12),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Placeholder بهتر برای نقشه با License
    return Stack(
      children: [
        // Background با gradient
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary.withValues(alpha: 0.08),
                AppColors.accent.withValues(alpha: 0.04),
                AppColors.surface,
              ],
            ),
          ),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.map_rounded,
                      size: 48,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'نقشه Neshan',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: AppColors.border,
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      '${center.latitude.toStringAsFixed(4)}, ${center.longitude.toStringAsFixed(4)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (_licenseContent != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: AppColors.accent.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.check_circle_rounded,
                            size: 16,
                            color: AppColors.accent,
                          ),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              'License بارگذاری شد',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.accent,
                                    fontWeight: FontWeight.w600,
                                  ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: AppColors.warning.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.info_outline_rounded,
                            size: 16,
                            color: AppColors.warning,
                          ),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              'نیاز به API Key',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.warning,
                                    fontWeight: FontWeight.w600,
                                  ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
        // Markers overlay (برای آینده)
        if (widget.markers.isNotEmpty)
          ...widget.markers.map((marker) {
            return Positioned(
              left: (marker.longitude - center.longitude) * 100 + 50,
              top: (marker.latitude - center.latitude) * 100 + 50,
              child: Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: AppColors.danger,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
            );
          }),
        // Interactive hint (برای آینده)
        if (widget.interactive && widget.onLocationSelect != null)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.textPrimary.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'روی نقشه کلیک کنید تا موقعیت انتخاب شود',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Marker برای نقشه
class MapMarker {
  const MapMarker({
    required this.latitude,
    required this.longitude,
    this.title,
    this.description,
  });

  final double latitude;
  final double longitude;
  final String? title;
  final String? description;
}
