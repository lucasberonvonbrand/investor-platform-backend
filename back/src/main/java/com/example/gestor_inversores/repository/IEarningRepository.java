package com.example.gestor_inversores.repository;

import com.example.gestor_inversores.model.Earning;
import com.example.gestor_inversores.model.enums.EarningStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IEarningRepository extends JpaRepository<Earning, Long> {

    List<Earning> findByStatus(EarningStatus status);

    List<Earning> findByContract_IdContract(Long contractId);
}
