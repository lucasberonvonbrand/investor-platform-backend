package com.example.gestor_inversores.service.role;

import com.example.gestor_inversores.exception.RoleAlreadyExistsException;
import com.example.gestor_inversores.exception.RoleNotFoundException;
import com.example.gestor_inversores.model.Permission;
import com.example.gestor_inversores.model.Role;
import com.example.gestor_inversores.repository.IRoleRepository;
import com.example.gestor_inversores.service.permission.IPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class RoleService implements IRoleService {

    @Autowired
    private IRoleRepository roleRepository;

    @Autowired
    private IPermissionService permissionService;

    @Override
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    public Optional<Role> findById(Long id) {
        return Optional.ofNullable(roleRepository.findById(id).orElseThrow(() -> new RoleNotFoundException("No se encontró el rol con el id: " + id)));
    }

    @Override
    public Optional<Role> findByRole(String role) { // <-- AÑADIDO
        return roleRepository.findByRole(role);
    }

    @Override
    public Role save(Role role) {
        roleRepository.findByRole(role.getRole()).ifPresent(r -> {
            throw new RoleAlreadyExistsException("Ya existe un rol con el nombre: " + role.getRole());
        });

        Set<Permission> permissionList = new HashSet<>();
        for (Permission per : role.getPermissionsList()) {
            permissionService.findById(per.getId()).ifPresent(permissionList::add);
        }
        role.setPermissionsList(permissionList);
        return roleRepository.save(role);
    }

    @Override
    public Role update(Role roleUpdate) {
        Role role = roleRepository.findById(roleUpdate.getId())
                .orElseThrow(() -> new RoleNotFoundException("No se encontró el rol con el id: " + roleUpdate.getId() + " para actualizar"));

        if (roleUpdate.getRole() != null) {
            role.setRole(roleUpdate.getRole());
        }

        if (roleUpdate.getPermissionsList() != null) {
            Set<Permission> updatedPermissions = new HashSet<>(role.getPermissionsList());
            for (Permission per : roleUpdate.getPermissionsList()) {
                permissionService.findById(per.getId()).ifPresent(p -> {
                    if (updatedPermissions.contains(p)) {
                        updatedPermissions.remove(p);
                    } else {
                        updatedPermissions.add(p);
                    }
                });
            }
            role.setPermissionsList(updatedPermissions);
        }

        return roleRepository.save(role);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RoleNotFoundException("No se encontró el rol con el id: " + id + " para eliminar"));
        role.getPermissionsList().clear();
        roleRepository.delete(role);
    }
}
