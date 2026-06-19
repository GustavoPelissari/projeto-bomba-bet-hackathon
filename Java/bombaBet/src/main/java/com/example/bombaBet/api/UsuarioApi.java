package com.example.bombaBet.api;

import com.example.bombaBet.api.dto.usuario.UsuarioRequestDto;
import com.example.bombaBet.api.dto.usuario.UsuarioResponseDto;
import com.example.bombaBet.model.Usuario;
import com.example.bombaBet.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioApi {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDto>> listar(
            @RequestParam(required = false) String termo
    ) {
        List<Usuario> usuarios = usuarioService.pesquisar(termo);

        List<UsuarioResponseDto> response = usuarios
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> buscarPorId(
            @PathVariable Long id
    ) {
        Usuario usuario = usuarioService.buscarPorId(id);

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDto> buscarMeuPerfil(
            Authentication authentication
    ) {
        String emailUsuarioLogado = authentication.getName();

        Usuario usuario = usuarioService.buscarPorEmail(
                emailUsuarioLogado
        );

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDto> cadastrar(
            @Valid @RequestBody UsuarioRequestDto request
    ) {
        Usuario usuario = usuarioService.cadastrar(
                converterParaEntidade(request)
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(converterParaResponse(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDto request
    ) {
        Usuario usuario = usuarioService.atualizar(
                id,
                converterParaEntidade(request)
        );

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDto> atualizarMeuPerfil(
            @Valid @RequestBody UsuarioRequestDto request,
            Authentication authentication
    ) {
        String emailUsuarioLogado = authentication.getName();

        Usuario usuarioLogado = usuarioService.buscarPorEmail(
                emailUsuarioLogado
        );

        Usuario usuarioAtualizado = usuarioService.atualizar(
                usuarioLogado.getId(),
                converterParaEntidade(request)
        );

        return ResponseEntity.ok(
                converterParaResponse(usuarioAtualizado)
        );
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(
            @PathVariable Long id,
            @RequestParam String novaSenha
    ) {
        usuarioService.alterarSenha(
                id,
                novaSenha
        );

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/senha")
    public ResponseEntity<Void> alterarMinhaSenha(
            @RequestParam String novaSenha,
            Authentication authentication
    ) {
        String emailUsuarioLogado = authentication.getName();

        Usuario usuarioLogado = usuarioService.buscarPorEmail(
                emailUsuarioLogado
        );

        usuarioService.alterarSenha(
                usuarioLogado.getId(),
                novaSenha
        );

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/privilegio")
    public ResponseEntity<UsuarioResponseDto> alterarPrivilegio(
            @PathVariable Long id,
            @RequestParam String privilegio
    ) {
        Usuario usuario = usuarioService.alterarPrivilegio(
                id,
                privilegio
        );

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @PatchMapping("/{id}/bloquear")
    public ResponseEntity<UsuarioResponseDto> bloquear(
            @PathVariable Long id
    ) {
        Usuario usuario = usuarioService.bloquear(id);

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @PatchMapping("/{id}/desbloquear")
    public ResponseEntity<UsuarioResponseDto> desbloquear(
            @PathVariable Long id
    ) {
        Usuario usuario = usuarioService.desbloquear(id);

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<UsuarioResponseDto> ativar(
            @PathVariable Long id
    ) {
        Usuario usuario = usuarioService.ativar(id);

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @PatchMapping("/{id}/desativar")
    public ResponseEntity<UsuarioResponseDto> desativar(
            @PathVariable Long id
    ) {
        Usuario usuario = usuarioService.desativar(id);

        return ResponseEntity.ok(
                converterParaResponse(usuario)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id
    ) {
        usuarioService.excluir(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ranking")
    public ResponseEntity<Page<UsuarioResponseDto>> ranking(
            Pageable pageable
    ) {
        Page<UsuarioResponseDto> ranking = usuarioService
                .buscarRanking(pageable)
                .map(this::converterParaResponse);

        return ResponseEntity.ok(ranking);
    }

    private Usuario converterParaEntidade(
            UsuarioRequestDto request
    ) {
        return Usuario.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .password(request.getPassword())
                .fotoPerfil(request.getFotoPerfil())
                .build();
    }

    private UsuarioResponseDto converterParaResponse(
            Usuario usuario
    ) {
        return UsuarioResponseDto.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .fotoPerfil(usuario.getFotoPerfil())
                .privilegio(usuario.getPrivilegio())
                .bloqueado(usuario.isBloqueado())
                .ativo(usuario.isAtivo())
                .pontuacaoTotal(usuario.getPontuacaoTotal())
                .placaresExatos(usuario.getPlacaresExatos())
                .build();
    }
}