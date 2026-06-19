package com.example.bombaBet.api.dto.usuario;

import lombok.Data;

@Data
public class UsuarioRequestDto {

    private String nome;
    private String email;
    private String password;
    private String fotoPerfil;

}