package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.Earning;
import com.example.gestor_inversores.model.enums.EarningStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IEarningRepository extends JpaRepository<Earning, Long> {

    List<Earning> findByProject_IdProject(Long projectId);

    List<Earning> findByConfirmedBy_Id(Long investorId);

    List<Earning> findByGeneratedBy_Id(Long studentId);

    List<Earning> findByStatus(EarningStatus status);

    List<Earning> findByContract_CreatedByInvestor_Id(Long investorId);

    List<Earning> findByContract_CreatedByInvestor_IdAndStatus(Long investorId, EarningStatus status);

    List<Earning> findByContract_IdContract(Long contractId);
}
