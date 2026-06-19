package com.example.bombaBet.api.dto.selecao;

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

}