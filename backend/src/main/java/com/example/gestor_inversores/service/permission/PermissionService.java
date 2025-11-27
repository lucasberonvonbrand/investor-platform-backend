package com.example.gestor_inversores.service.permission;

import com.example.gestor_inversores.exception.PermissionAlreadyExistsException;
import com.example.gestor_inversores.exception.PermissionNotFoundException;
import com.example.gestor_inversores.model.Permission;
import com.example.gestor_inversores.repository.IPermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PermissionService implements IPermissionService {

    @Autowired
    private IPermissionRepository permissionRepository;

    @Override
    public List<Permission> findAll() {
        return permissionRepository.findAll();
    }

    @Override
    public Optional<Permission> findById(Long id) {
        return Optional.ofNullable(permissionRepository.findById(id).orElseThrow(() -> new PermissionNotFoundException("No se encontró el permiso con el id: " + id)));
    }

    @Override
    public Permission save(Permission permission) {
        permissionRepository.findByPermissionName(permission.getPermissionName()).ifPresent(p -> {
            throw new PermissionAlreadyExistsException("Ya existe un permiso con el nombre: " + permission.getPermissionName());
        });
        return permissionRepository.save(permission);
    }

    @Override
    public void deleteById(Long id) {
        if (!permissionRepository.existsById(id)) {
            throw new PermissionNotFoundException("No se encontró el permiso con el id: " + id + " para eliminar");
        }
        permissionRepository.deleteById(id);
    }

    @Override
    public Permission update(Permission permission) {
        if (!permissionRepository.existsById(permission.getId())) {
            throw new PermissionNotFoundException("No se encontró el permiso con el id: " + permission.getId() + " para actualizar");
        }
        return permissionRepository.save(permission);
    }
}
