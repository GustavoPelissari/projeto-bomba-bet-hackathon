package com.example.bombaBet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "foto_perfil")
    private String fotoPerfil;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String privilegio = "USER";

    @Column(nullable = false)
    @Builder.Default
    private boolean bloqueado = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @Column(name = "pontuacao_total", nullable = false)
    @Builder.Default
    private Integer pontuacaoTotal = 0;

    @Column(name = "placares_exatos", nullable = false)
    @Builder.Default
    private Integer placaresExatos = 0;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "ultimo_acesso")
    private LocalDateTime ultimoAcesso;

    @PrePersist
    public void antesDeSalvar() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }

        if (privilegio == null || privilegio.isBlank()) {
            privilegio = "USER";
        } else {
            privilegio = privilegio.toUpperCase();
        }

        if (pontuacaoTotal == null) {
            pontuacaoTotal = 0;
        }

        if (placaresExatos == null) {
            placaresExatos = 0;
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String autoridade = "ADMIN".equalsIgnoreCase(privilegio)
                ? "ROLE_ADMIN"
                : "ROLE_USER";

        return Collections.singletonList(
                new SimpleGrantedAuthority(autoridade)
        );
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !bloqueado;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}