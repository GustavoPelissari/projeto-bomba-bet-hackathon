package com.example.bombaBet.api.dto.usuario;

import com.example.bombaBet.model.Usuario;
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

    private Integer pontuacaoTotal;

    private Integer placaresExatos;

    public static UsuarioResponseDto fromEntity(
            Usuario usuario
    ) {
        return UsuarioResponseDto.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .fotoPerfil(usuario.getFotoPerfil())
                .privilegio(usuario.getPrivilegio())
                .pontuacaoTotal(usuario.getPontuacaoTotal())
                .placaresExatos(usuario.getPlacaresExatos())
                .build();
    }
}