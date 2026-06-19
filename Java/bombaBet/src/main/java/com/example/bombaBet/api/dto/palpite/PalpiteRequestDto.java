package com.example.bombaBet.api.dto.palpite;

import lombok.Data;

@Data
public class PalpiteRequestDto {

    private Long partidaId;

    private Integer golsCasa;

    private Integer golsVisitante;

}