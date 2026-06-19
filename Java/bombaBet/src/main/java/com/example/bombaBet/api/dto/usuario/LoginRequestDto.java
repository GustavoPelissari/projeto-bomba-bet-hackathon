package com.example.bombaBet.api.dto.usuario;

import lombok.Data;

@Data
public class LoginRequestDto {

    private String email;

    private String password;

}