package com.example.bombaBet.api.dto.selecao;

import lombok.Data;

@Data
public class SelecaoRequestDto {

    private String nome;
    private String codigoFifa;
    private String grupo;
    private String bandeira;

}