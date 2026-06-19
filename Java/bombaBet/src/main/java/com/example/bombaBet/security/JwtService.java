package com.example.bombaBet.security;

import com.example.bombaBet.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${bombaBet.jwt.secret}")
    private String secret;

    @Value("${bombaBet.jwt.expiration}")
    private Long expiration;

    public String gerarToken(UserDetails userDetails) {
        Date agora = new Date();

        Date expiracao = new Date(
                agora.getTime() + expiration
        );

        var token = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(agora)
                .expiration(expiracao);

        if (userDetails instanceof Usuario usuario) {
            token.claim("nome", usuario.getNome());
            token.claim("privilegio", usuario.getPrivilegio());
        }

        return token
                .signWith(getChaveAssinatura())
                .compact();
    }

    public String extrairEmail(String token) {
        return extrairClaims(token)
                .getSubject();
    }

    public boolean tokenValido(
            String token,
            UserDetails userDetails
    ) {
        String email = extrairEmail(token);

        return email.equals(userDetails.getUsername())
                && !tokenExpirado(token);
    }

    private boolean tokenExpirado(String token) {
        Date dataExpiracao = extrairClaims(token)
                .getExpiration();

        return dataExpiracao.before(new Date());
    }

    private Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(getChaveAssinatura())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getChaveAssinatura() {
        byte[] chaveBytes = secret.getBytes(
                StandardCharsets.UTF_8
        );

        return Keys.hmacShaKeyFor(chaveBytes);
    }
}