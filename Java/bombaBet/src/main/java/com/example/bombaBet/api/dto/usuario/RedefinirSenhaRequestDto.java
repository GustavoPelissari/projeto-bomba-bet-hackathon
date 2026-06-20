package com.example.bombaBet.api.dto.usuario;

import lombok.Data;

// Corpo da requisição de redefinição de senha (token + nova senha).
@Data
public class RedefinirSenhaRequestDto {
    private String token;
    private String novaSenha;
}
