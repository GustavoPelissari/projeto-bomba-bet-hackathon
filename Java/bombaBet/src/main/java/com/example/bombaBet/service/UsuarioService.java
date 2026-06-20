package com.example.bombaBet.service;

import com.example.bombaBet.model.Usuario;
import com.example.bombaBet.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Usuário não encontrado com o ID: " + id
                        )
                );
    }

    public Usuario buscarPorEmail(String email) {
        String emailNormalizado = normalizarEmail(email);

        return usuarioRepository.findByEmailIgnoreCase(emailNormalizado)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Usuário não encontrado com o e-mail informado"
                        )
                );
    }

    /*
     * RF-003 — Gera um token de recuperação de senha para o e-mail informado.
     * O token vale por 1 hora. (Em produção, seria enviado por e-mail;
     * aqui ele é retornado para o app, pois não há servidor SMTP configurado.)
     */
    @Transactional
    public String gerarTokenRecuperacao(String email) {
        Usuario usuario = buscarPorEmail(email); // lança erro se o e-mail não existir

        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        usuario.setResetTokenExpiraEm(LocalDateTime.now().plusHours(1));

        usuarioRepository.save(usuario);
        return token;
    }

    /*
     * RF-003 — Redefine a senha a partir de um token válido (e não expirado).
     */
    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        if (novaSenha == null || novaSenha.length() < 6) {
            throw new IllegalArgumentException(
                    "A nova senha deve ter ao menos 6 caracteres"
            );
        }

        Usuario usuario = usuarioRepository.findByResetToken(token)
                .orElseThrow(() ->
                        new IllegalArgumentException("Token inválido")
                );

        if (usuario.getResetTokenExpiraEm() == null
                || usuario.getResetTokenExpiraEm().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expirado. Solicite um novo.");
        }

        usuario.setPassword(passwordEncoder.encode(novaSenha));
        // Invalida o token após o uso.
        usuario.setResetToken(null);
        usuario.setResetTokenExpiraEm(null);

        usuarioRepository.save(usuario);
    }

    public List<Usuario> pesquisar(String termo) {
        if (termo == null || termo.isBlank()) {
            return listarTodos();
        }

        String termoNormalizado = termo.trim();

        return usuarioRepository
                .findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        termoNormalizado,
                        termoNormalizado
                );
    }

    public Page<Usuario> buscarRanking(Pageable pageable) {
        return usuarioRepository
                .findByAtivoTrueOrderByPontuacaoTotalDescPlacaresExatosDescCriadoEmAsc(
                        pageable
                );
    }

    @Transactional
    public Usuario cadastrar(Usuario usuario) {
        validarUsuario(usuario);

        String emailNormalizado = normalizarEmail(usuario.getEmail());

        if (usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)) {
            throw new IllegalArgumentException(
                    "Já existe um usuário cadastrado com este e-mail"
            );
        }

        usuario.setEmail(emailNormalizado);
        usuario.setNome(usuario.getNome().trim());
        usuario.setPassword(
                passwordEncoder.encode(usuario.getPassword())
        );

        if (usuario.getPrivilegio() == null
                || usuario.getPrivilegio().isBlank()) {

            usuario.setPrivilegio("USER");
        } else {
            usuario.setPrivilegio(
                    usuario.getPrivilegio().trim().toUpperCase()
            );
        }

        usuario.setAtivo(true);
        usuario.setBloqueado(false);
        usuario.setPontuacaoTotal(0);
        usuario.setPlacaresExatos(0);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario atualizar(Long id, Usuario dadosAtualizados) {
        Usuario usuarioSalvo = buscarPorId(id);

        validarNome(dadosAtualizados.getNome());
        validarEmail(dadosAtualizados.getEmail());

        String emailNormalizado = normalizarEmail(
                dadosAtualizados.getEmail()
        );

        boolean emailFoiAlterado =
                !usuarioSalvo.getEmail().equalsIgnoreCase(emailNormalizado);

        if (emailFoiAlterado
                && usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)) {

            throw new IllegalArgumentException(
                    "Já existe outro usuário cadastrado com este e-mail"
            );
        }

        usuarioSalvo.setNome(
                dadosAtualizados.getNome().trim()
        );

        usuarioSalvo.setEmail(emailNormalizado);

        usuarioSalvo.setFotoPerfil(
                dadosAtualizados.getFotoPerfil()
        );

        return usuarioRepository.save(usuarioSalvo);
    }

    @Transactional
    public void alterarSenha(
            Long usuarioId,
            String novaSenha
    ) {
        Usuario usuario = buscarPorId(usuarioId);

        validarSenha(novaSenha);

        usuario.setPassword(
                passwordEncoder.encode(novaSenha)
        );

        usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario alterarPrivilegio(
            Long usuarioId,
            String privilegio
    ) {
        Usuario usuario = buscarPorId(usuarioId);

        String privilegioNormalizado = normalizarPrivilegio(
                privilegio
        );

        usuario.setPrivilegio(privilegioNormalizado);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario bloquear(Long usuarioId) {
        Usuario usuario = buscarPorId(usuarioId);

        usuario.setBloqueado(true);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario desbloquear(Long usuarioId) {
        Usuario usuario = buscarPorId(usuarioId);

        usuario.setBloqueado(false);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario desativar(Long usuarioId) {
        Usuario usuario = buscarPorId(usuarioId);

        usuario.setAtivo(false);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario ativar(Long usuarioId) {
        Usuario usuario = buscarPorId(usuarioId);

        usuario.setAtivo(true);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void excluir(Long usuarioId) {
        Usuario usuario = buscarPorId(usuarioId);

        usuarioRepository.delete(usuario);
    }

    @Transactional
    public void registrarUltimoAcesso(String email) {
        Usuario usuario = buscarPorEmail(email);

        usuario.setUltimoAcesso(LocalDateTime.now());

        usuarioRepository.save(usuario);
    }

    public long contarUsuariosAtivos() {
        return usuarioRepository.countByAtivoTrue();
    }

    public long contarUsuariosAtivosNasUltimas24Horas() {
        LocalDateTime ultimas24Horas =
                LocalDateTime.now().minusHours(24);

        return usuarioRepository.countByUltimoAcessoAfter(
                ultimas24Horas
        );
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        String emailNormalizado = normalizarEmail(email);

        return usuarioRepository.findByEmailIgnoreCase(emailNormalizado)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuário não encontrado"
                        )
                );
    }

    private void validarUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException(
                    "Os dados do usuário são obrigatórios"
            );
        }

        validarNome(usuario.getNome());
        validarEmail(usuario.getEmail());
        validarSenha(usuario.getPassword());
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException(
                    "O nome do usuário é obrigatório"
            );
        }

        if (nome.trim().length() < 3) {
            throw new IllegalArgumentException(
                    "O nome deve possuir pelo menos 3 caracteres"
            );
        }
    }

    private void validarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "O e-mail do usuário é obrigatório"
            );
        }

        if (!email.contains("@")) {
            throw new IllegalArgumentException(
                    "Informe um endereço de e-mail válido"
            );
        }
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.isBlank()) {
            throw new IllegalArgumentException(
                    "A senha é obrigatória"
            );
        }

        if (senha.length() < 6) {
            throw new IllegalArgumentException(
                    "A senha deve possuir pelo menos 6 caracteres"
            );
        }
    }

    private String normalizarEmail(String email) {
        validarEmail(email);

        return email.trim().toLowerCase();
    }

    private String normalizarPrivilegio(String privilegio) {
        if (privilegio == null || privilegio.isBlank()) {
            throw new IllegalArgumentException(
                    "O privilégio é obrigatório"
            );
        }

        String privilegioNormalizado =
                privilegio.trim().toUpperCase();

        if (!privilegioNormalizado.equals("ADMIN")
                && !privilegioNormalizado.equals("USER")) {

            throw new IllegalArgumentException(
                    "O privilégio deve ser ADMIN ou USER"
            );
        }

        return privilegioNormalizado;
    }
}