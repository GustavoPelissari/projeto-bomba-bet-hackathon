package com.example.bombaBet.api;

import com.example.bombaBet.api.dto.usuario.LoginRequestDto;
import com.example.bombaBet.api.dto.usuario.LoginResponseDto;
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