package com.example.bombaBet.api.dto.selecao;

import com.example.bombaBet.model.Selecao;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SelecaoResponseDto {

    private Long id;
    private String nome;
    private String codigoFifa;
    private String grupo;
    private String bandeira;

    public static SelecaoResponseDto fromEntity(
            Selecao selecao
    ) {
        return SelecaoResponseDto.builder()
                .id(selecao.getId())
                .nome(selecao.getNome())
                .codigoFifa(selecao.getCodigoFifa())
                .grupo(selecao.getGrupo())
                .bandeira(selecao.getBandeira())
                .build();
    }
}