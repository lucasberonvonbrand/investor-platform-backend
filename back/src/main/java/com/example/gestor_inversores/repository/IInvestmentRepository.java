package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.Investment;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.enums.InvestmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface IInvestmentRepository extends JpaRepository<Investment, Long> {

    Optional<Investment> findByIdInvestmentAndDeletedFalse(Long id);

    List<Investment> findByDeletedFalse();

    List<Investment> findByDeletedFalseAndStatusIn(List<InvestmentStatus> statuses);

    List<Investment> findByProject_IdProjectAndDeletedFalseAndStatusIn(Long projectId, List<InvestmentStatus> statuses);

    List<Investment> findByProject_IdProject(Long projectId);

    /**
     * Busca todas las inversiones activas (no eliminadas) generadas por un inversor específico.
     */
    List<Investment> findByGeneratedBy_IdAndDeletedFalse(Long investorId);

    /**
     * Busca todas las inversiones activas (no eliminadas) generadas por un inversor específico
     * Y que además coincidan con un estado de inversión particular.
     */
    List<Investment> findByGeneratedBy_IdAndDeletedFalseAndStatus(Long investorId, InvestmentStatus status);


    @Query("SELECT DISTINCT i.project FROM Investment i WHERE i.generatedBy.idUser = :investorId AND i.deleted = false")
    Optional<Set<Project>> findDistinctProjectsByInvestorId(@Param("investorId") Long investorId);
}
