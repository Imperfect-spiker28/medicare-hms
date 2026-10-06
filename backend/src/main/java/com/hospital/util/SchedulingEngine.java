package com.hospital.util;

import com.hospital.dto.SlotDto;
import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.DoctorAvailability;
import com.hospital.entity.DoctorDay;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class SchedulingEngine {

    public List<SlotDto> generateSlots(
            LocalDate date,
            boolean isOnLeave,
            List<DoctorAvailability> weeklyAvailability,
            List<Appointment> existingAppointments
    ) {
        if (isOnLeave) {
            return Collections.emptyList();
        }

        DoctorDay dayOfWeek = DateTimeUtil.toDoctorDay(date);
        List<DoctorAvailability> windows = weeklyAvailability.stream()
                .filter(a -> a.getDay() == dayOfWeek)
                .toList();

        if (windows.isEmpty()) {
            return Collections.emptyList();
        }

        Set<LocalTime> bookedTimes = existingAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED && a.getStatus() != AppointmentStatus.NO_SHOW)
                .map(Appointment::getStartTime)
                .collect(Collectors.toSet());

        List<SlotDto> slots = new ArrayList<>();
        for (DoctorAvailability window : windows) {
            LocalTime cursor = window.getStartTime();
            LocalTime windowEnd = window.getEndTime();
            int slotMinutes = window.getSlotMinutes() != null && window.getSlotMinutes() > 0 ? window.getSlotMinutes() : 15;

            while (cursor.isBefore(windowEnd)) {
                LocalTime next = cursor.plusMinutes(slotMinutes);
                if (next.isAfter(windowEnd)) {
                    break;
                }

                boolean available = !bookedTimes.contains(cursor);
                slots.add(SlotDto.builder()
                        .startTime(DateTimeUtil.formatTime(cursor))
                        .endTime(DateTimeUtil.formatTime(next))
                        .available(available)
                        .build());

                cursor = next;
            }
        }

        return slots;
    }

    public int calculateNextTokenNumber(List<Appointment> todaysAppointments) {
        long nonCancelledCount = todaysAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .count();
        return (int) nonCancelledCount + 1;
    }
}
