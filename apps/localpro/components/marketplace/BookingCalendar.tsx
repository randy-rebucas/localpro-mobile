import { Ionicons } from '@expo/vector-icons';
import type { Booking } from '@localpro/types';
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/use-theme';

interface BookingCalendarProps {
  bookings: Booking[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function BookingCalendar({
  bookings,
  onDateSelect,
  selectedDate,
}: BookingCalendarProps) {
  const colors = useThemeColors();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get first day of month and number of days
  // const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0); // Reserved for future use
  const startDate = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const date = new Date(monthStart);
    date.setDate(date.getDate() - date.getDay()); // Start from Sunday
    return date;
  }, [currentMonth]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [startDate]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach((booking) => {
      const date = new Date(booking.scheduledDate);
      const dateKey = date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookings]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const getBookingsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return bookingsByDate[dateKey] || [];
  };

  const renderDay = (date: Date, index: number) => {
    const isCurrent = isCurrentMonth(date);
    const isTodayDate = isToday(date);
    const isSelectedDate = isSelected(date);
    const dayBookings = getBookingsForDate(date);
    const hasBookings = dayBookings.length > 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayContainer,
          !isCurrent && styles.dayOtherMonth,
          isTodayDate && { backgroundColor: colors.primary[50] },
          isSelectedDate && { backgroundColor: colors.primary[600] },
        ]}
        onPress={() => onDateSelect?.(date)}
        disabled={!isCurrent}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrent && styles.dayTextOtherMonth,
            isTodayDate && { color: colors.primary[600], fontWeight: 'bold' },
            isSelectedDate && { color: Colors.text.inverse },
          ]}
        >
          {date.getDate()}
        </Text>
        {hasBookings && (
          <View style={styles.bookingsIndicator}>
            <View
              style={[
                styles.bookingDot,
                { backgroundColor: isSelectedDate ? Colors.text.inverse : colors.primary[600] },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Week Days Header */}
      <View style={styles.weekDaysHeader}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => renderDay(date, index))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary[600] }]} />
          <Text style={styles.legendText}>Has bookings</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary[50] }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navButton: {
    padding: Spacing.xs,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    margin: 1,
    position: 'relative',
  },
  dayOtherMonth: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  dayTextOtherMonth: {
    color: Colors.text.tertiary,
  },
  bookingsIndicator: {
    position: 'absolute',
    bottom: 4,
  },
  bookingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});

