package com.example.bombaBet.web.controller;

import com.example.bombaBet.model.Usuario;
import com.example.bombaBet.service.PalpiteService;
import com.example.bombaBet.service.PartidaService;
import com.example.bombaBet.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final UsuarioService usuarioService;
    private final PartidaService partidaService;
    private final PalpiteService palpiteService;

    @GetMapping("/admin")
    public String dashboard(Model model) {

        var usuarios = usuarioService.listarTodos();

        // Limite para "últimas 24h".
        LocalDateTime limite24h = LocalDateTime.now().minusHours(24);

        // Total de usuários com a conta ativa.
        long totalUsuariosAtivos = usuarios.stream()
                .filter(Usuario::isAtivo)
                .count();

        // Usuários que acessaram nas últimas 24 horas.
        long usuariosAtivosUltimas24h = usuarios.stream()
                .filter(u -> u.getUltimoAcesso() != null
                        && u.getUltimoAcesso().isAfter(limite24h))
                .count();

        // Partidas que ainda não foram encerradas (sem resultado lançado).
        long partidasPendentesResultado = partidaService.listarTodas().stream()
                .filter(p -> !"ENCERRADA".equalsIgnoreCase(p.getStatus()))
                .count();

        // Total de palpites cadastrados.
        long totalPalpites = palpiteService.listarTodos().size();

        // Envia os indicadores para o template (admin/dashboard.html).
        model.addAttribute("totalUsuariosAtivos", totalUsuariosAtivos);
        model.addAttribute("usuariosAtivosUltimas24h", usuariosAtivosUltimas24h);
        model.addAttribute("partidasPendentesResultado", partidasPendentesResultado);
        model.addAttribute("totalPalpites", totalPalpites);

        return "admin/dashboard";
    }
}
