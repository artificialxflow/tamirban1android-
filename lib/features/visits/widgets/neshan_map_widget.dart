import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

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
  final MapCoordinates? center;

  /// سطح زوم (default: 11)
  final double zoom;

  /// لیست Markerها برای نمایش روی نقشه
  final List<MapMarker> markers;

  /// Callback برای زمانی که کاربر موقعیت را انتخاب می‌کند
  final ValueChanged<MapCoordinates>? onLocationSelect;

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

  // Default center: تهران
  static const _defaultCenter = MapCoordinates(
    latitude: 35.6892,
    longitude: 51.389,
  );

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    // TODO: بارگذاری فایل License از assets
    // TODO: Initialize Neshan Map SDK
    // TODO: Load API Key from AndroidManifest.xml
    
    setState(() {
      _isLoading = false;
      _errorMessage = 'SDK Neshan Map نصب نشده است. نیاز به SDK >=3.9.0';
    });
  }

  @override
  Widget build(BuildContext context) {
    final resolvedCenter = widget.center ?? _defaultCenter;

    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Theme.of(context).dividerColor,
          width: 2,
        ),
        color: Colors.grey[100],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: _buildMapContent(resolvedCenter),
      ),
    );
  }

  Widget _buildMapContent(MapCoordinates center) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.map_outlined,
                size: 48,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // TODO: نمایش نقشه واقعی Neshan Map
    return Stack(
      children: [
        // Placeholder for actual map
        Container(
          color: Colors.grey[200],
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.map,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 8),
                Text(
                  'نقشه Neshan',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${center.latitude.toStringAsFixed(4)}, ${center.longitude.toStringAsFixed(4)}',
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
        if (widget.interactive && widget.onLocationSelect != null)
          Positioned(
            bottom: 12,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'روی نقشه کلیک کنید تا مختصات انتخاب شود',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// مدل مختصات جغرافیایی
class MapCoordinates {
  const MapCoordinates({
    required this.latitude,
    required this.longitude,
  });

  final double latitude;
  final double longitude;

  @override
  String toString() => 'MapCoordinates($latitude, $longitude)';
}

/// مدل Marker برای نقشه
class MapMarker {
  const MapMarker({
    required this.id,
    required this.position,
    this.title,
    this.description,
  });

  final String id;
  final MapCoordinates position;
  final String? title;
  final String? description;

  @override
  String toString() => 'MapMarker($id, ${position.latitude}, ${position.longitude})';
}

