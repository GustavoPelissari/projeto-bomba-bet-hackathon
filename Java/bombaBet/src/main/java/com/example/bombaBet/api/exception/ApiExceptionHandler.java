package com.example.bombaBet.api.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Tratador global de erros da API REST (apenas controllers do pacote api).
 * Converte exceções em respostas JSON com o código HTTP correto e uma
 * mensagem clara — em vez da página de erro 500 padrão.
 *
 * Não afeta o painel web (Thymeleaf), pois está limitado ao pacote api.
 */
@RestControllerAdvice(basePackages = "com.example.bombaBet.api")
public class ApiExceptionHandler {

    // Regra de negócio violada (ex.: palpite após o início da partida) -> 422
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> regraDeNegocio(IllegalStateException e) {
        return montar(HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage());
    }

    // Dados inválidos (ex.: token de senha inválido, parâmetro incorreto) -> 400
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> dadosInvalidos(IllegalArgumentException e) {
        return montar(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    // Recurso não encontrado (ex.: partida/usuário inexistente) -> 404
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> naoEncontrado(EntityNotFoundException e) {
        return montar(HttpStatus.NOT_FOUND, e.getMessage());
    }

    // Acesso negado (ex.: editar/excluir palpite de outro usuário) -> 403
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> acessoNegado(AccessDeniedException e) {
        return montar(HttpStatus.FORBIDDEN, e.getMessage());
    }

    // Monta o corpo JSON padrão da resposta de erro.
    private ResponseEntity<Map<String, Object>> montar(
            HttpStatus status,
            String mensagem
    ) {
        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", mensagem != null ? mensagem : status.getReasonPhrase()
        );
        return ResponseEntity.status(status).body(body);
    }
}
