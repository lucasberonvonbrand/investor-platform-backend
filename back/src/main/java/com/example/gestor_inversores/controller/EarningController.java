package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.RequestEarningDTO;
import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.service.earning.IEarningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/earnings")
@RequiredArgsConstructor
public class EarningController {

    private final IEarningService earningService;

    /**
    @PostMapping
    public ResponseEntity<ResponseEarningDTO> create(@RequestBody RequestEarningDTO dto) {
        return new ResponseEntity<>(earningService.createEarning(dto), HttpStatus.CREATED);
    }
     **/

    /**
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ResponseEarningDTO> confirm(@PathVariable Long id,
                                                      @RequestParam boolean received) {
        return ResponseEntity.ok(earningService.confirmEarning(id, received));
    }**/

    /**
    @GetMapping("/{id}")
    public ResponseEntity<ResponseEarningDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(earningService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ResponseEarningDTO>> getAll() {
        return ResponseEntity.ok(earningService.getAll());
    }

    /**
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(earningService.getByProject(projectId));
    }
    **/
}
