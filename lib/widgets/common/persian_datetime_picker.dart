import 'package:flutter/material.dart';
import 'package:shamsi_date/shamsi_date.dart';

import '../../core/constants/app_colors.dart';

/// کامپوننت Persian DateTime Picker برای انتخاب تاریخ و زمان شمسی
class PersianDateTimePicker extends StatefulWidget {
  const PersianDateTimePicker({
    super.key,
    required this.label,
    this.initialValue,
    this.onChanged,
    this.validator,
    this.hintText,
    this.prefixIcon,
    this.enabled = true,
  });

  final String label;
  final DateTime? initialValue;
  final ValueChanged<DateTime?>? onChanged;
  final String? Function(DateTime?)? validator;
  final String? hintText;
  final Widget? prefixIcon;
  final bool enabled;

  @override
  State<PersianDateTimePicker> createState() => _PersianDateTimePickerState();
}

class _PersianDateTimePickerState extends State<PersianDateTimePicker> {
  DateTime? _selectedDateTime;
  final _dateController = TextEditingController();
  final _timeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedDateTime = widget.initialValue;
    if (_selectedDateTime != null) {
      _updateControllers(_selectedDateTime!);
    } else {
      // Default to tomorrow at 12:00
      final tomorrow = DateTime.now().add(const Duration(days: 1));
      _selectedDateTime = DateTime(tomorrow.year, tomorrow.month, tomorrow.day, 12, 0);
      _updateControllers(_selectedDateTime!);
    }
  }

  @override
  void didUpdateWidget(PersianDateTimePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialValue != widget.initialValue) {
      _selectedDateTime = widget.initialValue;
      if (_selectedDateTime != null) {
        _updateControllers(_selectedDateTime!);
      }
    }
  }

  @override
  void dispose() {
    _dateController.dispose();
    _timeController.dispose();
    super.dispose();
  }

  void _updateControllers(DateTime dateTime) {
    final jalali = Jalali.fromDateTime(dateTime);
    _dateController.text = '${jalali.year}/${jalali.month.toString().padLeft(2, '0')}/${jalali.day.toString().padLeft(2, '0')}';
    _timeController.text = '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  Future<void> _selectDate() async {
    if (!widget.enabled) return;

    final jalali = _selectedDateTime != null
        ? Jalali.fromDateTime(_selectedDateTime!)
        : Jalali.now();

    final selected = await showDialog<Jalali>(
      context: context,
      builder: (context) => _PersianDatePickerDialog(
        initialDate: jalali,
      ),
    );

    if (selected != null) {
      final hour = _selectedDateTime?.hour ?? 12;
      final minute = _selectedDateTime?.minute ?? 0;
      final gregorian = selected.toGregorian();
      final newDateTime = DateTime(
        gregorian.year,
        gregorian.month,
        gregorian.day,
        hour,
        minute,
      );
      setState(() {
        _selectedDateTime = newDateTime;
        _updateControllers(newDateTime);
      });
      widget.onChanged?.call(newDateTime);
    }
  }

  Future<void> _selectTime() async {
    if (!widget.enabled) return;

    final initialTime = _selectedDateTime != null
        ? TimeOfDay.fromDateTime(_selectedDateTime!)
        : const TimeOfDay(hour: 12, minute: 0);

    final selected = await showTimePicker(
      context: context,
      initialTime: initialTime,
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        );
      },
    );

    if (selected != null) {
      final jalali = _selectedDateTime != null
          ? Jalali.fromDateTime(_selectedDateTime!)
          : Jalali.now();
      final gregorian = jalali.toGregorian();
      final newDateTime = DateTime(
        gregorian.year,
        gregorian.month,
        gregorian.day,
        selected.hour,
        selected.minute,
      );
      setState(() {
        _selectedDateTime = newDateTime;
        _updateControllers(newDateTime);
      });
      widget.onChanged?.call(newDateTime);
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
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: widget.enabled ? _selectDate : null,
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
                          _dateController.text.isEmpty
                              ? (widget.hintText ?? 'انتخاب تاریخ...')
                              : _dateController.text,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: _dateController.text.isEmpty
                                    ? AppColors.textSecondary
                                    : AppColors.textPrimary,
                              ),
                        ),
                      ),
                      Icon(
                        Icons.calendar_today,
                        size: 20,
                        color: AppColors.textSecondary,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: InkWell(
                onTap: widget.enabled ? _selectTime : null,
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
                      Icon(
                        Icons.access_time,
                        size: 20,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _timeController.text.isEmpty
                              ? 'انتخاب ساعت...'
                              : _timeController.text,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: _timeController.text.isEmpty
                                    ? AppColors.textSecondary
                                    : AppColors.textPrimary,
                              ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        if (widget.validator != null)
          Padding(
            padding: const EdgeInsets.only(top: 4, right: 12),
            child: Text(
              widget.validator!(_selectedDateTime) ?? '',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.danger,
                  ),
            ),
          ),
      ],
    );
  }
}

