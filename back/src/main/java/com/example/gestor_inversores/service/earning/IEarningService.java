package com.example.gestor_inversores.service.earning;

import com.example.gestor_inversores.dto.ResponseEarningDTO;

import java.util.List;

public interface IEarningService {

    // 💡 NUEVOS MÉTODOS: Acciones específicas y seguras para el inversor
    ResponseEarningDTO confirmReceipt(Long earningId, Long investorId);
    ResponseEarningDTO markAsNotReceived(Long earningId, Long investorId);

    // Consultas
    List<ResponseEarningDTO> getByProject(Long projectId);
    List<ResponseEarningDTO> getByInvestor(Long investorId);
    List<ResponseEarningDTO> getByStudent(Long studentId);
    List<ResponseEarningDTO> getAll();
}
