package com.example.bombaBet.api.controller;

import com.example.bombaBet.api.dto.usuario.UsuarioResponseDto;
import com.example.bombaBet.model.Usuario;
import com.example.bombaBet.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponseDto> listarTodos() {
        return usuarioService.listarTodos()
                .stream()
                .map(UsuarioResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDto buscarPorId(
            @PathVariable Long id
    ) {
        return UsuarioResponseDto.fromEntity(
                usuarioService.buscarPorId(id)
        );
    }

    @PostMapping
    public UsuarioResponseDto cadastrar(
            @RequestBody Usuario usuario
    ) {
        return UsuarioResponseDto.fromEntity(
                usuarioService.cadastrar(usuario)
        );
    }

    @PutMapping("/{id}")
    public UsuarioResponseDto atualizar(
            @PathVariable Long id,
            @RequestBody Usuario usuario
    ) {
        return UsuarioResponseDto.fromEntity(
                usuarioService.atualizar(id, usuario)
        );
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id
    ) {
        usuarioService.excluir(id);
    }
}
