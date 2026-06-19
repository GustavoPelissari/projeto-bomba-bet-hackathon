package com.example.bombaBet.api.dto.palpite;

import lombok.Builder;
import lombok.Data;
import com.example.bombaBet.model.Palpite;

@Data
@Builder
public class PalpiteResponseDto {

    private Long id;

    private Long partidaId;

    private String usuario;

    private Integer golsCasa;

    private Integer golsVisitante;

    private Integer pontuacao;

    private String criterioPontuacao;

    public static PalpiteResponseDto fromEntity(
            Palpite palpite
    ) {
        return PalpiteResponseDto.builder()
                .id(palpite.getId())
                .partidaId(
                        palpite.getPartida() != null
                                ? palpite.getPartida().getId()
                                : null
                )
                .usuario(
                        palpite.getUsuario() != null
                                ? palpite.getUsuario().getNome()
                                : null
                )
                .golsCasa(palpite.getGolsCasa())
                .golsVisitante(palpite.getGolsVisitante())
                .pontuacao(palpite.getPontuacao())
                .criterioPontuacao(
                        palpite.getCriterioPontuacao()
                )
                .build();
    }

}