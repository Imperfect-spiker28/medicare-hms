package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisplayQueueDto {
    private UUID doctorId;
    private String doctorName;
    private String departmentName;
    private String roomNumber;
    private Integer currentToken;
    private String currentStatus;
    private List<Integer> waitingTokens;
    private int totalCompletedToday;
}
