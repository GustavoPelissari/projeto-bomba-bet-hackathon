package com.example.bombaBet.api.dto.usuario;

import lombok.Data;

// Corpo da requisição de "esqueci minha senha".
@Data
public class RecuperarSenhaRequestDto {
    private String email;
}
