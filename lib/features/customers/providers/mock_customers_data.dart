import '../../../data/customers/models/customer_summary.dart';
import '../../../data/customers/models/customer_status.dart';
import '../../../data/customers/models/paginated_list.dart';
import '../../../core/network/api_response.dart';

/// داده‌های Mock برای تست و حالت Offline
class MockCustomersData {
  static List<CustomerSummary> getMockCustomers() {
    final now = DateTime.now();
    return [
      CustomerSummary(
        id: 'mock-1',
        code: 'C-24001',
        name: 'شرکت آرمان خودرو',
        marketer: 'علی محمدی',
        city: 'تهران',
        status: CustomerStatus.active,
        grade: 'A',
        monthlyRevenue: 5000000,
        lastVisitAt: now.subtract(const Duration(days: 2)),
        tags: ['VIP', 'تعمیرگاه'],
      ),
      CustomerSummary(
        id: 'mock-2',
        code: 'C-24002',
        name: 'تعمیرگاه ایران خودرو',
        marketer: 'حسین رضایی',
        city: 'اصفهان',
        status: CustomerStatus.active,
        grade: 'B',
        monthlyRevenue: 3200000,
        lastVisitAt: now.subtract(const Duration(days: 5)),
        tags: ['تعمیرگاه'],
      ),
      CustomerSummary(
        id: 'mock-3',
        code: 'C-24003',
        name: 'کارواش سحر',
        marketer: 'محمد کریمی',
        city: 'شیراز',
        status: CustomerStatus.loyal,
        grade: 'A',
        monthlyRevenue: 7800000,
        lastVisitAt: now.subtract(const Duration(days: 1)),
        tags: ['VIP', 'کارواش', 'وفادار'],
      ),
      CustomerSummary(
        id: 'mock-4',
        code: 'C-24004',
        name: 'تعمیرگاه پارس',
        marketer: 'علی محمدی',
        city: 'تهران',
        status: CustomerStatus.pending,
        grade: 'C',
        monthlyRevenue: 1500000,
        lastVisitAt: now.subtract(const Duration(days: 15)),
        tags: ['تعمیرگاه'],
      ),
      CustomerSummary(
        id: 'mock-5',
        code: 'C-24005',
        name: 'خدمات خودرو رضوی',
        marketer: 'حسین رضایی',
        city: 'مشهد',
        status: CustomerStatus.active,
        grade: 'B',
        monthlyRevenue: 4200000,
        lastVisitAt: now.subtract(const Duration(days: 3)),
        tags: ['خدمات'],
      ),
      CustomerSummary(
        id: 'mock-6',
        code: 'C-24006',
        name: 'تعمیرگاه مهر',
        marketer: 'محمد کریمی',
        city: 'تبریز',
        status: CustomerStatus.atRisk,
        grade: 'D',
        monthlyRevenue: 800000,
        lastVisitAt: now.subtract(const Duration(days: 30)),
        tags: ['تعمیرگاه'],
      ),
      CustomerSummary(
        id: 'mock-7',
        code: 'C-24007',
        name: 'کارواش آفتاب',
        marketer: 'علی محمدی',
        city: 'تهران',
        status: CustomerStatus.active,
        grade: 'A',
        monthlyRevenue: 6500000,
        lastVisitAt: now.subtract(const Duration(days: 4)),
        tags: ['کارواش', 'VIP'],
      ),
      CustomerSummary(
        id: 'mock-8',
        code: 'C-24008',
        name: 'تعمیرگاه کوروش',
        marketer: 'حسین رضایی',
        city: 'یزد',
        status: CustomerStatus.inactive,
        grade: 'C',
        monthlyRevenue: 0,
        lastVisitAt: now.subtract(const Duration(days: 60)),
        tags: ['تعمیرگاه'],
      ),
    ];
  }

  /// ساخت PaginatedList Mock بر اساس فیلترها
  static PaginatedList<CustomerSummary> getMockPaginatedList({
    CustomerStatus? status,
    String? search,
    String? city,
    int page = 1,
    int limit = 20,
  }) {
    var customers = getMockCustomers();

    // اعمال فیلتر وضعیت
    if (status != null) {
      customers = customers
          .where((c) => c.status == status)
          .toList();
    }

    // اعمال جستجو
    if (search != null && search.isNotEmpty) {
      final searchLower = search.toLowerCase();
      customers = customers
          .where((c) =>
              c.name.toLowerCase().contains(searchLower) ||
              c.code.toLowerCase().contains(searchLower) ||
              (c.city?.toLowerCase().contains(searchLower) ?? false))
          .toList();
    }

    // اعمال فیلتر شهر
    if (city != null && city.isNotEmpty) {
      customers = customers
          .where((c) => c.city?.toLowerCase() == city.toLowerCase())
          .toList();
    }

    // Pagination
    final total = customers.length;
    final startIndex = (page - 1) * limit;
    final endIndex = startIndex + limit;
    final paginatedCustomers = customers.sublist(
      startIndex.clamp(0, total),
      endIndex.clamp(0, total),
    );

    return PaginatedList<CustomerSummary>(
      data: paginatedCustomers,
      pagination: ApiPagination(
        page: page,
        limit: limit,
        total: total,
        totalPages: (total / limit).ceil(),
      ),
    );
  }
}

