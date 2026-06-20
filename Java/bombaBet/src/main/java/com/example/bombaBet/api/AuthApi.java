package com.example.bombaBet.api;

import com.example.bombaBet.api.dto.usuario.LoginRequestDto;
import com.example.bombaBet.api.dto.usuario.LoginResponseDto;
import com.example.bombaBet.api.dto.usuario.RecuperarSenhaRequestDto;
import com.example.bombaBet.api.dto.usuario.RedefinirSenhaRequestDto;
import com.example.bombaBet.api.dto.usuario.UsuarioRequestDto;
import com.example.bombaBet.api.dto.usuario.UsuarioResponseDto;
import com.example.bombaBet.model.Usuario;
import com.example.bombaBet.security.JwtService;
import com.example.bombaBet.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthApi {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    @PostMapping("/cadastro")
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

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request
    ) {
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        Usuario usuario = (Usuario) authentication.getPrincipal();

        usuarioService.registrarUltimoAcesso(
                usuario.getEmail()
        );

        String token = jwtService.gerarToken(usuario);

        LoginResponseDto response = LoginResponseDto.builder()
                .token(token)
                .tipo("Bearer")
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .build();

        return ResponseEntity.ok(response);
    }

    // RF-003 — Solicita a recuperação de senha: gera um token de redefinição.
    // (Sem servidor de e-mail, o token é devolvido na resposta para o app usar.)
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> esqueciMinhaSenha(
            @RequestBody RecuperarSenhaRequestDto request
    ) {
        String token = usuarioService.gerarTokenRecuperacao(request.getEmail());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "mensagem", "Token de recuperação gerado. Em produção, seria enviado por e-mail."
        ));
    }

    // RF-003 — Redefine a senha usando o token recebido.
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> redefinirSenha(
            @RequestBody RedefinirSenhaRequestDto request
    ) {
        usuarioService.redefinirSenha(request.getToken(), request.getNovaSenha());

        return ResponseEntity.ok(Map.of(
                "mensagem", "Senha redefinida com sucesso."
        ));
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
                .pontuacaoTotal(usuario.getPontuacaoTotal())
                .placaresExatos(usuario.getPlacaresExatos())
                .build();
    }
}