import '../../../core/network/api_response.dart';

/// لیست paginated شده
class PaginatedList<T> {
  const PaginatedList({
    required this.data,
    required this.pagination,
  });

  final List<T> data;
  final ApiPagination pagination;

  factory PaginatedList.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    final dataList = (json['data'] as List<dynamic>? ?? [])
        .map((item) => fromJsonT(item as Map<String, dynamic>))
        .toList();

    final pagination = ApiPagination.fromJson({
      'page': json['page'] ?? 1,
      'limit': json['limit'] ?? 20,
      'total': json['total'] ?? 0,
      'totalPages': json['totalPages'],
    });

    return PaginatedList<T>(
      data: dataList,
      pagination: pagination,
    );
  }
}

