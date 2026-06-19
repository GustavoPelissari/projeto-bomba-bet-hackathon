package com.example.bombaBet.api.dto.usuario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDto {

    private String token;

    private String tipo;

    private String nome;

    private String email;

}