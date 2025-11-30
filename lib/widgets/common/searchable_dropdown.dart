import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';

/// کامپوننت Searchable Dropdown برای انتخاب از لیست
class SearchableDropdown<T> extends StatefulWidget {
  const SearchableDropdown({
    super.key,
    required this.items,
    required this.label,
    required this.displayItem,
    this.hintText,
    this.selectedItem,
    this.onChanged,
    this.validator,
    this.searchHint,
    this.prefixIcon,
    this.enabled = true,
  });

  final List<T> items;
  final String label;
  final String Function(T) displayItem;
  final String? hintText;
  final T? selectedItem;
  final ValueChanged<T?>? onChanged;
  final String? Function(T?)? validator;
  final String? searchHint;
  final Widget? prefixIcon;
  final bool enabled;

  @override
  State<SearchableDropdown<T>> createState() => _SearchableDropdownState<T>();
}

class _SearchableDropdownState<T> extends State<SearchableDropdown<T>> {
  final _searchController = TextEditingController();
  List<T> _filteredItems = [];
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _filteredItems = widget.items;
  }

  @override
  void didUpdateWidget(SearchableDropdown<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.items != widget.items) {
      _filterItems(_searchController.text);
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterItems(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredItems = widget.items;
      } else {
        _filteredItems = widget.items
            .where((item) => widget.displayItem(item)
                .toLowerCase()
                .contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  Future<void> _showSearchDialog() async {
    _searchController.clear();
    _filteredItems = widget.items;

    final selected = await showDialog<T>(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 400, maxHeight: 500),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.label,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              // Search field
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  controller: _searchController,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText: widget.searchHint ?? 'جستجو...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onChanged: _filterItems,
                ),
              ),
              const SizedBox(height: 8),
              // List
              Flexible(
                child: _filteredItems.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(
                            'موردی یافت نشد',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                          ),
                        ),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        itemCount: _filteredItems.length,
                        itemBuilder: (context, index) {
                          final item = _filteredItems[index];
                          final isSelected = widget.selectedItem == item;
                          return ListTile(
                            title: Text(widget.displayItem(item)),
                            selected: isSelected,
                            trailing: isSelected
                                ? const Icon(Icons.check, color: AppColors.primary)
                                : null,
                            onTap: () => Navigator.of(context).pop(item),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );

    if (selected != null && widget.onChanged != null) {
      widget.onChanged!(selected);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: widget.enabled ? _showSearchDialog : null,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(
                color: widget.enabled ? AppColors.border : AppColors.border.withValues(alpha: 0.5),
              ),
              borderRadius: BorderRadius.circular(12),
              color: widget.enabled ? Colors.transparent : AppColors.surface.withValues(alpha: 0.5),
            ),
            child: Row(
              children: [
                if (widget.prefixIcon != null) ...[
                  widget.prefixIcon!,
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Text(
                    widget.selectedItem != null
                        ? widget.displayItem(widget.selectedItem!)
                        : widget.hintText ?? 'انتخاب کنید...',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: widget.selectedItem != null
                              ? AppColors.textPrimary
                              : AppColors.textSecondary,
                        ),
                  ),
                ),
                Icon(
                  Icons.arrow_drop_down,
                  color: AppColors.textSecondary,
                ),
              ],
            ),
          ),
        ),
        if (widget.validator != null && widget.selectedItem == null)
          Padding(
            padding: const EdgeInsets.only(top: 4, right: 12),
            child: Text(
              widget.validator!(widget.selectedItem) ?? '',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.danger,
                  ),
            ),
          ),
      ],
    );
  }
}

