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
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // ---------------- Consultas ----------------

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() ->
                new EntityNotFoundException("Usuário não encontrado com o ID: " + id));
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmailIgnoreCase(normalizarEmail(email)).orElseThrow(() ->
                new EntityNotFoundException("Usuário não encontrado com o e-mail informado"));
    }

    public List<Usuario> pesquisar(String termo) {
        if (termo == null || termo.isBlank()) {
            return listarTodos();
        }
        String t = termo.trim();
        return usuarioRepository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(t, t);
    }

    public Page<Usuario> buscarRanking(Pageable pageable) {
        return usuarioRepository
                .findByAtivoTrueOrderByPontuacaoTotalDescPlacaresExatosDescCriadoEmAsc(pageable);
    }

    public long contarUsuariosAtivos() {
        return usuarioRepository.countByAtivoTrue();
    }

    public long contarUsuariosAtivosNasUltimas24Horas() {
        return usuarioRepository.countByUltimoAcessoAfter(LocalDateTime.now().minusHours(24));
    }

    // ---------------- Recuperação de senha (RF-003) ----------------

    // Gera um token de recuperação válido por 1 hora (devolvido ao app, pois não há SMTP).
    @Transactional
    public String gerarTokenRecuperacao(String email) {
        Usuario usuario = buscarPorEmail(email); // lança erro se o e-mail não existir
        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        usuario.setResetTokenExpiraEm(LocalDateTime.now().plusHours(1));
        usuarioRepository.save(usuario);
        return token;
    }

    // Redefine a senha a partir de um token válido e não expirado.
    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        if (novaSenha == null || novaSenha.length() < 6) {
            throw new IllegalArgumentException("A nova senha deve ter ao menos 6 caracteres");
        }

        Usuario usuario = usuarioRepository.findByResetToken(token).orElseThrow(() ->
                new IllegalArgumentException("Token inválido"));

        if (usuario.getResetTokenExpiraEm() == null
                || usuario.getResetTokenExpiraEm().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expirado. Solicite um novo.");
        }

        usuario.setPassword(passwordEncoder.encode(novaSenha));
        usuario.setResetToken(null);          // invalida o token após o uso
        usuario.setResetTokenExpiraEm(null);
        usuarioRepository.save(usuario);
    }

    // ---------------- Cadastro / edição ----------------

    @Transactional
    public Usuario cadastrar(Usuario usuario) {
        validarUsuario(usuario);
        String email = normalizarEmail(usuario.getEmail());

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail");
        }

        usuario.setEmail(email);
        usuario.setNome(usuario.getNome().trim());
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        // Privilégio padrão USER quando não informado.
        boolean semPrivilegio = usuario.getPrivilegio() == null || usuario.getPrivilegio().isBlank();
        usuario.setPrivilegio(semPrivilegio ? "USER" : usuario.getPrivilegio().trim().toUpperCase());
        usuario.setAtivo(true);
        usuario.setBloqueado(false);
        usuario.setPontuacaoTotal(0);
        usuario.setPlacaresExatos(0);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario atualizar(Long id, Usuario dados) {
        Usuario usuario = buscarPorId(id);
        validarNome(dados.getNome());
        validarEmail(dados.getEmail());
        String email = normalizarEmail(dados.getEmail());

        boolean emailMudou = !usuario.getEmail().equalsIgnoreCase(email);
        if (emailMudou && usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com este e-mail");
        }

        usuario.setNome(dados.getNome().trim());
        usuario.setEmail(email);
        usuario.setFotoPerfil(dados.getFotoPerfil());

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void alterarSenha(Long usuarioId, String novaSenha) {
        validarSenha(novaSenha);
        Usuario usuario = buscarPorId(usuarioId);
        usuario.setPassword(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario alterarPrivilegio(Long usuarioId, String privilegio) {
        Usuario usuario = buscarPorId(usuarioId);
        usuario.setPrivilegio(normalizarPrivilegio(privilegio));
        return usuarioRepository.save(usuario);
    }

    // ---------------- Estado da conta (bloqueio / ativação) ----------------

    @Transactional
    public Usuario bloquear(Long usuarioId) {
        return mudarEstado(usuarioId, u -> u.setBloqueado(true));
    }

    @Transactional
    public Usuario desbloquear(Long usuarioId) {
        return mudarEstado(usuarioId, u -> u.setBloqueado(false));
    }

    @Transactional
    public Usuario ativar(Long usuarioId) {
        return mudarEstado(usuarioId, u -> u.setAtivo(true));
    }

    @Transactional
    public Usuario desativar(Long usuarioId) {
        return mudarEstado(usuarioId, u -> u.setAtivo(false));
    }

    @Transactional
    public void excluir(Long usuarioId) {
        usuarioRepository.delete(buscarPorId(usuarioId));
    }

    @Transactional
    public void registrarUltimoAcesso(String email) {
        Usuario usuario = buscarPorEmail(email);
        usuario.setUltimoAcesso(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }

    // ---------------- Spring Security ----------------

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmailIgnoreCase(normalizarEmail(email)).orElseThrow(() ->
                new UsernameNotFoundException("Usuário não encontrado"));
    }

    // ---------------- Validações / helpers ----------------

    // Aplica uma mudança simples de estado e salva (usado por bloquear/ativar/etc.).
    private Usuario mudarEstado(Long usuarioId, Consumer<Usuario> mutacao) {
        Usuario usuario = buscarPorId(usuarioId);
        mutacao.accept(usuario);
        return usuarioRepository.save(usuario);
    }

    private void validarUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("Os dados do usuário são obrigatórios");
        }
        validarNome(usuario.getNome());
        validarEmail(usuario.getEmail());
        validarSenha(usuario.getPassword());
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("O nome do usuário é obrigatório");
        }
        if (nome.trim().length() < 3) {
            throw new IllegalArgumentException("O nome deve possuir pelo menos 3 caracteres");
        }
    }

    private void validarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("O e-mail do usuário é obrigatório");
        }
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Informe um endereço de e-mail válido");
        }
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.isBlank()) {
            throw new IllegalArgumentException("A senha é obrigatória");
        }
        if (senha.length() < 6) {
            throw new IllegalArgumentException("A senha deve possuir pelo menos 6 caracteres");
        }
    }

    private String normalizarEmail(String email) {
        validarEmail(email);
        return email.trim().toLowerCase();
    }

    private String normalizarPrivilegio(String privilegio) {
        if (privilegio == null || privilegio.isBlank()) {
            throw new IllegalArgumentException("O privilégio é obrigatório");
        }
        String valor = privilegio.trim().toUpperCase();
        if (!valor.equals("ADMIN") && !valor.equals("USER")) {
            throw new IllegalArgumentException("O privilégio deve ser ADMIN ou USER");
        }
        return valor;
    }
}
