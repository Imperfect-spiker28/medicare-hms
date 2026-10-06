package com.hospital;

import com.hospital.dto.SlotDto;
import com.hospital.entity.*;
import com.hospital.util.SchedulingEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SchedulingEngineTests {

    private SchedulingEngine schedulingEngine;

    @BeforeEach
    void setUp() {
        schedulingEngine = new SchedulingEngine();
    }

    @Test
    void shouldReturnEmptySlotsIfDoctorIsOnLeave() {
        LocalDate date = LocalDate.of(2026, 7, 20); // Monday
        List<SlotDto> slots = schedulingEngine.generateSlots(
                date,
                true,
                Collections.emptyList(),
                Collections.emptyList()
        );
        assertTrue(slots.isEmpty());
    }

    @Test
    void shouldGenerateSlotsCorrectlyFromAvailabilityWindow() {
        LocalDate monday = LocalDate.of(2026, 7, 20); // Monday

        DoctorAvailability avail = DoctorAvailability.builder()
                .day(DoctorDay.MON)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .slotMinutes(15)
                .build();

        List<SlotDto> slots = schedulingEngine.generateSlots(
                monday,
                false,
                List.of(avail),
                Collections.emptyList()
        );

        assertEquals(4, slots.size());
        assertEquals("09:00", slots.get(0).getStartTime());
        assertEquals("09:15", slots.get(0).getEndTime());
        assertTrue(slots.get(0).isAvailable());

        assertEquals("09:45", slots.get(3).getStartTime());
        assertEquals("10:00", slots.get(3).getEndTime());
        assertTrue(slots.get(3).isAvailable());
    }

    @Test
    void shouldMarkBookedSlotsAsUnavailable() {
        LocalDate monday = LocalDate.of(2026, 7, 20);

        DoctorAvailability avail = DoctorAvailability.builder()
                .day(DoctorDay.MON)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .slotMinutes(15)
                .build();

        Appointment bookedAppt = Appointment.builder()
                .id(UUID.randomUUID())
                .startTime(LocalTime.of(9, 15))
                .endTime(LocalTime.of(9, 30))
                .status(AppointmentStatus.CONFIRMED)
                .build();

        List<SlotDto> slots = schedulingEngine.generateSlots(
                monday,
                false,
                List.of(avail),
                List.of(bookedAppt)
        );

        assertEquals(4, slots.size());
        assertTrue(slots.get(0).isAvailable()); // 09:00
        assertFalse(slots.get(1).isAvailable()); // 09:15 is booked
        assertTrue(slots.get(2).isAvailable()); // 09:30
        assertTrue(slots.get(3).isAvailable()); // 09:45
    }

    @Test
    void shouldCalculateSequentialTokensExcludingCancelled() {
        List<Appointment> appts = new ArrayList<>();
        appts.add(Appointment.builder().status(AppointmentStatus.CONFIRMED).build());
        appts.add(Appointment.builder().status(AppointmentStatus.CANCELLED).build());
        appts.add(Appointment.builder().status(AppointmentStatus.CHECKED_IN).build());

        int token = schedulingEngine.calculateNextTokenNumber(appts);
        assertEquals(3, token); // 2 active + 1 = 3
    }
}
