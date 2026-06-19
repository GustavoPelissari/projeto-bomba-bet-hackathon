package com.example.bombaBet.api.dto.usuario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioResponseDto {

    private Long id;

    private String nome;

    private String email;

    private String fotoPerfil;

    private String privilegio;

    private boolean bloqueado;

    private boolean ativo;

    private Integer pontuacaoTotal;

    private Integer placaresExatos;

}