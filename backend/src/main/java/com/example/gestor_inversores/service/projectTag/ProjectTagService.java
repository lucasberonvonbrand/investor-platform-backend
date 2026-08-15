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
        if (tag == null || tag.trim().isEmpty()) {
            tag = "OTROS";
        }
        String cleanTag = tag.trim().toUpperCase();
        return projectTagRepository.findByName(cleanTag)
                .orElseGet(() -> projectTagRepository.findByName("OTROS")
                .orElseGet(() -> projectTagRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ProjectTagException("La etiqueta no existe"))));
    }
}
