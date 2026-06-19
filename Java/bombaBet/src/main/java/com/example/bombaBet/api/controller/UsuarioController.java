package com.example.bombaBet.api.controller;

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
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public Usuario buscarPorId(
            @PathVariable Long id
    ) {
        return usuarioService.buscarPorId(id);
    }

    @PostMapping
    public Usuario cadastrar(
            @RequestBody Usuario usuario
    ) {
        return usuarioService.cadastrar(usuario);
    }

    @PutMapping("/{id}")
    public Usuario atualizar(
            @PathVariable Long id,
            @RequestBody Usuario usuario
    ) {
        return usuarioService.atualizar(id, usuario);
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id
    ) {
        usuarioService.excluir(id);
    }
}