/// Dialog برای انتخاب تاریخ شمسی
class _PersianDatePickerDialog extends StatefulWidget {
  const _PersianDatePickerDialog({
    required this.initialDate,
  });

  final Jalali initialDate;

  @override
  State<_PersianDatePickerDialog> createState() => _PersianDatePickerDialogState();
}

class _PersianDatePickerDialogState extends State<_PersianDatePickerDialog> {
  late Jalali _selectedDate;
  late int _currentYear;
  late int _currentMonth;

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialDate;
    _currentYear = _selectedDate.year;
    _currentMonth = _selectedDate.month;
  }

  void _previousMonth() {
    setState(() {
      if (_currentMonth > 1) {
        _currentMonth--;
      } else {
        _currentMonth = 12;
        _currentYear--;
      }
    });
  }

  void _nextMonth() {
    setState(() {
      if (_currentMonth < 12) {
        _currentMonth++;
      } else {
        _currentMonth = 1;
        _currentYear++;
      }
    });
  }

  List<Jalali> _getDaysInMonth() {
    final monthLength = Jalali(_currentYear, _currentMonth).monthLength;
    return List.generate(monthLength, (index) => Jalali(_currentYear, _currentMonth, index + 1));
  }

  int _getFirstDayOfWeek() {
    final firstDay = Jalali(_currentYear, _currentMonth, 1);
    final gregorian = firstDay.toGregorian();
    final dateTime = DateTime(gregorian.year, gregorian.month, gregorian.day);
    return dateTime.weekday % 7; // 0 = Saturday, 6 = Friday
  }

  @override
  Widget build(BuildContext context) {
    final days = _getDaysInMonth();
    final firstDayOfWeek = _getFirstDayOfWeek();
    final monthNames = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];
    final weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(16),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
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
                      '${monthNames[_currentMonth - 1]} ${_currentYear}',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),
            // Month navigation
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: _previousMonth,
                    icon: const Icon(Icons.chevron_right),
                  ),
                  IconButton(
                    onPressed: _nextMonth,
                    icon: const Icon(Icons.chevron_left),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Week days header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: weekDays.map((day) {
                  return Expanded(
                    child: Center(
                      child: Text(
                        day,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 8),
            // Calendar grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  // Empty cells for days before month start
                  Row(
                    children: List.generate(firstDayOfWeek, (index) => const Expanded(child: SizedBox())),
                  ),
                  // Days
                  for (int week = 0; week < (days.length + firstDayOfWeek + 6) ~/ 7; week++)
                    Row(
                      children: List.generate(7, (dayIndex) {
                        final dayNumber = week * 7 + dayIndex - firstDayOfWeek + 1;
                        if (dayNumber < 1 || dayNumber > days.length) {
                          return const Expanded(child: SizedBox());
                        }
                        final day = days[dayNumber - 1];
                        final isSelected = day.year == _selectedDate.year &&
                            day.month == _selectedDate.month &&
                            day.day == _selectedDate.day;
                        final isToday = day.year == Jalali.now().year &&
                            day.month == Jalali.now().month &&
                            day.day == Jalali.now().day;

                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.all(2),
                            child: InkWell(
                              onTap: () {
                                setState(() {
                                  _selectedDate = day;
                                });
                              },
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary
                                      : isToday
                                          ? AppColors.primary.withValues(alpha: 0.1)
                                          : Colors.transparent,
                                  borderRadius: BorderRadius.circular(8),
                                  border: isToday && !isSelected
                                      ? Border.all(color: AppColors.primary, width: 1)
                                      : null,
                                ),
                                child: Center(
                                  child: Text(
                                    day.day.toString(),
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: isSelected
                                              ? Colors.white
                                              : AppColors.textPrimary,
                                          fontWeight: isSelected || isToday
                                              ? FontWeight.w600
                                              : FontWeight.normal,
                                        ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Actions
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('انصراف'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(_selectedDate),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                    ),
                    child: const Text('تایید'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

