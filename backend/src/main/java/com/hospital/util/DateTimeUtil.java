package com.hospital.util;

import com.hospital.entity.DoctorDay;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public static String formatTime(LocalTime time) {
        if (time == null) return null;
        return time.format(TIME_FORMATTER);
    }

    public static LocalTime parseTime(String time) {
        if (time == null || time.isBlank()) return null;
        return LocalTime.parse(time, TIME_FORMATTER);
    }

    public static DoctorDay toDoctorDay(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return switch (day) {
            case SUNDAY -> DoctorDay.SUN;
            case MONDAY -> DoctorDay.MON;
            case TUESDAY -> DoctorDay.TUE;
            case WEDNESDAY -> DoctorDay.WED;
            case THURSDAY -> DoctorDay.THU;
            case FRIDAY -> DoctorDay.FRI;
            case SATURDAY -> DoctorDay.SAT;
        };
    }
}
