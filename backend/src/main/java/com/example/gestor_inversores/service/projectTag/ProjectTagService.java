package com.example.gestor_inversores.service.projectTag;

import com.example.gestor_inversores.exception.ProjectTagException;
import com.example.gestor_inversores.model.ProjectTag;
import com.example.gestor_inversores.repository.IProjectTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectTagService implements IProjectTagService {

    private final IProjectTagRepository projectTagRepository;

    @Override
    public ProjectTag getTagByName(String tag) {

        return projectTagRepository.findByName(tag.toUpperCase())
                .orElseThrow(() -> new ProjectTagException("La etiqueta no existe"));
    }
}
